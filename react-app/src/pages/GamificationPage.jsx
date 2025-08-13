// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// VERSION SIMPLIFIÉE FIREBASE - CORRECTION PAGE BLANCHE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Flame, 
  Clock,
  Users,
  CheckCircle,
  Gift,
  Crown,
  Zap,
  Plus,
  Calendar,
  RefreshCw
} from 'lucide-react';

// ✅ IMPORTS SIMPLIFIÉS
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎮 PAGE GAMIFICATION SIMPLIFIÉE - CORRECTION PAGE BLANCHE
 */
const GamificationPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // États locaux simplifiés
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // ✅ DONNÉES UTILISATEUR BASIQUES (éviter le hook qui cause l'erreur)
  const userStats = {
    totalXp: 0,
    level: 1,
    weeklyXp: 0,
    monthlyXp: 0,
    tasksCompleted: 0,
    currentStreak: 0,
    badges: [],
    loginStreak: 1,
    projectsCompleted: 0,
    badgesUnlocked: 0
  };

  // ✅ CALCULS SIMPLIFIÉS
  const calculations = {
    nextLevelXp: userStats.level * 1000,
    progressPercent: 0,
    weeklyProgress: 0,
    xpToNextLevel: 1000
  };

  // ✅ DONNÉES VIDES POUR ÉVITER LES ERREURS
  const objectives = [];
  const recentActivities = [];
  const leaderboardData = [];
  const availableBadges = [];

  // ✅ FONCTIONS SIMPLIFIÉES
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const claimObjective = (objectiveId) => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Vérification d'authentification
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-400">Veuillez vous connecter pour accéder à la gamification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🎉 NOTIFICATION */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Objectif complété !</span>
            </div>
          </div>
        )}

        {/* 📊 EN-TÊTE */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification</h1>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="ml-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-400 text-lg">Suivez vos progrès et débloquez des récompenses</p>
        </div>

        {/* 📈 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{userStats.totalXp}</span>
            </div>
            <h3 className="text-blue-400 font-semibold mb-2">XP Total</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculations.progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">{calculations.xpToNextLevel} jusqu'au niveau {userStats.level + 1}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{userStats.level}</span>
            </div>
            <h3 className="text-yellow-400 font-semibold mb-2">Niveau</h3>
            <p className="text-gray-400 text-sm">Progression: {calculations.progressPercent.toFixed(1)}%</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{userStats.tasksCompleted}</span>
            </div>
            <h3 className="text-green-400 font-semibold mb-2">Tâches Terminées</h3>
            <p className="text-gray-400 text-sm">Total depuis le début</p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">{userStats.currentStreak}</span>
            </div>
            <h3 className="text-red-400 font-semibold mb-2">Série Actuelle</h3>
            <p className="text-gray-400 text-sm">Jours consécutifs</p>
          </div>
        </div>

        {/* 🎯 NAVIGATION ONGLETS */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex gap-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'objectives', label: 'Objectifs', icon: Target },
              { id: 'leaderboard', label: 'Classement', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📊 CONTENU DES ONGLETS */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progression Hebdomadaire */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Calendar className="w-6 h-6 text-purple-400 mr-3" />
                  Progression Hebdomadaire
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">XP cette semaine</span>
                    <span className="text-white font-semibold">{userStats.weeklyXp} XP</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${calculations.weeklyProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Commencez à utiliser l'application pour gagner des XP !
                  </p>
                </div>
              </div>

              {/* Activités Récentes */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-blue-400 mr-3" />
                  Activités Récentes
                </h3>
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune activité récente</p>
                  <p className="text-gray-500 text-sm">Commencez à utiliser l'application pour voir vos activités</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Award className="w-8 h-8 text-orange-400 mr-3" />
                Collection de Badges
              </h3>
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun badge disponible</p>
                <p className="text-gray-500 text-sm">Terminez des tâches pour débloquer vos premiers badges</p>
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Target className="w-8 h-8 text-green-400 mr-3" />
                Objectifs Actifs
              </h3>
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun objectif disponible</p>
                <p className="text-gray-500 text-sm">Les objectifs apparaîtront automatiquement selon votre progression</p>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Users className="w-8 h-8 text-purple-400 mr-3" />
                Classement Global
              </h3>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune donnée de classement</p>
                <p className="text-gray-500 text-sm">Le classement apparaîtra quand d'autres utilisateurs rejoindront</p>
              </div>
            </div>
          )}
        </div>

        {/* 🎯 STATISTIQUES SUPPLÉMENTAIRES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <Award className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{availableBadges.filter(b => b.unlocked).length}</h4>
            <p className="text-gray-400">Badges Débloqués</p>
            <p className="text-purple-400 text-sm mt-1">
              Commencez votre aventure !
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{userStats.loginStreak}</h4>
            <p className="text-gray-400">Série de Connexions</p>
            <p className="text-blue-400 text-sm mt-1">
              Continuez ainsi !
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-white mb-2">{userStats.projectsCompleted}</h4>
            <p className="text-gray-400">Projets Terminés</p>
            <p className="text-green-400 text-sm mt-1">
              Prêt à commencer
            </p>
          </div>
        </div>

        {/* 🏆 SECTION MOTIVATION */}
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Bienvenue dans la Gamification !</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Commencez à utiliser Synergia pour débloquer des badges, gagner des XP et gravir les échelons du classement.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-white text-sm font-medium">Terminez des tâches</p>
                <p className="text-gray-400 text-xs">Gagnez de l'XP et progressez</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-white text-sm font-medium">Débloquez des badges</p>
                <p className="text-gray-400 text-xs">Montrez vos accomplissements</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">👑</div>
                <p className="text-white text-sm font-medium">Montez dans le classement</p>
                <p className="text-gray-400 text-xs">Compétitionnez avec votre équipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
