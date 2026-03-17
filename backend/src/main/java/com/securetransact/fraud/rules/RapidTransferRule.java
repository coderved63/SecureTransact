package com.securetransact.fraud.rules;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import com.securetransact.model.TransactionType;
import com.securetransact.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class RapidTransferRule implements FraudRule {

    private final TransactionRepository transactionRepository;

    @Override
    public String getName() {
        return "RAPID_TRANSFER";
    }

    @Override
    public int evaluate(Transaction transaction, Account sourceAccount) {
        if (sourceAccount == null || transaction.getType() != TransactionType.TRANSFER
                || transaction.getToAccount() == null) {
            return 0;
        }

        long recentTransfers = transactionRepository.countRecentTransfersToAccount(
                sourceAccount.getId(), transaction.getToAccount().getId(),
                LocalDateTime.now().minusMinutes(10));

        return recentTransfers >= 3 ? 20 : 0;
    }
}
