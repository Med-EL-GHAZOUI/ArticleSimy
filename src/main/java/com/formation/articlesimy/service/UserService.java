package com.formation.articlesimy.service;

import com.formation.articlesimy.dto.*;
import com.formation.articlesimy.entity.RefreshToken;
import com.formation.articlesimy.entity.User;

import java.util.List;

public interface UserService {

    User registerUser(RegisterRequest request);

    RefreshToken createRefreshToken(User user);

    TokenRefreshResponse refreshAccessToken(TokenRefreshRequest request);

    void deleteRefreshTokenByUserId(Long userId);

    User getUserById(Long id);

    User updateUserProfileImage(Long id, String imageUrl);

    User updateUser(Long id, UserUpdateRequest request);

    List<User> getAllUsers();

    void deleteUser(Long id);

    // 2FA
    void sendTwoFactorCode(User user);

    boolean verifyTwoFactorCode(String email, String code);

    // Role management
    User changeUserRole(Long id, String role);
}
