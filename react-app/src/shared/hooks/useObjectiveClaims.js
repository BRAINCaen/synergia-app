// ==========================================
// 📁 react-app/src/shared/hooks/useObjectiveClaims.js
// HOOK REACT POUR RÉCLAMATIONS D'OBJECTIFS
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { objectiveClaimService } from '../../core/services/objectiveClaimService.js';

/**
 * 🎯 HOOK POUR LA GESTION DES RÉCLAMATIONS D'OBJECTIFS
 */
export const useObjectiveClaims = () => {
  const { user, isAuthenticated } = useAuth();
  
  // États locaux
  const [userClaims, setUserClaims] = useState([]);
  const [allClaims, setAllClaims] = useState([]);
  const [claimStats, setClaimStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(null);
  const [processingClaim, setProcessingClaim] = useState(null);

  /**
   * 📥 CHARGER LES RÉCLAMATIONS DE L'UTILISATEUR
   */
  const loadUserClaims = useCallback(async (status = null) => {
    if (!isAuthenticated || !user?.uid) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const claims = await objectiveClaimService.getUserClaims(user.uid, status);
      setUserClaims(claims);

      console.log(`📊 ${claims.length} réclamations chargées pour l'utilisateur`);

    } catch (err) {
      console.error('❌ Erreur chargement réclamations utilisateur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.uid]);

  /**
   * 🛡️ CHARGER TOUTES LES RÉCLAMATIONS (Admin)
   */
  const loadAllClaims = useCallback(async (filters = {}) => {
    if (!isAuthenticated || !user?.uid) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const claims = await objectiveClaimService.getAllClaims(filters);
      setAllClaims(claims);

      console.log(`🛡️ ${claims.length} réclamations chargées (admin)`);

    } catch (err) {
      console.error('❌ Erreur chargement toutes réclamations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.uid]);

  /**
   * 📊 CHARGER LES STATISTIQUES
   */
  const loadClaimStats = useCallback(async () => {
    try {
      const stats = await objectiveClaimService.getClaimStats();
      setClaimStats(stats);
      console.log('📊 Statistiques réclamations chargées:', stats);
    } catch (err) {
      console.error('❌ Erreur chargement statistiques:', err);
    }
  }, []);

  /**
   * 📝 SOUMETTRE UNE RÉCLAMATION D'OBJECTIF
   */
  const submitClaim = useCallback(async (objective, evidence = '') => {
    if (!isAuthenticated || !user?.uid || submittingClaim) {
      return { success: false, error: 'Conditions non remplies' };
    }

    try {
      setSubmittingClaim(objective.id);
      setError(null);

      console.log('📝 Soumission réclamation objectif:', objective.title);

      const result = await objectiveClaimService.createObjectiveClaim(
        user.uid, 
        objective, 
        evidence
      );

      if (result.success) {
        // Recharger les réclamations de l'utilisateur
        await loadUserClaims();

        console.log(`✅ Réclamation soumise: ${result.claimRequestId}`);
        
        return {
          success: true,
          claimRequestId: result.claimRequestId,
          message: result.message,
          expectedXP: result.expectedXP,
          estimatedProcessingTime: result.estimatedProcessingTime
        };
      }

      return result;

    } catch (err) {
      console.error('❌ Erreur soumission réclamation:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setSubmittingClaim(null);
    }
  }, [isAuthenticated, user?.uid, submittingClaim, loadUserClaims]);

  /**
   * ✅ APPROUVER UNE RÉCLAMATION (Admin)
   */
  const approveClaim = useCallback(async (claimId, adminNotes = '') => {
    if (!isAuthenticated || !user?.uid || processingClaim) {
      return { success: false, error: 'Conditions non remplies' };
    }

    try {
      setProcessingClaim(claimId);
      setError(null);

      console.log('✅ Approbation réclamation:', claimId);

      const result = await objectiveClaimService.approveClaim(
        claimId, 
        user.uid, 
        adminNotes
      );

      if (result.success) {
        // Recharger les réclamations et statistiques
        await Promise.all([
          loadAllClaims(),
          loadClaimStats()
        ]);

        console.log(`✅ Réclamation approuvée: +${result.xpAwarded} XP`);
        
        return {
          success: true,
          message: result.message,
          xpAwarded: result.xpAwarded,
          userId: result.userId
        };
      }

      return result;

    } catch (err) {
      console.error('❌ Erreur approbation réclamation:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setProcessingClaim(null);
    }
  }, [isAuthenticated, user?.uid, processingClaim, loadAllClaims, loadClaimStats]);

  /**
   * ❌ REJETER UNE RÉCLAMATION (Admin)
   */
  const rejectClaim = useCallback(async (claimId, adminNotes = '') => {
    if (!isAuthenticated || !user?.uid || processingClaim) {
      return { success: false, error: 'Conditions non remplies' };
    }

    try {
      setProcessingClaim(claimId);
      setError(null);

      console.log('❌ Rejet réclamation:', claimId);

      const result = await objectiveClaimService.rejectClaim(
        claimId, 
        user.uid, 
        adminNotes
      );

      if (result.success) {
        // Recharger les réclamations et statistiques
        await Promise.all([
          loadAllClaims(),
          loadClaimStats()
        ]);

        console.log(`❌ Réclamation rejetée`);
        
        return {
          success: true,
          message: result.message,
          userId: result.userId
        };
      }

      return result;

    } catch (err) {
      console.error('❌ Erreur rejet réclamation:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setProcessingClaim(null);
    }
  }, [isAuthenticated, user?.uid, processingClaim, loadAllClaims, loadClaimStats]);

  /**
   * 🔄 RAFRAÎCHIR TOUTES LES DONNÉES
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadUserClaims(),
      loadClaimStats()
    ]);
  }, [loadUserClaims, loadClaimStats]);

  /**
   * 📊 OBTENIR LE STATUT DES RÉCLAMATIONS UTILISATEUR
   */
  const getUserClaimStatus = useCallback(() => {
    const pending = userClaims.filter(claim => claim.status === 'pending').length;
    const approved = userClaims.filter(claim => claim.status === 'approved').length;
    const rejected = userClaims.filter(claim => claim.status === 'rejected').length;
    
    const totalXP = userClaims
      .filter(claim => claim.status === 'approved')
      .reduce((sum, claim) => sum + (claim.xpAmount || 0), 0);

    return {
      total: userClaims.length,
      pending,
      approved,
      rejected,
      totalXPEarned: totalXP,
      successRate: userClaims.length > 0 ? Math.round((approved / userClaims.length) * 100) : 0
    };
  }, [userClaims]);

  /**
   * 🔍 VÉRIFIER SI UN OBJECTIF A UNE RÉCLAMATION EN COURS
   */
  const hasActiveClaim = useCallback((objectiveId) => {
    return userClaims.some(claim => 
      claim.objectiveId === objectiveId && 
      claim.status === 'pending'
    );
  }, [userClaims]);

  /**
   * 📅 OBTENIR LA DERNIÈRE RÉCLAMATION POUR UN OBJECTIF
   */
  const getLastClaimForObjective = useCallback((objectiveId) => {
    const objectiveClaims = userClaims
      .filter(claim => claim.objectiveId === objectiveId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return objectiveClaims[0] || null;
  }, [userClaims]);

  // Chargement automatique des réclamations utilisateur
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadUserClaims();
    }
  }, [isAuthenticated, user?.uid, loadUserClaims]);

  return {
    // Données
    userClaims,
    allClaims,
    claimStats,
    
    // États
    loading,
    error,
    submittingClaim,
    processingClaim,
    
    // Actions utilisateur
    submitClaim,
    loadUserClaims,
    
    // Actions admin
    loadAllClaims,
    approveClaim,
    rejectClaim,
    loadClaimStats,
    
    // Utilitaires
    refreshData,
    getUserClaimStatus,
    hasActiveClaim,
    getLastClaimForObjective
  };
};

export default useObjectiveClaims;
