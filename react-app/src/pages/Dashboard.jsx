// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC VRAIES DONNÉES FIREBASE - PLUS DE MOCK !
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

// ✅ HOOKS FIREBASE RÉELS - FINI LES DONNÉES MOCK !
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Composants
import StatsCard from '../components/dashboard/StatsCard.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';

/**
 * 🏠 DASHBOARD AVEC DONNÉES FIREBASE AUTHENTIQUES
 * Plus aucune donnée de démonstration - Tout vient de Firebase !
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES FIREBASE RÉELLES - SOURCE UNIQUE DE VÉRITÉ
  const { 
    userData, 
    gamification, 
    teamStats, 
    systemStats, 
    badgeStats,
    isLoading, 
    isReady, 
    error,
    actions 
  } = useUnifiedFirebaseData();

  // États locaux pour l'interface
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // ✅ DONNÉES RÉELLES CALCULÉES DEPUIS FIREBASE
  const dashboardData = React.useMemo(() => {
    if (!userData || !gamification) {
      return {
        stats: [],
        activities: [],
        goals: [],
        canShowData: false
      };
    }

    // 📊 STATISTIQUES RÉELLES DE L'UTILISATEUR
    const realStats = [
      {
        id: 'xp',
        title: 'Points d\'expérience',
        value: gamification.totalXp || 0,
        change: `+${gamification.weeklyXp || 0} cette semaine`,
        trend: 'up',
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        icon: Zap,
        details: `Niveau ${gamification.level || 1}`
      },
      {
        id: 'tasks',
        title: 'Tâches complétées',
        value: gamification.tasksCompleted || 0,
        change: `${Math.round((gamification.tasksCompleted || 0) / Math.max(1, (gamification.tasksCreated || 1)) * 100)}% de réussite`,
        trend: gamification.tasksCompleted > 0 ? 'up' : 'neutral',
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        icon: CheckCircle2,
        details: `${gamification.tasksCreated || 0} créées`
      },
      {
        id: 'projects',
        title: 'Projets en cours',
        value: gamification.projectsJoined || 0,
        change: `${gamification.projectsCreated || 0} créés`,
        trend: gamification.projectsJoined > 0 ? 'up' : 'neutral',
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        icon: Target,
        details: 'Actifs'
      },
      {
        id: 'team',
        title: 'Membres actifs',
        value: teamStats.activeMembers || 1,
        change: `${teamStats.totalMembers || 1} au total`,
        trend: teamStats.activeMembers > 1 ? 'up' : 'neutral',
        color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
        icon: Users,
        details: 'Équipe'
      }
    ];

    // 📈 ACTIVITÉS RÉELLES DEPUIS L'HISTORIQUE XP
    const realActivities = (gamification.xpHistory || [])
      .slice(-5)
      .reverse()
      .map(entry => ({
        id: entry.timestamp || Date.now(),
        type: entry.type || 'xp',
        title: entry.description || `+${entry.amount} XP`,
        description: entry.source || 'Activité',
        time: entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Récent',
        xp: entry.amount || 0,
        icon: entry.type === 'task_completed' ? CheckCircle2 : 
              entry.type === 'badge_unlocked' ? Trophy :
              entry.type === 'login_bonus' ? Star : Zap
      }));

    // 🎯 OBJECTIFS RÉELS BASÉS SUR LA PROGRESSION
    const realGoals = [
      {
        id: 'weekly_xp',
        title: 'XP Hebdomadaire',
        current: gamification.weeklyXp || 0,
        target: 200,
        description: 'Objectif de la semaine',
        color: 'from-blue-500 to-purple-500',
        icon: Zap
      },
      {
        id: 'tasks_streak',
        title: 'Série de connexions',
        current: gamification.loginStreak || 0,
        target: 7,
        description: 'Jours consécutifs',
        color: 'from-orange-500 to-red-500',
        icon: Flame
      },
      {
        id: 'level_progress',
        title: 'Progression niveau',
        current: gamification.currentLevelXp || 0,
        target: gamification.nextLevelXpRequired || 100,
        description: `Vers le niveau ${(gamification.level || 1) + 1}`,
        color: 'from-green-500 to-emerald-500',
        icon: Trophy
      }
    ];

    return {
      stats: realStats,
      activities: realActivities,
      goals: realGoals,
      canShowData: true
    };
  }, [userData, gamification, teamStats]);

  // ✅ DÉTECTION PREMIER UTILISATEUR
  useEffect(() => {
    if (isReady && gamification) {
      const isNewUser = (
        gamification.totalXp === 0 && 
        gamification.tasksCompleted === 0 &&
        !gamification.lastLoginDate
      );
      
      setShowWelcome(isNewUser);
      
      // Mettre à jour la date de dernière connexion
      if (isNewUser) {
        actions.updateLoginStreak();
      }
    }
  }, [isReady, gamification, actions]);

  // 🔄 FONCTION DE RAFRAÎCHISSEMENT
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.forceSync();
      console.log('✅ Données dashboard rafraîchies');
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 🔄 AFFICHAGE PENDANT LE CHARGEMENT
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de Synergia</h2>
          <p className="text-gray-400">Synchronisation de vos données Firebase...</p>
        </motion.div>
      </div>
    );
  }

  // ❌ AFFICHAGE EN CAS D'ERREUR
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md mx-4 text-center"
        >
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Erreur de synchronisation</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* 🎉 MESSAGE DE BIENVENUE NOUVEAUX UTILISATEURS */}
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="text-white text-xl font-bold">Bienvenue dans Synergia !</h3>
                <p className="text-gray-300">Commencez par créer votre première tâche pour gagner vos premiers XP.</p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="ml-auto text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* 📋 EN-TÊTE AVEC DONNÉES UTILISATEUR RÉELLES */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Bonjour, {userData?.profile?.displayName || user?.displayName || 'Utilisateur'} !
            </h1>
            <p className="text-gray-400 text-lg">
              Niveau {gamification?.level || 1} • {gamification?.totalXp || 0} XP Total
              {gamification?.loginStreak > 1 && (
                <span className="text-orange-400 ml-2">
                  🔥 {gamification.loginStreak} jours de suite
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Sync...' : 'Actualiser'}
            </button>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </motion.div>

        {/* 📊 STATISTIQUES RÉELLES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardData.stats.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </motion.div>

        {/* 📈 CONTENU PRINCIPAL AVEC DONNÉES RÉELLES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🎯 OBJECTIFS ET PROGRESSION RÉELS */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Objectifs de progression réels */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl font-semibold">Vos objectifs</h3>
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              
              <div className="space-y-4">
                {dashboardData.goals.map((goal) => {
                  const progress = Math.min((goal.current / goal.target) * 100, 100);
                  const Icon = goal.icon;
                  
                  return (
                    <div key={goal.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-r ${goal.color} rounded-lg`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{goal.title}</h4>
                            <p className="text-gray-400 text-sm">{goal.description}</p>
                          </div>
                        </div>
                        <span className="text-white font-semibold">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-2 bg-gradient-to-r ${goal.color} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions rapides */}
            <QuickActions />
          </motion.div>

          {/* 📈 SIDEBAR AVEC ACTIVITÉS RÉELLES */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Activité récente réelle */}
            <ActivityFeed activities={dashboardData.activities} />

            {/* Badges récents réels */}
            {badgeStats && badgeStats.recentBadges.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Badges récents</h3>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                
                <div className="space-y-3">
                  {badgeStats.recentBadges.slice(0, 3).map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{badge.name}</p>
                        <p className="text-gray-400 text-xs">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Progression niveau réelle */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Progression</h3>
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  Niveau {gamification?.level || 1}
                </div>
                <div className="text-gray-400 text-sm mb-4">
                  {gamification?.currentLevelXp || 0} / {gamification?.nextLevelXpRequired || 100} XP
                </div>
                
                <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(((gamification?.currentLevelXp || 0) / (gamification?.nextLevelXpRequired || 100)) * 100, 100)}%` 
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
                
                <p className="text-gray-400 text-sm">
                  {Math.max(0, (gamification?.nextLevelXpRequired || 100) - (gamification?.currentLevelXp || 0))} XP pour le niveau suivant
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
