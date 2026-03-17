package com.securetransact.controller;

import com.securetransact.dto.AccountRequest;
import com.securetransact.dto.AccountResponse;
import com.securetransact.dto.TransactionResponse;
import com.securetransact.security.CustomUserDetails;
import com.securetransact.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account management operations")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Create a new bank account")
    public ResponseEntity<AccountResponse> createAccount(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(accountService.createAccount(user.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all accounts for current user")
    public ResponseEntity<List<AccountResponse>> getMyAccounts(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(accountService.getAccountsByUser(user.getId()));
    }

    @GetMapping("/lookup")
    @Operation(summary = "Look up any account by account number")
    public ResponseEntity<AccountResponse> lookupAccount(@RequestParam String accountNumber) {
        return ResponseEntity.ok(accountService.lookupByAccountNumber(accountNumber));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account details by ID")
    public ResponseEntity<AccountResponse> getAccountDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(accountService.getAccountDetails(id, user.getId()));
    }

    @GetMapping("/{id}/statement")
    @Operation(summary = "Get account statement for date range")
    public ResponseEntity<List<TransactionResponse>> getStatement(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime start,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime end) {
        return ResponseEntity.ok(accountService.getStatement(id, user.getId(), start, end));
    }
}
