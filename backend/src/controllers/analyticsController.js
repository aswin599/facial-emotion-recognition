const {
  getEmotionStats,
  getEmotionTrends,
  getEmotionHistory,
  exportEmotionData
} = require('../services/analyticsService');
const Consent = require('../models/Consent');
const { createAuditLog } = require('../services/auditService');

/**
 * Get emotion statistics
 */
const getStats = async (req, res) => {
  try {
    // Check storage consent
    const consent = await Consent.findOne({ userId: req.user._id });
    if (!consent || !consent.storageConsent) {
      return res.status(403).json({
        success: false,
        message: 'Storage consent required to view analytics'
      });
    }

    const { startDate, endDate, emotion, source } = req.query;

    const stats = await getEmotionStats(req.user._id, {
      startDate,
      endDate,
      emotion,
      source
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get emotion trends
 */
const getTrends = async (req, res) => {
  try {
    // Check storage consent
    const consent = await Consent.findOne({ userId: req.user._id });
    if (!consent || !consent.storageConsent) {
      return res.status(403).json({
        success: false,
        message: 'Storage consent required to view trends'
      });
    }

    const days = parseInt(req.query.days) || 7;

    const trends = await getEmotionTrends(req.user._id, days);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get emotion history with pagination
 */
const getHistory = async (req, res) => {
  try {
    // Check storage consent
    const consent = await Consent.findOne({ userId: req.user._id });
    if (!consent || !consent.storageConsent) {
      return res.status(403).json({
        success: false,
        message: 'Storage consent required to view history'
      });
    }

    const {
      page,
      limit,
      startDate,
      endDate,
      emotion,
      source,
      sortBy,
      sortOrder
    } = req.query;

    const result = await getEmotionHistory(req.user._id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      startDate,
      endDate,
      emotion,
      source,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Export emotion data
 */
const exportData = async (req, res) => {
  try {
    // Check storage consent
    const consent = await Consent.findOne({ userId: req.user._id });
    if (!consent || !consent.storageConsent) {
      return res.status(403).json({
        success: false,
        message: 'Storage consent required to export data'
      });
    }

    const { startDate, endDate, emotion, source } = req.query;

    const csvData = await exportEmotionData(req.user._id, {
      startDate,
      endDate,
      emotion,
      source
    });

    // Create audit log
    await createAuditLog({
      userId: req.user._id,
      eventType: 'DATA_EXPORT',
      status: 'success',
      message: 'Emotion data exported',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=emotion-data.csv');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStats,
  getTrends,
  getHistory,
  exportData
};
