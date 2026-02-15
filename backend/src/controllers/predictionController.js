const sharp = require('sharp');
const EmotionLog = require('../models/EmotionLog');
const Consent = require('../models/Consent');
const { predictEmotion } = require('../services/inferenceService');
const { createAuditLog } = require('../services/auditService');

/**
 * Predict emotion from uploaded image
 */
const predictFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(224, 224, { fit: 'cover' })
      .toBuffer();

    // Call inference service
    const result = await predictEmotion(processedImage, 'upload');

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Check if user has storage consent
    const consent = await Consent.findOne({ userId: req.user._id });
    const shouldStore = consent && consent.storageConsent;

    // Store result if consent given
    if (shouldStore) {
      const emotionLog = new EmotionLog({
        userId: req.user._id,
        source: 'upload',
        emotion: result.emotion,
        confidence: result.confidence,
        allEmotions: result.allEmotions,
        modelVersion: result.modelVersion,
        processingTime: result.processingTime,
        faceDetected: result.faceDetected,
        metadata: {
          imageSize: `${req.file.size} bytes`,
          browser: req.get('user-agent')
        }
      });

      await emotionLog.save();
    }

    // Create audit log
    await createAuditLog({
      userId: req.user._id,
      eventType: 'PREDICTION_REQUEST',
      status: 'success',
      message: 'Image prediction completed',
      metadata: {
        source: 'upload',
        emotion: result.emotion,
        confidence: result.confidence
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Emotion prediction completed',
      data: {
        emotion: result.emotion,
        confidence: result.confidence,
        allEmotions: result.allEmotions,
        faceDetected: result.faceDetected,
        processingTime: result.processingTime,
        modelVersion: result.modelVersion,
        timestamp: new Date(),
        stored: shouldStore
      }
    });
  } catch (error) {
    await createAuditLog({
      userId: req.user._id,
      eventType: 'PREDICTION_REQUEST',
      status: 'failure',
      message: `Prediction failed: ${error.message}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(500).json({
      success: false,
      message: 'Prediction failed',
      error: error.message
    });
  }
};

/**
 * Predict emotion from webcam frame
 */
const predictFromWebcam = async (req, res) => {
  try {
    const { frame } = req.body;

    if (!frame) {
      return res.status(400).json({
        success: false,
        message: 'No frame data provided'
      });
    }

    // Check camera consent
    const consent = await Consent.findOne({ userId: req.user._id });
    if (!consent || !consent.cameraConsent) {
      return res.status(403).json({
        success: false,
        message: 'Camera consent not granted'
      });
    }

    // Convert base64 to buffer
    const base64Data = frame.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Process image
    const processedImage = await sharp(imageBuffer)
      .resize(224, 224, { fit: 'cover' })
      .toBuffer();

    // Call inference service
    const result = await predictEmotion(processedImage, 'webcam');

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Store result if consent given
    const shouldStore = consent && consent.storageConsent;

    if (shouldStore) {
      const emotionLog = new EmotionLog({
        userId: req.user._id,
        source: 'webcam',
        emotion: result.emotion,
        confidence: result.confidence,
        allEmotions: result.allEmotions,
        modelVersion: result.modelVersion,
        processingTime: result.processingTime,
        faceDetected: result.faceDetected,
        metadata: {
          deviceType: 'webcam',
          browser: req.get('user-agent')
        }
      });

      await emotionLog.save();
    }

    res.json({
      success: true,
      data: {
        emotion: result.emotion,
        confidence: result.confidence,
        allEmotions: result.allEmotions,
        faceDetected: result.faceDetected,
        processingTime: result.processingTime,
        timestamp: new Date(),
        stored: shouldStore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Webcam prediction failed',
      error: error.message
    });
  }
};

module.exports = {
  predictFromImage,
  predictFromWebcam
};
