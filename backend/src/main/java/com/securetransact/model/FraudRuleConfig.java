package com.securetransact.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_rule_configs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FraudRuleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleName;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private int scoreWeight;

    @Column(nullable = false)
    private int priority;

    @Column(precision = 19, scale = 2)
    private BigDecimal thresholdNumeric;

    private Integer thresholdInteger;

    private String thresholdString;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
