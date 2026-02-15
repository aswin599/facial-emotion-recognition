const Consent = require('../models/Consent');
const { createAuditLog } = require('../services/auditService');

/**
 * Get user consent settings
 */
const getConsent = async (req, res) => {
  try {
    let consent = await Consent.findOne({ userId: req.user._id });

    if (!consent) {
      consent = new Consent({
        userId: req.user._id,
        cameraConsent: false,
        storageConsent: false
      });
      await consent.save();
    }

    res.json({
      success: true,
      data: consent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update user consent settings
 */
const updateConsent = async (req, res) => {
  try {
    const { cameraConsent, storageConsent } = req.body;

    let consent = await Consent.findOne({ userId: req.user._id });

    if (!consent) {
      consent = new Consent({ userId: req.user._id });
    }

    const changes = [];

    if (typeof cameraConsent === 'boolean' && consent.cameraConsent !== cameraConsent) {
      consent.cameraConsent = cameraConsent;
      changes.push(`camera: ${cameraConsent ? 'granted' : 'withdrawn'}`);
    }

    if (typeof storageConsent === 'boolean' && consent.storageConsent !== storageConsent) {
      consent.storageConsent = storageConsent;
      changes.push(`storage: ${storageConsent ? 'granted' : 'withdrawn'}`);
      
      // If storage consent is withdrawn, mark it
      if (!storageConsent) {
        consent.storageConsentWithdrawn = true;
      }
    }

    await consent.save();

    // Create audit log
    await createAuditLog({
      userId: req.user._id,
      eventType: 'CONSENT_UPDATED',
      status: 'success',
      message: `Consent updated: ${changes.join(', ')}`,
      metadata: { cameraConsent, storageConsent },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Consent settings updated successfully',
      data: consent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Withdraw all consents
 */
const withdrawConsent = async (req, res) => {
  try {
    const consent = await Consent.findOne({ userId: req.user._id });

    if (consent) {
      consent.cameraConsent = false;
      consent.storageConsent = false;
      consent.cameraConsentWithdrawn = true;
      consent.storageConsentWithdrawn = true;
      await consent.save();
    }

    await createAuditLog({
      userId: req.user._id,
      eventType: 'CONSENT_UPDATED',
      status: 'success',
      message: 'All consents withdrawn',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'All consents withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getConsent,
  updateConsent,
  withdrawConsent
};
