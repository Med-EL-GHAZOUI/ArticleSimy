package com.formation.articlesimy.controller;

import com.formation.articlesimy.dto.*;
import com.formation.articlesimy.entity.RefreshToken;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.security.JwtService;
import com.formation.articlesimy.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login, Register, 2FA, Token Management")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserService userService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User savedUser = userService.registerUser(request);
        String accessToken = jwtService.generateToken(savedUser);
        RefreshToken refreshToken = userService.createRefreshToken(savedUser);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .nom(savedUser.getNom())
                .build());
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Compte désactivé");
        }
        if (user.isAccountLocked()) {
            throw new RuntimeException("Compte verrouillé");
        }

        boolean passwordValid = passwordEncoder.matches(password, user.getPassword());
        if (!passwordValid) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled()) {
            userService.sendTwoFactorCode(user);
            return ResponseEntity.ok(AuthResponse.builder()
                    .twoFactorRequired(true)
                    .email(user.getEmail())
                    .build());
        }

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = userService.createRefreshToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .nom(user.getNom())
                .build());
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Verify 2FA code and complete login")
    public ResponseEntity<AuthResponse> verify2FA(@RequestBody TwoFactorRequest request) {
        boolean valid = userService.verifyTwoFactorCode(request.getEmail(), request.getCode());
        if (!valid) {
            throw new RuntimeException("Code 2FA invalide ou expiré");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = userService.createRefreshToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .nom(user.getNom())
                .build());
    }

    @PostMapping("/2fa/send")
    @Operation(summary = "Send 2FA code to user email")
    public ResponseEntity<Map<String, String>> send2FACode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        userService.sendTwoFactorCode(user);
        return ResponseEntity.ok(Map.of("message", "Code 2FA envoyé à " + email));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<TokenRefreshResponse> refresh(@RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(userService.refreshAccessToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate tokens")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam Long userId
    ) {
        // Blacklist current access token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtService.blacklistToken(token);
        }

        // Delete refresh token
        userService.deleteRefreshTokenByUserId(userId);

        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
}