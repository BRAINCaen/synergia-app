// ==========================================
// 📁 src/views/Dashboard.js
// DASHBOARD AVEC DESIGN PREMIUM HARMONISÉ COMPLET
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

  // 📊 STATISTIQUES PRINCIPALES AVEC NOUVEAU DESIGN
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
      value: `${dashboardData?.stats?.teamProductivity || 0}%`,
      icon: Award,
      change: 5,
      trend: 'up',
      color: 'orange'
    }
  ];

  // 🎯 ACTIONS DU HEADER
  const headerActions = (
    <PremiumButton
      variant="secondary"
      icon={RefreshCw}
      onClick={handleRefresh}
      disabled={refreshing}
      className={refreshing ? 'animate-spin' : ''}
    >
      {refreshing ? 'Actualisation...' : 'Actualiser'}
    </PremiumButton>
  );

  // 🔄 ÉTAT DE CHARGEMENT
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <div className="flex items-center justify-center h-64">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">Chargement du tableau de bord...</p>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // ❌ ÉTAT D'ERREUR
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <PremiumCard className="max-w-md mx-auto mt-20">
            <div className="text-center py-8">
              <div className="text-red-400 text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-white mb-2">Erreur de chargement</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <PremiumButton variant="primary" onClick={handleRefresh}>
                Réessayer
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        
        {/* 🎯 HEADER AVEC DESIGN PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Tableau de bord
              </h1>
              <p className="text-gray-400 text-lg">
                Aperçu de votre activité et performances
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {headerActions}
            </div>
          </div>
        </motion.div>

        {/* 📊 STATISTIQUES PRINCIPALES AVEC NOUVEAU DESIGN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {mainStats.map((stat, index) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
              trend={stat.trend}
              className="hover:scale-[1.02] transition-transform duration-300"
            />
          ))}
        </motion.div>

        {/* 📈 CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🎯 COLONNE PRINCIPALE */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 📊 GRAPHIQUE DE PERFORMANCE */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PremiumCard>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Performance globale</h3>
                      <p className="text-sm text-gray-400">Évolution des métriques clés</p>
                    </div>
                  </div>
                  
                  {/* Sélecteur de période */}
                  <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                    {['day', 'week', 'month'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedTimeRange(period)}
                        className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                          selectedTimeRange === period
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : 'Mois'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone graphique stylisée */}
                <div className="h-64 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/50 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-400">Graphique de performance</p>
                    <p className="text-sm text-gray-500">Intégration en cours...</p>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* 🎯 ACTIVITÉ RÉCENTE */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PremiumCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Activité récente</h3>
                    <p className="text-sm text-gray-400">Dernières actions effectuées</p>
                  </div>
                </div>

                {/* Feed d'activité */}
                <ActivityFeed activities={recentActivities} />
              </PremiumCard>
            </motion.div>
          </div>

          {/* 🏆 COLONNE SIDEBAR */}
          <div className="space-y-8">
            
            {/* 👑 TOP PERFORMERS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PremiumCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Top Performers</h3>
                    <p className="text-sm text-gray-400">Meilleurs contributeurs</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {topUsers && topUsers.length > 0 ? (
                    topUsers.slice(0, 5).map((topUser, index) => (
                      <motion.div
                        key={topUser.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{topUser.displayName}</p>
                            <p className="text-gray-400 text-xs">{topUser.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 font-semibold text-sm">{topUser.totalXp} XP</p>
                          <p className="text-gray-500 text-xs">Niveau {topUser.level}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun utilisateur</p>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>

            {/* 📊 PROGRESSION UTILISATEUR */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <PremiumCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Votre progression</h3>
                    <p className="text-sm text-gray-400">Statistiques personnelles</p>
                  </div>
                </div>

                {userProgress ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {userProgress.totalXp || 0}
                      </div>
                      <div className="text-sm text-gray-400">XP Total</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                        <div className="text-lg font-bold text-green-400 mb-1">
                          {userProgress.tasksCompleted || 0}
                        </div>
                        <div className="text-xs text-gray-400">Tâches</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                        <div className="text-lg font-bold text-purple-400 mb-1">
                          {userProgress.badges || 0}
                        </div>
                        <div className="text-xs text-gray-400">Badges</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Progression en cours...</p>
                  </div>
                )}
              </PremiumCard>
            </motion.div>

            {/* 📈 STATISTIQUES ÉQUIPE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <PremiumCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Équipe</h3>
                    <p className="text-sm text-gray-400">Performances collectives</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
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
          </div>
        </div>

        {/* 🕐 DERNIÈRE MISE À JOUR */}
        {lastUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm text-gray-500 mt-8"
          >
            Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
