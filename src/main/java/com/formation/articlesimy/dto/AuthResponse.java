package com.formation.articlesimy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String role;
    private String nom;
    private boolean twoFactorRequired;
    private String twoFactorToken; // Temporary token for 2FA flow
}