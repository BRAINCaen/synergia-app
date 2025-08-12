// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC VRAIES DONNÉES FIREBASE - HOOKS FONCTIONNELS !
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  Target,
  Star,
  Trophy,
  Zap,
  Calendar,
  Gift,
  ArrowRight,
  Plus,
  Flame,
  Award,
  RefreshCw
} from 'lucide-react';

// ✅ HOOKS FIREBASE FONCTIONNELS - FINI LES DONNÉES MOCK !
import { useGameService } from '../shared/hooks/useGameService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ COMPOSANTS DASHBOARD CRÉÉS
import StatsCard from '../components/dashboard/StatsCard.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';

/**
 * 🏠 DASHBOARD AVEC DONNÉES FIREBASE AUTHENTIQUES
 * Plus aucune donnée de démonstration - Tout vient de Firebase !
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  
  // ✅ HOOKS FIREBASE RÉELS ET FONCTIONNELS
  const { 
    gameData,
    derivedStats,
    isLoading,
    error,
    isConnected,
    calculations,
    addXP,
    completeTask,
    dailyLogin
  } = useGameService(user?.uid);

  // États locaux pour l'interface
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // ✅ DONNÉES RÉELLES CALCULÉES DEPUIS FIREBASE
  const dashboardData = React.useMemo(() => {
    if (!gameData || !derivedStats) {
      return {
        stats: [],
        activities: [],
        goals: [],
        canShowData: false
      };
    }

    // 📊 STATISTIQUES RÉELLES DE L'UTILISATEUR DEPUIS USEgameservice
    const realStats = [
      {
        id: 'xp',
        title: 'Points d\'expérience',
        value: derivedStats.currentXP || 0,
        change: `+${gameData.weeklyXp || 0} cette semaine`,
        trend: 'up',
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        icon: Zap,
        details: `Niveau ${derivedStats.currentLevel || 1}`
      },
      {
        id: 'tasks',
        title: 'Tâches complétées',
        value: derivedStats.tasksCompleted || 0,
        change: `${Math.round((derivedStats.tasksCompleted || 0) / Math.max(1, (gameData.tasksCreated || 1)) * 100)}% de réussite`,
        trend: derivedStats.tasksCompleted > 0 ? 'up' : 'neutral',
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        icon: CheckCircle2,
        details: `${gameData.tasksCreated || 0} créées`
      },
      {
        id: 'projects',
        title: 'Projets en cours',
        value: gameData.projectsJoined || 0,
        change: `${gameData.projectsCreated || 0} créés`,
        trend: gameData.projectsJoined > 0 ? 'up' : 'neutral',
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        icon: FolderOpen,
        details: `${gameData.projectsActive || 0} actifs`
      },
      {
        id: 'badges',
        title: 'Badges débloqués',
        value: derivedStats.totalBadges || 0,
        change: gameData.recentBadges ? `+${gameData.recentBadges.length} récents` : 'Aucun récent',
        trend: derivedStats.totalBadges > 0 ? 'up' : 'neutral',
        color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        icon: Award,
        details: `${Math.max(0, 10 - (derivedStats.totalBadges || 0))} à débloquer`
      }
    ];

    // 📈 ACTIVITÉS RÉCENTES RÉELLES
    const realActivities = [
      ...(gameData.xpHistory || []).slice(-5).map(entry => ({
        id: `xp_${entry.timestamp}`,
        type: 'xp_gain',
        title: entry.reason || 'Gain d\'expérience',
        description: `+${entry.amount} XP`,
        timestamp: entry.timestamp,
        icon: Zap,
        color: 'text-blue-500'
      })),
      ...(gameData.badges || []).slice(-3).map(badge => ({
        id: `badge_${badge.unlockedAt}`,
        type: 'badge_unlock',
        title: 'Nouveau badge débloqué',
        description: badge.name || badge.id,
        timestamp: badge.unlockedAt,
        icon: Award,
        color: 'text-yellow-500'
      })),
      ...(gameData.taskHistory || []).slice(-4).map(task => ({
        id: `task_${task.completedAt}`,
        type: 'task_complete',
        title: 'Tâche complétée',
        description: task.title || 'Tâche sans titre',
        timestamp: task.completedAt,
        icon: CheckCircle2,
        color: 'text-green-500'
      }))
    ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 8);

    // 🎯 OBJECTIFS RÉELS
    const realGoals = [
      {
        id: 'daily_xp',
        title: 'XP quotidien',
        target: 50,
        current: gameData.dailyXp || 0,
        type: 'daily',
        color: 'bg-blue-500'
      },
      {
        id: 'weekly_tasks',
        title: 'Tâches cette semaine',
        target: 10,
        current: gameData.weeklyTasks || 0,
        type: 'weekly',
        color: 'bg-green-500'
      },
      {
        id: 'level_progress',
        title: 'Progression niveau',
        target: 100,
        current: derivedStats.progressPercentage || 0,
        type: 'level',
        color: 'bg-purple-500'
      },
      {
        id: 'login_streak',
        title: 'Jours consécutifs',
        target: 7,
        current: gameData.loginStreak || 0,
        type: 'streak',
        color: 'bg-orange-500'
      }
    ];

    return {
      stats: realStats,
      activities: realActivities,
      goals: realGoals,
      canShowData: true
    };
  }, [gameData, derivedStats]);

  // ✅ GESTION DU RAFRAÎCHISSEMENT
  const handleRefresh = React.useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      // Forcer un login quotidien pour récupérer les données
      await dailyLogin();
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      console.error('Erreur refresh:', error);
      setRefreshing(false);
    }
  }, [refreshing, dailyLogin]);

  // ✅ EFFET DE BIENVENUE
  useEffect(() => {
    if (user && gameData && !showWelcome) {
      const shouldShowWelcome = (derivedStats?.currentLevel || 1) === 1 && (derivedStats?.currentXP || 0) < 50;
      setShowWelcome(shouldShowWelcome);
    }
  }, [user, gameData, derivedStats, showWelcome]);

  // ⏳ ÉTAT DE CHARGEMENT
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  // ❌ ÉTAT D'ERREUR
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // 📱 INTERFACE PRINCIPALE
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎉 BANNIÈRE DE BIENVENUE */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 mb-6"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Bienvenue sur Synergia ! 🎉</h3>
                <p className="text-blue-100 text-sm">Commencez à compléter des tâches pour gagner de l'XP et débloquer des badges !</p>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📊 EN-TÊTE */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord
            </h1>
            <p className="text-gray-600">
              Bonjour {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} ! 
              Voici un aperçu de votre progression.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* 📅 SÉLECTEUR DE PÉRIODE */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>

            {/* 🔄 BOUTON RAFRAÎCHIR */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {/* 📈 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.map((stat) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              color={stat.color}
              details={stat.details}
            />
          ))}
        </div>

        {/* 📋 CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 📊 PROGRESSION */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Progression</h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              
              {/* 🎯 OBJECTIFS */}
              <div className="space-y-4">
                {dashboardData.goals.map((goal) => (
                  <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{goal.title}</span>
                      <span className="text-sm text-gray-600">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${goal.color}`}
                        style={{
                          width: `${Math.min(100, (goal.current / goal.target) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ⚡ ACTIONS RAPIDES */}
          <div>
            <QuickActions 
              onAddXP={addXP}
              onCompleteTask={completeTask}
              onDailyLogin={dailyLogin}
              userLevel={derivedStats?.currentLevel || 1}
              userXP={derivedStats?.currentXP || 0}
            />
          </div>
        </div>

        {/* 📋 ACTIVITÉ RÉCENTE */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Activité récente</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <ActivityFeed 
            activities={dashboardData.activities}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
