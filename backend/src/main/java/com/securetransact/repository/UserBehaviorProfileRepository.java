package com.securetransact.repository;

import com.securetransact.model.UserBehaviorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserBehaviorProfileRepository extends JpaRepository<UserBehaviorProfile, Long> {

    Optional<UserBehaviorProfile> findByUserId(Long userId);
}
