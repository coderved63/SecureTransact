package com.securetransact.controller;

import com.securetransact.dto.AccountResponse;
import com.securetransact.dto.DashboardMetricsResponse;
import com.securetransact.dto.FraudReviewRequest;
import com.securetransact.dto.TransactionResponse;
import com.securetransact.security.CustomUserDetails;
import com.securetransact.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and fraud review")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard metrics")
    public ResponseEntity<DashboardMetricsResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @GetMapping("/fraud/flagged")
    @Operation(summary = "Get all flagged transactions")
    public ResponseEntity<Page<TransactionResponse>> getFlaggedTransactions(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getFlaggedTransactions(pageable));
    }

    @PutMapping("/fraud/{id}/review")
    @Operation(summary = "Approve or reject a flagged transaction")
    public ResponseEntity<TransactionResponse> reviewTransaction(
            @PathVariable Long id,
            @Valid @RequestBody FraudReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails admin) {
        return ResponseEntity.ok(adminService.reviewTransaction(id, request.getDecision(), admin.getId()));
    }

    @GetMapping("/accounts")
    @Operation(summary = "Get all accounts (admin view)")
    public ResponseEntity<Page<AccountResponse>> getAllAccounts(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllAccounts(pageable));
    }
}
