# Coaching System Frontend

A modern React-based frontend application for managing coaching clients and sending WhatsApp messages through a backend API service.

## 🚀 Project Status

### ✅ What's Working
- **Docker Containerization**: Complete and tested
- **Frontend Application**: React app with modern UI
- **Web Server**: Nginx configuration for production
- **Health Checks**: `/health` endpoint working
- **Demo Mode**: Fallback data for testing
- **Environment Configuration**: Ready for production

### 🔧 What You're Deploying
- **Frontend**: React application with coaching management interface
- **Web Server**: Nginx serving static files with proper routing
- **Container**: Docker containerized for easy deployment
- **Features**: Client management, message scheduling, Google integration

## 📋 Quick Start

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd coaching-system-frontend

# Run with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Coolify deployment instructions.

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   User Browser  │ ────────────────► │  Frontend App   │
│                 │                  │   (React +      │
│                 │                  │    Nginx)       │
└─────────────────┘                  └─────────────────┘
                                              │
                                              │ API Calls
                                              ▼
                                    ┌─────────────────┐
                                    │  Backend API    │
                                    │   Service       │
                                    └─────────────────┘
                                              │
                                              │ WhatsApp
                                              ▼
                                    ┌─────────────────┐
                                    │ WhatsApp Business│
                                    │      API        │
                                    └─────────────────┘
```

## 🎯 Key Features

- **Coach Registration**: Barcode scanning for coach setup
- **Client Management**: Add, categorize, and manage clients
- **Message Scheduling**: Send celebration and accountability messages
- **Google Integration**: Import contacts and export to Google Sheets
- **File Import/Export**: CSV and Excel file support
- **Timezone Support**: Multi-timezone scheduling
- **Demo Mode**: Works without backend for testing

## 📁 Project Structure

```
coaching-system-frontend/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── CoachingSystem.jsx  # Main application component
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── public/
├── infrastructure/          # Docker configuration
│   ├── Dockerfile.frontend  # Production Dockerfile
│   └── nginx.conf          # Nginx configuration
├── docker-compose.yml       # Local development
├── DEPLOYMENT.md           # Coolify deployment guide
├── BACKEND_INTEGRATION.md  # Backend API requirements
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables
```bash
# Required: Backend API URL
REACT_APP_API_URL=https://your-backend-domain.com

# Optional: Google OAuth Client ID
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Docker Configuration
- **Port**: 80 (internal), 3000 (external)
- **Health Check**: `/health` endpoint
- **Base Image**: Node.js 18 + Nginx Alpine

## 🔗 Backend Integration

The frontend expects a backend service with specific API endpoints. See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for complete API specifications.

### Required Endpoints
- `POST /register` - Coach registration
- `GET/POST /coaches/{id}/clients` - Client management
- `GET/POST /coaches/{id}/categories` - Category management
- `GET /coaches/{id}/templates` - Message templates
- `POST /messages/send` - Message sending
- `GET /coaches/{id}/export` - Data export
- `POST /coaches/{id}/import-clients` - Client import

## 🚀 Deployment

### Coolify Deployment
1. Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Set environment variables in Coolify
3. Configure build with Dockerfile path: `infrastructure/Dockerfile.frontend`
4. Deploy and monitor health checks

### Manual Docker Deployment
```bash
# Build the image
docker build -f infrastructure/Dockerfile.frontend -t coaching-frontend .

# Run the container
docker run -d -p 3000:80 \
  -e REACT_APP_API_URL=https://your-backend-domain.com \
  coaching-frontend
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
# Should return: healthy
```

### Application Test
1. Open http://localhost:3000 in browser
2. Click "Demo: Simulate Barcode Scan"
3. Test the coaching system interface
4. Verify all features work in demo mode

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ CORS protection
- ✅ Security headers in nginx
- ✅ No sensitive data in client-side code
- ✅ HTTPS ready

## 📊 Monitoring

### Health Monitoring
- Health check endpoint: `/health`
- Docker health checks configured
- Nginx access/error logs

### Application Monitoring
- Browser console logs
- Network tab for API calls
- React DevTools for state management

## 🐛 Troubleshooting

### Common Issues
1. **Build Failures**: Check Dockerfile path and dependencies
2. **Runtime Errors**: Verify environment variables
3. **Backend Connection**: Check CORS and API endpoints
4. **Health Check Failures**: Check nginx configuration

### Debug Commands
```bash
# Check container status
docker ps
docker logs container_name

# Test API connectivity
curl https://your-backend-domain.com/health

# Check environment variables
docker exec container_name env | grep REACT_APP
```

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Backend API requirements
- [Docker Documentation](https://docs.docker.com/) - Docker reference
- [React Documentation](https://reactjs.org/) - React reference

## 🤝 Support

For issues with:
- **Deployment**: Check DEPLOYMENT.md and Coolify documentation
- **Backend Integration**: See BACKEND_INTEGRATION.md
- **Frontend**: Check React and npm documentation
- **Docker**: Check Docker documentation and logs

## 📄 License

This project is part of the Coaching System application.

---

**Status**: ✅ Ready for deployment to Coolify
**Backend Integration**: ⚠️ Requires backend API implementation
**Demo Mode**: ✅ Fully functional with fallback data
