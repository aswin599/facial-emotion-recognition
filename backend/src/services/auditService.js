const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Create an audit log entry
 */
const createAuditLog = async (logData) => {
  try {
    const auditLog = new AuditLog(logData);
    await auditLog.save();
    return auditLog;
  } catch (error) {
    logger.error(`Error creating audit log: ${error.message}`);
    // Don't throw error - audit logging should not break the main flow
  }
};

/**
 * Get audit logs with filters
 */
const getAuditLogs = async (filters = {}, options = {}) => {
  try {
    const {
      userId,
      eventType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = { ...filters, ...options };

    const query = {};

    if (userId) query.userId = userId;
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    logger.error(`Error fetching audit logs: ${error.message}`);
    throw error;
  }
};

/**
 * Get audit log statistics
 */
const getAuditStats = async (userId = null, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchStage = { createdAt: { $gte: startDate } };
    if (userId) matchStage.userId = userId;

    const stats = await AuditLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return stats;
  } catch (error) {
    logger.error(`Error fetching audit stats: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditStats
};
