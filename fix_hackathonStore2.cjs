const fs = require('fs');
const filePath = 'src/store/hackathonStore.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix addTeamRequest: change return newReq to return dbReq
content = content.replace(
  `          // Use dbReq directly since backend populated it
          set(state => ({ teamRequests: [dbReq, ...state.teamRequests] }))
          return newReq`,
  `          // Use dbReq directly since backend populated it
          set(state => ({ teamRequests: [dbReq, ...state.teamRequests] }))
          return dbReq`
);

// Normalize createdBy in fetchHackathonData (the map for teamRequests)
// Wait, currently it does:
/*
          const normalizedTeamRequests = teamReqsRes.data.teamRequests.map(tr => {
            return {
              _id: tr._id || tr.id,
              id: tr.id || tr._id,
              hackathonId: tr.hackathonId || tr.eventId,
              teamName: tr.title || tr.teamName || tr.name || 'Untitled Team Request',
              title: tr.title || tr.teamName || tr.name || 'Untitled Team Request',
              description: tr.description || '',
              requiredRoles: tr.rolesNeeded || tr.roles || [],
              requiredSkills: tr.requiredSkills || tr.skills || [],
              teamSizeLimit: tr.teamSizeLimit || 4,
              status: tr.status || 'open',
              createdBy: tr.createdBy || 'unknown',
              currentMembers: tr.currentMembers || []
            };
          });
*/
const oldNormalize = `              status: tr.status || 'open',
              createdBy: tr.createdBy || 'unknown',
              currentMembers: tr.currentMembers || []`;
const newNormalize = `              status: tr.status || 'open',
              createdBy: typeof tr.createdBy === 'object' && tr.createdBy !== null ? (tr.createdBy._id || tr.createdBy.id || 'unknown') : (tr.createdBy || 'unknown'),
              owner: typeof tr.createdBy === 'object' && tr.createdBy !== null ? tr.createdBy : undefined,
              currentMembers: tr.currentMembers || [],
              offlineMembers: tr.offlineMembers || []`;

content = content.replace(oldNormalize, newNormalize);

// Fix acceptJoinRequest and rejectJoinRequest refetches
// Old logic in acceptJoinRequest uses `await get().fetchHackathonData();`
// We need to remove that and update state using updatedJr and updatedTr (which teamController.js already returns for accept/reject now? Let's check: I updated teamController.js earlier to return `teamRequest: updatedTeamRequest`).

fs.writeFileSync(filePath, content);
console.log("hackathonStore.js addTeamRequest and normalize fixed.");
