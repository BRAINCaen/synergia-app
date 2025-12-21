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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-yellow-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-yellow-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">
          {/* EN-TÊTE */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                    Gamification
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Suivez votre progression et gagnez des récompenses
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, rotate: 180 }}
                whileTap={{ scale: 0.98 }}
                onClick={refresh}
                className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </motion.button>
            </div>

            {/* STATISTIQUES RAPIDES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-2 bg-yellow-500/20 rounded-xl w-fit mx-auto mb-2 sm:mb-3">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{gamification.totalXp}</div>
                <div className="text-gray-400 text-xs sm:text-sm">XP Total</div>
              </motion.div>

              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-2 bg-purple-500/20 rounded-xl w-fit mx-auto mb-2 sm:mb-3">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">{gamification.level}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Niveau</div>
              </motion.div>

              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-2 bg-blue-500/20 rounded-xl w-fit mx-auto mb-2 sm:mb-3">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">{gamification.badgeCount}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Badges</div>
              </motion.div>

              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="p-2 bg-orange-500/20 rounded-xl w-fit mx-auto mb-2 sm:mb-3">
                  <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-orange-400">{gamification.loginStreak}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Jours</div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            {/* PROGRESSION */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white">Progression</h3>
              </div>

              <div className="text-center mb-4">
                <div className="text-5xl sm:text-6xl font-bold text-purple-400 mb-2">{gamification.level}</div>
                <p className="text-gray-400 text-sm">Niveau actuel</p>
              </div>

              <div className="relative mb-4">
                <div className="h-3 sm:h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${gamification.progressPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <p className="text-center text-gray-300 text-sm">
                <strong>{gamification.xpToNextLevel} XP</strong> pour niveau {gamification.level + 1}
              </p>
            </motion.div>

            {/* STATISTIQUES XP */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white">Statistiques XP</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="text-gray-300 text-sm">XP Total</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-yellow-400">{gamification.totalXp}</span>
                </div>

                <div className="flex justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">XP Semaine</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-green-400">{gamification.weeklyXp}</span>
                </div>

                <div className="flex justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">XP Mois</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-blue-400">{gamification.monthlyXp}</span>
                </div>
              </div>
            </motion.div>

            {/* BADGES */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white">Mes Badges</h3>
                <span className="ml-auto bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs sm:text-sm">
                  {gamification.badgeCount}
                </span>
              </div>

              {gamification.badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {gamification.badges.slice(0, 6).map((badge, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{badge.icon || '🏆'}</div>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">{badge.name}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-6 sm:py-8 text-sm">
                  Complétez des quêtes pour débloquer des badges !
                </p>
              )}
            </motion.div>

            {/* LEADERBOARD */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white">Classement</h3>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((player, index) => (
                    <motion.div
                      key={player.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-white/10 text-white'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{player.displayName}</p>
                        <p className="text-gray-400 text-xs">Niveau {player.level}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-yellow-400 font-bold text-sm">{player.totalXp} XP</p>
                        <p className="text-gray-400 text-xs">{player.badges} badges</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-6 sm:py-8 text-sm">Chargement...</p>
              )}
            </motion.div>

          </div>

          {/* ACTIVITÉ */}
          <motion.div
            className="mt-4 sm:mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-pink-500/20 rounded-xl">
                <Activity className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white">Activité</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">Quêtes complétées</span>
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{gamification.tasksCompleted}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">Projets créés</span>
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Gift className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{gamification.projectsCreated}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">Taux complétion</span>
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <Medal className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{gamification.completionRate}%</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default GamificationPage;
