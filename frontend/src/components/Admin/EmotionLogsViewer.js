import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const EmotionLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    emotion: '',
    userId: '',
    source: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);

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

  // Load emotion logs
  useEffect(() => {
    loadLogs();
  }, [filters.emotion, filters.source, filters.page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLogs({
        emotion: filters.emotion,
        userId: filters.userId,
        source: filters.source,
        page: filters.page,
        limit: filters.limit
      });
      if (response.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.pages || 1);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load emotion logs');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
      page: 1
    });
  };

  const handleExport = () => {
    // Export data as CSV
    if (logs.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Time', 'User ID', 'Emotion', 'Confidence', 'Source', 'Face Detected'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleDateString(),
      new Date(log.createdAt).toLocaleTimeString(),
      log.userId,
      log.emotion,
      log.confidence,
      log.source,
      log.faceDetected ? 'Yes' : 'No'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Emotion Logs Viewer</h2>
        <button className="btn-export" onClick={handleExport}>
          📥 Export CSV
        </button>
      </div>

      {error && (
        <div className="admin-alert error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Emotion</label>
          <select
            value={filters.emotion}
            onChange={(e) => handleFilterChange('emotion', e.target.value)}
            className="filter-select"
          >
            <option value="">All Emotions</option>
            <option value="Happy">😊 Happy</option>
            <option value="Sad">😢 Sad</option>
            <option value="Angry">😠 Angry</option>
            <option value="Neutral">😐 Neutral</option>
            <option value="Fear">😨 Fear</option>
            <option value="Surprise">😲 Surprise</option>
            <option value="Disgust">🤢 Disgust</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Source</label>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="filter-select"
          >
            <option value="">All Sources</option>
            <option value="webcam">Webcam</option>
            <option value="upload">Upload</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Limit per Page</label>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading emotion logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="logs-grid">
              {logs.map((log, index) => (
                <div key={log._id || index} className="log-card">
                  <div className="log-header">
                    <span
                      className="emotion-badge"
                      style={{ backgroundColor: emotionColors[log.emotion] }}
                    >
                      {emotionEmojis[log.emotion]} {log.emotion}
                    </span>
                    <span className="confidence-score">
                      {log.confidence}% confidence
                    </span>
                  </div>
                  <div className="log-body">
                    <div className="log-row">
                      <span className="log-label">Date & Time</span>
                      <span className="log-value">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="log-row">
                      <span className="log-label">User ID</span>
                      <span className="log-value">{log.userId}</span>
                    </div>
                    <div className="log-row">
                      <span className="log-label">Source</span>
                      <span className="log-value log-source">
                        {log.source === 'webcam' ? '📷' : '📤'} {log.source}
                      </span>
                    </div>
                    <div className="log-row">
                      <span className="log-label">Face Detected</span>
                      <span className="log-value">
                        {log.faceDetected ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    {log.processingTime && (
                      <div className="log-row">
                        <span className="log-label">Processing Time</span>
                        <span className="log-value">{log.processingTime}ms</span>
                      </div>
                    )}
                    {log.allEmotions && Object.keys(log.allEmotions).length > 0 && (
                      <div className="log-row">
                        <span className="log-label">All Emotions</span>
                        <div className="emotion-breakdown">
                          {Object.entries(log.allEmotions).map(([emotion, confidence]) => (
                            <span key={emotion} className="emotion-item">
                              {emotion}: {(confidence * 100).toFixed(1)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={filters.page === totalPages}
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No emotion logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionLogsViewer;
