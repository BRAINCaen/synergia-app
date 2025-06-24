// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// Page de gamification mise à jour avec le système de badges avancé
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';
import useBadges from '../hooks/useBadges.js';
import BadgeGallery from '../components/gamification/BadgeGallery.jsx';
import BadgeNotification from '../components/gamification/BadgeNotification.jsx';
import BadgeIntegrationService from '../core/services/badgeIntegrationService.js';

/**
 * 🎮 PAGE DE GAMIFICATION COMPLÈTE
 * 
 * Interface principale pour la gamification avec:
 * - Vue d'ensemble des niveaux et XP
 * - Système de badges intelligent
 * - Leaderboard intégré
 * - Outils de gestion et debug
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  const { level, xp, streak, badges: storeBadges } = useGameStore();
  const {
    badges,
    userBadges,
    stats,
    loading,
    checking,
    checkBadges,
    completionPercentage,
    nextBadge,
    recentBadges
  } = useBadges();

  const [activeTab, setActiveTab] = useState('overview');
  const [showDebugTools, setShowDebugTools] = useState(process.env.NODE_ENV === 'development');

  /**
   * 🎯 CALCULER LE NIVEAU SUIVANT
   */
  const getNextLevelInfo = () => {
    const currentLevel = level || 1;
    const nextLevel = currentLevel + 1;
    const xpForNextLevel = nextLevel * 100; // Formule simple pour l'exemple
    const xpNeeded = xpForNextLevel - (xp || 0);
    const progressToNext = Math.min(100, ((xp || 0) % 100));

    return {
      nextLevel,
      xpNeeded: Math.max(0, xpNeeded),
      progressToNext
    };
  };

  /**
   * 🏆 OBTENIR LES BADGES RÉCENTS AVEC FORMATAGE
   */
  const getFormattedRecentBadges = () => {
    return recentBadges.slice(0, 3).map(badge => ({
      ...badge,
      timeAgo: 'Récent' // Simplified for now
    }));
  };

  const nextLevelInfo = getNextLevelInfo();
  const formattedRecentBadges = getFormattedRecentBadges();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg text-gray-600">Chargement de la gamification...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔔 Composant de notifications de badges */}
      <BadgeNotification />

      <div className="max-w-7xl mx-auto p-6">
        {/* 🎯 En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎮 Gamification
          </h1>
          <p className="text-gray-600">
            Suivez votre progression, débloquez des badges et montez de niveau !
          </p>
        </div>

        {/* 📊 Vue d'ensemble rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Niveau actuel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Niveau</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {level || 1}
            </div>
            <div className="text-sm text-gray-600">
              {nextLevelInfo.xpNeeded > 0 
                ? `${nextLevelInfo.xpNeeded} XP pour niveau ${nextLevelInfo.nextLevel}`
                : 'Niveau maximum atteint!'
              }
            </div>
            {/* Barre de progression vers niveau suivant */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${nextLevelInfo.progressToNext}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* XP total */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Expérience</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {xp || 0}
            </div>
            <div className="text-sm text-gray-600">
              Points d'expérience totaux
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Streak</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {streak || 0}
            </div>
            <div className="text-sm text-gray-600">
              Jours consécutifs
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Badges</h3>
              <span className="text-2xl">🏅</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {userBadges.length}/{badges.length}
            </div>
            <div className="text-sm text-gray-600">
              {completionPercentage}% débloqués
            </div>
            {/* Barre de progression badges */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
                { id: 'badges', name: 'Badges', icon: '🏆' },
                { id: 'progress', name: 'Progression', icon: '📈' },
                { id: 'leaderboard', name: 'Classement', icon: '🥇' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 📊 Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={checkBadges}
                    disabled={checking}
                    className={`
                      p-6 rounded-xl border-2 border-dashed transition-all duration-200
                      ${checking 
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {checking ? '⏳' : '🔍'}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {checking ? 'Vérification...' : 'Vérifier les badges'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Analyser votre activité pour de nouveaux badges
                      </p>
                    </div>
                  </button>

                  {/* Prochain badge à débloquer */}
                  {nextBadge && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                      <div className="text-center">
                        <div className="text-3xl mb-2">{nextBadge.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Prochain Badge
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {nextBadge.name}
                        </p>
                        {nextBadge.progress && (
                          <div className="space-y-1">
                            <div className="w-full bg-white rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${nextBadge.progress.percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {nextBadge.progress.current}/{nextBadge.progress.target} ({nextBadge.progress.percentage}%)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Statistiques rapides */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📈</div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Performances
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Niveau: {level || 1}</p>
                        <p>XP: {xp || 0}</p>
                        <p>Badges: {userBadges.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges récents */}
                {formattedRecentBadges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🏆 Badges récents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formattedRecentBadges.map((badge, index) => (
                        <div key={`${badge.id}-${index}`} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{badge.icon}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                              <p className="text-sm text-gray-600">{badge.timeAgo}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🏆 Onglet Badges */}
            {activeTab === 'badges' && (
              <BadgeGallery />
            )}

            {/* 📈 Onglet Progression */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🚧</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Graphiques de progression
                  </h3>
                  <p className="text-gray-600">
                    Cette section sera développée dans la prochaine version
                  </p>
                </div>
              </div>
            )}

            {/* 🥇 Onglet Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏗️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Classement global
                  </h3>
                  <p className="text-gray-600">
                    Le leaderboard est disponible sur la page dédiée
                  </p>
                  <button
                    onClick={() => window.location.href = '/leaderboard'}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Voir le classement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🛠️ Outils de debug (développement uniquement) */}
        {showDebugTools && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              🛠️ Outils de développement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => BadgeIntegrationService.triggerTestEvents(user?.uid)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Déclencher événements test
              </button>
              <button
                onClick={() => console.log('Debug Info:', BadgeIntegrationService.getDebugInfo(user?.uid))}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Log debug info
              </button>
              <button
                onClick={() => BadgeIntegrationService.cleanupCache()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Nettoyer cache
              </button>
              <button
                onClick={() => setShowDebugTools(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Masquer outils
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationPage;
