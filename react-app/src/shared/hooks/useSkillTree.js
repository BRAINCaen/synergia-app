// ==========================================
// react-app/src/shared/hooks/useSkillTree.js
// HOOK SKILL TREE RPG - SYNERGIA v5.0
// Système de compétences avec choix de talents
// ==========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import {
  skillService,
  SKILL_BRANCHES,
  SKILLS,
  TIER_CONFIG,
  getSkillLevel,
  getBranchProgress,
  getUnspentTalentPoints,
  calculateActiveBonus,
  getNextTierXP
} from '../../core/services/skillService.js';

/**
 * 🎮 Hook pour gérer l'arbre de compétences RPG
 * - Progression automatique via quêtes
 * - Choix de talents à chaque palier
 * - Calcul des bonus actifs
 */
export const useSkillTree = (options = {}) => {
  const { realTime = true } = options;
  const { user } = useAuthStore();

  // États
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userSkills, setUserSkills] = useState({});
  const [error, setError] = useState(null);
  const [lastTalentChoice, setLastTalentChoice] = useState(null);

  // ===============================================
  // DONNÉES CALCULÉES
  // ===============================================

  // Points de talent non dépensés (choix disponibles)
  const unspentPoints = useMemo(() => {
    return getUnspentTalentPoints(userSkills);
  }, [userSkills]);

  // Nombre total de points non dépensés
  const totalUnspentPoints = useMemo(() => {
    return unspentPoints.reduce((acc, sp) => acc + sp.pendingChoices, 0);
  }, [unspentPoints]);

  // Bonus actifs calculés
  const activeBonus = useMemo(() => {
    return calculateActiveBonus(userSkills);
  }, [userSkills]);

  // Stats globales par branche
  const branchStats = useMemo(() => {
    const stats = {};

    Object.entries(SKILL_BRANCHES).forEach(([branchId, branch]) => {
      const progress = getBranchProgress(branchId, userSkills);
      stats[branchId] = {
        ...branch,
        ...progress
      };
    });

    return stats;
  }, [userSkills]);

  // Stats globales toutes branches
  const globalStats = useMemo(() => {
    const allSkillIds = Object.keys(SKILLS);
    let totalXP = 0;
    let totalTalents = 0;
    let maxTalents = allSkillIds.length * 3; // 3 tiers par skill

    Object.values(userSkills).forEach(skill => {
      totalXP += skill.xp || 0;
      totalTalents += (skill.talents || []).length;
    });

    return {
      totalXP,
      totalTalents,
      maxTalents,
      talentProgress: Math.round((totalTalents / maxTalents) * 100),
      skillsStarted: Object.keys(userSkills).length,
      totalSkills: allSkillIds.length
    };
  }, [userSkills]);

  // ===============================================
  // CHARGEMENT TEMPS RÉEL
  // ===============================================

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
          const skills = await skillService.getUserSkills(user.uid);
          setUserSkills(skills);
        } catch (err) {
          console.error('❌ Erreur chargement skills:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      loadData();
      return;
    }

    // Temps réel avec onSnapshot sur la collection user_skills
    const skillsRef = doc(db, 'user_skills', user.uid);

    const unsubscribe = onSnapshot(skillsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const skills = data.skills || {};
        setUserSkills(skills);
        console.log('🌳 [SKILLS] Données chargées:', Object.keys(skills).length, 'compétences');
      } else {
        console.log('🌳 [SKILLS] Aucune donnée de compétences trouvée');
        setUserSkills({});
      }
      setLoading(false);
    }, (err) => {
      console.error('❌ Erreur subscription skills:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, realTime]);

  // ===============================================
  // ACTIONS
  // ===============================================

  /**
   * 🎯 Choisir un talent pour un skill à un tier donné
   */
  const chooseTalent = useCallback(async (skillId, tier, talentId) => {
    if (!user?.uid) return { success: false, error: 'Non connecté' };
    if (processing) return { success: false, error: 'Traitement en cours' };

    setProcessing(true);
    setError(null);

    try {
      const result = await skillService.chooseTalent(user.uid, skillId, tier, talentId);

      if (result.success) {
        setLastTalentChoice({
          skillId,
          tier,
          talentId,
          talent: result.talent,
          timestamp: new Date()
        });
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      console.error('❌ Erreur choix talent:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  }, [user?.uid, processing]);

  /**
   * ➕ Ajouter de l'XP à un skill (pour tests/admin)
   */
  const addSkillXP = useCallback(async (skillId, amount) => {
    if (!user?.uid) return { success: false, error: 'Non connecté' };

    try {
      return await skillService.addSkillXP(user.uid, skillId, amount);
    } catch (err) {
      console.error('❌ Erreur ajout XP skill:', err);
      return { success: false, error: err.message };
    }
  }, [user?.uid]);

  // ===============================================
  // GETTERS
  // ===============================================

  /**
   * 📊 Obtenir les infos d'un skill pour l'utilisateur
   */
  const getSkillInfo = useCallback((skillId) => {
    const skillDef = SKILLS[skillId];
    if (!skillDef) return null;

    const userSkill = userSkills[skillId] || { xp: 0, talents: [] };
    const level = getSkillLevel(userSkill.xp);
    const nextTierXP = getNextTierXP(userSkill.xp);

    // Calculer les tiers atteints vs talents choisis
    const tiersReached = level;
    const talentsChosen = userSkill.talents?.length || 0;
    const pendingChoices = tiersReached - talentsChosen;

    // Progression vers le prochain tier
    let progressToNext = 0;
    if (level < 3 && nextTierXP) {
      const currentTierXP = level === 0 ? 0 : TIER_CONFIG[level].xpRequired;
      progressToNext = Math.round(((userSkill.xp - currentTierXP) / (nextTierXP - currentTierXP)) * 100);
    } else if (level >= 3) {
      progressToNext = 100;
    }

    return {
      ...skillDef,
      xp: userSkill.xp,
      level,
      tiersReached,
      talentsChosen,
      pendingChoices,
      chosenTalents: userSkill.talents || [],
      progressToNext,
      nextTierXP,
      isMaxed: level >= 3 && talentsChosen >= 3
    };
  }, [userSkills]);

  /**
   * 🌳 Obtenir les skills d'une branche avec leur statut
   */
  const getBranchSkills = useCallback((branchId) => {
    const branch = SKILL_BRANCHES[branchId];
    if (!branch) return [];

    return branch.skills.map(skillId => getSkillInfo(skillId)).filter(Boolean);
  }, [getSkillInfo]);

  /**
   * 🎁 Obtenir les talents disponibles pour un skill à un tier
   */
  const getAvailableTalents = useCallback((skillId, tier) => {
    const skillDef = SKILLS[skillId];
    if (!skillDef) return [];

    const tierData = skillDef.tiers?.[tier];
    if (!tierData) return [];

    const userSkill = userSkills[skillId] || { xp: 0, talents: [] };
    const chosenTalents = userSkill.talents || [];

    // Vérifier si ce tier a déjà un talent choisi
    const hasTierTalent = chosenTalents.some(t => t.tier === tier);
    if (hasTierTalent) return [];

    return tierData.options.map(talent => ({
      ...talent,
      tier,
      skillId
    }));
  }, [userSkills]);

  /**
   * ✅ Vérifier si un talent est choisi
   */
  const isTalentChosen = useCallback((skillId, talentId) => {
    const userSkill = userSkills[skillId] || { talents: [] };
    return userSkill.talents?.some(t => t.id === talentId) || false;
  }, [userSkills]);

  /**
   * 🔍 Obtenir tous les skills avec choix de talent en attente
   */
  const getSkillsWithPendingChoices = useCallback(() => {
    return unspentPoints.map(sp => ({
      ...getSkillInfo(sp.skillId),
      pendingTiers: sp.pendingTiers
    }));
  }, [unspentPoints, getSkillInfo]);

  /**
   * 🎯 Obtenir le résumé des bonus par type
   */
  const getBonusSummary = useCallback(() => {
    const summary = {};

    Object.entries(activeBonus).forEach(([type, value]) => {
      // Formatter le nom du bonus
      const name = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      summary[type] = {
        name,
        value,
        formatted: type.includes('xp') || type.includes('bonus')
          ? `+${value}%`
          : `+${value}`
      };
    });

    return summary;
  }, [activeBonus]);

  return {
    // États
    loading,
    processing,
    error,
    lastTalentChoice,

    // Données utilisateur
    userSkills,
    unspentPoints,
    totalUnspentPoints,
    activeBonus,
    branchStats,
    globalStats,

    // Actions
    chooseTalent,
    addSkillXP,

    // Getters
    getSkillInfo,
    getBranchSkills,
    getAvailableTalents,
    isTalentChosen,
    getSkillsWithPendingChoices,
    getBonusSummary,

    // Constantes
    SKILL_BRANCHES,
    SKILLS,
    TIER_CONFIG
  };
};

export default useSkillTree;
