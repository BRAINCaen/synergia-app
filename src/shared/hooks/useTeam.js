// ==========================================
// 📁 react-app/src/shared/hooks/useTeam.js
// Hook personnalisé pour simplifier l'usage de l'équipe
// ==========================================

import { useEffect, useCallback, useMemo } from 'react';
import { useTeamStore } from '../stores/teamStore.js';
import { useAuthStore } from '../stores/authStore.js';

/**
 * Hook principal pour la gestion de l'équipe
 * @param {Object} options - Options de configuration
 * @param {boolean} options.autoLoad - Charger automatiquement les données (défaut: true)
 * @param {boolean} options.realTime - Activer les mises à jour temps réel (défaut: false)
 * @param {number} options.refreshInterval - Intervalle de rafraîchissement en ms (défaut: 0 = pas de rafraîchissement auto)
 */
export const useTeam = (options = {}) => {
  const {
    autoLoad = true,
    realTime = false,
    refreshInterval = 0
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  
  // Sélection optimisée des données du store
  const {
    members,
    stats,
    recentActivities,
    performanceMetrics,
    loading,
    error,
    lastUpdated,
    searchTerm,
    filters,
    // Actions
    loadTeamData,
    loadMembers,
    loadStats,
    loadRecentActivities,
    loadPerformanceMetrics,
    searchMembers,
    applyFilters,
    resetFilters,
    updateMemberStatus,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    refresh,
    setError,
    clearError,
    // Getters
    getFilteredMembers,
    getOnlineMembers,
    getTopPerformers,
    getUniqueDepartments,
    getUniqueRoles,
    getMemberById,
    isTeamLoaded
  } = useTeamStore();

  // ✅ Chargement automatique des données
  useEffect(() => {
    if (autoLoad && isAuthenticated && user && !loading && !isTeamLoaded()) {
      console.log('🚀 Chargement automatique des données équipe...');
      loadTeamData();
    }
  }, [autoLoad, isAuthenticated, user, loading, isTeamLoaded, loadTeamData]);

  // ✅ Gestion des mises à jour temps réel
  useEffect(() => {
    if (realTime && isAuthenticated && isTeamLoaded()) {
      console.log('🔄 Activation des mises à jour temps réel...');
      startRealTimeUpdates();
      
      return () => {
        console.log('⏹️ Arrêt des mises à jour temps réel...');
        stopRealTimeUpdates();
      };
    }
  }, [realTime, isAuthenticated, isTeamLoaded, startRealTimeUpdates, stopRealTimeUpdates]);

  // ✅ Rafraîchissement automatique périodique
  useEffect(() => {
    if (refreshInterval > 0 && isAuthenticated && isTeamLoaded()) {
      console.log(`🔄 Rafraîchissement automatique activé (${refreshInterval}ms)`);
      
      const interval = setInterval(() => {
        console.log('🔄 Rafraîchissement automatique...');
        refresh();
      }, refreshInterval);

      return () => {
        console.log('⏹️ Arrêt du rafraîchissement automatique');
        clearInterval(interval);
      };
    }
  }, [refreshInterval, isAuthenticated, isTeamLoaded, refresh]);

  // ✅ Actions optimisées avec useCallback
  const actions = useMemo(() => ({
    // Chargement des données
    loadData: useCallback(async () => {
      clearError();
      return await loadTeamData();
    }, [loadTeamData, clearError]),

    loadMembersData: useCallback(async (limit) => {
      clearError();
      return await loadMembers(limit);
    }, [loadMembers, clearError]),

    loadStatsData: useCallback(async () => {
      clearError();
      return await loadStats();
    }, [loadStats, clearError]),

    loadActivities: useCallback(async (limit) => {
      clearError();
      return await loadRecentActivities(limit);
    }, [loadRecentActivities, clearError]),

    loadMetrics: useCallback(async (days) => {
      clearError();
      return await loadPerformanceMetrics(days);
    }, [loadPerformanceMetrics, clearError]),

    // Recherche et filtrage
    search: useCallback(async (term) => {
      clearError();
      return await searchMembers(term);
    }, [searchMembers, clearError]),

    filter: useCallback((newFilters) => {
      clearError();
      applyFilters(newFilters);
    }, [applyFilters, clearError]),

    resetSearch: useCallback(() => {
      clearError();
      resetFilters();
    }, [resetFilters, clearError]),

    // Gestion des membres
    updateStatus: useCallback(async (memberId, status) => {
      clearError();
      return await updateMemberStatus(memberId, status);
    }, [updateMemberStatus, clearError]),

    // Utilitaires
    refreshData: useCallback(async () => {
      clearError();
      return await refresh();
    }, [refresh, clearError]),

    clearErrors: useCallback(() => {
      clearError();
    }, [clearError])
  }), [
    loadTeamData, loadMembers, loadStats, loadRecentActivities, loadPerformanceMetrics,
    searchMembers, applyFilters, resetFilters, updateMemberStatus, refresh, clearError
  ]);

  // ✅ Données calculées et optimisées
  const computed = useMemo(() => ({
    // Membres filtrés
    filteredMembers: getFilteredMembers(),
    
    // Membres en ligne
    onlineMembers: getOnlineMembers(),
    
    // Top performers
    topPerformers: getTopPerformers(5),
    
    // Listes pour les filtres
    departments: getUniqueDepartments(),
    roles: getUniqueRoles(),
    
    // États dérivés
    hasMembers: members.length > 0,
    hasError: !!error,
    isLoaded: isTeamLoaded(),
    isEmpty: members.length === 0 && !loading && !error,
    
    // Statistiques calculées
    onlinePercentage: stats.totalMembers > 0 
      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
      : 0,
    
    averageXpPerMember: stats.totalMembers > 0 
      ? Math.round(stats.totalXP / stats.totalMembers)
      : 0,
    
    // Indicateurs de santé équipe
    teamHealth: {
      activity: stats.activeMembers > 0 ? 'good' : 'warning',
      productivity: stats.completionRate > 70 ? 'good' : stats.completionRate > 40 ? 'warning' : 'poor',
      growth: stats.totalXP > 0 ? 'good' : 'neutral'
    }
  }), [
    getFilteredMembers, getOnlineMembers, getTopPerformers, getUniqueDepartments, getUniqueRoles,
    members.length, loading, error, isTeamLoaded, stats
  ]);

  // ✅ Utilitaires
  const utils = useMemo(() => ({
    // Trouver un membre par ID
    findMember: useCallback((id) => getMemberById(id), [getMemberById]),
    
    // Formater la dernière activité
    formatLastActivity: useCallback((date) => {
      if (!date) return 'Jamais';
      
      try {
        const d = date.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        
        return d.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short'
        });
      } catch {
        return 'Récemment';
      }
    }, []),
    
    // Obtenir la couleur du statut
    getStatusColor: useCallback((status) => {
      switch (status) {
        case 'online': return 'green';
        case 'away': return 'yellow';
        case 'offline': return 'gray';
        default: return 'gray';
      }
    }, []),
    
    // Obtenir l'icône du statut
    getStatusIcon: useCallback((status) => {
      switch (status) {
        case 'online': return '🟢';
        case 'away': return '🟡';
        case 'offline': return '⚫';
        default: return '⚫';
      }
    }, []),
    
    // Obtenir le badge de niveau
    getLevelBadge: useCallback((level) => {
      if (level >= 10) return '🏆';
      if (level >= 7) return '⭐';
      if (level >= 5) return '🌟';
      if (level >= 3) return '✨';
      return '🎯';
    }, [])
  }), [getMemberById]);

  // ✅ Données d'état pour debug (dev uniquement)
  const debug = process.env.NODE_ENV === 'development' ? {
    storeState: {
      membersCount: members.length,
      hasStats: !!stats,
      hasActivities: recentActivities.length > 0,
      hasMetrics: !!performanceMetrics,
      lastUpdated,
      searchTerm,
      filters
    },
    options: {
      autoLoad,
      realTime,
      refreshInterval
    },
    computed: {
      hasMembers: computed.hasMembers,
      isLoaded: computed.isLoaded,
      isEmpty: computed.isEmpty,
      onlinePercentage: computed.onlinePercentage
    }
  } : undefined;

  return {
    // ✅ Données principales
    members,
    stats,
    activities: recentActivities,
    metrics: performanceMetrics,
    
    // ✅ États
    loading,
    error,
    lastUpdated,
    searchTerm,
    filters,
    
    // ✅ Données calculées
    ...computed,
    
    // ✅ Actions
    ...actions,
    
    // ✅ Utilitaires
    ...utils,
    
    // ✅ Debug (dev uniquement)
    debug
  };
};

// ✅ Hooks spécialisés pour des cas d'usage spécifiques

/**
 * Hook léger pour afficher uniquement les statistiques équipe
 */
export const useTeamStats = () => {
  const { stats, loading, error, loadStats } = useTeamStore();
  
  useEffect(() => {
    if (!loading && !stats.totalMembers) {
      loadStats();
    }
  }, [stats.totalMembers, loading, loadStats]);
  
  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
};

/**
 * Hook pour la recherche de membres
 */
export const useTeamSearch = () => {
  const {
    searchTerm,
    getFilteredMembers,
    searchMembers,
    resetFilters,
    loading
  } = useTeamStore();
  
  const search = useCallback(async (term) => {
    return await searchMembers(term);
  }, [searchMembers]);
  
  const reset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);
  
  return {
    searchTerm,
    results: getFilteredMembers(),
    search,
    reset,
    loading
  };
};

/**
 * Hook pour les membres en ligne uniquement
 */
export const useOnlineMembers = () => {
  const { getOnlineMembers, startRealTimeUpdates, stopRealTimeUpdates } = useTeamStore();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      startRealTimeUpdates();
      return () => stopRealTimeUpdates();
    }
  }, [isAuthenticated, startRealTimeUpdates, stopRealTimeUpdates]);
  
  return {
    onlineMembers: getOnlineMembers(),
    count: getOnlineMembers().length
  };
};

export default useTeam;
