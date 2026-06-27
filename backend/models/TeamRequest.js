import mongoose from 'mongoose';

const teamRequestSchema = new mongoose.Schema({
  hackathonId: {
    type: String, // Using String to prevent CastError with current mock IDs, preserves logic
    ref: "Hackathon",
    required: true
  },
  createdBy: {
    type: String, // Using String to prevent CastError with current mock IDs
    ref: "Student",
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
    type: mongoose.Schema.Types.Mixed
  }],
  preferredExperienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  requiredSkills: [{
    type: String
  }],
  teamSizeLimit: {
    type: Number,
    default: 4
  },
  currentMembers: [{
    type: mongoose.Schema.Types.Mixed
  }],
  status: {
    type: String,
    enum: ["open", "recruiting", "team_formed", "registered", "full", "closed"],
    default: "open"
  }
}, { timestamps: true });

const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);
export default TeamRequest;
