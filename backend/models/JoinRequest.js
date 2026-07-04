import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  teamRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamRequest",
    required: true
  },
  hackathonId: {
    type: String, // String to prevent CastError if 'unknown' or mock ID
    ref: "Event",
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  applicantName: {
    type: String
  },
  applicantEmail: {
    type: String
  },
  applicantPhone: {
    type: String
  },
  department: {
    type: String
  },
  year: {
    type: String
  },
  applicantSkills: [{
    type: String
  }],
  githubLink: {
    type: String
  },
  portfolioLink: {
    type: String
  },
  linkedinLink: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
export default JoinRequest;
