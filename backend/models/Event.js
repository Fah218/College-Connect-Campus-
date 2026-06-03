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
    enum: ['Workshop', 'Seminar', 'Hackathon', 'Competition', 'Club Activity'],
    default: 'Workshop'
  },
  tags: [{ type: String }],
  
  // Contact details (Common)
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  
  // Eligibility (Common)
  eligibility: { type: String, required: true },
  participationType: {
    type: String,
    enum: ['Individual', 'Team'],
    default: 'Individual'
  },
  maxParticipants: { type: Number },
  maxTeamSize: { type: Number },
  bannerImage: { type: String },
  
  // Hackathon specific
  prizePool: { type: String },
  teamSizeMin: { type: Number },
  teamFormationAllowed: { type: Boolean, default: true },
  winnerRewards: { type: String },
  problemStatementPdf: { type: String }, // optional PDF
  domains: { type: String },

  // Competition specific
  competitionType: { type: String },
  rules: { type: String },

  // Workshop / Seminar specific
  speakerName: { type: String },
  speakerDesignation: { type: String },
  organization: { type: String },
  certificateProvided: { type: Boolean, default: false },
  seminarTopic: { type: String },

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
