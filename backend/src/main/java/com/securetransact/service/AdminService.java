package com.securetransact.service;

import com.securetransact.dto.AccountResponse;
import com.securetransact.dto.AuditEventResponse;
import com.securetransact.dto.DashboardMetricsResponse;
import com.securetransact.dto.PaginatedResponse;
import com.securetransact.dto.TransactionResponse;
import com.securetransact.model.*;
import com.securetransact.repository.AccountRepository;
import com.securetransact.repository.RiskCaseRepository;
import com.securetransact.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final RiskCaseRepository riskCaseRepository;
    private final AuditService auditService;

    public DashboardMetricsResponse getDashboardMetrics() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        return DashboardMetricsResponse.builder()
                .totalTransactionsToday(transactionRepository.countTransactionsSince(startOfDay))
                .totalVolumeToday(transactionRepository.sumCompletedAmountSince(startOfDay))
                .flaggedTransactionsToday(transactionRepository.countByStatusSince(TransactionStatus.HELD_FOR_REVIEW, startOfDay))
                .completedTransactionsToday(transactionRepository.countByStatusSince(TransactionStatus.SETTLED, startOfDay))
                .failedTransactionsToday(transactionRepository.countByStatusSince(TransactionStatus.FAILED, startOfDay))
                .activeAccounts(accountRepository.countByStatus(AccountStatus.ACTIVE))
                .build();
    }

    public Page<TransactionResponse> getFlaggedTransactions(Pageable pageable) {
        return transactionRepository.findByStatus(TransactionStatus.HELD_FOR_REVIEW, pageable)
                .map(TransactionResponse::from);
    }

    public Page<AccountResponse> getAllAccounts(Pageable pageable) {
        return accountRepository.findAll(pageable).map(AccountResponse::from);
    }

    public PaginatedResponse<AuditEventResponse> getAuditEvents(int page, int size) {
        return auditService.getAuditEvents(page, size);
    }
}
