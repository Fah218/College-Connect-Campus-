import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StudentDashboard from './pages/StudentDashboard'
import ClubHeadDashboard from './pages/ClubHeadDashboard'
import AdminDashboard from './pages/AdminDashboard'
import HackathonPage from './pages/HackathonPage'
import HackathonDetails from './pages/HackathonDetails'
import TeammateFinder from './pages/TeammateFinder'
import EventRegistrationPage from './pages/EventRegistrationPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/student" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/club-head" element={
          <ProtectedRoute role="club_head">
            <ClubHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/hackathons" element={<HackathonPage />} />
        <Route path="/hackathons/:id" element={<HackathonDetails />} />
        <Route path="/teammate-finder" element={<TeammateFinder />} />
        <Route path="/events/:id/register" element={<EventRegistrationPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
