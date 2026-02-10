package com.cokmall.core.exception;

/**
 * Exception thrown when a requested resource is not found.
 * 
 * <p>This exception results in a 404 HTTP status code.
 * Used for scenarios like:
 * <ul>
 *   <li>User not found by ID or email</li>
 *   <li>Product not found</li>
 *   <li>Order not found</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructs a new ResourceNotFoundException with the specified message.
     * 
     * @param message Detailed message about the missing resource
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new ResourceNotFoundException with message and cause.
     * 
     * @param message Detailed message about the missing resource
     * @param cause The underlying cause
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
