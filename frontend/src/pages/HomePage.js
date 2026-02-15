import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const EMOTIONS = [
  { emoji: '😊', label: 'Happy', color: '#f59e0b', pct: 87 },
  { emoji: '😢', label: 'Sad', color: '#06b6d4', pct: 42 },
  { emoji: '😠', label: 'Angry', color: '#ef4444', pct: 31 },
  { emoji: '😮', label: 'Surprise', color: '#8b5cf6', pct: 65 },
  { emoji: '😐', label: 'Neutral', color: '#6b7280', pct: 58 },
  { emoji: '😨', label: 'Fear', color: '#10b981', pct: 24 },
];

const STATS = [
  { value: '98.2%', label: 'Accuracy Rate' },
  { value: '< 50ms', label: 'Response Time' },
  { value: '7', label: 'Emotions Detected' },
  { value: '10K+', label: 'Analyses Done' },
];

const FEATURES = [
  {
    icon: '🎭',
    title: 'Real-time Detection',
    desc: 'Live webcam emotion analysis with sub-50ms latency using optimized neural networks.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Visualize emotion trends over time with beautiful interactive charts and insights.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    desc: 'All processing happens locally. Your data never leaves your device without consent.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: '🧠',
    title: 'Deep Learning',
    desc: 'Powered by state-of-the-art CNN models trained on diverse, representative datasets.',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

// Floating particle component
const Particle = ({ delay, size, left, duration }) => (
  <div
    className="particle"
    style={{
      left: `${left}%`,
      width: size,
      height: size,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

// Animated emotion bar
const EmotionBar = ({ emotion, index }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(emotion.pct), 300 + index * 100);
    return () => clearTimeout(t);
  }, [emotion.pct, index]);

  return (
    <div className="emotion-bar-row" style={{ animationDelay: `${index * 0.1}s` }}>
      <span className="emotion-emoji">{emotion.emoji}</span>
      <span className="emotion-label">{emotion.label}</span>
      <div className="emotion-track">
        <div
          className="emotion-fill"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${emotion.color}, ${emotion.color}88)`,
            boxShadow: `0 0 10px ${emotion.color}60`,
          }}
        />
      </div>
      <span className="emotion-pct" style={{ color: emotion.color }}>{emotion.pct}%</span>
    </div>
  );
};

// Orbiting face scan UI
const FaceScanUI = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % EMOTIONS.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="face-scan-container">
      <div className="scan-ring scan-ring-1" />
      <div className="scan-ring scan-ring-2" />
      <div className="scan-ring scan-ring-3" />
      <div className="scan-face">
        <div className="scan-grid" />
        <div className="scan-line" />
        <div className="face-dots">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="face-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <div className="face-icon">👤</div>
      </div>
      <div className="emotion-badge" style={{ color: EMOTIONS[active].color }}>
        <span>{EMOTIONS[active].emoji}</span>
        <span>{EMOTIONS[active].label}</span>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const particles = useRef(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      delay: Math.random() * 15,
      size: `${3 + Math.random() * 5}px`,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 12,
    }))
  );

  return (
    <div className="home-page">
      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      {/* Particles */}
      <div className="particles-container">
        {particles.current.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── NAVBAR ── */}
      <nav className="navbar glass-card">
        <div className="nav-logo">
          <div className="logo-icon">⬡</div>
          <span>Emo<strong>Face</strong></span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#stats">Stats</a>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-user">👋 {user?.name?.split(' ')[0]}</span>
              <Link to="/dashboard" className="btn-primary btn-sm">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-fadeInUp">
            <span className="badge-dot" />
            <span>AI-Powered • Real-time • Private</span>
          </div>
          <h1 className="hero-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            See Beyond<br />
            <span className="gradient-text">Expressions</span>
          </h1>
          <p className="hero-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Advanced facial emotion recognition powered by deep learning.
            Understand human emotions in real-time with unparalleled accuracy.
          </p>
          <div className="hero-ctas animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary btn-lg">
              <span>🚀</span>
              {isAuthenticated ? 'Go to Dashboard' : 'Start Analyzing Free'}
            </Link>
            <a href="#demo" className="btn-secondary btn-lg">
              <span>▶</span>
              Watch Demo
            </a>
          </div>
          <div className="hero-trust animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="trust-avatars">
              {['🧑‍💻', '👩‍🔬', '👨‍🎓', '👩‍💼'].map((a, i) => (
                <span key={i} className="trust-avatar">{a}</span>
              ))}
            </div>
            <span>Trusted by <strong>10,000+</strong> researchers & developers</span>
          </div>
        </div>

        <div className="hero-visual animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <FaceScanUI />
          <div className="emotion-bars-card glass-card">
            <div className="card-header">
              <span className="live-dot" />
              <span>Live Analysis</span>
            </div>
            {EMOTIONS.map((e, i) => <EmotionBar key={e.label} emotion={e} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="stats-section">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Capabilities</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-desc">
            A complete suite of tools for emotion analysis, from real-time detection to historical insights.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`feature-icon-wrap bg-gradient-to-br ${f.gradient}`}>
                <span>{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO SECTION ── */}
      <section id="demo" className="demo-section">
        <div className="glass-card demo-card">
          <div className="demo-content">
            <span className="section-tag">Live Demo</span>
            <h2>Try It Yourself</h2>
            <p>Upload an image or use your webcam to see real-time emotion detection in action.</p>
            <div className="demo-actions">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary btn-lg">
                Launch Demo
              </Link>
            </div>
          </div>
          <div className="demo-preview">
            <div className="demo-screen">
              <div className="demo-cam-icon">📷</div>
              <div className="demo-scan-lines">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="scan-line-h" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <div className="demo-result-chips">
                {EMOTIONS.slice(0, 3).map((e, i) => (
                  <div key={i} className="result-chip" style={{ borderColor: e.color, animationDelay: `${i * 0.2}s` }}>
                    {e.emoji} {e.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="glass-card cta-card">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of researchers and developers using FacialEmotion today.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary btn-lg">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="logo-icon">⬡</div>
          <span>Emo<strong>Face</strong></span>
        </div>
        <p>© 2026 EmoFace. Built with ❤️ from Aswin 😴.</p>
      </footer>
    </div>
  );
}
