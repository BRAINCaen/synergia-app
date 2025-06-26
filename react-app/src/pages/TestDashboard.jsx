// ==========================================
// 📁 react-app/src/pages/TestDashboard.jsx
// TestDashboard CORRIGÉ - Import authStore fix
// ==========================================

import React from 'react'
import Button from '../shared/components/ui/Button'
// 🚀 CORRECTION: Import nommé pour authStore
import { useAuthStore } from '../shared/stores/authStore'

const TestDashboard = () => {
  const { user, signOut } = useAuthStore()

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
                Bienvenue {user?.displayName || user?.email || 'Utilisateur'} !
              </p>
            </div>
            <Button onClick={signOut} variant="secondary">
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

export default TestDashboard
