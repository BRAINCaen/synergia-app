// ==========================================
// react-app/src/shared/hooks/useTeamChallenges.js
// HOOK DEFIS D'EQUIPE - SYNERGIA v4.0
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import {
  teamChallengeService,
  TEAM_CHALLENGE_TYPES,
  TEAM_CHALLENGE_REWARDS,
  TEAM_CHALLENGE_STATUS
} from '../../core/services/teamChallengeService.js';

export const useTeamChallenges = (options = {}) => {
  const {
    autoInit = true,
    realTimeUpdates = true,
    isAdmin = false
  } = options;

  const { user } = useAuthStore();

  // Etats
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalXpEarned: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [error, setError] = useState(null);

  // Charger les donnees initiales
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allChallenges, active, pending, challengeStats] = await Promise.all([
        teamChallengeService.getAllChallenges(),
        teamChallengeService.getActiveChallenges(),
        isAdmin ? teamChallengeService.getPendingChallenges() : Promise.resolve([]),
        teamChallengeService.getTeamChallengeStats()
      ]);

      setChallenges(allChallenges);
      setActiveChallenges(active);
      setPendingChallenges(pending);
      setStats(challengeStats);

    } catch (err) {
      console.error('Erreur chargement defis equipe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Initialisation et abonnements
  useEffect(() => {
    if (!autoInit) return;

    loadChallenges();

    if (realTimeUpdates) {
      // Abonnement temps reel aux defis
      const unsubAll = teamChallengeService.subscribeToAllChallenges((data) => {
        setChallenges(data);
        // Recalculer stats localement
        const newStats = {
          total: data.length,
          active: data.filter(c => c.status === 'active').length,
          pending: data.filter(c => c.status === 'pending_approval').length,
          completed: data.filter(c => c.status === 'completed').length,
          failed: data.filter(c => c.status === 'failed').length,
          totalXpEarned: data
            .filter(c => c.status === 'completed')
            .reduce((sum, c) => sum + (c.xpReward || 0), 0),
          byType: {}
        };
        Object.keys(TEAM_CHALLENGE_TYPES).forEach(type => {
          newStats.byType[type] = data.filter(c => c.type === type && c.status === 'completed').length;
        });
        setStats(newStats);
      });

      const unsubActive = teamChallengeService.subscribeToActiveChallenges((data) => {
        setActiveChallenges(data);
      });

      let unsubPending = () => {};
      if (isAdmin) {
        unsubPending = teamChallengeService.subscribeToPendingChallenges((data) => {
          setPendingChallenges(data);
        });
      }

      return () => {
        unsubAll();
        unsubActive();
        unsubPending();
      };
    }
  }, [autoInit, realTimeUpdates, isAdmin, loadChallenges]);

  // Creer un defi d'equipe
  const createChallenge = useCallback(async (data) => {
    if (!user) {
      return { success: false, error: 'Non connecte' };
    }

    setCreating(true);
    try {
      const result = await teamChallengeService.createTeamChallenge(data, user);
      return result;
    } catch (err) {
      console.error('Erreur creation defi:', err);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  }, [user]);

  // Contribuer a un defi
  const contributeToChallenge = useCallback(async (challengeId, amount, description = '') => {
    if (!user) {
      return { success: false, error: 'Non connecte' };
    }

    setContributing(true);
    try {
      const result = await teamChallengeService.contributeToChallenge(
        challengeId,
        user,
        amount,
        description
      );
      return result;
    } catch (err) {
      console.error('Erreur contribution:', err);
      return { success: false, error: err.message };
    } finally {
      setContributing(false);
    }
  }, [user]);

  // Mettre a jour la valeur (admin)
  const updateValue = useCallback(async (challengeId, newValue) => {
    if (!user || !isAdmin) {
      return { success: false, error: 'Permission refusee' };
    }

    try {
      const result = await teamChallengeService.updateCurrentValue(challengeId, newValue, user);
      return result;
    } catch (err) {
      console.error('Erreur mise a jour:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin]);

  // Approuver un defi (admin)
  const approveChallenge = useCallback(async (challengeId) => {
    if (!user || !isAdmin) {
      return { success: false, error: 'Permission refusee' };
    }

    try {
      const result = await teamChallengeService.approveChallenge(challengeId, user);
      return result;
    } catch (err) {
      console.error('Erreur approbation:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin]);

  // Rejeter un defi (admin)
  const rejectChallenge = useCallback(async (challengeId, reason) => {
    if (!user || !isAdmin) {
      return { success: false, error: 'Permission refusee' };
    }

    try {
      const result = await teamChallengeService.rejectChallenge(challengeId, user, reason);
      return result;
    } catch (err) {
      console.error('Erreur rejet:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin]);

  // Supprimer un defi
  const deleteChallenge = useCallback(async (challengeId) => {
    if (!user) {
      return { success: false, error: 'Non connecte' };
    }

    try {
      const result = await teamChallengeService.deleteChallenge(challengeId, user.uid, isAdmin);
      return result;
    } catch (err) {
      console.error('Erreur suppression:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin]);

  // Rafraichir
  const refresh = useCallback(() => {
    loadChallenges();
  }, [loadChallenges]);

  return {
    // Donnees
    challenges,
    activeChallenges,
    pendingChallenges,
    stats,

    // Etats
    loading,
    creating,
    contributing,
    error,

    // Actions
    createChallenge,
    contributeToChallenge,
    updateValue,
    approveChallenge,
    rejectChallenge,
    deleteChallenge,
    refresh,

    // Constantes
    TEAM_CHALLENGE_TYPES,
    TEAM_CHALLENGE_REWARDS,
    TEAM_CHALLENGE_STATUS
  };
};

export default useTeamChallenges;
