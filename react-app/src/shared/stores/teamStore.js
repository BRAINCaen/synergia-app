// ==========================================
// 📁 react-app/src/shared/stores/teamStore.js
// Store Zustand pour la gestion complète de l'équipe
// ==========================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import teamService from '../../core/services/teamService.js';

export const useTeamStore = create(
  subscribeWithSelector((set, get) => ({
    // ✅ État initial
    members: [],
    stats: {
      totalMembers: 0,
      activeMembers: 0,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      activeProjects: 0,
      totalProjects: 0,
      topPerformer: null
    },
    projects: [],
    tasks: [],
    recentActivities: [],
    performanceMetrics: null,
    
    // États UI
    loading: false,
    error: null,
    lastUpdated: null,
    searchTerm: '',
    filters: {
      status: 'all', // all, online, away, offline
      role: 'all',   // all, admin, member, guest
      department: 'all'
    },

    // Listeners temps réel
    unsubscribers: [],

    // ✅ ACTIONS PRINCIPALES

    /**
     * Charger toutes les données de l'équipe
     */
    loadTeamData: async () => {
      const { loadMembers, loadStats, loadRecentActivities } = get();
      
      set({ loading: true, error: null });
      
      try {
        // Charger en parallèle pour optimiser
        await Promise.all([
          loadMembers(),
          loadStats(),
          loadRecentActivities()
        ]);
        
        set({ 
          loading: false, 
          lastUpdated: new Date() 
        });
        
        console.log('✅ Données équipe chargées complètement');
        
      } catch (error) {
        console.error('❌ Erreur chargement équipe:', error);
        set({ 
          error: error.message, 
          loading: false 
        });
      }
    },

    /**
     * Charger les membres de l'équipe
     */
    loadMembers: async (limit = 50) => {
      try {
        const members = await teamService.getTeamMembers(limit);
        set({ members });
        console.log(`✅ ${members.length} membres chargés`);
        return members;
      } catch (error) {
        console.error('❌ Erreur chargement membres:', error);
        set({ error: error.message });
        return [];
      }
    },

    /**
     * Charger les statistiques équipe
     */
    loadStats: async () => {
      try {
        const stats = await teamService.getTeamStats();
        set({ stats });
        console.log('✅ Statistiques équipe chargées');
        return stats;
      } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
        set({ error: error.message });
        return null;
      }
    },

    /**
     * Charger les activités récentes
     */
    loadRecentActivities: async (limit = 20) => {
      try {
        const activities = await teamService.getRecentActivities(limit);
        set({ recentActivities: activities });
        console.log(`✅ ${activities.length} activités chargées`);
        return activities;
      } catch (error) {
        console.error('❌ Erreur chargement activités:', error);
        set({ error: error.message });
        return [];
      }
    },

    /**
     * Charger les métriques de performance
     */
    loadPerformanceMetrics: async (days = 30) => {
      try {
        const metrics = await teamService.getTeamPerformanceMetrics(days);
        set({ performanceMetrics: metrics });
        console.log('✅ Métriques performance chargées');
        return metrics;
      } catch (error) {
        console.error('❌ Erreur métriques performance:', error);
        set({ error: error.message });
        return null;
      }
    },

    /**
     * Rechercher des membres
     */
    searchMembers: async (searchTerm) => {
      set({ searchTerm, loading: true });
      
      try {
        if (!searchTerm.trim()) {
          // Si pas de terme, recharger tous les membres
          await get().loadMembers();
        } else {
          // Recherche avec le terme
          const results = await teamService.searchMembers(searchTerm);
          set({ members: results });
        }
        
        set({ loading: false });
      } catch (error) {
        console.error('❌ Erreur recherche membres:', error);
        set({ error: error.message, loading: false });
      }
    },

    /**
     * Filtrer les membres
     */
    applyFilters: (newFilters) => {
      const { filters, members } = get();
      const updatedFilters = { ...filters, ...newFilters };
      
      set({ filters: updatedFilters });
      
      // Appliquer les filtres localement pour réactivité
      const filteredMembers = members.filter(member => {
        const statusMatch = updatedFilters.status === 'all' || member.status === updatedFilters.status;
        const roleMatch = updatedFilters.role === 'all' || member.role.toLowerCase().includes(updatedFilters.role.toLowerCase());
        const deptMatch = updatedFilters.department === 'all' || member.department === updatedFilters.department;
        
        return statusMatch && roleMatch && deptMatch;
      });
      
      set({ members: filteredMembers });
    },

    /**
     * Réinitialiser les filtres
     */
    resetFilters: () => {
      set({ 
        filters: {
          status: 'all',
          role: 'all',
          department: 'all'
        },
        searchTerm: ''
      });
      
      // Recharger les membres
      get().loadMembers();
    },

    /**
     * Mettre à jour le statut d'un membre
     */
    updateMemberStatus: async (memberId, status) => {
      try {
        const success = await teamService.updateMemberStatus(memberId, status);
        
        if (success) {
          // Mettre à jour localement
          const { members } = get();
          const updatedMembers = members.map(member =>
            member.id === memberId ? { ...member, status } : member
          );
          
          set({ members: updatedMembers });
          
          // Recalculer les stats
          await get().loadStats();
        }
        
        return success;
      } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        set({ error: error.message });
        return false;
      }
    },

    /**
     * Démarrer l'écoute temps réel
     */
    startRealTimeUpdates: () => {
      const { unsubscribers } = get();
      
      // Nettoyer les anciens listeners
      unsubscribers.forEach(unsub => unsub());
      
      try {
        // Écouter les changements membres
        const unsubscribeTeam = teamService.subscribeToTeamUpdates((update) => {
          switch (update.type) {
            case 'members':
              set({ members: update.data });
              // Recalculer les stats automatiquement
              get().loadStats();
              break;
            default:
              console.log('Update reçu:', update);
          }
        });
        
        set({ unsubscribers: [unsubscribeTeam] });
        console.log('✅ Écoute temps réel activée');
        
      } catch (error) {
        console.error('❌ Erreur démarrage temps réel:', error);
        set({ error: error.message });
      }
    },

    /**
     * Arrêter l'écoute temps réel
     */
    stopRealTimeUpdates: () => {
      const { unsubscribers } = get();
      unsubscribers.forEach(unsub => unsub());
      set({ unsubscribers: [] });
      console.log('✅ Écoute temps réel arrêtée');
    },

    // ✅ GETTERS CALCULÉS

    /**
     * Obtenir les membres filtrés
     */
    getFilteredMembers: () => {
      const { members, filters, searchTerm } = get();
      
      let filtered = members;
      
      // Appliquer la recherche
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(member =>
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.role.toLowerCase().includes(term)
        );
      }
      
      // Appliquer les filtres
      if (filters.status !== 'all') {
        filtered = filtered.filter(member => member.status === filters.status);
      }
      
      if (filters.role !== 'all') {
        filtered = filtered.filter(member => 
          member.role.toLowerCase().includes(filters.role.toLowerCase())
        );
      }
      
      if (filters.department !== 'all') {
        filtered = filtered.filter(member => member.department === filters.department);
      }
      
      return filtered;
    },

    /**
     * Obtenir les membres en ligne
     */
    getOnlineMembers: () => {
      const { members } = get();
      return members.filter(member => member.status === 'online');
    },

    /**
     * Obtenir les top performers
     */
    getTopPerformers: (limit = 5) => {
      const { members } = get();
      return [...members]
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, limit);
    },

    /**
     * Obtenir les départements uniques
     */
    getUniqueDepartments: () => {
      const { members } = get();
      const departments = [...new Set(members.map(m => m.department || 'Non spécifié'))];
      return departments.sort();
    },

    /**
     * Obtenir les rôles uniques
     */
    getUniqueRoles: () => {
      const { members } = get();
      const roles = [...new Set(members.map(m => m.role))];
      return roles.sort();
    },

    /**
     * Obtenir un membre par ID
     */
    getMemberById: (memberId) => {
      const { members } = get();
      return members.find(member => member.id === memberId);
    },

    /**
     * Vérifier si l'équipe est chargée
     */
    isTeamLoaded: () => {
      const { members, lastUpdated } = get();
      return members.length > 0 && lastUpdated !== null;
    },

    // ✅ ACTIONS UTILITAIRES

    /**
     * Rafraîchir toutes les données
     */
    refresh: async () => {
      console.log('🔄 Rafraîchissement des données équipe...');
      await get().loadTeamData();
    },

    /**
     * Nettoyer le store
     */
    cleanup: () => {
      get().stopRealTimeUpdates();
      teamService.cleanup();
      
      set({
        members: [],
        stats: {
          totalMembers: 0,
          activeMembers: 0,
          totalXP: 0,
          averageLevel: 1,
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          activeProjects: 0,
          totalProjects: 0,
          topPerformer: null
        },
        projects: [],
        tasks: [],
        recentActivities: [],
        performanceMetrics: null,
        loading: false,
        error: null,
        lastUpdated: null,
        searchTerm: '',
        filters: {
          status: 'all',
          role: 'all',
          department: 'all'
        },
        unsubscribers: []
      });
      
      console.log('✅ Store équipe nettoyé');
    },

    /**
     * Définir une erreur
     */
    setError: (error) => {
      set({ error: error?.message || error || null });
    },

    /**
     * Effacer l'erreur
     */
    clearError: () => {
      set({ error: null });
    }
  }))
);

// ✅ Hooks personnalisés pour faciliter l'usage

/**
 * Hook pour les données principales équipe
 */
export const useTeamData = () => {
  return useTeamStore((state) => ({
    members: state.members,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    loadTeamData: state.loadTeamData,
    refresh: state.refresh
  }));
};

/**
 * Hook pour la recherche et filtrage
 */
export const useTeamFilters = () => {
  return useTeamStore((state) => ({
    searchTerm: state.searchTerm,
    filters: state.filters,
    filteredMembers: state.getFilteredMembers(),
    uniqueDepartments: state.getUniqueDepartments(),
    uniqueRoles: state.getUniqueRoles(),
    searchMembers: state.searchMembers,
    applyFilters: state.applyFilters,
    resetFilters: state.resetFilters
  }));
};

/**
 * Hook pour les statistiques équipe
 */
export const useTeamStats = () => {
  return useTeamStore((state) => ({
    stats: state.stats,
    onlineMembers: state.getOnlineMembers(),
    topPerformers: state.getTopPerformers(),
    performanceMetrics: state.performanceMetrics,
    loadStats: state.loadStats,
    loadPerformanceMetrics: state.loadPerformanceMetrics
  }));
};

/**
 * Hook pour les activités récentes
 */
export const useTeamActivities = () => {
  return useTeamStore((state) => ({
    activities: state.recentActivities,
    loading: state.loading,
    loadRecentActivities: state.loadRecentActivities
  }));
};

// ✅ Sélecteurs optimisés pour éviter les re-renders inutiles

export const selectTeamMembers = (state) => state.members;
export const selectTeamStats = (state) => state.stats;
export const selectTeamLoading = (state) => state.loading;
export const selectTeamError = (state) => state.error;
