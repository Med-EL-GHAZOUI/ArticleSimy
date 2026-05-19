package com.formation.articlesimy.scheduler;

import com.formation.articlesimy.entity.Article;
import com.formation.articlesimy.entity.enums.NotificationType;
import com.formation.articlesimy.repository.ArticleRepository;
import com.formation.articlesimy.service.NotificationService;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@EnableScheduling
public class StockAlertScheduler {

    private final ArticleRepository articleRepository;
    private final NotificationService notificationService;

    public StockAlertScheduler(ArticleRepository articleRepository,
                               NotificationService notificationService) {
        this.articleRepository = articleRepository;
        this.notificationService = notificationService;
    }

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void checkStockAlerts() {
        // Low stock (<5)
        List<Article> lowStock = articleRepository.findByQuantiteStockLessThan(5);
        for (Article article : lowStock) {
            if (article.getQuantiteStock() > 0) {
                notificationService.notifyAdmins(
                        "⚠️ Stock faible — " + article.getNom(),
                        "Le produit \"" + article.getNom() + "\" n'a plus que " + article.getQuantiteStock() + " unités en stock.",
                        NotificationType.LOW_STOCK
                );
            }
        }

        // Out of stock
        List<Article> outOfStock = articleRepository.findByQuantiteStock(0);
        for (Article article : outOfStock) {
            notificationService.notifyAdmins(
                    "🚨 Rupture de stock — " + article.getNom(),
                    "Le produit \"" + article.getNom() + "\" est en rupture de stock!",
                    NotificationType.OUT_OF_STOCK
            );
        }

        // Near expiry (<30 days)
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        List<Article> allArticles = articleRepository.findAll();
        for (Article article : allArticles) {
            if (article.getDateExpiration() != null &&
                article.getDateExpiration().isBefore(thirtyDaysFromNow) &&
                article.getDateExpiration().isAfter(LocalDate.now())) {
                notificationService.notifyAdmins(
                        "⏰ Expiration proche — " + article.getNom(),
                        "Le produit \"" + article.getNom() + "\" expire le " + article.getDateExpiration() + ".",
                        NotificationType.NEAR_EXPIRY
                );
            }
        }
    }
}
