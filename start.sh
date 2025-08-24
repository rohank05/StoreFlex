#!/bin/bash

echo "🚀 Starting StoreFlex - Multi-Tenant Inventory Management System"
echo "================================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "📊 Starting database services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔧 Installing dependencies..."
cd backend && npm install
cd ../frontend && npm install
cd ..

echo "🗄️  Setting up database..."
cd backend
npm run db:generate

echo "🎯 Starting backend server..."
npm run dev &
BACKEND_PID=$!

cd ../frontend

echo "🎨 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ StoreFlex is now running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 API Health: http://localhost:3000/health"
echo ""
echo "🛑 To stop the servers:"
echo "   Press Ctrl+C or run: ./stop.sh"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID