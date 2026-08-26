package com.securetransact.service;

import com.securetransact.dto.AuditEventResponse;
import com.securetransact.dto.PaginatedResponse;
import com.securetransact.model.AuditAction;
import com.securetransact.model.AuditEvent;
import com.securetransact.model.User;
import com.securetransact.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    @Transactional
    public void recordEvent(AuditAction action, String resourceType, Long resourceId,
                            String metadata, User actor, String ipAddress, String userAgent) {
        AuditEvent event = AuditEvent.builder()
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .metadata(metadata)
                .actor(actor)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        auditEventRepository.save(event);
        log.debug("Audit event: {} on {}#{} by user {}",
                action, resourceType, resourceId, actor != null ? actor.getId() : "system");
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<AuditEventResponse> getAuditEvents(int page, int size) {
        Page<AuditEvent> events = auditEventRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPaginatedResponse(events);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<AuditEventResponse> getAuditEventsByAction(AuditAction action, int page, int size) {
        Page<AuditEvent> events = auditEventRepository.findByAction(action,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPaginatedResponse(events);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<AuditEventResponse> getAuditEventsForResource(String resourceType, Long resourceId, int page, int size) {
        Page<AuditEvent> events = auditEventRepository.findByResourceTypeAndResourceId(
                resourceType, resourceId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPaginatedResponse(events);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<AuditEventResponse> getAuditEventsByUser(Long userId, int page, int size) {
        Page<AuditEvent> events = auditEventRepository.findByActorId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return toPaginatedResponse(events);
    }

    @Transactional(readOnly = true)
    public long countEventsSince(LocalDateTime since) {
        return auditEventRepository.countSince(since);
    }

    private PaginatedResponse<AuditEventResponse> toPaginatedResponse(Page<AuditEvent> page) {
        List<AuditEventResponse> content = page.getContent().stream()
                .map(AuditEventResponse::from)
                .toList();
        return new PaginatedResponse<>(
                content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(),
                page.isFirst(), page.isLast());
    }
}
