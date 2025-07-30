// ==========================================
// 📁 react-app/src/shared/hooks/useObjectives.js
// HOOK REACT POUR LA GESTION DES OBJECTIFS
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useUnifiedFirebaseData } from './useUnifiedFirebaseData.js';
import { objectivesService } from '../../core/services/objectivesService.js';

/**
 * 🎯 HOOK POUR LA GESTION DES OBJECTIFS
 */
export const useObjectives = () => {
  const { user, isAuthenticated } = useAuth();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();
  
  // États locaux
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [claimingObjective, setClaimingObjective] = useState(null);

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

      // Préparer les stats utilisateur pour le calcul des objectifs
      const userStats = {
        tasksCompletedToday: gamification?.tasksCompletedToday || 0,
        weeklyXp: gamification?.weeklyXp || 0,
        monthlyXp: gamification?.monthlyXp || 0,
        currentStreak: gamification?.currentStreak || 0,
        tasksCompleted: gamification?.tasksCompleted || 0,
        earlyBirdToday: gamification?.earlyBirdToday || false
      };

      console.log('📊 Chargement objectifs avec stats:', userStats);

      const objectivesData = await objectivesService.getObjectivesForUser(user.uid, userStats);
      setObjectives(objectivesData);

      console.log(`✅ ${objectivesData.length} objectifs chargés`);

    } catch (err) {
      console.error('❌ Erreur chargement objectifs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.uid, gamification, dataLoading]);

  /**
   * 🎁 RÉCLAMER UN OBJECTIF
   */
  const claimObjective = useCallback(async (objective) => {
    if (!isAuthenticated || !user?.uid || !objective.canClaim || claimingObjective) {
      return { success: false, error: 'Conditions non remplies pour réclamer' };
    }

    try {
      setClaimingObjective(objective.id);
      setError(null);

      console.log('🎯 Réclamation objectif:', objective.title);

      const result = await objectivesService.claimObjective(user.uid, objective);

      if (result.success) {
        // Recharger les objectifs pour mettre à jour l'état
        await loadObjectives();

        console.log(`✅ Objectif réclamé: +${result.xpGained} XP`);
        
        return {
          success: true,
          xpGained: result.xpGained,
          message: `🎉 Félicitations ! +${result.xpGained} XP réclamés pour "${objective.title}"`
        };
      }

    } catch (err) {
      console.error('❌ Erreur réclamation objectif:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setClaimingObjective(null);
    }
  }, [isAuthenticated, user?.uid, claimingObjective, loadObjectives]);

  /**
   * 📊 OBTENIR LES STATISTIQUES DES OBJECTIFS
   */
  const getObjectiveStats = useCallback(() => {
    const completed = objectives.filter(obj => obj.status === 'completed').length;
    const claimed = objectives.filter(obj => obj.isClaimed).length;
    const available = objectives.filter(obj => obj.canClaim).length;
    const active = objectives.filter(obj => obj.status === 'active').length;

    return {
      total: objectives.length,
      completed,
      claimed,
      available,
      active,
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

  // Charger les objectifs au montage et lors des changements
  useEffect(() => {
    if (!dataLoading) {
      loadObjectives();
    }
  }, [loadObjectives, dataLoading]);

  // Recharger toutes les 60 secondes pour les objectifs en temps réel
  useEffect(() => {
    if (!isAuthenticated || dataLoading) return;

    const interval = setInterval(() => {
      loadObjectives();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [loadObjectives, isAuthenticated, dataLoading]);

  return {
    // État principal
    objectives,
    loading: loading || dataLoading,
    error,
    
    // Actions
    loadObjectives,
    claimObjective,
    
    // États dérivés
    stats: getObjectiveStats(),
    objectivesByType: getObjectivesByType(),
    nextObjectives: getNextObjectives(),
    claimableObjectives: getClaimableObjectives(),
    
    // Utilitaires
    isClaimingObjective: (objectiveId) => claimingObjective === objectiveId,
    hasClaimableObjectives: getClaimableObjectives().length > 0,
    
    // Données brutes pour debug
    rawGamificationData: gamification
  };
};

export default useObjectives;
