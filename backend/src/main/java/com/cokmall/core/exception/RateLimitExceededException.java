package com.cokmall.core.exception;

/**
 * Exception thrown when rate limit is exceeded.
 * 
 * <p>This exception results in a 429 HTTP status code.
 * Indicates that the user has sent too many requests in a given time period.
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
public class RateLimitExceededException extends RuntimeException {
    
    /**
     * Constructs a new RateLimitExceededException with the specified message.
     * 
     * @param message Detailed message about the rate limit
     */
    public RateLimitExceededException(String message) {
        super(message);
    }
}
