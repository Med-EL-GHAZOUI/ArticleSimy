package com.formation.articlesimy.controller;

import com.formation.articlesimy.entity.Panier;
import com.formation.articlesimy.service.PanierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/panier")
@Tag(name = "Cart", description = "Shopping cart management")
public class PanierController {

    private final PanierService panierService;

    public PanierController(PanierService panierService) {
        this.panierService = panierService;
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user cart")
    public ResponseEntity<Panier> getPanier(@PathVariable Long userId) {
        return ResponseEntity.ok(panierService.getOrCreatePanier(userId));
    }

    @PostMapping("/add")
    @Operation(summary = "Add product to cart")
    public ResponseEntity<Panier> addToCart(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long articleId = Long.valueOf(body.get("articleId").toString());
        int quantite = body.get("quantite") != null ? Integer.parseInt(body.get("quantite").toString()) : 1;
        return ResponseEntity.ok(panierService.addArticle(userId, articleId, quantite));
    }

    @PutMapping("/update")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<Panier> updateQuantity(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long ligneId = Long.valueOf(body.get("ligneId").toString());
        int quantite = Integer.parseInt(body.get("quantite").toString());
        return ResponseEntity.ok(panierService.updateQuantite(userId, ligneId, quantite));
    }

    @DeleteMapping("/remove/{userId}/{ligneId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<Panier> removeFromCart(@PathVariable Long userId, @PathVariable Long ligneId) {
        return ResponseEntity.ok(panierService.removeArticle(userId, ligneId));
    }

    @DeleteMapping("/clear/{userId}")
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        panierService.clearPanier(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkout/{userId}")
    @Operation(summary = "Checkout — create order from cart")
    public ResponseEntity<Map<String, String>> checkout(@PathVariable Long userId) {
        panierService.checkout(userId);
        return ResponseEntity.ok(Map.of("message", "Commande créée avec succès!"));
    }
}