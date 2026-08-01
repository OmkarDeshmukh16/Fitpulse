require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to DB and start server (works both locally and on Render/Railway)
const startServer = async () => {
  await connectDB();

  // Vercel doesn't call listen — it just imports the module and calls the handler
  // So we only listen when running locally or on a platform that sets PORT
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`🚀 Fitpulse API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
};

startServer();

// Export for Vercel serverless
module.exports = app;
