import mongoose from 'mongoose';

const clubHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  clubName: { type: String, required: true, unique: true },
  clubDescription: { type: String },
  profileImage: { type: String },
  contactNumber: { type: String },

  role: { type: String, default: 'ClubHead' },
  department: { type: String },
  designation: { type: String },
  phone: { type: String },
  isArchived: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
  archivedAt: { type: Date },
  archivedBy: { type: String }
}, { timestamps: true });

const ClubHead = mongoose.model('ClubHead', clubHeadSchema);
export default ClubHead;
