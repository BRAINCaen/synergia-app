// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard COMPLET avec gamification corrigée
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

// 🎮 Composant Gamification Widget avec données réelles - CORRIGÉ
const GamificationWidget = () => {
  const { gameData, isLoading, addXP, quickActions, calculations, isConnected } = useGameService()

  // 🔧 CORRECTION: Vérifications debug
  console.log('🎮 GamificationWidget render:', {
    isConnected,
    isLoading,
    gameData: gameData ? {
      level: gameData.level,
      xp: gameData.xp,
      totalXp: gameData.totalXp,
      badges: gameData.badges?.length
    } : null
  });

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
        <p className="text-purple-100 text-sm mt-2">Chargement de votre progression...</p>
      </Card>
    )
  }

  // 🔧 CORRECTION: Utiliser totalXp de manière cohérente
  const progress = calculations.getProgressToNextLevel() * 100
  const xpNeeded = calculations.getXPNeededForNextLevel()
  const currentLevel = gameData.level || 1
  const totalXP = gameData.totalXp || gameData.xp || 0
  const badgeCount = gameData.badges?.length || 0

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white" data-testid="gamification-widget">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">🎮 Niveau {currentLevel}</h3>
          <p className="text-purple-100">{totalXP} XP Total</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{badgeCount}</div>
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
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log('🌅 Click daily login');
            quickActions.dailyLogin();
          }}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          +10 XP Login
        </button>
        <button
          onClick={() => {
            console.log('✅ Click task completed');
            quickActions.taskCompleted();
          }}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          +25 XP Tâche
        </button>
      </div>

      {/* 🔧 DEBUG: Affichage des données actuelles */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 p-2 bg-black/20 rounded text-xs">
          <div>Level: {currentLevel}</div>
          <div>XP: {gameData.xp}</div>
          <div>Total XP: {totalXP}</div>
          <div>Progress: {progress.toFixed(1)}%</div>
          <div>XP Needed: {xpNeeded}</div>
        </div>
      )}
    </Card>
  )
}

// 🏠 Composant Header de bienvenue - CORRIGÉ
const WelcomeHeader = () => {
  const { user } = useAuthStore()
  const { gameData } = useGameService()
  
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
  
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Bonjour {displayName} 👋
          </h2>
          <p className="text-blue-100">
            Prêt à atteindre vos objectifs aujourd'hui ?
          </p>
          {gameData?.level && (
            <p className="text-blue-100 text-sm mt-1">
              Niveau {gameData.level} • {gameData.totalXp || gameData.xp || 0} XP
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

// 🚀 Composant Actions Rapides - VERSION SIMPLIFIÉE (Navigation uniquement)
const QuickActionsWidget = () => {
  const { user } = useAuthStore()

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🧭 Navigation Rapide</h3>
      
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

        {/* Gérer les projets */}
        <Link to={ROUTES.PROJECTS}>
          <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-medium text-gray-900">Mes Projets</div>
                <div className="text-sm text-gray-600">Organiser et suivre mes projets</div>
              </div>
            </div>
          </button>
        </Link>

        {/* Voir le leaderboard */}
        <Link to={ROUTES.LEADERBOARD}>
          <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
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

// 📊 Composant Statistiques Tâches avec données réelles
const TaskStatsWidget = () => {
  const { tasks, stats, loading } = useTaskService()
  
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Statistiques</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Mes Statistiques</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Tâches totales</span>
          <span className="font-medium">{stats.total || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tâches complétées</span>
          <span className="font-medium text-green-600">{stats.completed || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">En cours</span>
          <span className="font-medium text-blue-600">{stats.inProgress || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Taux de réussite</span>
          <span className="font-medium">{stats.completionRate || 0}%</span>
        </div>
      </div>
      
      {stats.total > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Progression globale</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </Card>
  )
}

// 🎯 Composant Stats Performance avec tâches XP
const PerformanceWidget = () => {
  const { tasks } = useTaskService()
  const { gameData } = useGameService()

  // Calculer les stats de la semaine
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  
  const thisWeekTasks = tasks.filter(task => {
    if (!task.completedAt) return false
    const completedDate = new Date(task.completedAt)
    return completedDate >= weekStart
  })

  const todayTasks = tasks.filter(task => {
    if (!task.completedAt) return false
    const completedDate = new Date(task.completedAt)
    const today = new Date()
    return completedDate.toDateString() === today.toDateString()
  })

  const todayXP = todayTasks.reduce((total, task) => total + (task.xpReward || 0), 0)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📈 Performance</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Tâches cette semaine</span>
          <span className="font-medium">{thisWeekTasks.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">XP gagnés aujourd'hui</span>
          <span className="font-medium text-purple-600">{todayXP}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Streak de connexion</span>
          <span className="font-medium">{gameData?.loginStreak || 0}</span>
        </div>
      </div>
    </Card>
  )
}

// 📱 Composant principal Dashboard
export default function Dashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connexion requise
            </h2>
            <p className="text-gray-600 mb-6">
              Veuillez vous connecter pour accéder au dashboard
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Se connecter
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenue */}
        <WelcomeHeader />

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gamification Widget */}
            <GamificationWidget />
            
            {/* Actions rapides */}
            <QuickActionsWidget />
          </div>

          {/* Colonne de droite */}
          <div className="space-y-6">
            {/* Stats des tâches */}
            <TaskStatsWidget />
            
            {/* Stats XP temps réel */}
            <PerformanceWidget />
          </div>
        </div>

        {/* Message de récupération */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
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
