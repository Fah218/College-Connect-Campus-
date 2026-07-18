# CampusConnect

> A centralized, role-based web platform that connects students, club heads, and administrators to streamline campus life — events, hackathons, clubs, and more.

## 📌 Table of Contents
- [Project Description](#-project-description)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Installation & Running the Project](#-installation--running-the-project)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

## 💡 Project Description
CampusConnect is a centralized web platform designed to help students stay informed and actively involved in campus life. It solves the problem of scattered communication by bringing all campus activities — events, clubs, hackathons, and team formation — into a single organized platform. Each user role (Student, Club Head, Admin) gets a dedicated experience tailored to their responsibilities.

## ✨ Key Features
- **Student Portal**: Browse all upcoming events and hackathons, register with one click, edit profile, and view personalized event recommendations.
- **Club Head Portal**: Create events with a rich 6-section form, manage event status, and view analytics on attendance.
- **Admin Portal**: Review pending events, approve/reject with reasons, view platform analytics, and manage club listings.
- **Event Management**: Complete lifecycle from creation by Club Heads to approval by Admins and registration by Students.
- **Event Approval Workflow**: Streamlined approval process with audit logs and notifications.
- **Hackathon Management**: Dedicated pages to list hackathons, rules, and requirements.
- **Team Formation & Join Requests**: Post team requests with required skills, apply to teams, and accept applicants using an intelligent skill-based matcher.
- **Notifications**: Real-time bell icon dropdown with unread indicators for event approvals, team invitations, and registrations.
- **Analytics Dashboards**: Visual charts (Radar, Bar, Line) for insights like most active clubs, monthly event trends, and skill proficiency.
- **Cloudinary Image Upload**: Upload event banners and gallery photos directly.
- **PDF Upload**: Support for document attachments on events and hackathons.
- **Calendar & Timeline View**: Interactive planning modes for club heads and admins.
- **CSV & PDF Export**: Export attendance and event data for external reporting.
- **Profile Management**: Maintain skills, interests, and personal details.
- **Authentication & Role-Based Access**: Secure login and distinct routing/permissions for Students, Club Heads, and Admins.

## 🛠️ Tech Stack
### Frontend
- **React 18 (Vite)**
- **React Router DOM v6**
- **Zustand** (State Management)
- **Tailwind CSS**
- **Recharts** & **Lucide React**
- **Axios**

### Backend
- **Node.js & Express.js v5**
- **Mongoose** (MongoDB ODM)
- **Multer & Cloudinary** (File Uploads)
- **bcryptjs** (Authentication)
- **dotenv** & **CORS**

### Database
- **MongoDB Atlas**

## 🏗️ Project Architecture
The application uses a modern MERN stack architecture:
- **Frontend**: A React Single Page Application (SPA) that manages global state with Zustand, persists session data in `localStorage`, and handles role-based client-side routing.
- **Backend**: A RESTful Express.js API that processes requests, hashes passwords with bcrypt, and interfaces with MongoDB.
- **Database**: Three separate isolated MongoDB collections (`students`, `admins`, `clubheads`) ensuring data remains clean and specifically structured for the needs of each role.
- **API Flow**: Client (React) → Axios HTTP Request → Express Route → Controller → Mongoose Model → MongoDB Atlas.

## 📁 Folder Structure
```text
CampusConnect/
├── backend/
│   ├── config/          # DB & Cloudinary configs
│   ├── controllers/     # API logic (auth, events, teams)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   └── server.js        # Entry point
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level pages
│   ├── store/           # Zustand state
│   ├── App.jsx          # Root routing
│   └── main.jsx         # Entry point
├── package.json         # Frontend dependencies
└── README.md
```

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
# Create a .env file based on the Environment Variables section below
npm start
```
> Backend runs on `http://localhost:5001`

### 3. Frontend Setup
Open a new terminal at the project root:
```bash
npm install
npm run dev
```
> Frontend runs on `http://localhost:5173`

## 🔑 Environment Variables
You will need to create a `.env` file in the `backend/` directory. **Do NOT expose secret values** in version control.

```env
# backend/.env
PORT=5001
MONGO_URI=<your_mongodb_connection_string>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

## 📸 Screenshots

| Home Page | Student Dashboard |
|:---:|:---:|
| *(Placeholder for Home Page Screenshot)* | *(Placeholder for Student Dashboard Screenshot)* |

| Club Head Calendar | Admin Approvals |
|:---:|:---:|
| *(Placeholder for Calendar Screenshot)* | *(Placeholder for Admin Approvals Screenshot)* |

## 💡 Future Improvements
While the project is fully functional for demonstrations, the following production-level enhancements are planned:
- **JWT authentication**: Implementing robust backend token verification for all API routes.
- **Pagination**: Adding infinite scroll or page numbers for large datasets like platform registrations.
- **Image compression**: Optimizing user-uploaded assets on the client before uploading to Cloudinary.
- **Email notifications**: Integrating SendGrid or Nodemailer for real-time external alerts.
- **Rate limiting**: Protecting APIs from abuse using tools like `express-rate-limit`.

## ✍️ Author
- **Fahad Furquan** - *Lead Developer*
