#!/bin/bash

echo "🎓 Starting CampusConnect..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend
echo "🚀 Starting Backend Server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🚀 Starting Frontend Server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo ""
echo "📍 Backend:  http://localhost:5001"
echo "📍 Frontend: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
