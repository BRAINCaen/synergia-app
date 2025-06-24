// GamificationDashboard.jsx - Version simplifiée sans dépendances gameStore
import React from 'react'
import { useGameService } from '../../shared/hooks/useGameService'

const GamificationDashboard = () => {
  const { 
    gameData, 
    isLoading, 
    error, 
    isConnected,
    calculations,
    quickActions
  } = useGameService('demo-user')

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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🎮 Système de Gamification
            </h1>
            <p className="text-purple-100">
              Votre progression et récompenses
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">Niveau {stats.level}</div>
            <div className="text-purple-200">{stats.totalXP} XP Total</div>
          </div>
        </div>
        
        {/* Barre de progression niveau */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-purple-200 mb-1">
            <span>Progression vers niveau {stats.level + 1}</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <div className="w-full bg-purple-800 rounded-full h-3">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
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
                Données simulées - Firebase non configuré
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-white mb-1">XP Total</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.totalXP}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="text-lg font-semibold text-white mb-1">Niveau Actuel</h3>
          <p className="text-3xl font-bold text-yellow-400">{stats.level}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold text-white mb-1">Badges</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.badgesCount}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <div className="text-4xl mb-3">🔥</div>
          <h3 className="text-lg font-semibold text-white mb-1">Série Active</h3>
          <p className="text-3xl font-bold text-red-400">{stats.currentStreak}</p>
        </div>
      </div>

      {/* Badges débloqués */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          🏅 Badges Débloqués
        </h3>
        
        {unlockedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges.map((badge, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="text-white font-medium mb-1">{badge.name}</h4>
                <p className="text-gray-400 text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎖️</div>
            <h4 className="text-white font-medium mb-2">Aucun badge pour le moment</h4>
            <p className="text-gray-400">Complétez des tâches pour débloquer vos premiers badges !</p>
          </div>
        )}
      </div>
      
      {/* Actions de test */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">🔧 Actions de Test</h3>
        <p className="text-gray-400 text-sm mb-4">
          Testez le système de gamification avec ces actions simulées
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={quickActions.completeEasyTask}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-medium">Tâche Facile</div>
            <div className="text-xs text-green-200">+20 XP</div>
          </button>
          
          <button 
            onClick={quickActions.completeNormalTask}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="text-sm font-medium">Tâche Normale</div>
            <div className="text-xs text-blue-200">+40 XP</div>
          </button>
          
          <button 
            onClick={quickActions.completeHardTask}
            className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-1">💪</div>
            <div className="text-sm font-medium">Tâche Difficile</div>
            <div className="text-xs text-orange-200">+60 XP</div>
          </button>
          
          <button 
            onClick={quickActions.simulateLevelUp}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-1">🌟</div>
            <div className="text-sm font-medium">Level Up!</div>
            <div className="text-xs text-purple-200">+Multiple XP</div>
          </button>
        </div>
      </div>

      {/* Progression détaillée */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">📊 Progression Détaillée</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Statistiques</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tâches complétées :</span>
                <span className="text-white">{stats.tasksCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Projets terminés :</span>
                <span className="text-white">{stats.projectsCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Série actuelle :</span>
                <span className="text-white">{stats.currentStreak} jours</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Prochains Objectifs</h4>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                • Atteindre le niveau {stats.level + 1}
              </div>
              <div className="text-sm text-gray-400">
                • Débloquer de nouveaux badges
              </div>
              <div className="text-sm text-gray-400">
                • Maintenir votre série quotidienne
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Erreur si présente */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold">Erreur Gamification</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default GamificationDashboard
