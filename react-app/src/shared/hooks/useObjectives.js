// ==========================================
// 📁 react-app/src/shared/hooks/useObjectives.js
// HOOK REACT POUR LA GESTION DES OBJECTIFS AVEC RÉCLAMATION
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useUnifiedFirebaseData } from './useUnifiedFirebaseData.js';
import { objectivesService } from '../../core/services/objectivesService.js';
import { objectiveClaimService } from '../../core/services/objectiveClaimService.js';

/**
 * 🎯 HOOK POUR LA GESTION DES OBJECTIFS AVEC SYSTÈME DE RÉCLAMATION
 */
export const useObjectives = () => {
  const { user, isAuthenticated } = useAuth();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();
  
  // États locaux
  const [objectives, setObjectives] = useState([]);
  const [userClaims, setUserClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(null);

  /**
   * 📥 CHARGER LES OBJECTIFS POUR L'UTILISATEUR ACTUEL
   */
  const loadObjectives = useCallback(async () => {
    if (!isAuthenticated || !user?.uid || dataLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Préparer les stats utilisateur pour les objectifs quotidiens et hebdomadaires
      const userStats = {
        // === OBJECTIFS QUOTIDIENS ===
        // Innovation & partage
        improvementProposedToday: gamification?.improvementProposedToday || false,
        socialContentToday: gamification?.socialContentToday || false,
        
        // Flexibilité & gestion d'équipe
        surpriseTeamHandledToday: gamification?.surpriseTeamHandledToday || false,
        teamImproveActionToday: gamification?.teamImproveActionToday || false,
        
        // Service client & sécurité
        clientNeedAddressedToday: gamification?.clientNeedAddressedToday || false,
        securityActionToday: gamification?.securityActionToday || false,
        
        // === OBJECTIFS HEBDOMADAIRES ===
        // Maintenance & marketing
        equipmentMaintained: gamification?.equipmentMaintained || false,
        socialMediaContentShared: gamification?.socialMediaContentShared || false,
        
        // Responsabilité & dévouement
        responsibilityTakenWeekly: gamification?.responsibilityTakenWeekly || false,
        extraHoursWorkedWeekly: gamification?.extraHoursWorkedWeekly || false,
        
        // Polyvalence & créativité
        departmentHelpProvided: gamification?.departmentHelpProvided || false,
        unexpectedSituationHandled: gamification?.unexpectedSituationHandled || false,
        
        // Données de base (conservées pour compatibilité)
        weeklyXp: gamification?.weeklyXp || 0,
        monthlyXp: gamification?.monthlyXp || 0,
        currentStreak: gamification?.currentStreak || 0,
        tasksCompleted: gamification?.tasksCompleted || 0
      };

      console.log('📊 Chargement objectifs avec stats:', userStats);

      // Charger les objectifs et les réclamations en parallèle
      const [objectivesData, claimsData] = await Promise.all([
        objectivesService.getObjectivesForUser(user.uid, userStats),
        objectiveClaimService.getUserClaims(user.uid)
      ]);

      // Enrichir les objectifs avec le statut des réclamations
      const enrichedObjectives = objectivesData.map(objective => {
        const activeClaim = claimsData.find(claim => 
          claim.objectiveId === objective.id && 
          claim.status === 'pending'
        );

        const approvedClaim = claimsData.find(claim => 
          claim.objectiveId === objective.id && 
          claim.status === 'approved'
        );

        return {
          ...objective,
          hasActiveClaim: !!activeClaim,
          isAlreadyClaimed: !!approvedClaim,
          canClaim: objective.canClaim && !activeClaim && !approvedClaim,
          claimStatus: activeClaim ? 'pending' : approvedClaim ? 'approved' : null,
          lastClaim: claimsData
            .filter(claim => claim.objectiveId === objective.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
        };
      });

      setObjectives(enrichedObjectives);
      setUserClaims(claimsData);

      console.log(`✅ ${enrichedObjectives.length} objectifs chargés avec statut réclamations`);

    } catch (err) {
      console.error('❌ Erreur chargement objectifs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.uid, gamification, dataLoading]);

  /**
   * 📝 SOUMETTRE UNE RÉCLAMATION D'OBJECTIF
   */
  const submitObjectiveClaim = useCallback(async (objective, evidence = '') => {
    if (!isAuthenticated || !user?.uid || !objective.canClaim || submittingClaim) {
      return { success: false, error: 'Conditions non remplies pour soumettre la réclamation' };
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
        // Recharger les objectifs pour mettre à jour l'état
        await loadObjectives();

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
      console.error('❌ Erreur soumission réclamation objectif:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setSubmittingClaim(null);
    }
  }, [isAuthenticated, user?.uid, submittingClaim, loadObjectives]);

  /**
   * 🎁 MÉTHODE HÉRITÉE POUR COMPATIBILITÉ (maintenant redirige vers submitObjectiveClaim)
   */
  const claimObjective = useCallback(async (objective, evidence = '') => {
    console.log('⚠️ Utilisation de claimObjective() héritée - redirection vers submitObjectiveClaim()');
    return await submitObjectiveClaim(objective, evidence);
  }, [submitObjectiveClaim]);

  /**
   * 📊 OBTENIR LES STATISTIQUES DES OBJECTIFS
   */
  const getObjectiveStats = useCallback(() => {
    const completed = objectives.filter(obj => obj.status === 'completed').length;
    const claimed = objectives.filter(obj => obj.isAlreadyClaimed).length;
    const pending = objectives.filter(obj => obj.hasActiveClaim).length;
    const available = objectives.filter(obj => obj.canClaim).length;
    const active = objectives.filter(obj => obj.status === 'active').length;

    return {
      total: objectives.length,
      completed,
      claimed,
      pending,
      available,
      active,
      completionRate: objectives.length > 0 ? Math.round((completed / objectives.length) * 100) : 0
    };
  }, [objectives]);

  /**
   * 🎯 OBTENIR LES OBJECTIFS PAR TYPE
   */
  const getObjectivesByType = useCallback(() => {
    const grouped = objectives.reduce((acc, objective) => {
      const type = objective.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(objective);
      return acc;
    }, {});

    return grouped;
  }, [objectives]);

  /**
   * 🏆 OBTENIR LES PROCHAINS OBJECTIFS À COMPLÉTER
   */
  const getNextObjectives = useCallback(() => {
    return objectives
      .filter(obj => obj.status === 'active' && !obj.isAlreadyClaimed && !obj.hasActiveClaim)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }, [objectives]);

  /**
   * 🎁 OBTENIR LES OBJECTIFS PRÊTS À ÊTRE RÉCLAMÉS
   */
  const getClaimableObjectives = useCallback(() => {
    return objectives.filter(obj => obj.canClaim);
  }, [objectives]);

  /**
   * ⏳ OBTENIR LES RÉCLAMATIONS EN ATTENTE
   */
  const getPendingClaims = useCallback(() => {
    return userClaims.filter(claim => claim.status === 'pending');
  }, [userClaims]);

  /**
   * ✅ OBTENIR LES RÉCLAMATIONS APPROUVÉES
   */
  const getApprovedClaims = useCallback(() => {
    return userClaims.filter(claim => claim.status === 'approved');
  }, [userClaims]);

  /**
   * ❌ OBTENIR LES RÉCLAMATIONS REJETÉES
   */
  const getRejectedClaims = useCallback(() => {
    return userClaims.filter(claim => claim.status === 'rejected');
  }, [userClaims]);

  /**
   * 📈 OBTENIR LES STATISTIQUES DES RÉCLAMATIONS
   */
  const getClaimStats = useCallback(() => {
    const pending = getPendingClaims().length;
    const approved = getApprovedClaims().length;
    const rejected = getRejectedClaims().length;
    const total = userClaims.length;
    
    const totalXPEarned = getApprovedClaims()
      .reduce((sum, claim) => sum + (claim.xpAmount || 0), 0);

    return {
      total,
      pending,
      approved,
      rejected,
      totalXPEarned,
      successRate: total > 0 ? Math.round((approved / total) * 100) : 0
    };
  }, [userClaims, getPendingClaims, getApprovedClaims, getRejectedClaims]);

  /**
   * 🔍 VÉRIFIER SI UN OBJECTIF A UNE RÉCLAMATION ACTIVE
   */
  const hasActiveClaim = useCallback((objectiveId) => {
    return userClaims.some(claim => 
      claim.objectiveId === objectiveId && 
      claim.status === 'pending'
    );
  }, [userClaims]);

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const refreshData = useCallback(async () => {
    await loadObjectives();
  }, [loadObjectives]);

  // Charger les objectifs au montage et lors des changements
  useEffect(() => {
    if (!dataLoading) {
      loadObjectives();
    }
  }, [loadObjectives, dataLoading]);

  // Recharger toutes les 2 minutes pour les objectifs en temps réel
  useEffect(() => {
    if (!isAuthenticated || dataLoading) return;

    const interval = setInterval(() => {
      loadObjectives();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [loadObjectives, isAuthenticated, dataLoading]);

  return {
    // État principal
    objectives,
    userClaims,
    loading: loading || dataLoading,
    error,
    
    // Actions principales
    loadObjectives,
    submitObjectiveClaim,
    refreshData,
    
    // Action héritée pour compatibilité
    claimObjective,
    
    // États dérivés - Objectifs
    stats: getObjectiveStats(),
    objectivesByType: getObjectivesByType(),
    nextObjectives: getNextObjectives(),
    claimableObjectives: getClaimableObjectives(),
    
    // États dérivés - Réclamations
    pendingClaims: getPendingClaims(),
    approvedClaims: getApprovedClaims(),
    rejectedClaims: getRejectedClaims(),
    claimStats: getClaimStats(),
    
    // Utilitaires
    isSubmittingClaim: (objectiveId) => submittingClaim === objectiveId,
    hasClaimableObjectives: getClaimableObjectives().length > 0,
    hasPendingClaims: getPendingClaims().length > 0,
    hasActiveClaim,
    
    // Données brutes pour debug
    rawGamificationData: gamification
  };
};

export default useObjectives;
