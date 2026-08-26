package com.securetransact.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_evaluations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RiskEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private Transaction transaction;

    @Column(nullable = false)
    private int totalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskDecision decision;

    @Column(nullable = false)
    private String modelVersion;

    @Column(length = 2000)
    private String triggeredRules;

    @Column(length = 2000)
    private String reasons;

    @Column(precision = 5, scale = 4)
    private BigDecimal mlProbability;

    @Column(nullable = false)
    private LocalDateTime evaluatedAt;

    @PrePersist
    protected void onCreate() {
        evaluatedAt = LocalDateTime.now();
    }
}
