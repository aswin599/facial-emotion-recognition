import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import '../styles/AdminDashboard.css';

// Sub-components
import StudentManagement from '../components/Admin/StudentManagement';
import EmotionLogsViewer from '../components/Admin/EmotionLogsViewer';
import SystemStats from '../components/Admin/SystemStats';
import AuditLogs from '../components/Admin/AuditLogs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Load system stats
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getSystemStats();
        if (response.success) {
          setStats(response.data);
          setError(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to load system statistics');
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'overview') {
      loadStats();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">Manage students & emotion analytics</p>
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className="admin-user-role">Administrator</span>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button
          className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`admin-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Students
        </button>
        <button
          className={`admin-nav-btn ${activeTab === 'emotions' ? 'active' : ''}`}
          onClick={() => setActiveTab('emotions')}
        >
          😊 Emotion Logs
        </button>
        <button
          className={`admin-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 Audit Logs
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-content">
        {error && (
          <div className="admin-error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <SystemStats stats={stats} loading={loading} />
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <StudentManagement />
        )}

        {/* Emotion Logs Tab */}
        {activeTab === 'emotions' && (
          <EmotionLogsViewer />
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <AuditLogs />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
