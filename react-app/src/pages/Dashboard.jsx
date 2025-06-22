import React from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User, Trophy, CheckSquare } from 'lucide-react'
import { useAuthStore } from '../shared/stores/authStore.js'
import { Card, CardHeader, CardTitle, CardContent } from '../shared/components/ui/Card.jsx'
import { Button } from '../shared/components/ui/Button.jsx'
import WelcomeWidget from '../modules/dashboard/widgets/WelcomeWidget.jsx'
import { ROUTES } from '../core/constants.js'
import { auth } from '../core/firebase.js'

export default function Dashboard() {
  const { user } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      console.log('Déconnexion réussie')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Synergia</h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.displayName || user?.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Widget */}
        <div className="mb-8">
          <WelcomeWidget />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to={ROUTES.TASKS}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Tâches</h3>
                  <p className="text-gray-600">Gérez vos tâches quotidiennes</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to={ROUTES.LEADERBOARD}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Classement</h3>
                  <p className="text-gray-600">Consultez le tableau des scores</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to={ROUTES.PROFILE}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Profil</h3>
                  <p className="text-gray-600">Gérez votre profil utilisateur</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Tâches complétées</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Points XP</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
              <div className="text-sm text-gray-600">Niveau actuel</div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
