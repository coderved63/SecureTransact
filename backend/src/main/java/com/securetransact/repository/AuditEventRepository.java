package com.securetransact.repository;

import com.securetransact.model.AuditAction;
import com.securetransact.model.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    Page<AuditEvent> findByAction(AuditAction action, Pageable pageable);

    Page<AuditEvent> findByActorId(Long actorId, Pageable pageable);

    Page<AuditEvent> findByResourceTypeAndResourceId(String resourceType, Long resourceId, Pageable pageable);

    @Query("SELECT ae FROM AuditEvent ae WHERE ae.createdAt BETWEEN :start AND :end ORDER BY ae.createdAt DESC")
    Page<AuditEvent> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    @Query("SELECT COUNT(ae) FROM AuditEvent ae WHERE ae.createdAt > :since")
    long countSince(@Param("since") LocalDateTime since);
}
