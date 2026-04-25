# 🏗️ NextHire Backend Architecture Diagram

## Current Data Flow

```
HTTP Request
    ↓
Routes (auth.routes.js)
    ↓ [Match route + run middlewares]
Validation Middleware (Zod validation)
    ↓ [Parse & validate request]
Auth Middleware (if protected route)
    ↓ [Verify JWT token]
Controller (auth.controller.js)
    ↓ [Extract data from req, call service]
Service Layer (auth.service.js)
    ↓ [Business logic - encryption, auth, etc]
Model (auth.model.js)
    ↓ [MongoDB schema & hooks]
Database (MongoDB)
    ↓
Response back through error handler if error
    ↓
Client gets JSON response
```

## Recommended Full Architecture (Phase 1+)

```
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Request/Response                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Routes Layer                                   │
│              (auth.routes.js)                                     │
│  - Define endpoints                                               │
│  - Chain middlewares                                              │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                Middleware Pipeline                                │
│  1. CORS, Helmet, Morgan                                          │
│  2. Validation Middleware (Zod)  ← Already implemented ✅         │
│  3. Auth Middleware              ← Already implemented ✅         │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Controller Layer                                     │
│          (auth.controller.js)                                    │
│  - Extract request data                                           │
│  - Call service methods                                           │
│  - Format response                                                │
│  - Use catchAsync wrapper ← Already implemented ✅               │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│             Service Layer                                        │
│         (auth.service.js)                                        │
│  - Business Logic                                                 │
│  - Password hashing & verification                                │
│  - Token generation                                               │
│  - User role resolution                                           │
│  - Use AppError for errors ← Already implemented ✅             │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│          Repository Layer                                        │
│        (auth.repository.js) ← NOT IMPLEMENTED ⚠️                 │
│  Should contain:                                                  │
│  - findByEmail(Model, email)                                     │
│  - findById(Model, id)                                           │
│  - create(Model, data)                                           │
│  - update(Model, id, data)                                       │
│  - delete(Model, id)                                             │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Model Layer                                         │
│   (auth.model.js, users.model.js, etc)                          │
│  - Mongoose Schemas                                              │
│  - Pre/Post hooks                                                │
│  - Instance methods                                              │
│  - Already well-structured ✅                                    │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Database Layer                                      │
│              (MongoDB)                                           │
└─────────────────────────────────────────────────────────────────┘

                         ↓ (Error?)

┌─────────────────────────────────────────────────────────────────┐
│           Global Error Handler                                   │
│       (middlewares/errorHandler.js)                             │
│  - Catches all errors ← Already implemented ✅                  │
│  - Formats error response                                        │
│  - Logs in development                                           │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│         Response to Client                                      │
│  {                                                               │
│    "success": false,                                             │
│    "status": "fail",                                             │
│    "message": "...",                                             │
│    "code": "ERROR_CODE"                                          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## File Organization

```
admin-panel/backend/
├── src/
│   ├── app.js ............................ Express app configuration
│   ├── server.js ......................... Server entry point
│   │
│   ├── routes/
│   │   └── index.js ...................... Route aggregator
│   │
│   ├── modules/ .......................... Feature modules
│   │   ├── auth/
│   │   │   ├── auth.routes.js ............ Route definitions
│   │   │   ├── auth.controller.js ........ Request handlers
│   │   │   ├── auth.service.js ........... Business logic
│   │   │   ├── auth.repository.js ........ DB queries (EMPTY)
│   │   │   ├── auth.model.js ............. Mongoose schema
│   │   │   └── auth.validation.js ........ Input validation
│   │   ├── users/
│   │   ├── employers/
│   │   ├── jobs/
│   │   └── ...
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js ............... Global error handler ✅
│   │   ├── authMiddleware.js ............. JWT verification ✅
│   │   ├── validationMiddleware.js ........ Zod validation ✅
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── AppError.js ................... Error class ✅
│   │   ├── catchAsync.js ................. Async wrapper ✅
│   │   ├── tokenUtils.js ................. JWT functions
│   │   └── ...
│   │
│   ├── services/
│   │   ├── email/
│   │   ├── logger/ ...................... NEEDS IMPLEMENTATION
│   │   └── storage/
│   │
│   ├── constants/
│   │   ├── applicationStatuses.js
│   │   ├── jobTypes.js
│   │   └── userRoles.js
│   │
│   └── config/
│       ├── database.js
│       └── environment.js
│
└── package.json
```

## Key Patterns Used

### 1. **Module Pattern** ✅
```javascript
// Each feature is a complete module
modules/auth/
  - routes
  - controller
  - service
  - model
  - validation
  - repository (empty)
```

### 2. **Service Pattern** ✅
```javascript
// Business logic separated from controllers
auth.service.js contains:
  - login()
  - register()
  - changePassword()
  - getMe()
```

### 3. **Error Handling Pattern** ✅
```javascript
// Centralized error handling
Controller → Service → throws AppError
                          ↓
                   errorHandler catches it
                          ↓
                   formats JSON response
```

### 4. **Async Wrapper Pattern** ✅
```javascript
// No try/catch needed in controllers
export const login = catchAsync(async (req, res) => {
  // errors automatically passed to next()
});
```

### 5. **Validation Pattern** ✅
```javascript
// Zod schemas for input validation
router.post("/login", validate(loginSchema), loginController);
```

### 6. **Repository Pattern** ⚠️ INCOMPLETE
```javascript
// Should isolate DB queries
export const findByEmail = (Model, email) => 
  Model.findOne({ email }).select('+password');
```

---

## Testing Ready Structure

Your architecture makes testing easy:

```javascript
// test/auth.service.test.js
import { login } from '../src/modules/auth/auth.service.js';

describe('Auth Service', () => {
  it('should login with valid credentials', async () => {
    // Easy to test because service is pure business logic
    const result = await login({ email: 'test@test.com', password: 'pass' });
    expect(result.user).toBeDefined();
  });
});
```

---

## Summary

✅ **You have:** A clean, professional MVC+ architecture
⚠️ **Missing:** Full repository pattern implementation
🚀 **Next Step:** Implement repository layer for better testability & maintainability
