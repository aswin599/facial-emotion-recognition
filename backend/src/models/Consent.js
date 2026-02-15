const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cameraConsent: {
    type: Boolean,
    default: false
  },
  storageConsent: {
    type: Boolean,
    default: false
  },
  cameraConsentDate: {
    type: Date
  },
  storageConsentDate: {
    type: Date
  },
  cameraConsentWithdrawn: {
    type: Boolean,
    default: false
  },
  storageConsentWithdrawn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for userId lookup
consentSchema.index({ userId: 1 });

// Update consent dates when consent is given
consentSchema.pre('save', function(next) {
  if (this.isModified('cameraConsent') && this.cameraConsent) {
    this.cameraConsentDate = new Date();
    this.cameraConsentWithdrawn = false;
  }
  
  if (this.isModified('storageConsent') && this.storageConsent) {
    this.storageConsentDate = new Date();
    this.storageConsentWithdrawn = false;
  }
  
  next();
});

const Consent = mongoose.model('Consent', consentSchema);

module.exports = Consent;
