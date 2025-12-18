// ==========================================
// 📁 react-app/src/shared/hooks/useChallenges.js
// HOOK POUR GÉRER LES DÉFIS PERSONNELS - SYNERGIA v4.0 MODULE 10
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import challengeService, {
  CHALLENGE_TYPES,
  CHALLENGE_DIFFICULTY,
  CHALLENGE_STATUS
} from '../../core/services/challengeService.js';

/**
 * 🎯 HOOK POUR LES DÉFIS PERSONNELS
 * Gère l'affichage et les interactions avec les défis
 */
export const useChallenges = (options = {}) => {
  const {
    autoInit = true,
    realTimeUpdates = true,
    isAdmin = false
  } = options;

  const { user, isAuthenticated } = useAuthStore();

  // 📊 ÉTATS
  const [challenges, setChallenges] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    pendingValidation: 0,
    completed: 0,
    rejected: 0,
    totalXpEarned: 0,
    byType: {},
    byDifficulty: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 🚀 CHARGER LES DÉFIS
   */
  const loadChallenges = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🎯 [USE-CHALLENGES] Chargement défis...');

      const userChallenges = await challengeService.getUserChallenges(user.uid);
      setChallenges(userChallenges);

      // Charger les stats
      const userStats = await challengeService.getUserChallengeStats(user.uid);
      setStats(userStats);

      console.log('✅ [USE-CHALLENGES] Défis chargés:', userChallenges.length);

    } catch (err) {
      setError(err.message);
      console.error('❌ [USE-CHALLENGES] Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * 👑 CHARGER LES DÉFIS EN ATTENTE (ADMIN)
   */
  const loadPendingChallenges = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const pending = await challengeService.getPendingChallenges();
      setPendingChallenges(pending);
      console.log('👑 [USE-CHALLENGES] Défis en attente:', pending.length);
    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur chargement pending:', err);
    }
  }, [isAdmin]);

  /**
   * ➕ CRÉER UN NOUVEAU DÉFI
   */
  const createChallenge = useCallback(async (challengeData) => {
    if (!user || creating) return { success: false, error: 'Action en cours' };

    setCreating(true);

    try {
      const result = await challengeService.createChallenge(challengeData, user);

      if (result.success) {
        // Recharger les défis
        await loadChallenges();
      }

      return result;

    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur création:', err);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  }, [user, creating, loadChallenges]);

  /**
   * 📤 SOUMETTRE UN DÉFI ACCOMPLI
   */
  const submitCompletion = useCallback(async (challengeId, proof) => {
    if (!user?.uid || submitting) return { success: false, error: 'Action en cours' };

    setSubmitting(true);

    try {
      const result = await challengeService.submitChallengeCompletion(
        challengeId,
        user.uid,
        proof
      );

      if (result.success) {
        await loadChallenges();
      }

      return result;

    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur soumission:', err);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  }, [user?.uid, submitting, loadChallenges]);

  /**
   * ✅ APPROUVER UN DÉFI (ADMIN)
   */
  const approveChallenge = useCallback(async (challengeId) => {
    if (!user || !isAdmin) return { success: false, error: 'Non autorisé' };

    try {
      const result = await challengeService.approveChallenge(challengeId, user);

      if (result.success) {
        await loadPendingChallenges();
      }

      return result;

    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur approbation:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin, loadPendingChallenges]);

  /**
   * ❌ REJETER UN DÉFI (ADMIN)
   */
  const rejectChallenge = useCallback(async (challengeId, reason) => {
    if (!user || !isAdmin) return { success: false, error: 'Non autorisé' };

    try {
      const result = await challengeService.rejectChallenge(challengeId, user, reason);

      if (result.success) {
        await loadPendingChallenges();
      }

      return result;

    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur rejet:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin, loadPendingChallenges]);

  /**
   * 🏆 VALIDER UN DÉFI ACCOMPLI (ADMIN)
   */
  const validateCompletion = useCallback(async (challengeId) => {
    if (!user || !isAdmin) return { success: false, error: 'Non autorisé' };

    try {
      const result = await challengeService.validateChallengeCompletion(challengeId, user);

      if (result.success) {
        await loadPendingChallenges();
      }

      return result;

    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur validation:', err);
      return { success: false, error: err.message };
    }
  }, [user, isAdmin, loadPendingChallenges]);

  /**
   * 🗑️ SUPPRIMER UN DÉFI
   */
  const deleteChallenge = useCallback(async (challengeId) => {
    if (!user?.uid) return { success: false, error: 'Non connecté' };

    try {
      const result = await challengeService.deleteChallenge(challengeId, user.uid);

      if (result.success) {
        await loadChallenges();
      }

      return result;

    } catch (err) {
      console.error('❌ [USE-CHALLENGES] Erreur suppression:', err);
      return { success: false, error: err.message };
    }
  }, [user?.uid, loadChallenges]);

  /**
   * 📊 FILTRER LES DÉFIS PAR STATUT
   */
  const getChallengesByStatus = useCallback((status) => {
    return challenges.filter(c => c.status === status);
  }, [challenges]);

  /**
   * 📊 FILTRER LES DÉFIS PAR TYPE
   */
  const getChallengesByType = useCallback((type) => {
    return challenges.filter(c => c.type === type);
  }, [challenges]);

  // 🚀 INITIALISATION
  useEffect(() => {
    if (autoInit && isAuthenticated && user?.uid) {
      loadChallenges();

      if (isAdmin) {
        loadPendingChallenges();
      }
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [autoInit, isAuthenticated, user?.uid, isAdmin, loadChallenges, loadPendingChallenges]);

  // 👂 ÉCOUTE TEMPS RÉEL
  useEffect(() => {
    if (!realTimeUpdates || !isAuthenticated || !user?.uid) return;

    console.log('👂 [USE-CHALLENGES] Démarrage écoute temps réel...');

    const unsubscribe = challengeService.subscribeToUserChallenges(user.uid, (updatedChallenges) => {
      setChallenges(updatedChallenges);

      // Recalculer les stats localement
      const newStats = {
        total: updatedChallenges.length,
        pending: updatedChallenges.filter(c => c.status === 'pending_approval').length,
        active: updatedChallenges.filter(c => c.status === 'active').length,
        pendingValidation: updatedChallenges.filter(c => c.status === 'pending_validation').length,
        completed: updatedChallenges.filter(c => c.status === 'completed').length,
        rejected: updatedChallenges.filter(c => c.status === 'rejected').length,
        totalXpEarned: updatedChallenges
          .filter(c => c.status === 'completed')
          .reduce((sum, c) => sum + (c.xpReward || 0), 0),
        byType: {},
        byDifficulty: {}
      };

      Object.keys(CHALLENGE_TYPES).forEach(type => {
        newStats.byType[type] = updatedChallenges.filter(c => c.type === type && c.status === 'completed').length;
      });

      Object.keys(CHALLENGE_DIFFICULTY).forEach(diff => {
        newStats.byDifficulty[diff] = updatedChallenges.filter(c => c.difficulty === diff && c.status === 'completed').length;
      });

      setStats(newStats);
    });

    return () => {
      console.log('🔇 [USE-CHALLENGES] Arrêt écoute temps réel');
      unsubscribe();
    };
  }, [realTimeUpdates, isAuthenticated, user?.uid]);

  // 👂 ÉCOUTE TEMPS RÉEL ADMIN
  useEffect(() => {
    if (!realTimeUpdates || !isAdmin) return;

    console.log('👑 [USE-CHALLENGES] Démarrage écoute admin...');

    const unsubscribe = challengeService.subscribeToPendingChallenges((pending) => {
      setPendingChallenges(pending);
    });

    return () => {
      unsubscribe();
    };
  }, [realTimeUpdates, isAdmin]);

  return {
    // === DONNÉES ===
    challenges,
    pendingChallenges,
    stats,

    // === ÉTATS ===
    loading,
    error,
    creating,
    submitting,
    isReady: !loading && !error,

    // === ACTIONS ===
    createChallenge,
    submitCompletion,
    approveChallenge,
    rejectChallenge,
    validateCompletion,
    deleteChallenge,
    refreshChallenges: loadChallenges,

    // === FILTRES ===
    getChallengesByStatus,
    getChallengesByType,

    // === CONSTANTES ===
    CHALLENGE_TYPES,
    CHALLENGE_DIFFICULTY,
    CHALLENGE_STATUS
  };
};

export default useChallenges;
