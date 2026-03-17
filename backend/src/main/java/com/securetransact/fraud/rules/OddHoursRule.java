package com.securetransact.fraud.rules;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class OddHoursRule implements FraudRule {

    @Override
    public String getName() {
        return "ODD_HOURS";
    }

    @Override
    public int evaluate(Transaction transaction, Account sourceAccount) {
        LocalTime now = LocalTime.now();
        LocalTime start = LocalTime.of(1, 0);
        LocalTime end = LocalTime.of(5, 0);

        return (now.isAfter(start) && now.isBefore(end)) ? 15 : 0;
    }
}
