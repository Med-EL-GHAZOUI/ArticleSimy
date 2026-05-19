package com.formation.articlesimy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleRequest {

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    private String description;

    @Positive(message = "Le prix doit être positif")
    private double prix;

    private LocalDate dateExpiration;

    @NotNull
    private int quantiteStock;

    private List<String> imageUrls;

    private String category;
}