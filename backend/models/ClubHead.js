import mongoose from 'mongoose';

const clubHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  clubName: { type: String, required: true, unique: true },
  clubDescription: { type: String },
  profileImage: { type: String },
  contactNumber: { type: String },
  studentId: { type: String, required: true },
  role: { type: String, default: 'ClubHead' }
}, { timestamps: true });

const ClubHead = mongoose.model('ClubHead', clubHeadSchema);
export default ClubHead;
