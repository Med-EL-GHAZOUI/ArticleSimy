package com.formation.articlesimy.controller;

import com.formation.articlesimy.entity.Wishlist;
import com.formation.articlesimy.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
@CrossOrigin("*")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping
    public ResponseEntity<Wishlist> addToWishlist(@RequestParam Long userId, @RequestParam Long articleId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(userId, articleId));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFromWishlist(@RequestParam Long userId, @RequestParam Long articleId) {
        wishlistService.removeFromWishlist(userId, articleId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Wishlist>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isInWishlist(@RequestParam Long userId, @RequestParam Long articleId) {
        return ResponseEntity.ok(wishlistService.isInWishlist(userId, articleId));
    }
}
