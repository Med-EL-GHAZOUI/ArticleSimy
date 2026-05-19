package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.dto.ArticleRequest;
import com.formation.articlesimy.entity.Article;
import com.formation.articlesimy.entity.ProductView;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.repository.ArticleRepository;
import com.formation.articlesimy.repository.ProductViewRepository;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.service.ArticleService;
import com.formation.articlesimy.service.AuditLogService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static com.formation.articlesimy.specification.ArticleSpecification.*;

@Service
@Transactional
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final AuditLogService auditLogService;
    private final ProductViewRepository productViewRepository;
    private final UserRepository userRepository;

    public ArticleServiceImpl(ArticleRepository articleRepository,
                              AuditLogService auditLogService,
                              ProductViewRepository productViewRepository,
                              UserRepository userRepository) {
        this.articleRepository = articleRepository;
        this.auditLogService = auditLogService;
        this.productViewRepository = productViewRepository;
        this.userRepository = userRepository;
    }

    private void logAdminAction(String action, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = "SYSTEM";
        String role = "SYSTEM";
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            email = auth.getName();
            role = auth.getAuthorities().stream()
                    .map(r -> r.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("CLIENT");
        }
        auditLogService.logAction(action, details, email, role);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Article createArticle(ArticleRequest request) {
        Article article = new Article();
        article.setNom(request.getNom());
        article.setDescription(request.getDescription());
        article.setPrix(request.getPrix());
        article.setDateExpiration(request.getDateExpiration());
        article.setQuantiteStock(request.getQuantiteStock());
        article.setImageUrls(request.getImageUrls());
        article.setCategory(request.getCategory());

        Article saved = articleRepository.save(article);
        logAdminAction(
                "AJOUT_ARTICLE",
                "Création de l'article #" + saved.getId() + " - " + saved.getNom() + " (Prix: " + saved.getPrix() + " DH, Stock: " + saved.getQuantiteStock() + ")"
        );
        return saved;
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Article updateArticle(Long id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article introuvable"));

        String oldNom = article.getNom();
        double oldPrix = article.getPrix();
        int oldStock = article.getQuantiteStock();

        article.setNom(request.getNom());
        article.setDescription(request.getDescription());
        article.setPrix(request.getPrix());
        article.setDateExpiration(request.getDateExpiration());
        article.setQuantiteStock(request.getQuantiteStock());
        if (request.getImageUrls() != null) {
            article.setImageUrls(request.getImageUrls());
        }
        if (request.getCategory() != null) {
            article.setCategory(request.getCategory());
        }

        Article updated = articleRepository.save(article);
        logAdminAction(
                "MODIF_ARTICLE",
                "Modification de l'article #" + id + " - Modifs: Nom [" + oldNom + " -> " + updated.getNom() + "], Prix [" + oldPrix + " -> " + updated.getPrix() + " DH], Stock [" + oldStock + " -> " + updated.getQuantiteStock() + "]"
        );
        return updated;
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void deleteArticle(Long id) {
        Article article = getArticleById(id);
        articleRepository.deleteById(id);
        logAdminAction(
                "SUPPR_ARTICLE",
                "Suppression logique de l'article #" + id + " - " + article.getNom()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article introuvable"));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'all'")
    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Article> getAllArticlesPaginated(Pageable pageable) {
        return articleRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Article> searchArticles(String keyword) {
        return articleRepository.findByDescriptionContainingIgnoreCase(keyword);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Article> fullTextSearch(String query, Pageable pageable) {
        return articleRepository.fullTextSearch(query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Article> rechercheMulticritere(
            String description,
            Double prixMin,
            Double prixMax,
            Integer stockMin
    ) {
        Specification<Article> spec = Specification
                .where(hasDescription(description))
                .and(prixMin(prixMin))
                .and(prixMax(prixMax))
                .and(stockMin(stockMin));

        return articleRepository.findAll(spec);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public Article updateProductImages(Long id, List<String> imageUrls) {
        Article article = getArticleById(id);
        article.setImageUrls(imageUrls);
        Article saved = articleRepository.save(article);
        logAdminAction(
                "IMAGE_ARTICLE",
                "Mise à jour des images pour l'article #" + id + " (" + article.getNom() + ") : " + imageUrls.size() + " images"
        );
        return saved;
    }

    // ─── Smart Filters ──────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<Article> findTrending(int limit) {
        return articleRepository.findTrending(PageRequest.of(0, limit));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Article> findCheap(double maxPrice, int limit) {
        return articleRepository.findCheap(maxPrice, PageRequest.of(0, limit));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Article> findBestQuality(int limit) {
        return articleRepository.findBestQuality(PageRequest.of(0, limit));
    }

    // ─── Product Views & Recommendations ────────────
    @Override
    public void recordView(Long articleId, Long userId) {
        Article article = getArticleById(articleId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        ProductView view = ProductView.builder()
                .article(article)
                .user(user)
                .build();
        productViewRepository.save(view);

        // Increment view count
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Article> getRecommendations(Long userId, int limit) {
        // Get articles viewed by this user
        List<Long> viewedIds = productViewRepository.findMostViewedArticleIdsByUser(userId, PageRequest.of(0, 10));

        if (viewedIds.isEmpty()) {
            // Fallback: trending products
            return findTrending(limit);
        }

        // Collaborative filtering: find articles viewed by users who viewed the same items
        List<Long> recommendedIds = productViewRepository.findRecommendedArticleIds(viewedIds, PageRequest.of(0, limit));

        if (recommendedIds.isEmpty()) {
            return findTrending(limit);
        }

        List<Article> recommendations = new ArrayList<>();
        for (Long id : recommendedIds) {
            articleRepository.findById(id).ifPresent(recommendations::add);
        }
        return recommendations;
    }
}