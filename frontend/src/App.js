import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060612',
      color: '#f0eeff',
      fontFamily: 'Syne, sans-serif',
      fontSize: '1.1rem',
      gap: '12px'
    }}>
      <span style={{
        width: 20, height: 20,
        border: '2px solid rgba(124,58,237,0.3)',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite'
      }} />
      Loading...
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Dashboard placeholder
const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{
      minHeight: '100vh',
      background: '#060612',
      color: '#f0eeff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Syne, sans-serif',
      gap: '20px',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '4rem' }}>🎭</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome, {user?.name}!</h1>
      <p style={{ color: 'rgba(240,238,255,0.6)', maxWidth: 400 }}>
        Your emotion recognition dashboard is ready. Connect your backend to start analyzing.
      </p>
      <button
        onClick={logout}
        style={{
          padding: '12px 28px',
          background: 'rgba(124,58,237,0.2)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: '12px',
          color: '#f0eeff',
          cursor: 'pointer',
          fontFamily: 'Syne, sans-serif',
          fontSize: '0.95rem',
          marginTop: '8px'
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
