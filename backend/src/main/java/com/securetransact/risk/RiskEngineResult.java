package com.securetransact.risk;

import com.securetransact.model.Account;
import com.securetransact.model.Transaction;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RiskEngineResult {
    private RiskScoringResult scoringResult;
    private RiskFeatureData features;
}
