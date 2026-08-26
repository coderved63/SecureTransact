package com.securetransact.service;

import com.securetransact.model.*;
import com.securetransact.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionProcessor {

    private final AccountRepository accountRepository;

    private static final int MAX_RETRIES = 3;

    public TransactionStatus processMoneyMovement(Transaction transaction) {
        Account fromAccount = transaction.getFromAccount();
        Account toAccount = transaction.getToAccount();

        int retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                switch (transaction.getType()) {
                    case DEPOSIT -> {
                        toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));
                        accountRepository.save(toAccount);
                    }
                    case WITHDRAWAL -> {
                        fromAccount.setBalance(fromAccount.getBalance().subtract(transaction.getAmount()));
                        accountRepository.save(fromAccount);
                    }
                    case TRANSFER -> {
                        if (fromAccount.getBalance().compareTo(transaction.getAmount()) < 0) {
                            return TransactionStatus.FAILED;
                        }
                        fromAccount.setBalance(fromAccount.getBalance().subtract(transaction.getAmount()));
                        toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));
                        accountRepository.save(fromAccount);
                        accountRepository.save(toAccount);
                    }
                }
                return TransactionStatus.SETTLED;
            } catch (ObjectOptimisticLockingFailureException e) {
                retries++;
                log.warn("Optimistic lock conflict for transaction {}, retry {}/{}",
                        transaction.getId(), retries, MAX_RETRIES);
                if (retries >= MAX_RETRIES) {
                    log.error("Transaction {} failed after {} retries", transaction.getId(), MAX_RETRIES);
                    return TransactionStatus.FAILED;
                }
                refreshAccounts(fromAccount, toAccount);
            }
        }
        return TransactionStatus.FAILED;
    }

    private void refreshAccounts(Account fromAccount, Account toAccount) {
        if (fromAccount != null) {
            accountRepository.findById(fromAccount.getId()).ifPresent(refreshed -> {
                fromAccount.setBalance(refreshed.getBalance());
                fromAccount.setVersion(refreshed.getVersion());
            });
        }
        if (toAccount != null) {
            accountRepository.findById(toAccount.getId()).ifPresent(refreshed -> {
                toAccount.setBalance(refreshed.getBalance());
                toAccount.setVersion(refreshed.getVersion());
            });
        }
    }
}
