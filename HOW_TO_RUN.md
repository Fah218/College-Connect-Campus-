# 🚀 How to Run CampusConnect (Frontend Only)

## ✅ Backend Removed - Frontend Only!

Your project now runs **without any backend**. All features work with mock data stored in the browser.

---

## 🎯 Quick Start (2 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the App
```bash
npm run dev
```

**That's it!** Open your browser: **http://localhost:3000**

---

## 🌐 Access the Application

**URL:** http://localhost:3000

---

## 🎮 How to Use

### 1. **Login (Demo Mode)**
- Go to http://localhost:3000/login
- Enter **any email** (e.g., test@test.com)
- Enter **any password** (e.g., password123)
- Select role: **Student**, **Club Head**, or **Admin**
- Click **"Sign In"**

### 2. **Signup**
- Go to http://localhost:3000/signup
- Fill in the form
- Add skills: React, Python, ML (comma-separated)
- Click **"Sign Up"**

### 3. **Register for Events**
1. Login as **Student**
2. Browse events on dashboard
3. Click **"Register Now"** on any event
4. Fill the registration form
5. Submit
6. ✅ You're registered!

### 4. **Form Hackathon Teams**
1. Go to **Hackathons** page
2. Click on "AI Innovation Challenge"
3. Click **"Post Request"** button
4. Fill in:
   - Title: "Looking for Frontend Developer"
   - Description: "Building AI chatbot"
   - Select skills: React, Node.js
   - Select roles: Frontend, Full-Stack
5. Click **"Post Request"**
6. ✅ Request posted!

### 5. **Apply to Teams**
1. Logout and create another account
2. Go to same hackathon
3. Find the team request
4. Click **"Apply to Join"**
5. Write message: "I have React experience!"
6. Submit
7. ✅ Application sent!

### 6. **Accept Applicants**
1. Login with first account
2. Go to hackathon
3. Click **"View Applications"** on your request
4. See the applicant
5. Click **"Accept"**
6. ✅ Team formed!

---

## 📱 All Pages

- **Home:** http://localhost:3000/
- **Signup:** http://localhost:3000/signup
- **Login:** http://localhost:3000/login
- **Student Dashboard:** http://localhost:3000/student
- **Club Head Dashboard:** http://localhost:3000/club-head
- **Admin Dashboard:** http://localhost:3000/admin
- **Hackathons:** http://localhost:3000/hackathons
- **Teammate Finder:** http://localhost:3000/teammate-finder

---

## 🛑 How to Stop

Press `Ctrl + C` in the terminal

---

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Kill the process
pkill -f "vite"

# Or use different port
npm run dev -- --port 3001
```

### Dependencies Issues?
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Data
- Open DevTools (F12)
- Application tab → Clear Storage
- Reload page

---

## 💾 Data Storage

All data is stored in:
- **Browser localStorage** - Persists across sessions
- **Zustand stores** - In-memory state
- **Mock data** - Initial content

No database or backend needed!

---

## 🎨 Features Working

✅ User signup & login (mock)
✅ Event registration
✅ Hackathon team formation
✅ Post team requests
✅ Apply to teams
✅ Accept applicants
✅ Event creation (Club Head)
✅ Event approval (Admin)
✅ Notifications
✅ Recommendations
✅ Analytics dashboards
✅ Timeline views
✅ Audit logs
✅ Export reports
✅ All 50+ features!

---

## 🚀 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

---

## 📦 Deploy

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages
1. Build: `npm run build`
2. Upload `dist/` folder to GitHub Pages

---

## 🎉 You're All Set!

Your CampusConnect platform is:
- ✅ Frontend only (no backend)
- ✅ All features working
- ✅ Mock data
- ✅ Ready to use
- ✅ Easy to deploy

**Just run `npm run dev` and open http://localhost:3000!**

---

## 📝 Notes

- All authentication is mock (no real security)
- Data persists in browser localStorage
- Perfect for demos and prototypes
- No MongoDB or backend server needed
- Can be connected to real backend later if needed

---

**Enjoy your fully functional campus platform!** 🎓
