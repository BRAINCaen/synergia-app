// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC DESIGN PREMIUM HARMONISÉ
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

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (conservés)
import { useDashboardSync } from '../shared/hooks/useDashboardSync.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 COMPOSANTS (conservés)
import StatsCard from '../components/dashboard/StatsCard.jsx';
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
    isLoading,
    error,
    lastUpdate,
    userStats,
    derivedStats,
    refreshDashboard
  } = useDashboardSync();

  // 🔄 FONCTION RAFRAÎCHIR
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await refreshDashboard();
      console.log('✅ [DASHBOARD] Actualisation réussie');
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur actualisation:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshDashboard, refreshing]);

  // 🎮 ACTIONS GAMIFICATION (conservées)
  const addXP = (amount) => {
    console.log(`🎮 [DASHBOARD] Ajout XP: ${amount}`);
  };

  const completeTask = (taskId) => {
    console.log(`✅ [DASHBOARD] Tâche complétée: ${taskId}`);
  };

  const dailyLogin = () => {
    console.log('🎯 [DASHBOARD] Connexion quotidienne');
  };

  // 📊 STATISTIQUES POUR HEADER PREMIUM
  const headerStats = [
    { 
      label: "Niveau", 
      value: derivedStats?.currentLevel || 1, 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "XP Total", 
      value: derivedStats?.totalXP || 0, 
      icon: Zap, 
      color: "text-purple-400" 
    },
    { 
      label: "Tâches", 
      value: userStats?.tasksCompleted || 0, 
      icon: Target, 
      color: "text-green-400" 
    },
    { 
      label: "Rang", 
      value: dashboardData?.userRank || '-', 
      icon: TrendingUp, 
      color: "text-yellow-400" 
    }
  ];

  // 🎯 ACTIONS HEADER PREMIUM
  const headerActions = (
    <>
      {/* 📅 SÉLECTEUR DE PÉRIODE */}
      <select
        value={selectedTimeRange}
        onChange={(e) => setSelectedTimeRange(e.target.value)}
        className="px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="day">Aujourd'hui</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
        <option value="year">Cette année</option>
      </select>

      {/* 🔄 BOUTON RAFRAÎCHIR PREMIUM */}
      <PremiumButton
        variant="secondary"
        icon={RefreshCw}
        loading={refreshing}
        onClick={handleRefresh}
      >
        {refreshing ? 'Actualisation...' : 'Actualiser'}
      </PremiumButton>
    </>
  );

  // 🚨 GESTION CHARGEMENT
  if (isLoading) {
    return (
      <PremiumLayout
        title="Dashboard"
        subtitle="Chargement de vos données..."
        icon={BarChart3}
      >
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
      </PremiumLayout>
    );
  }

  // 🚨 GESTION ERREUR
  if (error) {
    return (
      <PremiumLayout
        title="Dashboard"
        subtitle="Erreur de chargement"
        icon={BarChart3}
      >
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
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Dashboard"
      subtitle="Voici un aperçu de votre progression."
      icon={BarChart3}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 📈 STATISTIQUES PRINCIPALES PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardData.stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color === 'text-blue-600' ? 'blue' : 
                   stat.color === 'text-green-600' ? 'green' :
                   stat.color === 'text-purple-600' ? 'purple' : 'yellow'}
            trend={stat.change}
            className="transform hover:scale-105 transition-all duration-300"
          />
        ))}
      </div>

      {/* 📋 CONTENU PRINCIPAL PREMIUM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* 📊 PROGRESSION PREMIUM */}
        <div className="lg:col-span-2">
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Progression</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            {/* 🎯 OBJECTIFS PREMIUM */}
            <div className="space-y-4">
              {dashboardData.goals.map((goal) => (
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
                      className={`h-3 rounded-full bg-gradient-to-r ${
                        goal.color === 'bg-blue-500' ? 'from-blue-500 to-blue-600' :
                        goal.color === 'bg-green-500' ? 'from-green-500 to-green-600' :
                        goal.color === 'bg-purple-500' ? 'from-purple-500 to-purple-600' :
                        'from-yellow-500 to-yellow-600'
                      }`}
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

        {/* ⚡ ACTIONS RAPIDES PREMIUM */}
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
              userLevel={derivedStats?.currentLevel || 1}
              userXP={derivedStats?.currentXP || 0}
            />
          </PremiumCard>
        </div>
      </div>

      {/* 📋 ACTIVITÉ RÉCENTE PREMIUM */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Activité récente</h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        
        <ActivityFeed 
          activities={dashboardData.activities}
          loading={isLoading}
        />
      </PremiumCard>

      {/* 👥 TOP UTILISATEURS PREMIUM */}
      {dashboardData.topUsers && dashboardData.topUsers.length > 0 && (
        <PremiumCard className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Top Équipe</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.topUsers.slice(0, 6).map((topUser, index) => (
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
        <PremiumCard className="mt-8 border-yellow-500/50">
          <details className="text-sm">
            <summary className="text-yellow-400 cursor-pointer font-medium mb-2">
              🔍 Informations de Debug
            </summary>
            <div className="text-gray-300 space-y-1">
              <p>🆔 Utilisateur: {user?.uid}</p>
              <p>📧 Email: {user?.email}</p>
              <p>🕒 Dernière sync: {lastUpdate?.toLocaleTimeString('fr-FR')}</p>
              <p>📊 Stats chargées: {dashboardData.stats?.length || 0}</p>
              <p>🎯 Objectifs: {dashboardData.goals?.length || 0}</p>
              <p>👥 Top users: {dashboardData.topUsers?.length || 0}</p>
            </div>
          </details>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

export default Dashboard;
