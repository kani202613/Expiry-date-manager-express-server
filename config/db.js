const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expiry_date_manager';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Non-fatal logging to keep server responsive if MongoDB server is offline locally
  }
};

module.exports = connectDB;
