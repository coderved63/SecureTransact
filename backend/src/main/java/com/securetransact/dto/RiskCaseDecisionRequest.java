package com.securetransact.dto;

import com.securetransact.model.RiskDecision;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RiskCaseDecisionRequest {

    @NotNull(message = "Decision is required")
    private RiskDecision decision;

    @Size(max = 2000, message = "Review notes must be at most 2000 characters")
    private String reviewNotes;
}
