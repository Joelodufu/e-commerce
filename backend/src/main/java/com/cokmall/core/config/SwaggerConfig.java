package com.cokmall.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI 3.0 configuration for comprehensive API documentation.
 * 
 * <p>Provides interactive API documentation accessible at:
 * <ul>
 *   <li>/swagger-ui.html - Swagger UI interface</li>
 *   <li>/api-docs - OpenAPI JSON specification</li>
 * </ul>
 * 
 * <p>Features:
 * <ul>
 *   <li>JWT Bearer authentication scheme</li>
 *   <li>Request/response examples</li>
 *   <li>Error response documentation</li>
 *   <li>Security requirements per endpoint</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Configuration
public class SwaggerConfig {
    
    /**
     * Configures OpenAPI documentation with JWT authentication.
     * 
     * @return OpenAPI configuration
     */
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
                .info(new Info()
                        .title("COK Mall E-Commerce API")
                        .version("1.0.0")
                        .description("""
                                RESTful API for COK Mall e-commerce platform with enterprise-grade security.
                                
                                ## Features
                                - JWT-based authentication with refresh tokens
                                - Role-based access control (USER, ADMIN)
                                - Product management
                                - Shopping cart and checkout
                                - Order tracking
                                - In-app wallet system
                                - Admin settings management
                                
                                ## Authentication
                                1. Register or login to obtain JWT tokens
                                2. Click 'Authorize' button and enter: `Bearer <your-access-token>`
                                3. All protected endpoints will include the token automatically
                                
                                ## Security
                                - BCrypt password hashing
                                - Rate limiting (100 req/min)
                                - CORS protection
                                - Input validation
                                - Audit logging
                                """)
                        .contact(new Contact()
                                .name("COK Mall Development Team")
                                .email("support@cokmall.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://cokmall.com/license")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token obtained from /api/auth/login")));
    }
}
