// ==========================================
// 📁 react-app/src/shared/hooks/useTaskHistory.js
// HOOK REACT POUR L'HISTORIQUE DES TÂCHES AVEC FILTRES AVANCÉS
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { taskHistoryService } from '../../core/services/taskHistoryService.js';
import { taskValidationServiceEnhanced } from '../../core/services/taskValidationServiceEnhanced.js';

/**
 * 🗃️ HOOK POUR L'HISTORIQUE DES TÂCHES
 */
export const useTaskHistory = (options = {}) => {
  const { user } = useAuthStore();
  
  // États principaux
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // États pour les filtres
  const [filters, setFilters] = useState({
    timeframe: options.timeframe || null,
    roleId: options.roleId || null,
    category: options.category || null,
    isRecurring: options.isRecurring || null,
    difficulty: options.difficulty || null,
    limit: options.limit || 50
  });

  /**
   * 📋 CHARGER L'HISTORIQUE AVEC FILTRES
   */
  const loadHistory = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [HISTORY-HOOK] Chargement historique avec filtres:', filters);
      
      // Charger l'historique et les stats en parallèle
      const [historyData, statsData] = await Promise.all([
        taskHistoryService.getUserTaskHistory(user.uid, filters),
        taskHistoryService.getUserTaskStats(user.uid)
      ]);
      
      setHistory(historyData || []);
      setStats(statsData);
      setLastUpdate(new Date());
      
      console.log(`📋 [HISTORY-HOOK] Historique chargé: ${historyData.length} entrées`);
      
    } catch (err) {
      console.error('❌ [HISTORY-HOOK] Erreur chargement historique:', err);
      setError(err.message);
      setHistory([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, JSON.stringify(filters)]);

  /**
   * 🔍 ANALYSER UNE TÂCHE SPÉCIFIQUE
   */
  const analyzeTask = useCallback(async (taskTitle) => {
    if (!user?.uid || !taskTitle) return null;
    
    try {
      console.log('🔍 [HISTORY-HOOK] Analyse tâche:', taskTitle);
      
      const analysis = await taskHistoryService.analyzeTaskTypePerformance(user.uid, taskTitle);
      
      console.log('📊 [HISTORY-HOOK] Analyse terminée:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ [HISTORY-HOOK] Erreur analyse tâche:', error);
      return null;
    }
  }, [user?.uid]);

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES ÉTENDUES
   */
  const getExtendedStats = useCallback(() => {
    if (!history.length || !stats) return null;

    // Calculer des métriques supplémentaires basées sur l'historique
    const totalTasks = history.length;
    const recurringTasks = history.filter(task => task.isRecurring).length;
    const nonRecurringTasks = totalTasks - recurringTasks;
    
    // Répartition par difficulté
    const difficultyDistribution = {};
    history.forEach(task => {
      const diff = task.difficulty || 'medium';
      difficultyDistribution[diff] = (difficultyDistribution[diff] || 0) + 1;
    });

    // Répartition par rôle Synergia
    const roleDistribution = {};
    history.forEach(task => {
      if (task.roleId) {
        roleDistribution[task.roleId] = (roleDistribution[task.roleId] || 0) + 1;
      }
    });

    // Analyse temporelle
    const last30Days = history.filter(task => {
      const taskDate = new Date(task.completedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return taskDate >= thirtyDaysAgo;
    }).length;

    const last7Days = history.filter(task => {
      const taskDate = new Date(task.completedAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return taskDate >= sevenDaysAgo;
    }).length;

    // Performance moyenne
    const tasksWithTime = history.filter(task => task.timeSpent && task.timeSpent > 0);
    const averageTime = tasksWithTime.length > 0 ? 
      tasksWithTime.reduce((sum, task) => sum + task.timeSpent, 0) / tasksWithTime.length : 0;

    // XP total de l'historique
    const totalHistoryXP = history.reduce((sum, task) => sum + (task.xpReward || 0), 0);

    return {
      // Stats de base
      ...stats,
      
      // Métriques étendues
      totalTasksInHistory: totalTasks,
      recurringTasksCompleted: recurringTasks,
      nonRecurringTasksCompleted: nonRecurringTasks,
      recurringPercentage: totalTasks > 0 ? Math.round((recurringTasks / totalTasks) * 100) : 0,
      
      // Répartitions
      difficultyDistribution,
      roleDistribution,
      
      // Performance temporelle
      tasksLast30Days: last30Days,
      tasksLast7Days: last7Days,
      
      // Performance générale
      averageTimePerTask: Math.round(averageTime),
      totalXPFromHistory: totalHistoryXP,
      
      // Efficacité
      tasksPerWeek: last7Days,
      tasksPerMonth: last30Days,
      productivityTrend: this.calculateProductivityTrend(history)
    };
  }, [history, stats]);

  /**
   * 🎯 CALCULER LA TENDANCE DE PRODUCTIVITÉ
   */
  const calculateProductivityTrend = useCallback((taskHistory) => {
    if (taskHistory.length < 2) return 'stable';

    // Comparer les 15 derniers jours avec les 15 précédents
    const now = new Date();
    const last15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const prev15Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentTasks = taskHistory.filter(task => {
      const taskDate = new Date(task.completedAt);
      return taskDate >= last15Days;
    }).length;

    const previousTasks = taskHistory.filter(task => {
      const taskDate = new Date(task.completedAt);
      return taskDate >= prev15Days && taskDate < last15Days;
    }).length;

    if (recentTasks > previousTasks * 1.2) return 'increasing';
    if (recentTasks < previousTasks * 0.8) return 'decreasing';
    return 'stable';
  }, []);

  /**
   * 🔄 METTRE À JOUR LES FILTRES
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * 📝 OBTENIR LES TÂCHES PAR TYPE
   */
  const getTasksByType = useCallback((taskTitle) => {
    return history.filter(task => task.title === taskTitle);
  }, [history]);

  /**
   * 📊 OBTENIR LES TÂCHES PAR RÔLE
   */
  const getTasksByRole = useCallback((roleId) => {
    return history.filter(task => task.roleId === roleId);
  }, [history]);

  /**
   * 📅 OBTENIR LES TÂCHES PAR PÉRIODE
   */
  const getTasksByPeriod = useCallback((startDate, endDate) => {
    return history.filter(task => {
      const taskDate = new Date(task.completedAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [history]);

  /**
   * 🎯 OBTENIR LES TÂCHES LES PLUS FRÉQUENTES
   */
  const getTopTasks = useCallback((limit = 5) => {
    const taskCounts = {};
    
    history.forEach(task => {
      const key = task.title;
      if (!taskCounts[key]) {
        taskCounts[key] = {
          title: task.title,
          count: 0,
          totalXP: 0,
          totalTime: 0,
          isRecurring: task.isRecurring,
          roleId: task.roleId,
          difficulty: task.difficulty,
          lastCompleted: task.completedAt
        };
      }
      
      taskCounts[key].count += 1;
      taskCounts[key].totalXP += task.xpReward || 0;
      taskCounts[key].totalTime += task.timeSpent || 0;
      
      if (new Date(task.completedAt) > new Date(taskCounts[key].lastCompleted)) {
        taskCounts[key].lastCompleted = task.completedAt;
      }
    });

    return Object.values(taskCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [history]);

  // Charger l'historique au montage et quand les filtres changent
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Retourner toutes les fonctionnalités
  return {
    // Données principales
    history,
    stats,
    extendedStats: getExtendedStats(),
    
    // États
    loading,
    error,
    lastUpdate,
    
    // Filtres
    filters,
    updateFilters,
    
    // Actions
    refetch: loadHistory,
    analyzeTask,
    
    // Utilitaires de données
    getTasksByType,
    getTasksByRole,
    getTasksByPeriod,
    getTopTasks,
    
    // Métriques
    hasData: history.length > 0,
    isEmpty: !loading && history.length === 0,
    totalTasks: history.length
  };
};

/**
 * 📊 HOOK SPÉCIALISÉ POUR LES STATISTIQUES GLOBALES
 */
export const useTaskStats = () => {
  const { user } = useAuthStore();
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGlobalStats = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const stats = await taskValidationServiceEnhanced.getUserTaskStats(user.uid);
      setGlobalStats(stats);

    } catch (err) {
      console.error('❌ [STATS-HOOK] Erreur chargement stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadGlobalStats();
  }, [loadGlobalStats]);

  return {
    stats: globalStats,
    loading,
    error,
    refetch: loadGlobalStats
  };
};

/**
 * 🏆 HOOK POUR LE CLASSEMENT DES TÂCHES
 */
export const useTaskLeaderboard = (timeframe = 'all', limit = 10) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await taskValidationServiceEnhanced.getTaskLeaderboard(timeframe, limit);
      setLeaderboard(data || []);

    } catch (err) {
      console.error('❌ [LEADERBOARD-HOOK] Erreur chargement classement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeframe, limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: loadLeaderboard
  };
};
