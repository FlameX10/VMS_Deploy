# VMS Backend - Industry-Level Refactoring

## Overview
The backend has been refactored from a monolithic `index.js` to a professional, scalable architecture following industry best practices.

## New Project Structure

```
VMS-Backend/
├── config/                      # Configuration files
│   ├── database.js             # Database connection (PostgreSQL)
│   └── mailer.js               # Email configuration (Nodemailer)
│
├── controllers/                 # Route handlers & request/response logic
│   ├── authController.js       # Auth endpoints (checkUser, verifyPassword)
│   ├── userController.js       # User management (PA operations)
│   ├── visitorController.js    # Visitor registration & approval
│   ├── meetingController.js    # Meeting management
│   ├── passwordResetController.js  # Password reset logic
│   └── securityGuardController.js  # Security guard operations
│
├── routes/                      # Route definitions
│   ├── authRoutes.js           # Authentication routes
│   ├── userRoutes.js           # User management routes
│   ├── visitorRoutes.js        # Visitor routes
│   ├── meetingRoutes.js        # Meeting routes
│   ├── passwordResetRoutes.js  # Password reset routes
│   └── securityGuardRoutes.js  # Security guard routes
│
├── services/                    # Business logic & database operations
│   ├── authService.js          # Auth business logic
│   ├── userService.js          # User management logic
│   ├── visitorService.js       # Visitor logic
│   ├── meetingService.js       # Meeting logic
│   ├── passwordResetService.js # Password reset logic
│   └── securityGuardService.js # Security guard logic
│
├── middleware/                  # Middleware functions
│   ├── authMiddleware.js       # JWT token verification
│   └── roleMiddleware.js       # Role-based access control
│
├── utils/                       # Utility functions & helpers
│   ├── auth.js                 # JWT token generation/verification
│   ├── validators.js           # Input validation & OTP generation
│   ├── constants.js            # Enums & constants
│   ├── db.js                   # Old database file (deprecated - use config/database.js)
│   └── mailer.js               # Old mailer file (deprecated - use config/mailer.js)
│
├── index.js                     # Main Express app entry point
├── package.json                # Dependencies
└── .env                        # Environment variables
```

## Architecture Benefits

### 1. **Separation of Concerns**
   - **Controllers**: Handle HTTP requests/responses
   - **Services**: Contain business logic and database queries
   - **Routes**: Define API endpoints
   - **Middleware**: Handle cross-cutting concerns (auth, role checks)
   - **Config**: Centralize external service configuration

### 2. **Scalability**
   - Easy to add new features without modifying existing code
   - Clear structure for new developers
   - Each module has a single responsibility

### 3. **Maintainability**
   - Services layer is decoupled from routes
   - Easy to test individual modules
   - Clear error handling patterns
   - Reusable business logic

### 4. **Code Reusability**
   - Services can be called from multiple routes
   - Common utilities in `utils/` folder
   - Middleware can be applied to multiple routes

## Key Features

### Authentication & Authorization
- JWT token generation and verification
- Role-based access control (RBAC)
- Supported roles: `process_admin`, `head_executive (he)`, `security_manager (sm)`, `security_guard (sg)`, `employee`

### User Management
- User creation with pending status
- Approval workflow by Process Admin
- User rejection

### Visitor Management
- Visitor registration validation
- Approval workflow by Security Manager
- Category management

### Meeting Management
- Meeting creation by Head Executive
- Meeting status tracking
- Email notifications to visitors

### Security Guard Operations
- Visitor ID validation
- Check-in/Check-out tracking
- Visitor logs and history

### Password Reset
- OTP generation and verification
- Secure password reset flow

## Endpoint Structure

### Authentication (`authRoutes.js`)
- `POST /checkUser` - Check/create user by email
- `POST /verifyPassword` - Login verification

### User Management (`userRoutes.js`)
- `GET /pa/pending/emp/requests` - Get pending users (PA only)
- `GET /pa/approved/emp/requests` - Get approved users (PA only)
- `PATCH /pa/approve-user/:user_id` - Approve user (PA only)
- `DELETE /pa/reject-user/:user_id` - Reject user (PA only)

### Visitor Management (`visitorRoutes.js`)
- `POST /visitor/register` - Register visitor
- `GET /visitors/pending` - Get pending visitors (SM only)
- `PUT /visitors/:id/approve` - Approve visitor (SM only)
- `PUT /visitors/:id/reject` - Reject visitor (SM only)

### Meeting Management (`meetingRoutes.js`)
- `POST /he/create-meeting` - Create meeting (HE only)
- `GET /he/meetings-status` - Get HE's meetings
- `GET /meetings/details` - Get meeting details (SM only)
- `PUT /meetings/:id/status` - Update meeting status (SM only)

### Security Guard Operations (`securityGuardRoutes.js`)
- `GET /sg/unvalidated-visitors` - Get visitors needing validation (SG only)
- `POST /sg/visitor/validate/:visitor_id` - Validate visitor ID (SG only)
- `POST /sg/visitor/reject/:visitor_id` - Reject visitor ID (SG only)
- `GET /sg/validate-visitor` - Validate via ID proof (SG only)
- `POST /sg/visitor/check-in` - Check-in visitor (SG only)
- `POST /sg/visitor/check-out` - Check-out visitor (SG only)
- `GET /sg/visitor-logs` - Get visitor logs (SG only)

### Password Reset (`passwordResetRoutes.js`)
- `POST /request-password-reset` - Request password reset OTP
- `POST /verify-otp` - Verify OTP
- `POST /reset-password` - Reset password

## Middleware Chain

### Authentication Flow
1. **Client** sends request with `Authorization: Bearer <token>` header
2. **authMiddleware** verifies JWT token
3. **roleMiddleware** checks user role (if specified)
4. **Controller** handles the request
5. **Response** sent back to client

### Example with Role Check
```javascript
GET /he/meetings-status
  ↓
authMiddleware (JWT verification)
  ↓
checkRole(["he"]) (Role validation)
  ↓
Controller (meetingController.getHesMeetings)
```

## Database Integration

All database queries are centralized in the `services/` folder:
- Uses PostgreSQL connection from `config/database.js`
- All queries use parameterized statements (SQL injection prevention)
- Error handling is consistent across all services

## Error Handling

Errors are handled at multiple levels:
1. **Service Layer**: Business logic errors with clear messages
2. **Controller Layer**: Map service errors to HTTP status codes
3. **Middleware**: Authentication/Authorization errors

Example error pattern:
```javascript
try {
  const result = await visitorService.approveVisitor(id, updateData);
  res.json({ success: true, data: result });
} catch (error) {
  if (error.message === "Visitor not found") {
    return res.status(404).json({ success: false, message: error.message });
  }
  res.status(500).json({ success: false, message: "Server error" });
}
```

## Migration Notes

### ✅ All Functionality Preserved
- Zero breaking changes
- All endpoints work identically
- Database queries unchanged
- JWT token logic unchanged
- Email sending unchanged
- Role-based access unchanged

### Deprecated Files
- `utils/db.js` → Use `config/database.js`
- `utils/mailer.js` → Use `config/mailer.js`
- Old endpoints from `index.js` → Distributed to route files

## Best Practices Implemented

1. ✅ **DRY Principle** - Reusable services and utilities
2. ✅ **SOLID Principles** - Single responsibility per module
3. ✅ **Error Handling** - Consistent error messages and status codes
4. ✅ **Security** - Parameterized queries, JWT validation, role checks
5. ✅ **Scalability** - Modular architecture for future growth
6. ✅ **Maintainability** - Clear file organization and naming

## Starting the Server

```bash
npm install
npm start
```

The server will:
1. Load environment variables from `.env`
2. Connect to PostgreSQL database
3. Verify Email configuration
4. Start Express server on configured PORT (default: 3000)

## Future Enhancements

1. Add request validation schemas (Joi/Yup)
2. Add comprehensive logging system
3. Add unit/integration tests
4. Add API documentation (Swagger/OpenAPI)
5. Add data caching layer (Redis)
6. Add rate limiting
7. Add request/response compression
8. Containerize with Docker
