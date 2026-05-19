package com.formation.articlesimy.service;

import com.formation.articlesimy.dto.ArticleRequest;
import com.formation.articlesimy.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArticleService {

    Article createArticle(ArticleRequest request);

    Article updateArticle(Long id, ArticleRequest request);

    void deleteArticle(Long id);

    Article getArticleById(Long id);

    List<Article> getAllArticles();

    Page<Article> getAllArticlesPaginated(Pageable pageable);

    List<Article> searchArticles(String keyword);

    Page<Article> fullTextSearch(String query, Pageable pageable);

    List<Article> rechercheMulticritere(String description, Double prixMin, Double prixMax, Integer stockMin);

    Article updateProductImages(Long id, List<String> imageUrls);

    // Smart filters
    List<Article> findTrending(int limit);

    List<Article> findCheap(double maxPrice, int limit);

    List<Article> findBestQuality(int limit);

    // Product views
    void recordView(Long articleId, Long userId);

    List<Article> getRecommendations(Long userId, int limit);
}