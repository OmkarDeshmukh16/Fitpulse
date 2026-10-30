require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitpulse',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_min32chars',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_production_min32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Email SMTP
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',

  // Master SaaS Payment Gateway (Platform-level Razorpay)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  // AI Service
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  // Security & Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default_32_byte_secret_key_fitpulse!',

  isProduction() {
    return this.NODE_ENV === 'production';
  },

  isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  isTest() {
    return this.NODE_ENV === 'test';
  },
};

module.exports = env;
