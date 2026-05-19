package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.entity.Article;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.Wishlist;
import com.formation.articlesimy.repository.ArticleRepository;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.repository.WishlistRepository;
import com.formation.articlesimy.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    public WishlistServiceImpl(WishlistRepository wishlistRepository,
                               UserRepository userRepository,
                               ArticleRepository articleRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
    }

    @Override
    public Wishlist addToWishlist(Long userId, Long articleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article introuvable"));

        Optional<Wishlist> existing = wishlistRepository.findByUserAndArticle(user, article);
        if (existing.isPresent()) {
            return existing.get();
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .article(article)
                .build();

        return wishlistRepository.save(wishlist);
    }

    @Override
    public void removeFromWishlist(Long userId, Long articleId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndArticleId(userId, articleId);
        existing.ifPresent(wishlistRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Wishlist> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long articleId) {
        return wishlistRepository.existsByUserIdAndArticleId(userId, articleId);
    }
}
