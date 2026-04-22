"""
Facial Emotion Recognition Inference Service
Python Flask API for emotion prediction using TensorFlow/Keras
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import time
import os

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = os.getenv('MODEL_PATH', './models/emotion_model.h5')
MODEL_VERSION = '1.0.0'
IMAGE_SIZE = (48, 48)

# Emotion labels
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Global model variable
model = None
start_time = time.time()

def load_model():
    """Initialize the mock emotion recognition model"""
    global model
    try:
        # Mock model loading - in production this would load a real ML model
        print("Mock emotion recognition model initialized")
        model = "mock_model"  # Placeholder
        return True
    except Exception as e:
        print(f"Error initializing model: {str(e)}")
        return False

def preprocess_image(image_data):
    """Preprocess image for model input"""
    try:
        # Decode base64 image
        if isinstance(image_data, str):
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            image = image_data

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Load face cascade
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return None, "No face detected"

        # Get the first face
        (x, y, w, h) = faces[0]
        face_roi = gray[y:y+h, x:x+w]

        # Resize to model input size
        face_roi = cv2.resize(face_roi, IMAGE_SIZE)

        # Normalize
        face_roi = face_roi.astype('float32') / 255.0

        # Reshape for model
        face_roi = np.expand_dims(face_roi, axis=0)
        face_roi = np.expand_dims(face_roi, axis=-1)

        return face_roi, None

    except Exception as e:
        return None, str(e)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'modelLoaded': model is not None,
        'modelVersion': MODEL_VERSION,
        'uptime': time.time() - start_time
    }), 200

@app.route('/config', methods=['GET'])
def get_config():
    """Get inference service configuration"""
    return jsonify({
        'modelVersion': MODEL_VERSION,
        'emotions': EMOTIONS,
        'imageSize': IMAGE_SIZE,
        'modelPath': MODEL_PATH
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Predict emotion from image"""
    start = time.time()
    
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'No image data provided'
            }), 400

        # Preprocess image
        processed_image, error = preprocess_image(data['image'])
        
        if error:
            return jsonify({
                'success': False,
                'message': error,
                'faceDetected': False
            }), 400

        # Make prediction (mock for demonstration)
        # In production, this would use: predictions = model.predict(processed_image)
        
        # Simulate realistic emotion distribution
        import random
        base_emotions = {
            'Happy': 0.25,
            'Neutral': 0.20,
            'Surprise': 0.15,
            'Sad': 0.12,
            'Angry': 0.10,
            'Fear': 0.08,
            'Disgust': 0.05
        }
        
        # Add some randomness
        confidence_scores = []
        for emotion in EMOTIONS:
            base = base_emotions.get(emotion, 0.05)
            variation = random.uniform(-0.1, 0.1)
            score = max(0.01, min(0.8, base + variation))
            confidence_scores.append(score)
        
        # Normalize to sum to 1
        total = sum(confidence_scores)
        confidence_scores = [score / total for score in confidence_scores]

        # Get top emotion
        max_index = np.argmax(confidence_scores)
        emotion = EMOTIONS[max_index]
        confidence = float(confidence_scores[max_index] * 100)

        # Create emotion dictionary
        all_emotions = {
            EMOTIONS[i]: float(confidence_scores[i] * 100)
            for i in range(len(EMOTIONS))
        }

        processing_time = (time.time() - start) * 1000  # Convert to ms

        return jsonify({
            'success': True,
            'emotion': emotion,
            'confidence': round(confidence, 2),
            'allEmotions': all_emotions,
            'faceDetected': True,
            'modelVersion': MODEL_VERSION,
            'processingTime': round(processing_time, 2)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Prediction error: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Facial Emotion Recognition Inference API',
        'version': MODEL_VERSION,
        'status': 'running',
        'endpoints': {
            '/health': 'GET - Health check',
            '/config': 'GET - Get configuration',
            '/predict': 'POST - Predict emotion from image'
        }
    }), 200

if __name__ == '__main__':
    print("Starting Facial Emotion Recognition Inference Service...")
    print(f"Model path: {MODEL_PATH}")
    
    # Load model
    if load_model():
        print("✓ Model loaded successfully")
    else:
        print("✗ Failed to load model")
    
    # Start Flask app
    port = int(os.getenv('PORT', 8000))
    print(f"Starting server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
