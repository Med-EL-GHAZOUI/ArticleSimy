package com.formation.articlesimy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String nom;
    private String email;
    private String password;
    private String phone;
    private String profileImage;
    private String role;
    private Boolean twoFactorEnabled;
}
