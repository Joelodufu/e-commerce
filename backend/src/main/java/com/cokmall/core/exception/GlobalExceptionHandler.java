package com.cokmall.core.exception;

import com.cokmall.core.result.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Global exception handler for centralized error handling across all controllers.
 * 
 * <p>This handler ensures:
 * <ul>
 *   <li>Consistent error response format</li>
 *   <li>Appropriate HTTP status codes</li>
 *   <li>Security-aware logging (no sensitive data)</li>
 *   <li>Correlation IDs for debugging</li>
 *   <li>No stack traces in production</li>
 * </ul>
 * 
 * <p><b>Security Note:</b> Generic exceptions return minimal information to prevent
 * information disclosure. Detailed errors are logged server-side with correlation IDs.
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * Handles ResourceNotFoundException (404).
     * 
     * @param ex The exception
     * @param request The web request
     * @return ResponseEntity with 404 status
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex,
            WebRequest request) {
        
        String correlationId = generateCorrelationId();
        log.warn("Resource not found [correlationId={}]: {}", correlationId, ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .correlationId(correlationId)
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    /**
     * Handles UnauthorizedException (401).
     * 
     * @param ex The exception
     * @param request The web request
     * @return ResponseEntity with 401 status
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(
            UnauthorizedException ex,
            WebRequest request) {
        
        String correlationId = generateCorrelationId();
        log.warn("Unauthorized access attempt [correlationId={}]: {}", correlationId, ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .correlationId(correlationId)
                .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    /**
     * Handles ForbiddenException and Spring Security AccessDeniedException (403).
     * 
     * @param ex The exception
     * @param request The web request
     * @return ResponseEntity with 403 status
     */
    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class})
    public ResponseEntity<ApiResponse<Void>> handleForbidden(
            Exception ex,
            WebRequest request) {
        
        String correlationId = generateCorrelationId();
        log.warn("Forbidden access attempt [correlationId={}]: {}", correlationId, ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("Access denied")
                .correlationId(correlationId)
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    /**
     * Handles RateLimitExceededException (429).
     * 
     * @param ex The exception
     * @param request The web request
     * @return ResponseEntity with 429 status
     */
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleRateLimitExceeded(
            RateLimitExceededException ex,
            WebRequest request) {
        
        String correlationId = generateCorrelationId();
        log.warn("Rate limit exceeded [correlationId={}]: {}", correlationId, ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .correlationId(correlationId)
                .build();
        
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }
    
    /**
     * Handles validation errors from @Valid annotations (400).
     * 
     * <p>Returns a map of field names to error messages for client-side display.
     * 
     * @param ex The validation exception
     * @param request The web request
     * @return ResponseEntity with 400 status and field errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex,
            WebRequest request) {
        
        String correlationId = generateCorrelationId();
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        log.warn("Validation error [correlationId={}]: {}", correlationId, errors);
        
        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .correlationId(correlationId)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    /**
     * Handles all other exceptions (500).
     * 
     * <p><b>Security:</b> Returns generic message to client. Full details logged server-side.
     * 
     * @param ex The exception
     * @param request The web request
     * @return ResponseEntity with 500 status
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex,
            WebRequest request) {
        
        String correlationId = generateCorrelationId();
        
        // Log full exception details server-side
        log.error("Internal server error [correlationId={}]", correlationId, ex);
        
        // Return generic message to client (security best practice)
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("An internal error occurred. Please contact support with correlation ID: " + correlationId)
                .correlationId(correlationId)
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    /**
     * Generates a unique correlation ID for request tracking.
     * 
     * @return UUID string
     */
    private String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }
}
