import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEventStore } from './store/eventStore'
import { useHackathonStore } from './store/hackathonStore'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StudentDashboard from './pages/StudentDashboard'
import ClubHeadDashboard from './pages/ClubHeadDashboard'
import AdminDashboard from './pages/AdminDashboard'
import HackathonPage from './pages/HackathonPage'
import HackathonDetails from './pages/HackathonDetails'
import HackathonTeammateFinder from './pages/HackathonTeammateFinder'
import EventRegistrationPage from './pages/EventRegistrationPage'
import ProtectedRoute from './components/ProtectedRoute'
import axios from 'axios'

axios.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;
  if (user && config.url && config.url.includes('/api/analytics/admin')) {
    config.params = { ...config.params, adminId: user._id };
  }
  return config;
});

import StudentProfilePage from './pages/StudentProfilePage'
import AdminProfilePage from './pages/AdminProfilePage'
import ClubHeadProfilePage from './pages/ClubHeadProfilePage'
import ExploreEventsPage from './pages/ExploreEventsPage'
import AdminClubManagementPage from './pages/AdminClubManagementPage'
import AdminEventDetailsPage from './pages/AdminEventDetailsPage'

function App() {
  console.log("[App] rendered");
  const fetchEvents = useEventStore(state => state.fetchEvents)
  const fetchHackathonData = useHackathonStore(state => state.fetchHackathonData)
  
  useEffect(() => {
    fetchEvents()
    fetchHackathonData()
  }, [fetchEvents, fetchHackathonData])

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
        <Route path="/admin/clubs/:id" element={
          <ProtectedRoute role="admin">
            <AdminClubManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/events/:id" element={
          <ProtectedRoute roles={['admin', 'club_head']}>
            <AdminEventDetailsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/explore-events" element={<ExploreEventsPage />} />
        <Route path="/hackathons" element={<HackathonPage />} />
        <Route path="/hackathons/:id" element={<HackathonDetails />} />
        <Route path="/hackathons/:id/teammates" element={
          <ProtectedRoute role="student">
            <HackathonTeammateFinder />
          </ProtectedRoute>
        } />

        <Route path="/events/:id/register" element={
          <ProtectedRoute role="student">
            <EventRegistrationPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
