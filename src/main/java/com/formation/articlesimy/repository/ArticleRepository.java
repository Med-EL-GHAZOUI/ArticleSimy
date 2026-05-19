package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long>,
        JpaSpecificationExecutor<Article> {

    List<Article> findByDescriptionContainingIgnoreCase(String keyword);

    List<Article> findByNomContainingIgnoreCase(String keyword);

    @Query("""
            SELECT a FROM Article a
            WHERE LOWER(a.nom) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    Page<Article> fullTextSearch(
            @Param("query") String query,
            Pageable pageable
    );

    List<Article> findByQuantiteStockLessThan(int threshold);

    List<Article> findByQuantiteStock(int stock);

    @Query("""
            SELECT a FROM Article a
            ORDER BY a.viewCount DESC
            """)
    List<Article> findTrending(Pageable pageable);

    @Query("""
            SELECT a FROM Article a
            WHERE a.prix < :maxPrice
            ORDER BY a.prix ASC
            """)
    List<Article> findCheap(
            @Param("maxPrice") double maxPrice,
            Pageable pageable
    );

    @Query("""
            SELECT a FROM Article a
            WHERE a.quantiteStock > 10
              AND a.viewCount > 0
            ORDER BY (a.viewCount * 1.0 / a.prix) DESC
            """)
    List<Article> findBestQuality(Pageable pageable);

    Page<Article> findAll(Pageable pageable);

    long countByQuantiteStockLessThan(int threshold);
}