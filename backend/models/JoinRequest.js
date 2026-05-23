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
    type: String, // String to prevent CastError
    ref: "User",
    required: true
  },
  applicantName: {
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
  message: {
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
