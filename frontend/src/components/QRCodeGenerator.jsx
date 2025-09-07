import React, { useState, useEffect } from 'react';
import { QrCode, Download, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const QRCodeGenerator = ({ onQRGenerated, baseUrl = "https://coach.aiwaverider.com" }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userTimezone, setUserTimezone] = useState(null);

  // Detect user timezone on component mount
  useEffect(() => {
    const detectTimezone = async () => {
      try {
        // Try to get timezone from browser
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Try to get more accurate timezone from IP (optional)
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          setUserTimezone(data.timezone || browserTimezone);
        } catch (ipError) {
          setUserTimezone(browserTimezone);
        }
      } catch (error) {
        setUserTimezone('UTC');
      }
    };
    
    detectTimezone();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;


      if (difference > 0) {
        const minutes = Math.floor(difference / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expired');
        // Don't clear QR data immediately - let user see it for a bit
        setTimeout(() => {
          setQrData(null);
        }, 5000); // Clear after 5 seconds
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [expiresAt]);

  const generateQR = async () => {
    setLoading(true);
    setError('');

    try {
      const API_BASE = window._env_?.REACT_APP_API_URL || 'https://coach.aiwaverider.com';
      
      const response = await fetch(`${API_BASE}/onboard/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expires_in_minutes: 15,
          base_url: baseUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      setQrData({
        imageQr: result.image_qr,        // PNG QR code image
        textQr: result.text_qr,          // Text QR representation
        url: result.url,                 // Direct URL
        sessionId: result.session_id,
        onboardingUrl: result.onboarding_url
      });
      
      // Handle timezone properly - backend sends UTC, convert to local time
      let expiryTime;
      if (result.expires_at.includes('Z') || result.expires_at.includes('+')) {
        // Already has timezone info
        expiryTime = new Date(result.expires_at);
      } else {
        // Assume UTC if no timezone info
        expiryTime = new Date(result.expires_at + 'Z');
      }
      setExpiresAt(expiryTime.toISOString());
      
      if (onQRGenerated) {
        onQRGenerated(result);
      }

    } catch (error) {
      setError(error.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const link = document.createElement('a');
    link.href = qrData.imageQr;  // Use the PNG image QR
    link.download = `coach-onboarding-qr-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyURL = () => {
    if (!qrData) return;
    
    navigator.clipboard.writeText(qrData.onboardingUrl).then(() => {
      // Show success feedback
      const button = document.getElementById('copy-url-btn');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('bg-green-600');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600');
      }, 2000);
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <QrCode className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coach Onboarding QR</h2>
        <p className="text-gray-600">Generate a QR code for coach registration</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {!qrData ? (
        <div className="text-center">
          <button
            onClick={generateQR}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <QrCode className="w-5 h-5" />
            )}
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img 
                src={qrData.imageQr} 
                alt="Coach Onboarding QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Real QR code image for mobile scanning</p>
          </div>

          {/* Timer */}
          {timeLeft && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                <span>Expires in: {timeLeft}</span>
              </div>
              {userTimezone && (
                <div className="text-xs text-gray-500 mt-1">
                  Your timezone: {userTimezone}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            
            <button
              id="copy-url-btn"
              onClick={copyURL}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Copy URL
            </button>
          </div>

          {/* Direct URL Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Direct URL:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={qrData.url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <button
                onClick={() => navigator.clipboard.writeText(qrData.url)}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={generateQR}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : 'Generate New QR'}
          </button>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions for Coaches:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Open camera app on phone</li>
              <li>2. Scan the QR code above</li>
              <li>3. Follow the registration steps</li>
              <li>4. Enter verification code when received</li>
              <li>5. Start managing clients!</li>
            </ol>
          </div>

          {/* Technical Details */}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Technical Details</summary>
            <div className="mt-2 space-y-1">
              <p><strong>Session ID:</strong> {qrData.sessionId}</p>
              <p><strong>Onboarding URL:</strong> {qrData.onboardingUrl}</p>
              <p><strong>Direct URL:</strong> {qrData.url}</p>
              <p><strong>Image QR Type:</strong> {qrData.imageQr?.split(',')[0] || 'N/A'}</p>
              <p><strong>Text QR Type:</strong> {qrData.textQr?.split(',')[0] || 'N/A'}</p>
              <p><strong>Expires:</strong> {new Date(expiresAt).toLocaleString()}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
