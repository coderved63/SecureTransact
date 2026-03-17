package com.securetransact.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FraudLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(columnDefinition = "TEXT")
    private String rulesTriggered;  // JSON string of triggered rules

    @Column(nullable = false)
    private Integer totalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FraudDecision decision;

    private Long reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
