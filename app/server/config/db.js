const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Fix for Windows / Node.js querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // fallback if custom DNS cannot be set
}

const poolOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

let isConnected = false;

const connectDB = async (customUri = null) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = customUri || env.MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, poolOptions);
    isConnected = true;
    if (!env.isTest()) {
      console.log(`✅ MongoDB Connected [pool size: ${poolOptions.maxPoolSize}]: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (!env.isTest()) {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

// Graceful termination handlers (skip in test runner)
if (!env.isTest()) {
  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await disconnectDB();
    process.exit(0);
  });
}

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.poolOptions = poolOptions;
