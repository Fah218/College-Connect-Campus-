import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children, roles, role }) {
  const { isAuthenticated, user } = useAuthStore()
  
  console.log("[ProtectedRoute] " + JSON.stringify({
    pathname: window.location.pathname,
    isAuthenticated,
    userRole: user?.role,
    role,
    roles
  }));

  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Redirecting because not authenticated");
    return <Navigate to="/login" replace />
  }
  
  // Support both new `roles` array and legacy `role` string for backward compatibility
  if (roles && Array.isArray(roles)) {
    if (!roles.includes(user?.role)) {
      console.log("[ProtectedRoute] Redirecting because roles array mismatch");
      return <Navigate to="/" replace />
    }
  } else if (role) {
    if (user?.role !== role) {
      console.log("[ProtectedRoute] Redirecting because role string mismatch");
      return <Navigate to="/" replace />
    }
  }
  
  return children
}