import { Link } from 'react-router-dom'
import { Calendar, Trophy, BarChart3, Users, Zap, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect. Collaborate. Compete.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your all-in-one platform for campus events, club management, and hackathon team formation
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore-events" className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
              Explore Events
            </Link>
            <Link to="/hackathons" className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition">
              Join Hackathons
            </Link>
            {isAuthenticated ? (
              <Link to={user?.role === 'admin' || user?.role === 'Admin' ? '/admin' : user?.role === 'club_head' || user?.role === 'ClubHead' ? '/club-head' : '/student'} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                Login
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Calendar}
            title="Event Management"
            description="Browse, create, and manage campus events with ease. Filter by category, club, and date."
          />
          <FeatureCard
            icon={Trophy}
            title="Hackathon Hub"
            description="Discover hackathons, form teams, and find teammates with matching skills."
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Track event performance, attendance trends, and club activity metrics."
          />
          <FeatureCard
            icon={Users}
            title="Team Formation"
            description="Post teammate requests and connect with students from your college."
          />
          <FeatureCard
            icon={Zap}
            title="Real-time Updates"
            description="Get instant notifications about event approvals and team requests."
          />
          <FeatureCard
            icon={Shield}
            title="Role-based Access"
            description="Secure dashboards for students, club heads, and administrators."
          />
        </div>
      </section>
      
      {/* Stats */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-primary-100">Active Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50+</p>
              <p className="text-primary-100">Campus Clubs</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">200+</p>
              <p className="text-primary-100">Events Hosted</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">30+</p>
              <p className="text-primary-100">Hackathons</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
            
            {/* Column 1 - Brand */}
            <div>
              <div className="flex items-center gap-2 text-xl font-bold text-primary-600 mb-4">
                <div className="bg-primary-600 text-white p-1.5 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                CampusConnect
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Connecting Students, Clubs, and Campus Opportunities — All in One Place.
              </p>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li><Link to="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
                <li><Link to="/explore-events" className="hover:text-primary-600 transition-colors">Explore Events</Link></li>
                <li><Link to="/hackathons" className="hover:text-primary-600 transition-colors">Hackathons</Link></li>
                <li><Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-primary-600 transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Column 3 - Platform */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li><Link to="/student" className="hover:text-primary-600 transition-colors">Student Portal</Link></li>
                <li><Link to="/club-head" className="hover:text-primary-600 transition-colors">Club Head Portal</Link></li>
                <li><Link to="/admin" className="hover:text-primary-600 transition-colors">Admin Dashboard</Link></li>
                <li><Link to="/hackathons" className="hover:text-primary-600 transition-colors">Team Finder</Link></li>
                <li><Link to="/explore-events" className="hover:text-primary-600 transition-colors">Event Registration</Link></li>
              </ul>
            </div>

            {/* Column 4 - Platform Highlights */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform Highlights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-lg font-bold text-gray-900">500+</div>
                  <div className="text-xs text-gray-500">Active Students</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-lg font-bold text-gray-900">50+</div>
                  <div className="text-xs text-gray-500">Campus Clubs</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-lg font-bold text-gray-900">200+</div>
                  <div className="text-xs text-gray-500">Events Hosted</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-lg font-bold text-gray-900">30+</div>
                  <div className="text-xs text-gray-500">Hackathons</div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-500">&copy; 2026 CampusConnect. All rights reserved.</p>
            <p className="text-gray-400 font-medium tracking-wide">Connecting Students. Empowering Innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="text-primary-600" size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
