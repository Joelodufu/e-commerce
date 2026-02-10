package com.cokmall.features.auth.application;

import com.cokmall.core.exception.UnauthorizedException;
import com.cokmall.core.security.JwtService;
import com.cokmall.features.auth.api.dto.RegisterRequest;
import com.cokmall.features.auth.domain.AuthToken;
import com.cokmall.features.auth.domain.User;
import com.cokmall.features.auth.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

/**
 * Use case for registering new users.
 * 
 * <p>
 * This use case implements secure user registration with:
 * <ul>
 * <li>Email format validation</li>
 * <li>Password strength requirements</li>
 * <li>Duplicate email prevention</li>
 * <li>BCrypt password hashing (12 rounds)</li>
 * <li>Audit logging</li>
 * </ul>
 * 
 * <p>
 * <b>Password Requirements:</b>
 * <ul>
 * <li>Minimum 8 characters</li>
 * <li>At least one uppercase letter</li>
 * <li>At least one lowercase letter</li>
 * <li>At least one digit</li>
 * <li>At least one special character</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    // Password strength pattern (min 8 chars, uppercase, lowercase, digit, special
    // char)
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

    /**
     * Registers a new user with validation and security checks.
     * 
     * @param request Registration details (email, password)
     * @return AuthToken containing access and refresh tokens
     * @throws UnauthorizedException if validation fails or email already exists
     */
    @Transactional
    public AuthToken execute(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // Validate email format
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            log.warn("Registration failed: Invalid email format - {}", request.getEmail());
            throw new UnauthorizedException("Invalid email format");
        }

        // Validate password strength
        if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            log.warn("Registration failed: Weak password - {}", request.getEmail());
            throw new UnauthorizedException(
                    "Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new UnauthorizedException("Email already registered");
        }

        // Hash password using BCrypt (strength 12)
        String passwordHash = passwordEncoder.encode(request.getPassword());

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .role("USER") // Default role
                .failedLoginAttempts(0)
                .accountLocked(false)
                .build();

        // Save user to database
        user = userRepository.save(user);

        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        log.info("Registration successful for user: {} [userId={}]", user.getEmail(), user.getId());

        return AuthToken.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
