// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD UNIFIÉ - HOOK CENTRAL
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Trophy, Users, Zap, Target, Award, 
  TrendingUp, CheckSquare, RefreshCw, Crown
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGamificationSync } from '../shared/hooks/useGamificationSync.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  
  const {
    gamification,
    leaderboard,
    stats,
    loading,
    getUserRank,
    refresh
  } = useGamificationSync();

  if (loading || !gamification) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const userRank = getUserRank();
  const topUsers = leaderboard.slice(0, 5);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                👋 Bonjour, {user?.displayName || 'Utilisateur'}
              </h1>
              <p className="text-gray-400">
                Voici votre tableau de bord Synergia
              </p>
            </div>
            
            <button
              onClick={refresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Progression XP */}
          <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Progression XP
              </h3>
              <span className="text-sm text-gray-400">
                Niveau {gamification.level}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{gamification.currentLevelXP} XP</span>
                <span>{gamification.nextLevelXP} XP</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.progressPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{gamification.totalXp}</div>
                <div className="text-xs text-gray-400">XP Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{gamification.xpToNextLevel}</div>
                <div className="text-xs text-gray-400">Jusqu'au prochain niveau</div>
              </div>
            </div>
          </div>

          {/* Mon Niveau */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Mon Niveau</h3>
            </div>
            <div className="text-3xl font-bold mb-1">Level {gamification.level}</div>
            <div className="text-sm opacity-75">{gamification.totalXp} XP Total</div>
          </div>

          {/* Ma Position */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Ma Position</h3>
            </div>
            <div className="text-3xl font-bold mb-1">#{userRank || '?'}</div>
            <div className="text-sm opacity-75">Dans le classement</div>
          </div>
        </div>

        {/* STATISTIQUES D'ÉQUIPE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Équipe</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{leaderboard.length}</div>
            <div className="text-sm opacity-75">membres actifs</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">XP Semaine</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{gamification.weeklyXp}</div>
            <div className="text-sm opacity-75">cette semaine</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CheckSquare className="w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Quêtes</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{gamification.tasksCompleted}</div>
            <div className="text-sm opacity-75">complétées</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Badges</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{gamification.badgeCount}</div>
            <div className="text-sm opacity-75">débloqués</div>
          </div>
        </div>

        {/* SECTION INFÉRIEURE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Performers
              </h3>
              <span className="text-xs text-gray-400">{topUsers.length} utilisateurs</span>
            </div>

            <div className="space-y-3">
              {topUsers.map((topUser, index) => (
                <div
                  key={topUser.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    topUser.id === user?.uid
                      ? 'bg-blue-600/20 border border-blue-500/50'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{topUser.displayName}</div>
                      <div className="text-xs text-gray-400">Niveau {topUser.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{topUser.totalXp}</div>
                    <div className="text-xs text-gray-400">{topUser.badges} badges</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activité Récente */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Mes Statistiques
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Quêtes complétées</span>
                </div>
                <span className="text-white font-bold">{gamification.tasksCompleted}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Projets créés</span>
                </div>
                <span className="text-white font-bold">{gamification.projectsCreated}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Taux de complétion</span>
                </div>
                <span className="text-white font-bold">{gamification.completionRate}%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Série de connexion</span>
                </div>
                <span className="text-white font-bold">{gamification.loginStreak} jours</span>
              </div>
            </div>

            {/* Progression mensuelle */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Progression mensuelle</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((gamification.monthlyXp / 800) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{gamification.monthlyXp} XP</span>
                <span>Objectif: 800 XP</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* BADGES RÉCENTS */}
        {gamification.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Mes Derniers Badges
              </h3>
              <a 
                href="/gamification" 
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Voir tous →
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gamification.badges.slice(-6).map((badge, index) => (
                <div 
                  key={index}
                  className="text-center p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                  <div className="text-xs text-gray-400">{badge.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;
