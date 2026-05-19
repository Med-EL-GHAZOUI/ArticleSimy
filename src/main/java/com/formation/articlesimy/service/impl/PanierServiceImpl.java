package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.entity.*;
import com.formation.articlesimy.entity.enums.NotificationType;
import com.formation.articlesimy.entity.enums.OrderStatus;
import com.formation.articlesimy.repository.*;
import com.formation.articlesimy.service.NotificationService;
import com.formation.articlesimy.service.PanierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;

@Service
@Transactional
public class PanierServiceImpl implements PanierService {

    private final PanierRepository panierRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommandeRepository commandeRepository;
    private final LignePanierRepository lignePanierRepository;
    private final NotificationService notificationService;
    private final OrderStatusHistoryRepository statusHistoryRepository;

    public PanierServiceImpl(PanierRepository panierRepository,
                             ArticleRepository articleRepository,
                             UserRepository userRepository,
                             CommandeRepository commandeRepository,
                             LignePanierRepository lignePanierRepository,
                             NotificationService notificationService,
                             OrderStatusHistoryRepository statusHistoryRepository) {
        this.panierRepository = panierRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.commandeRepository = commandeRepository;
        this.lignePanierRepository = lignePanierRepository;
        this.notificationService = notificationService;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Override
    public Panier getOrCreatePanier(Long userId) {
        return panierRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
            Panier panier = new Panier();
            panier.setUser(user);
            panier.setLignes(new ArrayList<>());
            panier.setLastActivity(LocalDateTime.now());
            return panierRepository.save(panier);
        });
    }

    @Override
    public Panier addArticle(Long userId, Long articleId, int quantite) {
        Panier panier = getOrCreatePanier(userId);
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article introuvable"));

        if (article.getQuantiteStock() < quantite) {
            throw new RuntimeException("Stock insuffisant. Disponible: " + article.getQuantiteStock());
        }

        // Check if article already in cart
        LignePanier existingLine = panier.getLignes().stream()
                .filter(l -> l.getArticle().getId().equals(articleId))
                .findFirst()
                .orElse(null);

        if (existingLine != null) {
            existingLine.setQuantite(existingLine.getQuantite() + quantite);
        } else {
            LignePanier ligne = new LignePanier();
            ligne.setPanier(panier);
            ligne.setArticle(article);
            ligne.setQuantite(quantite);
            panier.getLignes().add(ligne);
        }

        panier.setLastActivity(LocalDateTime.now());
        return panierRepository.save(panier);
    }

    @Override
    public Panier updateQuantite(Long userId, Long ligneId, int quantite) {
        Panier panier = getOrCreatePanier(userId);

        LignePanier ligne = panier.getLignes().stream()
                .filter(l -> l.getId().equals(ligneId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ligne de panier introuvable"));

        if (quantite <= 0) {
            panier.getLignes().remove(ligne);
        } else {
            if (ligne.getArticle().getQuantiteStock() < quantite) {
                throw new RuntimeException("Stock insuffisant");
            }
            ligne.setQuantite(quantite);
        }

        panier.setLastActivity(LocalDateTime.now());
        return panierRepository.save(panier);
    }

    @Override
    public Panier removeArticle(Long userId, Long ligneId) {
        Panier panier = getOrCreatePanier(userId);
        panier.getLignes().removeIf(l -> l.getId().equals(ligneId));
        panier.setLastActivity(LocalDateTime.now());
        return panierRepository.save(panier);
    }

    @Override
    public void clearPanier(Long userId) {
        Panier panier = getOrCreatePanier(userId);
        panier.getLignes().clear();
        panier.setLastActivity(LocalDateTime.now());
        panierRepository.save(panier);
    }

    @Override
    public void checkout(Long userId) {
        Panier panier = getOrCreatePanier(userId);

        if (panier.getLignes().isEmpty()) {
            throw new RuntimeException("Panier vide, impossible de passer commande");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Generate invoice number
        long count = commandeRepository.count() + 1;
        String invoiceNumber = String.format("ORD-%d-%04d", Year.now().getValue(), count);

        // Create order
        Commande commande = new Commande();
        commande.setUser(user);
        commande.setDateCommande(LocalDateTime.now());
        commande.setStatut(OrderStatus.CREATED);
        commande.setInvoiceNumber(invoiceNumber);
        commande.setLignes(new ArrayList<>());
        commande.setStatusHistory(new ArrayList<>());

        double total = 0;

        for (LignePanier lp : panier.getLignes()) {
            Article article = lp.getArticle();

            // Validate stock
            if (article.getQuantiteStock() < lp.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour: " + article.getNom());
            }

            // Decrease stock
            article.setQuantiteStock(article.getQuantiteStock() - lp.getQuantite());
            articleRepository.save(article);

            // Create order line
            LigneCommande lc = new LigneCommande();
            lc.setCommande(commande);
            lc.setArticle(article);
            lc.setQuantite(lp.getQuantite());
            lc.setPrixUnitaire(article.getPrix());
            commande.getLignes().add(lc);

            total += article.getPrix() * lp.getQuantite();
        }

        commande.setTotalAmount(total);

        // Create initial status history
        OrderStatusHistory initialStatus = OrderStatusHistory.builder()
                .commande(commande)
                .status(OrderStatus.CREATED)
                .timestamp(LocalDateTime.now())
                .changedBy("SYSTEM")
                .build();
        commande.getStatusHistory().add(initialStatus);

        commandeRepository.save(commande);

        // Clear cart
        panier.getLignes().clear();
        panier.setLastActivity(LocalDateTime.now());
        panierRepository.save(panier);

        // Send notification
        notificationService.createNotification(
                userId,
                "Commande créée — " + invoiceNumber,
                "Votre commande de " + String.format("%.2f", total) + " DH a été créée avec succès!",
                NotificationType.ORDER_CREATED
        );
    }
}