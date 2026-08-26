package com.securetransact.dto;

import com.securetransact.model.RiskDecision;
import com.securetransact.model.RiskEvaluation;
import com.securetransact.model.RiskLevel;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RiskEvaluationResponse {
    private Long id;
    private Long transactionId;
    private int totalScore;
    private RiskLevel riskLevel;
    private RiskDecision decision;
    private String modelVersion;
    private List<String> reasons;
    private BigDecimal mlProbability;
    private LocalDateTime evaluatedAt;

    public static RiskEvaluationResponse from(RiskEvaluation eval) {
        RiskEvaluationResponse response = new RiskEvaluationResponse();
        response.setId(eval.getId());
        response.setTransactionId(eval.getTransaction().getId());
        response.setTotalScore(eval.getTotalScore());
        response.setRiskLevel(eval.getRiskLevel());
        response.setDecision(eval.getDecision());
        response.setModelVersion(eval.getModelVersion());
        response.setMlProbability(eval.getMlProbability());
        response.setEvaluatedAt(eval.getEvaluatedAt());

        if (eval.getReasons() != null && !eval.getReasons().isEmpty()) {
            response.setReasons(List.of(eval.getReasons().split("\\|\\|")));
        }

        return response;
    }
}
