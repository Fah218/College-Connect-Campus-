import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useHackathonStore } from '../store/hackathonStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import { Plus, Users, Code, Palette, Database, Brain } from 'lucide-react'

export default function TeammateFinder() {
  const location = useLocation()
  const { teamRequests, addTeamRequest, applyToTeam } = useHackathonStore()
  const { user } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  
  const hackathonId = location.state?.hackathonId
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teammate Finder</h1>
            <p className="text-gray-600">Find the perfect teammates for your hackathon</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            Post Request
          </button>
        </div>
        
        {/* Team Requests */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamRequests.map(request => (
            <TeamRequestCard
              key={request.id}
              request={request}
              onApply={(applicant) => applyToTeam(request.id, applicant)}
            />
          ))}
        </div>
        
        {teamRequests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No team requests yet. Be the first to post!
          </div>
        )}
      </div>
      
      {showModal && (
        <TeamRequestModal
          hackathonId={hackathonId}
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            addTeamRequest(data)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function TeamRequestCard({ request, onApply }) {
  const roleIcons = {
    frontend: Palette,
    backend: Database,
    'full-stack': Code,
    ml: Brain,
    design: Palette
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{request.title}</h3>
        <Users className="text-primary-600" size={24} />
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{request.description}</p>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Looking for:</p>
        <div className="flex flex-wrap gap-2">
          {request.roles?.map(role => {
            const Icon = roleIcons[role] || Code
            return (
              <span key={role} className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                <Icon size={12} />
                {role}
              </span>
            )
          })}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {request.skills?.map(skill => (
            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm text-gray-600">
          {request.applicants?.length || 0} applicants
        </span>
        <button
          onClick={() => onApply({ name: 'Current User', skills: [] })}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

function TeamRequestModal({ hackathonId, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    hackathonId,
    title: '',
    description: '',
    roles: [],
    skills: []
  })
  
  const availableRoles = ['frontend', 'backend', 'full-stack', 'ml', 'design']
  const availableSkills = ['React', 'Node.js', 'Python', 'TensorFlow', 'Figma', 'MongoDB', 'AWS']
  
  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }
  
  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Post Team Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Looking for frontend developer"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
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
            <label className="block text-sm font-medium mb-2">Roles Needed</label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.roles.includes(role)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
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
                    formData.skills.includes(skill)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Post Request
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
