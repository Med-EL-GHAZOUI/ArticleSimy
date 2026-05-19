package com.formation.articlesimy.service;

import com.formation.articlesimy.entity.Panier;

public interface PanierService {

    Panier getOrCreatePanier(Long userId);

    Panier addArticle(Long userId, Long articleId, int quantite);

    Panier updateQuantite(Long userId, Long ligneId, int quantite);

    Panier removeArticle(Long userId, Long ligneId);

    void clearPanier(Long userId);

    void checkout(Long userId);
}