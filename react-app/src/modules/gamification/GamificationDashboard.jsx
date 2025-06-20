// src/modules/gamification/GamificationDashboard.jsx - Version debug
import React, { useState } from 'react';

const GamificationDashboard = () => {
  // État local pour simulation sans Firebase
  const [gameData, setGameData] = useState({
    level: 1,
    xp: 0,
    totalXp: 0,
    badges: [],
    loginStreak: 0,
    tasksCompleted: 0,
    xpHistory: []
  });

  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState(null);

  // Fonction pour calculer le niveau basé sur l'XP
  const calculateLevel = (totalXP) => {
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  };

  // Fonction pour ajouter de l'XP
  const addXP = (amount, source) => {
    const newTotalXP = gameData.totalXp + amount;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > gameData.level;

    setGameData(prev => ({
      ...prev,
      xp: prev.xp + amount,
      totalXp: newTotalXP,
      level: newLevel,
      xpHistory: [
        ...prev.xpHistory.slice(-9),
        {
          amount,
          source,
          timestamp: new Date().toISOString(),
          totalAfter: newTotalXP
        }
      ]
    }));

    if (leveledUp) {
      setShowLevelUpModal(true);
      setTimeout(() => setShowLevelUpModal(false), 3000);
    }

    console.log(`🎮 +${amount} XP ajouté (${source}). Total: ${newTotalXP} XP, Niveau: ${newLevel}`);
  };

  // Fonction pour débloquer un badge
  const unlockBadge = (badge) => {
    const newBadgeWithTimestamp = {
      ...badge,
      unlockedAt: new Date().toISOString()
    };

    setGameData(prev => ({
      ...prev,
      badges: [...prev.badges, newBadgeWithTimestamp]
    }));

    setNewBadge(newBadgeWithTimestamp);
    setShowBadgeModal(true);
    setTimeout(() => setShowBadgeModal(false), 3000);

    console.log('🏅 Nouveau badge débloqué:', badge.name);
  };

  // Calculs de progression
  const getProgressToNextLevel = () => {
    const currentLevelXP = Math.pow(gameData.level - 1, 2) * 100;
    const nextLevelXP = Math.pow(gameData.level, 2) * 100;
    const progress = gameData.totalXp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    return Math.min(progress / needed, 1);
  };

  const getXPNeededForNextLevel = () => {
    const nextLevelXP = Math.pow(gameData.level, 2) * 100;
    return Math.max(nextLevelXP - gameData.totalXp, 0);
  };

  const progressPercentage = getProgressToNextLevel() * 100;
  const xpNeeded = getXPNeededForNextLevel();

  return (
    <div className="space-y-6">
      {/* Header debug */}
      <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
        <p className="text-yellow-400 font-medium">
          🔧 MODE DEBUG - Gamification sans Firebase
        </p>
      </div>

      {/* Header avec stats principales */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🎮 Progression Debug
            </h2>
            <p className="text-purple-300">Niveau {gameData.level}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{gameData.totalXp}</p>
            <p className="text-purple-300">XP Total</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-300">Progression vers niveau {gameData.level + 1}</span>
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
              <span className="text-white font-medium">{gameData.loginStreak} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tâches complétées</span>
              <span className="text-white font-medium">{gameData.tasksCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Badges obtenus</span>
              <span className="text-white font-medium">{gameData.badges.length}</span>
            </div>
          </div>
        </div>

        {/* Badges récents */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🏅 Badges Récents
          </h3>
          <div className="space-y-2">
            {gameData.badges.slice(-3).map((badge, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{badge.name}</p>
                  <p className="text-gray-400 text-xs">{badge.category}</p>
                </div>
              </div>
            ))}
            {gameData.badges.length === 0 && (
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
              onClick={() => addXP(10, 'daily_login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              +10 XP (Login quotidien)
            </button>
            <button
              onClick={() => addXP(25, 'task_completed')}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              +25 XP (Tâche terminée)
            </button>
            <button
              onClick={() => addXP(15, 'long_session')}
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
      {gameData.xpHistory.length > 0 && (
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
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 rounded-lg p-8 max-w-md mx-4 text-center border border-yellow-500/30">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">LEVEL UP!</h2>
            <p className="text-yellow-300 mb-4">
              Nouveau niveau {gameData.level} atteint !
            </p>
            <button
              onClick={() => setShowLevelUpModal(false)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-medium transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Modal Nouveau Badge */}
      {showBadgeModal && newBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-lg p-8 max-w-md mx-4 text-center border border-purple-500/30">
            <div className="text-6xl mb-4">{newBadge.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2">Nouveau Badge!</h2>
            <p className="text-purple-300 font-medium mb-2">{newBadge.name}</p>
            <p className="text-purple-200 text-sm mb-4">{newBadge.description}</p>
            <div className="inline-block px-3 py-1 bg-purple-900/50 rounded text-purple-300 text-sm mb-4">
              {newBadge.category}
            </div>
            <br />
            <button
              onClick={() => setShowBadgeModal(false)}
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
