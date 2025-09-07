import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const QRScanner = ({ onQRScanned, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR code detection
      startQRDetection();

    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Camera access denied. Please allow camera permission and try again.');
      setHasPermission(false);
      setIsScanning(false);
      
      if (onError) {
        onError(err);
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }
  };

  const startQRDetection = () => {
    // Simple QR code detection using canvas and basic pattern matching
    // In production, you'd want to use a proper QR code library like jsQR
    scanningIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple QR code detection (this is a placeholder)
        // In production, use jsQR library: https://github.com/cozmo/jsQR
        const qrData = detectQRCode(imageData);
        
        if (qrData) {
          setScannedData(qrData);
          stopScanning();
          
          if (onQRScanned) {
            onQRScanned(qrData);
          }
        }
      }
    }, 100); // Check every 100ms
  };

  const detectQRCode = (imageData) => {
    // This is a placeholder implementation
    // In production, use jsQR library for proper QR code detection
    // For now, we'll simulate detection for demo purposes
    
    // Simulate QR detection after 3 seconds for demo
    if (Math.random() < 0.01) { // 1% chance per check
      return "https://coaches.aiwaverider.com/onboard/start?session=demo-session-123";
    }
    
    return null;
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const input = e.target.qrInput.value.trim();
    
    if (input) {
      setScannedData(input);
      if (onQRScanned) {
        onQRScanned(input);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <QrCode className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
        <p className="text-gray-600">Scan the coach onboarding QR code</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {!isScanning ? (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>

          <div className="text-center text-gray-500 text-sm">
            or
          </div>

          <form onSubmit={handleManualInput} className="space-y-3">
            <input
              type="text"
              name="qrInput"
              placeholder="Enter onboarding URL manually"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              Submit URL
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <QrCode className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Position QR code here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stop Button */}
          <button
            onClick={stopScanning}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Stop Camera
          </button>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Scanning Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Point camera at QR code</li>
              <li>• Ensure good lighting</li>
              <li>• Hold steady for 2-3 seconds</li>
              <li>• QR code will be detected automatically</li>
            </ul>
          </div>
        </div>
      )}

      {scannedData && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">QR Code Detected!</span>
          </div>
          <p className="text-sm text-green-700 mt-1 break-all">{scannedData}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;

