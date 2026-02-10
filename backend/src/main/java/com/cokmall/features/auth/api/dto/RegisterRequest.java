package com.cokmall.features.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for user registration requests.
 * 
 * <p>
 * Contains user registration details with validation constraints.
 * 
 * <p>
 * <b>Password Requirements:</b>
 * <ul>
 * <li>Minimum 8 characters</li>
 * <li>At least one uppercase letter</li>
 * <li>At least one lowercase letter</li>
 * <li>At least one digit</li>
 * <li>At least one special character (@$!%*?&)</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    /**
     * User's email address (must be unique).
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * User's password (must meet strength requirements).
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Password must contain uppercase, lowercase, digit, and special character")
    private String password;
}
