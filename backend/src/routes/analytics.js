const express = require('express');
const {
  getStats,
  getTrends,
  getHistory,
  exportData
} = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/stats', auth, getStats);
router.get('/trends', auth, getTrends);
router.get('/history', auth, getHistory);
router.get('/export', auth, exportData);

module.exports = router;
