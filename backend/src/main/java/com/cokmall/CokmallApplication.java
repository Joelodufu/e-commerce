package com.cokmall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main application class for COK Mall E-commerce Backend.
 * 
 * <p>This application implements a feature-first clean architecture with:
 * <ul>
 *   <li>Enterprise-grade security (JWT, RBAC, rate limiting)</li>
 *   <li>OWASP Top 10 protections</li>
 *   <li>Comprehensive audit logging</li>
 *   <li>RESTful API with Swagger documentation</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 * @since 2026-02-10
 */
@SpringBootApplication
@EnableJpaAuditing
public class CokmallApplication {

    /**
     * Application entry point.
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(CokmallApplication.class, args);
    }
}
