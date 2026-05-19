package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.LigneCommande;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {

    @Query("SELECT l.article.id, l.article.nom, SUM(l.quantite), SUM(l.quantite * l.prixUnitaire) " +
           "FROM LigneCommande l WHERE l.article IS NOT NULL " +
           "GROUP BY l.article.id, l.article.nom " +
           "ORDER BY SUM(l.quantite * l.prixUnitaire) DESC")
    List<Object[]> findTopProducts(Pageable pageable);
}
