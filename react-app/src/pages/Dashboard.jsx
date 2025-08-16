// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC MENU HAMBURGER LAYOUT - VERSION EXACTE
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

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM (pour les composants internes)
import { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES
import { useDashboardSync } from '../shared/hooks/useDashboardSync.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 COMPOSANTS
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';

const Dashboard = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS DASHBOARD
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  
  // 🔥 HOOK SYNC DASHBOARD
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

  // 🔄 FONCTION RAFRAÎCHIR
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

  // 🎮 ACTIONS GAMIFICATION
  const addXP = (amount) => {
    console.log(`🎮 [DASHBOARD] Ajout XP: ${amount}`);
  };

  const completeTask = (taskId) => {
    console.log(`✅ [DASHBOARD] Tâche complétée: ${taskId}`);
  };

  const dailyLogin = () => {
    console.log('🎯 [DASHBOARD] Connexion quotidienne');
  };

  // 📊 STATISTIQUES PRINCIPALES
  const mainStats = [
    {
      id: 'total-users',
      title: 'Utilisateurs Total',
      value: teamStats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      trend: '+12% ce mois'
    },
    {
      id: 'avg-xp',
      title: 'XP Moyen',
      value: teamStats?.averageXp || 0,
      icon: Zap,
      color: 'purple',
      trend: '+8% cette semaine'
    },
    {
      id: 'total-tasks',
      title: 'Tâches Total',
      value: teamStats?.totalTasks || 0,
      icon: Target,
      color: 'green',
      trend: '+15% ce mois'
    },
    {
      id: 'active-badges',
      title: 'Badges Actifs',
      value: teamStats?.activeBadges || 0,
      icon: Award,
      color: 'yellow',
      trend: '+5% cette semaine'
    }
  ];

  // 🎯 OBJECTIFS POUR DEMO
  const demoGoals = [
    {
      id: 'weekly-xp',
      title: 'XP Hebdomadaire',
      current: userProgress?.weeklyXp || 0,
      target: 500,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'monthly-tasks',
      title: 'Tâches Mensuelles',
      current: userProgress?.tasksCompleted || 0,
      target: 20,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'level-progress',
      title: 'Progression de Niveau',
      current: (userProgress?.totalXp || 0) % 100,
      target: 100,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // 🚨 GESTION CHARGEMENT
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-white">Synchronisation des données...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 🚨 GESTION ERREUR
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="max-w-7xl mx-auto">
            <PremiumCard className="text-center py-8">
              <div className="text-red-400 mb-4">
                <Activity className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Erreur de synchronisation</p>
                <p className="text-gray-400 text-sm mt-1">{error}</p>
              </div>
              <PremiumButton variant="primary" onClick={handleRefresh} icon={RefreshCw}>
                Réessayer
              </PremiumButton>
            </PremiumCard>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">

          {/* 📊 STATISTIQUES UTILISATEUR PERSONAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Niveau"
              value={userProgress?.level || 1}
              icon={Award}
              color="blue"
              trend="Niveau actuel"
            />
            <StatCard
              title="XP Total"
              value={userProgress?.totalXp || 0}
              icon={Zap}
              color="purple"
              trend="Points d'expérience"
            />
            <StatCard
              title="Tâches"
              value={userProgress?.tasksCompleted || 0}
              icon={Target}
              color="green"
              trend="Tâches terminées"
            />
            <StatCard
              title="Badges"
              value={userProgress?.badges || 0}
              icon={Award}
              color="yellow"
              trend="Badges obtenus"
            />
          </div>
          
          {/* 📈 STATISTIQUES PRINCIPALES ÉQUIPE */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Statistiques Équipe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mainStats.map((stat) => (
                <StatCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  trend={stat.trend}
                  className="transform hover:scale-105 transition-all duration-300"
                />
              ))}
            </div>
          </div>

          {/* 📋 CONTENU PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 📊 PROGRESSION */}
            <div className="lg:col-span-2">
              <PremiumCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Progression</h2>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                
                {/* 🎯 OBJECTIFS */}
                <div className="space-y-4">
                  {demoGoals.map((goal) => (
                    <motion.div 
                      key={goal.id} 
                      className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{goal.title}</span>
                        <span className="text-sm text-gray-300">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <motion.div
                          className={`h-3 rounded-full bg-gradient-to-r ${goal.color}`}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (goal.current / goal.target) * 100)}%`
                          }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </div>

            {/* ⚡ ACTIONS RAPIDES */}
            <div>
              <PremiumCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Actions Rapides</h3>
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                
                <QuickActions 
                  onAddXP={addXP}
                  onCompleteTask={completeTask}
                  onDailyLogin={dailyLogin}
                  userLevel={userProgress?.level || 1}
                  userXP={userProgress?.totalXp || 0}
                />
              </PremiumCard>
            </div>
          </div>

          {/* 📋 ACTIVITÉ RÉCENTE */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Activité récente</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            
            <ActivityFeed 
              activities={recentActivities || []}
              loading={loading}
            />
          </PremiumCard>

          {/* 👥 TOP UTILISATEURS */}
          {topUsers && topUsers.length > 0 && (
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Top Équipe</h2>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topUsers.slice(0, 6).map((topUser, index) => (
                  <motion.div
                    key={topUser.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50 hover:bg-gray-700/70 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-yellow-700 to-yellow-800' :
                          'bg-gradient-to-r from-blue-500 to-blue-600'}
                      `}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{topUser.displayName}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>Niv. {topUser.level}</span>
                          <span>•</span>
                          <span>{topUser.totalXp} XP</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </PremiumCard>
          )}

          {/* 📊 INFORMATIONS DE DEBUG (en développement) */}
          {process.env.NODE_ENV === 'development' && (
            <PremiumCard className="border-yellow-500/50">
              <details className="text-sm">
                <summary className="text-yellow-400 cursor-pointer font-medium mb-2">
                  🔍 Informations de Debug
                </summary>
                <div className="text-gray-300 space-y-1">
                  <p>🆔 Utilisateur: {user?.uid}</p>
                  <p>📧 Email: {user?.email}</p>
                  <p>🕒 Dernière sync: {lastUpdate?.toLocaleTimeString('fr-FR')}</p>
                  <p>📊 Stats principales: {mainStats?.length || 0}</p>
                  <p>🎯 Objectifs: {demoGoals?.length || 0}</p>
                  <p>👥 Top users: {topUsers?.length || 0}</p>
                  <p>📈 User Progress: {JSON.stringify(userProgress, null, 2)}</p>
                </div>
              </details>
            </PremiumCard>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
