// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD SANS ACTIONS RAPIDES ARTIFICIELLES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';

/**
 * 🏠 DASHBOARD PRINCIPAL AVEC SYNCHRONISATION XP GARANTIE
 */
const Dashboard = () => {
  // ✅ DONNÉES XP UNIFIÉES
  const {
    gamificationData,
    level,
    totalXp,
    weeklyXp,
    badges,
    loginStreak,
    levelProgress,
    xpToNextLevel,
    stats,
    loading,
    isReady,
    syncStatus,
    lastUpdate,
    forceSync
  } = useUnifiedXP();

  // États locaux pour l'interface
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [showWelcome, setShowWelcome] = useState(true);

  // Masquer le message de bienvenue après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 📊 DONNÉES SIMULÉES POUR LE DASHBOARD (À remplacer par vraies données)
   */
  const dashboardStats = {
    tasks: {
      total: gamificationData?.tasksCompleted || 0,
      completed: gamificationData?.tasksCompleted || 0,
      pending: Math.max(0, (gamificationData?.tasksCreated || 0) - (gamificationData?.tasksCompleted || 0))
    },
    projects: {
      active: gamificationData?.projectsCreated || 0,
      completed: gamificationData?.projectsCompleted || 0
    },
    team: {
      members: 12,
      active: 8
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'task_completed',
      title: 'Tâche terminée',
      description: 'Révision du code frontend',
      time: '2 min',
      xp: 20,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      id: 2,
      type: 'project_created',
      title: 'Nouveau projet',
      description: 'Système de notifications',
      time: '1h',
      xp: 25,
      icon: FolderOpen,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      type: 'badge_earned',
      title: 'Badge débloqué',
      description: 'Développeur Productif',
      time: '2h',
      xp: 50,
      icon: Award,
      color: 'bg-yellow-500'
    }
  ];

  // ⏳ CHARGEMENT
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Synergia</h2>
          <p className="text-gray-400">Chargement du dashboard...</p>
          {syncStatus && (
            <p className="text-purple-400 text-sm mt-2">
              {syncStatus === 'syncing' ? '⏳ Synchronisation...' : 
               syncStatus === 'synced' ? '✅ Synchronisé' : 
               syncStatus === 'error' ? '❌ Erreur de sync' : syncStatus}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm">Vue d'ensemble de votre activité</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={forceSync}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Synchroniser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <h3 className="text-white font-medium">Bienvenue sur Synergia !</h3>
                <p className="text-gray-300 text-sm">Voici votre tableau de bord personnalisé</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistiques XP principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Niveau & XP */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">Niveau {level}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{totalXp.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">Points d'expérience</p>
            <div className="mt-3 w-full h-2 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-xs mt-1">{xpToNextLevel} XP pour le niveau suivant</p>
          </motion.div>

          {/* Tâches */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">Terminées</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{dashboardStats.tasks.completed}</h3>
            <p className="text-gray-400 text-sm">Tâches complétées</p>
            <p className="text-gray-500 text-xs mt-1">{dashboardStats.tasks.pending} en attente</p>
          </motion.div>

          {/* Projets */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-400 text-sm font-medium">Actifs</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{dashboardStats.projects.active}</h3>
            <p className="text-gray-400 text-sm">Projets en cours</p>
            <p className="text-gray-500 text-xs mt-1">{dashboardStats.projects.completed} terminés</p>
          </motion.div>

          {/* Équipe */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">En ligne</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{dashboardStats.team.active}</h3>
            <p className="text-gray-400 text-sm">Membres actifs</p>
            <p className="text-gray-500 text-xs mt-1">sur {dashboardStats.team.members} total</p>
          </motion.div>
        </div>

        {/* Contenu principal en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progression et badges */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Progression
            </h3>
            
            {/* Streak */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Série de connexions</h4>
                  <p className="text-gray-300 text-sm">{loginStreak} jours consécutifs</p>
                </div>
                <div className="text-orange-400">
                  <Flame className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-white font-medium mb-3">Badges récents</h4>
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 6).map((badge, index) => (
                  <motion.div
                    key={badge.id || index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 p-3 rounded-lg border border-yellow-500/30 text-center"
                  >
                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-white text-xs font-medium truncate">{badge.name || badge.title || 'Badge'}</p>
                  </motion.div>
                ))}
              </div>
              
              {badges.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun badge débloqué pour le moment</p>
                  <p className="text-sm">Continuez à utiliser Synergia !</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Activité récente */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Activité récente
            </h3>
            
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${activity.color}`}>
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{activity.title}</h4>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">+{activity.xp} XP</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Objectif du jour */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Objectif du jour
            </h3>
            <span className="text-purple-400 text-sm">
              {Math.min(weeklyXp, 100)}/100 XP
            </span>
          </div>
          
          <p className="text-gray-300 mb-4">Gagner 100 XP supplémentaires aujourd'hui</p>
          
          <div className="w-full h-3 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyXp / 100) * 100)}%` }}
            ></div>
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <span>Progression journalière</span>
            <span>{Math.round((weeklyXp / 100) * 100)}% complété</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
