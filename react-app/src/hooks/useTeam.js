// ==========================================
// 📁 react-app/src/hooks/useTeam.js
// HOOKS REACT POUR LA GESTION D'ÉQUIPE - VERSION CORRIGÉE
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { teamFirebaseService } from '../core/services/teamFirebaseService.js';

/**
 * 🎣 Hook principal pour la gestion d'équipe
 */
export const useTeam = () => {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les membres de l'équipe
  const loadTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.getAllMembers();
      
      if (result.success) {
        setTeamMembers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchroniser l'utilisateur actuel au premier chargement
  const syncCurrentUser = useCallback(async () => {
    if (user) {
      try {
        await teamFirebaseService.syncUserWithAuth(user);
      } catch (err) {
        console.warn('⚠️ Erreur sync utilisateur:', err);
      }
    }
  }, [user]);

  // Charger les données au montage
  useEffect(() => {
    syncCurrentUser();
    loadTeamMembers();
  }, [syncCurrentUser, loadTeamMembers]);

  // Écouter les changements en temps réel
  useEffect(() => {
    const unsubscribe = teamFirebaseService.subscribeToTeamChanges((members) => {
      setTeamMembers(members);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return {
    teamMembers,
    loading,
    error,
    refreshTeam: loadTeamMembers,
    syncUser: syncCurrentUser
  };
};

/**
 * 🎭 Hook pour la gestion des rôles
 */
export const useRoles = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Assigner un rôle
  const assignRole = useCallback(async (userId, roleData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.assignRole(
        userId, 
        roleData, 
        user?.uid || 'system'
      );
      
      if (!result.success) {
        setError(result.error);
        return false;
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Retirer un rôle
  const removeRole = useCallback(async (userId, roleId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.removeRole(
        userId, 
        roleId, 
        user?.uid || 'system'
      );
      
      if (!result.success) {
        setError(result.error);
        return false;
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mettre à jour la progression d'un rôle
  const updateRoleProgress = useCallback(async (userId, roleId, xpToAdd, tasksCompleted = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.updateRoleProgress(
        userId, 
        roleId, 
        xpToAdd, 
        tasksCompleted
      );
      
      if (!result.success) {
        setError(result.error);
        return false;
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assignRole,
    removeRole,
    updateRoleProgress,
    loading,
    error
  };
};

/**
 * 📊 Hook pour les statistiques d'équipe
 */
export const useTeamStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.getTeamStats();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStats
  };
};

/**
 * 🔍 Hook pour rechercher des membres
 */
export const useTeamSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction de recherche
  const searchMembers = useCallback(async (searchTerm, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.searchMembers(searchTerm, filters);
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.error);
        setSearchResults([]);
      }
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Réinitialiser les résultats
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchMembers,
    clearSearch
  };
};

/**
 * 📈 Hook pour les stats d'un rôle spécifique
 */
export const useRoleStats = (roleId) => {
  const [roleStats, setRoleStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les stats du rôle
  const loadRoleStats = useCallback(async () => {
    if (!roleId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.getRoleStats(roleId);
      
      if (result.success) {
        setRoleStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  // Charger au montage et quand roleId change
  useEffect(() => {
    loadRoleStats();
  }, [loadRoleStats]);

  return {
    roleStats,
    loading,
    error,
    refreshRoleStats: loadRoleStats
  };
};

/**
 * 📝 Hook pour l'historique des rôles
 */
export const useRoleHistory = (userId = null) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'historique
  const loadHistory = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.getRoleHistory(userId, limit);
      
      if (result.success) {
        setHistory(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Charger au montage
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory: loadHistory
  };
};

/**
 * 🎯 Hook pour un membre spécifique
 */
export const useMember = (userId) => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données du membre
  const loadMember = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.getMember(userId);
      
      if (result.success) {
        setMember(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mettre à jour le membre
  const updateMember = useCallback(async (memberData) => {
    if (!userId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await teamFirebaseService.createOrUpdateMember(userId, memberData);
      
      if (result.success) {
        await loadMember(); // Recharger les données
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, loadMember]);

  // Charger au montage et quand userId change
  useEffect(() => {
    loadMember();
  }, [loadMember]);

  return {
    member,
    loading,
    error,
    updateMember,
    refreshMember: loadMember
  };
};

/**
 * 🧹 Hook de nettoyage pour les listeners Firebase
 */
export const useTeamCleanup = () => {
  useEffect(() => {
    // Nettoyer au démontage du composant
    return () => {
      teamFirebaseService.cleanup();
    };
  }, []);
};
