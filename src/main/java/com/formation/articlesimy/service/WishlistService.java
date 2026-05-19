package com.formation.articlesimy.service;

import com.formation.articlesimy.entity.Wishlist;

import java.util.List;

public interface WishlistService {
    Wishlist addToWishlist(Long userId, Long articleId);
    void removeFromWishlist(Long userId, Long articleId);
    List<Wishlist> getUserWishlist(Long userId);
    boolean isInWishlist(Long userId, Long articleId);
}
