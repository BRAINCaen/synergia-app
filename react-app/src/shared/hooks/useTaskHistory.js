// ==========================================
// 📁 react-app/src/shared/hooks/useTaskHistory.js
// HOOK REACT POUR L'HISTORIQUE DES TÂCHES AVEC FILTRES AVANCÉS - CLEAN VERSION
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { taskHistoryService } from '../../core/services/taskHistoryService.js';

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
    
    // États
    loading,
    error,
    lastUpdate,
    
    // Filtres
    filters,
    updateFilters,
    
    // Actions
    refetch: loadHistory,
    
    // Utilitaires de données
    getTasksByType,
    getTasksByRole,
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

      const stats = await taskHistoryService.getUserTaskStats(user.uid);
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
