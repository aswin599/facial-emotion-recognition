import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { predictionAPI, consentAPI, todoAPI } from '../services/api';
import './DashboardNew.css';

// Mock data for demo
const MOCK_EMOTION_HISTORY = [
  { id: 1, time: "10:30 AM", emotion: "Happy", confidence: 94, source: "webcam", date: "Today" },
  { id: 2, time: "10:15 AM", emotion: "Neutral", confidence: 87, source: "webcam", date: "Today" },
  { id: 3, time: "10:00 AM", emotion: "Surprise", confidence: 91, source: "upload", date: "Today" },
  { id: 4, time: "09:45 AM", emotion: "Happy", confidence: 89, source: "webcam", date: "Today" },
  { id: 5, time: "09:30 AM", emotion: "Neutral", confidence: 92, source: "webcam", date: "Today" },
];

const MOCK_WEEKLY_STATS = {
  Happy: 45,
  Neutral: 30,
  Surprise: 12,
  Sad: 8,
  Angry: 3,
  Fear: 2,
  Disgust: 0,
};

const EMOTION_COLORS = {
  Happy: "#22c55e",
  Sad: "#3b82f6",
  Angry: "#ef4444",
  Fear: "#a855f7",
  Surprise: "#f59e0b",
  Disgust: "#14b8a6",
  Neutral: "#64748b",
};

const EMOTION_EMOJIS = {
  Happy: "😊",
  Sad: "😢",
  Angry: "😠",
  Fear: "😨",
  Surprise: "😲",
  Disgust: "🤢",
  Neutral: "😐",
};

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('detect');
  const [webcamActive, setWebcamActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const previousWebcamActiveRef = useRef(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [realTimeDetection, setRealTimeDetection] = useState(false);
  const detectionIntervalRef = useRef(null);

  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [todosLoading, setTodosLoading] = useState(false);
  const [todosError, setTodosError] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState('');
  const [todoSaving, setTodoSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else {
      // Check if user has already granted consent
      const checkConsent = async () => {
        try {
          const response = await consentAPI.getConsent();
          if (response.success && response.data) {
            setConsentGiven(response.data.cameraConsent === true);
          }
        } catch (error) {
          console.error('Failed to check consent:', error);
        }
      };
      checkConsent();
    }
  }, [isAuthenticated, navigate]);

  const loadTodos = useCallback(async () => {
    if (!isAuthenticated) return;
    setTodosLoading(true);
    setTodosError('');

    try {
      const response = await todoAPI.getTodos();
      if (response.success) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      setTodosError(error.message || 'Unable to load tasks.');
    } finally {
      setTodosLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTodos();
    }
  }, [isAuthenticated, loadTodos]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleTabChange = (tab) => {
    if (tab !== 'detect' && webcamActive) {
      alert('Please stop the camera before switching to other tabs.');
      return;
    }
    setActiveTab(tab);
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    setTodoSaving(true);
    setTodosError('');

    try {
      const response = await todoAPI.createTodo(newTodoTitle.trim());
      if (response.success) {
        setTodos((prev) => [response.data, ...prev]);
        setNewTodoTitle('');
        setEditingTodoId(null);
        setEditingTodoTitle('');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      setTodosError(error.message || 'Unable to create task.');
    } finally {
      setTodoSaving(false);
    }
  };

  const handleToggleTodo = async (todo) => {
    setTodoSaving(true);
    setTodosError('');

    try {
      const response = await todoAPI.updateTodo(todo._id, { completed: !todo.completed });
      if (response.success) {
        setTodos((prev) => prev.map((item) => item._id === todo._id ? response.data : item));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setTodosError(error.message || 'Unable to update task.');
    } finally {
      setTodoSaving(false);
    }
  };

  const handleStartEditTodo = (todo) => {
    setEditingTodoId(todo._id);
    setEditingTodoTitle(todo.title);
  };

  const handleSaveEditTodo = async (todo) => {
    if (!editingTodoTitle.trim()) return;

    setTodoSaving(true);
    setTodosError('');

    try {
      const response = await todoAPI.updateTodo(todo._id, { title: editingTodoTitle.trim() });
      if (response.success) {
        setTodos((prev) => prev.map((item) => item._id === todo._id ? response.data : item));
        setEditingTodoId(null);
        setEditingTodoTitle('');
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      setTodosError(error.message || 'Unable to save task.');
    } finally {
      setTodoSaving(false);
    }
  };

  const handleCancelEditTodo = () => {
    setEditingTodoId(null);
    setEditingTodoTitle('');
  };

  const handleDeleteTodo = async (todoId) => {
    setTodoSaving(true);
    setTodosError('');

    try {
      const response = await todoAPI.deleteTodo(todoId);
      if (response.success) {
        setTodos((prev) => prev.filter((item) => item._id !== todoId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      setTodosError(error.message || 'Unable to remove task.');
    } finally {
      setTodoSaving(false);
    }
  };

  const stopRealTimeDetection = useCallback(() => {
    setRealTimeDetection(false);
    setIsAnalyzing(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  const startRealTimeDetection = useCallback(() => {
    if (!webcamActive || !videoRef.current) return;

    setRealTimeDetection(true);
    setIsAnalyzing(true);

    const detectEmotion = async () => {
      if (!videoRef.current || !webcamActive) return;

      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert to base64
        const frameData = canvas.toDataURL('image/jpeg', 0.8);

        // Send to prediction API
        const response = await predictionAPI.predictFromWebcam(frameData);

        if (response.success && response.data) {
          setCurrentEmotion({
            emotion: response.data.emotion,
            confidence: response.data.confidence,
            allEmotions: response.data.allEmotions,
            faceDetected: response.data.faceDetected,
            processingTime: response.data.processingTime,
            timestamp: new Date(),
          });
        } else {
          console.warn('Prediction response not successful:', response);
        }
      } catch (error) {
        console.error('Real-time detection error:', error.message || error);
      }
    };

    // Initial detection
    detectEmotion();

    // Set up interval for continuous detection (every 2 seconds)
    detectionIntervalRef.current = setInterval(detectEmotion, 2000);
  }, [webcamActive]);

  const startWebcam = useCallback(async () => {
    if (!consentGiven) {
      setShowConsentModal(true);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
        
        // Wait for video to be ready, then start real-time detection
        videoRef.current.onloadedmetadata = () => {
          startRealTimeDetection();
        };
      }
    } catch (err) {
      console.error('Webcam error:', err);
      alert('Unable to access webcam. Please check permissions.');
    }
  }, [consentGiven, startRealTimeDetection]);

  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      videoRef.current.pause();
      videoRef.current.load();
      videoRef.current.currentTime = 0;
    }
    setWebcamActive(false);
    setCurrentEmotion(null);
    stopRealTimeDetection();
  }, [stopRealTimeDetection]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    try {
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      const response = await predictionAPI.predictFromWebcam(frameData);
      
      if (response.success && response.data) {
        setCurrentEmotion({
          emotion: response.data.emotion,
          confidence: response.data.confidence,
          allEmotions: response.data.allEmotions,
          faceDetected: response.data.faceDetected,
          processingTime: response.data.processingTime,
          timestamp: new Date(),
        });
      } else {
        alert('Prediction failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to analyze emotion. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await predictionAPI.predictFromImage(formData);
      
      if (response.success && response.data) {
        setCurrentEmotion({
          emotion: response.data.emotion,
          confidence: response.data.confidence,
          allEmotions: response.data.allEmotions,
          faceDetected: response.data.faceDetected,
          processingTime: response.data.processingTime,
          timestamp: new Date(),
        });
      } else {
        alert('Prediction failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload prediction error:', error);
      alert('Failed to analyze uploaded image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const grantConsent = async () => {
    try {
      // Update consent on backend
      await consentAPI.updateConsent(true, true);
      setConsentGiven(true);
      setShowConsentModal(false);
      startWebcam();
    } catch (error) {
      console.error('Failed to set consent:', error);
      alert('Failed to grant consent. Please try again.');
    }
  };

  useEffect(() => {
    if (activeTab !== 'detect') {
      if (webcamActive) {
        previousWebcamActiveRef.current = true;
        stopWebcam();
      }
    } else {
      if (previousWebcamActiveRef.current && consentGiven) {
        startWebcam();
        previousWebcamActiveRef.current = false;
      }
    }
  }, [activeTab, webcamActive, consentGiven, stopWebcam, startWebcam]);

  return (
    <div className="dashboard-new">
      
      {/* Consent Modal */}
      {showConsentModal && (
        <div className="modal-overlay-new">
          <div className="modal-content-new">
            <div className="modal-header-new">
              <span className="modal-icon-new">📹</span>
              <h2>Camera Access Required</h2>
            </div>
            <p className="modal-desc-new">
              EmotiSense needs camera access to detect your emotions in real-time.
            </p>
            <div className="consent-list-new">
              <div className="consent-item-new">
                <span className="check-icon-new">✓</span>
                <span>Camera will only be used for emotion detection</span>
              </div>
              <div className="consent-item-new">
                <span className="check-icon-new">✓</span>
                <span>No video will be stored without your permission</span>
              </div>
              <div className="consent-item-new">
                <span className="check-icon-new">✓</span>
                <span>You can revoke access anytime in settings</span>
              </div>
            </div>
            <div className="modal-actions-new">
              <button className="modal-btn-cancel-new" onClick={() => setShowConsentModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-grant-new" onClick={grantConsent}>
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar-new ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header-new">
          <div className="brand-new">
            <span className="brand-icon-new">⬡</span>
            {!sidebarCollapsed && <span className="brand-text-new">EmoFace</span>}
          </div>
          <button 
            className="sidebar-toggle-new" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav-new">
          <button 
            className={`nav-item-new ${activeTab === 'detect' ? 'active' : ''}`}
            onClick={() => handleTabChange('detect')}
            title="Detect"
          >
            <span className="nav-icon-new">🎭</span>
            {!sidebarCollapsed && <span>Detect</span>}
          </button>
          <button 
            className={`nav-item-new ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabChange('history')}
            title="History"
          >
            <span className="nav-icon-new">📊</span>
            {!sidebarCollapsed && <span>History</span>}
          </button>
          <button 
            className={`nav-item-new ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleTabChange('analytics')}
            title="Analytics"
          >
            <span className="nav-icon-new">📈</span>
            {!sidebarCollapsed && <span>Analytics</span>}
          </button>
          <button 
            className={`nav-item-new ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => handleTabChange('tasks')}
            title="Tasks"
          >
            <span className="nav-icon-new">📝</span>
            {!sidebarCollapsed && <span>Tasks</span>}
          </button>
          <button 
            className={`nav-item-new ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
            title="Profile"
          >
            <span className="nav-icon-new">👤</span>
            {!sidebarCollapsed && <span>Profile</span>}
          </button>
        </nav>

        <div className="sidebar-footer-new">
          <div className="user-card-new">
            {!sidebarCollapsed && (
              <>
                <div className="user-avatar-new">
                  {(user?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="user-info-new">
                  <div className="user-name-new">{user?.name || 'User'}</div>
                  <div className="user-role-new">{user?.rollNo || 'Student'}</div>
                </div>
              </>
            )}
            {sidebarCollapsed && (
              <div className="user-avatar-new">
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <button className="logout-btn-new" onClick={handleLogout} title="Logout">
            <span>→</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content-new ${sidebarCollapsed ? 'expanded' : ''}`}>
        
        {/* Header */}
        <header className="content-header-new">
          <div>
            <h1 className="page-title-new">
              {activeTab === 'detect' && 'Emotion Detection'}
              {activeTab === 'history' && 'Detection History'}
              {activeTab === 'analytics' && 'Analytics & Insights'}
              {activeTab === 'tasks' && 'To-Do List'}
              {activeTab === 'profile' && 'Profile & Settings'}
            </h1>
            <p className="page-subtitle-new">
              {activeTab === 'detect' && 'Real-time facial emotion recognition'}
              {activeTab === 'history' && 'View your past emotion detections'}
              {activeTab === 'analytics' && 'Analyze your emotional patterns'}
              {activeTab === 'tasks' && 'Keep track of tasks, reminders, and progress'}
              {activeTab === 'profile' && 'Manage your account and privacy'}
            </p>
          </div>
          <div className="header-actions-new">
            <div className="date-badge-new">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        <div className="mobile-tabs-new">
          {['detect','history','analytics','tasks','profile'].map((tab) => {
            const label = {
              detect: 'Detect',
              history: 'History',
              analytics: 'Analytics',
              tasks: 'Tasks',
              profile: 'Profile',
            }[tab];
            return (
              <button
                key={tab}
                type="button"
                className={`mobile-tab-new ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-container-new">
          
          {/* DETECT TAB */}
          {activeTab === 'detect' && (
            <div className="tab-content-new">
              <div className="detect-layout-new">
                
                {/* Camera Section */}
                <div className="camera-section-new">
                  <div className="card-new camera-card-new">
                    <div className="card-header-new">
                      <h3>Live Camera Feed</h3>
                      <div className="status-indicator-new">
                        <span className={`status-dot-new ${webcamActive ? 'active' : ''}`}></span>
                        <span className="status-text-new">
                          {webcamActive ? (realTimeDetection ? 'Real-time Active' : 'Camera Active') : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="camera-viewport-new">
                      {!webcamActive && (
                        <div className="camera-empty-new">
                          <span className="empty-icon-new">📷</span>
                          <p>Start camera to begin detection</p>
                        </div>
                      )}
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className={webcamActive ? 'active' : ''}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      
                      {currentEmotion && webcamActive && (
                        <div className="emotion-badge-new">
                          <span className="badge-emoji-new">
                            {EMOTION_EMOJIS[currentEmotion.emotion]}
                          </span>
                          <div className="badge-info-new">
                            <div className="badge-emotion-new">{currentEmotion.emotion}</div>
                            <div className="badge-conf-new">{currentEmotion.confidence}%</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="camera-controls-new">
                      {!webcamActive ? (
                        <button className="btn-primary-new btn-large-new" onClick={startWebcam}>
                          <span>▶</span>
                          <span>Start Camera</span>
                        </button>
                      ) : (
                        <>
                          <div className="control-row-new">
                            <button 
                              className="btn-primary-new" 
                              onClick={captureAndAnalyze} 
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <span className="spinner-new"></span>
                                  <span>Analyzing...</span>
                                </>
                              ) : (
                                <>
                                  <span>📸</span>
                                  <span>Capture</span>
                                </>
                              )}
                            </button>
                            <button 
                              className={`btn-toggle-new ${realTimeDetection ? 'active' : ''}`}
                              onClick={() => {
                                if (realTimeDetection) {
                                  stopRealTimeDetection();
                                } else {
                                  startRealTimeDetection();
                                }
                              }}
                              title={realTimeDetection ? 'Stop Real-time Detection' : 'Start Real-time Detection'}
                            >
                              <span>🔄</span>
                              <span>Real-time</span>
                            </button>
                          </div>
                          <button className="btn-secondary-new" onClick={stopWebcam}>
                            <span>■</span>
                            <span>Stop</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="detect-sidebar-new">
                  
                  {/* Upload Card */}
                  <div className="card-new">
                    <div className="card-header-new">
                      <h3>Upload Image</h3>
                    </div>
                    <div className="card-body-new">
                      <p className="upload-hint-new">
                        Analyze emotion from a saved photo
                      </p>
                      <input 
                        type="file" 
                        id="file-upload-new" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="file-upload-new" className="btn-upload-new">
                        <span>📁</span>
                        <span>Choose File</span>
                      </label>
                      <div className="file-types-new">JPG, PNG • Max 5MB</div>
                    </div>
                  </div>

                  {/* Result Card */}
                  {currentEmotion && (
                    <div className="card-new result-card-new">
                      <div className="card-header-new">
                        <h3>Latest Result</h3>
                        <span className="result-time-new">
                          {new Date(currentEmotion.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="card-body-new">
                        <div className="result-display-new">
                          <span className="result-emoji-new">
                            {EMOTION_EMOJIS[currentEmotion.emotion]}
                          </span>
                          <div className="result-details-new">
                            <div className="result-emotion-new">{currentEmotion.emotion}</div>
                            <div className="confidence-bar-new">
                              <div 
                                className="confidence-fill-new" 
                                style={{ 
                                  width: `${currentEmotion.confidence}%`,
                                  backgroundColor: EMOTION_COLORS[currentEmotion.emotion]
                                }}
                              />
                            </div>
                            <div className="confidence-text-new">
                              {currentEmotion.confidence}% confidence
                            </div>
                          </div>
                        </div>
                        <div className="result-actions-new">
                          <button className="btn-action-new">
                            <span>💾</span> Save
                          </button>
                          <button className="btn-action-new">
                            <span>📤</span> Export
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Card */}
                  <div className="card-new">
                    <div className="card-header-new">
                      <h3>Today's Stats</h3>
                    </div>
                    <div className="card-body-new">
                      <div className="stat-item-new">
                        <span className="stat-label-new">Detections</span>
                        <span className="stat-value-new">12</span>
                      </div>
                      <div className="stat-item-new">
                        <span className="stat-label-new">Most Common</span>
                        <span className="stat-value-new">😊 Happy</span>
                      </div>
                      <div className="stat-item-new">
                        <span className="stat-label-new">Avg Confidence</span>
                        <span className="stat-value-new">91%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="tab-content-new">
              <div className="history-controls-new">
                <div className="search-box-new">
                  <span className="search-icon-new">🔍</span>
                  <input type="text" placeholder="Search history..." />
                </div>
                <div className="filter-group-new">
                  <select className="filter-select-new">
                    <option>All Time</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                  <select className="filter-select-new">
                    <option>All Emotions</option>
                    <option>Happy</option>
                    <option>Sad</option>
                    <option>Neutral</option>
                  </select>
                </div>
              </div>

              <div className="card-new">
                <div className="table-wrapper-new">
                  <table className="table-new">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Emotion</th>
                        <th>Confidence</th>
                        <th>Source</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_EMOTION_HISTORY.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <div className="time-cell-new">
                              <div>{entry.time}</div>
                              <div className="date-sub-new">{entry.date}</div>
                            </div>
                          </td>
                          <td>
                            <div className="emotion-cell-new">
                              <span className="emotion-emoji-small-new">
                                {EMOTION_EMOJIS[entry.emotion]}
                              </span>
                              <span>{entry.emotion}</span>
                            </div>
                          </td>
                          <td>
                            <div className="conf-cell-new">
                              <div className="mini-bar-new">
                                <div 
                                  className="mini-fill-new" 
                                  style={{ 
                                    width: `${entry.confidence}%`,
                                    backgroundColor: EMOTION_COLORS[entry.emotion]
                                  }}
                                />
                              </div>
                              <span>{entry.confidence}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="source-tag-new">
                              {entry.source === 'webcam' ? '📹' : '📁'} {entry.source}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns-new">
                              <button className="icon-btn-new" title="View">👁️</button>
                              <button className="icon-btn-new" title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'tasks' && (
            <div className="tab-content-new">
              <div className="card-new">
                <div className="card-header-new">
                  <h3>My Tasks</h3>
                  <span className="period-badge-new">To-Do</span>
                </div>
                <div className="card-body-new">
                  <div className="todo-input-row-new">
                    <input
                      type="text"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      placeholder="Add a new task..."
                      className="task-edit-input-new"
                      disabled={todoSaving}
                    />
                    <button
                      className="btn-primary-new"
                      onClick={handleAddTodo}
                      disabled={todoSaving || !newTodoTitle.trim()}
                    >
                      {todoSaving ? 'Saving...' : 'Add'}
                    </button>
                  </div>

                  {todosError && (
                    <div className="task-error-new">{todosError}</div>
                  )}

                  {todosLoading ? (
                    <div className="task-empty-new">Loading tasks…</div>
                  ) : todos.length === 0 ? (
                    <div className="task-empty-new">
                      No tasks yet. Add one to stay organized.
                    </div>
                  ) : (
                    <div className="task-list-new">
                      {todos.map((todo) => (
                        <div key={todo._id} className={`task-item-new ${todo.completed ? 'completed' : ''}`}>
                          <button
                            type="button"
                            className="task-checkbox-new"
                            onClick={() => handleToggleTodo(todo)}
                            disabled={todoSaving}
                            aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {todo.completed ? '✓' : '○'}
                          </button>

                          {editingTodoId === todo._id ? (
                            <input
                              type="text"
                              value={editingTodoTitle}
                              onChange={(e) => setEditingTodoTitle(e.target.value)}
                              className="task-edit-input-new"
                              disabled={todoSaving}
                            />
                          ) : (
                            <span className="task-title-new">{todo.title}</span>
                          )}

                          <div className="task-actions-new">
                            {editingTodoId === todo._id ? (
                              <>
                                <button className="btn-secondary-new" onClick={() => handleSaveEditTodo(todo)} disabled={todoSaving || !editingTodoTitle.trim()}>
                                  Save
                                </button>
                                <button className="btn-secondary-new" onClick={handleCancelEditTodo} disabled={todoSaving}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="btn-secondary-new" onClick={() => handleStartEditTodo(todo)} disabled={todoSaving}>
                                  Edit
                                </button>
                                <button className="btn-danger-new" onClick={() => handleDeleteTodo(todo._id)} disabled={todoSaving}>
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-content-new">
              <div className="analytics-grid-new">
                
                {/* Distribution Chart */}
                <div className="card-new">
                  <div className="card-header-new">
                    <h3>Emotion Distribution</h3>
                    <span className="period-badge-new">Last 7 days</span>
                  </div>
                  <div className="card-body-new">
                    <div className="emotion-chart-new">
                      {Object.entries(MOCK_WEEKLY_STATS).map(([emotion, percentage]) => (
                        <div key={emotion} className="chart-row-new">
                          <div className="chart-label-new">
                            <span className="chart-emoji-new">
                              {EMOTION_EMOJIS[emotion]}
                            </span>
                            <span className="chart-name-new">{emotion}</span>
                          </div>
                          <div className="chart-bar-bg-new">
                            <div 
                              className="chart-bar-fill-new" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: EMOTION_COLORS[emotion]
                              }}
                            />
                          </div>
                          <span className="chart-percent-new">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="card-new">
                  <div className="card-header-new">
                    <h3>Insights</h3>
                  </div>
                  <div className="card-body-new">
                    <div className="insight-new">
                      <span className="insight-icon-new">📈</span>
                      <div>
                        <div className="insight-title-new">Positive Trend</div>
                        <div className="insight-desc-new">
                          Happiness increased 15% this week
                        </div>
                      </div>
                    </div>
                    <div className="insight-new">
                      <span className="insight-icon-new">⏰</span>
                      <div>
                        <div className="insight-title-new">Peak Hours</div>
                        <div className="insight-desc-new">
                          Most active between 10 AM - 12 PM
                        </div>
                      </div>
                    </div>
                    <div className="insight-new">
                      <span className="insight-icon-new">🎯</span>
                      <div>
                        <div className="insight-title-new">Consistency</div>
                        <div className="insight-desc-new">
                          5 days tracked this week
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="tab-content-new">
              <div className="profile-grid-new">
                
                {/* Personal Info */}
                <div className="card-new">
                  <div className="card-header-new">
                    <h3>Personal Information</h3>
                  </div>
                  <div className="card-body-new">
                    <div className="form-group-new">
                      <label>Full Name</label>
                      <input type="text" value={user?.name || 'Priya Sharma'} readOnly />
                    </div>
                    <div className="form-group-new">
                      <label>Roll Number</label>
                      <input type="text" value={user?.rollNo || '21CS101'} readOnly />
                    </div>
                    <div className="form-group-new">
                      <label>Email</label>
                      <input type="email" value={user?.email || 'priya.sharma@college.edu'} readOnly />
                    </div>
                    <div className="form-group-new">
                      <label>Course</label>
                      <input type="text" value={user?.course || 'B.Tech Computer Science'} readOnly />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="card-new">
                  <div className="card-header-new">
                    <h3>Privacy & Consent</h3>
                  </div>
                  <div className="card-body-new">
                    <div className="toggle-row-new">
                      <div className="toggle-info-new">
                        <div className="toggle-label-new">Camera Access</div>
                        <div className="toggle-desc-new">Allow webcam for emotion detection</div>
                      </div>
                      <label className="toggle-switch-new">
                        <input 
                          type="checkbox" 
                          checked={consentGiven} 
                          onChange={(e) => setConsentGiven(e.target.checked)} 
                        />
                        <span className="toggle-slider-new"></span>
                      </label>
                    </div>
                    <div className="toggle-row-new">
                      <div className="toggle-info-new">
                        <div className="toggle-label-new">Store Data</div>
                        <div className="toggle-desc-new">Save emotion history for analytics</div>
                      </div>
                      <label className="toggle-switch-new">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider-new"></span>
                      </label>
                    </div>
                    <div className="toggle-row-new">
                      <div className="toggle-info-new">
                        <div className="toggle-label-new">Share with Instructors</div>
                        <div className="toggle-desc-new">Allow instructors to view trends</div>
                      </div>
                      <label className="toggle-switch-new">
                        <input type="checkbox" />
                        <span className="toggle-slider-new"></span>
                      </label>
                    </div>

                    <div className="danger-section-new">
                      <h4>Danger Zone</h4>
                      <button className="btn-danger-new">
                        <span>🗑️</span> Delete All Data
                      </button>
                      <button className="btn-danger-new">
                        <span>❌</span> Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
