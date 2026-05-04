# 🎓 Campus Connect

> A centralized, role-based web platform that connects students, club heads, and administrators to streamline campus life — events, hackathons, clubs, and more.

---

## 📌 Table of Contents

1. [Project Idea](#-project-idea)
2. [Problem Statement](#-problem-statement)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [User Roles & Permissions](#-user-roles--permissions)
6. [Features](#-features)
7. [Frontend Architecture](#-frontend-architecture)
8. [Backend Architecture](#-backend-architecture)
9. [Database Design](#-database-design)
10. [Component Reference](#-component-reference)
11. [Page Reference](#-page-reference)
12. [API Reference](#-api-reference)
13. [How to Run](#-how-to-run)
14. [Environment Variables](#-environment-variables)
15. [System Workflow](#-system-workflow)

---

## 💡 Project Idea

**Campus Connect** is a centralized web platform designed to help students stay informed and actively involved in campus life. It solves the problem of scattered communication by bringing all campus activities — events, clubs, hackathons, and team formation — into a single organized platform.

Each user role (Student, Club Head, Admin) gets a dedicated experience tailored to their responsibilities.

---

## 🚫 Problem Statement

In most colleges:
- Event information is scattered across WhatsApp groups, Instagram pages, and notice boards
- Students frequently **miss opportunities** because they never heard about them
- Club heads have **no structured way** to manage event submissions and track participation
- There is **no organized system** for hackathon team formation within a campus
- Administrators have **no centralized dashboard** to approve, monitor, or audit club activities

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** (Vite) | UI framework, component-based architecture |
| **React Router DOM v6** | Client-side routing and navigation |
| **Zustand** | Lightweight global state management |
| **Recharts** | Charts and data visualization (Radar, Bar, Line charts) |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting and calendar utilities |
| **Axios** | HTTP client for API calls |
| **Tailwind CSS** | Utility-first styling framework |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js v5** | Web server and routing framework |
| **Mongoose** | MongoDB ODM for schema definition and queries |
| **bcryptjs** | Password hashing and verification |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request handling |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |

---

## 📁 Project Structure

```
COLLEGE CAMPUS/
│
├── backend/                        # Node.js + Express backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── controllers/
│   │   └── authController.js       # Auth logic: register, login, update
│   ├── models/
│   │   ├── Student.js              # Mongoose schema for students
│   │   ├── Admin.js                # Mongoose schema for admins
│   │   └── ClubHead.js             # Mongoose schema for club heads
│   ├── routes/
│   │   └── authRoutes.js           # Auth API routes
│   ├── server.js                   # Express app entry point
│   └── .env                        # Environment variables (not committed)
│
├── src/                            # React frontend source
│   ├── components/                 # Reusable UI components
│   │   ├── Navbar.jsx              # Top navigation bar
│   │   ├── ProtectedRoute.jsx      # Role-based route guard
│   │   ├── ProfileEditForm.jsx     # Shared edit profile form
│   │   ├── EventCard.jsx           # Event preview card
│   │   ├── StatCard.jsx            # Dashboard metric card
│   │   ├── Timeline.jsx            # Event timeline view
│   │   ├── InsightCard.jsx         # Analytics insight card
│   │   ├── NotificationBell.jsx    # Notification dropdown
│   │   ├── ExportButton.jsx        # CSV/PDF export button
│   │   ├── PredictiveInsights.jsx  # AI prediction display
│   │   ├── RecommendedSection.jsx  # Event recommendations
│   │   └── SkillMatcher.jsx        # Hackathon skill-based matcher
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── HomePage.jsx            # Landing page
│   │   ├── LoginPage.jsx           # Role-based login
│   │   ├── SignupPage.jsx          # Role-based registration
│   │   ├── StudentDashboard.jsx    # Student home dashboard
│   │   ├── StudentProfilePage.jsx  # Student profile (charts, skills)
│   │   ├── AdminDashboard.jsx      # Admin control panel
│   │   ├── AdminProfilePage.jsx    # Admin profile page
│   │   ├── ClubHeadDashboard.jsx   # Club head event management
│   │   ├── ClubHeadProfilePage.jsx # Club head profile page
│   │   ├── EventRegistrationPage.jsx # Student event registration
│   │   ├── HackathonPage.jsx       # Hackathon listings
│   │   ├── HackathonDetails.jsx    # Full hackathon detail view
│   │   └── TeammateFinder.jsx      # Find teammates for hackathons
│   │
│   ├── store/                      # Zustand state stores
│   │   ├── authStore.js            # Authentication & user state
│   │   ├── eventStore.js           # Events state & CRUD
│   │   └── analyticsStore.js       # Analytics & AI predictions
│   │
│   ├── App.jsx                     # Root component with routes
│   ├── main.jsx                    # React app entry point
│   └── index.css                   # Global styles & Tailwind config
│
├── package.json                    # Frontend dependencies
└── README.md                       # This file
```

---

## 👥 User Roles & Permissions

Campus Connect uses a **role-based access control (RBAC)** system. Each role has dedicated pages and permissions.

| Feature | Student | Club Head | Admin |
|---|:---:|:---:|:---:|
| View events | ✅ | ✅ | ✅ |
| Register for events | ✅ | — | — |
| Create events | — | ✅ | — |
| Approve / Reject events | — | — | ✅ |
| View event analytics | — | ✅ | ✅ |
| Find hackathon teammates | ✅ | — | — |
| View audit logs | — | — | ✅ |
| Manage club listing | — | — | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| Planning calendar view | — | ✅ | — |

---

## ✨ Features

### 🧑‍🎓 Student Features
- Browse all upcoming events and hackathons
- Register for events with one click
- Find hackathon teammates using a **skill-based matcher**
- Personal profile with:
  - Radar chart for **skill proficiency**
  - Bar chart for **event participation history**
  - Interests tags, department, year
  - Phone number and profile image
- Edit profile directly from the profile page

### 🏛️ Club Head Features
- **Create events** with a rich 6-section form:
  - Basic Info (title, short desc, detailed desc)
  - Date & Time (start, end, registration deadline)
  - Location (Online/Offline/Hybrid + venue/link)
  - Category & Tags (Hackathon, Workshop, Seminar, Competition)
  - Participation Settings (Individual / Team, max size)
  - Media (event banner image upload)
- Three dashboard views: **Table View**, **Timeline View**, **Calendar View (Planning Mode)**
- **Interactive Calendar**:
  - Click a date → see all events on that day
  - Click an event pill → view full event details modal
  - Color-coded by status (green=approved, yellow=pending, red=rejected)
- AI-powered approval probability and attendance predictions
- Export event data to CSV

### 🔐 Admin Features
- **Event Approvals** with enhanced review:
  - Compact cards with banner, category, key info
  - **View Details** button → full event modal with all 6 sections of info
  - Approve or reject directly from within the details modal
  - Rejection requires a typed reason (no more browser prompts)
- Platform analytics: most active clubs, monthly event trends
- Audit log for all approval/rejection actions (exportable)
- Club management table
- Admin profile with system overview metrics

### 🔒 Shared / System Features
- Secure password hashing with bcrypt
- Only one admin account allowed (first-registered admin is permanent)
- Role-based protected routes (unauthenticated users redirected to login)
- Persistent session with Zustand + localStorage
- Real-time UI updates after profile edits
- Profile image upload from local system (base64 encoding)
- Notification system with unread indicator

---

## 🖥️ Frontend Architecture

The frontend is a **React 18 Single Page Application (SPA)** powered by Vite.

### Routing (`App.jsx`)
Routes are protected using the `ProtectedRoute` component, which checks both authentication status and user role before rendering a page.

```
/                   → HomePage (public)
/login              → LoginPage (public)
/signup             → SignupPage (public)
/student            → StudentDashboard (role: student)
/student/profile    → StudentProfilePage (role: student)
/admin              → AdminDashboard (role: admin)
/admin/profile      → AdminProfilePage (role: admin)
/club-head          → ClubHeadDashboard (role: club_head)
/club-head/profile  → ClubHeadProfilePage (role: club_head)
/hackathons         → HackathonPage (authenticated)
/hackathon/:id      → HackathonDetails (authenticated)
/teammate-finder    → TeammateFinder (authenticated)
/event/:id          → EventRegistrationPage (authenticated)
```

### State Management (Zustand)
Three global stores manage application state:

| Store | Manages |
|---|---|
| `authStore` | Logged-in user, login/logout, updateProfile, notifications |
| `eventStore` | All events, addEvent, updateEvent, deleteEvent, approveEvent, rejectEvent, audit logs |
| `analyticsStore` | Predictive insights, attendance/approval predictions |

State is **persisted to localStorage** via the Zustand `persist` middleware so sessions survive page refreshes.

---

## ⚙️ Backend Architecture

The backend is a **RESTful API** built with Express.js.

### Request Flow
```
Client (React) → Axios HTTP Request → Express Route → Controller → Mongoose Model → MongoDB Atlas
```

### Server Entry (`server.js`)
- Loads `.env` with dotenv
- Connects to MongoDB via `config/db.js`
- Registers CORS and JSON middleware
- Mounts all routes under `/api/auth`

---

## 🗄️ Database Design

Three separate MongoDB collections store user data, one per role.

### `students` Collection
```js
{
  name:         String (required),
  email:        String (required, unique),
  password:     String (required, hashed),
  rollNumber:   String (required),
  department:   String (required),
  year:         String,              // "1st", "2nd", "3rd", "4th"
  skills:       [String],            // ["React", "Python"]
  interests:    [String],            // ["AI", "Web Dev"]
  profileImage: String,              // base64 image or URL
  phone:        String,
  role:         String (default: "Student"),
  createdAt:    Date,
  updatedAt:    Date
}
```

### `admins` Collection
```js
{
  name:         String (required),
  email:        String (required, unique),
  password:     String (required, hashed),
  employeeId:   String (required, unique),
  department:   String (required),
  phone:        String,
  profileImage: String,
  role:         String (default: "Admin"),
  createdAt:    Date,
  updatedAt:    Date
}
```
> ⚠️ **Only one admin can exist.** The system rejects any second admin registration with a `403` error.

### `clubheads` Collection
```js
{
  name:            String (required),
  email:           String (required, unique),
  password:        String (required, hashed),
  studentId:       String (required),
  clubName:        String (required, unique),
  clubDescription: String,
  profileImage:    String,
  contactNumber:   String,
  role:            String (default: "ClubHead"),
  createdAt:       Date,
  updatedAt:       Date
}
```

---

## 🧩 Component Reference

| Component | Purpose |
|---|---|
| `Navbar.jsx` | Top nav bar; shows links based on role; clicking profile navigates to role-specific profile page |
| `ProtectedRoute.jsx` | Wraps routes; redirects to `/login` if not authenticated; checks role if `requiredRole` prop passed |
| `ProfileEditForm.jsx` | Shared edit form; dynamically shows Student/ClubHead/Admin-specific fields; submits to backend and updates session |
| `EventCard.jsx` | Card component for previewing an event (title, date, category, status) |
| `StatCard.jsx` | Metric card for dashboards (icon, label, value, color) |
| `Timeline.jsx` | Chronological event timeline view for both admin and club head dashboards |
| `InsightCard.jsx` | Displays a single AI-generated platform insight |
| `NotificationBell.jsx` | Bell icon with dropdown list of unread notifications |
| `ExportButton.jsx` | Button that exports data to CSV or PDF |
| `PredictiveInsights.jsx` | Shows AI attendance and approval predictions |
| `RecommendedSection.jsx` | Personalized event recommendations for students |
| `SkillMatcher.jsx` | Matches students to hackathon teammates based on skills |

---

## 📄 Page Reference

| Page | Route | Description |
|---|---|---|
| `HomePage.jsx` | `/` | Public landing page with hero section and feature highlights |
| `LoginPage.jsx` | `/login` | Role selector + login form; stores session in Zustand |
| `SignupPage.jsx` | `/signup` | Registration form; student and club head tabs with role-specific fields |
| `StudentDashboard.jsx` | `/student` | Student home; event listings, recommendations, skill matcher |
| `StudentProfilePage.jsx` | `/student/profile` | Skill radar chart, interests, event participation bar chart, profile edit |
| `AdminDashboard.jsx` | `/admin` | Approvals tab, analytics charts, audit log, club management |
| `AdminProfilePage.jsx` | `/admin/profile` | System overview stats, approval metrics, growth trend chart |
| `ClubHeadDashboard.jsx` | `/club-head` | Event table, timeline, interactive calendar with click-to-view; create event modal (6 sections) |
| `ClubHeadProfilePage.jsx` | `/club-head/profile` | Club info, event stats, top performing event, attendance insights |
| `EventRegistrationPage.jsx` | `/event/:id` | Full event detail + registration form for students |
| `HackathonPage.jsx` | `/hackathons` | List of all hackathons with filters |
| `HackathonDetails.jsx` | `/hackathon/:id` | Full hackathon details, team requirements, registration |
| `TeammateFinder.jsx` | `/teammate-finder` | Skill-based teammate search and connection for hackathons |

---

## 🔌 API Reference

Base URL: `http://localhost:5001/api/auth`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/register` | `{ name, email, password, role, ...roleFields }` | Register a new user (Student or ClubHead). Admin is restricted after first registration. |
| `POST` | `/login` | `{ email, password, role }` | Log in a user; returns user object (without password). |
| `PUT` | `/update/:id` | `{ role, name, email, phone, ... }` | Update any profile field by user ID. Role field from body is used to target the correct collection. |

### Example: Student Registration
```json
POST /api/auth/register
{
  "name": "Fahad Furquan",
  "email": "fahad@example.com",
  "password": "secure123",
  "role": "Student",
  "department": "Computer Science",
  "year": "3rd",
  "skills": ["React", "Python"],
  "interests": ["AI", "Web Dev"],
  "phone": "+91 99999 00000",
  "rollNumber": "STU12345"
}
```

### Example: Club Head Registration
```json
POST /api/auth/register
{
  "name": "Ali Hassan",
  "email": "ali@example.com",
  "password": "secure123",
  "role": "ClubHead",
  "clubName": "Coding Club",
  "clubDescription": "A club for passionate coders.",
  "contactNumber": "+91 88888 00000",
  "studentId": "STU98765"
}
```

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- npm v9+
- A MongoDB Atlas account (or local MongoDB)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Fah218/College-Connect-Campus-.git
cd "College-Connect-Campus-"
```

---

### 2. Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5001
```

Start the backend server:
```bash
npm start
```
> Backend runs on: `http://localhost:5001`

---

### 3. Set Up Frontend

Open a **new terminal** at the project root:
```bash
npm install
npm run dev
```
> Frontend runs on: `http://localhost:5173`

---

### 4. First Time Setup

1. Go to `http://localhost:5173/signup`
2. Register as a **Club Head** (tab selection available)
3. Go to `/login` and log in as that Club Head
4. To set up an Admin, you **must register once** — subsequent admin registrations are blocked automatically
5. After the first Admin is created, subsequent visits to `/signup` only show Student & Club Head options

---

## 🔑 Environment Variables

### `backend/.env`
```env
MONGO_URI=<your MongoDB connection string>
PORT=5001
```

> Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 🔄 System Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    User visits Campus Connect               │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   Login / Sign Up     │
              │  (Role Selected)      │
              └───────────┬───────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────────┐
    │   STUDENT   │ │ CLUB HEAD  │ │    ADMIN     │
    └──────┬──────┘ └─────┬──────┘ └────┬─────────┘
           │              │              │
    Browse events   Create Event    Review pending
    Register for    (6-section form) events
    events          ↓               ↓
    Find teammates  Submitted as    Approve / Reject
    View profile    "pending"       with reason
    Edit profile    ↓               ↓
                    Appears in      Audit log
                    Admin's         updated
                    approvals tab   ↓
                    ↓               Event goes live
                    Calendar view   on platform
                    shows event
                    with status dot
```

---

## 📊 Charts & Visualizations Used

| Chart | Location | Data Shown |
|---|---|---|
| **Radar Chart** | Student Profile | Skill proficiency levels |
| **Bar Chart** | Student Profile | Monthly event participation |
| **Bar Chart** | Admin Dashboard | Most active clubs by attendees |
| **Line Chart** | Admin Dashboard | Monthly event trends |
| **Bar Chart** | Club Head Profile | Event stats (approved/pending/rejected) |
| **Calendar Grid** | Club Head Dashboard | Events plotted on a monthly calendar |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add: my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

This project is created for educational purposes as part of a college project.

---

*Built with ❤️ for better campus connectivity.*
