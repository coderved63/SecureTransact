package com.securetransact.controller;

import com.securetransact.dto.AuthResponse;
import com.securetransact.dto.LoginRequest;
import com.securetransact.dto.RegisterRequest;
import com.securetransact.exception.ConflictException;
import com.securetransact.exception.ResourceNotFoundException;
import com.securetransact.model.Role;
import com.securetransact.model.User;
import com.securetransact.repository.UserRepository;
import com.securetransact.security.AuthCookieHelper;
import com.securetransact.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login and logout")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthCookieHelper authCookieHelper;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        String token = tokenProvider.generateToken(authentication);

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.buildAuthCookie(token).toString())
                .body(new AuthResponse(email, user.getRole().name(),
                        user.getFirstName(), user.getLastName()));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and get a session cookie")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieHelper.buildAuthCookie(token).toString())
                .body(new AuthResponse(email, user.getRole().name(),
                        user.getFirstName(), user.getLastName()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and clear the session cookie")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, authCookieHelper.clearAuthCookie().toString());
        return ResponseEntity.noContent().build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
