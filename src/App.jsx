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
import StudentProfilePage from './pages/StudentProfilePage'
import AdminProfilePage from './pages/AdminProfilePage'
import ClubHeadProfilePage from './pages/ClubHeadProfilePage'
import ExploreEventsPage from './pages/ExploreEventsPage'

function App() {
  return (
    <BrowserRouter basename="/campus-connect">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/student" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute role="student">
            <StudentProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/club-head" element={
          <ProtectedRoute role="club_head">
            <ClubHeadDashboard />
          </ProtectedRoute>
        } />
        <Route path="/club-head/profile" element={
          <ProtectedRoute role="club_head">
            <ClubHeadProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute role="admin">
            <AdminProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/explore-events" element={<ExploreEventsPage />} />
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
