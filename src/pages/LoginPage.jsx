import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { GraduationCap } from 'lucide-react'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const roleMapping = {
        student: 'Student',
        admin: 'Admin',
        club_head: 'ClubHead'
      };

      const payload = {
        email,
        password,
        role: roleMapping[role],
      };

      const response = await axios.post('http://localhost:5001/api/auth/login', payload);
      
      const userData = {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: role,
        skills: response.data.user.skills || ['React', 'Python', 'Machine Learning'],
        clubName: response.data.user.clubName,
        department: response.data.user.department
      }
      
      login(userData)
      
      // Navigate based on role
      const routes = {
        student: '/student',
        club_head: '/club-head',
        admin: '/admin'
      }
      navigate(routes[role])
    } catch (err) {
       setError(err.response?.data?.message || 'Error occurred during login. Please check credentials and role.');
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 mb-2">
            <GraduationCap size={32} />
            CampusConnect
          </Link>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="student@university.edu"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login as
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="club_head">Club Head</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
