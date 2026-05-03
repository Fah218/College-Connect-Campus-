# MongoDB Database Architecture for College Campus App

This document outlines the database architecture for managing signups for three distinct roles: **Student**, **Admin**, and **Club Head**. 

To keep the data organized and separate, we use three distinct MongoDB collections rather than a single shared collection.

## 1. Prerequisites
Make sure you have Mongoose installed in your Node.js backend:
```bash
npm install mongoose
```

## 2. Database Connection Connection
Create a `config/db.js` file to handle your MongoDB connection:

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

## 3. Schemas & Models
Create separate model files for each role to ensure they are stored in their own collections.

### A. Student Model (`models/Student.js`)
This collection will store data exclusively for students.

```javascript
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  role: { type: String, default: 'Student' } // Optional, for easy identification
}, { timestamps: true });

// Mongoose automatically creates a collection named "students"
const Student = mongoose.model('Student', studentSchema);
export default Student;
```

### B. Admin Model (`models/Admin.js`)
This collection will store data exclusively for college administration or system administrators.

```javascript
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  role: { type: String, default: 'Admin' }
}, { timestamps: true });

// Mongoose automatically creates a collection named "admins"
const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
```

### C. Club Head Model (`models/ClubHead.js`)
This collection will store data exclusively for leaders of various college clubs.

```javascript
import mongoose from 'mongoose';

const clubHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  clubName: { type: String, required: true, unique: true },
  studentId: { type: String, required: true }, // Their student ID if they are also a student
  role: { type: String, default: 'ClubHead' }
}, { timestamps: true });

// Mongoose automatically creates a collection named "clubheads"
const ClubHead = mongoose.model('ClubHead', clubHeadSchema);
export default ClubHead;
```

## 4. Handling Signups in the Backend
When a user submits a signup form, your backend controller should route the data to the appropriate model based on their selected role.

### Example Signup Controller (`controllers/authController.js`)
```javascript
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import ClubHead from '../models/ClubHead.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const { role, name, email, password, ...otherData } = req.body;

  try {
    // 1. Hash the password before saving (Security Best Practice)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Select the right model based on the role
    let savedUser;

    if (role === 'Student') {
      const newStudent = new Student({
        name, email, password: hashedPassword, ...otherData
      });
      savedUser = await newStudent.save();
    } 
    else if (role === 'Admin') {
      const newAdmin = new Admin({
        name, email, password: hashedPassword, ...otherData
      });
      savedUser = await newAdmin.save();
    } 
    else if (role === 'ClubHead') {
      const newClubHead = new ClubHead({
        name, email, password: hashedPassword, ...otherData
      });
      savedUser = await newClubHead.save();
    } 
    else {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    res.status(201).json({ message: `${role} registered successfully!`, user: savedUser });

  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};
```

## Summary
By using separate Mongoose models (`Student`, `Admin`, `ClubHead`), MongoDB will automatically create and manage three isolated collections (`students`, `admins`, `clubheads`). This guarantees your data remains separate, clean, and specifically structured for the needs of each role.
