const express = require('express');
const {
  getSystemStats,
  getUsers,
  updateUserStatus,
  getLogs,
  getLogStats,
  getInferenceStatus
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth, adminAuth);

// Routes
router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.get('/logs', getLogs);
router.get('/logs/stats', getLogStats);
router.get('/inference/status', getInferenceStatus);

module.exports = router;
