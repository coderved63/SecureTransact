package com.securetransact.repository;

import com.securetransact.model.RiskEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RiskEvaluationRepository extends JpaRepository<RiskEvaluation, Long> {

    Optional<RiskEvaluation> findByTransactionId(Long transactionId);
}
