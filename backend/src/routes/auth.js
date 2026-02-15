const express = require('express');
const { body } = require('express-validator');
const {
  register, login, logout, getProfile, updateProfile,
} = require('../controllers/authController');
const { auth }          = require('../middleware/auth');
const validate          = require('../middleware/validate');
const { loginLimiter }  = require('../middleware/rateLimiter');

const router = express.Router();

// ── Validation rules ──────────────────────────────────────────────────────────

const registerValidation = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    .matches(/^[A-Za-z\s'-]+$/).withMessage('Name can only contain letters'),

  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must include uppercase, lowercase, and a number'),

  // Optional extended fields — validated only when present
  body('rollNo').optional().trim(),

  body('fatherName')
    .optional()
    .matches(/^[A-Za-z\s'-]*$/).withMessage("Father's name can only contain letters"),

  body('mobile')
    .optional()
    .matches(/^\+?[\d\s\-()]{7,15}$/).withMessage('Enter a valid mobile number'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', '']).withMessage('Invalid gender value'),

  body('departments')
    .optional()
    .isArray().withMessage('Departments must be an array'),

  body('course').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('dob').optional().trim(),
];

const loginValidation = [
  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/register', registerValidation, validate, register);
router.post('/login',    loginLimiter, loginValidation, validate, login);
router.post('/logout',   auth, logout);
router.get('/profile',   auth, getProfile);
router.put('/profile',   auth, updateProfile);

module.exports = router;
