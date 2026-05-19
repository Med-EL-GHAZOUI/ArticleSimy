package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.ProductView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    @Query("SELECT pv.article.id FROM ProductView pv WHERE pv.user.id = :userId GROUP BY pv.article.id ORDER BY COUNT(pv) DESC")
    List<Long> findMostViewedArticleIdsByUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT pv.article.id FROM ProductView pv GROUP BY pv.article.id ORDER BY COUNT(pv) DESC")
    List<Long> findMostViewedArticleIds(Pageable pageable);

    @Query("SELECT DISTINCT pv2.article.id FROM ProductView pv1 " +
           "JOIN ProductView pv2 ON pv1.user.id = pv2.user.id " +
           "WHERE pv1.article.id IN :articleIds AND pv2.article.id NOT IN :articleIds " +
           "GROUP BY pv2.article.id ORDER BY COUNT(pv2) DESC")
    List<Long> findRecommendedArticleIds(@Param("articleIds") List<Long> articleIds, Pageable pageable);

    long countByArticleId(Long articleId);
}
