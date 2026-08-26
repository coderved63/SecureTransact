package com.securetransact.controller.v1;

import com.securetransact.dto.PaginatedResponse;
import com.securetransact.dto.AuditEventResponse;
import com.securetransact.model.AuditAction;
import com.securetransact.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-events")
@RequiredArgsConstructor
@Tag(name = "Audit Events", description = "Audit trail query")
public class AuditEventControllerV1 {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "List all audit events")
    public ResponseEntity<PaginatedResponse<AuditEventResponse>> listEvents(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditEvents(pageable.getPageNumber(), pageable.getPageSize()));
    }

    @GetMapping("/by-action/{action}")
    @Operation(summary = "Filter audit events by action type")
    public ResponseEntity<PaginatedResponse<AuditEventResponse>> listByAction(
            @PathVariable AuditAction action,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditEventsByAction(action, pageable.getPageNumber(), pageable.getPageSize()));
    }

    @GetMapping("/by-resource/{resourceType}/{resourceId}")
    @Operation(summary = "Get audit trail for a specific resource")
    public ResponseEntity<PaginatedResponse<AuditEventResponse>> listForResource(
            @PathVariable String resourceType,
            @PathVariable Long resourceId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditEventsForResource(resourceType, resourceId, pageable.getPageNumber(), pageable.getPageSize()));
    }
}
