package com.securetransact.risk;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import com.securetransact.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class RiskFeatureExtractor {

    private final TransactionRepository transactionRepository;

    public RiskFeatureData extractFeatures(Transaction transaction, Account sourceAccount) {
        RiskFeatureData.RiskFeatureDataBuilder builder = RiskFeatureData.builder()
                .amount(transaction.getAmount())
                .transactionHour(LocalDateTime.now().getHour())
                .transactionDayOfWeek(LocalDateTime.now().getDayOfWeek().getValue());

        if (sourceAccount != null) {
            long accountAgeDays = java.time.Duration.between(
                    sourceAccount.getCreatedAt(), LocalDateTime.now()).toDays();
            builder.accountAgeDays(accountAgeDays)
                    .balanceBeforeTransaction(sourceAccount.getBalance())
                    .accountType(sourceAccount.getAccountType().name());

            long recentTxnCount = transactionRepository.countRecentTransactions(
                    sourceAccount.getId(), LocalDateTime.now().minusHours(24));
            builder.recentTransactionCount(recentTxnCount);
        }

        return builder.build();
    }
}
