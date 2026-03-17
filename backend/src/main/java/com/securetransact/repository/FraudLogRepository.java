package com.securetransact.repository;

import com.securetransact.model.FraudDecision;
import com.securetransact.model.FraudLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FraudLogRepository extends JpaRepository<FraudLog, Long> {

    Optional<FraudLog> findByTransactionId(Long transactionId);

    Page<FraudLog> findByDecision(FraudDecision decision, Pageable pageable);
}
