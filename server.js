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

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5001'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Initialize Swagger Documentation
setupSwagger(app);

// Health Check Route
app.get('/', (req, res) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${host}`;

  res.status(200).json({
    status: 'online',
    message: 'Expiry Date Manager Express Server is running',
    environment: process.env.NODE_ENV || 'development',
    swaggerDocs: `${baseUrl}/api-docs`,
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
