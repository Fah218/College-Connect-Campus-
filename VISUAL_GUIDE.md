# 🎨 CampusConnect - Visual Feature Guide

## 🏠 Home Page (`/`)
```
┌─────────────────────────────────────────────┐
│  🎓 CampusConnect                    Login  │
├─────────────────────────────────────────────┤
│                                             │
│     Connect. Collaborate. Compete.          │
│                                             │
│  [Explore Events] [Join Hackathons] [Login]│
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Event    │ │ Hackathon│ │ Analytics│   │
│  │ Mgmt     │ │ Hub      │ │ Dashboard│   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  📊 500+ Students | 50+ Clubs | 200+ Events│
└─────────────────────────────────────────────┘
```

## 📝 Signup Page (`/signup`)
```
┌─────────────────────────────────────────────┐
│         🎓 CampusConnect                    │
│         Create your account                 │
├─────────────────────────────────────────────┤
│  Full Name: [________________]              │
│  Email:     [________________]              │
│  Password:  [________________]              │
│  Confirm:   [________________]              │
│  Role:      [Student ▼]                     │
│  Department:[Computer Science]              │
│  Year:      [3rd Year ▼]                    │
│  Skills:    [React, Python, ML]             │
│                                             │
│         [Sign Up]                           │
│                                             │
│  Already have account? Login here          │
└─────────────────────────────────────────────┘
```

## 🔐 Login Page (`/login`)
```
┌─────────────────────────────────────────────┐
│         🎓 CampusConnect                    │
│         Sign in to your account             │
├─────────────────────────────────────────────┤
│  Email:    [________________]               │
│  Password: [________________]               │
│                                             │
│         [Sign In]                           │
│                                             │
│  Don't have account? Sign up here          │
└─────────────────────────────────────────────┘
```

## 👨‍🎓 Student Dashboard (`/student`)
```
┌─────────────────────────────────────────────┐
│  🎓 CampusConnect    🔔(3)  👤 John  Logout │
├─────────────────────────────────────────────┤
│  Student Dashboard                          │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │📅 5  │ │🏆 2  │ │👥 3  │ │📆 12 │      │
│  │Events│ │Hacks │ │Invites│ │Coming│      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  ✨ Recommended for You                     │
│  ┌─────────────────────────────────────┐   │
│  │ AI Workshop                         │   │
│  │ 📍 Lab A | 👥 45/100               │   │
│  │ 💡 Matches your AI interest        │   │
│  │ [Register Now]                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [List View] [Timeline View]                │
│  🔍 Search... [Category ▼]                  │
│                                             │
│  All Events                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Event1│ │Event2│ │Event3│               │
│  └──────┘ └──────┘ └──────┘               │
└─────────────────────────────────────────────┘
```

## 📅 Event Registration (`/events/:id/register`)
```
┌─────────────────────────────────────────────┐
│  🎓 CampusConnect                           │
├─────────────────────────────────────────────┤
│  Event Registration                         │
│                                             │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Event Details   │  │ Registration    │  │
│  │                 │  │ Form            │  │
│  │ AI Workshop     │  │                 │  │
│  │ 📅 Jan 15, 2pm  │  │ Name: [_____]   │  │
│  │ 📍 Lab A        │  │ Email: [____]   │  │
│  │ 👥 45/100       │  │ Phone: [____]   │  │
│  │                 │  │ Dept: [_____]   │  │
│  │ Description:    │  │ Year: [▼]       │  │
│  │ Learn AI...     │  │                 │  │
│  │                 │  │ Expectations:   │  │
│  │ Tags: AI, ML    │  │ [___________]   │  │
│  │                 │  │                 │  │
│  │                 │  │ [Register]      │  │
│  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🏆 Hackathon Details (`/hackathons/:id`)
```
┌─────────────────────────────────────────────┐
│  🎓 CampusConnect                           │
├─────────────────────────────────────────────┤
│  🏆 AI Innovation Challenge                 │
│  [AI/ML]                                    │
│                                             │
│  📅 Feb 10, 2025  | ⏰ Deadline: Feb 5     │
│  📍 Tech University | 👥 Team: 2-4         │
│  💰 Prize: $5000   | 🎓 Undergrad only     │
│                                             │
│  🤖 AI Summary: Focuses on AI/ML, requires │
│     strong ML and data science skills      │
│                                             │
│  About: Build innovative AI solutions...   │
│                                             │
│  [Find Teammates] [Register Team]          │
│                                             │
│  🔍 Skill Gap Analysis                      │
│  ⚠️ Missing: Python, ML, TensorFlow        │
│  ✅ Have: React, JavaScript                │
│                                             │
│  💡 Suggested Teammates:                    │
│  ┌─────────────────────────────────────┐   │
│  │ Alice Johnson                       │   │
│  │ Skills: Python, ML, TensorFlow      │   │
│  │ [Invite]                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Looking for Teammates      [+ Post Request]│
│  ┌─────────────────────────────────────┐   │
│  │ Need Frontend Developer             │   │
│  │ by John Doe | 3 applicants          │   │
│  │ Skills: React, Node.js, UI/UX       │   │
│  │ Roles: Frontend, Full-Stack         │   │
│  │ [Apply to Join]                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 📝 Post Team Request Modal
```
┌─────────────────────────────────────────────┐
│  Post Team Request                      [X] │
├─────────────────────────────────────────────┤
│  Title: [Looking for Frontend Dev]         │
│                                             │
│  Description:                               │
│  [Building AI chatbot, need frontend...]   │
│                                             │
│  Required Skills:                           │
│  [React] [Node.js] [Python] [TensorFlow]   │
│  [Figma] [MongoDB] [AWS] [UI/UX]           │
│                                             │
│  Required Roles:                            │
│  [Frontend] [Backend] [Full-Stack]         │
│  [ML Engineer] [Designer] [DevOps]         │
│                                             │
│  [Post Request] [Cancel]                    │
└─────────────────────────────────────────────┘
```

## 👥 View Applications Modal
```
┌─────────────────────────────────────────────┐
│  Need Frontend Developer                [X] │
├─────────────────────────────────────────────┤
│  Description: Building AI chatbot...        │
│                                             │
│  Applications (3)                           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Alice Johnson                       │   │
│  │ alice@test.com                      │   │
│  │ Skills: React, JavaScript, UI/UX    │   │
│  │                                     │   │
│  │ "I have 2 years React experience   │   │
│  │  and love building UIs!"            │   │
│  │                                     │   │
│  │                          [Accept]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Bob Smith                  ✅ Accepted│  │
│  │ bob@test.com                        │   │
│  │ Skills: React, Node.js, MongoDB     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🎯 Club Head Dashboard (`/club-head`)
```
┌─────────────────────────────────────────────┐
│  🎓 CampusConnect                           │
├─────────────────────────────────────────────┤
│  Club Head Dashboard    [Export] [+ Create] │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │📅 12 │ │✅ 8  │ │⏳ 4  │ │👥 450│      │
│  │Events│ │Approved│ │Pending│ │Total│      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  [Table View] [Timeline View]               │
│                                             │
│  My Events                                  │
│  ┌─────────────────────────────────────┐   │
│  │ Event | Date | Status | Attendees   │   │
│  ├─────────────────────────────────────┤   │
│  │ AI Workshop | Jan 15 | ✅ | 45/100  │   │
│  │ [Edit] [Delete]                     │   │
│  ├─────────────────────────────────────┤   │
│  │ Hackathon | Jan 20 | ⏳ | 0/120    │   │
│  │ [Edit] [Delete]                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🛡️ Admin Dashboard (`/admin`)
```
┌─────────────────────────────────────────────┐
│  🎓 CampusConnect                           │
├─────────────────────────────────────────────┤
│  Admin Dashboard                            │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │📅 50 │ │✅ 35 │ │⏳ 15 │ │👥 1200│     │
│  │Events│ │Approved│ │Pending│ │Users│      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  💡 Platform Insights                       │
│  ┌─────────────────────────────────────┐   │
│  │ 🏆 Tech Club is most active with    │   │
│  │    6 events this month              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Approvals] [Analytics] [Timeline] [Audit]│
│                                             │
│  Event Approvals (15)                       │
│  ┌─────────────────────────────────────┐   │
│  │ AI Workshop by Tech Club            │   │
│  │ Date: Jan 15 | Capacity: 100        │   │
│  │ Description: Learn AI...            │   │
│  │ [Approve] [Reject]                  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🔔 Notifications Dropdown
```
┌─────────────────────────────────────────────┐
│  Notifications                              │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 Event Approved                   │   │
│  │ Your event has been approved        │   │
│  │ 2 minutes ago                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🟡 New Team Application             │   │
│  │ Alice applied to your team          │   │
│  │ 5 minutes ago                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔵 Registration Successful          │   │
│  │ You're registered for AI Workshop   │   │
│  │ 1 hour ago                          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 📊 Timeline View
```
┌─────────────────────────────────────────────┐
│  Timeline View                              │
├─────────────────────────────────────────────┤
│  ●─────────────────────────────────────    │
│  │ AI Workshop                             │
│  │ Tech Club | Jan 15, 2pm                 │
│  │ Lab A | ✅ Approved                     │
│  │                                         │
│  ●─────────────────────────────────────    │
│  │ Hackathon 2025                          │
│  │ Coding Club | Jan 20, 9am               │
│  │ Computer Lab | ⏳ Pending               │
│  │                                         │
│  ●─────────────────────────────────────    │
│  │ Web Dev Bootcamp                        │
│  │ Tech Club | Jan 25, 10am                │
│  │ Lab 3 | ✅ Approved                     │
└─────────────────────────────────────────────┘
```

## 🎯 User Flow Diagrams

### Event Registration Flow
```
Student → Browse Events → Click "Register Now"
   ↓
Registration Form → Fill Details → Submit
   ↓
Backend Validation → Check Capacity → Save to DB
   ↓
Success Page → Notification → Redirect to Dashboard
```

### Team Formation Flow
```
Student A → Post Team Request → Specify Skills/Roles
   ↓
Student B → View Request → Click "Apply to Join"
   ↓
Write Message → Submit Application
   ↓
Student A → View Applications → Click "Accept"
   ↓
Team Formed → Both Get Notifications → Ready for Hackathon
```

### Event Approval Flow
```
Club Head → Create Event → Fill Details → Submit
   ↓
Admin → View Pending → Review Details
   ↓
Approve/Reject → Add Comment (if reject)
   ↓
Audit Log Created → Club Head Notified → Event Status Updated
```

## 🎨 Color Scheme

- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow/Orange (#f59e0b)
- **Danger**: Red (#ef4444)
- **Info**: Purple (#8b5cf6)
- **Background**: Gray (#f9fafb)
- **Text**: Dark Gray (#111827)

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Full layout with sidebars
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stacked components, hamburger menu
