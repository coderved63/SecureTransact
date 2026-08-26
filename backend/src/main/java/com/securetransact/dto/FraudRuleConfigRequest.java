package com.securetransact.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FraudRuleConfigRequest {

    @NotBlank(message = "Rule name is required")
    private String ruleName;

    private String description;

    @NotNull(message = "Enabled flag is required")
    private Boolean enabled;

    @Min(value = 0, message = "Score weight must be non-negative")
    private Integer scoreWeight;

    @Min(value = 0, message = "Priority must be non-negative")
    private Integer priority;

    private BigDecimal thresholdNumeric;

    private Integer thresholdInteger;
}
