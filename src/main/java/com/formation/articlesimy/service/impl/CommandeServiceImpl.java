package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.dto.OrderTimelineDTO;
import com.formation.articlesimy.entity.Commande;
import com.formation.articlesimy.entity.OrderStatusHistory;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.enums.NotificationType;
import com.formation.articlesimy.entity.enums.OrderStatus;
import com.formation.articlesimy.repository.CommandeRepository;
import com.formation.articlesimy.repository.OrderStatusHistoryRepository;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.service.CommandeService;
import com.formation.articlesimy.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommandeServiceImpl implements CommandeService {

    private final CommandeRepository commandeRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;

    // Valid status transitions
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.CREATED, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, Set.of(OrderStatus.PACKED, OrderStatus.CANCELLED),
            OrderStatus.PACKED, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(),
            OrderStatus.CANCELLED, Set.of()
    );

    public CommandeServiceImpl(
            CommandeRepository commandeRepository,
            UserRepository userRepository,
            OrderStatusHistoryRepository statusHistoryRepository,
            NotificationService notificationService
    ) {
        this.commandeRepository = commandeRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<Commande> getAllCommandes() {
        return commandeRepository.findAll();
    }

    @Override
    public Commande getCommandeById(Long id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));
    }

    @Override
    public List<Commande> getCommandesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return commandeRepository.findByUser(user);
    }

    @Override
    public Commande modifierStatut(Long id, OrderStatus newStatus, String changedBy) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        OrderStatus currentStatus = commande.getStatut();

        // Validate transition
        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException(
                    "Transition invalide: " + currentStatus + " → " + newStatus +
                    ". Transitions autorisées: " + allowed);
        }

        commande.setStatut(newStatus);

        // Record status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .commande(commande)
                .status(newStatus)
                .timestamp(LocalDateTime.now())
                .changedBy(changedBy)
                .build();
        statusHistoryRepository.save(history);

        Commande saved = commandeRepository.save(commande);

        // Send notification to customer
        if (commande.getUser() != null) {
            NotificationType notifType = switch (newStatus) {
                case CONFIRMED -> NotificationType.ORDER_CONFIRMED;
                case SHIPPED -> NotificationType.ORDER_SHIPPED;
                case DELIVERED -> NotificationType.ORDER_DELIVERED;
                case CANCELLED -> NotificationType.ORDER_CANCELLED;
                default -> NotificationType.SYSTEM;
            };

            String title = "Commande " + commande.getInvoiceNumber() + " — " + newStatus.name();
            String message = "Votre commande " + commande.getInvoiceNumber() + " est maintenant: " + newStatus.name();

            notificationService.createNotification(
                    commande.getUser().getId(),
                    title,
                    message,
                    notifType
            );
        }

        return saved;
    }

    @Override
    public void supprimerCommande(Long id) {
        if (!commandeRepository.existsById(id)) {
            throw new RuntimeException("Commande introuvable");
        }
        commandeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderTimelineDTO getOrderTimeline(Long id) {
        Commande commande = getCommandeById(id);
        List<OrderStatusHistory> history = statusHistoryRepository.findByCommandeIdOrderByTimestampAsc(id);

        // Build timeline with all possible statuses
        OrderStatus currentStatus = commande.getStatut();
        List<OrderStatus> allStatuses = List.of(
                OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.PACKED,
                OrderStatus.SHIPPED, OrderStatus.DELIVERED
        );

        // Map history entries by status
        Map<OrderStatus, OrderStatusHistory> historyMap = history.stream()
                .collect(Collectors.toMap(
                        OrderStatusHistory::getStatus,
                        h -> h,
                        (h1, h2) -> h2 // keep latest
                ));

        List<OrderTimelineDTO.StatusStep> timeline = new ArrayList<>();

        for (OrderStatus status : allStatuses) {
            OrderStatusHistory entry = historyMap.get(status);
            boolean completed = false;
            boolean isCurrent = status == currentStatus;

            if (status == OrderStatus.CREATED) {
                completed = true; // Always completed
            } else if (entry != null) {
                completed = true;
            } else {
                // Check if this status was passed (i.e., current status ordinal > this status ordinal)
                completed = currentStatus.ordinal() > status.ordinal();
            }

            timeline.add(OrderTimelineDTO.StatusStep.builder()
                    .status(status)
                    .timestamp(entry != null ? entry.getTimestamp() : (status == OrderStatus.CREATED ? commande.getDateCommande() : null))
                    .changedBy(entry != null ? entry.getChangedBy() : null)
                    .completed(completed)
                    .current(isCurrent)
                    .build());
        }

        // Handle CANCELLED
        if (currentStatus == OrderStatus.CANCELLED) {
            OrderStatusHistory cancelEntry = historyMap.get(OrderStatus.CANCELLED);
            timeline.add(OrderTimelineDTO.StatusStep.builder()
                    .status(OrderStatus.CANCELLED)
                    .timestamp(cancelEntry != null ? cancelEntry.getTimestamp() : null)
                    .changedBy(cancelEntry != null ? cancelEntry.getChangedBy() : null)
                    .completed(true)
                    .current(true)
                    .build());
        }

        return OrderTimelineDTO.builder()
                .orderId(commande.getId())
                .invoiceNumber(commande.getInvoiceNumber())
                .currentStatus(currentStatus)
                .timeline(timeline)
                .build();
    }
}