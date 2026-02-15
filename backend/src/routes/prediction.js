const express = require('express');
const {
  predictFromImage,
  predictFromWebcam
} = require('../controllers/predictionController');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { predictionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Routes
router.post(
  '/image',
  auth,
  predictionLimiter,
  upload.single('image'),
  handleMulterError,
  predictFromImage
);

router.post(
  '/webcam',
  auth,
  predictionLimiter,
  predictFromWebcam
);

module.exports = router;
