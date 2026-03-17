package com.securetransact.fraud.rules;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;

public interface FraudRule {

    String getName();

    int evaluate(Transaction transaction, Account sourceAccount);
}
