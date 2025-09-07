# QR Scanner Component - Production Ready

## Overview
The QRScanner component provides production-ready QR code detection for coach onboarding. It uses the `jsQR` library for accurate QR code detection and includes comprehensive validation.

## Features

### ✅ Production-Ready QR Detection
- **jsQR Library**: Industry-standard QR code detection
- **Real-time Processing**: Optimized frame processing every 150ms
- **Performance Optimized**: Only processes every 3rd frame for better performance
- **RequestAnimationFrame**: Smooth detection using browser's animation frame

### ✅ Comprehensive Validation
- **URL Validation**: Ensures QR code contains a valid URL
- **Domain Validation**: Validates against allowed domains:
  - `coach.aiwaverider.com`
  - `coach.aiwaverider.com`
  - `localhost` (for development)
  - Any domain containing `aiwaverider.com`
- **Path Validation**: Ensures URL contains `/onboard/start`
- **Session ID Validation**: Validates session ID format (8+ alphanumeric characters)

### ✅ User Experience
- **Real-time Feedback**: Shows detection status and frame count
- **Error Handling**: Clear error messages with dismissible alerts
- **Manual Input**: Fallback for manual URL entry with validation
- **Reset Functionality**: Easy reset to scan another QR code
- **Mobile Optimized**: Uses back camera on mobile devices

### ✅ Security Features
- **Input Sanitization**: All inputs are validated and sanitized
- **Session Validation**: Ensures session IDs are properly formatted
- **Error Logging**: Comprehensive logging for debugging

## Usage

```jsx
import QRScanner from './components/QRScanner';

function App() {
  const handleQRScanned = (qrData) => {
    console.log('QR Code detected:', qrData);
    // Process the QR code data
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
  };

  return (
    <QRScanner 
      onQRScanned={handleQRScanned}
      onError={handleError}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onQRScanned` | `function` | Yes | Callback when valid QR code is detected |
| `onError` | `function` | No | Callback for error handling |

## QR Code Format

The scanner expects QR codes containing URLs in this format:
```
https://coach.aiwaverider.com/onboard/start?session=abc123def456
```

### Valid Domains
- `coach.aiwaverider.com`
- `coach.aiwaverider.com`
- `localhost` (development)
- Any domain containing `aiwaverider.com`

### Session ID Requirements
- Minimum 8 characters
- Alphanumeric only
- No special characters

## Dependencies

### Required
- `jsqr`: ^1.4.0 - QR code detection library
- `lucide-react`: ^0.542.0 - Icons
- `react`: ^19.1.1 - React framework

### Browser Requirements
- Camera access (getUserMedia API)
- Canvas support
- Modern browser with ES6+ support

## Performance Optimizations

1. **Frame Skipping**: Only processes every 3rd frame
2. **RequestAnimationFrame**: Uses browser's animation frame for smooth processing
3. **Early Exit**: Stops processing when QR code is detected
4. **Memory Management**: Proper cleanup of intervals and timeouts
5. **Canvas Optimization**: Efficient canvas operations

## Error Handling

The component handles various error scenarios:

1. **Camera Access Denied**: Shows user-friendly error message
2. **Invalid QR Code**: Logs and continues scanning
3. **Network Errors**: Handled by parent component
4. **Validation Errors**: Clear error messages for invalid inputs

## Mobile Support

- **Back Camera**: Automatically uses back camera on mobile
- **Responsive Design**: Works on all screen sizes
- **Touch Friendly**: Large buttons and touch targets
- **Performance**: Optimized for mobile devices

## Development

### Testing
```bash
# Install dependencies
npm install

# Start development server
npm start

# Test QR scanner
# 1. Open http://localhost:3000
# 2. Click "Start Camera"
# 3. Scan a valid QR code or enter URL manually
```

### Debugging
- Check browser console for detailed logs
- Use manual input to test validation
- Verify camera permissions in browser settings

## Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **URL Sanitization**: URLs are parsed and validated
3. **Session Validation**: Session IDs are format-validated
4. **Error Logging**: Sensitive data is not logged
5. **Camera Cleanup**: Proper cleanup prevents memory leaks

## Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Try different browser

2. **QR Code Not Detected**
   - Ensure good lighting
   - Hold QR code steady
   - Check QR code is valid format

3. **Validation Errors**
   - Verify QR code contains valid URL
   - Check session ID format
   - Ensure correct domain

### Debug Mode
Enable debug logging by opening browser console. The component logs:
- QR detection attempts
- Validation results
- Error messages
- Performance metrics

## Future Enhancements

1. **Multiple QR Formats**: Support for different QR code types
2. **Batch Scanning**: Scan multiple QR codes
3. **History**: Keep track of scanned codes
4. **Export**: Export scanned data
5. **Analytics**: Track scanning performance
