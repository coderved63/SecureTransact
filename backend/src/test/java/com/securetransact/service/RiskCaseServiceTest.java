package com.securetransact.service;

import com.securetransact.model.*;
import com.securetransact.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RiskCaseServiceTest {

    @Mock private RiskCaseRepository riskCaseRepository;
    @Mock private AuditService auditService;

    @InjectMocks
    private RiskCaseService riskCaseService;

    private RiskCase sampleCase;

    @BeforeEach
    void setUp() {
        sampleCase = RiskCase.builder()
                .id(1L)
                .transactionId(100L)
                .fraudScore(72)
                .status(CaseStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void shouldCreateRiskCase() {
        when(riskCaseRepository.save(any(RiskCase.class))).thenAnswer(inv -> {
            RiskCase rc = inv.getArgument(0);
            rc.setId(2L);
            return rc;
        });

        RiskCase created = riskCaseService.createCase(100L, 72, "LARGE_AMOUNT,HIGH_VELOCITY");

        assertNotNull(created);
        assertEquals(CaseStatus.OPEN, created.getStatus());
        assertEquals(72, created.getFraudScore());
        assertEquals(100L, created.getTransactionId());
        verify(auditService).recordEvent(eq("SYSTEM"), eq(AuditAction.TRANSACTION_FLAGGED), anyString(), anyString(), any(), any());
    }

    @Test
    void shouldAssignCase() {
        when(riskCaseRepository.findById(1L)).thenReturn(Optional.of(sampleCase));
        when(riskCaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RiskCase assigned = riskCaseService.assignCase(1L, "admin@test.com");

        assertEquals(CaseStatus.IN_REVIEW, assigned.getStatus());
        assertEquals("admin@test.com", assigned.getAssignedTo());
        assertNotNull(assigned.getAssignedAt());
        verify(auditService).recordEvent(eq("admin@test.com"), eq(AuditAction.FRAUD_REVIEWED), anyString(), anyString(), any(), any());
    }

    @Test
    void shouldApproveCase() {
        when(riskCaseRepository.findById(1L)).thenReturn(Optional.of(sampleCase));
        when(riskCaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RiskCase resolved = riskCaseService.decideCase(1L, "APPROVE", "Legitimate large transfer", "admin@test.com");

        assertEquals(CaseStatus.RESOLVED_LEGITIMATE, resolved.getStatus());
        assertEquals("Legitimate large transfer", resolved.getReviewNotes());
        assertNotNull(resolved.getResolvedAt());
    }

    @Test
    void shouldBlockCase() {
        when(riskCaseRepository.findById(1L)).thenReturn(Optional.of(sampleCase));
        when(riskCaseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RiskCase resolved = riskCaseService.decideCase(1L, "BLOCK", "Confirmed fraud", "admin@test.com");

        assertEquals(CaseStatus.RESOLVED_FRAUD, resolved.getStatus());
        assertEquals("Confirmed fraud", resolved.getReviewNotes());
    }

    @Test
    void shouldThrowWhenCaseNotFound() {
        when(riskCaseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                riskCaseService.assignCase(999L, "admin@test.com"));
    }

    @Test
    void shouldThrowWhenDecidingNonReviewableStatus() {
        sampleCase.setStatus(CaseStatus.RESOLVED_FRAUD);
        when(riskCaseRepository.findById(1L)).thenReturn(Optional.of(sampleCase));

        assertThrows(IllegalStateException.class, () ->
                riskCaseService.decideCase(1L, "APPROVE", "Too late", "admin@test.com"));
    }
}
