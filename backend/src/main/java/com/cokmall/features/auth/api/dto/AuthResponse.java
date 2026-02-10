package com.cokmall.features.auth.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for authentication responses.
 * 
 * <p>
 * Contains JWT tokens and user information returned after successful
 * authentication.
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * Short-lived access token (15 minutes).
     */
    private String accessToken;

    /**
     * Long-lived refresh token (7 days).
     */
    private String refreshToken;

    /**
     * Token type (always "Bearer").
     */
    @Builder.Default
    private String tokenType = "Bearer";

    /**
     * Access token expiry in seconds (900 = 15 minutes).
     */
    @Builder.Default
    private Long expiresIn = 900L;

    /**
     * User's email address.
     */
    private String email;

    /**
     * User's role (USER, ADMIN).
     */
    private String role;
}
