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
            sender: { id: jr.applicantId, name: jr.applicantName, skills: jr.applicantSkills } // map back to sender for UI compatibility
          }));

          const dbTeamRequests = teamRes.data.teamRequests.map(tr => {
            // Recover members data by combining the owner and all accepted join requests!
            const ownerMember = { id: tr.createdBy || 'unknown', name: 'Team Lead' };
            const acceptedMembers = dbJoinRequests
              .filter(jr => String(jr.teamRequestId) === String(tr._id) && jr.status === 'accepted')
              .map(jr => jr.sender);

            return {
              ...tr,
              _id: tr._id,
              id: tr._id,
              hackathonId: tr.hackathonId,
              teamName: tr.title || tr.teamName || 'Untitled Team',
              description: tr.description || '',
              requiredRoles: tr.rolesNeeded || tr.roles || [],
              requiredSkills: tr.requiredSkills || tr.skills || [],
              teamSizeLimit: tr.teamSizeLimit || 4,
              status: tr.status || 'open',
              owner: { id: tr.createdBy || 'unknown' }, // map back to owner for UI compatibility
              members: [ownerMember, ...acceptedMembers]
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
            tr._id === jr.teamRequestId && String(tr.owner?.id) === String(userId)
          )
        ),

      getMyJoinRequests: (userId) =>
        (get().joinRequests || []).filter(jr => String(jr.sender?.id) === String(userId)),

      getMyTeamForHackathon: (hackathonId, userId) => {
        if (!userId) return null;
        return (get().teamRequests || []).find(tr =>
          String(tr.hackathonId) === String(hackathonId) &&
          (tr.members || []).some(m => m && (String(m.id || m._id || '') === String(userId)))
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
            title: data.title || data.teamName || 'Untitled Team Request',
            description: data.description || 'No description provided',
            roles: Array.isArray(data.roles) ? data.roles : (Array.isArray(data.requiredRoles) ? data.requiredRoles.map(r => r.role || r) : []),
            skills: data.skills || data.requiredSkills || [],
            createdBy: data.owner?.id ? String(data.owner.id) : 'Unknown'
          };
          const response = await axios.post('http://localhost:5001/api/teams/request', payload);
          const dbReq = response.data.teamRequest;
          
          const newReq = {
            _id:           dbReq._id,
            hackathonId:   String(data.hackathonId),
            teamName:      data.teamName || '',
            description:   data.description,
            requiredRoles: data.requiredRoles || [],
            requiredSkills: data.requiredSkills || [],
            owner:         data.owner,
            members:       [data.owner].filter(Boolean),
            joinRequests:  [],
            status:        'open',
            createdAt:     dbReq.createdAt
          }
          set(state => ({ teamRequests: [newReq, ...state.teamRequests] }))
          return newReq
        } catch (error) {
          console.error("Failed to post team request", error);
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
            applicantId: sender?.id ? String(sender.id) : 'unknown',
            applicantName: sender?.name || 'Current User',
            applicantSkills: details.skills ? details.skills.split(',').map(s => s.trim()).filter(Boolean) : (sender?.skills || []),
            githubLink: details.github || '',
            portfolioLink: details.portfolio || '',
            linkedinLink: details.linkedin || '',
            message: message || 'I would like to join your team.'
          };
          
          const response = await axios.post('http://localhost:5001/api/teams/join', payload);
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
            const ownerId = String(teamReq.owner?.id)
            const prevOwnerNotifs = state.userNotifications[ownerId] || []
            const newNotif = {
              id:        Date.now().toString() + 'n',
              text:      `${sender.name || 'Someone'} wants to join your team "${teamReq.teamName || teamReq.title || 'Untitled'}"`,
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
          await axios.put(`http://localhost:5001/api/teams/join/${joinRequestId}/status`, { status: 'accepted' });
          
          set(state => {
            const jr = state.joinRequests.find(j => String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId))
            if (!jr) return {}

            const updatedJRs = state.joinRequests.map(j => {
              if (String(j._id) === String(joinRequestId) || String(j.id) === String(joinRequestId)) {
                return { ...j, status: 'accepted' };
              }
              // Auto-reject other pending requests from the same user for the same hackathon
              if (String(j.hackathonId) === String(jr.hackathonId) && 
                  String(j.sender?.id) === String(jr.sender?.id) && 
                  j.status === 'pending') {
                return { ...j, status: 'rejected' };
              }
              return j;
            });

            // add sender to team members
            const updatedTRs = state.teamRequests.map(tr => {
              if (String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId)) {
                const members = tr.members || [];
                const isMember = members.some(m => String(m.id) === String(jr.sender?.id));
                const newMembers = isMember ? members : [...members, jr.sender];
                
                // Also check if full
                const isFull = newMembers.length >= (tr.teamSizeLimit || 4);
                
                return {
                  ...tr,
                  members: newMembers,
                  status: isFull ? 'full' : tr.status
                };
              }
              return tr;
            })

            // notify the sender (User B)
            const senderId = String(jr.sender?.id)
            const teamReq  = state.teamRequests.find(tr => String(tr._id) === String(jr.teamRequestId) || String(tr.id) === String(jr.teamRequestId))
            const prevSenderNotifs = state.userNotifications[senderId] || []
            const newNotif = {
              id:        Date.now().toString() + 'a',
              text:      `✅ Your request to join "${teamReq?.teamName || 'the team'}" was accepted!`,
              type:      'accepted',
              read:      false,
              createdAt: new Date().toISOString(),
              meta:      { teamRequestId: jr.teamRequestId, hackathonId: jr.hackathonId }
            }

            return {
              joinRequests:      updatedJRs,
              teamRequests:      updatedTRs,
              userNotifications: {
                ...state.userNotifications,
                [senderId]: [newNotif, ...prevSenderNotifs]
              }
            }
          })
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
          await axios.put(`http://localhost:5001/api/teams/join/${joinRequestId}/status`, { status: 'rejected' });

          set(state => {
            const jr = state.joinRequests.find(j => j._id === joinRequestId)
            if (!jr) return {}

            const updatedJRs = state.joinRequests.map(j =>
              j._id === joinRequestId ? { ...j, status: 'rejected' } : j
            )

          // notify sender
          const senderId = String(jr.sender?.id)
          const teamReq  = state.teamRequests.find(tr => tr._id === jr.teamRequestId)
          const prevSenderNotifs = state.userNotifications[senderId] || []
          const newNotif = {
            id:        Date.now().toString() + 'r',
            text:      `❌ Your request to join "${teamReq?.teamName || 'the team'}" was not accepted.`,
            type:      'rejected',
            read:      false,
            createdAt: new Date().toISOString(),
            meta:      { teamRequestId: jr.teamRequestId }
          }

          return {
            joinRequests:      updatedJRs,
            userNotifications: {
              ...state.userNotifications,
              [senderId]: [newNotif, ...prevSenderNotifs]
            }
          }
        })
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
