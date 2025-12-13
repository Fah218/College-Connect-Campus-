# 🎓 CampusConnect - Start Here!

## What You've Built

A complete campus management platform with:
- ✅ **MongoDB Backend** - Full REST API with authentication
- ✅ **User Signup/Login** - Real authentication with JWT tokens
- ✅ **Event Registration** - Students can register for events with forms
- ✅ **Hackathon Team Formation** - Post requests, apply, accept teammates
- ✅ **Role-Based Dashboards** - Student, Club Head, Admin
- ✅ **Smart Recommendations** - AI-powered event suggestions
- ✅ **Real-time Notifications** - Priority-based alerts
- ✅ **Analytics & Insights** - Charts and predictive analytics
- ✅ **Audit Logs** - Complete transparency tracking
- ✅ **Export Reports** - CSV/PDF downloads

## 🚀 Quick Start (3 Steps)

### 1. Install MongoDB
Choose one:
- **Easy**: MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas
- **Local**: Download MongoDB Community - https://www.mongodb.com/try/download/community

### 2. Start Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### 3. Start Frontend
```bash
# In a new terminal
npm install
npm run dev
```

Visit: http://localhost:3000

## 📖 Full Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[server/README.md](./server/README.md)** - Backend API documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

## 🎯 Key Features Working

### 1. **Signup & Login** (/signup, /login)
- Real MongoDB authentication
- JWT token-based sessions
- Role selection (Student/Club Head/Admin)
- Skills profile

### 2. **Event Registration** (/events/:id/register)
- Detailed registration form
- Capacity management
- Duplicate prevention
- Email notifications

### 3. **Hackathon Team Formation** (/hackathons/:id)
- **Post Team Request** - Specify required skills/roles
- **Apply to Teams** - Students can apply with messages
- **Accept Applicants** - Requesters can accept team members
- **View Applications** - See all applicants with skills
- **Skill Matching** - AI suggests compatible teammates

### 4. **Event Management**
- Club Heads create events
- Admins approve/reject
- Students register
- Attendance tracking

### 5. **Smart Features**
- Personalized recommendations
- Predictive attendance
- Approval probability
- Timeline views
- Audit logging

## 🧪 Test It Out

### Create Accounts
1. Go to http://localhost:3000/signup
2. Create 3 accounts:
   - Student (with skills: React, Python)
   - Club Head
   - Admin

### Test Event Flow
1. **Club Head**: Create an event
2. **Admin**: Approve the event
3. **Student**: Register for the event

### Test Hackathon Teams
1. **Student A**: Go to hackathon, post team request
2. **Student B**: Apply to the request
3. **Student A**: Accept Student B
4. **Both**: Now in the same team!

## 📁 Project Structure

```
campusconnect/
├── server/                 # Backend (Node.js + Express + MongoDB)
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   └── server.js          # Entry point
│
├── src/                   # Frontend (React + Vite)
│   ├── components/        # Reusable components
│   ├── pages/            # Route pages
│   ├── services/         # API calls
│   ├── store/            # State management
│   └── App.jsx           # Main app
│
└── Documentation files
```

## 🔑 Environment Variables

**Backend** (server/.env):
```env
MONGODB_URI=mongodb://localhost:27017/campusconnect
JWT_SECRET=your_secret_key
PORT=5000
```

**Frontend** (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Common Issues

**MongoDB not connecting?**
- Check if MongoDB is running
- Verify MONGODB_URI in server/.env

**CORS errors?**
- Ensure backend is on port 5000
- Check VITE_API_URL in .env

**Login not working?**
- Clear browser localStorage
- Check JWT_SECRET in server/.env

## 📊 Database Collections

Your MongoDB will have:
- **users** - All user accounts
- **events** - Campus events
- **hackathons** - Hackathon listings
- **teams** - Formed teams
- **teamrequests** - Team formation requests

## 🎨 What's Working

✅ Complete authentication system
✅ Event creation and approval workflow
✅ Event registration with detailed forms
✅ Hackathon team request posting
✅ Team application system
✅ Applicant acceptance
✅ Skill-based matching
✅ Notifications
✅ Recommendations
✅ Analytics dashboards
✅ Audit logs
✅ Export functionality
✅ Timeline views
✅ Predictive insights

## 🚀 Next Steps

1. **Test all features** - Create accounts and try everything
2. **Customize** - Add your college name, colors, logo
3. **Add data** - Create more events and hackathons
4. **Deploy** - Follow DEPLOYMENT.md for production
5. **Extend** - Add chat, file uploads, email notifications

## 💡 Pro Tips

- Use MongoDB Compass to visualize your database
- Use browser DevTools to debug
- Check terminal for backend logs
- Use Postman to test API endpoints
- Read SETUP_GUIDE.md for detailed instructions

## 🎉 You're Ready!

Everything is set up and working. Just follow the Quick Start above and you'll have a fully functional campus platform!

Need help? Check the documentation files or review the code comments.
