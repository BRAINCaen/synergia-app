// src/shared/hooks/useUsers.js
// Hook React pour la gestion des utilisateurs
import { useState, useEffect, useCallback } from 'react';
import { userManagementService } from '../../core/services/userManagementService.js';

export const useUsers = (options = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);

  const { 
    autoLoad = true, 
    limitCount = 50,
    realTime = false 
  } = options;

  // Charger les utilisateurs
  const loadUsers = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userManagementService.getAllGoogleUsers({
        limitCount,
        startAfterDoc: reset ? null : lastDoc
      });

      if (reset) {
        setUsers(result.users);
      } else {
        setUsers(prev => [...prev, ...result.users]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      
      console.log(`👥 ${result.users.length} utilisateurs chargés`);
    } catch (err) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limitCount, lastDoc]);

  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      if (!searchTerm.trim()) {
        await loadUsers(true);
        return;
      }

      const result = await userManagementService.searchUsers(searchTerm, { limitCount });
      setUsers(result.users);
      setHasMore(result.hasMore);
      
      console.log(`🔍 ${result.users.length} utilisateurs trouvés pour "${searchTerm}"`);
    } catch (err) {
      console.error('❌ Erreur recherche utilisateurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  // Charger plus d'utilisateurs (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadUsers(false);
    }
  }, [loading, hasMore, loadUsers]);

  // Rafraîchir la liste
  const refresh = useCallback(() => {
    loadUsers(true);
  }, [loadUsers]);

  // Chargement initial
  useEffect(() => {
    if (autoLoad) {
      loadUsers(true);
    }
  }, [autoLoad, loadUsers]);

  // Temps réel si activé
  useEffect(() => {
    if (!realTime) return;

    const unsubscribe = userManagementService.subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      console.log('🔄 Utilisateurs mis à jour en temps réel');
    }, { limitCount });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [realTime, limitCount]);

  return {
    users,
    loading,
    error,
    hasMore,
    loadUsers: refresh,
    searchUsers,
    loadMore,
    refresh
  };
};

// Hook pour les statistiques des utilisateurs
export const useUserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userStats = await userManagementService.getUserStats();
      setStats(userStats);
      
      console.log('📊 Statistiques utilisateurs chargées');
    } catch (err) {
      console.error('❌ Erreur chargement stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
};

// Hook pour le leaderboard
export const useLeaderboard = (limitCount = 10) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const board = await userManagementService.getLeaderboard(limitCount);
      setLeaderboard(board);
      
      console.log(`🏆 Leaderboard chargé avec ${board.length} utilisateurs`);
    } catch (err) {
      console.error('❌ Erreur chargement leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refresh: loadLeaderboard
  };
};

// Hook pour un utilisateur spécifique
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = await userManagementService.getUserById(userId);
        setUser(userData);
        
        console.log('👤 Utilisateur chargé:', userData?.displayName || userId);
      } catch (err) {
        console.error('❌ Erreur chargement utilisateur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  return {
    user,
    loading,
    error
  };
};

export default useUsers;
