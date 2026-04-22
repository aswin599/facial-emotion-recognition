import React from 'react';

const SystemStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="admin-stats-container loading">
        <div className="loading-spinner"></div>
        <p>Loading system statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-stats-container error">
        <p>No statistics available</p>
      </div>
    );
  }

  const { users, predictions, emotionDistribution } = stats;

  // Calculate percentages for emotion distribution
  const totalEmotions = emotionDistribution.reduce((sum, e) => sum + e.count, 0) || 1;
  const emotionPercentages = emotionDistribution.map(e => ({
    ...e,
    percentage: ((e.count / totalEmotions) * 100).toFixed(1)
  }));

  // Emotion colors
  const emotionColors = {
    Happy: '#22c55e',
    Sad: '#3b82f6',
    Angry: '#ef4444',
    Fear: '#a855f7',
    Surprise: '#f59e0b',
    Disgust: '#14b8a6',
    Neutral: '#64748b'
  };

  const emotionEmojis = {
    Happy: '😊',
    Sad: '😢',
    Angry: '😠',
    Fear: '😨',
    Surprise: '😲',
    Disgust: '🤢',
    Neutral: '😐'
  };

  return (
    <div className="admin-stats-container">
      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{users.total}</p>
            <p className="stat-detail">{users.active} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <p className="stat-label">Total Predictions</p>
            <p className="stat-value">{predictions.total}</p>
            <p className="stat-detail">{predictions.today} today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">😊</div>
          <div className="stat-content">
            <p className="stat-label">Emotion Logs</p>
            <p className="stat-value">{totalEmotions}</p>
            <p className="stat-detail">across {emotionDistribution.length} types</p>
          </div>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="emotion-distribution-section">
        <h2>Emotion Distribution</h2>
        <div className="emotion-charts">
          {emotionPercentages.length > 0 ? (
            emotionPercentages.map((emotion) => (
              <div key={emotion.emotion} className="emotion-bar-item">
                <div className="emotion-header">
                  <span className="emotion-emoji">{emotionEmojis[emotion.emotion]}</span>
                  <span className="emotion-name">{emotion.emotion}</span>
                  <span className="emotion-count">{emotion.count}</span>
                </div>
                <div className="emotion-bar-background">
                  <div
                    className="emotion-bar-fill"
                    style={{
                      width: `${emotion.percentage}%`,
                      backgroundColor: emotionColors[emotion.emotion]
                    }}
                  ></div>
                </div>
                <span className="emotion-percentage">{emotion.percentage}%</span>
              </div>
            ))
          ) : (
            <p className="no-data-message">No emotion data available</p>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="quick-info-section">
        <h2>Quick Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Active User Rate</span>
            <span className="info-value">
              {users.total > 0 ? ((users.active / users.total) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Avg Predictions/User</span>
            <span className="info-value">
              {users.total > 0 ? (predictions.total / users.total).toFixed(2) : 0}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Most Common Emotion</span>
            <span className="info-value">
              {emotionPercentages.length > 0 
                ? `${emotionEmojis[emotionPercentages[0].emotion]} ${emotionPercentages[0].emotion}`
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
