import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Button from './shared/components/ui/Button'
import useAuthStore from './shared/stores/authStore'

// Page de connexion simple
const LoginPage = () => {
  const { user, loginTest, isLoading } = useAuthStore()
  
  // Si déjà connecté, rediriger vers dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Connexion Synergia</h2>
        <Button 
          onClick={loginTest} 
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </div>
    </div>
  )
}

// Dashboard simple
const TestDashboard = () => {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Synergia
              </h1>
              <p className="text-gray-600">
                Bienvenue {user?.name || 'Utilisateur'} !
              </p>
            </div>
            <Button onClick={logout} variant="secondary">
              Déconnexion
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Niveau</h3>
            <p className="text-3xl font-bold text-primary-600">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">XP</h3>
            <p className="text-3xl font-bold text-yellow-600">2,450</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Badges</h3>
            <p className="text-3xl font-bold text-green-600">8</p>
          </div>
        </div>
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
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
