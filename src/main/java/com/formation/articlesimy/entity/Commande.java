package com.formation.articlesimy.entity;

import com.formation.articlesimy.entity.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateCommande;

    @Column(unique = true)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus statut;

    private double totalAmount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LigneCommande> lignes = new ArrayList<>();

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.dateCommande == null) {
            this.dateCommande = LocalDateTime.now();
        }
        if (this.statut == null) {
            this.statut = OrderStatus.CREATED;
        }
    }
}
