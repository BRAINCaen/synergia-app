// ==========================================
// 📁 react-app/src/components/gamification/BadgeWidget.jsx
// Widget badges avec imports et exports corrigés
// ==========================================

import React from 'react';
import { useBadges } from '../../shared/hooks/useBadges.js'; // ✅ Import corrigé

/**
 * 🏆 COMPOSANT WIDGET BADGES
 * 
 * Widget compact pour afficher l'état des badges dans le dashboard
 * - Badges récents débloqués
 * - Progression générale
 * - Actions rapides
 * - Statistiques résumées
 */
const BadgeWidget = () => {
  const {
    badges,
    userBadges,
    stats,
    loading,
    checking,
    checkBadges,
    recentBadges
  } = useBadges();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const completionPercentage = badges.length > 0 
    ? Math.round((userBadges.length / badges.length) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* 🎯 En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🏆 Badges</h3>
        <span className="text-sm text-gray-500">
          {userBadges.length}/{badges.length}
        </span>
      </div>

      {/* 📊 Progression globale */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 🏅 Badges récents */}
      {recentBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Récemment débloqués</h4>
          <div className="flex space-x-2">
            {recentBadges.slice(0, 3).map((badge, index) => (
              <div 
                key={badge.id || index}
                className="flex-1 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 text-center"
                title={badge.name}
              >
                <div className="text-lg mb-1">{badge.icon}</div>
                <div className="text-xs font-medium text-gray-700 truncate">
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔄 Actions */}
      <div className="space-y-3">
        <button
          onClick={checkBadges}
          disabled={checking}
          className={`
            w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors
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
                {stats.unlockedCount || userBadges.length}
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
                {stats.percentage || completionPercentage}%
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
    common: 'bg-gray-100 border-gray-300',
    uncommon: 'bg-green-100 border-green-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-yellow-100 border-yellow-300'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${rarityClasses[badge.rarity || 'common']}
      border-2 rounded-full flex items-center justify-center
      font-bold text-center relative overflow-hidden
    `}>
      <span>{badge.icon}</span>
      {showProgress && badge.progress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${badge.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * 📋 COMPOSANT LISTE BADGES COMPACTE
 * Pour affichage dans les profils ou cartes
 */
export const BadgeList = ({ badges, maxVisible = 3, showMore = true }) => {
  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  return (
    <div className="flex items-center space-x-1">
      {visibleBadges.map((badge, index) => (
        <MiniBadge key={badge.id || index} badge={badge} size="sm" />
      ))}
      
      {showMore && remainingCount > 0 && (
        <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default BadgeWidget;
