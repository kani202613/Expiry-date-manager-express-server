# Walkthrough - Implementing Auth APIs - Login & Register

This document summarizes the implementation of authentication endpoints (`/auth/register` and `/auth/login`), the User Mongoose collection model with hashed passwords, JWT token generation, and Swagger UI documentation.

## Summary of Completed Tasks

### 1. User Collection Model ([models/User.js](file:///c:/Users/kanis/OneDrive/Desktop/Expiry%20date%20Manager/expiry-date-express-server/models/User.js))
- Created Mongoose `userSchema` with attributes:
  - `name` (String, required)
  - `email` (String, required, unique, lowercase, validated)
  - `password` (String, required, minlength 6)
  - Timestamps (`createdAt`, `updatedAt`)
- Implemented `pre('save')` hook using `bcryptjs` for password hashing.
- **Fixed Mongoose 7/8 async pre-save hook**: Removed `next` callback parameter from `async function ()` to resolve `TypeError: next is not a function`.
- Implemented `matchPassword(enteredPassword)` instance method for secure password comparison.

### 2. Auth Controllers ([controllers/authController.js](file:///c:/Users/kanis/OneDrive/Desktop/Expiry%20date%20Manager/expiry-date-express-server/controllers/authController.js))
- **`registerUser`**:
  - Validates required fields (`name`, `email`, `password`).
  - Checks if user with provided email already exists (returns HTTP 400).
  - Creates user in database and signs a JWT token (`expiresIn: 30d`).
  - Returns HTTP 201 Created with user info (without password) and `token`.
- **`loginUser`**:
  - Validates `email` and `password`.
  - Verifies credentials using `user.matchPassword()`.
  - Returns HTTP 200 OK with user info and `token` if valid, or HTTP 401 Unauthorized if invalid.

### 3. Auth Routes & Endpoint Mapping ([routes/authRoutes.js](file:///c:/Users/kanis/OneDrive/Desktop/Expiry%20date%20Manager/expiry-date-express-server/routes/authRoutes.js))
- Mounted on both `/auth` and `/api/auth` in [server.js](file:///c:/Users/kanis/OneDrive/Desktop/Expiry%20date%20Manager/expiry-date-express-server/server.js):
  - `POST /auth/register`
  - `POST /auth/login`

### 4. JWT Authentication Middleware ([middleware/authMiddleware.js](file:///c:/Users/kanis/OneDrive/Desktop/Expiry%20date%20Manager/expiry-date-express-server/middleware/authMiddleware.js))
- Created `protect` middleware to verify Bearer tokens from `Authorization` header (`Authorization: Bearer <token>`).

### 5. Interactive Swagger Documentation ([config/swagger.js](file:///c:/Users/kanis/OneDrive/Desktop/Expiry%20date%20Manager/expiry-date-express-server/config/swagger.js))
- Integrated `swagger-ui-express` and `swagger-jsdoc`.
- Fixed Windows glob path parsing issue (`.replace(/\\/g, '/')`) so Swagger JSDoc scans routes correctly.
- Served at **`http://localhost:5001/api-docs`** (and `/api-docs.json`).
- Includes operations for `/auth/register` and `/auth/login`, request body schemas (`RegisterInput`, `LoginInput`), and response schemas (`AuthResponse`, `ErrorResponse`).

---

## Verification & Code Quality

- All dependencies installed (`mongoose`, `bcryptjs`, `jsonwebtoken`, `swagger-ui-express`, `swagger-jsdoc`).
- Verified Swagger path discovery: output confirmed `['/auth/register', '/auth/login']`.
- Verified Mongoose async pre-save password hashing hook.
- Followed clean modular folder structure (`config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `utils/`, `server.js`).
