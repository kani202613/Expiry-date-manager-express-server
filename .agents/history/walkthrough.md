# Walkthrough - Expiry Date Manager (Express Server)

Comprehensive walkthrough history for the **Expiry Date Manager** Express backend server.

## 1. Mongoose Models & Schemas
- **User Model (`models/User.js`)**: Mongoose schema storing `name`, `email` (unique, lowercase, validated), and bcrypt-hashed `password`.
- **Item Model (`models/Item.js`)**: Refactored from a plain JS class into a complete Mongoose schema with `user` reference, category, quantity, unit, expiry date, purchase date, notes, status, and compound indexes.

## 2. Authentication Middleware
- **Auth Protection (`middleware/authMiddleware.js`)**: `protect` middleware verifying Bearer JWT tokens in `Authorization` header and looking up active user by ID.

## 3. RESTful API Controllers & Routes
- **Auth Routes (`controllers/authController.js`, `routes/authRoutes.js`)**: `/api/auth/register` and `/api/auth/login`.
- **Item Routes (`controllers/itemController.js`, `routes/itemRoutes.js`)**: `/api/items` CRUD, category/status filters, search, sorting, and `/api/items/stats/summary`.

## 4. Swagger OpenAPI Documentation
- Interactive documentation available at `http://localhost:5001/api-docs`.
