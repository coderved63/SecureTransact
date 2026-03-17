package com.securetransact.service;

import com.securetransact.dto.AccountResponse;
import com.securetransact.dto.DashboardMetricsResponse;
import com.securetransact.dto.TransactionResponse;
import com.securetransact.model.*;
import com.securetransact.repository.AccountRepository;
import com.securetransact.repository.FraudLogRepository;
import com.securetransact.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final FraudLogRepository fraudLogRepository;

    public DashboardMetricsResponse getDashboardMetrics() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        return DashboardMetricsResponse.builder()
                .totalTransactionsToday(transactionRepository.countTransactionsSince(startOfDay))
                .totalVolumeToday(transactionRepository.sumCompletedAmountSince(startOfDay))
                .flaggedTransactionsToday(transactionRepository.countByStatusSince(TransactionStatus.FLAGGED, startOfDay))
                .completedTransactionsToday(transactionRepository.countByStatusSince(TransactionStatus.COMPLETED, startOfDay))
                .failedTransactionsToday(transactionRepository.countByStatusSince(TransactionStatus.FAILED, startOfDay))
                .activeAccounts(accountRepository.countByStatus(AccountStatus.ACTIVE))
                .build();
    }

    public Page<TransactionResponse> getFlaggedTransactions(Pageable pageable) {
        return transactionRepository.findByStatus(TransactionStatus.FLAGGED, pageable)
                .map(TransactionResponse::from);
    }

    @Transactional
    public TransactionResponse reviewTransaction(Long transactionId, String decision, Long adminId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.FLAGGED) {
            throw new RuntimeException("Transaction is not in FLAGGED status");
        }

        FraudLog fraudLog = fraudLogRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Fraud log not found"));

        if ("APPROVE".equalsIgnoreCase(decision)) {
            // Process the transaction
            processApprovedTransaction(transaction);
            fraudLog.setDecision(FraudDecision.ADMIN_APPROVED);
            log.info("Admin {} approved transaction {}", adminId, transactionId);
        } else if ("REJECT".equalsIgnoreCase(decision)) {
            transaction.setStatus(TransactionStatus.FAILED);
            fraudLog.setDecision(FraudDecision.ADMIN_REJECTED);
            log.info("Admin {} rejected transaction {}", adminId, transactionId);
        } else {
            throw new RuntimeException("Invalid decision. Use APPROVE or REJECT");
        }

        fraudLog.setReviewedBy(adminId);
        fraudLog.setReviewedAt(LocalDateTime.now());
        fraudLogRepository.save(fraudLog);
        transaction = transactionRepository.save(transaction);

        return TransactionResponse.from(transaction);
    }

    private void processApprovedTransaction(Transaction transaction) {
        Account fromAccount = transaction.getFromAccount();
        Account toAccount = transaction.getToAccount();

        switch (transaction.getType()) {
            case DEPOSIT:
                toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));
                accountRepository.save(toAccount);
                break;
            case WITHDRAWAL:
                if (fromAccount.getBalance().compareTo(transaction.getAmount()) < 0) {
                    transaction.setStatus(TransactionStatus.FAILED);
                    return;
                }
                fromAccount.setBalance(fromAccount.getBalance().subtract(transaction.getAmount()));
                accountRepository.save(fromAccount);
                break;
            case TRANSFER:
                if (fromAccount.getBalance().compareTo(transaction.getAmount()) < 0) {
                    transaction.setStatus(TransactionStatus.FAILED);
                    return;
                }
                fromAccount.setBalance(fromAccount.getBalance().subtract(transaction.getAmount()));
                toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));
                accountRepository.save(fromAccount);
                accountRepository.save(toAccount);
                break;
        }

        transaction.setStatus(TransactionStatus.COMPLETED);
    }

    public Page<AccountResponse> getAllAccounts(Pageable pageable) {
        return accountRepository.findAll(pageable).map(AccountResponse::from);
    }
}
