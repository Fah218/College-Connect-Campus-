import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useHackathonStore = create(
  persist(
    (set, get) => ({
      hackathons: [
        {
          id: 1,
          title: 'AI Innovation Challenge',
          domain: 'AI/ML',
          college: 'Tech University',
          date: '2025-02-10',
          deadline: '2025-02-05',
          teamSize: '2-4',
          description: 'Build innovative AI solutions for real-world problems',
          eligibility: 'Undergraduate students',
          prize: '$5000'
        },
        {
          id: 2,
          title: 'Web Dev Sprint',
          domain: 'Web Development',
          college: 'Tech University',
          date: '2025-02-15',
          deadline: '2025-02-10',
          teamSize: '3-5',
          description: 'Create modern web applications',
          eligibility: 'All students',
          prize: '$3000'
        }
      ],

      // ── Team Requests ──────────────────────────────────────────────────────
      // A team request = posted by User A looking for teammates
      // Shape: { _id, hackathonId, teamName, description, requiredRoles:[{role, count}],
      //          requiredSkills:[], owner:{id,name,email}, joinRequests:[], members:[], status:'open' }
      teamRequests: [],

      // ── Join Requests (inbox for request owners) ───────────────────────────
      // Created when User B clicks "Request to Join"
      // Shape: { _id, teamRequestId, hackathonId, sender:{id,name,email,skills},
      //          message, status:'pending'|'accepted'|'rejected', createdAt }
      joinRequests: [],

      // { [userId]: [{ id, text, type, read, createdAt, meta }] }
      userNotifications: {},

      fetchHackathonData: async () => {
        try {
          const [teamRes, joinRes] = await Promise.all([
            axios.get('http://localhost:5001/api/teams/request'),
            axios.get('http://localhost:5001/api/teams/join')
          ]);
          
          const dbJoinRequests = joinRes.data.joinRequests.map(jr => ({
            ...jr,
            _id: jr._id,
            id: jr._id,
            teamRequestId: jr.teamRequestId,
            hackathonId: jr.hackathonId,
            message: jr.message,
            status: jr.status,
            githubLink: jr.githubLink,
            portfolioLink: jr.portfolioLink,
            linkedinLink: jr.linkedinLink,
            sender: { 
              id: jr.applicantId, 
              name: jr.applicantName, 
              skills: jr.applicantSkills,
              department: jr.department,
              year: jr.year
            } // map back to sender for UI compatibility
          }));

          const dbTeamRequests = teamRes.data.teamRequests.map(tr => {
            return {
              ...tr,
              _id: tr._id,
              id: tr._id,
              hackathonId: tr.hackathonId,
              
              description: tr.description || '',
              requiredRoles: tr.rolesNeeded || tr.roles || [],
              requiredSkills: tr.requiredSkills || tr.skills || [],
              teamSizeLimit: tr.teamSizeLimit || 4,
              status: tr.status || 'open',
              createdBy: typeof tr.createdBy === 'object' && tr.createdBy !== null ? (tr.createdBy._id || tr.createdBy.id || 'unknown') : (tr.createdBy || 'unknown'),
              owner: typeof tr.createdBy === 'object' && tr.createdBy !== null ? tr.createdBy : undefined,
              currentMembers: tr.currentMembers || [],
              offlineMembers: tr.offlineMembers || []
            };
          });
          
          set({
            teamRequests: dbTeamRequests,
            joinRequests: dbJoinRequests
          });
        } catch (error) {
          console.error("Error fetching hackathon data:", error);
        }
      },

      // ── Helpers ────────────────────────────────────────────────────────────
      getTeamRequestsForHackathon: (hackathonId) => {
        const id = String(hackathonId)
        return (get().teamRequests || []).filter(r => String(r.hackathonId) === id)
      },

      getJoinRequestsForOwner: (userId) =>
        (get().joinRequests || []).filter(jr =>
          (get().teamRequests || []).find(tr =>
            (tr._id === jr.teamRequestId || tr.id === jr.teamRequestId) && String(tr.createdBy) === String(userId)
          )
        ),

      getMyJoinRequests: (userId) =>
        (get().joinRequests || []).filter(jr => String(jr.sender?.id) === String(userId)),

      getMyTeamForHackathon: (hackathonId, userId) => {
        if (!userId) return null;
        return (get().teamRequests || []).find(tr =>
          String(tr.hackathonId) === String(hackathonId) &&
          (String(tr.createdBy) === String(userId) || (tr.currentMembers || []).some(m => m && (String(m.id || m._id || '') === String(userId))))
        );
      },

      getUserNotifications: (userId) =>
        (get().userNotifications || {})[String(userId)] || [],


      // ── Actions ────────────────────────────────────────────────────────────

      /** User A: Post a team request */
      addTeamRequest: async (data) => {
        try {
          const payload = {
            hackathonId: String(data.hackathonId || 'unknown'),
            title: data.title,
            description: data.description || 'No description provided',
            roles: Array.isArray(data.roles) ? data.roles : (Array.isArray(data.requiredRoles) ? data.requiredRoles.map(r => r.role || r) : []),
            skills: data.skills || data.requiredSkills || [],
            createdBy: data.createdBy || data.owner?._id || data.owner?.id
          };
          console.log("TEAM REQUEST PAYLOAD", payload);
          const response = await axios.post('http://localhost:5001/api/teams/request', payload, {
            headers: {
              "Content-Type": "application/json"
            }
          });
          let dbReq = response.data.teamRequest;
          
          // Format it to match the UI normalizer
          const formattedDbReq = {
            _id: dbReq._id || dbReq.id,
            id: dbReq.id || dbReq._id,
            hackathonId: dbReq.hackathonId || dbReq.eventId,
            
            title: dbReq.title,
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
          return formattedDbReq;
        } catch (error) {
          console.error("Failed to post team request", error);
          throw error;
        }
      },

      updateTeamRequest: async (teamRequestId, data) => {
        try {
          const response = await axios.put(`http://localhost:5001/api/teams/request/${teamRequestId}`, data);
          const updatedDbReq = response.data.data;
          
          set(state => ({
            teamRequests: state.teamRequests.map(req => 
              (req._id === teamRequestId || req.id === teamRequestId)
                ? { ...req, ...data, status: updatedDbReq.status }
                : req
            )
          }));
          return response.data;
        } catch (error) {
          console.error("Failed to update team request", error);
          throw error;
        }
      },

      deleteTeamRequest: async (teamRequestId) => {
        try {
          await axios.delete(`http://localhost:5001/api/teams/request/${teamRequestId}`);
          set(state => ({
            teamRequests: state.teamRequests.filter(req => req._id !== teamRequestId && req.id !== teamRequestId)
          }));
        } catch (error) {
          console.error("Failed to delete team request", error);
          throw error;
        }
      },

      /** User B: Send a join request to a team */
      sendJoinRequest: async (teamRequestId, sender, message, details = {}) => {
        const teamReq = get().teamRequests.find(r => r._id === teamRequestId || r.id === teamRequestId)
        if (!teamReq) return null

        // Prevent duplicate
        const already = get().joinRequests.find(
          jr => jr.teamRequestId === teamRequestId && String(jr.sender?.id) === String(sender.id)
        )
        if (already) return already

        try {
          const payload = {
            teamRequestId: teamReq._id || teamReq.id,
            hackathonId: teamReq.hackathonId || 'unknown',
            applicantId: sender?._id || sender?.id ? String(sender._id || sender.id) : 'unknown',
            applicantName: sender?.name || 'Current User',
            applicantSkills: details.skills ? details.skills.split(',').map(s => s.trim()).filter(Boolean) : (sender?.skills || []),
            githubLink: details.github || '',
            portfolioLink: details.portfolio || '',
            linkedinLink: details.linkedin || '',
            message: message || 'I would like to join your team.'
          };
          console.log("JOIN REQUEST PAYLOAD", payload);
          const response = await axios.post('http://localhost:5001/api/teams/join', payload, {
            headers: {
              "Content-Type": "application/json"
            }
          });
          const dbReq = response.data.joinRequest;

          const jr = {
            _id:           dbReq._id,
            teamRequestId: teamReq._id || teamReq.id,
            hackathonId:   teamReq.hackathonId,
            sender:        { ...sender, skills: payload.applicantSkills },
            githubLink:    payload.githubLink,
            portfolioLink: payload.portfolioLink,
            linkedinLink:  payload.linkedinLink,
            message:       payload.message,
            status:        'pending',
            createdAt:     dbReq.createdAt
          }

          set(state => {
            // add join request
            const updatedJRs = [...state.joinRequests, jr]

            // attach to team request's joinRequests array
            const updatedTRs = state.teamRequests.map(tr =>
              (tr._id === teamRequestId || tr.id === teamRequestId)
                ? { ...tr, joinRequests: [...(tr.joinRequests || []), jr._id] }
                : tr
            )

            // notify the team owner
            const ownerId = String(teamReq.createdBy)
            const prevOwnerNotifs = state.userNotifications[ownerId] || []
            const newNotif = {
              id:        Date.now().toString() + 'n',
              text:      `${sender.name || 'Someone'} wants to join your team "${teamReq.title}"`,
              type:      'join_request',
              read:      false,
              createdAt: new Date().toISOString(),
              meta:      { joinRequestId: jr._id, teamRequestId, hackathonId: teamReq.hackathonId }
            }

            return {
              joinRequests:      updatedJRs,
              teamRequests:      updatedTRs,
              userNotifications: {
                ...state.userNotifications,
                [ownerId]: [newNotif, ...prevOwnerNotifs]
              }
            }
          })

          return jr
        } catch (error) {
          console.error("Failed to post join request", error);
          throw error;
        }
      },

      /** User A: Accept a join request */
      acceptJoinRequest: async (joinRequestId) => {
        try {
          // get necessary info before backend mutations
          const jr = get().joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId));
          if (!jr) return;
          
          const response = await axios.put(`http://localhost:5001/api/teams/join/${joinRequestId}/status`, { status: 'accepted' });
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
                
                title: updatedTr.title,
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
              text:      `✅ Your request to join "${teamReq?.title}" was accepted!`,
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
        } catch (error) {
          console.error("Failed to accept join request", error);
          if (error.response && error.response.status === 400) {
            alert(`Could not accept: ${error.response.data.message || 'Team is full or user already accepted.'}`);
            throw new Error(error.response.data.message);
          }
        }
      },

      /** User A: Reject a join request */
      rejectJoinRequest: async (joinRequestId) => {
        try {
          const jr = get().joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId));
          if (!jr) return;

          const response = await axios.put(`http://localhost:5001/api/teams/join/${joinRequestId}/status`, { status: 'rejected' });
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
              text:      `❌ Your request to join "${teamReq?.title}" was not accepted.`,
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
        } catch (error) {
          console.error("Failed to reject join request", error);
        }
      },

      markUserNotifRead: (userId, notifId) =>
        set(state => {
          const uid   = String(userId)
          const notifs = (state.userNotifications[uid] || []).map(n =>
            n.id === notifId ? { ...n, read: true } : n
          )
          return { userNotifications: { ...state.userNotifications, [uid]: notifs } }
        }),

      // Legacy compat
      setHackathons:   (hackathons) => set({ hackathons }),
      setTeamRequests: (requests)   => set({ teamRequests: requests }),
      applyToTeam:     (teamRequestId, applicant) => get().sendJoinRequest(teamRequestId, applicant, 'I would like to join your team.'),
      acceptApplicant: () => {},   // replaced by acceptJoinRequest
      addTeam:         (team) => set(state => ({ teams: [...(state.teams || []), team] }))
    }),
    { name: 'hackathon-storage' }
  )
)
