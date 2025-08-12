// ==========================================
// 📁 react-app/src/shared/hooks/useTaskHistory.js
// HOOK REACT POUR L'HISTORIQUE DES TÂCHES - VERSION CORRIGÉE SANS ERREURS USERID
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  getDocs 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 🗃️ HOOK POUR L'HISTORIQUE DES TÂCHES - VERSION SÉCURISÉE
 * Correction des erreurs de validation userId
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
   * 🛡️ VALIDATION SÉCURISÉE DU USERID
   */
  const validateUserId = useCallback((userId) => {
    if (!userId) return { isValid: false, error: 'UserId manquant' };
    
    // Convertir en string de manière sécurisée
    let cleanId;
    try {
      cleanId = String(userId).trim();
    } catch (error) {
      return { isValid: false, error: 'UserId non convertible' };
    }

    // Vérifications de base
    if (!cleanId || cleanId === 'undefined' || cleanId === 'null' || cleanId.length < 5) {
      return { isValid: false, error: 'UserId invalide' };
    }

    return { isValid: true, cleanId, error: null };
  }, []);

  /**
   * 📋 CHARGER L'HISTORIQUE AVEC VALIDATION SÉCURISÉE
   */
  const loadHistory = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      setHistory([]);
      setStats(null);
      return;
    }
    
    // ✅ VALIDATION SÉCURISÉE DU USERID
    const validation = validateUserId(user.uid);
    if (!validation.isValid) {
      console.warn('⚠️ [HISTORY] UserID invalide:', validation.error);
      setHistory([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [HISTORY-HOOK] Chargement historique pour:', validation.cleanId);
      
      // ✅ REQUÊTE FIRESTORE SÉCURISÉE
      // Rechercher dans la collection task_history
      const historyQuery = query(
        collection(db, 'task_history'),
        where('userId', '==', validation.cleanId),
        orderBy('completedAt', 'desc'),
        firestoreLimit(filters.limit)
      );
      
      const historySnapshot = await getDocs(historyQuery);
      const historyData = [];
      
      historySnapshot.forEach(doc => {
        const data = doc.data();
        historyData.push({
          id: doc.id,
          ...data,
          // Conversion sécurisée des timestamps
          completedAt: data.completedAt?.toDate?.() || data.completedAt || new Date(),
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
        });
      });

      // ✅ CALCUL DES STATISTIQUES SANS VALIDATION USERID STRICTE
      const statsData = calculateStatsFromHistory(historyData);
      
      setHistory(historyData);
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
  }, [user?.uid, validateUserId, filters.limit]);

  /**
   * 📊 CALCUL DES STATISTIQUES SANS ERREURS USERID
   */
  const calculateStatsFromHistory = useCallback((historyData) => {
    if (!historyData || historyData.length === 0) {
      return {
        totalCompleted: 0,
        totalXP: 0,
        totalTimeSpent: 0,
        tasksThisWeek: 0,
        tasksThisMonth: 0,
        totalRecurringCompleted: 0,
        averageXpPerTask: 0,
        averageTimePerTask: 0,
        tasksByDifficulty: {},
        tasksByRole: {},
        recentTasks: []
      };
    }

    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalXP = 0;
    let totalTimeSpent = 0;
    let tasksThisWeek = 0;
    let tasksThisMonth = 0;
    let totalRecurringCompleted = 0;
    const tasksByDifficulty = {};
    const tasksByRole = {};

    historyData.forEach(task => {
      // XP total
      totalXP += task.xpReward || 0;
      
      // Temps total
      totalTimeSpent += task.timeSpent || 0;
      
      // Tâches cette semaine
      const taskDate = new Date(task.completedAt);
      if (taskDate >= weekStart) {
        tasksThisWeek++;
      }
      
      // Tâches ce mois
      if (taskDate >= monthStart) {
        tasksThisMonth++;
      }
      
      // Tâches récurrentes
      if (task.isRecurring) {
        totalRecurringCompleted++;
      }
      
      // Par difficulté
      const difficulty = task.difficulty || 'normal';
      tasksByDifficulty[difficulty] = (tasksByDifficulty[difficulty] || 0) + 1;
      
      // Par rôle (sans validation stricte)
      const roleId = task.roleId || task.role || 'unassigned';
      tasksByRole[roleId] = (tasksByRole[roleId] || 0) + 1;
    });

    return {
      totalCompleted: historyData.length,
      totalXP,
      totalTimeSpent,
      tasksThisWeek,
      tasksThisMonth,
      totalRecurringCompleted,
      averageXpPerTask: historyData.length > 0 ? Math.round(totalXP / historyData.length) : 0,
      averageTimePerTask: historyData.length > 0 ? Math.round(totalTimeSpent / historyData.length) : 0,
      tasksByDifficulty,
      tasksByRole,
      recentTasks: historyData.slice(0, 5)
    };
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
   * 📝 OBTENIR LES TÂCHES PAR TYPE (VERSION SÉCURISÉE)
   */
  const getTasksByType = useCallback((taskTitle) => {
    if (!taskTitle || !history) return [];
    return history.filter(task => task.title === taskTitle);
  }, [history]);

  /**
   * 📊 OBTENIR LES TÂCHES PAR RÔLE (VERSION SÉCURISÉE)
   */
  const getTasksByRole = useCallback((roleId) => {
    if (!roleId || !history) return [];
    return history.filter(task => 
      task.roleId === roleId || 
      task.role === roleId
    );
  }, [history]);

  /**
   * 🎯 OBTENIR LES TÂCHES LES PLUS FRÉQUENTES (VERSION SÉCURISÉE)
   */
  const getTopTasks = useCallback((limit = 5) => {
    if (!history || history.length === 0) return [];
    
    const taskCounts = {};
    
    history.forEach(task => {
      const key = task.title || 'Tâche sans titre';
      if (!taskCounts[key]) {
        taskCounts[key] = {
          title: key,
          count: 0,
          totalXP: 0,
          totalTime: 0,
          isRecurring: task.isRecurring || false,
          roleId: task.roleId || task.role || 'unassigned',
          difficulty: task.difficulty || 'normal',
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

  /**
   * 📈 OBTENIR LES TENDANCES HEBDOMADAIRES
   */
  const getWeeklyTrends = useCallback(() => {
    if (!history || history.length === 0) return [];
    
    const now = new Date();
    const trends = [];
    
    // Calculer les 4 dernières semaines
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - ((i + 1) * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      
      const weekTasks = history.filter(task => {
        const taskDate = new Date(task.completedAt);
        return taskDate >= weekStart && taskDate < weekEnd;
      });
      
      trends.unshift({
        week: `Semaine ${4 - i}`,
        taskCount: weekTasks.length,
        totalXP: weekTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        totalTime: weekTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0)
      });
    }
    
    return trends;
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
    
    // États
    loading,
    error,
    lastUpdate,
    
    // Filtres
    filters,
    updateFilters,
    
    // Actions
    refetch: loadHistory,
    
    // Utilitaires de données (versions sécurisées)
    getTasksByType,
    getTasksByRole,
    getTopTasks,
    getWeeklyTrends,
    
    // Métriques
    hasData: history.length > 0,
    isEmpty: !loading && history.length === 0,
    totalTasks: history.length
  };
};

/**
 * 📊 HOOK SPÉCIALISÉ POUR LES STATISTIQUES GLOBALES (VERSION SÉCURISÉE)
 */
export const useTaskStats = () => {
  const { user } = useAuthStore();
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGlobalStats = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      setGlobalStats(null);
      return;
    }

    // ✅ VALIDATION SÉCURISÉE DU USERID
    let cleanUserId;
    try {
      cleanUserId = String(user.uid).trim();
      if (!cleanUserId || cleanUserId.length < 5) {
        throw new Error('UserId invalide');
      }
    } catch (error) {
      console.warn('⚠️ [STATS] UserId invalide:', error);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Requête sécurisée pour les statistiques
      const statsQuery = query(
        collection(db, 'task_history'),
        where('userId', '==', cleanUserId)
      );
      
      const statsSnapshot = await getDocs(statsQuery);
      const tasks = [];
      
      statsSnapshot.forEach(doc => {
        tasks.push(doc.data());
      });

      // Calculer les statistiques globales
      const globalStats = {
        totalTasks: tasks.length,
        totalXP: tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        totalTime: tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0),
        completionRate: tasks.length > 0 ? 100 : 0, // Toutes les tâches en historique sont complétées
        averageXP: tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0) / tasks.length) : 0
      };

      setGlobalStats(globalStats);

    } catch (err) {
      console.error('❌ [STATS-HOOK] Erreur chargement stats:', err);
      setError(err.message);
      setGlobalStats(null);
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
