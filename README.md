# CampusConnect

> A centralized, role-based web platform that connects students, club heads, and administrators to streamline campus life — events, hackathons, clubs, and more.

## 📌 Table of Contents
- [Project Description](#-project-description)
- [Authentication & Role-Based Access Control](#-authentication--role-based-access-control)
- [Key Workflows & Features](#-key-workflows--features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Screenshots & Visual Guide](#-screenshots--visual-guide)
- [Installation & Running the Project](#-installation--running-the-project)
- [Environment Variables](#-environment-variables)
- [Author](#-author)

## 💡 Project Description
CampusConnect is a centralized web platform designed to help students stay informed and actively involved in campus life. It solves the problem of scattered communication by bringing all campus activities — events, clubs, hackathons, and team formation — into a single, beautifully organized platform. 

## 🔐 Authentication & Role-Based Access Control
The platform employs a strict, role-based authorization system to ensure data security and maintain proper hierarchical workflows. Users are verified at login and routed to their specific dashboards based on their role. The platform strictly prevents unauthorized cross-role access (e.g., Students cannot access Admin endpoints).

### Access Permissions Table

| Feature / Page | Student 🎓 | Club Head 🏢 | System Admin 🛡️ |
| :--- | :---: | :---: | :---: |
| **Public Landing Page** | ✅ | ✅ | ✅ |
| **Explore Events & Hackathons** | ✅ | ✅ | ✅ |
| **View Event/Hackathon Details** | ✅ | ✅ | ✅ |
| **Register for Events** | ✅ | ❌ | ❌ |
| **Create & Join Teams** | ✅ | ❌ | ❌ |
| **View Student Dashboard** | ✅ | ❌ | ❌ |
| **Edit Personal Profile** | ✅ | ❌ | ❌ |
| **Create New Events** | ❌ | ✅ | ❌ |
| **Upload Banners & PDFs** | ❌ | ✅ | ❌ |
| **View Club Analytics/Attendance** | ❌ | ✅ | ❌ |
| **View Club Head Dashboard** | ❌ | ✅ | ❌ |
| **Approve / Reject Pending Events** | ❌ | ❌ | ✅ |
| **View Platform-wide Analytics** | ❌ | ❌ | ✅ |
| **Archive / Reactivate Clubs** | ❌ | ❌ | ✅ |
| **Reassign Club Heads** | ❌ | ❌ | ✅ |

---

## ✨ Key Workflows & Features

### 1. Team Formation & Join Requests (Student Flow)
CampusConnect makes it incredibly easy for students to find teammates for hackathons and competitions.
- **Creating a Team:** A student registers for a Hackathon and chooses "Register as a Team". They become the Team Lead, set the team name, required skills, and total team size. 
- **Finding Members:** Other students can browse open teams on the Hackathon details page. If their skills match the required skills, they can click "Request to Join".
- **Accept/Reject Workflow:** The Team Lead receives a notification in their dashboard. They can view the applicant's profile, skills, and department, and then choose to Accept or Reject them. Once accepted, the database automatically links the student to the team and decreases the available slots.

### 2. Event Creation & Management (Club Head Flow)
Club Heads have complete autonomy over their club's presence on the platform.
- **Drafting the Event:** Club Heads use a comprehensive 6-step form to create events, specifying dates, capacity, venues, and descriptions.
- **Media Uploads:** They can upload dynamic high-resolution event banners and informational PDFs (like rulebooks). These assets are securely uploaded and hosted on Cloudinary.
- **Tracking & Analytics:** Once the event is live, Club Heads can monitor real-time registration numbers, view attendee demographics (by department/year), and export attendee lists as CSV/PDF for physical check-ins.

### 3. Event Approval & Club Auditing (System Admin Flow)
Admins ensure platform quality and handle high-level management.
- **Event Auditing:** When a Club Head creates an event, it is marked as `Pending`. Admins receive a notification and can review the event details, banner, and rules. If appropriate, they click "Approve," which instantly makes the event visible to all students. If rejected, it returns to the Club Head.
- **Club Lifecycle Management:** Admins can view every active club. If a club becomes inactive, the Admin can "Archive" it, hiding it from public view while securely retaining all its historical data and analytics. Admins also have the power to reassign a Club Head if leadership changes.

---

## 🛠️ Tech Stack
### Frontend
- **React 18 (Vite)**
- **React Router DOM v6** (Protected Routing)
- **Zustand** (Global State Management)
- **Tailwind CSS** (Responsive UI/UX)
- **Recharts** & **Lucide React** (Data Visualization & Icons)
- **Axios** (API Requests)

### Backend
- **Node.js & Express.js**
- **Mongoose** (MongoDB ODM)
- **Multer & Cloudinary** (Secure File Uploads)
- **bcryptjs** (Password Hashing)
- **CORS & dotenv**

## 🏗️ Project Architecture
The application uses a modern MERN stack architecture:
- **Frontend**: A React Single Page Application (SPA) that manages global state with Zustand, persists session data in `localStorage`, and handles role-based client-side routing.
- **Backend**: A RESTful Express.js API that processes requests, hashes passwords with bcrypt, and interfaces with MongoDB.
- **Database**: Three separate isolated MongoDB collections (`students`, `admins`, `clubheads`) ensuring data remains clean and specifically structured for the needs of each role.

## 📁 Folder Structure
```text
CampusConnect/
├── backend/
│   ├── config/          # DB & Cloudinary configs
│   ├── controllers/     # API logic (auth, events, teams, analytics)
│   ├── models/          # Mongoose schemas (Student, Admin, ClubHead, Event, etc.)
│   ├── routes/          # Express route definitions
│   └── server.js        # Backend entry point
├── src/
│   ├── components/      # Reusable UI components (Navbar, Modals, Cards)
│   ├── pages/           # Route-level pages (Dashboards, Event Details, Auth)
│   ├── store/           # Zustand state (authStore, eventStore, clubStore)
│   ├── App.jsx          # Root routing & Auth Guards
│   └── main.jsx         # Frontend entry point
├── package.json         # Frontend dependencies
└── README.md
```

## 📸 Screenshots & Visual Guide

*(Note to Developer: Add screenshots below to make your repository stand out to recruiters and developers! Replace the placeholder text with your actual image links.)*

### 1. Landing Page & Explore
*(Showcase the beautiful, welcoming UI of the home page and the filtering system on the Explore Events page)*
> `![Home Page](./screenshots/home.png)`
> `![Explore Events](./screenshots/explore.png)`

### 2. Role-Based Dashboards
*(Show the contrast between what a Student sees vs what an Admin sees)*
> `![Student Dashboard](./screenshots/student_dashboard.png)`
> `![Admin Dashboard](./screenshots/admin_dashboard.png)`

### 3. Analytics & Data Visualization
*(Highlight the Recharts integration showing Bar/Line charts in the Club Head or Admin panel)*
> `![Analytics Charts](./screenshots/analytics.png)`

### 4. Team Formation & Event Details
*(Show the UI where a student requests to join a team, or the detailed view of a Hackathon)*
> `![Team Formation](./screenshots/team_formation.png)`
> `![Event Details](./screenshots/event_details.png)`

## 🚀 Installation & Running the Project

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd CampusConnect
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

### 3. Frontend Setup
Open a new terminal at the project root:
```bash
npm install
npm run dev
```

## 🔑 Environment Variables
You will need to create a `.env` file in the `backend/` directory.

```env
# backend/.env
PORT=5001
MONGO_URI=<your_mongodb_connection_string>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

## ✍️ Author
- **Fahad Furquan** - *Lead Developer*
