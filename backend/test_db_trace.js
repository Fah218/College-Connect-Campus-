import axios from 'axios';

async function run() {
  try {
    const validId = '60d5ec496112f43d3c8c9a3d';
    
    console.log("Triggering Team Request...");
    const teamPayload = {
        hackathonId: 'event123',
        createdBy: validId,
        title: 'Title',
        description: 'Test Team Request Trace',
        status: 'open',
        offlineMembers: [],
        currentMembers: []
    };
    
    let teamReqRes;
    try {
      teamReqRes = await axios.post('http://localhost:5001/api/teams/request', teamPayload, { headers: { 'Content-Type': 'application/json' } });
      console.log('Team Request Success:', teamReqRes.data.success);
    } catch(e) {
      console.error('Team Request Error:', e.response?.data || e.message);
    }
    
    console.log("Triggering Join Request...");
    const joinPayload = {
        teamRequestId: '60d5ec496112f43d3c8c9a3e',
        hackathonId: 'event123',
        applicantId: validId,
        applicantName: 'John',
        applicantSkills: ['Node'],
        githubLink: 'url',
        portfolioLink: 'url',
        linkedinLink: 'url',
        message: 'Hello',
        status: 'pending'
    };
    
    try {
      const joinReqRes = await axios.post('http://localhost:5001/api/teams/join', joinPayload, { headers: { 'Content-Type': 'application/json' } });
      console.log('Join Request Success:', joinReqRes.data.success);
    } catch(e) {
      console.error('Join Request Error:', e.response?.data || e.message);
    }

  } catch (err) {
    console.error(err);
  }
}
run();
