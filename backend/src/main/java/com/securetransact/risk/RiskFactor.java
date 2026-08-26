package com.securetransact.risk;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskFactor {
    private String code;
    private int points;
    private String message;
}
