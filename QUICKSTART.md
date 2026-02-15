# Quick Start Guide - Facial Emotion Recognition

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally
- Python 3.8+ (for inference service)

### Step 1: Clone & Setup
```bash
cd facial-emotion-recognition
chmod +x setup.sh
./setup.sh
```

### Step 2: Configure Environment

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

**Frontend (.env)**
```bash
cd ../frontend
cp .env.example .env
```

### Step 3: Start Services

**Option A: Development Mode (3 terminals)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

Terminal 3 - Inference (optional):
```bash
cd inference-service
pip install -r requirements.txt
python src/app.py
```

**Option B: Docker (Recommended)**

```bash
docker-compose up -d
```

### Step 4: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Inference API: http://localhost:8000

### Step 5: Create Admin User

1. Register through UI at http://localhost:3000/register
2. Connect to MongoDB:
```bash
mongosh
use facial_emotion_recognition
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## 📱 Using the Application

### For Regular Users:

1. **Register/Login** - Create account or sign in
2. **Grant Consent** - Enable camera and storage in settings
3. **Upload Image** - Go to Upload page, select image
4. **Use Webcam** - Go to Webcam page, start camera
5. **View Analytics** - See your emotion history and trends
6. **Export Data** - Download your data as CSV

### For Admin Users:

1. **Dashboard** - View system statistics
2. **User Management** - Manage users
3. **Audit Logs** - Review system events
4. **Service Health** - Monitor inference service

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or start it
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Inference Service Not Working
The app works without inference service - it will show errors but continue functioning. To fix:

```bash
cd inference-service
pip install -r requirements.txt
python src/app.py
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🧪 Testing the API

### Using curl:

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Upload Image:**
```bash
curl -X POST http://localhost:5000/api/v1/predict/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

## 📊 Project Structure Overview

```
├── backend/          # Node.js + Express API
├── frontend/         # React application
├── inference-service # Python ML service
├── docker-compose.yml
└── README.md
```

## 🔐 Default Admin Credentials

After setup, manually create admin user via MongoDB.
There are no default credentials for security.

## 📚 Next Steps

- Read full [README.md](README.md) for detailed documentation
- Check [API Documentation](docs/API.md) for API details
- See [Deployment Guide](docs/DEPLOYMENT.md) for production setup
- Review SRS document for requirements

## 💡 Tips

1. **Enable HTTPS** in production
2. **Change JWT_SECRET** to a strong random value
3. **Set up backups** for MongoDB
4. **Configure rate limits** based on your needs
5. **Monitor logs** regularly
6. **Update dependencies** periodically

## 🆘 Getting Help

- Check logs: `backend/logs/`
- Review error messages in browser console
- Check MongoDB logs: `journalctl -u mongod`
- Verify all services are running: `docker-compose ps`

---

**Ready to go!** 🎉 Visit http://localhost:3000 and start detecting emotions!
