package com.securetransact.repository;

import com.securetransact.model.BlacklistType;
import com.securetransact.model.FraudBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FraudBlacklistRepository extends JpaRepository<FraudBlacklist, Long> {

    Optional<FraudBlacklist> findByTypeAndValueAndActiveTrue(BlacklistType type, String value);

    boolean existsByTypeAndValueAndActiveTrue(BlacklistType type, String value);
}
