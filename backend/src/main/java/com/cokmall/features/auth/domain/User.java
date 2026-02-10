package com.cokmall.features.auth.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * User entity representing a registered user in the system.
 * 
 * <p>
 * This entity stores user authentication and profile information with:
 * <ul>
 * <li>Secure password storage (BCrypt hashed)</li>
 * <li>Role-based access control (USER, ADMIN)</li>
 * <li>Account lockout mechanism for security</li>
 * <li>Automatic timestamp tracking</li>
 * </ul>
 * 
 * <p>
 * <b>Security Features:</b>
 * <ul>
 * <li>Password never stored in plaintext</li>
 * <li>Failed login attempt tracking</li>
 * <li>Account lockout after 5 failed attempts</li>
 * <li>Audit timestamps for compliance</li>
 * </ul>
 * 
 * @author COK Mall Development Team
 * @version 1.0.0
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email", columnList = "email", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /**
     * Unique identifier for the user.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User's email address (unique, used for login).
     */
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /**
     * BCrypt hashed password (never store plaintext).
     */
    @Column(nullable = false, length = 255)
    private String passwordHash;

    /**
     * User's role for authorization (USER, ADMIN).
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "USER";

    /**
     * Number of consecutive failed login attempts.
     * Reset to 0 on successful login.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    /**
     * Whether the account is locked due to too many failed login attempts.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean accountLocked = false;

    /**
     * Timestamp when the user was created.
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the user was last updated.
     */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Increments failed login attempts and locks account if threshold reached.
     */
    public void incrementFailedAttempts() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            this.accountLocked = true;
        }
    }

    /**
     * Resets failed login attempts on successful login.
     */
    public void resetFailedAttempts() {
        this.failedLoginAttempts = 0;
        this.accountLocked = false;
    }
}
