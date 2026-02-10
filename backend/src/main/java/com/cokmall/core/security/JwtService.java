package com.cokmall.core.security;

import com.cokmall.core.exception.UnauthorizedException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * Service for JWT token generation, validation, and claims extraction.
 * 
 * <p>
 * This service implements secure JWT handling with:
 * <ul>
 * <li>HS256 algorithm for token signing</li>
 * <li>Configurable token expiry (access: 15min, refresh: 7 days)</li>
 * <li>Unique token ID (jti) for blacklisting support</li>
 * <li>User ID and email in claims</li>
 * <li>Role-based authorization support</li>
 * </ul>
 * 
 * <p>
 * <b>Security Features:</b>
 * <ul>
 * <li>Strong secret key (min 256 bits)</li>
 * <li>Token expiry validation</li>
 * <li>Signature verification</li>
 * <li>Audit logging for token operations</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Slf4j
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    /**
     * Generates an access token for authenticated user.
     * 
     * <p>
     * Access tokens are short-lived (15 minutes) and used for API authentication.
     * 
     * @param userId User's unique identifier
     * @param email  User's email address
     * @param role   User's role (USER, ADMIN)
     * @return JWT access token
     */
    public String generateAccessToken(Long userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        claims.put("type", "access");

        String token = createToken(claims, email, accessTokenExpiry);
        log.debug("Generated access token for user: {} [userId={}]", email, userId);
        return token;
    }

    /**
     * Generates a refresh token for token renewal.
     * 
     * <p>
     * Refresh tokens are long-lived (7 days) and used to obtain new access tokens
     * without requiring the user to log in again.
     * 
     * @param userId User's unique identifier
     * @param email  User's email address
     * @return JWT refresh token
     */
    public String generateRefreshToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("type", "refresh");

        String token = createToken(claims, email, refreshTokenExpiry);
        log.debug("Generated refresh token for user: {} [userId={}]", email, userId);
        return token;
    }

    /**
     * Creates a JWT token with specified claims and expiry.
     * 
     * @param claims       Custom claims to include in token
     * @param subject      Token subject (typically email)
     * @param expiryMillis Token expiry in milliseconds
     * @return Signed JWT token
     */
    private String createToken(Map<String, Object> claims, String subject, long expiryMillis) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMillis);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setId(UUID.randomUUID().toString()) // Unique token ID for blacklisting
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the email (subject) from a JWT token.
     * 
     * @param token JWT token
     * @return Email address
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the user ID from a JWT token.
     * 
     * @param token JWT token
     * @return User ID
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extracts the role from a JWT token.
     * 
     * @param token JWT token
     * @return User role
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extracts the token type (access/refresh) from a JWT token.
     * 
     * @param token JWT token
     * @return Token type
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Extracts the expiration date from a JWT token.
     * 
     * @param token JWT token
     * @return Expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method to extract a claim from a JWT token.
     * 
     * @param <T>            Type of claim value
     * @param token          JWT token
     * @param claimsResolver Function to extract specific claim
     * @return Claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from a JWT token.
     * 
     * <p>
     * Validates token signature and expiry during extraction.
     * 
     * @param token JWT token
     * @return All claims
     * @throws UnauthorizedException if token is invalid or expired
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            throw new UnauthorizedException("Token has expired");
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
            throw new UnauthorizedException("Invalid token format");
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            throw new UnauthorizedException("Invalid token signature");
        } catch (Exception e) {
            log.error("Error parsing JWT token", e);
            throw new UnauthorizedException("Token validation failed");
        }
    }

    /**
     * Checks if a token is expired.
     * 
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validates a token against user details.
     * 
     * @param token       JWT token
     * @param userDetails User details from database
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        boolean isValid = email.equals(userDetails.getUsername()) && !isTokenExpired(token);

        if (!isValid) {
            log.warn("Token validation failed for user: {}", email);
        }

        return isValid;
    }

    /**
     * Validates a token without user details (for refresh tokens).
     * 
     * @param token JWT token
     * @return true if valid and not expired, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Gets the signing key for JWT operations.
     * 
     * @return Secret key for signing
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
