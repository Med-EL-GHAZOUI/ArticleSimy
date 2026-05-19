package com.formation.articlesimy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "article")
@SQLDelete(sql = "UPDATE article SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double prix;

    private LocalDate dateExpiration;

    @Column(nullable = false)
    private int quantiteStock;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "article_images",
            joinColumns = @JoinColumn(name = "article_id")
    )
    @Column(name = "image_url")
    private List<String> imageUrls;

    private String category;

    @Builder.Default
    @Column(nullable = false)
    private int viewCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean deleted = false;
}