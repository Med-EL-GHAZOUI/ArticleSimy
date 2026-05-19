package com.formation.articlesimy.controller;

import com.formation.articlesimy.entity.AuditLog;
import com.formation.articlesimy.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin("*")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/actor")
    public ResponseEntity<List<AuditLog>> getLogsByActor(@RequestParam String email) {
        return ResponseEntity.ok(auditLogService.getLogsByActor(email));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AuditLog>> searchLogs(@RequestParam String query) {
        return ResponseEntity.ok(auditLogService.searchLogs(query));
    }
}
