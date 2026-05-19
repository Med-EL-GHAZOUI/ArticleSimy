package com.formation.articlesimy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Commande commande;

    @ManyToOne
    private Article article;

    private int quantite;

    private double prixUnitaire;
}