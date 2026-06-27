import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  teamRequestId: {
    type: String, // String to prevent CastError with current mock IDs
    ref: "TeamRequest",
    required: true
  },
  hackathonId: {
    type: String, // String to prevent CastError
    ref: "Hackathon",
    required: true
  },
  applicantId: {
    type: String, // using String to avoid cast errors with mock data
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
  resumeBase64: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
export default JoinRequest;
