const fs = require('fs');
const filePath = 'backend/controllers/teamController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace getTeamRequests to include populate
content = content.replace(
  `export const getTeamRequests = async (req, res) => {
  try {
    const { hackathonId } = req.query;
    const query = hackathonId ? { hackathonId } : {};
    
    const teamRequests = await TeamRequest.find(query).sort({ createdAt: -1 });`,
  `export const getTeamRequests = async (req, res) => {
  try {
    const { hackathonId } = req.query;
    const query = hackathonId ? { hackathonId } : {};
    
    const teamRequests = await TeamRequest.find(query)
      .populate('createdBy', 'name email department phone')
      .populate('currentMembers', 'name email department phone')
      .sort({ createdAt: -1 });`
);

// Replace getJoinRequests to include populate
content = content.replace(
  `export const getJoinRequests = async (req, res) => {
  try {
    const { hackathonId, teamRequestId } = req.query;
    const query = {};
    if (hackathonId) query.hackathonId = hackathonId;
    if (teamRequestId) query.teamRequestId = teamRequestId;
    
    const joinRequests = await JoinRequest.find(query);`,
  `export const getJoinRequests = async (req, res) => {
  try {
    const { hackathonId, teamRequestId } = req.query;
    const query = {};
    if (hackathonId) query.hackathonId = hackathonId;
    if (teamRequestId) query.teamRequestId = teamRequestId;
    
    const joinRequests = await JoinRequest.find(query)
      .populate('applicantId', 'name email department phone');`
);

// Fix updateJoinRequestStatus pushing only ObjectId
const oldPushMembers = `          teamRequest.currentMembers.push({
            id: joinRequest.applicantId,
            name: studentProfile ? studentProfile.name : joinRequest.applicantName,
            email: studentProfile ? studentProfile.email : undefined,
            phone: studentProfile ? studentProfile.phone : undefined,
            department: studentProfile ? studentProfile.department : undefined,
            year: studentProfile ? studentProfile.year : undefined,
            skills: joinRequest.applicantSkills || [],
            joinedVia: 'online'
          });`;

const newPushMembers = `          // Normalized logic: push just the ObjectID to reference the Student
          teamRequest.currentMembers.push(joinRequest.applicantId);`;

content = content.replace(oldPushMembers, newPushMembers);

// Fix check member logic in updateJoinRequestStatus
const oldCheckMember = `        const isMember = teamRequest.currentMembers.some(
          member => String(member.id) === String(joinRequest.applicantId)
        );`;
const newCheckMember = `        const isMember = teamRequest.currentMembers.some(
          member => String(member) === String(joinRequest.applicantId) || (member._id && String(member._id) === String(joinRequest.applicantId))
        );`;

content = content.replace(oldCheckMember, newCheckMember);

fs.writeFileSync(filePath, content);
console.log("teamController.js updated successfully.");
