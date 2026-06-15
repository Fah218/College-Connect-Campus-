import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'
import { useAuthStore } from '../store/authStore'
import { useRegistrationStore } from '../store/registrationStore'
import Navbar from '../components/Navbar'
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function EventRegistrationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { events } = useEventStore()
  const { user, isAuthenticated, addNotification } = useAuthStore()
  const { registerIndividual } = useRegistrationStore()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    year: '',
    expectations: ''
  })
  
  const event = events.find(e => String(e.id) === String(id) || String(e._id) === String(id))
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      await registerIndividual(event._id || event.id, formData, user?.id || user?._id)
      setSuccess(true)
      addNotification({
        title: 'Registration Successful!',
        message: `You have been registered for ${event.title}`,
        priority: 'high'
      })
      
      setTimeout(() => {
        navigate('/student')
      }, 2000)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  
  if (!event) {
    return <div>Event not found</div>
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              You have been successfully registered for {event.title}
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Event Registration</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">{event.title}</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                {format(new Date(event.date), 'MMMM dd, yyyy')} at {event.time}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} />
                {event.location}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                {event.attendees || 0}/{event.capacity} registered
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm">{event.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Registration Form</h2>
            
            {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  What do you expect from this event?
                </label>
                <textarea
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
