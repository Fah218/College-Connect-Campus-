# CampusConnect - Complete Setup Guide

## 🚀 Quick Start

### Step 1: Install MongoDB

**Option A: Local Installation**
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Mac**: `brew install mongodb-community`
- **Linux**: `sudo apt-get install mongodb`

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier available)
4. Get connection string
5. Whitelist your IP address

### Step 2: Setup Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusconnect
# OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/campusconnect
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

Server should be running on http://localhost:5000

### Step 3: Setup Frontend

Open a new terminal:

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

Start the frontend:
```bash
npm run dev
```

Frontend should be running on http://localhost:3000

## 📝 Creating Test Accounts

### Method 1: Using the Signup Page
1. Go to http://localhost:3000/signup
2. Fill in the form
3. Select role (Student/Club Head/Admin)
4. Add skills (comma-separated)
5. Click "Sign Up"

### Method 2: Using API (curl)

**Create Student Account:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Student",
    "email": "student@test.com",
    "password": "password123",
    "role": "student",
    "department": "Computer Science",
    "year": "3rd",
    "skills": ["React", "Python", "Machine Learning"]
  }'
```

**Create Club Head Account:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane ClubHead",
    "email": "clubhead@test.com",
    "password": "password123",
    "role": "club_head",
    "department": "Computer Science"
  }'
```

**Create Admin Account:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'
```

## 🎯 Testing Features

### 1. Event Registration
1. Login as Student
2. Go to Student Dashboard
3. Browse events
4. Click "Register Now" on any event
5. Fill registration form
6. Submit

### 2. Hackathon Team Formation
1. Login as Student
2. Go to Hackathons page
3. Click on any hackathon
4. Click "Post Request" to create team request
5. Fill in required skills and roles
6. Other students can apply to your request
7. Accept applicants to form your team

### 3. Event Creation & Approval
1. Login as Club Head
2. Go to Club Head Dashboard
3. Click "Create Event"
4. Fill event details
5. Submit for approval
6. Login as Admin
7. Go to Admin Dashboard
8. Approve or reject the event

### 4. Team Request Application
1. Login as Student A
2. Go to Hackathon Details
3. Post a team request
4. Logout and login as Student B
5. Go to same hackathon
6. Click "Apply to Join" on the request
7. Write a message
8. Submit application
9. Login back as Student A
10. View applications and accept

## 🔧 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: Start MongoDB service from Services
```

### Port Already in Use
```bash
# Kill process on port 5000
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Errors
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend .env
- Restart both servers

### JWT Token Errors
- Clear browser localStorage
- Logout and login again
- Check JWT_SECRET in server/.env

## 📊 Database Verification

Check if data is being saved:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use campusconnect

# View collections
show collections

# View users
db.users.find().pretty()

# View events
db.events.find().pretty()

# View hackathons
db.hackathons.find().pretty()

# View team requests
db.teamrequests.find().pretty()
```

## 🎨 Features to Test

- ✅ User Signup & Login
- ✅ Student Dashboard with recommendations
- ✅ Event browsing and filtering
- ✅ Event registration with form
- ✅ Hackathon listing
- ✅ Team request posting
- ✅ Team request application
- ✅ Applicant acceptance
- ✅ Club Head event creation
- ✅ Admin event approval
- ✅ Notifications system
- ✅ Timeline views
- ✅ Analytics dashboards
- ✅ Audit logs
- ✅ Export reports

## 📱 Demo Credentials

After creating accounts, you can use:

**Student:**
- Email: student@test.com
- Password: password123

**Club Head:**
- Email: clubhead@test.com
- Password: password123

**Admin:**
- Email: admin@test.com
- Password: password123

## 🚀 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## 💡 Tips

1. **Use MongoDB Compass** - GUI tool to visualize your database
2. **Use Postman** - Test API endpoints easily
3. **Check Browser Console** - For frontend errors
4. **Check Terminal** - For backend errors
5. **Clear Cache** - If seeing old data

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error messages in terminal
3. Check browser console
4. Verify MongoDB is running
5. Ensure all dependencies are installed
