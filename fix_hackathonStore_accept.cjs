const fs = require('fs');
const filePath = 'src/store/hackathonStore.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldAccept = `      acceptJoinRequest: async (joinRequestId) => {
        try {
          // get necessary info before backend mutations
          const jr = get().joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId));
          if (!jr) return;
          
          await axios.put(\`http://localhost:5001/api/teams/join/\${joinRequestId}/status\`, { status: 'accepted' });
          
          // Refetch everything to ensure perfect consistency with MongoDB
          await get().fetchHackathonData();
          
          set(state => {
            const senderId = String(jr.sender?.id);
            const teamReq  = state.teamRequests.find(tr => String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId));
            const prevSenderNotifs = state.userNotifications[senderId] || [];
            const newNotif = {
              id:        Date.now().toString() + 'a',
              text:      \`✅ Your request to join "\${teamReq?.teamName || teamReq?.title || 'the team'}" was accepted!\`,
              type:      'accepted',
              read:      false,
              createdAt: new Date().toISOString(),
              meta:      { teamRequestId: jr.teamRequestId, hackathonId: jr.hackathonId }
            };

            return {
              userNotifications: {
                ...state.userNotifications,
                [senderId]: [newNotif, ...prevSenderNotifs]
              }
            };
          });
        } catch (error) {`;

const newAccept = `      acceptJoinRequest: async (joinRequestId) => {
        try {
          // get necessary info before backend mutations
          const jr = get().joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId));
          if (!jr) return;
          
          const response = await axios.put(\`http://localhost:5001/api/teams/join/\${joinRequestId}/status\`, { status: 'accepted' });
          const { joinRequest: updatedJr, teamRequest: updatedTr } = response.data;
          
          set(state => {
            let newJoinRequests = state.joinRequests.map(r =>
              (String(r._id) === String(joinRequestId) || String(r.id) === String(joinRequestId)) ? updatedJr : r
            );

            let newTeamRequests = state.teamRequests;
            if (updatedTr) {
              const formattedTr = {
                _id: updatedTr._id || updatedTr.id,
                id: updatedTr.id || updatedTr._id,
                hackathonId: updatedTr.hackathonId || updatedTr.eventId,
                teamName: updatedTr.title || updatedTr.teamName || updatedTr.name || 'Untitled Team Request',
                title: updatedTr.title || updatedTr.teamName || updatedTr.name || 'Untitled Team Request',
                description: updatedTr.description || '',
                requiredRoles: updatedTr.rolesNeeded || updatedTr.roles || [],
                requiredSkills: updatedTr.requiredSkills || updatedTr.skills || [],
                teamSizeLimit: updatedTr.teamSizeLimit || 4,
                status: updatedTr.status || 'open',
                createdBy: typeof updatedTr.createdBy === 'object' && updatedTr.createdBy !== null ? (updatedTr.createdBy._id || updatedTr.createdBy.id || 'unknown') : (updatedTr.createdBy || 'unknown'),
                owner: typeof updatedTr.createdBy === 'object' && updatedTr.createdBy !== null ? updatedTr.createdBy : undefined,
                currentMembers: updatedTr.currentMembers || [],
                offlineMembers: updatedTr.offlineMembers || []
              };
              newTeamRequests = state.teamRequests.map(tr => 
                (String(tr._id) === String(updatedTr._id) || String(tr.id) === String(updatedTr._id)) ? formattedTr : tr
              );
            }
            
            const senderId = String(jr.sender?.id || jr.applicantId);
            const teamReq  = newTeamRequests.find(tr => String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId));
            const prevSenderNotifs = state.userNotifications[senderId] || [];
            const newNotif = {
              id:        Date.now().toString() + 'a',
              text:      \`✅ Your request to join "\${teamReq?.title || teamReq?.teamName || 'the team'}" was accepted!\`,
              type:      'accepted',
              read:      false,
              createdAt: new Date().toISOString(),
              meta:      { teamRequestId: jr.teamRequestId, hackathonId: jr.hackathonId }
            };

            return {
              joinRequests: newJoinRequests,
              teamRequests: newTeamRequests,
              userNotifications: {
                ...state.userNotifications,
                [senderId]: [newNotif, ...prevSenderNotifs]
              }
            };
          });
        } catch (error) {`;

content = content.replace(oldAccept, newAccept);


const oldReject = `      rejectJoinRequest: async (joinRequestId) => {
        try {
          const jr = get().joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId));
          if (!jr) return;

          await axios.put(\`http://localhost:5001/api/teams/join/\${joinRequestId}/status\`, { status: 'rejected' });
          
          // Refetch everything to ensure perfect consistency with MongoDB
          await get().fetchHackathonData();

          set(state => {
            const senderId = String(jr.sender?.id);
            const teamReq  = state.teamRequests.find(tr => String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId));
            const prevSenderNotifs = state.userNotifications[senderId] || [];
            const newNotif = {
              id:        Date.now().toString() + 'r',
              text:      \`❌ Your request to join "\${teamReq?.teamName || teamReq?.title || 'the team'}" was not accepted.\`,
              type:      'rejected',
              read:      false,
              createdAt: new Date().toISOString(),
              meta:      { teamRequestId: jr.teamRequestId }
            };

            return {
              userNotifications: {
                ...state.userNotifications,
                [senderId]: [newNotif, ...prevSenderNotifs]
              }
            };
          });
        } catch (error) {`;

const newReject = `      rejectJoinRequest: async (joinRequestId) => {
        try {
          const jr = get().joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId));
          if (!jr) return;

          const response = await axios.put(\`http://localhost:5001/api/teams/join/\${joinRequestId}/status\`, { status: 'rejected' });
          const { joinRequest: updatedJr } = response.data;
          
          set(state => {
            let newJoinRequests = state.joinRequests.map(r =>
              (String(r._id) === String(joinRequestId) || String(r.id) === String(joinRequestId)) ? updatedJr : r
            );

            const senderId = String(jr.sender?.id || jr.applicantId);
            const teamReq  = state.teamRequests.find(tr => String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId));
            const prevSenderNotifs = state.userNotifications[senderId] || [];
            const newNotif = {
              id:        Date.now().toString() + 'r',
              text:      \`❌ Your request to join "\${teamReq?.title || teamReq?.teamName || 'the team'}" was not accepted.\`,
              type:      'rejected',
              read:      false,
              createdAt: new Date().toISOString(),
              meta:      { teamRequestId: jr.teamRequestId }
            };

            return {
              joinRequests: newJoinRequests,
              userNotifications: {
                ...state.userNotifications,
                [senderId]: [newNotif, ...prevSenderNotifs]
              }
            };
          });
        } catch (error) {`;

content = content.replace(oldReject, newReject);

fs.writeFileSync(filePath, content);
console.log("hackathonStore.js accept/reject updated.");
