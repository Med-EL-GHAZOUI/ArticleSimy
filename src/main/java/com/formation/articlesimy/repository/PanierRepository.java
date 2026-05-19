package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PanierRepository extends JpaRepository<Panier, Long> {

    Optional<Panier> findByUserId(Long userId);

    @Query("SELECT p FROM Panier p JOIN p.lignes l WHERE p.lastActivity < :cutoff GROUP BY p HAVING COUNT(l) > 0")
    List<Panier> findAbandonedCarts(@Param("cutoff") LocalDateTime cutoff);
}