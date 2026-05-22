import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String },
  startTime: { type: String },
  endDate: { type: String },
  endTime: { type: String },
  registrationDeadlineDate: { type: String, required: true },
  registrationDeadlineTime: { type: String, required: true },
  mode: { 
    type: String, 
    enum: ['Offline', 'Online', 'Hybrid'],
    default: 'Offline'
  },
  location: { type: String, required: true },
  category: { 
    type: String,
    enum: ['Workshop', 'Seminar', 'Hackathon', 'Competition'],
    default: 'Workshop'
  },
  tags: [{ type: String }],
  participationType: {
    type: String,
    enum: ['Individual', 'Team'],
    default: 'Individual'
  },
  maxParticipants: { type: Number },
  maxTeamSize: { type: Number },
  bannerImage: { type: String },
  clubName: { 
    type: String, 
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
