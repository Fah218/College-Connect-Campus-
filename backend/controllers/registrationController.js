import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import TeamRequest from '../models/TeamRequest.js';
import mongoose from 'mongoose';

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Student only)
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, participationType, teamId, formData, studentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid Event ID. Cannot register for mock events.' });
    }

    if (studentId && !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid Student ID. Mock users cannot register in DB.' });
    }

    if (teamId && !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid Team ID.' });
    }

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (participationType === 'Individual') {
      if (!studentId) {
        return res.status(400).json({ message: 'Valid Student ID is required to register. Please log out and log back in.' });
      }

      // Check for duplicate individual registration
      const existing = await Registration.findOne({ eventId, studentId, participationType: 'Individual' });
      if (existing) {
        return res.status(400).json({ message: 'You have already registered for this event individually.' });
      }

      const newRegistration = new Registration({
        eventId,
        participationType,
        studentId,
        formData
      });

      await newRegistration.save();

      // Increment attendees count
      event.attendees = (event.attendees || 0) + 1;
      await event.save();

      return res.status(201).json({ message: 'Successfully registered!', registration: newRegistration });
    } 
    else if (participationType === 'Team') {
      // Validate team
      const team = await TeamRequest.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Check if student is the owner
      if (String(team.owner) !== String(studentId) && String(team.owner._id) !== String(studentId)) {
        return res.status(403).json({ message: 'Only the team owner can register the team for an event.' });
      }

      // Check for duplicate team registration
      const existing = await Registration.findOne({ eventId, teamId, participationType: 'Team' });
      if (existing) {
        return res.status(400).json({ message: 'Your team is already registered for this event.' });
      }

      const newRegistration = new Registration({
        eventId,
        participationType,
        teamId
      });

      await newRegistration.save();

      // Increment attendees by team size
      const teamSize = (team.members ? team.members.length : 0) + 1; // members + owner
      event.attendees = (event.attendees || 0) + teamSize;
      await event.save();

      return res.status(201).json({ message: 'Team successfully registered!', registration: newRegistration });
    }
    
    return res.status(400).json({ message: 'Invalid participation type' });

  } catch (error) {
    console.error('Error in registerForEvent:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate registration detected.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get registrations for the logged in student
// @route   GET /api/registrations/student
// @access  Private (Student only)
export const getStudentRegistrations = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(200).json({ individual: [], team: [] });
    }

    // Find all individual registrations
    const individualRegs = await Registration.find({ studentId, participationType: 'Individual' }).populate('eventId');

    // Find all teams this student belongs to (owner or member)
    const teams = await TeamRequest.find({
      $or: [
        { owner: studentId },
        { members: studentId } // Assuming members array contains ObjectIds
      ]
    });
    
    const teamIds = teams.map(t => t._id);

    // Find all team registrations for these teams
    const teamRegs = await Registration.find({ teamId: { $in: teamIds }, participationType: 'Team' }).populate('eventId').populate('teamId');

    res.status(200).json({
      individual: individualRegs,
      team: teamRegs
    });

  } catch (error) {
    console.error('Error fetching student registrations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Club Head / Admin)
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(200).json({ registrations: [] }); // return empty gracefully
    }

    // Optional: Verify that the user is the club head for this event
    
    const registrations = await Registration.find({ eventId })
      .populate('studentId', 'name email department year rollNumber')
      .populate({
        path: 'teamId',
        populate: [
          { path: 'owner', select: 'name email department' },
          { path: 'members', select: 'name email department' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ registrations });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get global registration stats
// @route   GET /api/registrations/stats/admin
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const individualRegs = await Registration.countDocuments({ participationType: 'Individual' });
    const teamRegs = await Registration.countDocuments({ participationType: 'Team' });
    
    // Total participants approximation
    const teams = await Registration.find({ participationType: 'Team' }).populate('teamId');
    let teamParticipants = 0;
    teams.forEach(reg => {
      if (reg.teamId) {
        teamParticipants += 1 + (reg.teamId.members ? reg.teamId.members.length : 0);
      }
    });

    const totalParticipants = individualRegs + teamParticipants;

    res.status(200).json({
      totalRegistrations,
      individualRegs,
      teamRegs,
      totalParticipants
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
