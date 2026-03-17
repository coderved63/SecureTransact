package com.securetransact.service;

import com.securetransact.dto.TransactionRequest;
import com.securetransact.dto.TransactionResponse;
import com.securetransact.fraud.FraudDetectionService;
import com.securetransact.fraud.FraudResult;
import com.securetransact.model.*;
import com.securetransact.repository.AccountRepository;
import com.securetransact.repository.FraudLogRepository;
import com.securetransact.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final FraudDetectionService fraudDetectionService;
    private final FraudLogRepository fraudLogRepository;

    private static final int MAX_RETRIES = 3;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse submitTransaction(Long userId, TransactionRequest request) {
        // Idempotency check
        if (request.getIdempotencyKey() != null) {
            Optional<Transaction> existing = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                return TransactionResponse.from(existing.get());
            }
        }

        // Validate and get accounts
        Account fromAccount = null;
        Account toAccount = null;

        switch (request.getType()) {
            case DEPOSIT:
                toAccount = getAndValidateAccount(request.getToAccountId(), userId);
                break;
            case WITHDRAWAL:
                fromAccount = getAndValidateAccount(request.getFromAccountId(), userId);
                validateSufficientBalance(fromAccount, request.getAmount());
                break;
            case TRANSFER:
                fromAccount = getAndValidateAccount(request.getFromAccountId(), userId);
                toAccount = accountRepository.findById(request.getToAccountId())
                        .orElseThrow(() -> new RuntimeException("Destination account not found"));
                validateSufficientBalance(fromAccount, request.getAmount());
                break;
        }

        // Create transaction
        Transaction transaction = Transaction.builder()
                .fromAccount(fromAccount)
                .toAccount(toAccount)
                .type(request.getType())
                .amount(request.getAmount())
                .status(TransactionStatus.PENDING)
                .idempotencyKey(request.getIdempotencyKey())
                .description(request.getDescription())
                .build();

        transaction = transactionRepository.save(transaction);

        // Fraud detection
        Account sourceAccount = (fromAccount != null) ? fromAccount : toAccount;
        FraudResult fraudResult = fraudDetectionService.analyzeTransaction(transaction, sourceAccount);
        transaction.setRiskScore(fraudResult.getTotalScore());

        // Log fraud analysis
        FraudLog fraudLog = FraudLog.builder()
                .transaction(transaction)
                .totalScore(fraudResult.getTotalScore())
                .rulesTriggered(String.join(", ", fraudResult.getTriggeredRules()))
                .decision(fraudResult.getRiskLevel() == RiskLevel.HIGH || fraudResult.getRiskLevel() == RiskLevel.CRITICAL
                        ? FraudDecision.FLAGGED : FraudDecision.AUTO_APPROVED)
                .build();
        fraudLogRepository.save(fraudLog);

        // Process based on risk level
        if (fraudResult.getRiskLevel() == RiskLevel.HIGH || fraudResult.getRiskLevel() == RiskLevel.CRITICAL) {
            transaction.setStatus(TransactionStatus.FLAGGED);
            log.warn("Transaction {} flagged with risk score {}: {}", transaction.getId(),
                    fraudResult.getTotalScore(), fraudResult.getTriggeredRules());
        } else {
            processTransaction(transaction, fromAccount, toAccount);
        }

        transaction = transactionRepository.save(transaction);
        return TransactionResponse.from(transaction);
    }

    private void processTransaction(Transaction transaction, Account fromAccount, Account toAccount) {
        int retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                transaction.setStatus(TransactionStatus.PROCESSING);

                switch (transaction.getType()) {
                    case DEPOSIT:
                        toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));
                        accountRepository.save(toAccount);
                        break;
                    case WITHDRAWAL:
                        fromAccount.setBalance(fromAccount.getBalance().subtract(transaction.getAmount()));
                        accountRepository.save(fromAccount);
                        break;
                    case TRANSFER:
                        fromAccount.setBalance(fromAccount.getBalance().subtract(transaction.getAmount()));
                        toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));
                        accountRepository.save(fromAccount);
                        accountRepository.save(toAccount);
                        break;
                }

                transaction.setStatus(TransactionStatus.COMPLETED);
                return;
            } catch (ObjectOptimisticLockingFailureException e) {
                retries++;
                log.warn("Optimistic lock conflict for transaction {}, retry {}/{}",
                        transaction.getId(), retries, MAX_RETRIES);
                if (retries >= MAX_RETRIES) {
                    transaction.setStatus(TransactionStatus.FAILED);
                    log.error("Transaction {} failed after {} retries due to concurrent modification",
                            transaction.getId(), MAX_RETRIES);
                }
                // Refresh accounts from DB
                if (fromAccount != null) fromAccount = accountRepository.findById(fromAccount.getId()).orElseThrow();
                if (toAccount != null) toAccount = accountRepository.findById(toAccount.getId()).orElseThrow();
            }
        }
    }

    public TransactionResponse getTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return TransactionResponse.from(transaction);
    }

    public Page<TransactionResponse> getTransactionHistory(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable)
                .map(TransactionResponse::from);
    }

    private Account getAndValidateAccount(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to account");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }

        return account;
    }

    private void validateSufficientBalance(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
    }
}
