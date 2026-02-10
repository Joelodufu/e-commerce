package com.cokmall.features.auth.api;

import com.cokmall.core.result.ApiResponse;
import com.cokmall.features.auth.api.dto.AuthResponse;
import com.cokmall.features.auth.api.dto.LoginRequest;
import com.cokmall.features.auth.api.dto.RegisterRequest;
import com.cokmall.features.auth.application.LoginUseCase;
import com.cokmall.features.auth.application.RegisterUseCase;
import com.cokmall.features.auth.domain.AuthToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * 
 * <p>
 * Provides endpoints for:
 * <ul>
 * <li>User registration</li>
 * <li>User login</li>
 * </ul>
 * 
 * <p>
 * <b>Security:</b> These endpoints are public (no authentication required).
 * Rate limiting applies: 10 requests per minute per IP.
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and registration endpoints")
public class AuthController {

    private final LoginUseCase loginUseCase;
    private final RegisterUseCase registerUseCase;

    /**
     * Registers a new user account.
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
     * @param request Registration details (email, password)
     * @return ApiResponse containing JWT tokens
     */
    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Creates a new user account with email and password. Returns JWT tokens for immediate authentication.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Registration successful", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error (invalid email/password format)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Email already registered")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - Registration request for: {}", request.getEmail());

        // Execute registration use case
        AuthToken authToken = registerUseCase.execute(request);

        // Build response
        AuthResponse response = AuthResponse.builder()
                .accessToken(authToken.getAccessToken())
                .refreshToken(authToken.getRefreshToken())
                .tokenType(authToken.getTokenType())
                .expiresIn(authToken.getExpiresIn())
                .email(request.getEmail())
                .role("USER")
                .build();

        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    /**
     * Authenticates a user and returns JWT tokens.
     * 
     * <p>
     * <b>Security:</b>
     * <ul>
     * <li>Account locked after 5 failed attempts</li>
     * <li>All attempts logged for audit</li>
     * </ul>
     * 
     * @param request Login credentials (email, password)
     * @return ApiResponse containing JWT tokens
     */
    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user with email and password. Returns JWT access token (15min) and refresh token (7 days).")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials or account locked")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - Login request for: {}", request.getEmail());

        // Execute login use case
        AuthToken authToken = loginUseCase.execute(request);

        // Build response (email and role will be extracted from token in real scenario)
        AuthResponse response = AuthResponse.builder()
                .accessToken(authToken.getAccessToken())
                .refreshToken(authToken.getRefreshToken())
                .tokenType(authToken.getTokenType())
                .expiresIn(authToken.getExpiresIn())
                .email(request.getEmail())
                .role("USER") // In production, extract from token or database
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
