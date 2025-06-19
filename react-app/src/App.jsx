import React from 'react'
import Button from './shared/components/ui/Button'
import useAuthStore from './shared/stores/authStore'

function App() {
  const { user, isLoading, loginTest, logout } = useAuthStore()

  // Page de connexion
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Synergia</h1>
            <p className="text-gray-600">Plateforme de gestion d'équipe</p>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-6">Connexion</h2>
          
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

  // Dashboard (quand connecté)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary-600">Synergia</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue {user.name}
              </span>
              <Button onClick={logout} variant="secondary" size="sm">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">
            Voici un aperçu de votre activité sur Synergia
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
                <span className="text-xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Niveau</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <span className="text-xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">XP</p>
                <p className="text-2xl font-semibold text-gray-900">2,450</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <span className="text-xl">💎</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points</p>
                <p className="text-2xl font-semibold text-gray-900">180</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <span className="text-xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">🕐</div>
              <h4 className="font-medium text-gray-900">Pointer</h4>
              <p className="text-sm text-gray-600">Enregistrer votre arrivée</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-medium text-gray-900">Nouvelle tâche</h4>
              <p className="text-sm text-gray-600">Créer une nouvelle tâche</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-medium text-gray-900">Mon équipe</h4>
              <p className="text-sm text-gray-600">Voir votre équipe</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
