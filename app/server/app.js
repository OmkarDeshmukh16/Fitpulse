require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const memberRoutes = require('./routes/members.routes');
const planRoutes = require('./routes/plans.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const paymentRoutes = require('./routes/payments.routes');
const reportRoutes = require('./routes/reports.routes');
const settingsRoutes = require('./routes/settings.routes');
const demoRoutes = require('./routes/demo.routes');
const portalRoutes = require('./routes/portal.routes');
const templatesRoutes = require('./routes/templates.routes');

const app = express();

// Security & CORS
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}));


// Rate limiting — relaxed in development so navigation & HMR don't get throttled; disabled in test mode
const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';
if (!isTest) {
  app.use(
    '/api/',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 5000 : 200,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  // Stricter limit for auth
  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 100 : 10,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root & Health check
app.get('/', (req, res) => res.json({ success: true, message: '🚀 Fitpulse Gym Management SaaS API is running successfully' }));
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test';

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'fitpulse-saas-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbState,
      connected: mongoose.connection.readyState === 1,
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  res.status(isHealthy ? 200 : 503).json(healthData);
});

// Auto-prefix /api if omitted in incoming request
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && req.path !== '/' && req.path !== '/health') {
    req.url = '/api' + req.url;
  }
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/demo-requests', demoRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/fitness-templates', templatesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
