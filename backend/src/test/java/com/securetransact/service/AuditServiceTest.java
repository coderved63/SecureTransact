package com.securetransact.service;

import com.securetransact.model.AuditAction;
import com.securetransact.model.AuditEvent;
import com.securetransact.repository.AuditEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock private AuditEventRepository auditEventRepository;

    @InjectMocks
    private AuditService auditService;

    @Test
    void shouldRecordAuditEvent() {
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(inv -> {
            AuditEvent ev = inv.getArgument(0);
            ev.setId(1L);
            return ev;
        });

        AuditEvent saved = auditService.recordEvent(
                "admin@test.com",
                AuditAction.TRANSACTION_FLAGGED,
                "Transaction flagged for review",
                "TRANSACTION",
                100L,
                "{\"score\":72}"
        );

        assertNotNull(saved);
        assertEquals("admin@test.com", saved.getPerformedBy());
        assertEquals(AuditAction.TRANSACTION_FLAGGED, saved.getAction());
        assertEquals("TRANSACTION", saved.getResourceType());
        assertEquals(100L, saved.getResourceId());
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void shouldRecordEventWithoutResource() {
        when(auditEventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuditEvent saved = auditService.recordEvent(
                "system",
                AuditAction.USER_LOGIN,
                "Login successful",
                null,
                null,
                null
        );

        assertNull(saved.getResourceType());
        assertNull(saved.getResourceId());
    }

    @Test
    void shouldQueryAuditEvents() {
        Page<AuditEvent> mockPage = new PageImpl<>(
                List.of(AuditEvent.builder().id(1L).action(AuditAction.USER_LOGIN).build()),
                PageRequest.of(0, 10),
                1
        );
        when(auditEventRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class))).thenReturn(mockPage);

        Page<AuditEvent> result = auditService.getEvents(PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(AuditAction.USER_LOGIN, result.getContent().get(0).getAction());
    }

    @Test
    void shouldQueryEventsByAction() {
        Page<AuditEvent> mockPage = new PageImpl<>(
                List.of(
                        AuditEvent.builder().id(1L).action(AuditAction.TRANSACTION_FLAGGED).build(),
                        AuditEvent.builder().id(2L).action(AuditAction.TRANSACTION_FLAGGED).build()
                ),
                PageRequest.of(0, 10),
                2
        );
        when(auditEventRepository.findByActionOrderByCreatedAtDesc(eq(AuditAction.TRANSACTION_FLAGGED), any(Pageable.class)))
                .thenReturn(mockPage);

        Page<AuditEvent> result = auditService.getEventsByAction(AuditAction.TRANSACTION_FLAGGED, PageRequest.of(0, 10));

        assertEquals(2, result.getContent().size());
    }

    @Test
    void shouldQueryEventsByResource() {
        Page<AuditEvent> mockPage = new PageImpl<>(
                List.of(AuditEvent.builder().id(1L).resourceType("TRANSACTION").resourceId(100L).build()),
                PageRequest.of(0, 10),
                1
        );
        when(auditEventRepository.findByResourceTypeAndResourceIdOrderByCreatedAtDesc(
                eq("TRANSACTION"), eq(100L), any(Pageable.class))).thenReturn(mockPage);

        Page<AuditEvent> result = auditService.getEventsByResource("TRANSACTION", 100L, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(100L, result.getContent().get(0).getResourceId());
    }
}
