package com.securetransact.controller.v1;

import com.securetransact.dto.DashboardMetricsResponse;
import com.securetransact.dto.PaginatedResponse;
import com.securetransact.dto.AccountResponse;
import com.securetransact.dto.AuditEventResponse;
import com.securetransact.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Admin dashboard and operations")
public class AdminDashboardControllerV1 {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard metrics")
    public ResponseEntity<DashboardMetricsResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @GetMapping("/accounts")
    @Operation(summary = "List all accounts")
    public ResponseEntity<PaginatedResponse<AccountResponse>> listAccounts(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(new PaginatedResponse<>(
                adminService.getAllAccounts(pageable).getContent().stream()
                        .map(AccountResponse::from).toList(),
                pageable.getPageNumber(), pageable.getPageSize(),
                0, 0, true, true));
    }

    @GetMapping("/audit-events")
    @Operation(summary = "List audit events")
    public ResponseEntity<PaginatedResponse<AuditEventResponse>> listAuditEvents(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAuditEvents(pageable.getPageNumber(), pageable.getPageSize()));
    }
}
