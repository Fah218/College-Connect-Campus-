import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { GraduationCap } from 'lucide-react'
import axios from 'axios'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    college: 'Tech University',
    department: '',
    year: '',
    skills: [],
    clubName: '',
    adminCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const roleMapping = {
        student: 'Student',
        admin: 'Admin',
        club_head: 'ClubHead'
      };

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: roleMapping[formData.role],
        department: formData.department || 'General',
        rollNumber: formData.role === 'student' ? 'STU' + Math.floor(Math.random() * 100000) : undefined,
        employeeId: formData.role === 'admin' ? 'EMP' + Math.floor(Math.random() * 100000) : undefined,
        clubName: formData.role === 'club_head' ? formData.clubName : undefined,
        studentId: formData.role === 'club_head' ? 'STU' + Math.floor(Math.random() * 100000) : undefined,
      };

      const response = await axios.post('http://localhost:5001/api/auth/register', payload);

      login({
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: formData.role,
        skills: formData.skills,
        clubName: formData.clubName,
        department: formData.department
      });

      const routes = {
        student: '/student',
        club_head: '/club-head',
        admin: '/admin'
      }
      navigate(routes[formData.role])
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during signup');
    } finally {
      setLoading(false);
    }
  }

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
    setFormData({ ...formData, skills })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 mb-2">
            <GraduationCap size={32} />
            CampusConnect
          </Link>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex bg-gray-100 p-1 rounded-lg mb-8 max-w-md mx-auto">
            {[
              { id: 'student', label: 'Student' },
              { id: 'club_head', label: 'Club Head' }
            ].map((roleType) => (
              <button
                key={roleType.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: roleType.id })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === roleType.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {roleType.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {formData.role === 'student' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    onChange={handleSkillsChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="React, Python, Machine Learning"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your skills separated by commas</p>
                </div>
              </>
            )}

            {formData.role === 'club_head' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Club Name *
                </label>
                <input
                  type="text"
                  value={formData.clubName}
                  onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Coding Club"
                  required={formData.role === 'club_head'}
                />
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
