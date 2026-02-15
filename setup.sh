#!/bin/bash

echo "========================================="
echo "Facial Emotion Recognition Setup Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION installed"
else
    print_error "Node.js not found. Please install Node.js v18 or higher"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION installed"
else
    print_error "npm not found"
    exit 1
fi

# Check MongoDB
if command -v mongod &> /dev/null; then
    print_success "MongoDB installed"
else
    print_warning "MongoDB not found. Please ensure MongoDB is installed and running"
fi

echo ""
echo "========================================="
echo "Setting up Backend..."
echo "========================================="
echo ""

# Backend setup
cd backend

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created backend .env file"
    print_warning "Please edit backend/.env and configure your settings"
else
    print_warning "backend/.env already exists"
fi

# Install dependencies
print_warning "Installing backend dependencies (this may take a few minutes)..."
npm install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create logs directory
mkdir -p logs
print_success "Created logs directory"

cd ..

echo ""
echo "========================================="
echo "Setting up Frontend..."
echo "========================================="
echo ""

# Frontend setup
cd frontend

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created frontend .env file"
else
    print_warning "frontend/.env already exists"
fi

# Install dependencies
print_warning "Installing frontend dependencies (this may take a few minutes)..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure MongoDB:"
echo "   - Ensure MongoDB is running on localhost:27017"
echo "   - Or update MONGODB_URI in backend/.env"
echo ""
echo "2. Update environment variables:"
echo "   - Edit backend/.env"
echo "   - Edit frontend/.env"
echo ""
echo "3. Start the application:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "5. Create an admin user (after first run):"
echo "   - Register a user through the UI"
echo "   - Manually update role to 'admin' in MongoDB"
echo ""
echo "For more information, see README.md"
echo ""
