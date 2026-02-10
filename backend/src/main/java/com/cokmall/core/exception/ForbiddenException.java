package com.cokmall.core.exception;

/**
 * Exception thrown when user lacks permission for an action.
 * 
 * <p>This exception results in a 403 HTTP status code.
 * Used for scenarios like:
 * <ul>
 *   <li>Non-admin trying to access admin endpoints</li>
 *   <li>User trying to access another user's data</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
public class ForbiddenException extends RuntimeException {
    
    /**
     * Constructs a new ForbiddenException with the specified message.
     * 
     * @param message Detailed message about the permission denial
     */
    public ForbiddenException(String message) {
        super(message);
    }
}
