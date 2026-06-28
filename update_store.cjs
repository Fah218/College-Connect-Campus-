const fs = require('fs');
const file = 'src/store/hackathonStore.js';
let content = fs.readFileSync(file, 'utf8');

const targetBlockStart = '      /** User A: Accept a join request */';
const targetBlockEnd = '      markUserNotifRead: (userId, notifId) =>';

const startIndex = content.indexOf(targetBlockStart);
const endIndex = content.indexOf(targetBlockEnd, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find blocks");
  process.exit(1);
}

const beforeBlock = content.slice(0, startIndex);
const afterBlock = content.slice(endIndex);

const newBlock = `      /** User A: Accept a join request */
      acceptJoinRequest: async (joinRequestId) => {
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
        } catch (error) {
          console.error("Failed to accept join request", error);
          if (error.response && error.response.status === 400) {
            alert(\`Could not accept: \${error.response.data.message || 'Team is full or user already accepted.'}\`);
            throw new Error(error.response.data.message);
          }
        }
      },

      /** User A: Reject a join request */
      rejectJoinRequest: async (joinRequestId) => {
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
        } catch (error) {
          console.error("Failed to reject join request", error);
        }
      },

`;

fs.writeFileSync(file, beforeBlock + newBlock + afterBlock);
console.log("Updated store successfully");
