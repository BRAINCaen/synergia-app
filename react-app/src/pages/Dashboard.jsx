// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC SYNCHRONISATION XP UNIFIÉE
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
    quickActions,
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl animate-pulse flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Chargement du tableau de bord...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation: {syncStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* 🎉 MESSAGE DE BIENVENUE */}
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Bienvenue sur Synergia v3.5 !</h3>
                <p className="text-gray-300 text-sm">
                  Vos données XP sont maintenant synchronisées en temps réel. 
                  Niveau {level} • {totalXp.toLocaleString()} XP total
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* 📊 EN-TÊTE PRINCIPAL */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Tableau de Bord
              </h1>
              <p className="text-gray-400">
                Vue d'ensemble de votre progression et activités
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Dernière synchronisation: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'En cours...'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={forceSync}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="text-sm">Actualiser</span>
              </button>
              
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Synchronisé</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🎯 CARTE GAMIFICATION MISE EN AVANT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Niveau {level}</h2>
                  <p className="text-gray-300">{totalXp.toLocaleString()} XP total</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progression vers niveau {level + 1}</span>
                  <span>{xpToNextLevel} XP restants</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  ></motion.div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">+{weeklyXp} XP cette semaine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">{loginStreak} jours consécutifs</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {badges.slice(0, 3).map((badge, index) => (
                <div 
                  key={index}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center"
                >
                  <span className="text-2xl">{badge.icon || '🏆'}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 📈 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tâches */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">+{stats?.completionRate || 0}%</span>
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

          {/* Productivité */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-orange-400 text-sm font-medium">Score</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats?.productivityScore || 0}</h3>
            <p className="text-gray-400 text-sm">Productivité</p>
            <p className="text-gray-500 text-xs mt-1">sur 100</p>
          </motion.div>
        </div>

        {/* 📊 CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activités Récentes */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Activités Récentes
              </h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
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

          {/* Actions Rapides */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Actions Rapides
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => quickActions.completeTask('medium', 'Tâche rapide')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 rounded-lg transition-all flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Terminer une tâche</p>
                  <p className="text-xs opacity-80">+20 XP</p>
                </div>
              </button>
              
              <button
                onClick={() => quickActions.createProject('Nouveau projet')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-lg transition-all flex items-center gap-3"
              >
                <Plus className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Créer un projet</p>
                  <p className="text-xs opacity-80">+25 XP</p>
                </div>
              </button>
              
              <button
                onClick={() => quickActions.profileUpdate()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-3 rounded-lg transition-all flex items-center gap-3"
              >
                <Award className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Mettre à jour profil</p>
                  <p className="text-xs opacity-80">+10 XP</p>
                </div>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
              <h4 className="text-white font-medium mb-2">🎯 Objectif du jour</h4>
              <p className="text-gray-300 text-sm">Gagner 100 XP supplémentaires</p>
              <div className="mt-2 w-full h-2 bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, (weeklyXp / 100) * 100)}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs mt-1">{Math.min(weeklyXp, 100)}/100 XP</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
