import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './modules/auth/pages/Login'
import Dashboard from './modules/dashboard/pages/Dashboard'
import useAuthStore from './shared/stores/authStore'
import { LoadingPage } from './shared/components/ui/Loading'

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingPage message="Vérification de l'authentification..." />
  }

  return user ? children : <Navigate to="/login" replace />
}

// Composant pour rediriger les utilisateurs connectés
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingPage message="Chargement..." />
  }

  return user ? <Navigate to="/dashboard" replace /> : children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques (avec AuthLayout) */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <Login />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Routes protégées (avec DashboardLayout) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Route 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Page non trouvée</p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      } />
    </Routes>
  )
}

export default AppRoutes
