// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// MON AVENTURE - PAGE PRINCIPALE UNIFIÉE
// Fusion: Dashboard + Gamification + Stats
// CONFORME CHARTE GRAPHIQUE SYNERGIA v3.5
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Trophy, Users, Zap, Target, Award, Crown, Flame,
  TrendingUp, TrendingDown, Minus, CheckSquare, RefreshCw,
  BarChart3, Calendar, Gift, Activity, Medal, Sparkles
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGamificationSync } from '../shared/hooks/useGamificationSync.js';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';
import { useTeamChallenges } from '../shared/hooks/useTeamChallenges.js';
import { calculateLevel, getXPProgress, getRankForLevel } from '../core/services/levelService.js';
import xpHistoryService from '../core/services/xpHistoryService.js';
import { WhatsNewModal, WhatsNewButton } from '../components/updates';

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

  // États pour les stats personnelles (Module 7)
  const [xpStats, setXpStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // État pour le modal "Quoi de neuf"
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  // Hook pour la cagnotte d'équipe (Module 8)
  const { stats: poolStats, loading: poolLoading } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true
  });

  // Hook pour les défis d'équipe (Module 10)
  const { stats: challengeStats, activeChallenges, loading: challengesLoading } = useTeamChallenges({
    autoInit: true,
    realTimeUpdates: true
  });

  // Charger les stats XP
  useEffect(() => {
    if (!user?.uid) return;

    const loadXpStats = async () => {
      try {
        const stats = await xpHistoryService.calculateXPStats(user.uid);
        setXpStats(stats);
      } catch (error) {
        console.error('Erreur chargement stats XP:', error);
      }
      setStatsLoading(false);
    };

    loadXpStats();
  }, [user?.uid]);

  // Calculer niveau et rang
  const levelInfo = useMemo(() => {
    if (!gamification) return null;
    const totalXP = gamification.totalXp || 0;
    const level = calculateLevel(totalXP);
    const progress = getXPProgress(totalXP);
    const rank = getRankForLevel(level);
    return { level, progress, rank, totalXP };
  }, [gamification]);

  // Rafraîchir toutes les données
  const handleRefresh = async () => {
    refresh();
    if (user?.uid) {
      const stats = await xpHistoryService.calculateXPStats(user.uid);
      setXpStats(stats);
    }
  };

  if (loading || !gamification) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          {/* Animated background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement de votre aventure...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userRank = getUserRank();
  const topUsers = leaderboard.slice(0, 5);
  // Utiliser la valeur max entre xpStats (calculée) et gamification.loginStreak (trackée)
  // pour éviter d'afficher 0 si une des sources manque de données
  const currentStreak = Math.max(
    xpStats?.currentStreak || 0,
    gamification?.loginStreak || 0
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">

          {/* EN-TÊTE */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Mon Aventure
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Bienvenue {user?.displayName || 'Aventurier'} !
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10 w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </motion.button>
            </div>
          </motion.div>

          {/* CARTE HÉROS - Niveau et Rang */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-cyan-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden border border-white/20"
          >
            {/* Effet décoratif */}
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              {/* Avatar et Rang */}
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl shadow-lg shrink-0 border border-white/20">
                  {levelInfo?.rank?.icon || '🎮'}
                </div>
                <div>
                  <div className="text-white/80 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                    {levelInfo?.rank?.name || 'Apprenti'}
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-white mb-0.5 sm:mb-1">
                    Niveau {gamification.level}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm">
                    {gamification.totalXp.toLocaleString()} XP total
                  </div>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex justify-between sm:justify-end gap-4 sm:gap-8 bg-white/10 backdrop-blur-xl sm:bg-transparent rounded-xl p-3 sm:p-0 border border-white/10 sm:border-0">
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-white">{gamification.badgeCount}</div>
                  <div className="text-white/70 text-xs sm:text-sm">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-white">#{userRank || '?'}</div>
                  <div className="text-white/70 text-xs sm:text-sm">Rang</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-white flex items-center justify-center gap-1">
                    {currentStreak}
                    {currentStreak >= 7 && <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-orange-300" />}
                  </div>
                  <div className="text-white/70 text-xs sm:text-sm">Série</div>
                </div>
              </div>
            </div>

            {/* Barre de progression niveau */}
            <div className="relative mt-4 sm:mt-6">
              <div className="flex justify-between text-xs sm:text-sm text-white/80 mb-1 sm:mb-2">
                <span>{gamification.currentLevelXP} XP</span>
                <span>{gamification.nextLevelXP} XP</span>
              </div>
              <div className="h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.progressPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-center mt-2 text-white/70 text-xs sm:text-sm">
                Encore <span className="font-bold text-white">{gamification.xpToNextLevel} XP</span> pour le niveau {gamification.level + 1}
              </div>
            </div>
          </motion.div>

          {/* STATISTIQUES PRINCIPALES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-500/80 to-orange-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">XP Semaine</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">{gamification.weeklyXp}</div>
              <div className="text-xs sm:text-sm opacity-75">cette semaine</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-500/80 to-emerald-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Quêtes</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">{gamification.tasksCompleted}</div>
              <div className="text-xs sm:text-sm opacity-75">complétées</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Équipe</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">{leaderboard.length}</div>
              <div className="text-xs sm:text-sm opacity-75">membres</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Complétion</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">{gamification.completionRate}%</div>
              <div className="text-xs sm:text-sm opacity-75">succès</div>
            </motion.div>
          </div>

          {/* SECTION PROGRESSION XP (7 jours) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2.5 sm:p-3 bg-purple-600/20 rounded-xl">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">Progression XP - 7 derniers jours</h3>
                <p className="text-xs sm:text-sm text-gray-400">Votre activité récente</p>
              </div>
            </div>

            {xpStats?.last7Days && xpStats.last7Days.length > 0 ? (
              <>
                {/* Tendance */}
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const data = xpStats.last7Days;
                    const firstHalf = data.slice(0, 3);
                    const secondHalf = data.slice(4);
                    const firstAvg = firstHalf.reduce((s, d) => s + (d.xpGained || 0), 0) / (firstHalf.length || 1);
                    const secondAvg = secondHalf.reduce((s, d) => s + (d.xpGained || 0), 0) / (secondHalf.length || 1);
                    const trend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'stable';

                    if (trend === 'up') return (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">Tendance positive</span>
                      </>
                    );
                    if (trend === 'down') return (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">Tendance négative</span>
                      </>
                    );
                    return (
                      <>
                        <Minus className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400 font-medium">Tendance stable</span>
                      </>
                    );
                  })()}
                </div>

                {/* Graphique barres */}
                <div className="flex items-end gap-1 sm:gap-2 h-24 sm:h-32 mb-4">
                  {xpStats.last7Days.map((item, index) => {
                    const maxValue = Math.max(...xpStats.last7Days.map(d => d.xpGained || 0), 1);
                    const percentage = ((item.xpGained || 0) / maxValue) * 100;
                    const isToday = index === xpStats.last7Days.length - 1;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                        <span className="text-[10px] sm:text-xs text-gray-500">{item.xpGained || 0}</span>
                        <motion.div
                          className={`w-full rounded-t-md ${
                            isToday
                              ? 'bg-gradient-to-t from-yellow-500 to-amber-400'
                              : 'bg-gradient-to-t from-blue-600 to-purple-500'
                          }`}
                          style={{ minHeight: 4 }}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(percentage, 3)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        />
                        <span className={`text-[10px] sm:text-xs ${isToday ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                          {item.dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Résumé */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-white">{xpStats.weekXP || 0}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">XP semaine</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-400">{xpStats.dailyAverage || 0}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Moyenne/jour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-purple-400">{xpStats.bestDay?.xp || 0}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Record</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-400">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">Commencez à gagner de l'XP pour voir vos statistiques</p>
              </div>
            )}
          </motion.div>

          {/* GRILLE INFÉRIEURE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

            {/* TOP PERFORMERS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  Top Performers
                </h3>
                <span className="text-xs text-gray-400">{topUsers.length} utilisateurs</span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {topUsers.map((topUser, index) => (
                  <motion.div
                    key={topUser.id}
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all ${
                      topUser.id === user?.uid
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-white/5 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-medium text-sm sm:text-base truncate">{topUser.displayName}</div>
                        <div className="text-xs text-gray-400">Niveau {topUser.level}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-yellow-400 font-bold text-sm sm:text-base">{topUser.totalXp}</div>
                      <div className="text-xs text-gray-400">{topUser.badges} badges</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* SÉRIE ET RECORDS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className={`p-2.5 sm:p-3 rounded-xl ${currentStreak >= 7 ? 'bg-orange-600/20' : 'bg-blue-600/20'}`}>
                  <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${currentStreak >= 7 ? 'text-orange-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Série & Records</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Vos performances</p>
                </div>
              </div>

              {/* Série actuelle */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm sm:text-base">Série actuelle</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white">{currentStreak} jours</span>
                    {currentStreak >= 7 && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-lg sm:text-xl"
                      >
                        🔥
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>

              {/* Records */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">Meilleure journée</span>
                  </div>
                  <span className="text-white font-bold text-sm sm:text-base">{xpStats?.bestDay?.xp || 0} XP</span>
                </div>

                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">Plus longue série</span>
                  </div>
                  <span className="text-white font-bold text-sm sm:text-base">{xpStats?.longestStreak || currentStreak} jours</span>
                </div>

                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">Projets créés</span>
                  </div>
                  <span className="text-white font-bold text-sm sm:text-base">{gamification.projectsCreated}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">XP ce mois</span>
                  </div>
                  <span className="text-white font-bold text-sm sm:text-base">{gamification.monthlyXp}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 💰 WIDGET CAGNOTTE D'ÉQUIPE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 bg-purple-600/20 rounded-xl">
                  <span className="text-xl sm:text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Cagnotte d'Équipe</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Niveau {poolStats?.currentLevel || 'BRONZE'}</p>
                </div>
              </div>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/rewards"
                className="px-3 sm:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-purple-300 text-xs sm:text-sm transition-all text-center"
              >
                Récompenses →
              </motion.a>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-white">{poolStats?.totalXP?.toLocaleString() || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">XP Total</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-green-400">+{poolStats?.weeklyContributions || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Semaine</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-blue-400">{poolStats?.contributorsCount || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Contrib.</div>
              </div>
            </div>

            {/* Barre de progression */}
            {poolStats?.nextLevel && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Vers {poolStats.nextLevel}</span>
                  <span>{poolStats.progressToNext?.progress || 0}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${poolStats.progressToNext?.progress || 0}%` }}
                    transition={{ duration: 1 }}
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* 🎯 WIDGET DÉFIS PERSONNELS (MODULE 10) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white/5 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 bg-pink-600/20 rounded-xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Défis d'Équipe</h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {challengeStats?.active || 0} en cours • {challengeStats?.completed || 0} accomplis
                  </p>
                </div>
              </div>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/challenges"
                className="px-3 sm:px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 rounded-xl text-pink-300 text-xs sm:text-sm transition-all text-center"
              >
                Voir tout →
              </motion.a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-blue-400">{challengeStats?.active || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">En cours</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-yellow-400">{challengeStats?.pending || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">En attente</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-green-400">{challengeStats?.completed || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Accomplis</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-2 sm:p-3 text-center border border-white/5">
                <div className="text-lg sm:text-2xl font-bold text-amber-400">+{challengeStats?.totalXpEarned || 0}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">XP Équipe</div>
              </div>
            </div>

            {/* Defis actifs */}
            {activeChallenges?.length > 0 && (
              <div className="mt-4 space-y-2">
                {activeChallenges.slice(0, 2).map(challenge => {
                  const progress = Math.round((challenge.currentValue / challenge.targetValue) * 100);
                  return (
                    <div key={challenge.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg sm:text-xl">{challenge.typeInfo?.emoji || '🎯'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-white truncate">{challenge.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400">{challenge.currentValue}/{challenge.targetValue} {challenge.unit} • +{challenge.xpReward} XP</p>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* 🆕 WIDGET QUOI DE NEUF */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            className="mb-4 sm:mb-6"
          >
            <WhatsNewButton onClick={() => setShowWhatsNew(true)} />
          </motion.div>

          {/* BADGES */}
          {gamification.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Mes Badges
                </h3>
                <span className="bg-purple-600/80 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {gamification.badgeCount} débloqués
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {gamification.badges.slice(-6).map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-2 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5"
                  >
                    <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{badge.icon || '🏆'}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400 truncate">{badge.name}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 sm:mt-4 text-center">
                <a
                  href="/badges"
                  className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Voir tous les badges →
                </a>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Modal Quoi de neuf */}
      <WhatsNewModal
        isOpen={showWhatsNew}
        onClose={() => setShowWhatsNew(false)}
      />
    </Layout>
  );
};

export default Dashboard;
