// ===================================================================
// 🏠 DASHBOARD PRINCIPAL AVEC DONNÉES RÉELLES
// Fichier: react-app/src/modules/dashboard/widgets/pages/Dashboard.jsx
// ===================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Trophy, CheckSquare } from 'lucide-react';
import AuthService from '../../../modules/auth/services/authService.js';
import { useAuthStore } from '../../../shared/stores/authStore.js';
import Card from '../../../shared/components/ui/Card.jsx';
import Button from '../../../shared/components/ui/Button.jsx';
import WelcomeWidget from '../../../modules/dashboard/widgets/WelcomeWidget.jsx';
import { ROUTES } from '../../../core/constants.js';

// Import des hooks pour données réelles
// ✅ Bon chemin depuis modules/dashboard/widgets/pages/Dashboard.jsx
import { useRealTimeUser, useUserStats } from '../../../../shared/hooks/useRealTimeUser.js';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { userData, loading, error } = useRealTimeUser();
  const { getXPProgress, getRecentActivity, getBadgeProgress } = useUserStats();

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <span className="text-xl">⚡</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Synergia</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Chargement...</span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 h-32 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  // Calculer les stats en temps réel
  const xpProgress = getXPProgress();
  const recentActivity = getRecentActivity();
  const badgeProgress = getBadgeProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Synergia</span>
              </div>
              <div className="hidden md:block">
                <span className="text-sm text-gray-500">v3.0</span>
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  ✅ Récupéré
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <span className="text-gray-700">
                  {userData?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                </span>
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Widget de bienvenue avec données réelles */}
        <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                Bonsoir, {userData?.displayName || 'Puck Time'} ! 👋
              </h1>
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
        </Card>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center bg-blue-50 border-blue-200">
            <CheckSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {userData?.gamification?.tasksCompleted || 0}
            </div>
            <div className="text-sm text-blue-700">Tâches terminées</div>
          </Card>

          <Card className="p-4 text-center bg-green-50 border-green-200">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-2xl font-bold text-green-600">
              {userData?.gamification?.projectsCreated || 0}
            </div>
            <div className="text-sm text-green-700">Projets créés</div>
          </Card>

          <Card className="p-4 text-center bg-purple-50 border-purple-200">
            <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {badgeProgress.earnedBadges}
            </div>
            <div className="text-sm text-purple-700">Badges obtenus</div>
          </Card>

          <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-yellow-600">
              {userData?.gamification?.loginStreak || 0}
            </div>
            <div className="text-sm text-yellow-700">Jours de suite</div>
          </Card>
        </div>

        {/* Navigation Rapide */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Navigation Rapide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/tasks"
              className="flex items-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white group"
            >
              <CheckSquare className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Mes Tâches</div>
                <div className="text-blue-100 text-sm">Gérer et créer</div>
              </div>
            </Link>

            <Link
              to="/projects"
              className="flex items-center p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-white group"
            >
              <span className="text-xl mr-3">📁</span>
              <div>
                <div className="font-medium">Projets</div>
                <div className="text-orange-100 text-sm">Organisation</div>
              </div>
            </Link>

            <Link
              to="/leaderboard"
              className="flex items-center p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-white group"
            >
              <Trophy className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Classement</div>
                <div className="text-yellow-100 text-sm">Top performers</div>
              </div>
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white group"
            >
              <User className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Mon Profil</div>
                <div className="text-purple-100 text-sm">Paramètres</div>
              </div>
            </Link>
          </div>
        </Card>

        {/* Activité Récente */}
        {recentActivity.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Activité Récente
            </h3>
            
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        +{activity.amount} XP • {activity.source}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.timeAgo}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {activity.totalAfter} XP
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Prochain Badge */}
        {badgeProgress.nextBadge && (
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2 text-xl">{badgeProgress.nextBadge.icon}</span>
              Prochain Badge : {badgeProgress.nextBadge.name}
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progression</span>
                <span className="text-yellow-600 font-medium">
                  {badgeProgress.nextBadge.current} / {badgeProgress.nextBadge.requirement}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(badgeProgress.nextBadge.current / badgeProgress.nextBadge.requirement) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Plus que {badgeProgress.nextBadge.requirement - badgeProgress.nextBadge.current} tâches pour débloquer ce badge !
            </p>
          </Card>
        )}

        {/* Performance du mois */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tâches cette semaine</span>
                <span className="font-medium">{userData?.gamification?.weeklyXp || 0} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">XP gagnés aujourd'hui</span>
                <span className="font-medium">+{recentActivity.slice(0,1).reduce((sum, a) => sum + a.amount, 0)} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak de connexion</span>
                <span className="font-medium">{userData?.gamification?.loginStreak || 0} jours</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Objectifs
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>• Terminer 5 tâches cette semaine</div>
              <div>• Gagner 200 XP supplémentaires</div>
              <div>• Maintenir votre streak de connexion</div>
              <div>• Débloquer votre prochain badge</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
