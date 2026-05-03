import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: String },
  skills: [{ type: String }],
  interests: [{ type: String }],
  profileImage: { type: String },
  phone: { type: String },
  role: { type: String, default: 'Student' }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
