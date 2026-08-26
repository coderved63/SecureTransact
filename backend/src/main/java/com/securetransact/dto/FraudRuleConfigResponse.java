package com.securetransact.dto;

import com.securetransact.model.FraudRuleConfig;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FraudRuleConfigResponse {
    private Long id;
    private String ruleName;
    private String description;
    private boolean enabled;
    private int scoreWeight;
    private int priority;
    private BigDecimal thresholdNumeric;
    private Integer thresholdInteger;
    private LocalDateTime updatedAt;

    public static FraudRuleConfigResponse from(FraudRuleConfig config) {
        FraudRuleConfigResponse response = new FraudRuleConfigResponse();
        response.setId(config.getId());
        response.setRuleName(config.getRuleName());
        response.setDescription(config.getDescription());
        response.setEnabled(config.isEnabled());
        response.setScoreWeight(config.getScoreWeight());
        response.setPriority(config.getPriority());
        response.setThresholdNumeric(config.getThresholdNumeric());
        response.setThresholdInteger(config.getThresholdInteger());
        response.setUpdatedAt(config.getUpdatedAt());
        return response;
    }
}
