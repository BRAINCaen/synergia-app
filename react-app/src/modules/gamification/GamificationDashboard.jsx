// src/modules/gamification/GamificationDashboard.jsx
import React from 'react';
import { useGameService } from '../../shared/hooks/useGameService';
import { useGameGetters, useLevelUpModal, useBadgeModal, useXPAnimation } from '../../shared/stores/gameStore';

const GamificationDashboard = () => {
  const { 
    gameData, 
    isLoading, 
    error, 
    addXP, 
    unlockBadge, 
    quickActions, 
    calculations,
    isConnected 
  } = useGameService();
  
  const getters = useGameGetters();
  const levelUpModal = useLevelUpModal();
  const badgeModal = useBadgeModal();
  const xpAnimation = useXPAnimation();

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Connectez-vous pour voir votre progression</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <p className="text-red-400">Erreur: {error}</p>
      </div>
    );
  }

  const progressPercentage = calculations.getProgressToNextLevel() * 100;
  const xpNeeded = calculations.getXPNeededForNextLevel();

  return (
    <div className="space-y-6">
      {/* Header avec stats principales */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🎮 Progression
              {xpAnimation.show && (
                <span className="text-green-400 animate-bounce">
                  +{xpAnimation.amount} XP
                </span>
              )}
            </h2>
            <p className="text-purple-300">Niveau {gameData?.level || 1}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{gameData?.totalXp || 0}</p>
            <p className="text-purple-300">XP Total</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-300">Progression vers niveau {(gameData?.level || 1) + 1}</span>
            <span className="text-purple-300">{xpNeeded} XP restants</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats d'activité */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            📊 Statistiques
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Streak de connexion</span>
              <span className="text-white font-medium">{gameData?.loginStreak || 0} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tâches complétées</span>
              <span className="text-white font-medium">{gameData?.tasksCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Badges obtenus</span>
              <span className="text-white font-medium">{gameData?.badges?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Badges récents */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🏅 Badges Récents
          </h3>
          <div className="space-y-2">
            {getters.getRecentBadges(3).map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{badge.name}</p>
                  <p className="text-gray-400 text-xs">{badge.category}</p>
                </div>
              </div>
            ))}
            {(!gameData?.badges || gameData.badges.length === 0) && (
              <p className="text-gray-500 text-sm italic">Aucun badge encore</p>
            )}
          </div>
        </div>

        {/* Actions rapides pour tester */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            ⚡ Actions de Test
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => quickActions.dailyLogin()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              +10 XP (Login quotidien)
            </button>
            <button
              onClick={() => quickActions.taskCompleted()}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              +25 XP (Tâche terminée)
            </button>
            <button
              onClick={() => quickActions.longSession()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              +15 XP (Session longue)
            </button>
            <button
              onClick={() => unlockBadge({
                id: `test_${Date.now()}`,
                name: 'Badge de Test',
                description: 'Badge obtenu pour tester le système',
                icon: '🧪',
                category: 'test',
                rarity: 'common'
              })}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              🏅 Débloquer Badge Test
            </button>
          </div>
        </div>
      </div>

      {/* Historique XP récent */}
      {gameData?.xpHistory && gameData.xpHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            📈 Historique XP Récent
          </h3>
          <div className="space-y-2">
            {gameData.xpHistory.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <span className="text-green-400 font-medium">+{entry.amount} XP</span>
                  <span className="text-gray-400 ml-2">({entry.source})</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Level Up */}
      {levelUpModal.show && levelUpModal.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 rounded-lg p-8 max-w-md mx-4 text-center border border-yellow-500/30">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">LEVEL UP!</h2>
            <p className="text-yellow-300 mb-4">
              Niveau {levelUpModal.data.previousLevel} → {levelUpModal.data.newLevel}
            </p>
            {levelUpModal.data.badgeUnlocked && (
              <div className="mb-4 p-3 bg-yellow-900/30 rounded border border-yellow-500/30">
                <p className="text-yellow-200">🏆 Nouveau badge débloqué!</p>
                <p className="text-white font-medium">{levelUpModal.data.badgeUnlocked.name}</p>
              </div>
            )}
            <button
              onClick={levelUpModal.hide}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Modal Nouveau Badge */}
      {badgeModal.show && badgeModal.badge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-lg p-8 max-w-md mx-4 text-center border border-purple-500/30">
            <div className="text-6xl mb-4">{badgeModal.badge.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2">Nouveau Badge!</h2>
            <p className="text-purple-300 font-medium mb-2">{badgeModal.badge.name}</p>
            <p className="text-purple-200 text-sm mb-4">{badgeModal.badge.description}</p>
            <div className="inline-block px-3 py-1 bg-purple-900/50 rounded text-purple-300 text-sm mb-4">
              {badgeModal.badge.category}
            </div>
            <br />
            <button
              onClick={badgeModal.hide}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              Super!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
