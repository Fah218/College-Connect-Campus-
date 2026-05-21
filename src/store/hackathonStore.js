import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

      // ── Notifications per user (keyed by userId) ───────────────────────────
      // { [userId]: [{ id, text, type, read, createdAt, meta }] }
      userNotifications: {},

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
      addTeamRequest: (data) => {
        const newReq = {
          _id:           Date.now().toString(),
          hackathonId:   String(data.hackathonId),
          teamName:      data.teamName || '',
          description:   data.description,
          requiredRoles: data.requiredRoles || [],   // [{role:'Frontend',count:1}, ...]
          requiredSkills: data.requiredSkills || [],
          owner:         data.owner,                 // {id, name, email}
          members:       [data.owner],               // owner is first member
          joinRequests:  [],
          status:        'open',
          createdAt:     new Date().toISOString()
        }
        set(state => ({ teamRequests: [newReq, ...state.teamRequests] }))
        return newReq
      },

      /** User B: Send a join request to a team */
      sendJoinRequest: (teamRequestId, sender, message) => {
        const teamReq = get().teamRequests.find(r => r._id === teamRequestId)
        if (!teamReq) return null

        // Prevent duplicate
        const already = get().joinRequests.find(
          jr => jr.teamRequestId === teamRequestId && String(jr.sender?.id) === String(sender.id)
        )
        if (already) return already

        const jr = {
          _id:           Date.now().toString(),
          teamRequestId,
          hackathonId:   teamReq.hackathonId,
          sender,        // {id, name, email, skills, department, year}
          message,
          status:        'pending',
          createdAt:     new Date().toISOString()
        }

        set(state => {
          // add join request
          const updatedJRs = [...state.joinRequests, jr]

          // attach to team request's joinRequests array
          const updatedTRs = state.teamRequests.map(tr =>
            tr._id === teamRequestId
              ? { ...tr, joinRequests: [...(tr.joinRequests || []), jr._id] }
              : tr
          )

          // notify the team owner
          const ownerId = String(teamReq.owner?.id)
          const prevOwnerNotifs = state.userNotifications[ownerId] || []
          const newNotif = {
            id:        Date.now().toString() + 'n',
            text:      `${sender.name} wants to join your team "${teamReq.teamName || teamReq.description.slice(0, 30)}"`,
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
      },

      /** User A: Accept a join request */
      acceptJoinRequest: (joinRequestId) => {
        set(state => {
          const jr = state.joinRequests.find(j => j._id === joinRequestId)
          if (!jr) return {}

          const updatedJRs = state.joinRequests.map(j =>
            j._id === joinRequestId ? { ...j, status: 'accepted' } : j
          )

          // add sender to team members
          const updatedTRs = state.teamRequests.map(tr =>
            tr._id === jr.teamRequestId
              ? {
                  ...tr,
                  members: tr.members.some(m => String(m.id) === String(jr.sender.id))
                    ? tr.members
                    : [...tr.members, jr.sender]
                }
              : tr
          )

          // notify the sender (User B)
          const senderId = String(jr.sender?.id)
          const teamReq  = state.teamRequests.find(tr => tr._id === jr.teamRequestId)
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
      },

      /** User A: Reject a join request */
      rejectJoinRequest: (joinRequestId) => {
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
      applyToTeam:     () => {},   // replaced by sendJoinRequest
      acceptApplicant: () => {},   // replaced by acceptJoinRequest
      addTeam:         (team) => set(state => ({ teams: [...(state.teams || []), team] }))
    }),
    { name: 'hackathon-storage' }
  )
)
