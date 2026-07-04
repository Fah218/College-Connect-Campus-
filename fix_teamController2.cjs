const fs = require('fs');
const filePath = 'backend/controllers/teamController.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldResponse = `    res.status(200).json({
      success: true,
      message: \`Join request \${status} successfully\`,
      joinRequest
    });`;

const newResponse = `    // Fetch populated team request to return for immediate frontend synchronization
    let updatedTeamRequest = null;
    if (joinRequest.teamRequestId) {
      updatedTeamRequest = await TeamRequest.findById(joinRequest.teamRequestId)
        .populate('createdBy', 'name email department phone')
        .populate('currentMembers', 'name email department phone');
    }

    res.status(200).json({
      success: true,
      message: \`Join request \${status} successfully\`,
      joinRequest,
      teamRequest: updatedTeamRequest
    });`;

content = content.replace(oldResponse, newResponse);

fs.writeFileSync(filePath, content);
console.log("teamController.js response updated successfully.");
