const EmotionLog = require('../models/EmotionLog');
const logger = require('../utils/logger');

/**
 * Get emotion statistics for a user
 */
const getEmotionStats = async (userId, filters = {}) => {
  try {
    const { startDate, endDate, emotion, source } = filters;

    const matchStage = { userId };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    if (emotion) matchStage.emotion = emotion;
    if (source) matchStage.source = source;

    const [totalCount, emotionDistribution, sourceDistribution, avgConfidence] = await Promise.all([
      EmotionLog.countDocuments(matchStage),
      
      EmotionLog.aggregate([
        { $match: matchStage },
        { $group: { _id: '$emotion', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      EmotionLog.aggregate([
        { $match: matchStage },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),

      EmotionLog.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
      ])
    ]);

    return {
      totalPredictions: totalCount,
      emotionDistribution: emotionDistribution.map(e => ({
        emotion: e._id,
        count: e.count,
        percentage: ((e.count / totalCount) * 100).toFixed(2)
      })),
      sourceDistribution: sourceDistribution.map(s => ({
        source: s._id,
        count: s.count
      })),
      averageConfidence: avgConfidence[0]?.avgConfidence || 0
    };
  } catch (error) {
    logger.error(`Error fetching emotion stats: ${error.message}`);
    throw error;
  }
};

/**
 * Get emotion trends over time
 */
const getEmotionTrends = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await EmotionLog.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            emotion: '$emotion'
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Format data for charts
    const formattedTrends = {};
    trends.forEach(t => {
      if (!formattedTrends[t._id.date]) {
        formattedTrends[t._id.date] = {};
      }
      formattedTrends[t._id.date][t._id.emotion] = {
        count: t.count,
        avgConfidence: t.avgConfidence.toFixed(2)
      };
    });

    return formattedTrends;
  } catch (error) {
    logger.error(`Error fetching emotion trends: ${error.message}`);
    throw error;
  }
};

/**
 * Get emotion history with pagination
 */
const getEmotionHistory = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      emotion,
      source,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const query = { userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (emotion) query.emotion = emotion;
    if (source) query.source = source;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [history, total] = await Promise.all([
      EmotionLog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      EmotionLog.countDocuments(query)
    ]);

    return {
      history,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    logger.error(`Error fetching emotion history: ${error.message}`);
    throw error;
  }
};

/**
 * Export emotion data to CSV format
 */
const exportEmotionData = async (userId, filters = {}) => {
  try {
    const { startDate, endDate, emotion, source } = filters;

    const query = { userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (emotion) query.emotion = emotion;
    if (source) query.source = source;

    const data = await EmotionLog.find(query).sort({ createdAt: -1 }).lean();

    // Convert to CSV format
    const csvHeader = 'Date,Time,Source,Emotion,Confidence,Model Version\n';
    const csvRows = data.map(log => {
      const date = new Date(log.createdAt);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        log.source,
        log.emotion,
        log.confidence.toFixed(2),
        log.modelVersion
      ].join(',');
    }).join('\n');

    return csvHeader + csvRows;
  } catch (error) {
    logger.error(`Error exporting emotion data: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getEmotionStats,
  getEmotionTrends,
  getEmotionHistory,
  exportEmotionData
};
