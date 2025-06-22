// src/routes.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './shared/stores/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { ROUTES } from './core/constants'

const AppRoutes = () => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white">Chargement de Synergia...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path={ROUTES.LOGIN} 
        element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />} 
      />
      <Route 
        path={ROUTES.DASHBOARD} 
        element={user ? <Dashboard /> : <Navigate to={ROUTES.LOGIN} replace />} 
      />
      <Route 
        path={ROUTES.HOME} 
        element={<Navigate to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />} 
      />
      {/* Route par défaut */}
      <Route 
        path="*" 
        element={<Navigate to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />} 
      />
    </Routes>
  )
}

export default AppRoutes
