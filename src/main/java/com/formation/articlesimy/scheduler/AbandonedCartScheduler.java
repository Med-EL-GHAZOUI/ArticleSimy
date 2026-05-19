package com.formation.articlesimy.scheduler;

import com.formation.articlesimy.entity.Panier;
import com.formation.articlesimy.entity.enums.NotificationType;
import com.formation.articlesimy.repository.PanierRepository;
import com.formation.articlesimy.service.EmailService;
import com.formation.articlesimy.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AbandonedCartScheduler {

    private final PanierRepository panierRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AbandonedCartScheduler(PanierRepository panierRepository,
                                  NotificationService notificationService,
                                  EmailService emailService) {
        this.panierRepository = panierRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // Run every 6 hours
    @Scheduled(fixedRate = 21600000)
    public void detectAbandonedCarts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Panier> abandonedCarts = panierRepository.findAbandonedCarts(cutoff);

        for (Panier panier : abandonedCarts) {
            if (panier.getUser() != null && !panier.getLignes().isEmpty()) {
                int itemCount = panier.getLignes().size();

                // Send notification
                notificationService.createNotification(
                        panier.getUser().getId(),
                        "🛒 Panier en attente!",
                        "Vous avez " + itemCount + " article(s) dans votre panier. N'oubliez pas de finaliser votre commande!",
                        NotificationType.ABANDONED_CART
                );

                // Send email
                try {
                    emailService.sendAbandonedCartReminder(
                            panier.getUser().getEmail(),
                            panier.getUser().getNom(),
                            itemCount
                    );
                } catch (Exception e) {
                    // Don't fail on email error
                }
            }
        }
    }
}
