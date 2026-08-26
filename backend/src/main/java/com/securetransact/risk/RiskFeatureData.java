package com.securetransact.risk;

import com.securetransact.model.AccountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RiskFeatureData {
    private BigDecimal amount;
    private int transactionHour;
    private int transactionDayOfWeek;
    private long accountAgeDays;
    private long recentTransactionCount;
    private BigDecimal balanceBeforeTransaction;
    private String accountType;
}
