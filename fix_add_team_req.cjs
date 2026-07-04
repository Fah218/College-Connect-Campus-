const fs = require('fs');
const filePath = 'src/store/hackathonStore.js';
let content = fs.readFileSync(filePath, 'utf8');

// The normalizer code to format a newly created or updated team request
const replacer = `          const response = await axios.post('http://localhost:5001/api/teams/request', payload);
          let dbReq = response.data.teamRequest;
          
          // Format it to match the UI normalizer
          const formattedDbReq = {
            _id: dbReq._id || dbReq.id,
            id: dbReq.id || dbReq._id,
            hackathonId: dbReq.hackathonId || dbReq.eventId,
            teamName: dbReq.title || dbReq.teamName || dbReq.name || 'Untitled Team Request',
            title: dbReq.title || dbReq.teamName || dbReq.name || 'Untitled Team Request',
            description: dbReq.description || '',
            requiredRoles: dbReq.rolesNeeded || dbReq.roles || [],
            requiredSkills: dbReq.requiredSkills || dbReq.skills || [],
            teamSizeLimit: dbReq.teamSizeLimit || 4,
            status: dbReq.status || 'open',
            createdBy: dbReq.createdBy,
            owner: data.owner || undefined, // If the caller didn't pass owner, it might be blank temporarily until refresh
            currentMembers: dbReq.currentMembers || [],
            offlineMembers: dbReq.offlineMembers || []
          };
          
          set(state => ({ teamRequests: [formattedDbReq, ...state.teamRequests] }))
          return formattedDbReq;`;

content = content.replace(
  `          const response = await axios.post('http://localhost:5001/api/teams/request', payload);
          const dbReq = response.data.teamRequest;
          
          // Use dbReq directly since backend populated it
          set(state => ({ teamRequests: [dbReq, ...state.teamRequests] }))
          return dbReq`,
  replacer
);

fs.writeFileSync(filePath, content);
console.log("hackathonStore.js updated.");
