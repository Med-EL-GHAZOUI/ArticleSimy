package com.formation.articlesimy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TwoFactorRequest {
    private String email;
    private String code;
    private String tempToken;
}
