package com.cokmall.core.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Generic API response wrapper for consistent response structure across all endpoints.
 * 
 * <p>All API endpoints return responses in this format for consistency
 * and easier client-side handling. This wrapper includes:
 * <ul>
 *   <li>Success/failure status</li>
 *   <li>Human-readable message</li>
 *   <li>Response data (generic type)</li>
 *   <li>Timestamp for debugging</li>
 *   <li>Correlation ID for request tracking</li>
 * </ul>
 * 
 * <p><b>Example Usage:</b>
 * <pre>
 * return ApiResponse.&lt;UserDTO&gt;builder()
 *     .success(true)
 *     .message("User retrieved successfully")
 *     .data(userDTO)
 *     .build();
 * </pre>
 * 
 * @param <T> Type of data being returned
 * @author COK Mall Development Team
 * @version 1.0.0
 * @since 2026-02-10
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    /**
     * Indicates whether the request was successful.
     */
    private boolean success;
    
    /**
     * Human-readable message describing the result.
     */
    private String message;
    
    /**
     * The actual response data. Null if request failed.
     */
    private T data;
    
    /**
     * Timestamp when the response was generated.
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    /**
     * Unique correlation ID for request tracking across logs.
     * Useful for debugging and audit trails.
     */
    private String correlationId;
    
    /**
     * Creates a successful response with data.
     * 
     * @param <T> Type of data
     * @param message Success message
     * @param data Response data
     * @return ApiResponse with success=true
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
    
    /**
     * Creates a successful response without data.
     * 
     * @param <T> Type of data
     * @param message Success message
     * @return ApiResponse with success=true and null data
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }
    
    /**
     * Creates an error response.
     * 
     * @param <T> Type of data
     * @param message Error message
     * @return ApiResponse with success=false
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
