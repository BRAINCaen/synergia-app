// ==========================================
// 📁 react-app/src/pages/PersonalStatsPage.jsx
// PAGE STATISTIQUES PERSONNELLES - SYNERGIA v4.0 - MODULE 7
// CONFORME CHARTE GRAPHIQUE SYNERGIA v3.5
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Zap, Trophy, Flame,
  Target, Star, Clock, RefreshCw, Award, Crown, Sparkles, Minus, Download
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { ExportDropdown } from '../components/export/ExportButton.jsx';

// Services
import xpHistoryService from '../core/services/xpHistoryService.js';
import { calculateLevel, getXPProgress, getRankForLevel } from '../core/services/levelService.js';

// Firebase pour données en temps réel
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 📊 PAGE STATISTIQUES PERSONNELLES
 */
const PersonalStatsPage = () => {
  const { user } = useAuthStore();

  // États
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [gamificationData, setGamificationData] = useState({});
  const [viewMode, setViewMode] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGamificationData(data.gamification || {});
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Charger les statistiques XP
  useEffect(() => {
    if (!user?.uid) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        const xpStats = await xpHistoryService.calculateXPStats(user.uid);
        setStats(xpStats);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      }
      setLoading(false);
    };

    loadStats();
  }, [user?.uid]);

  // Rafraîchir les données
  const handleRefresh = async () => {
    if (!user?.uid || refreshing) return;
    setRefreshing(true);
    try {
      const xpStats = await xpHistoryService.calculateXPStats(user.uid);
      setStats(xpStats);
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
    }
    setRefreshing(false);
  };

  // Calculer le niveau et rang
  const levelInfo = useMemo(() => {
    const totalXP = gamificationData?.totalXp || 0;
    const level = calculateLevel(totalXP);
    const progress = getXPProgress(totalXP);
    const rank = getRankForLevel(level);
    return { level, progress, rank, totalXP };
  }, [gamificationData]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    if (!stats) return { week: [], month: [] };
    return {
      week: stats.last7Days || [],
      month: stats.last30Days || []
    };
  }, [stats]);

  // État de chargement
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement des statistiques...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  📈 Mes Statistiques
                </h1>
                <p className="text-gray-400">
                  Suivez votre progression et vos performances
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* 📥 MODULE 17: Export des donnees */}
                <ExportDropdown buttonLabel="Exporter" />

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* XP Total */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">XP Total</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{levelInfo.totalXP.toLocaleString()}</div>
              <div className="text-sm opacity-75">Niveau {levelInfo.level}</div>
            </motion.div>

            {/* XP Semaine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Cette Semaine</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{(stats?.weekXP || 0).toLocaleString()}</div>
              <div className="text-sm opacity-75">Moy. {stats?.dailyAverage || 0}/jour</div>
            </motion.div>

            {/* XP Mois */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Ce Mois</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{(stats?.monthXP || 0).toLocaleString()}</div>
              <div className="text-sm opacity-75">{stats?.activeDays || 0} jours actifs</div>
            </motion.div>

            {/* Rang */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Rang Actuel</h3>
              </div>
              <div className="text-3xl font-bold mb-1">{levelInfo.rank?.icon || '🌱'}</div>
              <div className="text-sm opacity-75">{levelInfo.rank?.name || 'Apprenti'}</div>
            </motion.div>
          </div>

          {/* Section XP Aujourd'hui + Série */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* XP Aujourd'hui */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">XP Aujourd'hui</h3>
                  <p className="text-sm text-gray-400">Objectif journalier : 50 XP</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white">{stats?.todayXP || 0}</span>
                <span className="text-xl text-gray-500">/ 50 XP</span>
              </div>

              {/* Barre de progression */}
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
                <motion.div
                  className={`h-full rounded-full ${
                    (stats?.todayXP || 0) >= 50
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((stats?.todayXP || 0) / 50) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {chartData.week[chartData.week.length - 1]?.eventsCount || 0} actions aujourd'hui
                </span>
                {(stats?.todayXP || 0) >= 50 ? (
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Objectif atteint !
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Encore {50 - (stats?.todayXP || 0)} XP
                  </span>
                )}
              </div>
            </motion.div>

            {/* Série */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  (stats?.currentStreak || 0) >= 7
                    ? 'bg-orange-600/20'
                    : 'bg-blue-600/20'
                }`}>
                  <Flame className={`w-6 h-6 ${
                    (stats?.currentStreak || 0) >= 7
                      ? 'text-orange-400'
                      : 'text-blue-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Série Actuelle</h3>
                  <p className="text-sm text-gray-400">Jours consécutifs d'activité</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white">
                  {stats?.currentStreak || gamificationData?.loginStreak || 0}
                </span>
                <span className="text-xl text-gray-500">
                  jour{(stats?.currentStreak || 0) > 1 ? 's' : ''}
                </span>
                {(stats?.currentStreak || 0) >= 7 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🔥
                  </motion.span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <span className="text-sm text-gray-500">Meilleure série</span>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-400">
                    {stats?.longestStreak || stats?.currentStreak || 0} jours
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Graphique XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Évolution XP</h3>
                  <p className="text-sm text-gray-400">Progression sur les derniers jours</p>
                </div>
              </div>

              {/* Toggle semaine/mois */}
              <div className="flex bg-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  7 jours
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  30 jours
                </button>
              </div>
            </div>

            {/* Graphique barres */}
            {viewMode === 'week' && chartData.week.length > 0 && (
              <div>
                {/* Tendance */}
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const firstHalf = chartData.week.slice(0, 3);
                    const secondHalf = chartData.week.slice(4);
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

                {/* Barres */}
                <div className="flex items-end gap-2 h-40 mb-4">
                  {chartData.week.map((item, index) => {
                    const maxValue = Math.max(...chartData.week.map(d => d.xpGained || 0), 1);
                    const percentage = ((item.xpGained || 0) / maxValue) * 100;
                    const isToday = index === chartData.week.length - 1;

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
              </div>
            )}

            {/* Graphique ligne 30 jours */}
            {viewMode === 'month' && chartData.month.length > 0 && (
              <div className="h-40 relative">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                      <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>

                  {[25, 50, 75].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(75, 85, 99, 0.3)" strokeWidth="0.5" />
                  ))}

                  {(() => {
                    const maxValue = Math.max(...chartData.month.map(d => d.xpGained || 0), 1);
                    const points = chartData.month.map((d, i) => {
                      const x = (i / (chartData.month.length - 1)) * 100;
                      const y = 100 - ((d.xpGained || 0) / maxValue) * 100;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        <motion.polygon
                          points={`0,100 ${points} 100,100`}
                          fill="url(#areaGrad)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                        />
                        <motion.polyline
                          points={points}
                          fill="none"
                          stroke="url(#lineGrad)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5 }}
                        />
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}

            {/* Résumé */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {viewMode === 'week' ? (stats?.weekXP || 0) : (stats?.monthXP || 0)}
                </div>
                <div className="text-xs text-gray-500">XP gagnés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats?.dailyAverage || 0}</div>
                <div className="text-xs text-gray-500">Moyenne/jour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats?.bestDay?.xp || 0}</div>
                <div className="text-xs text-gray-500">Record journée</div>
              </div>
            </div>
          </motion.div>

          {/* Records Personnels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Records Personnels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Meilleure journée */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-600/20 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stats?.bestDay?.xp || 0} XP</div>
                    <div className="text-sm text-gray-400">Meilleure journée</div>
                    <div className="text-xs text-gray-500">
                      {stats?.bestDay?.date ? new Date(stats.bestDay.date).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plus longue série */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Flame className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stats?.longestStreak || 0} jours</div>
                    <div className="text-sm text-gray-400">Plus longue série</div>
                  </div>
                </div>
              </div>

              {/* Total actions */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stats?.totalEvents || 0}</div>
                    <div className="text-sm text-gray-400">Total actions</div>
                  </div>
                </div>
              </div>

              {/* Jours actifs */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stats?.activeDays || 0}</div>
                    <div className="text-sm text-gray-400">Jours actifs</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progression Niveau */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                  {levelInfo.rank?.icon || '🌱'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Niveau {levelInfo.level} - {levelInfo.rank?.name || 'Apprenti'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Progression vers le niveau {levelInfo.level + 1}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {levelInfo.progress?.currentLevelXP || 0} / {levelInfo.progress?.xpForNextLevel || 100}
                </div>
                <div className="text-sm text-gray-500">XP dans ce niveau</div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress?.progressPercent || 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Encore <span className="text-purple-400 font-medium">{levelInfo.progress?.xpToNextLevel || 0} XP</span> pour le niveau suivant
              </span>
              <span className="text-gray-400">
                {levelInfo.totalXP.toLocaleString()} XP total
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default PersonalStatsPage;
