# 🚀 How to Run CampusConnect

## ✅ Your servers are already configured and ready!

## 📋 Prerequisites Check

Before running, make sure you have:
- ✅ Node.js installed (you have v24.7.0)
- ✅ MongoDB installed and running
- ✅ All dependencies installed

## 🎯 Option 1: Easy Way (Recommended)

### Run Both Servers with One Command:

```bash
./start.sh
```

This will:
- Kill any existing processes
- Start backend on port 5001
- Start frontend on port 3002
- Show you the URLs

## 🎯 Option 2: Manual Way (Two Terminals)

### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend (open new terminal):
```bash
npm run dev
```

## 🐛 If You Get "Port Already in Use" Error

### Quick Fix:
```bash
# Kill all Node and Vite processes
pkill -f "node.*server.js"
pkill -f "vite"

# Wait 2 seconds
sleep 2

# Then start again
```

### Or use specific ports:
```bash
# Kill process on specific port
lsof -ti:5001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

## 📍 Access Your Application

Once both servers are running:

**Frontend:** http://localhost:3002
**Backend API:** http://localhost:5001/api

## ✅ How to Know Servers are Running

You should see:

**Backend Terminal:**
```
🚀 Server running on port 5001
✅ MongoDB Connected
```

**Frontend Terminal:**
```
VITE v5.4.21  ready in 125 ms
➜  Local:   http://localhost:3002/
```

## 🎯 First Time Setup

1. **Open browser:** http://localhost:3002
2. **Click "Sign Up"**
3. **Create account:**
   - Name: Your Name
   - Email: test@test.com
   - Password: password123
   - Role: Student
   - Skills: React, Python, ML
4. **Click "Sign Up"**
5. **Start exploring!**

## 🛑 How to Stop Servers

Press `Ctrl + C` in each terminal window

Or kill all processes:
```bash
pkill -f "node.*server.js"
pkill -f "vite"
```

## 📊 Check if MongoDB is Running

```bash
# Check MongoDB status
mongosh --eval "db.version()"

# If not running, start it:
# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5001
lsof -i :3002

# Kill the process
kill -9 <PID>
```

### Dependencies Issues
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Backend dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

## 🎉 You're Ready!

Your CampusConnect platform is fully set up with:
- ✅ MongoDB backend
- ✅ User authentication
- ✅ Event registration
- ✅ Hackathon team formation
- ✅ All 50+ features

**Just run the servers and open http://localhost:3002!**
