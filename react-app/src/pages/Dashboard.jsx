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

// 🔥 HOOKS ET SERVICES
import { useDashboardSync } from '../shared/hooks/useDashboardSync.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 COMPOSANTS
import StatsCard from '../components/dashboard/StatsCard.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';

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

  // 📊 STATISTIQUES PRINCIPALES
  const mainStats = [
    {
      id: 'total-users',
      title: 'Utilisateurs',
      value: dashboardData?.stats?.totalUsers || 0,
      icon: Users,
      change: 12,
      trend: 'up',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    },
    {
      id: 'active-projects',
      title: 'Projets actifs', 
      value: dashboardData?.stats?.activeProjects || 0,
      icon: Target,
      change: 8,
      trend: 'up',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      id: 'completed-tasks',
      title: 'Tâches terminées',
      value: dashboardData?.stats?.completedTasks || 0,
      icon: Activity,
      change: 23,
      trend: 'up',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      id: 'team-productivity',
      title: 'Productivité',
      value: `${dashboardData?.stats?.productivity || 0}%`,
      icon: TrendingUp,
      change: 5,
      trend: 'up',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    }
  ];

  // 🚫 GESTION D'ERREUR
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Réessayer'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* 🎯 EN-TÊTE DASHBOARD */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenue {user?.firstName || 'Utilisateur'} ! Voici un aperçu de votre activité
            </p>
          </div>
          
          {/* Actions d'en-tête */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
            
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
          </div>
        </div>

        {/* 📊 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => (
            <StatsCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              change={stat.change}
              trend={stat.trend}
              color={stat.color}
              loading={loading}
            />
          ))}
        </div>

        {/* 📈 GRILLE DASHBOARD PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🏆 TOP PERFORMERS */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Top Performers
              </h3>
              <div className="text-sm text-gray-500">Cette semaine</div>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                // Skeleton loading
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : topUsers?.length > 0 ? (
                topUsers.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.xp} XP</div>
                    </div>
                    <div className="text-yellow-500">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune données disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* 📊 ACTIVITÉ RÉCENTE */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Activité récente
              </h3>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            
            <ActivityFeed 
              activities={recentActivities} 
              loading={loading}
              maxItems={8}
            />
          </div>
        </div>

        {/* 🕐 DERNIÈRE MISE À JOUR */}
        {lastUpdate && (
          <div className="text-center text-sm text-gray-500">
            Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
          </div>
        )}
      </div>
    </Layout>
  );
};
};

export default Dashboard;
