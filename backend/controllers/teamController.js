import TeamRequest from '../models/TeamRequest.js';
import JoinRequest from '../models/JoinRequest.js';

export const createTeamRequest = async (req, res) => {
  try {
    const { hackathonId, createdBy, title, description, rolesNeeded, requiredSkills, teamSizeLimit, currentMembers, status } = req.body;
    
    const newTeamRequest = new TeamRequest({
      hackathonId,
      createdBy,
      title,
      description,
      rolesNeeded: rolesNeeded || req.body.roles || [], // fallback for existing frontend payload
      requiredSkills: requiredSkills || req.body.skills || [], // fallback for existing frontend payload
      teamSizeLimit,
      currentMembers: currentMembers || [],
      status: status || 'open'
    });
    
    await newTeamRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Team request created successfully',
      teamRequest: newTeamRequest
    });
  } catch (error) {
    console.error('Error creating team request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team request',
      error: error.message
    });
  }
};

export const getTeamRequests = async (req, res) => {
  try {
    const { hackathonId } = req.query;
    const query = hackathonId ? { hackathonId } : {};
    
    const teamRequests = await TeamRequest.find(query);
    
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
  try {
    const { teamRequestId, hackathonId, applicantId, applicantName, applicantSkills, githubLink, portfolioLink, linkedinLink, message, status } = req.body;
    
    const newJoinRequest = new JoinRequest({
      teamRequestId,
      hackathonId: hackathonId || 'unknown', // fallback
      applicantId: applicantId || 'unknown', // fallback
      applicantName,
      applicantSkills,
      githubLink,
      portfolioLink,
      linkedinLink,
      message,
      status: status || 'pending'
    });
    
    await newJoinRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      joinRequest: newJoinRequest
    });
  } catch (error) {
    console.error('Error creating join request:', error);
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
    
    const joinRequests = await JoinRequest.find(query);
    
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

    joinRequest.status = status;
    await joinRequest.save();

    // If accepted, add applicant to team's currentMembers
    if (status === 'accepted') {
      const teamRequest = await TeamRequest.findById(joinRequest.teamRequestId);
      if (teamRequest) {
        // add applicant if not already in members
        const isMember = teamRequest.currentMembers.some(
          member => String(member.id) === String(joinRequest.applicantId)
        );
        
        if (!isMember) {
          teamRequest.currentMembers.push({
            id: joinRequest.applicantId,
            name: joinRequest.applicantName,
            skills: joinRequest.applicantSkills || []
          });
          await teamRequest.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Join request ${status} successfully`,
      joinRequest
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
