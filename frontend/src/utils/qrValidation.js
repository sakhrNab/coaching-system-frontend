/**
 * QR Code Validation Utilities
 * Production-ready validation for coach onboarding QR codes
 */

/**
 * Validates if a QR code contains a valid coach onboarding URL
 * @param {string} qrData - The data extracted from the QR code
 * @returns {boolean} - True if valid coach onboarding QR code
 */
export const isValidCoachOnboardingQR = (qrData) => {
  try {
    // Check if it's a valid URL
    const url = new URL(qrData);
    
    // Validate it's a coach onboarding URL
    const isValidOnboardingURL = (
      (url.hostname === 'coach.aiwaverider.com' || 
       url.hostname === 'coach.aiwaverider.com' ||
       url.hostname === 'localhost' ||
       url.hostname.includes('aiwaverider.com')) &&
      url.pathname.includes('/onboard/start') &&
      url.searchParams.has('session')
    );
    
    if (isValidOnboardingURL) {
      console.log('✅ Valid coach onboarding QR detected:', qrData);
      return true;
    }
    
    console.log('❌ Invalid QR code format:', qrData);
    return false;
  } catch (error) {
    console.log('❌ Invalid QR code (not a URL):', qrData);
    return false;
  }
};

/**
 * Extracts session ID from a valid coach onboarding QR code
 * @param {string} qrData - The data extracted from the QR code
 * @returns {string|null} - Session ID if valid, null otherwise
 */
export const extractSessionId = (qrData) => {
  try {
    if (isValidCoachOnboardingQR(qrData)) {
      const url = new URL(qrData);
      return url.searchParams.get('session');
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Validates session ID format
 * @param {string} sessionId - The session ID to validate
 * @returns {boolean} - True if valid session ID format
 */
export const isValidSessionId = (sessionId) => {
  // Session IDs should be alphanumeric and at least 8 characters
  return /^[a-zA-Z0-9]{8,}$/.test(sessionId);
};

/**
 * Comprehensive QR code validation with detailed error messages
 * @param {string} qrData - The data extracted from the QR code
 * @returns {Object} - Validation result with success status and error message
 */
export const validateQRCode = (qrData) => {
  if (!qrData || typeof qrData !== 'string') {
    return {
      isValid: false,
      error: 'No QR code data provided'
    };
  }

  if (!isValidCoachOnboardingQR(qrData)) {
    return {
      isValid: false,
      error: 'Invalid QR code format. Please scan a valid coach onboarding QR code.'
    };
  }

  const sessionId = extractSessionId(qrData);
  if (!sessionId || !isValidSessionId(sessionId)) {
    return {
      isValid: false,
      error: 'Invalid session ID in QR code. Please try scanning again.'
    };
  }

  return {
    isValid: true,
    sessionId: sessionId,
    url: qrData
  };
};
