package com.formation.articlesimy.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PanierRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long articleId;

    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;
}