import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, setToken } from '../services/api';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [form,         setForm]         = useState({ email: '', password: '' });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Show "registration successful" banner when redirected from register page
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('🎉 Account created! Please sign in to continue.');
    }
  }, [searchParams]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setServerError('');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');

    try {
      const data = await authAPI.login(form.email, form.password);
      // data = { success, message, token, user }
      setToken(data.token);
      login(data.user, data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-grid" />
      </div>

      <div className="auth-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="auth-particle" style={{
            left:              `${8 + i * 8}%`,
            animationDelay:    `${i * 0.9}s`,
            animationDuration: `${9 + i}s`,
            width:             `${3 + (i % 3)}px`,
            height:            `${3 + (i % 3)}px`,
          }} />
        ))}
      </div>

      {/* Nav */}
      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">⬡</span>
          <span>Emo<strong>Face</strong></span>
        </Link>
      </nav>

      <div className="auth-container">
        {/* ── CARD ── */}
        <div className="auth-card glass-card animate-fadeInUp">

          <div className="auth-card-header">
            <div className="auth-icon-wrap"><span>🔐</span></div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your EmoFace account</p>
          </div>

          {/* Success banner (after register redirect) */}
          {successMsg && (
            <div className="server-success animate-fadeIn">
              {successMsg}
            </div>
          )}

          {/* Server / API error */}
          {serverError && (
            <div className="server-error animate-fadeIn">
              <span>⚠️</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input
                  type="email" name="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className={`glass-input input-with-icon ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="field-error"><span>✕</span>{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Password</label>
                <span className="forgot-link" style={{ cursor: 'default' }}>Forgot password?</span>
              </div>
              <div className="input-wrap">
                <span className="input-icon">🔑</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className={`glass-input input-with-icon input-with-toggle ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-password"
                  onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="field-error"><span>✕</span>{errors.password}</div>}
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : <><span>→</span> Sign In</>}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button className="social-btn" type="button">
              <span>G</span> Google
            </button>
            <button className="social-btn" type="button">
              <span>⬛</span> GitHub
            </button>
          </div>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>

        {/* Side decorations */}
        <div className="auth-side-info animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          {[
            { emoji: '🎭', value: '7 Emotions',  label: 'Detected in real-time' },
            { emoji: '⚡', value: '< 50ms',      label: 'Analysis latency' },
            { emoji: '🔒', value: '100% Private', label: 'Your data stays yours' },
          ].map(s => (
            <div key={s.value} className="side-stat glass-card">
              <span className="side-stat-emoji">{s.emoji}</span>
              <div>
                <div className="side-stat-value">{s.value}</div>
                <div className="side-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
