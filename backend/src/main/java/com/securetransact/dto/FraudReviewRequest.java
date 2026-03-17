package com.securetransact.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FraudReviewRequest {

    @NotNull(message = "Decision is required (APPROVE or REJECT)")
    private String decision;  // "APPROVE" or "REJECT"
}
