const User = require('../models/User');
const EmotionLog = require('../models/EmotionLog');
const { getAuditLogs, getAuditStats } = require('../services/auditService');
const { checkInferenceHealth, getInferenceConfig } = require('../services/inferenceService');

/**
 * Get system statistics
 */
const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPredictions,
      predictionsToday
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      EmotionLog.countDocuments(),
      EmotionLog.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // Get emotion distribution
    const emotionDistribution = await EmotionLog.aggregate([
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        predictions: {
          total: totalPredictions,
          today: predictionsToday
        },
        emotionDistribution: emotionDistribution.map(e => ({
          emotion: e._id,
          count: e.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update user status
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get audit logs
 */
const getLogs = async (req, res) => {
  try {
    const {
      userId,
      eventType,
      status,
      startDate,
      endDate,
      page,
      limit
    } = req.query;

    const result = await getAuditLogs(
      { userId, eventType, status, startDate, endDate },
      { page: parseInt(page) || 1, limit: parseInt(limit) || 50 }
    );

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
 * Get audit statistics
 */
const getLogStats = async (req, res) => {
  try {
    const { days } = req.query;

    const stats = await getAuditStats(null, parseInt(days) || 30);

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
 * Get inference service health
 */
const getInferenceStatus = async (req, res) => {
  try {
    const health = await checkInferenceHealth();
    const config = await getInferenceConfig();

    res.json({
      success: true,
      data: {
        health,
        config: config.success ? config.config : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSystemStats,
  getUsers,
  updateUserStatus,
  getLogs,
  getLogStats,
  getInferenceStatus
};
