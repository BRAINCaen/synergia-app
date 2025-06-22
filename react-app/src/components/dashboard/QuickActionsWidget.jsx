// ===================================================================
// 📊 WIDGET DASHBOARD AVEC DONNÉES RÉELLES
// Fichier: react-app/src/components/dashboard/QuickActionsWidget.jsx
// ===================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useRealTimeUser, useUserStats } from '../../hooks/useRealTimeUser.js';

const QuickActionsWidget = () => {
  const { userData, loading, error } = useRealTimeUser();
  const { getXPProgress, getRecentActivity, getBadgeProgress } = useUserStats();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 rounded-xl text-white animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-32"></div>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-full"></div>
        </div>
        <div className="h-2 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-24"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600/20 border border-red-500 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-red-400 mb-2">
          ⚠️ Erreur de chargement
        </h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  const xpProgress = getXPProgress();
  const recentActivity = getRecentActivity();
  const badgeProgress = getBadgeProgress();

  return (
    <div className="space-y-6">
      {/* Widget Principal - Profil et Progression */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">
              Bonsoir, {userData?.displayName || 'Utilisateur'} ! 👋
            </h2>
            <p className="text-blue-100 mt-1">
              Prêt à atteindre vos objectifs aujourd'hui ?
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                Niveau {xpProgress.level}
              </span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {xpProgress.totalXP} XP Total
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
              {userData?.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={userData.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="text-xs text-blue-100">
              {userData?.profile?.department || 'Non défini'}
            </div>
          </div>
        </div>

        {/* Progression XP */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progression</span>
            <span>{xpProgress.current} / 100 XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            {xpProgress.needed} XP pour passer niveau {xpProgress.level + 1}
          </p>
        </div>
      </div>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {userData?.gamification?.tasksCompleted || 0}
          </div>
          <div className="text-sm text-gray-400">Tâches terminées</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-400">
            {userData?.gamification?.projectsCreated || 0}
          </div>
          <div className="text-sm text-gray-400">Projets créés</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {badgeProgress.earnedBadges}
          </div>
          <div className="text-sm text-gray-400">Badges obtenus</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {userData?.gamification?.loginStreak || 0}
          </div>
          <div className="text-sm text-gray-400">Jours de suite</div>
        </div>
      </div>

      {/* Navigation Rapide */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Navigation Rapide
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/tasks"
            className="flex items-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
          >
            <span className="mr-2 text-lg">🎯</span>
            <div>
              <div className="font-medium text-white text-sm">Mes Tâches</div>
              <div className="text-blue-100 text-xs">Gérer et créer</div>
            </div>
          </Link>

          <Link
            to="/projects"
            className="flex items-center p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors group"
          >
            <span className="mr-2 text-lg">📁</span>
            <div>
              <div className="font-medium text-white text-sm">Projets</div>
              <div className="text-orange-100 text-xs">Organisation</div>
            </div>
          </Link>

          <Link
            to="/leaderboard"
            className="flex items-center p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors group"
          >
            <span className="mr-2 text-lg">🏆</span>
            <div>
              <div className="font-medium text-white text-sm">Classement</div>
              <div className="text-yellow-100 text-xs">Top performers</div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors group"
          >
            <span className="mr-2 text-lg">👤</span>
            <div>
              <div className="font-medium text-white text-sm">Mon Profil</div>
              <div className="text-purple-100 text-xs">Paramètres</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Activité Récente */}
      {recentActivity.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Activité Récente
          </h3>
          
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm text-white">
                      +{activity.amount} XP • {activity.source}
                    </div>
                    <div className="text-xs text-gray-400">
                      {activity.timeAgo}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-400">
                  {activity.totalAfter} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prochain Badge */}
      {badgeProgress.nextBadge && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <span className="mr-2">{badgeProgress.nextBadge.icon}</span>
            Prochain Badge : {badgeProgress.nextBadge.name}
          </h3>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Progression</span>
              <span className="text-yellow-400">
                {badgeProgress.nextBadge.current} / {badgeProgress.nextBadge.requirement}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(badgeProgress.nextBadge.current / badgeProgress.nextBadge.requirement) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-300">
            Plus que {badgeProgress.nextBadge.requirement - badgeProgress.nextBadge.current} tâches pour débloquer ce badge !
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickActionsWidget;
