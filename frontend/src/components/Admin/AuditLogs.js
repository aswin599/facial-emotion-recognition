import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25
  });
  const [totalPages, setTotalPages] = useState(1);

  // Load audit statistics
  useEffect(() => {
    loadStats();
  }, [days]);

  // Load audit logs
  useEffect(() => {
    loadLogs();
  }, [filters.page]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const response = await adminAPI.getLogStats(days);
      if (response.success) {
        setStats(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load audit statistics');
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLogs({
        page: filters.page,
        limit: filters.limit
      });
      if (response.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.pages || 1);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      success: '#22c55e',
      failed: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      error: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  // Get event type icon
  const getEventIcon = (eventType) => {
    const icons = {
      login: '🔐',
      logout: '🚪',
      register: '📝',
      prediction: '📸',
      upload: '📤',
      consent: '✅',
      admin_action: '⚙️',
      profile_update: '👤'
    };
    return icons[eventType] || '📋';
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Audit Logs</h2>
        <p>Track all system activities</p>
      </div>

      {error && (
        <div className="admin-alert error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Statistics */}
      {stats && !statsLoading && (
        <div className="audit-stats-section">
          <div className="stats-time-filter">
            <label>View Statistics for Last</label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="filter-select"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </div>

          <div className="stats-grid">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="stat-item">
                <span className="stat-label">{key.replace(/_/g, ' ')}</span>
                <span className="stat-count">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="audit-logs-list">
              {logs.map((log, index) => (
                <div key={log._id || index} className="audit-log-item">
                  <div className="log-left">
                    <span className="log-icon">{getEventIcon(log.eventType)}</span>
                    <div className="log-info">
                      <p className="log-event">
                        <strong>{log.eventType}</strong>
                        {log.description && ` - ${log.description}`}
                      </p>
                      <p className="log-details">
                        {log.userId && <span>User: {log.userId}</span>}
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        {log.userAgent && (
                          <span className="user-agent">{log.userAgent}</span>
                        )}
                      </p>
                      <p className="log-timestamp">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="log-right">
                    <span
                      className="log-status"
                      style={{
                        backgroundColor: `${getStatusColor(log.status)}20`,
                        color: getStatusColor(log.status)
                      }}
                    >
                      {log.status}
                    </span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="log-metadata">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span key={key} className="metadata-item">
                            {key}: {JSON.stringify(value)}
                          </span>
                        ))}
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
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={filters.page === totalPages}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
