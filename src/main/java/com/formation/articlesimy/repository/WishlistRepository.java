package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.Article;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUser(User user);
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserAndArticle(User user, Article article);
    Optional<Wishlist> findByUserIdAndArticleId(Long userId, Long articleId);
    boolean existsByUserIdAndArticleId(Long userId, Long articleId);
}
