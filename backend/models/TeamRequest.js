import mongoose from 'mongoose';

const teamRequestSchema = new mongoose.Schema({
  hackathonId: {
    type: String, // Using String to prevent CastError with current mock IDs, preserves logic
    ref: "Hackathon",
    required: true
  },
  createdBy: {
    type: String, // Using String to prevent CastError with current mock IDs
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rolesNeeded: [{
    type: String
  }],
  requiredSkills: [{
    type: String
  }],
  teamSizeLimit: {
    type: Number,
    default: 4
  },
  currentMembers: [{
    userId: {
      type: String,
      ref: "User"
    },
    role: {
      type: String
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  }
}, { timestamps: true });

const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);
export default TeamRequest;
