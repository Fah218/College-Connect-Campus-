const fs = require('fs');
const filePath = 'src/store/hackathonStore.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix addTeamRequest payload
content = content.replace(
  `createdBy: data.createdBy || data.owner?.id ? String(data.createdBy || data.owner.id) : 'Unknown'`,
  `createdBy: data.createdBy || data.owner?._id || data.owner?.id`
);

content = content.replace(
  `          const newReq = {
            _id:           dbReq._id,
            hackathonId:   String(data.hackathonId),
            teamName:      data.teamName || '',
            description:   data.description,
            requiredRoles: data.requiredRoles || [],
            requiredSkills: data.requiredSkills || [],
            createdBy:     payload.createdBy,
            currentMembers:[],
            joinRequests:  [],
            status:        'open',
            createdAt:     dbReq.createdAt
          }
          set(state => ({ teamRequests: [newReq, ...state.teamRequests] }))`,
  `          // Use dbReq directly since backend populated it
          set(state => ({ teamRequests: [dbReq, ...state.teamRequests] }))`
);

// 2. Fix acceptJoinRequest
const oldAccept = `      /** Lead: Accept applicant */
      acceptJoinRequest: async (joinRequestId) => {
        try {
          await axios.put(\`http://localhost:5001/api/teams/join/\${joinRequestId}/status\`, { status: 'accepted' });
          
          set(state => {
            const jr = state.joinRequests.find(r => r._id === joinRequestId || r.id === joinRequestId)
            if (!jr) return state

            // Mark this request accepted
            const newJoinRequests = state.joinRequests.map(r =>
              (r._id === joinRequestId || r.id === joinRequestId) ? { ...r, status: 'accepted' } : r
            )
            // Auto-reject others for same applicant+hackathon
            .map(r => {
              if (
                (r._id !== joinRequestId && r.id !== joinRequestId) &&
                r.hackathonId === jr.hackathonId &&
                r.sender?.id === jr.sender?.id &&
                r.status === 'pending'
              ) {
                return { ...r, status: 'rejected' }
              }
              return r
            })

            // Update the team size/members
            const newTeamRequests = state.teamRequests.map(tr => {
              if (tr._id === jr.teamRequestId || tr.id === jr.teamRequestId) {
                const members = tr.currentMembers || []
                return {
                  ...tr,
                  currentMembers: [...members, jr.sender],
                  status: (members.length + 1 >= (tr.teamSizeLimit || 4)) ? 'full' : 'team_formed'
                }
              }
              return tr
            })

            // notify applicant
            const applicantId = String(jr.sender?.id)
            const prevNotifs = state.userNotifications[applicantId] || []
            const teamTitle = state.teamRequests.find(t => t._id === jr.teamRequestId || t.id === jr.teamRequestId)?.teamName || 'the team'
            const newNotifs = [
              {
                id: Date.now().toString() + 'n',
                text: \`Your request to join "\${teamTitle}" was accepted!\`,
                type: 'join_accepted',
                read: false,
                timestamp: new Date().toISOString()
              },
              ...prevNotifs
            ]

            return {
              joinRequests: newJoinRequests,
              teamRequests: newTeamRequests,
              userNotifications: { ...state.userNotifications, [applicantId]: newNotifs }
            }
          })
          return { success: true }
        } catch (error) {
          console.error("Accept error:", error)
          return { success: false, message: error.response?.data?.message || 'Server error' }
        }
      },`;

const newAccept = `      /** Lead: Accept applicant */
      acceptJoinRequest: async (joinRequestId) => {
        try {
          const response = await axios.put(\`http://localhost:5001/api/teams/join/\${joinRequestId}/status\`, { status: 'accepted' });
          const { joinRequest: updatedJr, teamRequest: updatedTr } = response.data;
          
          set(state => {
            const jr = state.joinRequests.find(r => r._id === joinRequestId || r.id === joinRequestId)
            if (!jr) return state

            // Replace exactly with backend responses to ensure single source of truth
            let newJoinRequests = state.joinRequests.map(r =>
              (r._id === joinRequestId || r.id === joinRequestId) ? updatedJr : r
            );

            let newTeamRequests = state.teamRequests;
            if (updatedTr) {
              newTeamRequests = state.teamRequests.map(tr => 
                (tr._id === updatedTr._id || tr.id === updatedTr._id) ? updatedTr : tr
              );
            }

            // notify applicant
            const applicantId = String(jr.applicantId || jr.sender?.id)
            const prevNotifs = state.userNotifications[applicantId] || []
            const teamTitle = updatedTr?.title || updatedTr?.teamName || 'the team'
            const newNotifs = [
              {
                id: Date.now().toString() + 'n',
                text: \`Your request to join "\${teamTitle}" was accepted!\`,
                type: 'join_accepted',
                read: false,
                timestamp: new Date().toISOString()
              },
              ...prevNotifs
            ]

            return {
              joinRequests: newJoinRequests,
              teamRequests: newTeamRequests,
              userNotifications: { ...state.userNotifications, [applicantId]: newNotifs }
            }
          })
          return { success: true }
        } catch (error) {
          console.error("Accept error:", error)
          return { success: false, message: error.response?.data?.message || 'Server error' }
        }
      },`;

content = content.replace(oldAccept, newAccept);

fs.writeFileSync(filePath, content);
console.log("hackathonStore.js updated successfully.");
