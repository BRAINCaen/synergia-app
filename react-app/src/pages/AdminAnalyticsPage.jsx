// ==========================================
// 📁 react-app/src/pages/AdminAnalyticsPage.jsx
// PAGE ANALYTICS ADMINISTRATION COMPLÈTE - VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Trophy, Star, Target,
  Calendar, Download, RefreshCw, Filter, Eye, Award, CheckCircle,
  Clock, Zap, Activity, PieChart, LineChart, ArrowUp, ArrowDown,
  UserPlus, UserCheck, UserX, Shield, Flame, AlertCircle, Info,
  BookOpen, Briefcase, Heart, ThumbsUp, Settings, Package, MessageSquare
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// Firebase
import { 
  collection, getDocs, query, where, orderBy, limit, onSnapshot,
  doc, getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    max-width: 400px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

/**
 * 📊 PAGE ANALYTICS ADMINISTRATION COMPLÈTE
 */
const AdminAnalyticsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux avec VRAIES données
  const [analytics, setAnalytics] = useState({
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      newToday: 0,
      newThisWeek: 0,
      newThisMonth: 0,
      retention: 0,
      byRole: {},
      list: []
    },
    tasks: {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      inReview: 0,
      cancelled: 0,
      completionRate: 0,
      averageXp: 0,
      totalXpAwarded: 0,
      byUser: [],
      byProject: [],
      byPriority: {},
      byStatus: {}
    },
    badges: {
      total: 0,
      awarded: 0,
      byUser: [],
      byRarity: {},
      popular: [],
      recent: []
    },
    projects: {
      total: 0,
      active: 0,
      completed: 0,
      paused: 0,
      completionRate: 0,
      list: []
    },
    activity: {
      lastUpdated: new Date(),
      recentActions: [],
      dailyStats: []
    },
    gamification: {
      totalXpSystem: 0,
      averageLevel: 0,
      topPerformers: [],
      levelDistribution: {}
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // today, week, month, all
  const [activeSection, setActiveSection] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    usersOnline: 0,
    activeNow: []
  });

  /**
   * 📊 CHARGER TOUTES LES DONNÉES RÉELLES DE FIREBASE
   */
  const loadCompleteAnalytics = async () => {
    try {
      setLoading(true);
      console.log('📊 [ANALYTICS] Chargement COMPLET des données Firebase...');
      
      // Calculer les timestamps pour les filtres temporels
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // ==========================================
      // 👥 ANALYSE COMPLÈTE DES UTILISATEURS
      // ==========================================
      console.log('👥 Analyse des utilisateurs...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let totalUsers = 0;
      let activeUsers = 0;
      let inactiveUsers = 0;
      let newToday = 0;
      let newThisWeek = 0;
      let newThisMonth = 0;
      const roleDistribution = {};
      const usersList = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        const createdAt = userData.createdAt?.toDate?.() || new Date();
        const lastActivity = userData.lastActivity?.toDate?.() || null;
        
        totalUsers++;
        
        // Statut d'activité
        if (userData.status === 'active' || !userData.status) {
          activeUsers++;
        } else {
          inactiveUsers++;
        }
        
        // Nouveaux utilisateurs
        if (createdAt >= todayStart) newToday++;
        if (createdAt >= weekAgo) newThisWeek++;
        if (createdAt >= monthAgo) newThisMonth++;
        
        // Distribution des rôles Synergia
        const userRoles = userData.synergiaRoles || [];
        userRoles.forEach(role => {
          const roleId = role.roleId || role;
          if (!roleDistribution[roleId]) {
            roleDistribution[roleId] = { count: 0, users: [] };
          }
          roleDistribution[roleId].count++;
          roleDistribution[roleId].users.push(userData.displayName || userData.email);
        });
        
        // Ajout à la liste complète
        usersList.push({
          id: userId,
          name: userData.displayName || 'Sans nom',
          email: userData.email,
          level: userData.gamification?.level || 1,
          xp: userData.gamification?.totalXp || 0,
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          badges: userData.gamification?.badgesEarned || 0,
          roles: userRoles,
          status: userData.status || 'active',
          createdAt,
          lastActivity
        });
      });
      
      // Trier les utilisateurs par XP
      usersList.sort((a, b) => b.xp - a.xp);
      
      // Calculer la rétention
      const retention = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
      
      // ==========================================
      // 📋 ANALYSE COMPLÈTE DES TÂCHES/QUÊTES
      // ==========================================
      console.log('📋 Analyse des tâches...');
      const tasksRef = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      let totalTasks = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let pendingTasks = 0;
      let inReviewTasks = 0;
      let cancelledTasks = 0;
      let totalXpAwarded = 0;
      const tasksByUser = {};
      const tasksByProject = {};
      const tasksByPriority = {};
      const tasksByStatus = {};
      
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        totalTasks++;
        
        // Statuts
        const status = taskData.status || 'pending';
        tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
        
        if (status === 'completed') {
          completedTasks++;
          totalXpAwarded += taskData.xpReward || 0;
        } else if (status === 'in-progress') {
          inProgressTasks++;
        } else if (status === 'in-review') {
          inReviewTasks++;
        } else if (status === 'cancelled') {
          cancelledTasks++;
        } else {
          pendingTasks++;
        }
        
        // Par utilisateur
        const assignedTo = taskData.assignedTo || 'unassigned';
        if (!tasksByUser[assignedTo]) {
          tasksByUser[assignedTo] = { total: 0, completed: 0, xp: 0 };
        }
        tasksByUser[assignedTo].total++;
        if (status === 'completed') {
          tasksByUser[assignedTo].completed++;
          tasksByUser[assignedTo].xp += taskData.xpReward || 0;
        }
        
        // Par projet
        const projectId = taskData.projectId || 'no-project';
        if (!tasksByProject[projectId]) {
          tasksByProject[projectId] = { total: 0, completed: 0 };
        }
        tasksByProject[projectId].total++;
        if (status === 'completed') {
          tasksByProject[projectId].completed++;
        }
        
        // Par priorité
        const priority = taskData.priority || 'normal';
        tasksByPriority[priority] = (tasksByPriority[priority] || 0) + 1;
      });
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const averageXp = completedTasks > 0 ? Math.round(totalXpAwarded / completedTasks) : 0;
      
      // ==========================================
      // 🏆 ANALYSE COMPLÈTE DES BADGES
      // ==========================================
      console.log('🏆 Analyse des badges...');
      const badgesRef = collection(db, 'badges');
      const badgesSnapshot = await getDocs(badgesRef);
      
      let totalBadges = 0;
      let totalAwarded = 0;
      const badgesByRarity = {};
      const badgePopularity = [];
      const badgesByUser = {};
      const recentBadges = [];
      
      badgesSnapshot.forEach(doc => {
        const badgeData = doc.data();
        totalBadges++;
        
        const earnedCount = badgeData.earnedCount || 0;
        totalAwarded += earnedCount;
        
        // Par rareté
        const rarity = badgeData.rarity || 'common';
        badgesByRarity[rarity] = (badgesByRarity[rarity] || 0) + 1;
        
        // Popularité
        if (earnedCount > 0) {
          badgePopularity.push({
            id: doc.id,
            name: badgeData.name,
            icon: badgeData.icon,
            rarity,
            earnedCount,
            category: badgeData.category || 'general'
          });
        }
      });
      
      // Trier par popularité
      badgePopularity.sort((a, b) => b.earnedCount - a.earnedCount);
      
      // Badges récents (simulation - à améliorer avec vraies données)
      const topRecentBadges = badgePopularity.slice(0, 5);
      
      // ==========================================
      // 📁 ANALYSE COMPLÈTE DES PROJETS
      // ==========================================
      console.log('📁 Analyse des projets...');
      const projectsRef = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      
      let totalProjects = 0;
      let activeProjects = 0;
      let completedProjects = 0;
      let pausedProjects = 0;
      const projectsList = [];
      
      projectsSnapshot.forEach(doc => {
        const projectData = doc.data();
        totalProjects++;
        
        const status = projectData.status || 'active';
        if (status === 'active') activeProjects++;
        else if (status === 'completed') completedProjects++;
        else if (status === 'paused') pausedProjects++;
        
        projectsList.push({
          id: doc.id,
          name: projectData.name,
          status,
          tasksCount: tasksByProject[doc.id]?.total || 0,
          tasksCompleted: tasksByProject[doc.id]?.completed || 0,
          progress: tasksByProject[doc.id]?.total > 0 
            ? Math.round((tasksByProject[doc.id].completed / tasksByProject[doc.id].total) * 100) 
            : 0
        });
      });
      
      const projectCompletionRate = totalProjects > 0 
        ? Math.round((completedProjects / totalProjects) * 100) 
        : 0;
      
      // ==========================================
      // 🎮 ANALYSE GAMIFICATION SYSTÈME
      // ==========================================
      console.log('🎮 Analyse gamification...');
      const totalXpSystem = usersList.reduce((sum, u) => sum + u.xp, 0);
      const averageLevel = totalUsers > 0 
        ? Math.round(usersList.reduce((sum, u) => sum + u.level, 0) / totalUsers) 
        : 1;
      
      const topPerformers = usersList.slice(0, 10);
      
      const levelDistribution = usersList.reduce((acc, u) => {
        const level = u.level;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});
      
      // ==========================================
      // 📊 STATISTIQUES D'ACTIVITÉ QUOTIDIENNE
      // ==========================================
      console.log('📊 Génération des statistiques d\'activité...');
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        // Compter les utilisateurs actifs ce jour
        const activeThisDay = usersList.filter(u => 
          u.lastActivity && u.lastActivity >= dayStart && u.lastActivity < dayEnd
        ).length;
        
        // Compter les tâches complétées ce jour
        const tasksThisDay = Array.from(tasksSnapshot.docs).filter(doc => {
          const task = doc.data();
          const completedAt = task.completedAt?.toDate?.();
          return completedAt && completedAt >= dayStart && completedAt < dayEnd;
        }).length;
        
        dailyStats.push({
          date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }),
          users: activeThisDay,
          tasks: tasksThisDay,
          xp: tasksThisDay * averageXp
        });
      }
      
      // ==========================================
      // 📦 ASSEMBLER TOUTES LES ANALYTICS
      // ==========================================
      setAnalytics({
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          newToday,
          newThisWeek,
          newThisMonth,
          retention,
          byRole: roleDistribution,
          list: usersList
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          pending: pendingTasks,
          inReview: inReviewTasks,
          cancelled: cancelledTasks,
          completionRate,
          averageXp,
          totalXpAwarded,
          byUser: Object.entries(tasksByUser).map(([userId, data]) => ({
            userId,
            userName: usersList.find(u => u.id === userId)?.name || 'Inconnu',
            ...data
          })).sort((a, b) => b.completed - a.completed),
          byProject: Object.entries(tasksByProject).map(([projectId, data]) => ({
            projectId,
            projectName: projectsList.find(p => p.id === projectId)?.name || 'Sans projet',
            ...data
          })),
          byPriority: tasksByPriority,
          byStatus: tasksByStatus
        },
        badges: {
          total: totalBadges,
          awarded: totalAwarded,
          byUser: Object.entries(badgesByUser),
          byRarity: badgesByRarity,
          popular: badgePopularity.slice(0, 10),
          recent: topRecentBadges
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          paused: pausedProjects,
          completionRate: projectCompletionRate,
          list: projectsList
        },
        activity: {
          lastUpdated: new Date(),
          recentActions: [],
          dailyStats
        },
        gamification: {
          totalXpSystem,
          averageLevel,
          topPerformers,
          levelDistribution
        }
      });
      
      console.log('✅ Analytics COMPLÈTES chargées avec succès !');
      showNotification('Données analytics chargées avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Erreur chargement analytics:', error);
      showNotification('Erreur lors du chargement des analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 EXPORTER LES DONNÉES COMPLÈTES
   */
  const exportCompleteData = () => {
    const dataToExport = {
      generated: new Date().toISOString(),
      timeframe,
      analytics: {
        users: {
          summary: {
            total: analytics.users.total,
            active: analytics.users.active,
            inactive: analytics.users.inactive,
            newToday: analytics.users.newToday,
            newThisWeek: analytics.users.newThisWeek,
            newThisMonth: analytics.users.newThisMonth,
            retention: analytics.users.retention
          },
          byRole: analytics.users.byRole,
          topUsers: analytics.users.list.slice(0, 20)
        },
        tasks: {
          summary: {
            total: analytics.tasks.total,
            completed: analytics.tasks.completed,
            inProgress: analytics.tasks.inProgress,
            pending: analytics.tasks.pending,
            completionRate: analytics.tasks.completionRate,
            averageXp: analytics.tasks.averageXp,
            totalXpAwarded: analytics.tasks.totalXpAwarded
          },
          byUser: analytics.tasks.byUser.slice(0, 20),
          byProject: analytics.tasks.byProject,
          byPriority: analytics.tasks.byPriority,
          byStatus: analytics.tasks.byStatus
        },
        badges: {
          total: analytics.badges.total,
          awarded: analytics.badges.awarded,
          byRarity: analytics.badges.byRarity,
          topBadges: analytics.badges.popular
        },
        projects: {
          summary: {
            total: analytics.projects.total,
            active: analytics.projects.active,
            completed: analytics.projects.completed,
            completionRate: analytics.projects.completionRate
          },
          list: analytics.projects.list
        },
        gamification: {
          totalXpSystem: analytics.gamification.totalXpSystem,
          averageLevel: analytics.gamification.averageLevel,
          topPerformers: analytics.gamification.topPerformers.slice(0, 10),
          levelDistribution: analytics.gamification.levelDistribution
        }
      }
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `synergia-analytics-complete-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Données complètes exportées avec succès', 'success');
  };

  // Charger les données au montage
  useEffect(() => {
    loadCompleteAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <p className="text-gray-300 text-lg">Chargement des analytics complètes...</p>
            <p className="text-gray-500 text-sm mt-2">Synchronisation avec Firebase en cours</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 📊 HEADER AVEC ACTIONS */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Analytics Administration Complètes
                  </h1>
                  <p className="text-gray-400 mt-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Dernière synchronisation : {analytics.activity.lastUpdated.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="all">Tout le temps</option>
                </select>
                
                <button 
                  onClick={loadCompleteAnalytics}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualiser</span>
                </button>
                
                <button 
                  onClick={exportCompleteData}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter Tout</span>
                </button>
              </div>
            </div>

            {/* NAVIGATION DES SECTIONS */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
                { id: 'users', label: 'Utilisateurs', icon: Users },
                { id: 'tasks', label: 'Quêtes', icon: Target },
                { id: 'badges', label: 'Badges', icon: Trophy },
                { id: 'projects', label: 'Projets', icon: Briefcase },
                { id: 'gamification', label: 'Gamification', icon: Zap }
              ].map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 📈 MÉTRIQUES PRINCIPALES (TOUJOURS VISIBLES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Utilisateurs totaux */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Utilisateurs totaux</p>
                  <p className="text-4xl font-bold text-white mt-2">{analytics.users.total}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-semibold">+{analytics.users.newThisWeek}</span> cette semaine
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Actifs: <span className="text-green-400 font-semibold">{analytics.users.active}</span></p>
                    <p className="text-xs text-gray-500">Nouveaux aujourd'hui: <span className="text-blue-400 font-semibold">{analytics.users.newToday}</span></p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Taux de completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Taux de completion</p>
                  <p className="text-4xl font-bold text-white mt-2">{analytics.tasks.completionRate}%</p>
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-blue-400 text-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="font-semibold">{analytics.tasks.completed}</span> quêtes accomplies
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">En cours: <span className="text-yellow-400 font-semibold">{analytics.tasks.inProgress}</span></p>
                    <p className="text-xs text-gray-500">En attente: <span className="text-gray-400 font-semibold">{analytics.tasks.pending}</span></p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Badges attribués */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Badges attribués</p>
                  <p className="text-4xl font-bold text-white mt-2">{analytics.badges.awarded}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-yellow-400 text-sm flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span className="font-semibold">{analytics.badges.total}</span> badges disponibles
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Moyenne: <span className="text-yellow-400 font-semibold">{analytics.users.total > 0 ? Math.round(analytics.badges.awarded / analytics.users.total) : 0}</span> par utilisateur</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-4 rounded-xl">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* XP Total */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">XP Total Système</p>
                  <p className="text-4xl font-bold text-white mt-2">{analytics.gamification.totalXpSystem.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-purple-400 text-sm flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span className="font-semibold">{analytics.tasks.averageXp}</span> XP moyen/quête
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Niveau moyen: <span className="text-purple-400 font-semibold">{analytics.gamification.averageLevel}</span></p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl">
                  <Star className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ==================== SECTION: VUE D'ENSEMBLE ==================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Activité quotidienne */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <LineChart className="w-6 h-6 text-blue-400" />
                    Activité des 7 derniers jours
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {analytics.activity.dailyStats.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300 font-medium w-24">{day.date}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-blue-400">
                            <Users className="w-3 h-3 inline mr-1" />
                            {day.users} utilisateurs
                          </span>
                          <span className="text-green-400">
                            <Target className="w-3 h-3 inline mr-1" />
                            {day.tasks} quêtes
                          </span>
                          <span className="text-purple-400">
                            <Zap className="w-3 h-3 inline mr-1" />
                            {day.xp} XP
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((day.users / analytics.users.total) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((day.tasks / 20) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Résumé des statuts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statuts des quêtes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-400" />
                    Répartition des quêtes
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.tasks.byStatus).map(([status, count]) => {
                      const percentage = (count / analytics.tasks.total) * 100;
                      const statusConfig = {
                        completed: { color: 'green', label: 'Accomplies', icon: CheckCircle },
                        'in-progress': { color: 'yellow', label: 'En cours', icon: Clock },
                        'in-review': { color: 'blue', label: 'En révision', icon: Eye },
                        pending: { color: 'gray', label: 'En attente', icon: AlertCircle },
                        cancelled: { color: 'red', label: 'Annulées', icon: XCircle }
                      };
                      const config = statusConfig[status] || { color: 'gray', label: status, icon: Info };
                      const Icon = config.icon;
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className={`w-4 h-4 text-${config.color}-400`} />
                            <span className="text-gray-300 text-sm">{config.label}</span>
                            <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`bg-${config.color}-500 h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold text-sm">{count}</span>
                            <span className="text-gray-500 text-xs ml-1">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Rôles actifs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Rôles Synergia les plus actifs
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.users.byRole)
                      .sort(([,a], [,b]) => b.count - a.count)
                      .slice(0, 5)
                      .map(([roleId, roleData], index) => {
                        const percentage = (roleData.count / analytics.users.total) * 100;
                        const colors = ['blue', 'green', 'yellow', 'purple', 'pink'];
                        const color = colors[index] || 'gray';
                        
                        return (
                          <div key={roleId} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300 text-sm capitalize font-medium">{roleId}</span>
                              <span className="text-white font-bold text-sm">{roleData.count}</span>
                            </div>
                            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`bg-${color}-500 h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* ==================== SECTION: UTILISATEURS ==================== */}
          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-400" />
                Analyse Détaillée des Utilisateurs
              </h3>

              {/* Stats utilisateurs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Nouveaux aujourd'hui</p>
                  <p className="text-2xl font-bold text-white">{analytics.users.newToday}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Nouveaux cette semaine</p>
                  <p className="text-2xl font-bold text-white">{analytics.users.newThisWeek}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Taux de rétention</p>
                  <p className="text-2xl font-bold text-white">{analytics.users.retention}%</p>
                </div>
              </div>

              {/* Top utilisateurs */}
              <h4 className="text-lg font-semibold text-white mb-4">Top 10 Utilisateurs</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 font-medium p-3">Rang</th>
                      <th className="text-left text-gray-400 font-medium p-3">Utilisateur</th>
                      <th className="text-left text-gray-400 font-medium p-3">Niveau</th>
                      <th className="text-left text-gray-400 font-medium p-3">XP Total</th>
                      <th className="text-left text-gray-400 font-medium p-3">Quêtes</th>
                      <th className="text-left text-gray-400 font-medium p-3">Badges</th>
                      <th className="text-left text-gray-400 font-medium p-3">Rôles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.users.list.slice(0, 10).map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="p-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gray-400 text-gray-900' :
                            index === 2 ? 'bg-orange-600 text-orange-900' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold">
                            <Star className="w-3 h-3" />
                            {user.level}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-white font-bold">{user.xp.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-green-400 font-semibold">{user.tasksCompleted}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-yellow-400 font-semibold">{user.badges}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {user.roles.slice(0, 2).map((role, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                {typeof role === 'string' ? role : role.roleId}
                              </span>
                            ))}
                            {user.roles.length > 2 && (
                              <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                +{user.roles.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ==================== SECTION: QUÊTES ==================== */}
          {activeSection === 'tasks' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Target className="w-7 h-7 text-green-400" />
                  Analyse Détaillée des Quêtes
                </h3>

                {/* Stats quêtes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{analytics.tasks.total}</p>
                  </div>
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <p className="text-green-400 text-sm">Accomplies</p>
                    <p className="text-2xl font-bold text-white">{analytics.tasks.completed}</p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">En cours</p>
                    <p className="text-2xl font-bold text-white">{analytics.tasks.inProgress}</p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <p className="text-blue-400 text-sm">En révision</p>
                    <p className="text-2xl font-bold text-white">{analytics.tasks.inReview}</p>
                  </div>
                </div>

                {/* Performance par utilisateur */}
                <h4 className="text-lg font-semibold text-white mb-4">Top 10 Contributeurs</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 font-medium p-3">Utilisateur</th>
                        <th className="text-left text-gray-400 font-medium p-3">Quêtes totales</th>
                        <th className="text-left text-gray-400 font-medium p-3">Accomplies</th>
                        <th className="text-left text-gray-400 font-medium p-3">Taux</th>
                        <th className="text-left text-gray-400 font-medium p-3">XP gagné</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.tasks.byUser.slice(0, 10).map((userTask, index) => {
                        const rate = userTask.total > 0 ? Math.round((userTask.completed / userTask.total) * 100) : 0;
                        return (
                          <tr key={userTask.userId} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            <td className="p-3">
                              <span className="text-white font-medium">{userTask.userName}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-gray-300">{userTask.total}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-green-400 font-semibold">{userTask.completed}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-full rounded-full"
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="text-white text-sm font-medium">{rate}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-purple-400 font-bold">{userTask.xp.toLocaleString()}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Par projet */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
              >
                <h4 className="text-lg font-semibold text-white mb-4">Quêtes par Projet</h4>
                <div className="space-y-3">
                  {analytics.tasks.byProject.slice(0, 10).map((project, index) => {
                    const rate = project.total > 0 ? Math.round((project.completed / project.total) * 100) : 0;
                    return (
                      <div key={project.projectId} className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{project.projectName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-full rounded-full"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-sm">{project.completed}/{project.total}</span>
                          </div>
                        </div>
                        <span className="text-white font-bold ml-4">{rate}%</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* ==================== SECTION: BADGES ==================== */}
          {activeSection === 'badges' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-400" />
                Analyse Détaillée des Badges
              </h3>

              {/* Stats badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total badges</p>
                  <p className="text-2xl font-bold text-white">{analytics.badges.total}</p>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm">Badges attribués</p>
                  <p className="text-2xl font-bold text-white">{analytics.badges.awarded}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Moyenne par utilisateur</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.users.total > 0 ? Math.round(analytics.badges.awarded / analytics.users.total) : 0}
                  </p>
                </div>
              </div>

              {/* Par rareté */}
              <h4 className="text-lg font-semibold text-white mb-4">Répartition par Rareté</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(analytics.badges.byRarity).map(([rarity, count]) => {
                  const rarityConfig = {
                    common: { label: 'Commun', color: 'gray', icon: '⚪' },
                    uncommon: { label: 'Peu commun', color: 'green', icon: '🟢' },
                    rare: { label: 'Rare', color: 'blue', icon: '🔵' },
                    epic: { label: 'Épique', color: 'purple', icon: '🟣' },
                    legendary: { label: 'Légendaire', color: 'yellow', icon: '🟡' }
                  };
                  const config = rarityConfig[rarity] || { label: rarity, color: 'gray', icon: '⚪' };
                  
                  return (
                    <div key={rarity} className={`bg-${config.color}-900/20 border border-${config.color}-500/30 rounded-lg p-4`}>
                      <p className={`text-${config.color}-400 text-sm flex items-center gap-2`}>
                        <span>{config.icon}</span>
                        {config.label}
                      </p>
                      <p className="text-2xl font-bold text-white">{count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Top badges */}
              <h4 className="text-lg font-semibold text-white mb-4">Top 10 Badges Les Plus Attribués</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.badges.popular.slice(0, 10).map((badge, index) => (
                  <div key={badge.id} className="bg-gray-700/30 rounded-lg p-4 flex items-center gap-4">
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h5 className="text-white font-semibold">{badge.name}</h5>
                      <p className="text-gray-400 text-sm capitalize">{badge.rarity} - {badge.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-full rounded-full"
                            style={{ width: `${Math.min((badge.earnedCount / analytics.users.total) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-yellow-400 font-bold">{badge.earnedCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ==================== SECTION: PROJETS ==================== */}
          {activeSection === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-purple-400" />
                Analyse Détaillée des Projets
              </h3>

              {/* Stats projets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total projets</p>
                  <p className="text-2xl font-bold text-white">{analytics.projects.total}</p>
                </div>
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                  <p className="text-green-400 text-sm">Actifs</p>
                  <p className="text-2xl font-bold text-white">{analytics.projects.active}</p>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-blue-400 text-sm">Terminés</p>
                  <p className="text-2xl font-bold text-white">{analytics.projects.completed}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Taux de completion</p>
                  <p className="text-2xl font-bold text-white">{analytics.projects.completionRate}%</p>
                </div>
              </div>

              {/* Liste des projets */}
              <h4 className="text-lg font-semibold text-white mb-4">Tous les Projets</h4>
              <div className="space-y-3">
                {analytics.projects.list.map((project, index) => {
                  const statusConfig = {
                    active: { color: 'green', label: 'Actif', icon: Zap },
                    completed: { color: 'blue', label: 'Terminé', icon: CheckCircle },
                    paused: { color: 'yellow', label: 'En pause', icon: Clock }
                  };
                  const config = statusConfig[project.status] || { color: 'gray', label: project.status, icon: Info };
                  const Icon = config.icon;
                  
                  return (
                    <div key={project.id} className="bg-gray-700/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-semibold text-lg">{project.name}</h5>
                        <span className={`px-3 py-1 bg-${config.color}-900/30 border border-${config.color}-500/50 text-${config.color}-400 rounded-lg text-sm font-medium flex items-center gap-1`}>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">
                          Quêtes: <span className="text-white font-semibold">{project.tasksCompleted}/{project.tasksCount}</span>
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`bg-${config.color}-500 h-full rounded-full`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-white font-bold">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ==================== SECTION: GAMIFICATION ==================== */}
          {activeSection === 'gamification' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-7 h-7 text-purple-400" />
                  Analyse Gamification
                </h3>

                {/* Stats gamification */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-purple-400 text-sm">XP Total Système</p>
                    <p className="text-3xl font-bold text-white">{analytics.gamification.totalXpSystem.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <p className="text-blue-400 text-sm">Niveau Moyen</p>
                    <p className="text-3xl font-bold text-white">{analytics.gamification.averageLevel}</p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">XP Moyen/Quête</p>
                    <p className="text-3xl font-bold text-white">{analytics.tasks.averageXp}</p>
                  </div>
                </div>

                {/* Top performers */}
                <h4 className="text-lg font-semibold text-white mb-4">Top 10 Performers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.gamification.topPerformers.slice(0, 10).map((user, index) => (
                    <div key={user.id} className="bg-gray-700/20 rounded-lg p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-600 text-orange-900' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-semibold">{user.name}</h5>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className="text-purple-400">
                            <Star className="w-3 h-3 inline mr-1" />
                            Niv. {user.level}
                          </span>
                          <span className="text-blue-400">
                            <Zap className="w-3 h-3 inline mr-1" />
                            {user.xp.toLocaleString()} XP
                          </span>
                          <span className="text-green-400">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            {user.tasksCompleted} quêtes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Distribution des niveaux */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
              >
                <h4 className="text-lg font-semibold text-white mb-4">Distribution des Niveaux</h4>
                <div className="space-y-3">
                  {Object.entries(analytics.gamification.levelDistribution)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([level, count]) => {
                      const percentage = (count / analytics.users.total) * 100;
                      return (
                        <div key={level} className="flex items-center gap-4">
                          <span className="text-white font-bold w-16">Niv. {level}</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-white font-semibold w-12 text-right">{count}</span>
                          <span className="text-gray-500 text-sm w-16 text-right">({percentage.toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalyticsPage;
