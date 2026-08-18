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

// Dynamic & Permissive CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const clientUrls = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
      : [];

    // Allow localhost, Netlify deployments, Render domains, or configured CLIENT_URL
    if (
      process.env.NODE_ENV !== 'production' ||
      clientUrls.includes('*') ||
      clientUrls.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    // Fallback to allow origin safely
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
