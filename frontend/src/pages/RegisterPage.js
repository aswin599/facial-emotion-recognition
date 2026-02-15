import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, setToken } from '../services/api';
import './AuthPages.css';
import './RegisterPage.css';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'Civil', 'Mech', 'MCA'];
const COURSES = [
  'B.Tech Computer Science',
  'B.Tech Information Technology',
  'B.Tech Electronics',
  'B.Tech Civil Engineering',
  'B.Tech Mechanical',
  'MCA',
  'M.Tech Computer Science',
  'M.Tech Electronics',
  'BCA',
  'BSc Computer Science',
];

const NAME_RE = /^[A-Za-z\s'-]+$/;

const INITIAL = {
  rollNo: '', firstName: '', lastName: '', fatherName: '',
  dobDay: '', dobMonth: '', dobYear: '',
  mobile: '', email: '',
  password: '', confirmPassword: '',
  gender: '', departments: [], course: '',
  photo: null, city: '', address: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form,         setForm]         = useState(INITIAL);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [step,         setStep]         = useState(1);
  const [pwStrength,   setPwStrength]   = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!form.rollNo.trim()) e.rollNo = 'Roll number is required';

    if (!form.firstName.trim())          e.firstName = 'First name is required';
    else if (!NAME_RE.test(form.firstName)) e.firstName = 'First name can only contain letters';
    else if (form.firstName.trim().length < 2) e.firstName = 'At least 2 characters';

    if (!form.lastName.trim())           e.lastName = 'Last name is required';
    else if (!NAME_RE.test(form.lastName))  e.lastName = 'Last name can only contain letters';

    if (!form.fatherName.trim())            e.fatherName = "Father's name is required";
    else if (!NAME_RE.test(form.fatherName)) e.fatherName = "Only letters allowed";

    const d = parseInt(form.dobDay), m = parseInt(form.dobMonth), y = parseInt(form.dobYear);
    if (!form.dobDay || !form.dobMonth || !form.dobYear) {
      e.dob = 'Complete date of birth is required';
    } else if (isNaN(d) || d < 1 || d > 31) { e.dob = 'Valid day required (1–31)';
    } else if (isNaN(m) || m < 1 || m > 12) { e.dob = 'Valid month required (1–12)';
    } else if (isNaN(y) || y < 1940 || y > new Date().getFullYear() - 15) {
      e.dob = `Valid year required (1940–${new Date().getFullYear() - 15})`;
    }

    if (!form.mobile.trim())                    e.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit number';

    if (!form.email.trim())                        e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email))  e.email = 'Enter a valid email';

    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'At least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      e.password = 'Must include uppercase, lowercase, and a number';
    }
    if (!form.confirmPassword)                     e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.gender)                              e.gender = 'Please select a gender';
    if (!form.departments.length)                  e.departments = 'Select at least one department';
    if (!form.course)                              e.course = 'Please select a course';
    if (!form.city.trim())                         e.city = 'City is required';
    if (!form.address.trim())                      e.address = 'Address is required';
    return e;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['firstName', 'lastName', 'fatherName'].includes(name) && value && !NAME_RE.test(value)) return;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setServerError('');
    if (name === 'password') calcStrength(value);
  };

  const handleDept = (dept) => {
    setForm(p => ({
      ...p,
      departments: p.departments.includes(dept)
        ? p.departments.filter(d => d !== dept)
        : [...p.departments, dept],
    }));
    if (errors.departments) setErrors(p => ({ ...p, departments: '' }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrors(p => ({ ...p, photo: 'Please select an image file' })); return; }
    if (file.size > 2 * 1024 * 1024)    { setErrors(p => ({ ...p, photo: 'Photo must be under 2 MB' }));    return; }
    setForm(p => ({ ...p, photo: file }));
    setErrors(p => ({ ...p, photo: '' }));
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8)             s++;
    if (pw.length >= 12)            s++;
    if (/[A-Z]/.test(pw))           s++;
    if (/[0-9]/.test(pw))           s++;
    if (/[^A-Za-z0-9]/.test(pw))   s++;
    setPwStrength(s);
  };

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][pwStrength] || '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][pwStrength] || '';

  const handleNextStep = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit to MongoDB ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');

    try {
      const payload = {
        name:        `${form.firstName.trim()} ${form.lastName.trim()}`,
        email:       form.email.trim().toLowerCase(),
        password:    form.password,
        rollNo:      form.rollNo.trim(),
        fatherName:  form.fatherName.trim(),
        dob:         `${form.dobYear}-${String(form.dobMonth).padStart(2,'0')}-${String(form.dobDay).padStart(2,'0')}`,
        mobile:      `+91${form.mobile.trim()}`,
        gender:      form.gender,
        departments: form.departments,
        course:      form.course,
        city:        form.city.trim(),
        address:     form.address.trim(),
      };

      const data = await authAPI.register(payload);
      // data = { success, message, token, user }

      // Auto-login after successful registration
      setToken(data.token);
      login(data.user, data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
      // If the error is on step-1 fields (e.g. duplicate email) go back
      if (err.message.toLowerCase().includes('email')) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page register-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-grid" />
      </div>
      <div className="auth-particles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="auth-particle" style={{
            left: `${10 + i * 9}%`, animationDelay: `${i * 1.2}s`,
            animationDuration: `${9 + i}s`, width: `${3 + i % 3}px`, height: `${3 + i % 3}px`,
          }} />
        ))}
      </div>

      <nav className="auth-nav">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">⬡</span>
          <span>Emo<strong>Face</strong></span>
        </Link>
      </nav>

      <div className="register-outer animate-fadeInUp">
        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}><span>1</span></div>
          <div className={`step-line ${step >= 2 ? 'filled' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}><span>2</span></div>
          <div className="step-labels">
            <span>Personal Info</span>
            <span>Account Setup</span>
          </div>
        </div>

        <div className="auth-card glass-card register-card">
          <div className="auth-card-header">
            <div className="auth-icon-wrap register-icon">
              <span>{step === 1 ? '🎓' : '🔐'}</span>
            </div>
            <h1 className="auth-title">
              {step === 1 ? 'Student Registration' : 'Account Setup'}
            </h1>
            <p className="auth-subtitle">
              {step === 1
                ? 'Fill in your personal details'
                : 'Set up your credentials and preferences'}
            </p>
          </div>

          {serverError && (
            <div className="server-error animate-fadeIn">
              <span>⚠️</span> {serverError}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="reg-form animate-fadeIn">
              {/* Roll No */}
              <div className="form-group">
                <label className="form-label">Roll No.</label>
                <div className="input-wrap">
                  <span className="input-icon">🎫</span>
                  <input name="rollNo" value={form.rollNo} onChange={handleChange}
                    placeholder="e.g. 2021CSE001"
                    className={`glass-input input-with-icon ${errors.rollNo ? 'error' : ''}`} />
                </div>
                {errors.rollNo && <div className="field-error"><span>✕</span>{errors.rollNo}</div>}
              </div>

              {/* Student Name */}
              <div className="form-group">
                <label className="form-label">Student Name</label>
                <div className="name-row">
                  <div>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First Name"
                      className={`glass-input ${errors.firstName ? 'error' : ''}`} />
                    {errors.firstName && <div className="field-error"><span>✕</span>{errors.firstName}</div>}
                  </div>
                  <span className="name-dash">—</span>
                  <div>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last Name"
                      className={`glass-input ${errors.lastName ? 'error' : ''}`} />
                    {errors.lastName && <div className="field-error"><span>✕</span>{errors.lastName}</div>}
                  </div>
                </div>
              </div>

              {/* Father's Name */}
              <div className="form-group">
                <label className="form-label">Father's Name</label>
                <div className="input-wrap">
                  <span className="input-icon">👨‍👦</span>
                  <input name="fatherName" value={form.fatherName} onChange={handleChange}
                    placeholder="Father's full name"
                    className={`glass-input input-with-icon ${errors.fatherName ? 'error' : ''}`} />
                </div>
                {errors.fatherName && <div className="field-error"><span>✕</span>{errors.fatherName}</div>}
              </div>

              {/* DOB */}
              <div className="form-group">
                <label className="form-label">Date of Birth (DD – MM – YYYY)</label>
                <div className="dob-row">
                  <input name="dobDay" value={form.dobDay} onChange={handleChange}
                    placeholder="DD" maxLength={2} inputMode="numeric"
                    className={`glass-input dob-field ${errors.dob ? 'error' : ''}`} />
                  <span className="dob-sep">–</span>
                  <input name="dobMonth" value={form.dobMonth} onChange={handleChange}
                    placeholder="MM" maxLength={2} inputMode="numeric"
                    className={`glass-input dob-field ${errors.dob ? 'error' : ''}`} />
                  <span className="dob-sep">–</span>
                  <input name="dobYear" value={form.dobYear} onChange={handleChange}
                    placeholder="YYYY" maxLength={4} inputMode="numeric"
                    className={`glass-input dob-field dob-year ${errors.dob ? 'error' : ''}`} />
                </div>
                {errors.dob && <div className="field-error"><span>✕</span>{errors.dob}</div>}
              </div>

              {/* Mobile */}
              <div className="form-group">
                <label className="form-label">Mobile No.</label>
                <div className="mobile-row">
                  <span className="mobile-prefix glass-input">+91</span>
                  <span className="mobile-dash">–</span>
                  <input name="mobile" value={form.mobile} onChange={handleChange}
                    placeholder="10-digit number" maxLength={10} inputMode="numeric"
                    className={`glass-input ${errors.mobile ? 'error' : ''}`}
                    style={{ flex: 1 }} />
                </div>
                {errors.mobile && <div className="field-error"><span>✕</span>{errors.mobile}</div>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email ID</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="student@college.edu"
                    className={`glass-input input-with-icon ${errors.email ? 'error' : ''}`} />
                </div>
                {errors.email && <div className="field-error"><span>✕</span>{errors.email}</div>}
              </div>

              <button type="button" className="btn-primary auth-submit-btn" onClick={handleNextStep}>
                <span>→</span> Continue to Step 2
              </button>
              <p className="auth-footer-text">
                Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="reg-form animate-fadeIn" noValidate>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔑</span>
                  <input type={showPw ? 'text' : 'password'} name="password"
                    value={form.password} onChange={handleChange}
                    placeholder="Min. 8 chars, uppercase + number"
                    className={`glass-input input-with-icon input-with-toggle ${errors.password ? 'error' : ''}`} />
                  <button type="button" className="toggle-password" onClick={() => setShowPw(p => !p)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="strength-bar">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="strength-seg"
                        style={{ background: i <= pwStrength ? strengthColor : 'rgba(255,255,255,0.1)' }} />
                    ))}
                    <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
                {errors.password && <div className="field-error"><span>✕</span>{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`glass-input input-with-icon input-with-toggle ${errors.confirmPassword ? 'error' : ''}`} />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="field-success"><span>✓</span> Passwords match</div>
                )}
                {errors.confirmPassword && <div className="field-error"><span>✕</span>{errors.confirmPassword}</div>}
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="radio-group">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className={`radio-label ${form.gender === g ? 'selected' : ''}`}>
                      <input type="radio" name="gender" value={g}
                        checked={form.gender === g} onChange={handleChange} hidden />
                      <span className="radio-circle" />{g}
                    </label>
                  ))}
                </div>
                {errors.gender && <div className="field-error"><span>✕</span>{errors.gender}</div>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department</label>
                <div className="checkbox-group">
                  {DEPARTMENTS.map(d => (
                    <label key={d} className={`checkbox-label ${form.departments.includes(d) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={form.departments.includes(d)}
                        onChange={() => handleDept(d)} hidden />
                      <span className="check-box" />{d}
                    </label>
                  ))}
                </div>
                {errors.departments && <div className="field-error"><span>✕</span>{errors.departments}</div>}
              </div>

              {/* Course */}
              <div className="form-group">
                <label className="form-label">Current Course</label>
                <div className="select-wrap">
                  <select name="course" value={form.course} onChange={handleChange}
                    className={`glass-input glass-select ${errors.course ? 'error' : ''}`}>
                    <option value="">— Select Current Course —</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
                {errors.course && <div className="field-error"><span>✕</span>{errors.course}</div>}
              </div>

              {/* Photo */}
              <div className="form-group">
                <label className="form-label">Student Photo</label>
                <div className="photo-upload-area">
                  <input type="file" id="photo-input" accept="image/*"
                    onChange={handlePhoto} style={{ display: 'none' }} />
                  {photoPreview ? (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Preview" />
                      <button type="button" className="photo-remove"
                        onClick={() => { setPhotoPreview(null); setForm(p => ({ ...p, photo: null })); }}>✕</button>
                    </div>
                  ) : (
                    <label htmlFor="photo-input" className="photo-placeholder">
                      <span>📷</span>
                      <span>Click to upload photo</span>
                      <span className="photo-hint">JPG, PNG • Max 2 MB</span>
                    </label>
                  )}
                </div>
                {errors.photo && <div className="field-error"><span>✕</span>{errors.photo}</div>}
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-wrap">
                  <span className="input-icon">🏙️</span>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="Your city"
                    className={`glass-input input-with-icon ${errors.city ? 'error' : ''}`} />
                </div>
                {errors.city && <div className="field-error"><span>✕</span>{errors.city}</div>}
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange}
                  placeholder="Full residential address" rows={3}
                  className={`glass-input glass-textarea ${errors.address ? 'error' : ''}`} />
                {errors.address && <div className="field-error"><span>✕</span>{errors.address}</div>}
              </div>

              <div className="form-btn-row">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                  {loading
                    ? <><span className="spinner" /> Registering…</>
                    : <><span>🎓</span> Register</>}
                </button>
              </div>

              <p className="auth-footer-text">
                Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
