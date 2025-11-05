// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION UNIFIÉE - HOOK CENTRAL
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Award, Star, Crown, Flame, Zap, Target,
  TrendingUp, Calendar, RefreshCw, BarChart3, Users,
  Medal, Gift, Activity
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useGamificationSync } from '../shared/hooks/useGamificationSync.js';

const GamificationPage = () => {
  const {
    gamification,
    leaderboard,
    stats,
    loading,
    refresh
  } = useGamificationSync();

  if (loading || !gamification) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                Gamification
              </h1>
              <p className="text-gray-400 mt-2">
                Suivez votre progression et gagnez des récompenses
              </p>
            </div>

            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </button>
          </div>

          {/* STATISTIQUES RAPIDES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-400">{gamification.totalXp}</div>
              <div className="text-gray-400 text-sm">XP Total</div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Crown className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-400">{gamification.level}</div>
              <div className="text-gray-400 text-sm">Niveau</div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Award className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-400">{gamification.badgeCount}</div>
              <div className="text-gray-400 text-sm">Badges</div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-400">{gamification.loginStreak}</div>
              <div className="text-gray-400 text-sm">Jours</div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PROGRESSION */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Progression</h3>
            </div>

            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-purple-400 mb-2">{gamification.level}</div>
              <p className="text-gray-400">Niveau actuel</p>
            </div>

            <div className="relative mb-4">
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.progressPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <p className="text-center text-gray-300">
              <strong>{gamification.xpToNextLevel} XP</strong> pour niveau {gamification.level + 1}
            </p>
          </motion.div>

          {/* STATISTIQUES XP */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Statistiques XP</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">XP Total</span>
                </div>
                <span className="text-xl font-bold text-yellow-400">{gamification.totalXp}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">XP Semaine</span>
                </div>
                <span className="text-lg font-bold text-green-400">{gamification.weeklyXp}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">XP Mois</span>
                </div>
                <span className="text-lg font-bold text-blue-400">{gamification.monthlyXp}</span>
              </div>
            </div>
          </motion.div>

          {/* BADGES */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Mes Badges</h3>
              <span className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                {gamification.badgeCount}
              </span>
            </div>

            {gamification.badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {gamification.badges.slice(0, 6).map((badge, index) => (
                  <div key={index} className="text-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                    <p className="text-xs text-gray-400">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                Complétez des quêtes pour débloquer des badges !
              </p>
            )}
          </motion.div>

          {/* LEADERBOARD */}
          <motion.div
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Classement</h3>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-white font-semibold">{player.displayName}</p>
                      <p className="text-gray-400 text-sm">Niveau {player.level}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{player.totalXp} XP</p>
                      <p className="text-gray-400 text-sm">{player.badges} badges</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">Chargement...</p>
            )}
          </motion.div>

        </div>

        {/* ACTIVITÉ */}
        <motion.div
          className="mt-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Activité</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Quêtes complétées</span>
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{gamification.tasksCompleted}</p>
            </div>

            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Projets créés</span>
                <Gift className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{gamification.projectsCreated}</p>
            </div>

            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Taux complétion</span>
                <Medal className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{gamification.completionRate}%</p>
            </div>
          </div>
        </motion.div>

      </div>
    </Layout>
  );
};

export default GamificationPage;
