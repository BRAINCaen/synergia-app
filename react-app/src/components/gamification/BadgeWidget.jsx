// ==========================================
// 📁 react-app/src/components/gamification/BadgeWidget.jsx
// Widget compact pour afficher les badges sur le dashboard
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useBadgeStats } from '../../hooks/useBadges.js';
import BadgeIntegrationService from '../../core/services/badgeIntegrationService.js';

/**
 * 🏆 WIDGET COMPACT DES BADGES
 * 
 * Affichage condensé pour le dashboard avec:
 * - Progression globale des badges
 * - Prochains badges à débloquer
 * - Bouton de vérification rapide
 * - Liens vers la galerie complète
 */
const BadgeWidget = () => {
  const { user } = useAuthStore();
  const { stats, loading } = useBadgeStats();
  const [checking, setChecking] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [nextBadges, setNextBadges] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadNextBadges();
    }
  }, [user?.uid]);

  /**
   * 🎯 CHARGER LES PROCHAINS BADGES À DÉBLOQUER
   */
  const loadNextBadges = async () => {
    try {
      // Cette fonction nécessiterait une extension du BadgeEngine
      // Pour l'instant, on utilise des données mock
      setNextBadges([
        {
          id: 'early_bird',
          name: 'Early Bird',
          icon: '🌅',
          description: 'Complété 5 tâches avant 8h',
          progress: { current: 2, target: 5, percentage: 40 }
        },
        {
          id: 'task_destroyer_25',
          name: 'Task Destroyer',
          icon: '💥',
          description: 'Complété 25 tâches',
          progress: { current: 18, target: 25, percentage: 72 }
        }
      ]);
    } catch (error) {
      console.error('❌ Erreur loadNextBadges:', error);
    }
  };

  /**
   * 🔍 VÉRIFICATION RAPIDE DES BADGES
   */
  const handleQuickCheck = async () => {
    if (!user?.uid || checking) return;

    try {
      setChecking(true);
      const newBadges = await BadgeIntegrationService.manualBadgeCheck(user.uid);
      
      if (newBadges.length > 0) {
        setRecentActivity(prev => [
          ...newBadges.map(badge => ({
            type: 'badge',
            data: badge,
            timestamp: new Date()
          })),
          ...prev.slice(0, 2)
        ]);
      }

    } catch (error) {
      console.error('❌ Erreur quickCheck:', error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      {/* 🏆 En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🏆</span>
          Badges
        </h3>
        <a
          href="/gamification"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Voir tout →
        </a>
      </div>

      {/* 📊 Progression globale */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progression</span>
          <span className="text-sm font-medium text-gray-900">
            {stats?.unlockedCount || 0}/{stats?.totalCount || 0}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats?.percentage || 0}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          {stats?.percentage || 0}% débloqués
        </div>
      </div>

      {/* 🎯 Prochains badges */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          🎯 Prochains objectifs
        </h4>
        
        {nextBadges.length > 0 ? (
          <div className="space-y-3">
            {nextBadges.slice(0, 2).map(badge => (
              <div key={badge.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {badge.name}
                    </h5>
                    <p className="text-xs text-gray-500 truncate">
                      {badge.description}
                    </p>
                  </div>
                </div>
                
                {badge.progress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{badge.progress.current}/{badge.progress.target}</span>
                      <span>{badge.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${badge.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm text-gray-500">
              Tous les badges disponibles sont débloqués !
            </p>
          </div>
        )}
      </div>

      {/* 🔄 Activité récente */}
      {recentActivity.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            🆕 Récemment débloqués
          </h4>
          <div className="space-y-2">
            {recentActivity.slice(0, 2).map((activity, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-lg">{activity.data.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {activity.data.name}
                  </p>
                  <p className="text-xs text-green-600">
                    +{activity.data.xpReward} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔍 Actions */}
      <div className="space-y-3">
        <button
          onClick={handleQuickCheck}
          disabled={checking}
          className={`
            w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200
            ${checking 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
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
            'Vérifier nouveaux badges'
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="/gamification"
            className="py-2 px-3 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium text-center hover:bg-gray-100 transition-colors"
          >
            Galerie
          </a>
          <a
            href="/leaderboard"
            className="py-2 px-3 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium text-center hover:bg-gray-100 transition-colors"
          >
            Classement
          </a>
        </div>
      </div>

      {/* 📈 Statistiques rapides */}
      {stats && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-purple-600">
                {stats.unlockedCount}
              </div>
              <div className="text-xs text-gray-500">Débloqués</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {stats.totalXpFromBadges || 0}
              </div>
              <div className="text-xs text-gray-500">XP Badges</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {stats.percentage || 0}%
              </div>
              <div className="text-xs text-gray-500">Complet</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 🎖️ COMPOSANT MINI-BADGE
 * Version compacte pour l'affichage dans d'autres composants
 */
export const MiniBadge = ({ badge, size = 'sm', showProgress = false }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  const rarityClasses = {
    common: 'border-gray-300 bg-gray-50',
    uncommon: 'border-green-300 bg-green-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50 animate-pulse'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${rarityClasses[badge.rarity]} 
      border-2 rounded-full flex items-center justify-center
    `}>
      <span>{badge.icon}</span>
    </div>
  );
};

/**
 * 📊 COMPOSANT BARRE DE PROGRESSION BADGE
 * Barre de progression réutilisable pour les badges
 */
export const BadgeProgressBar = ({ current, target, className = '' }) => {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{current}/{target}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BadgeWidget;
