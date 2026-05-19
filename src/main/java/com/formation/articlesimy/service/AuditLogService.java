package com.formation.articlesimy.service;

import com.formation.articlesimy.entity.AuditLog;

import java.util.List;

public interface AuditLogService {
    void logAction(String action, String details, String actorEmail, String actorRole);
    List<AuditLog> getAllLogs();
    List<AuditLog> getLogsByActor(String actorEmail);
    List<AuditLog> searchLogs(String keyword);
}
