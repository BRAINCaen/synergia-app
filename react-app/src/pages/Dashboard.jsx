// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD ORIGINAL QUI FONCTIONNAIT - SANS QUICKACTIONS
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  RefreshCw, 
  Clock, 
  Activity,
  Award,
  Zap,
  ChevronRight
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (ORIGINAL)
import Layout from '../components/layout/Layout.jsx';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM (pour les composants internes)
import { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (ORIGINAUX)
import { useDashboardSync } from '../shared/hooks/useDashboardSync.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 COMPOSANTS (ORIGINAUX)
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';

const Dashboard = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS DASHBOARD
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  
  // 🔥 HOOK SYNC DASHBOARD (ORIGINAL)
  const {
    dashboardData,
    loading,
    error,
    lastUpdate,
    forceSync,
    topUsers,
    userProgress,
    teamStats,
    recentActivities
  } = useDashboardSync();

  // 🔄 FONCTION RAFRAÎCHIR (ORIGINALE)
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await forceSync();
      console.log('✅ [DASHBOARD] Actualisation réussie');
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur actualisation:', error);
    } finally {
      setRefreshing(false);
    }
  }, [forceSync, refreshing]);

  // 🎮 ACTIONS GAMIFICATION (ORIGINALES)
  const addXP = (amount) => {
    console.log(`🎮 [DASHBOARD] Ajout XP: ${amount}`);
  };

  const completeTask = (taskId) => {
    console.log(`✅ [DASHBOARD] Tâche complétée: ${taskId}`);
  };

  const dailyLogin = () => {
    console.log('🎯 [DASHBOARD] Connexion quotidienne');
  };

  // 📊 STATISTIQUES PRINCIPALES (ORIGINALES)
  const mainStats = [
    {
      id: 'total-users',
      title: 'Utilisateurs',
      value: dashboardData?.stats?.totalUsers || 0,
      icon: Users,
      change: 12,
      trend: 'up',
      color: 'blue'
    },
    {
      id: 'active-projects',
      title: 'Projets actifs',
      value: dashboardData?.stats?.activeProjects || 0,
      icon: Target,
      change: 8,
      trend: 'up',
      color: 'green'
    },
    {
      id: 'completed-tasks',
      title: 'Tâches terminées',
      value: dashboardData?.stats?.completedTasks || 0,
      icon: Activity,
      change: 23,
      trend: 'up',
      color: 'purple'
    },
    {
      id: 'team-productivity',
      title: 'Productivité',
      value: `${dashboardData?.stats?.productivity || 0}%`,
      icon: TrendingUp,
      change: 5,
      trend: 'up',
      color: 'orange'
    }
  ];

  // 🎮 STATISTIQUES GAMIFICATION (ORIGINALES)
  const gamificationStats = [
    {
      id: 'total-xp',
      title: 'XP Total',
      value: userProgress?.totalXP || 0,
      icon: Award,
      description: 'Points d\'expérience'
    },
    {
      id: 'current-level',
      title: 'Niveau',
      value: userProgress?.level || 1,
      icon: Zap,
      description: 'Niveau actuel'
    },
    {
      id: 'badges-earned',
      title: 'Badges',
      value: userProgress?.badgesCount || 0,
      icon: Award,
      description: 'Badges débloqués'
    }
  ];

  // 🔥 DONNÉES EN TEMPS RÉEL (ORIGINALES)
  useEffect(() => {
    // Simulation de rechargement périodique
    const interval = setInterval(() => {
      if (!loading) {
        console.log('🔄 [DASHBOARD] Actualisation automatique des données');
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [loading]);

  // 🚫 GESTION D'ERREUR (ORIGINALE)
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur de chargement</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <PremiumButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? 'Actualisation...' : 'Réessayer'}
            </PremiumButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* 🎯 EN-TÊTE DASHBOARD (ORIGINAL) */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg mt-2">
              Bienvenue {user?.firstName || 'Utilisateur'} ! Voici un aperçu de votre activité
            </p>
          </div>
          
          {/* Actions d'en-tête (ORIGINALES) */}
          <div className="flex items-center gap-4">
            <PremiumButton
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </PremiumButton>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>

        {/* 📊 STATISTIQUES PRINCIPALES (ORIGINALES) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                trend={stat.trend}
                color={stat.color}
                loading={loading}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 🎮 SECTION GAMIFICATION (ORIGINALE) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">Progression</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gamificationStats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center p-4 bg-gray-700/30 rounded-lg"
                >
                  <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {stat.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* 📈 GRILLE DASHBOARD PRINCIPAL (ORIGINALE) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🏆 TOP PERFORMERS (ORIGINAL) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PremiumCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Top Performers
                </h3>
                <div className="text-sm text-gray-400">Cette semaine</div>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  // Skeleton loading
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : topUsers?.length > 0 ? (
                  topUsers.slice(0, 5).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/40 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.xp} XP</div>
                      </div>
                      <div className="text-yellow-400">
                        <Award className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune données disponible</p>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* 📊 ACTIVITÉ RÉCENTE (ORIGINALE) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <PremiumCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Activité récente
                </h3>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              
              <ActivityFeed 
                activities={recentActivities} 
                loading={loading}
                maxItems={8}
              />
            </PremiumCard>
          </motion.div>
        </div>

        {/* 📈 GRAPHIQUES ET ANALYTICS (ORIGINAUX) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Aperçu Analytics
              </h3>
              <PremiumButton 
                onClick={() => window.location.href = '/analytics'}
                className="text-sm"
              >
                Voir tout
              </PremiumButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {teamStats?.productivity || 0}%
                </div>
                <div className="text-sm text-gray-400">Productivité équipe</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {teamStats?.completionRate || 0}%
                </div>
                <div className="text-sm text-gray-400">Taux de complétion</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {teamStats?.satisfaction || 0}%
                </div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* 🕐 DERNIÈRE MISE À JOUR (ORIGINALE) */}
        {lastUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm text-gray-500"
          >
            Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
