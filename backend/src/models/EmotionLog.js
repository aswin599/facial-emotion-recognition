const mongoose = require('mongoose');

const emotionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['upload', 'webcam'],
    required: true
  },
  emotion: {
    type: String,
    required: true,
    enum: ['Happy', 'Sad', 'Angry', 'Neutral', 'Fear', 'Surprise', 'Disgust']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  allEmotions: {
    type: Map,
    of: Number,
    default: {}
  },
  modelVersion: {
    type: String,
    default: 'v1.0'
  },
  processingTime: {
    type: Number,
    comment: 'Processing time in milliseconds'
  },
  faceDetected: {
    type: Boolean,
    default: true
  },
  metadata: {
    imageSize: String,
    deviceType: String,
    browser: String
  }
}, {
  timestamps: true
});

// Compound index for userId and createdAt for efficient analytics queries
emotionLogSchema.index({ userId: 1, createdAt: -1 });
emotionLogSchema.index({ emotion: 1, createdAt: -1 });
emotionLogSchema.index({ userId: 1, emotion: 1 });

const EmotionLog = mongoose.model('EmotionLog', emotionLogSchema);

module.exports = EmotionLog;
