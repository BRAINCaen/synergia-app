import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'
import { ROUTES } from '../core/constants.js'

// Pages
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return children
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.TASKS} 
        element={
          <ProtectedRoute>
            <div className="p-8">
              <h1 className="text-2xl font-bold">Tâches</h1>
              <p className="text-gray-600">Module des tâches en cours de développement...</p>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.LEADERBOARD} 
        element={
          <ProtectedRoute>
            <div className="p-8">
              <h1 className="text-2xl font-bold">Classement</h1>
              <p className="text-gray-600">Module de classement en cours de développement...</p>
            </div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.PROFILE} 
        element={
          <ProtectedRoute>
            <div className="p-8">
              <h1 className="text-2xl font-bold">Profil</h1>
              <p className="text-gray-600">Module de profil en cours de développement...</p>
            </div>
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Page non trouvée</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Retour
            </button>
          </div>
        </div>
      } />
    </Routes>
  )
}
