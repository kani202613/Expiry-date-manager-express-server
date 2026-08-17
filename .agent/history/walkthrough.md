# Walkthrough - Expiry Date Manager (Express Server)

Comprehensive walkthrough history for the **Expiry Date Manager** Express backend server.

## 1. Mongoose Models & Schemas
- **User Model (`models/User.js`)**: Mongoose schema storing `name`, `email` (unique, lowercase, validated), and bcrypt-hashed `password`. Includes `matchPassword` method and `pre('save')` encryption middleware.
- **Item Model (`models/Item.js`)**: Refactored from a plain JS class into a complete Mongoose schema with:
  - `user`: ObjectId reference to User (required)
  - `name`: String (required, trimmed)
  - `category`: Enum (`['Food', 'Medicine', 'Cosmetic', 'Grocery', 'Subscription', 'Utility', 'Other']`, default `'Food'`)
  - `quantity`: Number (default `1`, min `1`)
  - `unit`: String (default `'pcs'`)
  - `expiryDate`: Date (required)
  - `purchaseDate`: Date
  - `notes`: String
  - `status`: Enum (`['active', 'consumed', 'discarded']`, default `'active'`)
  - Timestamps (`createdAt`, `updatedAt`)
  - Compound indexes on `{ user: 1, expiryDate: 1 }` and `{ user: 1, category: 1 }`.

## 2. Authentication Middleware
- **Auth Protection (`middleware/authMiddleware.js`)**: `protect` middleware verifying Bearer JWT tokens in `Authorization` header, looking up active user by ID (excluding password field), and attaching `req.user`.

## 3. RESTful API Controllers & Routes
- **Auth Routes (`controllers/authController.js`, `routes/authRoutes.js`)**:
  - `POST /api/auth/register`: Validates inputs, checks duplicate email, creates user, generates JWT token.
  - `POST /api/auth/login`: Authenticates credentials, verifies hashed password, returns user info and JWT token.
- **Item Routes (`controllers/itemController.js`, `routes/itemRoutes.js`)**:
  - `GET /api/items`: Fetches user items with query filters (`category`, `status`, `search` regex match on name or notes, `filterType` for `expiringSoon` or `expired`), and sorting (`expiryDate`, `name`, `createdAt`).
  - `GET /api/items/stats/summary`: Calculates quick counters for active, expiring soon (<7 days), expired, and consumed items.
  - `GET /api/items/:id`: Returns item details if owned by user.
  - `POST /api/items`: Validates required fields (`name`, `expiryDate`) and creates new item linked to user.
  - `PUT /api/items/:id`: Updates fields of an existing item owned by user.
  - `DELETE /api/items/:id`: Deletes item if owned by user.

## 4. Swagger OpenAPI Documentation
- Configured Swagger UI in `config/swagger.js` and annotated `routes/itemRoutes.js` and `routes/authRoutes.js`.
- Available interactively at `http://localhost:5001/api-docs`.

## 5. Verification
- Verified Node server loading: `server.js` starts cleanly and connects to MongoDB (`mongodb://127.0.0.1:27017/expiry_date_manager`).
