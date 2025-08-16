// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD ORIGINAL RESTAURÉ AVEC CORRECTIONS DE SÉCURITÉ
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

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM (avec fallback sécurisé)
let PremiumLayout, PremiumCard, StatCard, PremiumButton;
try {
  const premiumComponents = require('../shared/layouts/PremiumLayout.jsx');
  PremiumLayout = premiumComponents.default;
  PremiumCard = premiumComponents.PremiumCard;
  StatCard = premiumComponents.StatCard;
  PremiumButton = premiumComponents.PremiumButton;
} catch (error) {
  console.warn('⚠️ PremiumLayout non disponible, utilisation du fallback');
  // Fallback components
  PremiumLayout = ({ children, title, subtitle }) => (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
  PremiumCard = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
  StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
    </div>
  );
  PremiumButton = ({ children, onClick, icon: Icon, variant = "primary", ...props }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
      }`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}

// 🔥 HOOKS ET SERVICES (avec gestion d'erreur sécurisée)
import { useAuthStore } from '../shared/stores/authStore.js';

// Hook de synchronisation avec fallback
let useDashboardSync;
try {
  useDashboardSync = require('../shared/hooks/useDashboardSync.js').useDashboardSync;
} catch (error) {
  console.warn('⚠️ useDashboardSync non disponible, utilisation du fallback');
  useDashboardSync = () => ({
    dashboardData: { stats: [], activities: [], topUsers: [] },
    isLoading: false,
    error: null,
    lastUpdate: new Date(),
    userStats: { level: 1, totalXp: 0, tasksCompleted: 0 },
    derivedStats: { currentLevel: 1, totalTasks: 0, completionRate: 0 },
    refreshDashboard: async () => {}
  });
}

// 📊 COMPOSANTS (avec fallback sécurisé)
let StatsCard, ActivityFeed, QuickActions;
try {
  StatsCard = require('../components/dashboard/StatsCard.jsx').default;
} catch (error) {
  StatsCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-sm text-green-600">+{trend}%</p>}
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
    </div>
  );
}

try {
  ActivityFeed = require('../components/dashboard/ActivityFeed.jsx').default;
} catch (error) {
  ActivityFeed = ({ activities = [] }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Activités récentes</h3>
      {Array.isArray(activities) && activities.length > 0 ? (
        activities.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.description || 'Activité'}</p>
              <p className="text-xs text-gray-500">{activity.time || 'Maintenant'}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">Aucune activité récente</p>
      )}
    </div>
  );
}

try {
  QuickActions = require('../components/dashboard/QuickActions.jsx').default;
} catch (error) {
  QuickActions = ({ onAddTask, onCreateProject, onViewTeam }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Actions rapides</h3>
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={onAddTask}
          className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Nouvelle tâche</span>
        </button>
        <button
          onClick={onCreateProject}
          className="flex items-center space-x-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Nouveau projet</span>
        </button>
        <button
          onClick={onViewTeam}
          className="flex items-center space-x-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Voir l'équipe</span>
        </button>
      </div>
    </div>
  );
}

const Dashboard = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS DASHBOARD
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  
  // 🔥 HOOK SYNC DASHBOARD (avec gestion d'erreur)
  const {
    dashboardData,
    isLoading,
    error,
    lastUpdate,
    userStats,
    derivedStats,
    refreshDashboard
  } = useDashboardSync();

  // Validation des données avec fallbacks sécurisés
  const safeUserStats = userStats || { level: 1, totalXp: 0, tasksCompleted: 0, projects: 0 };
  const safeDerivedStats = derivedStats || { currentLevel: 1, totalTasks: 0, completionRate: 0, teamPosition: 0 };
  const safeDashboardData = dashboardData || { stats: [], activities: [], topUsers: [], goals: [] };

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
      value: safeUserStats.level, 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "XP Total", 
      value: safeUserStats.totalXp, 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Tâches", 
      value: safeUserStats.tasksCompleted, 
      icon: Target, 
      color: "text-green-400" 
    },
    { 
      label: "Projets", 
      value: safeUserStats.projects || 0, 
      icon: BarChart3, 
      color: "text-purple-400" 
    }
  ];

  // 🎯 ACTIONS RAPIDES
  const quickActions = (
    <div className="flex space-x-3">
      <PremiumButton
        onClick={() => window.location.href = '/tasks'}
        icon={Target}
        variant="secondary"
      >
        Nouvelle tâche
      </PremiumButton>
      <PremiumButton
        onClick={handleRefresh}
        icon={RefreshCw}
        variant="primary"
        disabled={refreshing}
      >
        {refreshing ? 'Actualisation...' : 'Actualiser'}
      </PremiumButton>
    </div>
  );

  // 🔄 État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // ❌ État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout
      title="Dashboard"
      subtitle="Vue d'ensemble de votre progression et activités"
      icon={BarChart3}
      headerActions={quickActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 📊 STATISTIQUES PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Niveau actuel"
          value={safeUserStats.level}
          icon={Award}
          trend={Math.round((safeUserStats.totalXp % 100) / 100 * 100)}
        />
        <StatsCard
          title="XP Total"
          value={safeUserStats.totalXp}
          icon={Zap}
          trend={15}
        />
        <StatsCard
          title="Tâches terminées"
          value={safeUserStats.tasksCompleted}
          icon={Target}
          trend={8}
        />
        <StatsCard
          title="Projets actifs"
          value={safeUserStats.projects || 0}
          icon={BarChart3}
          trend={12}
        />
      </div>

      {/* 📈 CONTENU PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📊 Graphiques et analyses */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progression du niveau */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Progression du niveau</h3>
              <span className="text-sm text-gray-400">Niveau {safeUserStats.level}</span>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    XP Actuel
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {safeUserStats.totalXp % 100}/100
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div 
                  style={{ width: `${(safeUserStats.totalXp % 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                ></div>
              </div>
            </div>
          </PremiumCard>

          {/* Objectifs de la semaine */}
          <PremiumCard>
            <h3 className="text-lg font-semibold text-white mb-4">Objectifs de la semaine</h3>
            {Array.isArray(safeDashboardData.goals) && safeDashboardData.goals.length > 0 ? (
              <div className="space-y-3">
                {safeDashboardData.goals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">{goal.title || `Objectif ${index + 1}`}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {goal.progress || 0}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Aucun objectif défini pour cette semaine</p>
                <button className="mt-3 text-blue-400 hover:text-blue-300 text-sm">
                  Définir des objectifs
                </button>
              </div>
            )}
          </PremiumCard>
        </div>

        {/* 📱 Sidebar droite */}
        <div className="space-y-6">
          
          {/* Activités récentes */}
          <PremiumCard>
            <h3 className="text-lg font-semibold text-white mb-4">Activités récentes</h3>
            <ActivityFeed activities={safeDashboardData.activities || []} />
          </PremiumCard>

          {/* Actions rapides */}
          <PremiumCard>
            <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
            <QuickActions
              onAddTask={() => window.location.href = '/tasks'}
              onCreateProject={() => window.location.href = '/projects'}
              onViewTeam={() => window.location.href = '/team'}
            />
          </PremiumCard>
        </div>
      </div>

      {/* 🏆 TOP UTILISATEURS */}
      {Array.isArray(safeDashboardData.topUsers) && safeDashboardData.topUsers.length > 0 && (
        <PremiumCard className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">🏆 Top utilisateurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safeDashboardData.topUsers.slice(0, 3).map((topUser, index) => (
              <motion.div
                key={topUser.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                  ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-yellow-700 to-yellow-800' :
                    'bg-gradient-to-r from-blue-500 to-blue-600'}
                `}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{topUser.displayName || `Utilisateur ${index + 1}`}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Niv. {topUser.level || 1}</span>
                    <span>•</span>
                    <span>{topUser.totalXp || 0} XP</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
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
              <p>📊 Stats chargées: {safeDashboardData.stats?.length || 0}</p>
              <p>🎯 Objectifs: {safeDashboardData.goals?.length || 0}</p>
              <p>👥 Top users: {safeDashboardData.topUsers?.length || 0}</p>
            </div>
          </details>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

export default Dashboard;
