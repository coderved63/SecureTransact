package com.securetransact.fraud.rules;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class NewAccountRule implements FraudRule {

    @Override
    public String getName() {
        return "NEW_ACCOUNT_LARGE_TXN";
    }

    @Override
    public int evaluate(Transaction transaction, Account sourceAccount) {
        if (sourceAccount == null) return 0;

        boolean isNewAccount = sourceAccount.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7));
        boolean isLargeAmount = transaction.getAmount().compareTo(new BigDecimal("10000")) > 0;

        return (isNewAccount && isLargeAmount) ? 20 : 0;
    }
}
