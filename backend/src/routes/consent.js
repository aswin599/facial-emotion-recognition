const express = require('express');
const { body } = require('express-validator');
const {
  getConsent,
  updateConsent,
  withdrawConsent
} = require('../controllers/consentController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const consentValidation = [
  body('cameraConsent')
    .optional()
    .isBoolean()
    .withMessage('cameraConsent must be a boolean'),
  body('storageConsent')
    .optional()
    .isBoolean()
    .withMessage('storageConsent must be a boolean')
];

// Routes
router.get('/', auth, getConsent);
router.put('/', auth, consentValidation, validate, updateConsent);
router.post('/withdraw', auth, withdrawConsent);

module.exports = router;
