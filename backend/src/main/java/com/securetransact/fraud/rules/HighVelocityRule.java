package com.securetransact.fraud.rules;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import com.securetransact.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class HighVelocityRule implements FraudRule {

    private final TransactionRepository transactionRepository;

    @Override
    public String getName() {
        return "HIGH_VELOCITY";
    }

    @Override
    public int evaluate(Transaction transaction, Account sourceAccount) {
        if (sourceAccount == null) return 0;

        long recentCount = transactionRepository.countRecentTransactions(
                sourceAccount.getId(), LocalDateTime.now().minusMinutes(1));

        return recentCount >= 5 ? 25 : 0;
    }
}
