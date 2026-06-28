import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participationType: {
    type: String,
    enum: ['Individual', 'Team'],
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: function() {
      return this.participationType === 'Individual';
    }
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamRequest',
    required: false
  },
  teamDetails: {
    teamName: String,
    members: [{
      name: String,
      email: String,
      phone: String,
      department: String,
      year: String,
      role: {
        type: String,
        enum: ['Leader', 'Member'],
        default: 'Member'
      }
    }]
  },
  formData: {
    name: String,
    email: String,
    phone: String,
    department: String,
    year: String,
    expectations: String
  }
}, { timestamps: true });

// Prevent duplicate registrations
// A student cannot register for the same event twice
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true, partialFilterExpression: { participationType: 'Individual' } });
// A team cannot register for the same event twice
registrationSchema.index({ eventId: 1, teamId: 1 }, { unique: true, partialFilterExpression: { participationType: 'Team' } });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
