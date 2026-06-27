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

      // Cross-check: is student in a registered team?
      const teamRegs = await Registration.find({ eventId, participationType: 'Team' }).populate('teamId');
      const inTeam = teamRegs.some(reg => {
        if (!reg.teamId) return false;
        if (String(reg.teamId.createdBy) === String(studentId)) return true;
        return reg.teamId.currentMembers?.some(m => String(m.id || m) === String(studentId));
      });
      if (inTeam) {
        return res.status(400).json({ message: 'You are already registered for this event as part of a team.' });
      }

      const newRegistration = new Registration({
        eventId,
        participationType,
        studentId,
        formData
      });

      await newRegistration.save();

      // Increment attendees count
      await Event.findByIdAndUpdate(eventId, { $inc: { attendees: 1 } });

      return res.status(201).json({ message: 'Successfully registered!', registration: newRegistration });
    } 
    else if (participationType === 'Team') {
      // Validate team
      const team = await TeamRequest.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Check if student is the creator
      if (String(team.createdBy) !== String(studentId)) {
        return res.status(403).json({ message: 'Only the team creator can register the team for an event.' });
      }

      // Check for duplicate team registration
      const existing = await Registration.findOne({ eventId, teamId, participationType: 'Team' });
      if (existing) {
        return res.status(400).json({ message: 'Your team is already registered for this event.' });
      }

      // Cross-check: are any team members already registered individually or in another team?
      const individualRegs = await Registration.find({ eventId, participationType: 'Individual' });
      const individuallyRegisteredIds = individualRegs.map(r => String(r.studentId));
      
      const teamMemberIds = [String(team.createdBy)];
      if (team.currentMembers) {
        team.currentMembers.forEach(m => teamMemberIds.push(String(m.id || m)));
      }

      const hasIndividuallyRegistered = teamMemberIds.some(id => individuallyRegisteredIds.includes(id));
      if (hasIndividuallyRegistered) {
        return res.status(400).json({ message: 'One or more team members are already registered individually.' });
      }

      // Cross-check other registered teams
      const otherTeamRegs = await Registration.find({ eventId, participationType: 'Team' }).populate('teamId');
      let overlappingMember = false;
      otherTeamRegs.forEach(reg => {
        if (!reg.teamId) return;
        const otherMembers = [String(reg.teamId.createdBy)];
        reg.teamId.currentMembers?.forEach(m => otherMembers.push(String(m.id || m)));
        
        if (teamMemberIds.some(id => otherMembers.includes(id))) {
          overlappingMember = true;
        }
      });

      if (overlappingMember) {
        return res.status(400).json({ message: 'One or more team members are already in another registered team for this event.' });
      }

      const newRegistration = new Registration({
        eventId,
        participationType,
        teamId
      });

      await newRegistration.save();

      // Lock the team so it no longer accepts applications and mark it as registered
      team.status = 'registered';
      await team.save();

      // Increment attendees by team size
      const teamSize = teamMemberIds.length;
      await Event.findByIdAndUpdate(eventId, { $inc: { attendees: teamSize } });

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

    // Find all teams this student belongs to (creator or member)
    const teams = await TeamRequest.find({
      $or: [
        { createdBy: studentId },
        { 'currentMembers.id': studentId },
        { currentMembers: studentId } // fallback if stored directly
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
      return res.status(200).json({ registrations: [] });
    }
    
    const registrations = await Registration.find({ eventId })
      .populate('studentId', 'name email department year rollNumber phone')
      .populate({
        path: 'teamId',
        populate: [
          { path: 'createdBy', select: 'name email department' }
          // currentMembers is usually mixed type without direct ref, so we rely on data within it
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ registrations });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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
        teamParticipants += 1 + (reg.teamId.currentMembers ? reg.teamId.currentMembers.length : 0);
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
