package com.formation.articlesimy.service;

import com.formation.articlesimy.dto.OrderTimelineDTO;
import com.formation.articlesimy.entity.Commande;
import com.formation.articlesimy.entity.enums.OrderStatus;

import java.util.List;

public interface CommandeService {

    List<Commande> getAllCommandes();

    Commande getCommandeById(Long id);

    List<Commande> getCommandesByUser(Long userId);

    Commande modifierStatut(Long id, OrderStatus newStatus, String changedBy);

    void supprimerCommande(Long id);

    OrderTimelineDTO getOrderTimeline(Long id);
}