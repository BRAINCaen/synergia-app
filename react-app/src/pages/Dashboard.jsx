// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard COMPLET avec tous les modules intégrés
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

// 🎮 Composant Gamification Widget avec données réelles
const GamificationWidget = () => {
  const { gameData, isLoading, addXP, quickActions, calculations, isConnected } = useGameService()

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
    <Card className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
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
        <div className="w-full bg-purple-400 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => quickActions.dailyLogin()}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          +10 XP Login
        </button>
        <button
          onClick={() => quickActions.taskCompleted()}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          +25 XP Tâche
        </button>
      </div>
    </Card>
  )
}

// 📊 Composant Statistiques Tâches avec données réelles
const TaskStatsWidget = () => {
  const { stats, isLoading, isConnected } = useTaskService()

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Mes Tâches</h3>
        <p className="text-gray-500">Connectez-vous pour voir vos statistiques</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Mes Tâches</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Terminées</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">En cours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">En retard</div>
        </div>
      </div>
      
      {stats.completionRate > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Taux de completion</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </Card>
  )
}

// 📁 Composant Projets Widget avec données réelles
const ProjectsWidget = () => {
  const { projects, isLoading, isConnected } = useProjectService()

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📁 Mes Projets</h3>
        <p className="text-gray-500">Connectez-vous pour voir vos projets</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">📁 Mes Projets</h3>
        <Link 
          to="/projects" 
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Voir tous →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{activeProjects.length}</div>
          <div className="text-sm text-gray-600">Actifs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedProjects.length}</div>
          <div className="text-sm text-gray-600">Terminés</div>
        </div>
      </div>

      {activeProjects.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Projets actifs:</div>
          {activeProjects.slice(0, 3).map(project => (
            <div key={project.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <span className="text-lg">{project.icon || '📁'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {project.name}
                </div>
                <div className="text-xs text-gray-500">
                  {project.progress?.percentage || 0}% complété
                </div>
              </div>
            </div>
          ))}
          {activeProjects.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{activeProjects.length - 3} autres projets
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Aucun projet actif</p>
          <Link 
            to="/projects" 
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Créer un projet
          </Link>
        </div>
      )}
    </Card>
  )
}

// 🎯 Composant WelcomeWidget avec données réelles
const WelcomeWidget = () => {
  const { user } = useAuthStore()
  const { gameData } = useGameService()

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
            <span>Progression</span>
            <span>{gameData.xp || 0} / {Math.pow(gameData.level, 2) * 100} XP</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${gameData.level ? ((gameData.xp || 0) / (Math.pow(gameData.level, 2) * 100)) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </Card>
  )
}

// 🚀 Composant Actions Rapides
const QuickActionsWidget = () => {
  const { user } = useAuthStore()
  const { createTask } = useTaskService()
  const { createProject } = useProjectService()
  const [isCreating, setIsCreating] = useState(false)

  const handleQuickTask = async () => {
    if (!user?.uid) return
    
    setIsCreating(true)
    try {
      await createTask({
        title: 'Nouvelle tâche rapide',
        description: 'Tâche créée depuis le dashboard',
        priority: 'medium',
        status: 'todo'
      })
      console.log('✅ Tâche rapide créée')
    } catch (error) {
      console.error('❌ Erreur création tâche rapide:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🚀 Actions Rapides</h3>
      <div className="space-y-3">
        <Link to={ROUTES.TASKS}>
          <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-medium text-gray-900">Gérer les tâches</div>
                <div className="text-sm text-gray-600">Voir toutes mes tâches</div>
              </div>
            </div>
          </button>
        </Link>

        <button
          onClick={handleQuickTask}
          disabled={isCreating}
          className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">➕</span>
            <div>
              <div className="font-medium text-gray-900">
                {isCreating ? 'Création...' : 'Nouvelle tâche'}
              </div>
              <div className="text-sm text-gray-600">Créer une tâche rapide</div>
            </div>
          </div>
        </button>

        <Link to="/projects">
          <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-medium text-gray-900">Mes projets</div>
                <div className="text-sm text-gray-600">Gérer mes projets</div>
              </div>
            </div>
          </button>
        </Link>

        <Link to={ROUTES.LEADERBOARD}>
          <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-medium text-gray-900">Classement</div>
                <div className="text-sm text-gray-600">Voir le leaderboard</div>
              </div>
            </div>
          </button>
        </Link>
      </div>
    </Card>
  )
}

// 📊 Composant principal Dashboard
export default function Dashboard() {
  const { user } = useAuthStore()
  const [debugInfo, setDebugInfo] = useState(false)

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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">⚡ Synergia</h1>
              <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-full font-medium">
                v3.0 • Récupéré
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={() => setDebugInfo(!debugInfo)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Debug
              </button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2">
          <div className="max-w-7xl mx-auto text-xs text-yellow-800">
            <strong>🔧 Debug:</strong> User: {user?.uid ? '✅' : '❌'} | 
            Stores: TaskStore, ProjectStore, GameStore avec persistance | 
            Services: Firebase intégrés
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Widget */}
        <div className="mb-8">
          <WelcomeWidget />
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Colonne gauche - Stats */}
          <div className="space-y-6">
            <TaskStatsWidget />
            <ProjectsWidget />
          </div>

          {/* Colonne centre - Gamification */}
          <div className="space-y-6">
            <GamificationWidget />
            <QuickActionsWidget />
          </div>

          {/* Colonne droite - Navigation rapide */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">🧭 Navigation</h3>
              <div className="grid grid-cols-1 gap-3">
                <Link 
                  to={ROUTES.TASKS}
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-medium">Mes Tâches</div>
                    <div className="text-sm text-gray-600">Gestion complète</div>
                  </div>
                </Link>

                <Link 
                  to="/projects"
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">📁</span>
                  <div>
                    <div className="font-medium">Projets</div>
                    <div className="text-sm text-gray-600">Organisation</div>
                  </div>
                </Link>

                <Link 
                  to={ROUTES.LEADERBOARD}
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-medium">Classement</div>
                    <div className="text-sm text-gray-600">Leaderboard XP</div>
                  </div>
                </Link>

                <Link 
                  to={ROUTES.PROFILE}
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="font-medium">Mon Profil</div>
                    <div className="text-sm text-gray-600">Paramètres</div>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Stats XP temps réel */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tâches cette semaine</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP gagnés aujourd'hui</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streak de connexion</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Message de récupération */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-2xl mr-3">✅</span>
            <div>
              <h4 className="text-green-800 font-semibold">Application Récupérée !</h4>
              <p className="text-green-700 text-sm">
                Tous vos modules (Tâches, Projets, Gamification) sont maintenant opérationnels avec persistance des données.
                Vos données sont automatiquement sauvegardées et synchronisées avec Firebase.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
