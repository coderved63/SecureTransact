package com.securetransact.fraud;

import com.securetransact.fraud.rules.*;
import com.securetransact.model.*;
import com.securetransact.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    private FraudDetectionService fraudDetectionService;

    private Account testAccount;

    @BeforeEach
    void setUp() {
        List<FraudRule> rules = List.of(
                new LargeAmountRule(),
                new HighVelocityRule(transactionRepository),
                new OddHoursRule(),
                new NewAccountRule(),
                new RapidTransferRule(transactionRepository)
        );
        fraudDetectionService = new FraudDetectionService(rules);

        testAccount = Account.builder()
                .id(1L)
                .balance(new BigDecimal("100000"))
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusMonths(1))
                .build();
    }

    @Test
    void shouldReturnLowRiskForSmallTransaction() {
        Transaction txn = Transaction.builder()
                .amount(new BigDecimal("100"))
                .type(TransactionType.DEPOSIT)
                .build();

        when(transactionRepository.countRecentTransactions(anyLong(), any())).thenReturn(0L);

        FraudResult result = fraudDetectionService.analyzeTransaction(txn, testAccount);

        assertEquals(RiskLevel.LOW, result.getRiskLevel());
        assertEquals(0, result.getTotalScore());
        assertTrue(result.getTriggeredRules().isEmpty());
    }

    @Test
    void shouldFlagLargeAmount() {
        Transaction txn = Transaction.builder()
                .amount(new BigDecimal("75000"))
                .type(TransactionType.WITHDRAWAL)
                .build();

        when(transactionRepository.countRecentTransactions(anyLong(), any())).thenReturn(0L);

        FraudResult result = fraudDetectionService.analyzeTransaction(txn, testAccount);

        assertTrue(result.getTotalScore() >= 30);
        assertTrue(result.getTriggeredRules().stream()
                .anyMatch(r -> r.contains("LARGE_AMOUNT")));
    }

    @Test
    void shouldFlagHighVelocity() {
        Transaction txn = Transaction.builder()
                .amount(new BigDecimal("100"))
                .type(TransactionType.DEPOSIT)
                .build();

        when(transactionRepository.countRecentTransactions(anyLong(), any())).thenReturn(6L);

        FraudResult result = fraudDetectionService.analyzeTransaction(txn, testAccount);

        assertTrue(result.getTotalScore() >= 25);
        assertTrue(result.getTriggeredRules().stream()
                .anyMatch(r -> r.contains("HIGH_VELOCITY")));
    }

    @Test
    void shouldFlagNewAccountWithLargeTransaction() {
        Account newAccount = Account.builder()
                .id(2L)
                .balance(new BigDecimal("50000"))
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Transaction txn = Transaction.builder()
                .amount(new BigDecimal("15000"))
                .type(TransactionType.WITHDRAWAL)
                .build();

        when(transactionRepository.countRecentTransactions(anyLong(), any())).thenReturn(0L);

        FraudResult result = fraudDetectionService.analyzeTransaction(txn, newAccount);

        assertTrue(result.getTriggeredRules().stream()
                .anyMatch(r -> r.contains("NEW_ACCOUNT")));
    }

    @Test
    void shouldReturnCriticalForMultipleRuleViolations() {
        Account newAccount = Account.builder()
                .id(3L)
                .balance(new BigDecimal("200000"))
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Transaction txn = Transaction.builder()
                .amount(new BigDecimal("75000"))
                .type(TransactionType.WITHDRAWAL)
                .build();

        when(transactionRepository.countRecentTransactions(anyLong(), any())).thenReturn(6L);

        FraudResult result = fraudDetectionService.analyzeTransaction(txn, newAccount);

        // LargeAmount(30) + HighVelocity(25) + NewAccount(20) = 75 → HIGH or CRITICAL
        assertTrue(result.getTotalScore() >= 75);
        assertTrue(result.getRiskLevel() == RiskLevel.HIGH || result.getRiskLevel() == RiskLevel.CRITICAL);
    }

    @Test
    void shouldHandleNullSourceAccount() {
        Transaction txn = Transaction.builder()
                .amount(new BigDecimal("100"))
                .type(TransactionType.DEPOSIT)
                .build();

        FraudResult result = fraudDetectionService.analyzeTransaction(txn, null);

        assertNotNull(result);
        assertEquals(RiskLevel.LOW, result.getRiskLevel());
    }
}
