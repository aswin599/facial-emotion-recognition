const axios = require('axios');
const logger = require('../utils/logger');

const INFERENCE_URL = process.env.INFERENCE_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT = parseInt(process.env.INFERENCE_TIMEOUT) || 10000;

/**
 * Send image to inference service for emotion prediction
 */
const predictEmotion = async (imageBuffer, source = 'upload') => {
  const startTime = Date.now();

  try {
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post(
      `${INFERENCE_URL}/predict`,
      {
        image: base64Image,
        source: source
      },
      {
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const processingTime = Date.now() - startTime;

    if (!response.data.success) {
      throw new Error(response.data.message || 'Prediction failed');
    }

    return {
      success: true,
      emotion: response.data.emotion,
      confidence: response.data.confidence,
      allEmotions: response.data.allEmotions || {},
      faceDetected: response.data.faceDetected !== false,
      processingTime,
      modelVersion: response.data.modelVersion || 'v1.0'
    };
  } catch (error) {
    logger.error(`Inference service error: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: 'Inference service is unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      };
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Inference request timed out. Please try again.',
        error: 'TIMEOUT'
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Emotion prediction failed',
      error: 'PREDICTION_FAILED'
    };
  }
};

/**
 * Check inference service health
 */
const checkInferenceHealth = async () => {
  try {
    const response = await axios.get(`${INFERENCE_URL}/health`, {
      timeout: 5000
    });

    return {
      available: true,
      status: response.data.status || 'healthy',
      modelVersion: response.data.modelVersion,
      uptime: response.data.uptime
    };
  } catch (error) {
    logger.error(`Inference health check failed: ${error.message}`);
    return {
      available: false,
      status: 'unavailable',
      error: error.message
    };
  }
};

/**
 * Get inference service configuration
 */
const getInferenceConfig = async () => {
  try {
    const response = await axios.get(`${INFERENCE_URL}/config`, {
      timeout: 5000
    });

    return {
      success: true,
      config: response.data
    };
  } catch (error) {
    logger.error(`Failed to get inference config: ${error.message}`);
    return {
      success: false,
      message: 'Failed to retrieve inference configuration'
    };
  }
};

module.exports = {
  predictEmotion,
  checkInferenceHealth,
  getInferenceConfig
};
