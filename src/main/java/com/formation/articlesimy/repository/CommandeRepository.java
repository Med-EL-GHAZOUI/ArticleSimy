package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.Commande;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {

    List<Commande> findByUser(User user);

    Page<Commande> findByUser(User user, Pageable pageable);

    List<Commande> findByStatut(OrderStatus status);

    long countByStatut(OrderStatus status);

    @Query("SELECT SUM(c.totalAmount) FROM Commande c WHERE c.statut != 'CANCELLED'")
    Double calculateTotalRevenue();

    @Query("SELECT SUM(c.totalAmount) FROM Commande c WHERE c.dateCommande >= :start AND c.dateCommande < :end AND c.statut != 'CANCELLED'")
    Double calculateRevenueForPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(c) FROM Commande c WHERE c.dateCommande >= :start AND c.dateCommande < :end")
    long countOrdersForPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT c FROM Commande c WHERE c.dateCommande >= :start ORDER BY c.dateCommande DESC")
    List<Commande> findRecentOrders(@Param("start") LocalDateTime start);

    @Query("SELECT c.statut, COUNT(c) FROM Commande c GROUP BY c.statut")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT c.user.id, c.user.nom, c.user.email, COUNT(c), SUM(c.totalAmount) " +
           "FROM Commande c WHERE c.statut != 'CANCELLED' AND c.user IS NOT NULL GROUP BY c.user.id, c.user.nom, c.user.email " +
           "ORDER BY SUM(c.totalAmount) DESC")
    List<Object[]> findTopClients(Pageable pageable);

    long countByDateCommandeAfter(LocalDateTime date);

    Page<Commande> findAll(Pageable pageable);

    Optional<Commande> findTopByOrderByDateCommandeDesc();
}
