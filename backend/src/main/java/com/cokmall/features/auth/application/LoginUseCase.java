package com.cokmall.features.auth.application;

import com.cokmall.core.exception.UnauthorizedException;
import com.cokmall.core.security.JwtService;
import com.cokmall.features.auth.api.dto.LoginRequest;
import com.cokmall.features.auth.domain.AuthToken;
import com.cokmall.features.auth.domain.User;
import com.cokmall.features.auth.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Use case for authenticating users and generating JWT tokens.
 * 
 * <p>
 * This use case implements secure login with:
 * <ul>
 * <li>BCrypt password verification</li>
 * <li>Account lockout after 5 failed attempts</li>
 * <li>Audit logging of all login attempts</li>
 * <li>JWT token generation (access + refresh)</li>
 * </ul>
 * 
 * <p>
 * <b>Security Features:</b>
 * <ul>
 * <li>Failed attempt tracking and account lockout</li>
 * <li>Secure password comparison (constant-time)</li>
 * <li>Audit logging for compliance</li>
 * <li>Generic error messages to prevent user enumeration</li>
 * </ul>
 * 
 * <p>
 * <b>Example Usage:</b>
 * 
 * <pre>
 * LoginRequest request = new LoginRequest("user@example.com", "password123");
 * AuthToken tokens = loginUseCase.execute(request);
 * </pre>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Authenticates a user and generates JWT tokens.
     * 
     * <p>
     * <b>Security Features:</b>
     * <ul>
     * <li>Account lockout after 5 failed attempts</li>
     * <li>Audit logging of all login attempts</li>
     * <li>Password verification using BCrypt</li>
     * <li>Generates access token (15min) + refresh token (7 days)</li>
     * </ul>
     * 
     * @param request Login credentials (email, password)
     * @return AuthToken containing access and refresh tokens
     * @throws UnauthorizedException if credentials are invalid or account is locked
     */
    @Transactional
    public AuthToken execute(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - {}", request.getEmail());
                    // Generic message to prevent user enumeration
                    return new UnauthorizedException("Invalid email or password");
                });

        // Check if account is locked
        if (user.getAccountLocked()) {
            log.warn("Login failed: Account locked - {}", request.getEmail());
            throw new UnauthorizedException(
                    "Account is locked due to too many failed login attempts. Please contact support.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Increment failed attempts
            user.incrementFailedAttempts();
            userRepository.save(user);

            log.warn("Login failed: Invalid password - {} (Failed attempts: {})",
                    request.getEmail(), user.getFailedLoginAttempts());

            // Generic message to prevent user enumeration
            throw new UnauthorizedException("Invalid email or password");
        }

        // Reset failed attempts on successful login
        user.resetFailedAttempts();
        userRepository.save(user);

        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        log.info("Login successful for user: {} [userId={}]", user.getEmail(), user.getId());

        return AuthToken.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
