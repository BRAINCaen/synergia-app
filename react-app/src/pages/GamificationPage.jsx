// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// Page de gamification mise à jour avec le système de badges avancé - IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';
import { useBadges } from '../shared/hooks/useBadges.js'; // ✅ Import corrigé
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
              <h3 className="text-lg font-semibold text-gray-900">Série</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {streak || 0}
            </div>
            <div className="text-sm text-gray-600">
              Jours consécutifs actif
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Badges</h3>
              <span className="text-2xl">🏅</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {userBadges?.length || 0}
            </div>
            <div className="text-sm text-gray-600">
              {badges?.length ? `/ ${badges.length} disponibles` : 'Badges débloqués'}
            </div>
          </div>
        </div>

        {/* 📑 Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
                { id: 'badges', label: '🏆 Badges', icon: '🏆' },
                { id: 'stats', label: '📈 Statistiques', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-2 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 📊 Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      🔍 Vérifier nouveaux badges
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Analysez votre activité récente pour débloquer de nouveaux badges.
                    </p>
                    <button
                      onClick={checkBadges}
                      disabled={checking}
                      className={`
                        w-full py-2 px-4 rounded-lg font-medium transition-colors
                        ${checking
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                    >
                      {checking ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Vérification...
                        </span>
                      ) : (
                        'Vérifier maintenant'
                      )}
                    </button>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">
                      🎯 Progression générale
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Badges débloqués</span>
                        <span className="font-medium">{((userBadges?.length || 0) / (badges?.length || 1) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(userBadges?.length || 0) / (badges?.length || 1) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges récents */}
                {formattedRecentBadges.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🏆 Badges récents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formattedRecentBadges.map((badge, index) => (
                        <div key={badge.id || index} className="bg-white rounded-lg p-4 text-center">
                          <div className="text-3xl mb-2">{badge.icon}</div>
                          <div className="font-medium text-gray-900 text-sm">{badge.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{badge.timeAgo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🏆 Onglet Badges */}
            {activeTab === 'badges' && (
              <div>
                <BadgeGallery />
              </div>
            )}

            {/* 📈 Onglet Statistiques */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Badges par rareté</h4>
                    {stats?.byRarity ? (
                      <div className="space-y-2">
                        {Object.entries(stats.byRarity).map(([rarity, count]) => (
                          <div key={rarity} className="flex justify-between text-sm">
                            <span className="capitalize text-blue-700">{rarity}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-600 text-sm">Aucune donnée disponible</p>
                    )}
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-2">Badges par catégorie</h4>
                    {stats?.byCategory ? (
                      <div className="space-y-2">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="capitalize text-green-700">{category}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-600 text-sm">Aucune donnée disponible</p>
                    )}
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-900 mb-2">Récompenses totales</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-700">XP des badges</span>
                        <span className="font-medium">{stats?.totalXpFromBadges || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-700">Badges uniques</span>
                        <span className="font-medium">{userBadges?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-700">Progression</span>
                        <span className="font-medium">{stats?.percentage || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outils de debug en développement */}
                {showDebugTools && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-semibold text-yellow-900 mb-4">🔧 Outils de Debug</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => BadgeIntegrationService.syncWithGamification(user?.uid)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Sync gamification
                      </button>
                      <button
                        onClick={() => console.log('Badge Data:', { badges, userBadges, stats })}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Log données
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
