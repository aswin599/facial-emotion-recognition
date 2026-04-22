"""
Facial Emotion Recognition Training Script
Trains a CNN model on FER-2013 dataset using TensorFlow/Keras
"""

import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, callbacks
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import cv2

# Configuration
IMAGE_SIZE = (48, 48)
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
BATCH_SIZE = 64
EPOCHS = 50
MODEL_SAVE_PATH = './models/emotion_model.h5'

def load_fer2013_data(csv_path='fer2013.csv'):
    """Load FER-2013 dataset from CSV"""
    if not os.path.exists(csv_path):
        print(f"FER-2013 CSV not found at {csv_path}")
        print("Please download FER-2013 dataset from Kaggle and place fer2013.csv in the root directory")
        return None, None

    data = pd.read_csv(csv_path)
    pixels = data['pixels'].tolist()
    emotions = data['emotion'].tolist()

    # Convert pixels to images
    images = []
    for pixel_sequence in pixels:
        face = [int(pixel) for pixel in pixel_sequence.split(' ')]
        face = np.asarray(face).reshape(48, 48)
        face = cv2.resize(face.astype('uint8'), IMAGE_SIZE)
        images.append(face.astype('float32'))

    images = np.asarray(images)
    images = np.expand_dims(images, -1)  # Add channel dimension for grayscale
    images = images / 255.0  # Normalize

    # Convert emotions to categorical
    emotions = np.asarray(emotions)
    emotions = keras.utils.to_categorical(emotions, num_classes=len(EMOTIONS))

    return images, emotions

def create_vgg_like_model(input_shape=(48, 48, 1), num_classes=7):
    """Create a VGG-like CNN model for emotion recognition"""
    model = models.Sequential([
        layers.Input(shape=input_shape),

        # Block 1
        layers.Conv2D(64, (3, 3), padding='same', activation='relu'),
        layers.Conv2D(64, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # Block 2
        layers.Conv2D(128, (3, 3), padding='same', activation='relu'),
        layers.Conv2D(128, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # Block 3
        layers.Conv2D(256, (3, 3), padding='same', activation='relu'),
        layers.Conv2D(256, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # Dense layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])

    return model

def create_resnet_like_model(input_shape=(48, 48, 1), num_classes=7):
    """Create a simplified ResNet-like model"""
    def residual_block(x, filters, kernel_size=3, stride=1):
        shortcut = x

        x = layers.Conv2D(filters, kernel_size, strides=stride, padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.ReLU()(x)

        x = layers.Conv2D(filters, kernel_size, strides=1, padding='same')(x)
        x = layers.BatchNormalization()(x)

        if stride != 1 or shortcut.shape[-1] != filters:
            shortcut = layers.Conv2D(filters, 1, strides=stride, padding='same')(shortcut)
            shortcut = layers.BatchNormalization()(shortcut)

        x = layers.Add()([x, shortcut])
        x = layers.ReLU()(x)
        return x

    inputs = layers.Input(shape=input_shape)

    x = layers.Conv2D(64, 7, strides=2, padding='same')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)
    x = layers.MaxPooling2D(3, strides=2, padding='same')(x)

    x = residual_block(x, 64)
    x = residual_block(x, 64)
    x = residual_block(x, 128, stride=2)
    x = residual_block(x, 128)
    x = residual_block(x, 256, stride=2)
    x = residual_block(x, 256)

    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = models.Model(inputs, outputs)
    return model

def train_model(model_type='vgg'):
    """Train the emotion recognition model"""
    print("Loading FER-2013 dataset...")
    images, emotions = load_fer2013_data()
    if images is None:
        return

    print(f"Dataset loaded: {images.shape[0]} samples")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        images, emotions, test_size=0.2, random_state=42
    )

    print(f"Training samples: {X_train.shape[0]}")
    print(f"Testing samples: {X_test.shape[0]}")

    # Create model
    if model_type.lower() == 'vgg':
        model = create_vgg_like_model()
        print("Using VGG-like model")
    elif model_type.lower() == 'resnet':
        model = create_resnet_like_model()
        print("Using ResNet-like model")
    else:
        model = create_vgg_like_model()
        print("Using default VGG-like model")

    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # Callbacks
    callbacks_list = [
        callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True
        ),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6
        ),
        callbacks.ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max'
        )
    ]

    # Train model
    history = model.fit(
        X_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(X_test, y_test),
        callbacks=callbacks_list
    )

    # Evaluate
    test_loss, test_acc = model.evaluate(X_test, y_test)
    print(f"\nTest accuracy: {test_acc:.4f}")

    # Save final model
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

    # Plot training history
    plt.figure(figsize=(12, 4))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()

    plt.tight_layout()
    plt.savefig('./models/training_history.png')
    plt.show()

if __name__ == "__main__":
    import sys
    model_type = sys.argv[1] if len(sys.argv) > 1 else 'vgg'
    train_model(model_type)