const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const setupSwagger = require('./config/swagger');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Initialize Swagger Documentation
setupSwagger(app);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Expiry Date Manager Express Server is running',
    swaggerDocs: 'http://localhost:' + PORT + '/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes (Mount on /auth and /api/auth)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// API Routes
app.use('/api/items', itemRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
