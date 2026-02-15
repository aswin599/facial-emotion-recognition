# Facial Emotion Recognition Web Application (MERN Stack)

> A complete web-based facial emotion recognition system built with MongoDB, Express.js, React.js, and Node.js

**Version:** 1.0  
**Author:** Aswin C  
**Date:** February 2, 2026

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## 🎯 Overview

This application detects and classifies human emotions from facial expressions using either uploaded images or real-time webcam input. It identifies emotions such as Happy, Sad, Angry, Neutral, Fear, Surprise, and Disgust, providing confidence scores and analytics.

### Key Capabilities:
- **Image Upload**: Analyze emotions from uploaded JPG/PNG images
- **Live Webcam**: Real-time emotion detection via webcam
- **User Management**: Secure authentication and authorization
- **Consent Management**: Privacy-first approach with explicit consent
- **Analytics Dashboard**: View emotion history, trends, and statistics
- **Admin Panel**: System monitoring and user management
- **Data Export**: Export analytics data as CSV

## ✨ Features

### User Features
- ✅ User registration and authentication (JWT-based)
- ✅ Image upload with validation (JPG/PNG, max 5MB)
- ✅ Real-time webcam capture and emotion detection
- ✅ Emotion classification with confidence scores
- ✅ Results visualization with charts
- ✅ Emotion history and analytics (with consent)
- ✅ Data export (CSV format)
- ✅ Privacy consent management

### Admin Features
- ✅ System statistics dashboard
- ✅ User management
- ✅ Audit logs viewing
- ✅ Inference service monitoring
- ✅ System health checks

### Security Features
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Audit logging

## 🏗 Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │─────▶│   Express   │─────▶│   MongoDB    │
│  Frontend   │      │   Backend   │      │   Database   │
│   (SPA)     │◀─────│   API       │◀─────│              │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            │
                            ▼
                     ┌─────────────┐
                     │  Inference  │
                     │   Service   │
                     │ (Python/TF) │
                     └─────────────┘
```

### Components:
1. **Frontend**: React SPA with responsive UI
2. **Backend**: Node.js + Express.js REST API
3. **Database**: MongoDB for data persistence
4. **Inference Service**: Python-based ML model (separate microservice)

## 🛠 Technologies

### Backend
- Node.js (v18+)
- Express.js
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js
- Multer (file uploads)
- Sharp (image processing)
- Winston (logging)
- Express Rate Limit

### Frontend
- React 18
- React Router v6
- Axios
- Recharts (analytics visualization)
- React Webcam
- Tailwind CSS
- React Toastify
- Headless UI

### DevOps
- Docker (optional)
- Nginx (reverse proxy)
- PM2 (process manager)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

Optional:
- **Docker** - For containerized deployment
- **Python 3.8+** - For inference service

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd facial-emotion-recognition
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set Up MongoDB

Ensure MongoDB is running:

```bash
# macOS/Linux
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Configure Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/facial_emotion_recognition
JWT_SECRET=your_super_secret_jwt_key_change_this
CORS_ORIGIN=http://localhost:3000
INFERENCE_SERVICE_URL=http://localhost:8000
```

#### Frontend (.env)

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## ⚙️ Configuration

### Create Admin User

After first run, create an admin user:

```bash
cd backend
node scripts/createAdmin.js
```

Or manually via MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Configure Rate Limits

Edit `backend/.env`:

```env
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window
PREDICTION_RATE_LIMIT=50         # Max predictions per window
```

## 🏃 Running the Application

### Development Mode

#### Terminal 1: Start MongoDB (if not running)

```bash
mongod
```

#### Terminal 2: Start Backend

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

#### Terminal 3: Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

#### Terminal 4: Start Inference Service (Optional)

```bash
cd inference-service
python src/app.py
```

Inference service will run on: `http://localhost:8000`

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend with PM2
cd ../backend
pm2 start src/server.js --name fer-backend

# Serve frontend with nginx or serve
npx serve -s ../frontend/build -l 3000
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Prediction Endpoints

#### Predict from Image
```http
POST /predict/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Predict from Webcam
```http
POST /predict/webcam
Authorization: Bearer <token>
Content-Type: application/json

{
  "frame": "data:image/jpeg;base64,..."
}
```

### Analytics Endpoints

#### Get Statistics
```http
GET /analytics/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Trends
```http
GET /analytics/trends?days=7
Authorization: Bearer <token>
```

#### Export Data
```http
GET /analytics/export
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get System Stats
```http
GET /admin/stats
Authorization: Bearer <admin-token>
```

#### Get Users
```http
GET /admin/users?page=1&limit=20
Authorization: Bearer <admin-token>
```

For complete API documentation, see [API.md](docs/API.md)

## 📁 Project Structure

```
facial-emotion-recognition/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── consentController.js
│   │   │   ├── predictionController.js
│   │   │   ├── analyticsController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── validate.js
│   │   │   ├── upload.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Consent.js
│   │   │   ├── EmotionLog.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── consent.js
│   │   │   ├── prediction.js
│   │   │   ├── analytics.js
│   │   │   └── admin.js
│   │   ├── services/
│   │   │   ├── auditService.js
│   │   │   ├── inferenceService.js
│   │   │   └── analyticsService.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Upload/
│   │   │   ├── Webcam/
│   │   │   ├── Analytics/
│   │   │   ├── Admin/
│   │   │   └── Common/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── inference-service/
│   ├── src/
│   │   ├── app.py
│   │   ├── model.py
│   │   └── utils.py
│   ├── models/
│   └── requirements.txt
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
npm run test:integration
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📝 SRS Requirements Mapping

This implementation fulfills all requirements specified in the SRS document:

### Functional Requirements
- ✅ REQ-1 to REQ-5: Authentication & Authorization
- ✅ REQ-6 to REQ-9: Consent Management
- ✅ REQ-10 to REQ-13: Image Upload & Validation
- ✅ REQ-14 to REQ-17: Webcam Capture
- ✅ REQ-18 to REQ-20: Face Detection
- ✅ REQ-21 to REQ-24: Emotion Classification
- ✅ REQ-25 to REQ-28: Result Visualization
- ✅ REQ-29 to REQ-32: Analytics & Export
- ✅ REQ-33 to REQ-35: Admin Features
- ✅ REQ-36 to REQ-38: Audit & Rate Limiting

### Non-Functional Requirements
- ✅ Performance: <2s API response time
- ✅ Security: HTTPS, JWT, password hashing
- ✅ Scalability: Stateless REST architecture
- ✅ Usability: Responsive UI, clear feedback
- ✅ Reliability: Error handling, graceful failures

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- Rate limiting prevents abuse
- CORS restricts cross-origin requests
- Input validation on all endpoints
- Helmet.js adds security headers
- Audit logging for critical operations
- Explicit user consent for camera and data storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Aswin C**

## 🙏 Acknowledgments

- MongoDB for the database
- Express.js and Node.js communities
- React team for the amazing framework
- TensorFlow for ML capabilities

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

---

**Note**: This is an academic project created as part of a Software Requirements Specification (SRS) implementation. For production use, additional security hardening, testing, and optimization are recommended.
