const fs = require('fs');
const file = 'backend/controllers/registrationController.js';
let content = fs.readFileSync(file, 'utf8');

const targetStart = `    else if (participationType === 'Team') {`;
const targetEnd = `    return res.status(400).json({ message: 'Invalid participation type' });`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find block");
  process.exit(1);
}

const replacement = `    else if (participationType === 'Team') {
      const { teamId, teamDetails } = req.body;

      // HACKATHON TEAM REGISTRATION (uses teamId)
      if (teamId) {
        const team = await TeamRequest.findById(teamId);
        if (!team) {
          return res.status(404).json({ message: 'Team not found' });
        }

        if (String(team.createdBy) !== String(studentId)) {
          return res.status(403).json({ message: 'Only the team creator can register the team for an event.' });
        }

        const existing = await Registration.findOne({ eventId, teamId, participationType: 'Team' });
        if (existing) {
          return res.status(400).json({ message: 'Your team is already registered for this event.' });
        }

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
          teamId,
          studentId
        });

        await newRegistration.save();

        team.status = 'registered';
        await team.save();

        const teamSize = teamMemberIds.length;
        await Event.findByIdAndUpdate(eventId, { $inc: { attendees: teamSize } });

        return res.status(201).json({ message: 'Team successfully registered!', registration: newRegistration });
      } 
      
      // NON-HACKATHON TEAM REGISTRATION (uses teamDetails natively)
      else if (teamDetails) {
        // Prevent exact duplicate team names for the same event
        const existingTeam = await Registration.findOne({ 
          eventId, 
          participationType: 'Team', 
          'teamDetails.teamName': teamDetails.teamName 
        });
        if (existingTeam) {
          return res.status(400).json({ message: 'A team with this name is already registered.' });
        }

        // Gather all emails provided in the current team form
        const providedEmails = (teamDetails.members || []).map(m => m.email?.toLowerCase()).filter(Boolean);

        // Check if any of these emails registered individually
        const individualRegs = await Registration.find({ eventId, participationType: 'Individual' }).populate('studentId');
        const individuallyRegisteredEmails = individualRegs.map(r => 
          (r.studentId?.email || r.formData?.email)?.toLowerCase()
        ).filter(Boolean);

        const hasIndividuallyRegistered = providedEmails.some(email => individuallyRegisteredEmails.includes(email));
        if (hasIndividuallyRegistered) {
          return res.status(400).json({ message: 'One or more members have already registered individually.' });
        }

        // Check if any of these emails registered in another non-hackathon team
        const otherNonHackathonTeams = await Registration.find({ 
          eventId, 
          participationType: 'Team', 
          teamDetails: { $exists: true } 
        });
        let overlappingMember = false;
        otherNonHackathonTeams.forEach(reg => {
          const otherEmails = (reg.teamDetails?.members || []).map(m => m.email?.toLowerCase()).filter(Boolean);
          if (providedEmails.some(email => otherEmails.includes(email))) {
            overlappingMember = true;
          }
        });

        if (overlappingMember) {
          return res.status(400).json({ message: 'One or more members are already in another registered team.' });
        }

        const newRegistration = new Registration({
          eventId,
          studentId,
          participationType,
          teamDetails
        });

        await newRegistration.save();

        const teamSize = teamDetails.members?.length || 1;
        await Event.findByIdAndUpdate(eventId, { $inc: { attendees: teamSize } });

        return res.status(201).json({ message: 'Team successfully registered!', registration: newRegistration });
      }
      
      return res.status(400).json({ message: 'Missing team data.' });
    }

`;

const finalContent = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync(file, finalContent);
console.log("Updated registrationController.js");
