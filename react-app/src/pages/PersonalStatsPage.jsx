// ==========================================
// 📁 react-app/src/pages/PersonalStatsPage.jsx
// PAGE STATISTIQUES PERSONNELLES - SYNERGIA v4.0 - MODULE 7
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Calendar, Zap, Trophy, Flame,
  Target, Star, Clock, RefreshCw, ChevronLeft, ChevronRight,
  Award, Crown, Sparkles, Users, Gift, BadgeCheck
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

// Composants de stats Module 7
import {
  XPChart,
  XPLineChart,
  XPSourcesPieChart,
  StatCard,
  RecordCard,
  StreakCard,
  TodayXPCard
} from '../components/stats';

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
  const [viewMode, setViewMode] = useState('week'); // week, month
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des statistiques...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Mes Statistiques
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Suivez votre progression et vos performances
                  </p>
                </div>
              </div>

              {/* Bouton rafraîchir */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </motion.button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Section 1: Stats principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="XP Total"
              value={levelInfo.totalXP}
              subtitle={`Niveau ${levelInfo.level}`}
              icon={Zap}
              color="yellow"
              delay={0}
            />
            <StatCard
              title="XP Cette Semaine"
              value={stats?.weekXP || 0}
              subtitle={`Moyenne: ${stats?.dailyAverage || 0}/jour`}
              icon={TrendingUp}
              color="green"
              trend={stats?.weekXP > (stats?.monthXP / 4) ? 'up' : 'stable'}
              delay={0.1}
            />
            <StatCard
              title="XP Ce Mois"
              value={stats?.monthXP || 0}
              subtitle={`${stats?.activeDays || 0} jours actifs`}
              icon={Calendar}
              color="blue"
              delay={0.2}
            />
            <StatCard
              title="Rang"
              value={levelInfo.rank?.name || 'Apprenti'}
              subtitle={`${levelInfo.rank?.icon || '🌱'} ${levelInfo.progress?.progressPercent || 0}% vers niveau ${levelInfo.level + 1}`}
              icon={Crown}
              color="purple"
              delay={0.3}
            />
          </div>

          {/* Section 2: XP Aujourd'hui + Série */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TodayXPCard
              todayXP={stats?.todayXP || 0}
              dailyGoal={50}
              eventsToday={chartData.week[chartData.week.length - 1]?.eventsCount || 0}
              delay={0.4}
            />
            <StreakCard
              currentStreak={stats?.currentStreak || gamificationData?.loginStreak || 0}
              longestStreak={stats?.longestStreak || stats?.currentStreak || 0}
              delay={0.5}
            />
          </div>

          {/* Section 3: Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Graphique principal XP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-6"
            >
              {/* Toggle week/month */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Évolution XP</h3>
                </div>

                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'week'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    7 jours
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'month'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    30 jours
                  </button>
                </div>
              </div>

              {/* Graphique */}
              <AnimatePresence mode="wait">
                {viewMode === 'week' ? (
                  <motion.div
                    key="week"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <XPChart data={chartData.week} height={160} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="month"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <XPLineChart data={chartData.month} height={160} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Résumé */}
              <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {viewMode === 'week' ? stats?.weekXP || 0 : stats?.monthXP || 0}
                  </div>
                  <div className="text-xs text-gray-500">XP gagnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {stats?.dailyAverage || 0}
                  </div>
                  <div className="text-xs text-gray-500">Moyenne/jour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {stats?.bestDay?.xp || 0}
                  </div>
                  <div className="text-xs text-gray-500">Record journée</div>
                </div>
              </div>
            </motion.div>

            {/* Sources d'XP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Sources d'XP</h3>
              </div>

              <XPSourcesPieChart
                data={stats?.sourceBreakdown || {}}
                size={140}
              />
            </motion.div>
          </div>

          {/* Section 4: Records personnels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Records Personnels</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <RecordCard
                title="Meilleure journée"
                value={`${stats?.bestDay?.xp || 0} XP`}
                date={stats?.bestDay?.date ? new Date(stats.bestDay.date).toLocaleDateString('fr-FR') : 'N/A'}
                icon={Star}
                color="yellow"
                delay={0.1}
              />
              <RecordCard
                title="Plus longue série"
                value={`${stats?.longestStreak || 0} jours`}
                icon={Flame}
                color="purple"
                delay={0.2}
              />
              <RecordCard
                title="Total actions"
                value={stats?.totalEvents || 0}
                icon={Target}
                color="green"
                delay={0.3}
              />
              <RecordCard
                title="Jours actifs"
                value={stats?.activeDays || 0}
                icon={Calendar}
                color="blue"
                delay={0.4}
              />
            </div>
          </motion.div>

          {/* Section 5: Progression vers niveau suivant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
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
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress?.progressPercent || 0}%` }}
                transition={{ duration: 1, delay: 1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow">
                  {levelInfo.progress?.progressPercent || 0}%
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
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
