package com.securetransact.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieHelper {

    public static final String COOKIE_NAME = "AUTH_TOKEN";

    private final boolean secure;
    private final String sameSite;
    private final long expirationMs;

    public AuthCookieHelper(
            @Value("${app.cookie.secure:true}") boolean secure,
            @Value("${app.cookie.same-site:lax}") String sameSite,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.expirationMs = expirationMs;
    }

    public ResponseCookie buildAuthCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMillis(expirationMs))
                .build();
    }

    public ResponseCookie clearAuthCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }
}
