#!/bin/bash

echo "🛑 Stopping StoreFlex services..."

# Kill Node.js processes
pkill -f "tsx watch"
pkill -f "vite"

# Stop Docker containers
docker-compose down

echo "✅ All services stopped."