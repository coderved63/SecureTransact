package com.securetransact.risk;

import java.math.BigDecimal;

public interface RiskScoringClient {

    MlPrediction predictRisk(RiskFeatureData features);

    record MlPrediction(
            BigDecimal riskProbability,
            String riskLevel,
            String modelVersion
    ) {}
}
