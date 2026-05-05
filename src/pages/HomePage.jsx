import { Link } from 'react-router-dom'
import { Calendar, Trophy, BarChart3, Users, Zap, Shield } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function HomePage() {
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
            <Link to="/login" className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
              Login
            </Link>
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
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 CampusConnect. Built for students, by students.</p>
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
