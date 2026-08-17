# Implementation Plan - Expiry Date Manager (Express Server)

Detailed technical specification for the Express + MongoDB backend server.

## Goals & Objectives
- Provide secure user registration and login with JWT authentication.
- Enforce data protection via Mongoose validation and user-scoped data queries.
- Support complete CRUD operations for item expiration tracking.
- Support query filtering (category, status, expiring soon countdown, search regex) and sorting.
- Provide Swagger UI interactive documentation at `/api-docs`.

## Architecture & File Layout
- `server.js`: Express application entry point.
- `config/db.js`: MongoDB Mongoose connection setup.
- `config/swagger.js`: Swagger UI configuration.
- `models/User.js`: User schema with bcrypt password hashing.
- `models/Item.js`: Item schema with indexes and category enums.
- `middleware/authMiddleware.js`: JWT token verification middleware.
- `middleware/errorHandler.js`: Global error handling middleware.
- `middleware/logger.js`: HTTP request logging middleware.
- `controllers/authController.js`: Registration and authentication logic.
- `controllers/itemController.js`: CRUD logic, stats calculation, filtering, and sorting.
- `routes/authRoutes.js`: Auth endpoint routes (`/auth` and `/api/auth`).
- `routes/itemRoutes.js`: Protected item endpoint routes (`/api/items`).

## Verification
- Starts on PORT 5001 (or process.env.PORT).
- Interactive Swagger docs served at `http://localhost:5001/api-docs`.
