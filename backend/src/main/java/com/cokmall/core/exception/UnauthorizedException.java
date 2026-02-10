package com.cokmall.core.exception;

/**
 * Exception thrown when authentication fails or user is unauthorized.
 * 
 * <p>This exception results in a 401 HTTP status code.
 * Used for scenarios like:
 * <ul>
 *   <li>Invalid credentials</li>
 *   <li>Expired or invalid JWT token</li>
 *   <li>Account locked</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
public class UnauthorizedException extends RuntimeException {
    
    /**
     * Constructs a new UnauthorizedException with the specified message.
     * 
     * @param message Detailed message about the authorization failure
     */
    public UnauthorizedException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new UnauthorizedException with message and cause.
     * 
     * @param message Detailed message about the authorization failure
     * @param cause The underlying cause
     */
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
