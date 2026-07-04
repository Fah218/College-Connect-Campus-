const fs = require('fs');
const filePath = 'backend/controllers/registrationController.js';
let content = fs.readFileSync(filePath, 'utf8');

const importStudent = "import Student from '../models/Student.js';\n";
if (!content.includes(importStudent)) {
  content = content.replace("import mongoose from 'mongoose';", "import mongoose from 'mongoose';\n" + importStudent);
}

const oldGetEvent = `export const getEventRegistrations = async (req, res) => {
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
};`;

const newGetEvent = `export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(200).json({ registrations: [] });
    }
    
    const rawRegistrations = await Registration.find({ eventId })
      .populate('studentId', 'name email department year rollNumber phone')
      .sort({ createdAt: -1 })
      .lean();

    const processedRegistrations = await Promise.all(rawRegistrations.map(async (reg) => {
      if (reg.participationType === 'Team' && reg.teamId) {
        try {
          const teamReq = await TeamRequest.findById(reg.teamId).lean();
          if (teamReq) {
            const teamLead = await Student.findById(teamReq.createdBy)
              .select('name email phone department rollNumber')
              .lean();
            
            if (!teamLead) {
              console.log(\`Warning: Team Lead (ID: \${teamReq.createdBy}) not found for Team \${teamReq.teamName}\`);
            }

            const memberPromises = (teamReq.currentMembers || []).map(async (member) => {
              const memberId = member.id || member._id || member;
              if (mongoose.Types.ObjectId.isValid(memberId)) {
                const student = await Student.findById(memberId)
                  .select('name email phone department rollNumber')
                  .lean();
                if (!student) {
                  console.log(\`Warning: Team Member (ID: \${memberId}) not found for Team \${teamReq.teamName}\`);
                  return null;
                }
                return student;
              }
              return member; // Fallback if it's already a populated object
            });
            
            const resolvedMembers = (await Promise.all(memberPromises)).filter(Boolean);

            reg.teamId = {
              _id: teamReq._id,
              teamName: teamReq.teamName || teamReq.name,
              title: teamReq.title || teamReq.teamName,
              status: teamReq.status,
              createdBy: teamLead || { _id: teamReq.createdBy, name: 'Unknown', email: 'N/A' },
              currentMembers: resolvedMembers,
              calculatedTeamSize: 1 + resolvedMembers.length
            };
          }
        } catch (err) {
          console.error(\`Error populating team \${reg.teamId} for registration \${reg._id}:\`, err);
        }
      }
      return reg;
    }));

    res.status(200).json({ registrations: processedRegistrations });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};`;

if (content.includes("export const getEventRegistrations = async (req, res) => {")) {
  content = content.replace(oldGetEvent, newGetEvent);
  fs.writeFileSync(filePath, content);
  console.log("Successfully replaced getEventRegistrations in registrationController.js");
} else {
  console.log("Could not find getEventRegistrations function.");
}
