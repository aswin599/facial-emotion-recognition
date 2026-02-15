import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getToken, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);   // true while we verify the stored token

  // On mount: re-hydrate user from stored token
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = getToken();
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore corrupt data */ }
    }
    setLoading(false);
  }, []);

  /** Called after a successful login or register */
  const login = useCallback((userData, token) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  /** Called on explicit logout */
  const logout = useCallback(async () => {
    try {
      // Tell the server (audit log) — ignore errors, still log out locally
      await authAPI.logout();
    } catch { /* noop */ } finally {
      clearToken();
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  /** Refresh user data from the server (call after profile update) */
  const refreshUser = useCallback(async () => {
    try {
      const data = await authAPI.getProfile();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch { /* token probably expired — leave as-is */ }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!getToken() && !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
