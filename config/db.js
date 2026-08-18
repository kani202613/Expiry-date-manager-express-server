const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    let mongoUri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expiry_date_manager').trim();
    // Strip accidental leading variable name if included in value box
    if (mongoUri.startsWith('MONGO_URI=')) {
      mongoUri = mongoUri.replace(/^MONGO_URI=/, '').trim();
    }

    const sanitizedUri = mongoUri.replace(/\/\/(.*):(.*)@/, '//***:***@');
    console.log(`Connecting to MongoDB at: ${sanitizedUri}`);

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
