package com.securetransact.risk;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Component
@Slf4j
public class RemoteRiskScoringClient implements RiskScoringClient {

    @Value("${risk.ml-service.url:}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public MlPrediction predictRisk(RiskFeatureData features) {
        if (mlServiceUrl == null || mlServiceUrl.isBlank()) {
            log.debug("ML service not configured, returning default prediction");
            return new MlPrediction(BigDecimal.ZERO, "LOW", "none");
        }

        try {
            MlPrediction response = restTemplate.postForObject(
                    mlServiceUrl + "/predict-risk", features, MlPrediction.class);
            return response != null ? response : new MlPrediction(BigDecimal.ZERO, "LOW", "none");
        } catch (Exception e) {
            log.warn("ML service unavailable: {}", e.getMessage());
            return new MlPrediction(BigDecimal.ZERO, "LOW", "none");
        }
    }
}
