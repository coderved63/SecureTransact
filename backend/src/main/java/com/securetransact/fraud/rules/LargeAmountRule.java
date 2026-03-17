package com.securetransact.fraud.rules;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LargeAmountRule implements FraudRule {

    private static final BigDecimal THRESHOLD = new BigDecimal("50000");

    @Override
    public String getName() {
        return "LARGE_AMOUNT";
    }

    @Override
    public int evaluate(Transaction transaction, Account sourceAccount) {
        return transaction.getAmount().compareTo(THRESHOLD) > 0 ? 30 : 0;
    }
}
