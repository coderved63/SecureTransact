package com.securetransact.dto;

import com.securetransact.model.AccountType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @DecimalMin(value = "0.0", message = "Initial deposit cannot be negative")
    @DecimalMax(value = "99999999.99", message = "Initial deposit exceeds maximum allowed")
    private BigDecimal initialDeposit;
}
