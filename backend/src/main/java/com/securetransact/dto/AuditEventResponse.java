package com.securetransact.dto;

import com.securetransact.model.AuditAction;
import com.securetransact.model.AuditEvent;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditEventResponse {
    private Long id;
    private Long actorUserId;
    private String actorName;
    private AuditAction action;
    private String resourceType;
    private Long resourceId;
    private String metadata;
    private String ipAddress;
    private LocalDateTime createdAt;

    public static AuditEventResponse from(AuditEvent event) {
        AuditEventResponse response = new AuditEventResponse();
        response.setId(event.getId());
        response.setAction(event.getAction());
        response.setResourceType(event.getResourceType());
        response.setResourceId(event.getResourceId());
        response.setMetadata(event.getMetadata());
        response.setIpAddress(event.getIpAddress());
        response.setCreatedAt(event.getCreatedAt());

        if (event.getActor() != null) {
            response.setActorUserId(event.getActor().getId());
            response.setActorName(event.getActor().getFirstName() + " " + event.getActor().getLastName());
        }

        return response;
    }
}
