const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Support both MONGODB_URI and MONGO_URI env variable names
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MongoDB URI not set. Add MONGODB_URI to your .env file.');
    }

    // useNewUrlParser and useUnifiedTopology are removed — deprecated since driver v4
    const conn = await mongoose.connect(uri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    await createIndexes();

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const User      = require('../models/User');
    const EmotionLog = require('../models/EmotionLog');
    const AuditLog  = require('../models/AuditLog');

    await User.createIndexes();
    await EmotionLog.createIndexes();
    await AuditLog.createIndexes();

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error(`Error creating indexes: ${error.message}`);
  }
};

module.exports = connectDB;
