package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.entity.AuditLog;
import com.formation.articlesimy.repository.AuditLogRepository;
import com.formation.articlesimy.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void logAction(String action, String details, String actorEmail, String actorRole) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .details(details)
                .actorEmail(actorEmail)
                .actorRole(actorRole)
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByActor(String actorEmail) {
        return auditLogRepository.findByActorEmailOrderByTimestampDesc(actorEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> searchLogs(String keyword) {
        return auditLogRepository.findByActionContainingIgnoreCaseOrderByTimestampDesc(keyword);
    }
}
