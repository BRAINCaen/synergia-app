// Dashboard principal Synergia - SANS imports Firebase problématiques
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameService } from '../shared/hooks/useGameService'

const Dashboard = () => {
  const { 
    gameData, 
    isLoading, 
    error, 
    isConnected,
    calculations,
    quickActions,
    dailyLogin 
  } = useGameService('demo-user')

  // Connexion quotidienne automatique
  useEffect(() => {
    if (gameData && isConnected && dailyLogin) {
      dailyLogin()
    }
  }, [gameData, isConnected, dailyLogin])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = calculations.getStats()
  const levelProgress = calculations.getLevelProgress()
  const unlockedBadges = calculations.getUnlockedBadges()

  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue dans Synergia ! 🚀
            </h1>
            <p className="text-blue-100">
              Votre plateforme collaborative avec gamification
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Niveau {stats.level}</div>
            <div className="text-blue-200">{stats.totalXP} XP</div>
          </div>
        </div>
        
        {/* Barre de progression niveau */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-blue-200 mb-1">
            <span>Progression vers niveau {stats.level + 1}</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Statut de connexion */}
      {!isConnected && (
        <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-orange-400 font-semibold">Mode Développement</h3>
              <p className="text-orange-300 text-sm">
                Application en cours de restauration - Données simulées
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tâches Complétées</p>
              <p className="text-2xl font-bold text-white">{stats.tasksCompleted}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Projets Terminés</p>
              <p className="text-2xl font-bold text-white">{stats.projectsCompleted}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Badges Débloqués</p>
              <p className="text-2xl font-bold text-white">{stats.badgesCount}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Série Actuelle</p>
              <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Navigation rapide */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎯 Actions Rapides</h3>
          <div className="space-y-3">
            <Link 
              to="/tasks"
              className="block bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>📝 Gérer les Tâches</span>
                <span>→</span>
              </div>
            </Link>
            
            <Link 
              to="/projects"
              className="block bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>📋 Voir les Projets</span>
                <span>→</span>
              </div>
            </Link>
            
            <Link 
              to="/gamification"
              className="block bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>🎮 Gamification</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Badges récents */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🏅 Badges Débloqués</h3>
          {unlockedBadges.length > 0 ? (
            <div className="space-y-2">
              {unlockedBadges.slice(0, 3).map((badge, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-white font-medium">{badge.name}</p>
                    <p className="text-gray-400 text-sm">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">🎖️</div>
              <p>Complétez des tâches pour débloquer vos premiers badges !</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions de test */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">🔧 Système de Gamification</h3>
        <p className="text-gray-400 mb-4">Testez le système XP avec ces actions simulées :</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={quickActions.completeEasyTask}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg text-sm transition-colors"
          >
            ✅ Tâche Facile<br/>
            <span className="text-xs">+20 XP</span>
          </button>
          
          <button
            onClick={quickActions.completeNormalTask}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-sm transition-colors"
          >
            📝 Tâche Normale<br/>
            <span className="text-xs">+40 XP</span>
          </button>
          
          <button
            onClick={quickActions.completeHardTask}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg text-sm transition-colors"
          >
            💪 Tâche Difficile<br/>
            <span className="text-xs">+60 XP</span>
          </button>
          
          <button
            onClick={quickActions.simulateLevelUp}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg text-sm transition-colors"
          >
            🌟 Simuler Level Up<br/>
            <span className="text-xs">+Multiple XP</span>
          </button>
        </div>
      </div>

      {/* Message de restauration */}
      <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <h3 className="text-green-400 font-semibold">Application en cours de restauration</h3>
            <p className="text-green-300 text-sm">
              Votre Synergia est de retour ! Authentification Google restaurée, système de gamification opérationnel.
            </p>
          </div>
        </div>
      </div>

      {/* Erreur si présente */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold">Erreur</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
