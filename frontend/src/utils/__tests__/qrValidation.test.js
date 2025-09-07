/**
 * QR Validation Tests
 * Tests for QR code validation utilities
 */

import { 
  isValidCoachOnboardingQR, 
  extractSessionId, 
  isValidSessionId, 
  validateQRCode 
} from '../qrValidation';

describe('QR Validation Utilities', () => {
  describe('isValidCoachOnboardingQR', () => {
    test('should validate correct coach onboarding URLs', () => {
      const validURLs = [
        'https://coach.aiwaverider.com/onboard/start?session=abc123def456',
        'https://coach.aiwaverider.com/onboard/start?session=xyz789',
        'https://localhost:3000/onboard/start?session=test123',
        'https://staging.aiwaverider.com/onboard/start?session=staging123'
      ];

      validURLs.forEach(url => {
        expect(isValidCoachOnboardingQR(url)).toBe(true);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidURLs = [
        'https://google.com',
        'https://coach.aiwaverider.com/other/path?session=123',
        'https://coach.aiwaverider.com/onboard/start',
        'not-a-url',
        '',
        null,
        undefined
      ];

      invalidURLs.forEach(url => {
        expect(isValidCoachOnboardingQR(url)).toBe(false);
      });
    });
  });

  describe('extractSessionId', () => {
    test('should extract session ID from valid URLs', () => {
      const testCases = [
        {
          url: 'https://coach.aiwaverider.com/onboard/start?session=abc123def456',
          expected: 'abc123def456'
        },
        {
          url: 'https://coach.aiwaverider.com/onboard/start?session=xyz789',
          expected: 'xyz789'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(extractSessionId(url)).toBe(expected);
      });
    });

    test('should return null for invalid URLs', () => {
      const invalidURLs = [
        'https://google.com',
        'https://coach.aiwaverider.com/onboard/start',
        'not-a-url'
      ];

      invalidURLs.forEach(url => {
        expect(extractSessionId(url)).toBe(null);
      });
    });
  });

  describe('isValidSessionId', () => {
    test('should validate correct session IDs', () => {
      const validSessionIds = [
        'abc123def456',
        'xyz789',
        'session123456789',
        'a1b2c3d4e5f6'
      ];

      validSessionIds.forEach(sessionId => {
        expect(isValidSessionId(sessionId)).toBe(true);
      });
    });

    test('should reject invalid session IDs', () => {
      const invalidSessionIds = [
        'abc', // too short
        'abc-123', // contains special characters
        'abc 123', // contains spaces
        '', // empty
        null,
        undefined
      ];

      invalidSessionIds.forEach(sessionId => {
        expect(isValidSessionId(sessionId)).toBe(false);
      });
    });
  });

  describe('validateQRCode', () => {
    test('should validate complete QR codes', () => {
      const validQR = 'https://coach.aiwaverider.com/onboard/start?session=abc123def456';
      const result = validateQRCode(validQR);

      expect(result.isValid).toBe(true);
      expect(result.sessionId).toBe('abc123def456');
      expect(result.url).toBe(validQR);
    });

    test('should reject invalid QR codes with appropriate error messages', () => {
      const testCases = [
        {
          qr: '',
          expectedError: 'No QR code data provided'
        },
        {
          qr: 'https://google.com',
          expectedError: 'Invalid QR code format. Please scan a valid coach onboarding QR code.'
        },
        {
          qr: 'https://coach.aiwaverider.com/onboard/start?session=abc',
          expectedError: 'Invalid session ID in QR code. Please try scanning again.'
        }
      ];

      testCases.forEach(({ qr, expectedError }) => {
        const result = validateQRCode(qr);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(expectedError);
      });
    });
  });
});
