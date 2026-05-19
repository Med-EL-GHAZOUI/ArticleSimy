package com.formation.articlesimy.controller;

import com.formation.articlesimy.dto.UserUpdateRequest;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/profile-image")
    @Operation(summary = "Update profile image URL")
    public ResponseEntity<User> updateProfileImage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateUserProfileImage(id, body.get("imageUrl")));
    }
}
