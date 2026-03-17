package com.securetransact.fraud;

import com.securetransact.fraud.rules.FraudRule;
import com.securetransact.model.Account;
import com.securetransact.model.RiskLevel;
import com.securetransact.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final List<FraudRule> fraudRules;

    public FraudResult analyzeTransaction(Transaction transaction, Account sourceAccount) {
        int totalScore = 0;
        List<String> triggeredRules = new ArrayList<>();

        for (FraudRule rule : fraudRules) {
            int score = rule.evaluate(transaction, sourceAccount);
            if (score > 0) {
                totalScore += score;
                triggeredRules.add(rule.getName() + " (+" + score + ")");
            }
        }

        RiskLevel riskLevel = determineRiskLevel(totalScore);
        return new FraudResult(totalScore, riskLevel, triggeredRules);
    }

    private RiskLevel determineRiskLevel(int score) {
        if (score >= 76) return RiskLevel.CRITICAL;
        if (score >= 51) return RiskLevel.HIGH;
        if (score >= 21) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }
}
