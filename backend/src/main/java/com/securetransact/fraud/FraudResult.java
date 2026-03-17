package com.securetransact.fraud;

import com.securetransact.model.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class FraudResult {
    private int totalScore;
    private RiskLevel riskLevel;
    private List<String> triggeredRules;
}
