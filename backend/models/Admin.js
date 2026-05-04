import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  phone: { type: String },
  profileImage: { type: String },
  role: { type: String, default: 'Admin' }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
