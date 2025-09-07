import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PhoneRegistration = ({ coachId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    phoneNumber: '',
    countryCode: '+1',
    displayName: '',
    verificationCode: '',
    pin: ''
  });
  
  // Registration state
  const [phoneResourceId, setPhoneResourceId] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('sms');
  
  // Country codes
  const countryCodes = [
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+963', country: 'Syria', flag: '🇸🇾' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶' },
    { code: '+98', country: 'Iran', flag: '🇮🇷' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+970', country: 'Palestine', flag: '🇵🇸' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+218', country: 'Libya', flag: '🇱🇾' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+853', country: 'Macau', flag: '🇲🇴' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const apiCall = async (endpoint, options = {}) => {
    const API_BASE = window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8001';
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const startRegistration = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await apiCall('/phone-registration/start', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          country_code: formData.countryCode,
          display_name: formData.displayName,
          coach_id: coachId
        })
      });
      
      if (result.success) {
        setPhoneResourceId(result.phone_resource_id);
        setStep(2);
        setSuccess('Phone number created! Now request verification code.');
      } else {
        setError(result.message || 'Failed to start registration');
      }
    } catch (error) {
      setError(error.message || 'Failed to start registration');
    } finally {
      setLoading(false);
    }
  };

  const requestVerificationCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await apiCall('/phone-registration/request-code', {
        method: 'POST',
        body: JSON.stringify({
          phone_resource_id: phoneResourceId,
          method: verificationMethod,
          language: 'en_US'
        })
      });
      
      if (result.success) {
        setStep(3);
        setSuccess(`Verification code sent via ${verificationMethod.toUpperCase()}!`);
      } else {
        setError(result.message || 'Failed to request verification code');
      }
    } catch (error) {
      setError(error.message || 'Failed to request verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await apiCall('/phone-registration/verify-code', {
        method: 'POST',
        body: JSON.stringify({
          phone_resource_id: phoneResourceId,
          code: formData.verificationCode,
          coach_id: coachId
        })
      });
      
      if (result.success) {
        setStep(4);
        setSuccess('Code verified! Now set your PIN for registration.');
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (error) {
      setError(error.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const registerPhone = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await apiCall('/phone-registration/register', {
        method: 'POST',
        body: JSON.stringify({
          phone_resource_id: phoneResourceId,
          pin: formData.pin,
          coach_id: coachId
        })
      });
      
      if (result.success) {
        setStep(5);
        setSuccess('Phone number registered successfully!');
        if (onComplete) {
          onComplete(result.phone_number_id);
        }
      } else {
        setError(result.message || 'Failed to register phone number');
      }
    } catch (error) {
      setError(error.message || 'Failed to register phone number');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Phone className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Your Phone Number</h2>
              <p className="text-gray-600">Add a business phone number to send WhatsApp messages</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    className="w-32 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countryCodes.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="e.g., John's Coaching"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">This will be shown to recipients</p>
              </div>
            </div>
            
            <button
              onClick={startRegistration}
              disabled={loading || !formData.phoneNumber || !formData.displayName}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
              Start Registration
            </button>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Verification Code</h2>
              <p className="text-gray-600">Choose how to receive your verification code</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setVerificationMethod('sms')}
                    className={`p-4 border rounded-lg text-center ${
                      verificationMethod === 'sms' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">SMS</div>
                    <div className="text-sm text-gray-500">Text message</div>
                  </button>
                  
                  <button
                    onClick={() => setVerificationMethod('voice')}
                    className={`p-4 border rounded-lg text-center ${
                      verificationMethod === 'voice' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Phone className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Voice Call</div>
                    <div className="text-sm text-gray-500">Phone call</div>
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={requestVerificationCode}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
              Send Verification Code
            </button>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-gray-600">Check your {verificationMethod === 'sms' ? 'SMS' : 'phone'} for the code</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center text-2xl tracking-widest"
                  maxLength="6"
                />
                <p className="text-sm text-gray-500 mt-1">Enter the code without hyphens (e.g., 123456)</p>
              </div>
            </div>
            
            <button
              onClick={verifyCode}
              disabled={loading || formData.verificationCode.length !== 6}
              className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Verify Code
            </button>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Phone className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your PIN</h2>
              <p className="text-gray-600">Create a 6-digit PIN for your phone number</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit PIN</label>
                <input
                  type="text"
                  value={formData.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                  maxLength="6"
                />
                <p className="text-sm text-gray-500 mt-1">This will be your two-step verification PIN</p>
              </div>
            </div>
            
            <button
              onClick={registerPhone}
              disabled={loading || formData.pin.length !== 6}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
              Register Phone Number
            </button>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
              <p className="text-gray-600">Your phone number is now registered and ready to send messages</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Phone number successfully registered</span>
              </div>
            </div>
            
            <button
              onClick={() => onComplete && onComplete()}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Continue to Dashboard
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}
        
        {renderStep()}
        
        {step > 1 && step < 5 && (
          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-3 h-3 rounded-full ${
                    stepNum <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Step {step} of 4</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneRegistration;

