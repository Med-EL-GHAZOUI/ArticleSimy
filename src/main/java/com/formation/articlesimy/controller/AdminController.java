package com.formation.articlesimy.controller;

import com.formation.articlesimy.dto.DashboardResponse;
import com.formation.articlesimy.dto.UserUpdateRequest;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.service.DashboardService;
import com.formation.articlesimy.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin dashboard, analytics, and user management")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserService userService;

    public AdminController(DashboardService dashboardService, UserService userService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard KPI summary")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get full analytics (charts data)")
    public ResponseEntity<DashboardResponse> getAnalytics() {
        return ResponseEntity.ok(dashboardService.getFullAnalytics());
    }

    // ─── User Management ────────────────────────────
    @GetMapping("/users")
    @Operation(summary = "List all users (admin)")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change user role (super admin only)")
    public ResponseEntity<User> changeRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.changeUserRole(id, body.get("role")));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user (admin)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}