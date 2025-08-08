// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC SYNCHRONISATION XP TEMPS RÉEL - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useDashboardSync } from '../shared/hooks/useDashboardSync.js';
import { 
  BarChart3, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap,
  Star,
  Trophy,
  Flame,
  RefreshCw,
  Activity,
  Calendar,
  Bell,
  ChevronRight,
  Plus
} from 'lucide-react';

/**
 * 🏠 DASHBOARD AVEC SYNCHRONISATION XP TEMPS RÉEL
 * Garantit que les gains d'XP des utilisateurs s'affichent instantanément
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  
  // ✅ HOOK SPÉCIALISÉ POUR SYNCHRONISATION DASHBOARD
  const {
    topUsers,
    userProgress,
    teamStats,
    recentActivities,
    userRank,
    loading,
    error,
    lastUpdate,
    forceSync
  } = useDashboardSync();

  const [viewMode, setViewMode] = useState('overview');
  const [showRefresh, setShowRefresh] = useState(false);

  // Afficher indicateur de rafraîchissement quand les données changent
  useEffect(() => {
    if (lastUpdate) {
      setShowRefresh(true);
      const timer = setTimeout(() => setShowRefresh(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  /**
   * 📊 CALCUL DE LA PROGRESSION XP
   */
  const getXpProgress = () => {
    if (!userProgress) {
      return { current: 0, needed: 100, percentage: 0, xpToNext: 100 };
    }
    
    const level = userProgress.level;
    const totalXp = userProgress.totalXp;
    const currentLevelXp = (level - 1) * 100;
    const nextLevelXp = level * 100;
    const progressXp = totalXp - currentLevelXp;
    const xpToNext = nextLevelXp - totalXp;
    
    return {
      current: Math.max(0, progressXp),
      needed: 100,
      percentage: Math.min(100, Math.max(0, (progressXp / 100) * 100)),
      xpToNext: Math.max(0, xpToNext)
    };
  };

  /**
   * 🎨 COMPOSANT CARTE DE STATISTIQUE
   */
  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm opacity-90">{title}</p>
        {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
      </div>
    </motion.div>
  );

  /**
   * 🏆 COMPOSANT LEADERBOARD MINI
   */
  const MiniLeaderboard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </h3>
        {showRefresh && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 text-sm text-green-600"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            Mis à jour
          </motion.div>
        )}
      </div>
      
      <div className="space-y-3">
        {topUsers.slice(0, 5).map((user, index) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              index === 0 ? 'bg-yellow-100 text-yellow-700' :
              index === 1 ? 'bg-gray-100 text-gray-700' :
              index === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.displayName}</p>
              <p className="text-sm text-gray-500">{user.department}</p>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user.totalXp.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Level {user.level}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {userRank && userRank > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              {userRank}
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Votre position</p>
              <p className="text-sm text-blue-600">{userProgress?.totalXp.toLocaleString()} XP</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  /**
   * 📈 COMPOSANT PROGRESSION UTILISATEUR
   */
  const UserProgressCard = () => {
    const progress = getXpProgress();
    
    return (
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Ma Progression
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold">Level {userProgress?.level || 1}</p>
            <p className="text-sm opacity-90">{userProgress?.totalXp || 0} XP Total</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progression vers Level {(userProgress?.level || 1) + 1}</span>
              <span>{progress.current}/{progress.needed} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white rounded-full h-3 shadow-lg"
              />
            </div>
            <p className="text-sm mt-2 opacity-90">
              {progress.xpToNext} XP pour le prochain niveau
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-sm opacity-90">Cette semaine</p>
              <p className="text-lg font-semibold">{userProgress?.weeklyXp || 0} XP</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Tâches complétées</p>
              <p className="text-lg font-semibold">{userProgress?.tasksCompleted || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 📅 COMPOSANT ACTIVITÉS RÉCENTES
   */
  const RecentActivities = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Activité Récente
        </h3>
        <button
          onClick={forceSync}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>
      
      <div className="space-y-3">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.displayName}
                </p>
                <p className="text-sm text-gray-600">{activity.message}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-8 h-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Synchronisation des données...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-red-400 mb-4">Erreur de synchronisation: {error}</p>
          <button
            onClick={forceSync}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                📊 Dashboard
              </h1>
              <p className="text-gray-400 text-lg">
                Vue d'ensemble - Synchronisation temps réel
              </p>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={forceSync}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques Principales */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Mon Niveau"
            value={`Level ${userProgress?.level || 1}`}
            subtitle={`${userProgress?.totalXp || 0} XP Total`}
            icon={Star}
            color="from-yellow-500 to-orange-500"
            trend={5}
          />
          
          <StatCard
            title="Ma Position"
            value={userRank ? `#${userRank}` : '-'}
            subtitle="Dans le classement"
            icon={Trophy}
            color="from-purple-500 to-pink-500"
          />
          
          <StatCard
            title="Équipe"
            value={teamStats.totalUsers || 0}
            subtitle={`${teamStats.totalXp?.toLocaleString() || 0} XP Total`}
            icon={Users}
            color="from-blue-500 to-cyan-500"
          />
          
          <StatCard
            title="Mes Tâches"
            value={userProgress?.tasksCompleted || 0}
            subtitle="Tâches complétées"
            icon={CheckSquare}
            color="from-green-500 to-emerald-500"
            trend={12}
          />
        </motion.div>

        {/* Contenu Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Gauche - Progression */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <UserProgressCard />
            <RecentActivities />
          </motion.div>
          
          {/* Colonne Droite - Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <MiniLeaderboard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
