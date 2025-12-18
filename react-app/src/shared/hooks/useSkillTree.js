// ==========================================
// react-app/src/shared/hooks/useSkillTree.js
// HOOK SKILL TREE - SYNERGIA v4.0
// Module Skill Tree: Arbre de competences
// ==========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import {
  skillTreeService,
  SKILLS,
  SKILL_BRANCHES
} from '../../core/services/skillTreeService.js';
import { calculateLevel } from '../../core/services/levelService.js';

/**
 * Hook pour gerer l'arbre de competences
 */
export const useSkillTree = (options = {}) => {
  const { realTime = true } = options;
  const { user } = useAuthStore();

  // Etats
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedSkills, setUnlockedSkills] = useState([]);
  const [skillPoints, setSkillPoints] = useState(0);
  const [totalPointsSpent, setTotalPointsSpent] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [error, setError] = useState(null);
  const [lastUnlock, setLastUnlock] = useState(null);

  // Calculer les points disponibles
  const availablePoints = useMemo(() => {
    return skillTreeService.calculateAvailablePoints(userLevel, totalPointsSpent);
  }, [userLevel, totalPointsSpent]);

  // Obtenir les stats globales
  const globalStats = useMemo(() => {
    return skillTreeService.getGlobalStats(unlockedSkills);
  }, [unlockedSkills]);

  // Competences disponibles au deblocage
  const availableSkills = useMemo(() => {
    return skillTreeService.getAvailableSkills(unlockedSkills, availablePoints);
  }, [unlockedSkills, availablePoints]);

  // Competences presque disponibles
  const almostAvailableSkills = useMemo(() => {
    return skillTreeService.getAlmostAvailableSkills(unlockedSkills, availablePoints);
  }, [unlockedSkills, availablePoints]);

  // Charger les donnees en temps reel
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    if (!realTime) {
      // Chargement unique
      const loadData = async () => {
        setLoading(true);
        try {
          const skills = await skillTreeService.getUserSkills(user.uid);
          setUnlockedSkills(skills.unlockedSkills);
          setTotalPointsSpent(skills.totalPointsSpent);
        } catch (err) {
          console.error('Erreur chargement skill tree:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      loadData();
      return;
    }

    // Temps reel avec onSnapshot
    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        // Gamification data
        const gamification = data.gamification || {};
        const totalXp = gamification.totalXp || 0;
        const level = calculateLevel(totalXp);
        setUserLevel(level);

        // Skill tree data
        const skillTree = data.skillTree || {};
        setUnlockedSkills(skillTree.unlockedSkills || []);
        setTotalPointsSpent(skillTree.totalPointsSpent || 0);
      }

      setLoading(false);
    }, (err) => {
      console.error('Erreur subscription skill tree:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, realTime]);

  /**
   * Verifier si une competence peut etre debloquee
   */
  const canUnlock = useCallback((skillId) => {
    return skillTreeService.canUnlockSkill(skillId, unlockedSkills, availablePoints);
  }, [unlockedSkills, availablePoints]);

  /**
   * Debloquer une competence
   */
  const unlockSkill = useCallback(async (skillId) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };
    if (unlocking) return { success: false, error: 'Deblocage en cours' };

    setUnlocking(true);
    setError(null);

    try {
      const result = await skillTreeService.unlockSkill(user.uid, skillId);

      if (result.success) {
        setLastUnlock({
          skill: result.skill,
          timestamp: new Date()
        });
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      console.error('Erreur deblocage skill:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUnlocking(false);
    }
  }, [user?.uid, unlocking]);

  /**
   * Verifier si une competence est debloquee
   */
  const isUnlocked = useCallback((skillId) => {
    return unlockedSkills.includes(skillId);
  }, [unlockedSkills]);

  /**
   * Obtenir le statut d'une competence
   */
  const getSkillStatus = useCallback((skillId) => {
    if (isUnlocked(skillId)) return 'unlocked';

    const check = canUnlock(skillId);
    if (check.canUnlock) return 'available';

    // Verifier si prereqs manquants ou points manquants
    const skill = SKILLS[skillId];
    if (!skill) return 'locked';

    const hasPrereqs = skill.requires.every(req => unlockedSkills.includes(req));
    if (!hasPrereqs) return 'locked';

    return 'needs_points';
  }, [isUnlocked, canUnlock, unlockedSkills]);

  /**
   * Obtenir la progression d'une branche
   */
  const getBranchProgress = useCallback((branchId) => {
    return skillTreeService.getBranchProgress(branchId, unlockedSkills);
  }, [unlockedSkills]);

  /**
   * Obtenir les competences d'une branche avec leur statut
   */
  const getBranchSkillsWithStatus = useCallback((branchId) => {
    const branchSkills = skillTreeService.getSkillsByBranch(branchId);

    return branchSkills.map(skill => ({
      ...skill,
      status: getSkillStatus(skill.id),
      checkResult: canUnlock(skill.id)
    }));
  }, [getSkillStatus, canUnlock]);

  return {
    // Etats
    loading,
    unlocking,
    error,
    lastUnlock,

    // Donnees
    unlockedSkills,
    availablePoints,
    totalPointsSpent,
    userLevel,
    globalStats,
    availableSkills,
    almostAvailableSkills,

    // Actions
    unlockSkill,
    canUnlock,
    isUnlocked,
    getSkillStatus,
    getBranchProgress,
    getBranchSkillsWithStatus,

    // Constantes
    SKILLS,
    SKILL_BRANCHES
  };
};

export default useSkillTree;
