// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard COMPLET - Version sans boutons XP rapides
// ==========================================

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore.js'
import { useTaskService } from '../shared/hooks/useTaskService.js'
import { useProjectService } from '../shared/hooks/useProjectService.js'
import { useGameService } from '../shared/hooks/useGameService.js'
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

// 🎮 Composant Gamification Widget - VERSION SANS BOUTONS XP
const GamificationWidget = () => {
  const { gameData, isLoading, calculations, isConnected } = useGameService()

  if (!isConnected) {
    return (
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <h3 className="text-lg font-bold mb-2">🎮 Gamification</h3>
        <p className="text-purple-100">Connectez-vous pour voir votre progression</p>
      </Card>
    )
  }

  if (isLoading || !gameData) {
    return (
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-purple-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-purple-300 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  const progress = calculations.getProgressToNextLevel() * 100
  const xpNeeded = calculations.getXPNeededForNextLevel()

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white" data-testid="gamification-widget">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">🎮 Niveau {gameData.level}</h3>
          <p className="text-purple-100">{gameData.totalXp} XP Total</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{gameData.badges?.length || 0}</div>
          <div className="text-sm text-purple-100">Badges</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-purple-100 mb-2">
          <span>Progression</span>
          <span>{xpNeeded} XP restants</span>
        </div>
        <div className="flex justify-between text-xs text-purple-200 mb-1">
          <span>{Math.round(progress)}% vers le niveau suivant</span>
        </div>
        <div className="w-full bg-purple-400 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* ✅ SUPPRIMÉ: Boutons d'action rapide XP */}
      {/* Les XP se gagnent maintenant uniquement en complétant des vraies tâches */}
      
      <div className="text-center text-purple-100 text-sm">
        💡 Complétez des tâches pour gagner de l'XP !
      </div>
    </Card>
  )
}

// 📊 Composant Statistiques Tâches avec données réelles
const TaskStatsWidget = () => {
  const { stats, tasks, isConnected } = useTaskService()

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Mes Statistiques</h3>
        <p className="text-gray-500">Connectez-vous pour voir vos stats</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Mes Statistiques</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Tâches totales</span>
          <span className="font-bold">{stats.total || tasks?.length || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tâches complétées</span>
          <span className="font-bold text-green-600">{stats.completed || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">En cours</span>
          <span className="font-bold text-blue-600">{stats.inProgress || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Taux de réussite</span>
          <span className="font-bold">{stats.completionRate || 0}%</span>
        </div>
        
        <div className="pt-3 border-t">
          <div className="text-sm text-gray-500 mb-2">Progression globale</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// 📈 Composant Performance avec données d'activité
const PerformanceWidget = () => {
  const { gameData, isConnected } = useGameService()
  const { tasks } = useTaskService()

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Performance</h3>
        <p className="text-gray-500">Connectez-vous pour voir vos performances</p>
      </Card>
    )
  }

  // Calculer les stats de la semaine
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const tasksThisWeek = tasks?.filter(task => 
    task.completedAt && new Date(task.completedAt) > thisWeek
  ).length || 0

  const xpToday = gameData?.xpHistory?.filter(entry => {
    const entryDate = new Date(entry.timestamp)
    const today = new Date()
    return entryDate.toDateString() === today.toDateString()
  }).reduce((sum, entry) => sum + entry.amount, 0) || 0

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📈 Performance</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Tâches cette semaine</span>
          <span className="font-bold">{tasksThisWeek}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">XP gagnés aujourd'hui</span>
          <span className="font-bold text-purple-600">{xpToday}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Streak de connexion</span>
          <span className="font-bold">{gameData?.loginStreak || 0}</span>
        </div>
      </div>
    </Card>
  )
}

// 🧭 Composant Navigation Rapide
const QuickActionsWidget = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🧭 Navigation Rapide
      </h3>
      
      <div className="space-y-3">
        {/* Gérer les tâches */}
        <Link to={ROUTES.TASKS}>
          <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-medium text-gray-900">Mes Tâches</div>
                <div className="text-sm text-gray-600">Gérer et créer mes tâches</div>
              </div>
            </div>
          </button>
        </Link>

        {/* Organiser les projets */}
        <Link to="/projects">
          <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-medium text-gray-900">Mes Projets</div>
                <div className="text-sm text-gray-600">Organiser et suivre mes projets</div>
              </div>
            </div>
          </button>
        </Link>

        {/* Voir le classement */}
        <Link to={ROUTES.LEADERBOARD}>
          <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-medium text-gray-900">Classement</div>
                <div className="text-sm text-gray-600">Voir ma position et mes badges</div>
              </div>
            </div>
          </button>
        </Link>
      </div>
    </Card>
  )
}

// 👋 Header de bienvenue avec données utilisateur
const WelcomeHeader = () => {
  const { user } = useAuthStore()
  const { gameData } = useGameService()

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Bonjour {displayName} 👋
          </h2>
          <p className="text-blue-100">
            Prêt à atteindre vos objectifs aujourd'hui ?
          </p>
          {gameData?.level && (
            <p className="text-blue-100 text-sm mt-1">
              Niveau {gameData.level} • {gameData.totalXp} XP
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Niveau</div>
          <div className="text-3xl font-bold">{gameData?.level || 1}</div>
        </div>
      </div>
      
      {gameData && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-blue-100 mb-2">
            <span>Progression globale</span>
            <span>{gameData.totalXp || 0} XP</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${gameData.level ? Math.min(((gameData.totalXp || 0) / (gameData.level * 100)) * 100, 100) : 0}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </Card>
  )
}

// 🏠 Composant Dashboard principal
const Dashboard = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier l'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">Authentification requise</h2>
          <p className="text-gray-600 mb-4">
            Vous devez être connecté pour accéder au dashboard.
          </p>
          <Link to="/login">
            <Button className="w-full">Se connecter</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenue */}
        <div className="mb-8">
          <WelcomeHeader />
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Colonne gauche - Gamification */}
          <div className="lg:col-span-1">
            <GamificationWidget />
          </div>

          {/* Colonne centre - Statistiques */}
          <div className="lg:col-span-1 space-y-6">
            <TaskStatsWidget />
            <PerformanceWidget />
          </div>

          {/* Colonne droite - Navigation */}
          <div className="lg:col-span-1">
            <QuickActionsWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
