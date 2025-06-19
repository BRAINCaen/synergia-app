import React from 'react'
import Button from './shared/components/ui/Button'
import useAuthStore from './shared/stores/authStore'

function App() {
  const { user, isLoading, loginTest, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          Synergia 2.0
        </h1>
        <p className="text-gray-600 mb-8">
          Test du store Zustand...
        </p>
        
        <div className="bg-white p-8 rounded-lg shadow space-y-4">
          {user ? (
            <div>
              <p className="text-green-600 font-medium mb-2">
                ✅ Connecté : {user.name}
              </p>
              <Button onClick={logout} variant="secondary">
                Se déconnecter
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Non connecté</p>
              <Button 
                onClick={loginTest} 
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Test Connexion'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
