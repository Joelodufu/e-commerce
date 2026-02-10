package com.cokmall.core.security;

import com.cokmall.core.exception.UnauthorizedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT authentication filter for validating and processing JWT tokens.
 * 
 * <p>This filter intercepts all HTTP requests and:
 * <ul>
 *   <li>Extracts JWT token from Authorization header</li>
 *   <li>Validates token signature and expiry</li>
 *   <li>Sets Spring Security context for authenticated requests</li>
 *   <li>Logs authentication attempts for audit trail</li>
 * </ul>
 * 
 * <p><b>Security Features:</b>
 * <ul>
 *   <li>Bearer token extraction</li>
 *   <li>Token validation before setting context</li>
 *   <li>Role-based authorization support</li>
 *   <li>Audit logging for failed authentications</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    
    /**
     * Filters incoming requests to validate JWT tokens.
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain Filter chain
     * @throws ServletException if servlet error occurs
     * @throws IOException if I/O error occurs
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // Extract Authorization header
        final String authHeader = request.getHeader("Authorization");
        
        // Skip if no Authorization header or not Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extract token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            
            // Extract user email from token
            final String userEmail = jwtService.extractEmail(jwt);
            
            // If email extracted and no authentication in context yet
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Validate token
                if (jwtService.validateToken(jwt)) {
                    
                    // Extract user details from token
                    Long userId = jwtService.extractUserId(jwt);
                    String role = jwtService.extractRole(jwt);
                    
                    // Create authentication token with role
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    
                    // Set additional details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("Authenticated user: {} [userId={}, role={}]", userEmail, userId, role);
                }
            }
        } catch (UnauthorizedException e) {
            // Log failed authentication attempt
            log.warn("JWT authentication failed: {}", e.getMessage());
            // Don't set authentication - request will be treated as unauthenticated
        } catch (Exception e) {
            // Log unexpected errors
            log.error("Unexpected error during JWT authentication", e);
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
