import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import SkillMatcher from '../components/SkillMatcher'
import { Calendar, MapPin, Users, Trophy, Clock, Award, Plus, CheckCircle, X } from 'lucide-react'
import { format } from 'date-fns'

export default function HackathonDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hackathons, teamRequests, setTeamRequests, applyToTeam, acceptApplicant } = useHackathonStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showPostRequest, setShowPostRequest] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  
  const hackathon = hackathons.find(h => h._id === id || h.id === parseInt(id))
  const relatedRequests = teamRequests.filter(r => 
    r.hackathonId === id || r.hackathonId === parseInt(id)
  )
  
  useEffect(() => {
    // Mock data - no backend needed
    setLoading(false)
  }, [id])
  
  const handleApplyToRequest = (requestId, message) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Mock application - no backend needed
    applyToTeam(requestId, {
      _id: Date.now().toString(),
      user: { _id: user.id, name: user.name, email: user.email, skills: user.skills },
      message,
      status: 'pending'
    })
    addNotification({
      title: 'Application Sent',
      message: 'Your application has been sent to the team',
      priority: 'medium'
    })
  }
  
  const handleAcceptApplicant = (requestId, applicantId) => {
    // Mock acceptance - no backend needed
    acceptApplicant(requestId, applicantId)
    addNotification({
      title: 'Applicant Accepted',
      message: 'Team member has been added successfully',
      priority: 'high'
    })
  }
  
  // Mock team data for skill matching
  const mockTeam = {
    members: [
      { name: user?.name || 'User', skills: user?.skills || ['React', 'JavaScript'] }
    ]
  }
  
  const availableStudents = [
    { id: 1, name: 'Alice Johnson', skills: ['Python', 'ML', 'TensorFlow'] },
    { id: 2, name: 'Bob Smith', skills: ['Node.js', 'MongoDB', 'AWS'] },
    { id: 3, name: 'Carol White', skills: ['UI/UX', 'Figma', 'React'] }
  ]
  
  if (!hackathon) {
    return <div>Hackathon not found</div>
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{hackathon.title}</h1>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {hackathon.domain}
              </span>
            </div>
            <Trophy className="text-yellow-500" size={48} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <InfoItem icon={Calendar} label="Event Date" value={format(new Date(hackathon.date), 'MMMM dd, yyyy')} />
            <InfoItem icon={Clock} label="Registration Deadline" value={format(new Date(hackathon.deadline), 'MMMM dd, yyyy')} />
            <InfoItem icon={MapPin} label="Location" value={hackathon.college} />
            <InfoItem icon={Users} label="Team Size" value={hackathon.teamSize} />
            <InfoItem icon={Award} label="Prize Pool" value={hackathon.prize} />
            <InfoItem icon={Users} label="Eligibility" value={hackathon.eligibility} />
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700">
              🤖 <strong>AI Summary:</strong> This hackathon focuses on {hackathon.domain} and requires teams of {hackathon.teamSize}. 
              {hackathon.domain.includes('AI') && ' Strong machine learning and data science skills recommended.'}
              {hackathon.domain.includes('Web') && ' Full-stack development experience is beneficial.'}
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">{hackathon.description}</p>
        </div>
        
        {/* Skill Matcher */}
        <SkillMatcher team={mockTeam} availableStudents={availableStudents} />
        
        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <div className="flex gap-4">
            <Link
              to="/teammate-finder"
              state={{ hackathonId: hackathon.id }}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 text-center"
            >
              Find Teammates
            </Link>
            <button className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              Register Team
            </button>
          </div>
        </div>
        
        {/* Team Requests */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Looking for Teammates</h2>
            {isAuthenticated && (
              <button
                onClick={() => setShowPostRequest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus size={18} />
                Post Request
              </button>
            )}
          </div>
          
          {relatedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No team requests yet. Be the first to post!
            </p>
          ) : (
            <div className="space-y-4">
              {relatedRequests.map(request => (
                <TeamRequestCard
                  key={request._id}
                  request={request}
                  currentUser={user}
                  onApply={handleApplyToRequest}
                  onAccept={handleAcceptApplicant}
                  onViewDetails={() => setSelectedRequest(request)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showPostRequest && (
        <PostRequestModal
          hackathonId={id}
          onClose={() => setShowPostRequest(false)}
          onSuccess={loadTeamRequests}
        />
      )}
      
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          currentUser={user}
          onClose={() => setSelectedRequest(null)}
          onAccept={handleAcceptApplicant}
        />
      )}
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary-100 rounded-lg">
        <Icon className="text-primary-600" size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}


function TeamRequestCard({ request, currentUser, onApply, onAccept, onViewDetails }) {
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [message, setMessage] = useState('')
  const isRequester = request.requester?._id === currentUser?.id || request.requester === currentUser?.id
  const hasApplied = request.applicants?.some(app => 
    app.user?._id === currentUser?.id || app.user === currentUser?.id
  )
  
  const handleApply = () => {
    onApply(request._id, message)
    setShowApplyForm(false)
    setMessage('')
  }
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{request.title}</h3>
          <p className="text-sm text-gray-600">
            by {request.requester?.name || 'Anonymous'}
          </p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {request.applicants?.length || 0} applicants
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
      
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {request.requiredSkills?.map(skill => (
            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {request.requiredRoles?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Looking for:</p>
          <div className="flex flex-wrap gap-2">
            {request.requiredRoles.map(role => (
              <span key={role} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
        {isRequester ? (
          <button
            onClick={onViewDetails}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            View Applications ({request.applicants?.length || 0})
          </button>
        ) : hasApplied ? (
          <button
            disabled
            className="flex-1 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed"
          >
            Applied
          </button>
        ) : showApplyForm ? (
          <div className="flex-1 space-y-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why are you a good fit?"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows="2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                Send Application
              </button>
              <button
                onClick={() => setShowApplyForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowApplyForm(true)}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            Apply to Join
          </button>
        )}
      </div>
    </div>
  )
}

function PostRequestModal({ hackathonId, onClose, onSuccess }) {
  const { addTeamRequest } = useHackathonStore()
  const { addNotification } = useAuthStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    requiredRoles: []
  })
  const [loading, setLoading] = useState(false)
  
  const availableSkills = ['React', 'Node.js', 'Python', 'TensorFlow', 'Figma', 'MongoDB', 'AWS', 'UI/UX']
  const availableRoles = ['Frontend', 'Backend', 'Full-Stack', 'ML Engineer', 'Designer', 'DevOps']
  
  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }))
  }
  
  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.includes(role)
        ? prev.requiredRoles.filter(r => r !== role)
        : [...prev.requiredRoles, role]
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Mock request creation - no backend needed
    setTimeout(() => {
      const newRequest = {
        _id: Date.now().toString(),
        hackathonId,
        ...formData,
        requester: { name: 'Current User' },
        applicants: [],
        status: 'open'
      }
      addTeamRequest(newRequest)
      addNotification({
        title: 'Request Posted',
        message: 'Your team request has been posted successfully',
        priority: 'medium'
      })
      onSuccess()
      onClose()
      setLoading(false)
    }, 500)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Post Team Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Looking for Frontend Developer"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows="3"
              placeholder="Describe your project and what you're looking for..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.requiredSkills.includes(skill)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Required Roles</label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.requiredRoles.includes(role)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RequestDetailsModal({ request, currentUser, onClose, onAccept }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{request.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">{request.description}</p>
        
        <h3 className="text-lg font-semibold mb-4">
          Applications ({request.applicants?.length || 0})
        </h3>
        
        {request.applicants?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No applications yet</p>
        ) : (
          <div className="space-y-4">
            {request.applicants.map(applicant => (
              <div key={applicant._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{applicant.user?.name}</h4>
                    <p className="text-sm text-gray-600">{applicant.user?.email}</p>
                  </div>
                  {applicant.status === 'accepted' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <CheckCircle size={16} />
                      Accepted
                    </span>
                  ) : (
                    <button
                      onClick={() => onAccept(request._id, applicant._id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      Accept
                    </button>
                  )}
                </div>
                
                {applicant.user?.skills?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {applicant.user.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {applicant.message && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{applicant.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
