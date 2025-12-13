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
      
      teamRequests: [],
      teams: [],
      
      setHackathons: (hackathons) => set({ hackathons }),
      
      setTeamRequests: (requests) => set({ teamRequests: requests }),
      
      addTeamRequest: (request) => set((state) => ({
        teamRequests: [...state.teamRequests, { 
          ...request, 
          _id: request._id || Date.now().toString(),
          applicants: request.applicants || [],
          status: 'open'
        }]
      })),
      
      applyToTeam: (requestId, applicant) => set((state) => ({
        teamRequests: state.teamRequests.map(req =>
          req._id === requestId
            ? { ...req, applicants: [...(req.applicants || []), applicant] }
            : req
        )
      })),
      
      acceptApplicant: (requestId, applicantId) => set((state) => ({
        teamRequests: state.teamRequests.map(req =>
          req._id === requestId
            ? {
                ...req,
                applicants: req.applicants.map(app =>
                  app._id === applicantId
                    ? { ...app, status: 'accepted' }
                    : app
                )
              }
            : req
        )
      })),
      
      addTeam: (team) => set((state) => ({
        teams: [...state.teams, team]
      }))
    }),
    {
      name: 'hackathon-storage'
    }
  )
)
