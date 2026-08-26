package com.securetransact.audit;

import com.securetransact.model.User;
import com.securetransact.security.CustomUserDetails;
import com.securetransact.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditService auditService;

    @Around("@annotation(com.securetransact.audit.Auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);

        Object result = joinPoint.proceed();

        try {
            User actor = getCurrentActor();
            String resourceId = resolveResourceId(auditable.resourceIdParam(), joinPoint.getArgs(), signature);
            Long resourceIdLong = resourceId != null && !resourceId.isEmpty() ? Long.parseLong(resourceId) : null;
            String ipAddress = getClientIp();
            String userAgent = getClientUserAgent();

            String metadata = auditable.description();
            if (metadata == null || metadata.isEmpty()) {
                metadata = method.getDeclaringClass().getSimpleName() + "." + method.getName();
            }

            auditService.recordEvent(
                    auditable.action(),
                    auditable.resourceType(),
                    resourceIdLong,
                    metadata,
                    actor,
                    ipAddress,
                    userAgent
            );
        } catch (Exception e) {
            log.warn("Failed to record audit event: {}", e.getMessage());
        }

        return result;
    }

    private User getCurrentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser();
        }
        return null;
    }

    private String resolveResourceId(String paramName, Object[] args, MethodSignature signature) {
        if (paramName.isEmpty()) return null;

        String[] paramNames = signature.getParameterNames();
        for (int i = 0; i < paramNames.length; i++) {
            if (paramNames[i].equals(paramName) && args[i] != null) {
                return args[i].toString();
            }
        }
        return null;
    }

    private String getClientIp() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return "unknown";
    }

    private String getClientUserAgent() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            return attrs.getRequest().getHeader("User-Agent");
        }
        return "unknown";
    }
}
