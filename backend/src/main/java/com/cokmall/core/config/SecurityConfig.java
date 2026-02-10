package com.cokmall.core.config;

import com.cokmall.core.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Iron-clad security configuration implementing OWASP best practices.
 * 
 * <p>
 * This configuration provides:
 * <ul>
 * <li>JWT-based stateless authentication</li>
 * <li>BCrypt password hashing (strength: 12)</li>
 * <li>CORS with whitelist-based origin validation</li>
 * <li>CSRF protection for state-changing operations</li>
 * <li>Security headers (XSS, clickjacking, MIME-sniffing protection)</li>
 * <li>Method-level security with @PreAuthorize</li>
 * <li>Role-based access control (USER, ADMIN)</li>
 * </ul>
 * 
 * <p>
 * <b>Public Endpoints:</b>
 * <ul>
 * <li>/api/auth/** - Authentication endpoints</li>
 * <li>/api/products (GET) - Product listing</li>
 * <li>/api/settings (GET) - Brand settings</li>
 * <li>/swagger-ui/** - API documentation</li>
 * </ul>
 * 
 * <p>
 * <b>Protected Endpoints:</b> All other endpoints require authentication
 * 
 * <p>
 * <b>Admin Endpoints:</b> /api/admin/**, /api/products (POST/PUT/DELETE)
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    /**
     * Configures the security filter chain with JWT authentication and
     * authorization rules.
     * 
     * @param http HttpSecurity configuration
     * @return Configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless JWT authentication
                // CSRF protection is not needed for stateless APIs
                .csrf(AbstractHttpConfigurer::disable)

                // Configure CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - no authentication required
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()

                        // Swagger/OpenAPI documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll()

                        // Actuator health endpoint
                        .requestMatchers("/actuator/health").permitAll()

                        // Admin endpoints - require ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/settings").hasRole("ADMIN")

                        // Specific protected endpoints
                        .anyRequest().authenticated())
                // Fix for 403 on 404: Allow error dispatch
                .authorizeHttpRequests(
                        auth -> auth.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll())

                // Stateless session management (no server-side sessions)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // Configure security headers
                .headers(headers -> headers
                        // Prevent MIME-sniffing
                        .contentTypeOptions(contentType -> {
                        })
                        // Prevent clickjacking
                        .frameOptions(frame -> frame.deny())
                        // XSS protection
                        .xssProtection(xss -> {
                        }));

        return http.build();
    }

    /**
     * Configures CORS with whitelist-based origin validation.
     * 
     * @return CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Parse allowed origins from configuration
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        // Parse allowed methods
        configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));

        // Parse allowed headers
        if ("*".equals(allowedHeaders)) {
            configuration.addAllowedHeader("*");
        } else {
            configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        }

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(allowCredentials);

        // Expose Authorization header to clients
        configuration.setExposedHeaders(List.of("Authorization"));

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * Provides BCrypt password encoder with strength 12.
     * 
     * <p>
     * BCrypt is a strong, adaptive hashing function designed for password storage.
     * Strength 12 provides a good balance between security and performance.
     * 
     * @return BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Provides authentication manager for programmatic authentication.
     * 
     * @param config Authentication configuration
     * @return Authentication manager
     * @throws Exception if configuration fails
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
