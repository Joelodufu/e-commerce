# COK Mall E-Commerce Backend

Enterprise-grade Spring Boot backend with iron-clad security and clean architecture.

## 🚀 Features

### ✅ Implemented
- **Authentication System**
  - User registration with email/password validation
  - Login with JWT tokens (access + refresh)
  - Account lockout after 5 failed attempts
  - BCrypt password hashing (strength 12)
  - Audit logging for all authentication events

### 🔒 Security (OWASP Top 10 Compliant)
- JWT-based stateless authentication
- BCrypt password hashing
- Account lockout mechanism
- Input validation (Bean Validation)
- CORS whitelist configuration
- Security headers (XSS, clickjacking, MIME-sniffing protection)
- Role-based access control (USER, ADMIN)
- Comprehensive audit logging with correlation IDs
- Generic error messages to prevent information disclosure

### 📚 API Documentation
- Swagger/OpenAPI 3.0 at `/swagger-ui.html`
- Interactive API testing
- Comprehensive endpoint documentation

## 🛠️ Technology Stack

- **Framework:** Spring Boot 3.2.2
- **Language:** Java 17
- **Database:** PostgreSQL
- **Security:** Spring Security + JWT (jjwt 0.12.5)
- **Documentation:** SpringDoc OpenAPI 2.3.0
- **Build Tool:** Maven
- **Utilities:** Lombok, MapStruct

## 📁 Project Structure

```
backend/
├── src/main/java/com/cokmall/
│   ├── CokmallApplication.java          # Main application class
│   │
│   ├── core/                             # Core infrastructure
│   │   ├── config/
│   │   │   ├── SecurityConfig.java       # Security configuration
│   │   │   └── SwaggerConfig.java        # API documentation
│   │   ├── security/
│   │   │   ├── JwtService.java           # JWT token management
│   │   │   └── JwtAuthenticationFilter.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── Custom exceptions...
│   │   └── result/
│   │       └── ApiResponse.java          # Standard API response
│   │
│   └── features/                         # Feature modules
│       └── auth/                         # Authentication feature
│           ├── domain/                   # Entities & repositories
│           │   ├── User.java
│           │   ├── AuthToken.java
│           │   └── UserRepository.java
│           ├── application/              # Use cases (business logic)
│           │   ├── LoginUseCase.java
│           │   └── RegisterUseCase.java
│           ├── infrastructure/           # JPA implementations
│           │   └── JpaUserRepository.java
│           └── api/                      # REST controllers & DTOs
│               ├── AuthController.java
│               └── dto/
│                   ├── LoginRequest.java
│                   ├── RegisterRequest.java
│                   └── AuthResponse.java
```

## ⚙️ Configuration

### Database Setup
1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE cok_mall;
   ```

### Application Properties
Located in `src/main/resources/application.properties`:
- Database: `cok_mall` on `localhost:5432`
- JWT secret: Configured (change for production)
- CORS: Configured for `localhost:3000` and `localhost:5173`

### Development Profile
Use `application-dev.properties` for development with:
- SQL logging enabled
- Debug logging
- Relaxed CORS

## 🚀 Running the Application

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### Build
```bash
mvn clean compile
```

### Run
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The application will start on `http://localhost:8080`

## 📖 API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login and get JWT tokens

### Documentation
- **GET** `/swagger-ui.html` - Interactive API documentation
- **GET** `/api-docs` - OpenAPI JSON specification

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@$!%*?&)

### JWT Tokens
- **Access Token:** 15 minutes expiry
- **Refresh Token:** 7 days expiry
- **Algorithm:** HS256

### Account Lockout
- Locks after 5 failed login attempts
- Prevents brute-force attacks
- Requires admin intervention to unlock

## 📝 Code Quality

### Documentation
- Comprehensive JavaDoc for all public APIs
- Inline comments for complex logic
- Clean code principles (SOLID, DRY, KISS)

### Error Handling
- Global exception handler
- Correlation IDs for request tracking
- Security-aware logging (no sensitive data)
- Standardized error responses

## 🧪 Testing

### Swagger UI Testing
1. Start the application
2. Navigate to `http://localhost:8080/swagger-ui.html`
3. Test endpoints interactively

### Example Registration
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Example Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

## 📦 Next Features (Planned)
- Product Management (CRUD with images)
- Shopping Cart
- Order Management
- Wallet System
- Admin Settings

## 👨‍💻 Development Team
COK Mall Development Team

## 📄 License
Proprietary

---

**Built with enterprise-grade security and clean architecture principles.**
