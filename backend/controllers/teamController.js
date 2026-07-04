import TeamRequest from '../models/TeamRequest.js';
import JoinRequest from '../models/JoinRequest.js';
import Student from '../models/Student.js';

export const createTeamRequest = async (req, res) => {
  console.log("=== createTeamRequest TRIGGERED ===");
  console.log("Payload:", req.body);
  try {
    const { hackathonId, createdBy, title, description, rolesNeeded, requiredSkills, preferredExperienceLevel, teamSizeLimit, currentMembers, offlineMembers, status } = req.body;
    
    // Check if user already has an active team request for this hackathon
    const existingRequest = await TeamRequest.findOne({ hackathonId, createdBy, status: { $in: ['open', 'full'] } });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active team request for this hackathon'
      });
    }

    const newTeamRequest = new TeamRequest({
      hackathonId,
      createdBy,
      title,
      description,
      rolesNeeded: rolesNeeded || req.body.roles || [], // fallback for existing frontend payload
      requiredSkills: requiredSkills || req.body.skills || [], // fallback for existing frontend payload
      preferredExperienceLevel: preferredExperienceLevel || undefined,
      teamSizeLimit: teamSizeLimit || 4,
      currentMembers: currentMembers || [],
      offlineMembers: offlineMembers || [],
      status: status || 'open'
    });
    
    await newTeamRequest.save();
    
    const populatedRequest = await TeamRequest.findById(newTeamRequest._id)
      .populate('createdBy', 'name email department phone rollNumber')
      .populate('currentMembers', 'name email department phone rollNumber');

    res.status(201).json({
      success: true,
      message: 'Team request created successfully',
      teamRequest: populatedRequest
    });
  } catch (error) {
    console.error('Error creating team request:', error);
    console.error('Validation errors:', error.errors);
    res.status(500).json({
      success: false,
      message: 'Failed to create team request',
      error: error.message
    });
  }
};

export const updateTeamRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, teamName, description, rolesNeeded, roles, requiredSkills, skills, preferredExperienceLevel, teamSizeLimit, currentMembers, offlineMembers } = req.body;
    
    const teamRequest = await TeamRequest.findById(id);
    if (!teamRequest) {
      return res.status(404).json({ success: false, message: 'Team request not found' });
    }

    if (teamRequest.status !== 'open') {
      return res.status(403).json({ success: false, message: 'Cannot edit team request once recruitment has started.' });
    }
    
    const finalTitle = title !== undefined ? title : teamName;
    const finalRoles = rolesNeeded !== undefined ? rolesNeeded : roles;
    const finalSkills = requiredSkills !== undefined ? requiredSkills : skills;

    if (finalTitle !== undefined) teamRequest.title = finalTitle;
    if (description !== undefined) teamRequest.description = description;
    if (finalRoles !== undefined) teamRequest.rolesNeeded = finalRoles;
    if (finalSkills !== undefined) teamRequest.requiredSkills = finalSkills;
    if (preferredExperienceLevel !== undefined) {
      if (preferredExperienceLevel === '') {
        teamRequest.preferredExperienceLevel = undefined;
      } else {
        teamRequest.preferredExperienceLevel = preferredExperienceLevel;
      }
    }
    if (teamSizeLimit !== undefined) teamRequest.teamSizeLimit = teamSizeLimit;
    if (currentMembers !== undefined) teamRequest.currentMembers = currentMembers;
    if (offlineMembers !== undefined) teamRequest.offlineMembers = offlineMembers;
    
    await teamRequest.save();
    
    const populatedRequest = await TeamRequest.findById(teamRequest._id)
      .populate('createdBy', 'name email department phone rollNumber')
      .populate('currentMembers', 'name email department phone rollNumber');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: 'Team request updated successfully'
    });
  } catch (error) {
    console.error('Update Team Request Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteTeamRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const teamRequest = await TeamRequest.findById(id);
    
    if (!teamRequest) {
      return res.status(404).json({ success: false, message: 'Team request not found' });
    }

    if (teamRequest.status !== 'open') {
      return res.status(403).json({ success: false, message: 'Cannot delete team request once recruitment has started.' });
    }
    
    await TeamRequest.findByIdAndDelete(id);
    await JoinRequest.deleteMany({ teamRequestId: id });
    
    res.status(200).json({
      success: true,
      message: 'Team request deleted successfully'
    });
  } catch (error) {
    console.error('Delete Team Request Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getTeamRequests = async (req, res) => {
  try {
    const { hackathonId } = req.query;
    const query = hackathonId ? { hackathonId } : {};
    
    const teamRequests = await TeamRequest.find(query)
      .populate('createdBy', 'name email department phone rollNumber')
      .populate('currentMembers', 'name email department phone rollNumber');
    
    res.status(200).json({
      success: true,
      teamRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team requests',
      error: error.message
    });
  }
};

export const createJoinRequest = async (req, res) => {
  console.log("=== createJoinRequest TRIGGERED ===");
  console.log("Payload:", req.body);
  try {
    const { teamRequestId, hackathonId, applicantId, applicantName, applicantSkills, githubLink, portfolioLink, linkedinLink, message, status } = req.body;
    
    // Check if duplicate join request
    const existingJoinRequest = await JoinRequest.findOne({ teamRequestId, applicantId });
    if (existingJoinRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already sent a join request to this team'
      });
    }

    // Check if user is already a member of an accepted team in this hackathon
    const alreadyInTeam = await JoinRequest.findOne({ hackathonId, applicantId, status: 'accepted' });
    if (alreadyInTeam) {
      return res.status(400).json({
        success: false,
        message: 'You are already in a team for this hackathon'
      });
    }

    const studentProfile = await Student.findById(applicantId);

    const newJoinRequest = new JoinRequest({
      teamRequestId,
      hackathonId: hackathonId || 'unknown', // fallback
      applicantId: applicantId || 'unknown', // fallback
      applicantName: studentProfile ? studentProfile.name : applicantName,
      applicantEmail: studentProfile ? studentProfile.email : undefined,
      applicantPhone: studentProfile ? studentProfile.phone : undefined,
      department: studentProfile ? studentProfile.department : undefined,
      year: studentProfile ? studentProfile.year : undefined,
      applicantSkills,
      githubLink,
      portfolioLink,
      linkedinLink,
      message,
      status: status || 'pending'
    });
    
    await newJoinRequest.save();

    // Lock recruitment if the team is still 'open'
    await TeamRequest.findOneAndUpdate(
      { _id: teamRequestId, status: 'open' },
      { $set: { status: 'recruiting' } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      joinRequest: newJoinRequest
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    console.error('Validation errors:', error.errors);
    res.status(500).json({
      success: false,
      message: 'Failed to create join request',
      error: error.message
    });
  }
};

export const getJoinRequests = async (req, res) => {
  try {
    const { hackathonId, teamRequestId } = req.query;
    const query = {};
    if (hackathonId) query.hackathonId = hackathonId;
    if (teamRequestId) query.teamRequestId = teamRequestId;
    
    const joinRequests = await JoinRequest.find(query)
      .populate('applicantId', 'name email department phone');
    
    res.status(200).json({
      success: true,
      joinRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch join requests',
      error: error.message
    });
  }
};

export const updateJoinRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    const joinRequest = await JoinRequest.findById(id);
    if (!joinRequest) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    // Pre-Acceptance Check
    if (status === 'accepted') {
      const alreadyInTeam = await JoinRequest.findOne({
        hackathonId: joinRequest.hackathonId,
        applicantId: joinRequest.applicantId,
        status: 'accepted'
      });
      if (alreadyInTeam) {
        return res.status(400).json({ success: false, message: 'User is already in another team for this hackathon.' });
      }
    }

    joinRequest.status = status;
    await joinRequest.save();

    // If accepted, add applicant to team's currentMembers
    if (status === 'accepted') {
      const teamRequest = await TeamRequest.findById(joinRequest.teamRequestId);
      if (teamRequest) {
        // add applicant if not already in members
        const isMember = teamRequest.currentMembers.some(
          member => String(member) === String(joinRequest.applicantId) || (member._id && String(member._id) === String(joinRequest.applicantId))
        );
        
        if (!isMember) {
          // Add +1 for the lead that is implicitly in the team
          const currentSize = teamRequest.currentMembers.length + 1;
          
          if (currentSize >= teamRequest.teamSizeLimit) {
            // Revert join request to pending if team is already full
            joinRequest.status = 'pending';
            await joinRequest.save();
            return res.status(400).json({ success: false, message: 'Team is already full' });
          }

          const studentProfile = await Student.findById(joinRequest.applicantId);
          
          // Normalized logic: push just the ObjectID to reference the Student
          teamRequest.currentMembers.push(joinRequest.applicantId);
          
          // Check if full after adding
          if (teamRequest.currentMembers.length + 1 >= teamRequest.teamSizeLimit) {
            teamRequest.status = 'full';
          } else {
            teamRequest.status = 'team_formed';
          }
          
          await teamRequest.save();
          
          // Auto-reject other pending join requests for the same applicant in this hackathon
          await JoinRequest.updateMany({
            hackathonId: joinRequest.hackathonId,
            applicantId: joinRequest.applicantId,
            _id: { $ne: joinRequest._id },
            status: 'pending'
          }, { $set: { status: 'rejected' } });
        }
      }
    } else if (status === 'rejected') {
      const teamRequest = await TeamRequest.findById(joinRequest.teamRequestId);
      if (teamRequest && teamRequest.status === 'recruiting') {
        const remainingPending = await JoinRequest.countDocuments({ teamRequestId: teamRequest._id, status: 'pending' });
        if (remainingPending === 0) {
          teamRequest.status = 'open';
          await teamRequest.save();
        }
      }
    }

    // Fetch populated team request to return for immediate frontend synchronization
    let updatedTeamRequest = null;
    if (joinRequest.teamRequestId) {
      updatedTeamRequest = await TeamRequest.findById(joinRequest.teamRequestId)
        .populate('createdBy', 'name email department phone rollNumber')
        .populate('currentMembers', 'name email department phone rollNumber');
    }

    res.status(200).json({
      success: true,
      message: `Join request ${status} successfully`,
      joinRequest,
      teamRequest: updatedTeamRequest
    });
  } catch (error) {
    console.error('Error updating join request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update join request status',
      error: error.message
    });
  }
};
