package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.dto.*;
import com.formation.articlesimy.entity.RefreshToken;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.enums.Role;
import com.formation.articlesimy.repository.RefreshTokenRepository;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.security.JwtService;
import com.formation.articlesimy.service.EmailService;
import com.formation.articlesimy.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Override
    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        // Parse role
        Role role = Role.CLIENT;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.CLIENT;
            }
        }
        user.setRole(role);

        User savedUser = userRepository.save(user);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getNom());
        } catch (Exception e) {
            // Don't fail registration if email fails
        }

        return savedUser;
    }

    @Override
    public RefreshToken createRefreshToken(User user) {
        // Fetch existing token or create a new one to avoid unique constraint violations
        RefreshToken refreshToken = refreshTokenRepository.findByUserId(user.getId())
                .orElse(new RefreshToken());

        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        // Set expiry date to 30 days from now
        refreshToken.setExpiryDate(Instant.now().plusMillis(30L * 24L * 60L * 60L * 1000L));

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public TokenRefreshResponse refreshAccessToken(TokenRefreshRequest request) {
        String requestToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestToken)
                .orElseThrow(() -> new RuntimeException("Refresh token introuvable"));

        // Verify Expiration
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token expiré. Veuillez vous reconnecter.");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Override
    public void deleteRefreshTokenByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    @Override
    public User updateUserProfileImage(Long id, String imageUrl) {
        User user = getUserById(id);
        user.setProfileImage(imageUrl);
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, UserUpdateRequest request) {
        User user = getUserById(id);

        if (request.getNom() != null) {
            user.setNom(request.getNom());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getTwoFactorEnabled() != null) {
            user.setTwoFactorEnabled(request.getTwoFactorEnabled());
        }

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    // ─── 2FA ────────────────────────────────────────
    @Override
    public void sendTwoFactorCode(User user) {
        String code = String.format("%06d", new Random().nextInt(999999));
        user.setTwoFactorCode(code);
        user.setTwoFactorCodeExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        try {
            emailService.sendTwoFactorCode(user.getEmail(), code);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi du code 2FA");
        }
    }

    @Override
    public boolean verifyTwoFactorCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.getTwoFactorCode() == null || user.getTwoFactorCodeExpiry() == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(user.getTwoFactorCodeExpiry())) {
            user.setTwoFactorCode(null);
            user.setTwoFactorCodeExpiry(null);
            userRepository.save(user);
            return false;
        }

        boolean valid = user.getTwoFactorCode().equals(code);
        if (valid) {
            user.setTwoFactorCode(null);
            user.setTwoFactorCodeExpiry(null);
            userRepository.save(user);
        }
        return valid;
    }

    @Override
    public User changeUserRole(Long id, String role) {
        User user = getUserById(id);
        try {
            user.setRole(Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide: " + role);
        }
        return userRepository.save(user);
    }
}
