import mongoose from 'mongoose';

const clubCodeSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: true,
    unique: true
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const ClubCode = mongoose.model('ClubCode', clubCodeSchema);
export default ClubCode;
