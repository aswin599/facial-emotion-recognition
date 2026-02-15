const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Consent = require('../models/Consent');
const { createAuditLog } = require('../services/auditService');

// ── Helpers ─────────────────────────────────────────────────────────────────

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/** Safe public user object (no passwordHash) */
const publicUser = (user) => ({
  id:          user._id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  rollNo:      user.rollNo,
  fatherName:  user.fatherName,
  dob:         user.dob,
  mobile:      user.mobile,
  gender:      user.gender,
  departments: user.departments,
  course:      user.course,
  city:        user.city,
  address:     user.address,
  lastLogin:   user.lastLogin,
  createdAt:   user.createdAt,
});

// ── Register ─────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const {
      name, email, password,
      rollNo, fatherName, dob, mobile,
      gender, departments, course, city, address,
    } = req.body;

    // Duplicate email check
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = new User({
      name,
      email,
      passwordHash: password,   // pre-save hook will hash this
      rollNo,
      fatherName,
      dob,
      mobile,
      gender,
      departments: Array.isArray(departments) ? departments : [],
      course,
      city,
      address,
    });

    await user.save();

    // Default consent record
    await new Consent({
      userId:         user._id,
      cameraConsent:  false,
      storageConsent: false,
    }).save();

    await createAuditLog({
      userId:    user._id,
      eventType: 'REGISTER',
      status:    'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const token = generateToken(user._id);

    // Response shape: { success, message, token, user }
    // The frontend reads res.data.token and res.data.user directly
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login ────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      await createAuditLog({
        eventType: 'LOGIN_FAILED',
        status:    'failure',
        metadata:  { email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await createAuditLog({
        userId:    user._id,
        eventType: 'LOGIN_FAILED',
        status:    'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await createAuditLog({
      userId:    user._id,
      eventType: 'LOGIN_SUCCESS',
      status:    'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Logout ───────────────────────────────────────────────────────────────────

const logout = async (req, res) => {
  try {
    await createAuditLog({
      userId:    req.user._id,
      eventType: 'LOGOUT',
      status:    'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Profile ──────────────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const user    = await User.findById(req.user._id);
    const consent = await Consent.findOne({ userId: req.user._id });

    res.json({
      success: true,
      user:    publicUser(user),
      consent: consent || { cameraConsent: false, storageConsent: false },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Profile ───────────────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'city', 'address', 'mobile'];
    const user = await User.findById(req.user._id);

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated',
      user:    publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
