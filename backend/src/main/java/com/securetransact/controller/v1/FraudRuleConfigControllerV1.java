package com.securetransact.controller.v1;

import com.securetransact.dto.*;
import com.securetransact.model.FraudRuleConfig;
import com.securetransact.repository.FraudRuleConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/fraud-rules")
@RequiredArgsConstructor
@Tag(name = "Admin Fraud Rules", description = "Configure fraud detection rules")
public class FraudRuleConfigControllerV1 {

    private final FraudRuleConfigRepository ruleConfigRepository;

    @GetMapping
    @Operation(summary = "List all fraud rule configurations")
    public ResponseEntity<List<FraudRuleConfigResponse>> listRules() {
        return ResponseEntity.ok(ruleConfigRepository.findAllByOrderByPriorityAsc().stream()
                .map(FraudRuleConfigResponse::from)
                .toList());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a fraud rule configuration")
    public ResponseEntity<FraudRuleConfigResponse> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody FraudRuleConfigRequest request) {
        FraudRuleConfig config = ruleConfigRepository.findById(id)
                .orElseThrow(() -> new com.securetransact.exception.ResourceNotFoundException("Rule not found"));

        if (request.getEnabled() != null) config.setEnabled(request.getEnabled());
        if (request.getScoreWeight() != null) config.setScoreWeight(request.getScoreWeight());
        if (request.getPriority() != null) config.setPriority(request.getPriority());
        if (request.getThresholdNumeric() != null) config.setThresholdNumeric(request.getThresholdNumeric());
        if (request.getThresholdInteger() != null) config.setThresholdInteger(request.getThresholdInteger());
        if (request.getDescription() != null) config.setDescription(request.getDescription());

        return ResponseEntity.ok(FraudRuleConfigResponse.from(ruleConfigRepository.save(config)));
    }
}
