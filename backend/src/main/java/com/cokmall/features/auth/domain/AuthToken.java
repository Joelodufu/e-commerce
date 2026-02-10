package com.cokmall.features.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Value object containing JWT access and refresh tokens.
 * 
 * <p>
 * Returned to clients after successful authentication.
 * Contains both short-lived access token and long-lived refresh token.
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthToken {

    /**
     * Short-lived access token (15 minutes).
     * Used for API authentication.
     */
    private String accessToken;

    /**
     * Long-lived refresh token (7 days).
     * Used to obtain new access tokens without re-authentication.
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
}
