// ==========================================
// 📁 react-app/src/shared/hooks/useRealObjectives.js
// HOOK POUR OBJECTIFS CONNECTÉS AUX VRAIES DONNÉES FIREBASE
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { realObjectivesService } from '../../core/services/realObjectivesService.js';

/**
 * 🎯 HOOK POUR OBJECTIFS CONNECTÉS À FIREBASE
 */
export const useRealObjectives = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // États locaux
  const [objectives, setObjectives] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingObjective, setClaimingObjective] = useState(null);

  /**
   * 📊 CHARGER LES OBJECTIFS AVEC PROGRESSION RÉELLE
   */
  const loadObjectives = useCallback((stats) => {
    try {
      console.log('📊 Calcul objectifs avec stats réelles:', stats);
      
      const objectivesWithRealData = realObjectivesService.getObjectivesWithRealData(stats);
      
      // Calculer le status et canClaim pour chaque objectif
      const objectivesWithStatus = objectivesWithRealData.map(objective => {
        const isCompleted = objective.progress >= 100;
        const isAlreadyClaimed = false; // TODO: vérifier les réclamations
        
        return {
          ...objective,
          status: isCompleted ? 'completed' : 'active',
          isClaimed: isAlreadyClaimed,
          canClaim: isCompleted && !isAlreadyClaimed,
          categoryBonus: realObjectivesService.calculateCategoryBonus(objective.category),
          totalXpReward: objective.xpReward + realObjectivesService.calculateCategoryBonus(objective.category)
        };
      });
      
      setObjectives(objectivesWithStatus);
      console.log('✅ Objectifs chargés avec données réelles:', objectivesWithStatus.length);
      
    } catch (err) {
      console.error('❌ Erreur chargement objectifs:', err);
      setError(err.message);
    }
  }, []);

  /**
   * 🔄 S'ABONNER AUX STATS EN TEMPS RÉEL
   */
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setLoading(false);
      return;
    }

    console.log('🔄 Abonnement aux stats temps réel pour:', user.uid);
    setLoading(true);
    setError(null);

    // S'abonner aux changements de stats utilisateur
    const unsubscribe = realObjectivesService.subscribeToUserStats(user.uid, (newStats) => {
      console.log('📊 Nouvelles stats reçues:', newStats);
      setUserStats(newStats);
      loadObjectives(newStats);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Nettoyage abonnement stats');
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user?.uid, loadObjectives]);

  /**
   * 🎁 RÉCLAMER UN OBJECTIF RÉEL
   */
  const claimObjective = useCallback(async (objective) => {
    if (!isAuthenticated || !user?.uid || !objective.canClaim || claimingObjective) {
      return { success: false, error: 'Conditions non remplies' };
    }

    try {
      setClaimingObjective(objective.id);
      setError(null);

      console.log('🎯 Réclamation objectif réel:', objective.title);

      const result = await realObjectivesService.claimRealObjective(user.uid, objective);

      if (result.success) {
        // Mettre à jour localement (sera confirmé par l'abonnement temps réel)
        setObjectives(prev => prev.map(obj => 
          obj.id === objective.id 
            ? { ...obj, isClaimed: true, canClaim: false }
            : obj
        ));

        console.log(`✅ Objectif réclamé: +${result.xpGained} XP`);
        
        return {
          success: true,
          xpGained: result.xpGained,
          baseXp: result.baseXp,
          bonusXp: result.bonusXp,
          levelUp: result.levelUp,
          newLevel: result.newLevel,
          message: `🎉 +${result.xpGained} XP réclamés pour "${objective.title}"!${result.levelUp ? ` 🎊 Niveau ${result.newLevel} atteint !` : ''}`
        };
      }

    } catch (err) {
      console.error('❌ Erreur réclamation objectif réel:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setClaimingObjective(null);
    }
  }, [isAuthenticated, user?.uid, claimingObjective]);

  /**
   * 📈 INCRÉMENTER UNE STATISTIQUE
   */
  const incrementStat = useCallback(async (statField, increment = 1) => {
    if (!isAuthenticated || !user?.uid) {
      return { success: false, error: 'Non connecté' };
    }

    try {
      await realObjectivesService.incrementUserStat(user.uid, statField, increment);
      console.log(`✅ Stat incrémentée: ${statField} +${increment}`);
      return { success: true };
    } catch (err) {
      console.error('❌ Erreur incrémentation stat:', err);
      return { success: false, error: err.message };
    }
  }, [isAuthenticated, user?.uid]);

  /**
   * 📊 OBTENIR LES STATISTIQUES DES OBJECTIFS
   */
  const getObjectiveStats = useCallback(() => {
    const completed = objectives.filter(obj => obj.status === 'completed').length;
    const claimed = objectives.filter(obj => obj.isClaimed).length;
    const available = objectives.filter(obj => obj.canClaim).length;
    const active = objectives.filter(obj => obj.status === 'active').length;
    const daily = objectives.filter(obj => obj.type === 'daily').length;
    const weekly = objectives.filter(obj => obj.type === 'weekly').length;

    return {
      total: objectives.length,
      completed,
      claimed,
      available,
      active,
      daily,
      weekly,
      completionRate: objectives.length > 0 ? Math.round((completed / objectives.length) * 100) : 0
    };
  }, [objectives]);

  /**
   * 🎯 OBTENIR LES OBJECTIFS PAR CATÉGORIE
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
      .filter(obj => obj.status === 'active' && !obj.isClaimed)
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
   * 🎮 FONCTIONS D'AIDE POUR INCRÉMENTER LES STATS SPÉCIFIQUES
   */
  const gameMasterActions = {
    // Actions quotidiennes
    proposeImprovement: () => incrementStat('improvementsToday'),
    handleSurpriseTeam: () => incrementStat('surpriseTeamsToday'),
    receiveFiveStarReview: () => incrementStat('fiveStarReviewsToday'),
    helpColleague: () => incrementStat('colleagueHelpsToday'),
    completeSecurityCheck: () => incrementStat('securityCheckToday', 1),
    resolveConflict: () => incrementStat('conflictsResolvedToday'),
    fixTechnicalIssue: () => incrementStat('technicalFixesToday'),
    createSocialContent: () => incrementStat('socialContentToday'),
    
    // Actions hebdomadaires
    receivePositiveReview: () => incrementStat('positiveReviewsThisWeek'),
    recordOpening: () => incrementStat('openingsThisWeek'),
    recordClosing: () => incrementStat('closingsThisWeek'),
    completeWeekendWork: () => incrementStat('weekendWorkedThisWeek', 1),
    animateRoom: (roomType) => {
      // Logic plus complexe pour les salles animées
      // TODO: Implémenter l'ajout à l'array roomsAnimatedThisWeek
      console.log(`🎭 Salle animée: ${roomType}`);
    }
  };

  return {
    // État principal
    objectives,
    userStats,
    loading,
    error,
    
    // Actions
    claimObjective,
    incrementStat,
    
    // Actions Game Master spécialisées
    gameMasterActions,
    
    // États dérivés
    stats: getObjectiveStats(),
    objectivesByType: getObjectivesByType(),
    nextObjectives: getNextObjectives(),
    claimableObjectives: getClaimableObjectives(),
    
    // Utilitaires
    isClaimingObjective: (objectiveId) => claimingObjective === objectiveId,
    hasClaimableObjectives: getClaimableObjectives().length > 0,
    
    // Données brutes pour debug
    rawUserStats: userStats
  };
};

export default useRealObjectives;
