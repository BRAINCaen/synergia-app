import React from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User, Trophy, CheckSquare } from 'lucide-react'
import { useAuthStore } from '../shared/stores/authStore.js'
import { ROUTES } from '../core/constants.js'
import { auth } from '../core/firebase.js'

// Composant Card simple intégré
const Card = ({ className = '', children, ...props }) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
)

// Composant Button simple intégré
const Button = ({ 
  className = '', 
  variant = 'primary', 
  size = 'md',
  disabled,
  children, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 disabled:opacity-60',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:opacity-60'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Composant WelcomeWidget simple intégré
const WelcomeWidget = () => {
  const { user } = useAuthStore()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {getGreeting()}, {getDisplayName()} ! 👋
          </h2>
          <p className="text-blue-100">
            Prêt à atteindre vos objectifs aujourd'hui ?
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Niveau</div>
          <div className="text-3xl font-bold">1</div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm text-blue-100 mb-2">
          <span>Progression</span>
          <span>0 / 100 XP</span>
        </div>
        <div className="w-full bg-blue-400 rounded-full h-2">
          <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>
    </Card>
  )
}

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
