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
import { calculateLevel, getXPProgress, getRankForLevel } from '../core/services/levelService.js';
import xpHistoryService from '../core/services/xpHistoryService.js';

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

  // Hook pour la cagnotte d'équipe (Module 8)
  const { stats: poolStats, loading: poolLoading } = useTeamPool({
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement de votre aventure...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userRank = getUserRank();
  const topUsers = leaderboard.slice(0, 5);
  const currentStreak = xpStats?.currentStreak || gamification.loginStreak || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">

          {/* EN-TÊTE */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🎮 Mon Aventure
                </h1>
                <p className="text-gray-400">
                  Bienvenue {user?.displayName || 'Aventurier'} ! Suivez votre progression
                </p>
              </div>

              <button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>

          {/* CARTE HÉROS - Niveau et Rang */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-6 mb-8 relative overflow-hidden"
          >
            {/* Effet décoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-center justify-between flex-wrap gap-6">
              {/* Avatar et Rang */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                  {levelInfo?.rank?.icon || '🎮'}
                </div>
                <div>
                  <div className="text-white/80 text-sm font-medium mb-1">
                    {levelInfo?.rank?.name || 'Apprenti'}
                  </div>
                  <div className="text-4xl font-black text-white mb-1">
                    Niveau {gamification.level}
                  </div>
                  <div className="text-white/70 text-sm">
                    {gamification.totalXp.toLocaleString()} XP total
                  </div>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{gamification.badgeCount}</div>
                  <div className="text-white/70 text-sm">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">#{userRank || '?'}</div>
                  <div className="text-white/70 text-sm">Classement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white flex items-center justify-center gap-1">
                    {currentStreak}
                    {currentStreak >= 7 && <Flame className="w-6 h-6 text-orange-300" />}
                  </div>
                  <div className="text-white/70 text-sm">Jours de suite</div>
                </div>
              </div>
            </div>

            {/* Barre de progression niveau */}
            <div className="relative mt-6">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>{gamification.currentLevelXP} XP</span>
                <span>{gamification.nextLevelXP} XP</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.progressPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-center mt-2 text-white/70 text-sm">
                Encore <span className="font-bold text-white">{gamification.xpToNextLevel} XP</span> pour le niveau {gamification.level + 1}
              </div>
            </div>
          </motion.div>

          {/* STATISTIQUES PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">XP Semaine</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{gamification.weeklyXp}</div>
              <div className="text-sm opacity-75">cette semaine</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckSquare className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Quêtes</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{gamification.tasksCompleted}</div>
              <div className="text-sm opacity-75">complétées</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Équipe</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{leaderboard.length}</div>
              <div className="text-sm opacity-75">membres actifs</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Complétion</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{gamification.completionRate}%</div>
              <div className="text-sm opacity-75">taux de succès</div>
            </motion.div>
          </div>

          {/* SECTION PROGRESSION XP (7 jours) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Progression XP - 7 derniers jours</h3>
                <p className="text-sm text-gray-400">Votre activité récente</p>
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
                <div className="flex items-end gap-2 h-32 mb-4">
                  {xpStats.last7Days.map((item, index) => {
                    const maxValue = Math.max(...xpStats.last7Days.map(d => d.xpGained || 0), 1);
                    const percentage = ((item.xpGained || 0) / maxValue) * 100;
                    const isToday = index === xpStats.last7Days.length - 1;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs text-gray-500">{item.xpGained || 0}</span>
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
                        <span className={`text-xs ${isToday ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                          {item.dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Résumé */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{xpStats.weekXP || 0}</div>
                    <div className="text-xs text-gray-500">XP semaine</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{xpStats.dailyAverage || 0}</div>
                    <div className="text-xs text-gray-500">Moyenne/jour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{xpStats.bestDay?.xp || 0}</div>
                    <div className="text-xs text-gray-500">Record</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Commencez à gagner de l'XP pour voir vos statistiques</p>
              </div>
            )}
          </motion.div>

          {/* GRILLE INFÉRIEURE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* TOP PERFORMERS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
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

            {/* SÉRIE ET RECORDS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-lg ${currentStreak >= 7 ? 'bg-orange-600/20' : 'bg-blue-600/20'}`}>
                  <Flame className={`w-6 h-6 ${currentStreak >= 7 ? 'text-orange-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Série & Records</h3>
                  <p className="text-sm text-gray-400">Vos performances</p>
                </div>
              </div>

              {/* Série actuelle */}
              <div className="bg-gray-700/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Série actuelle</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{currentStreak} jours</span>
                    {currentStreak >= 7 && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-xl"
                      >
                        🔥
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>

              {/* Records */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Meilleure journée</span>
                  </div>
                  <span className="text-white font-bold">{xpStats?.bestDay?.xp || 0} XP</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Plus longue série</span>
                  </div>
                  <span className="text-white font-bold">{xpStats?.longestStreak || currentStreak} jours</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Projets créés</span>
                  </div>
                  <span className="text-white font-bold">{gamification.projectsCreated}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">XP ce mois</span>
                  </div>
                  <span className="text-white font-bold">{gamification.monthlyXp}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 💰 WIDGET CAGNOTTE D'ÉQUIPE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/30 rounded-xl">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cagnotte d'Équipe</h3>
                  <p className="text-sm text-gray-400">Niveau {poolStats?.currentLevel || 'BRONZE'}</p>
                </div>
              </div>
              <a
                href="/rewards"
                className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-lg text-purple-300 text-sm transition-all"
              >
                Récompenses →
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{poolStats?.totalXP?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-400">XP Total</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">+{poolStats?.weeklyContributions || 0}</div>
                <div className="text-xs text-gray-400">Cette semaine</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{poolStats?.contributorsCount || 0}</div>
                <div className="text-xs text-gray-400">Contributeurs</div>
              </div>
            </div>

            {/* Barre de progression */}
            {poolStats?.nextLevel && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Vers {poolStats.nextLevel}</span>
                  <span>{poolStats.progressToNext?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
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

          {/* BADGES */}
          {gamification.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  Mes Badges
                </h3>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {gamification.badgeCount} débloqués
                </span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {gamification.badges.slice(-6).map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="text-center p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                    <div className="text-xs text-gray-400">{badge.name}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <a
                  href="/badges"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Voir tous les badges →
                </a>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
