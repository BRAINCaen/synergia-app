import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './shared/stores/authStore'
import TestDashboard from './pages/TestDashboard'

// Page de connexion simple
const LoginPage = () => {
  const { loginTest, isLoading } = useAuthStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Connexion Synergia</h2>
        <Button 
          onClick={loginTest} 
          loading={isLoading}
          className="w-full"
        >
          Se connecter
        </Button>
      </div>
    </div>
  )
}

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <TestDashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
