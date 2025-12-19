// ==========================================
// react-app/src/core/services/skillTreeService.js
// SERVICE SKILL TREE - SYNERGIA v4.0
// Module Skill Tree: Arbre de competences
// ==========================================

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// DEFINITION DE L'ARBRE DE COMPETENCES
// ==========================================

export const SKILL_BRANCHES = {
  productivity: {
    id: 'productivity',
    name: 'Productivite',
    emoji: '⚡',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/20',
    description: 'Ameliorez votre efficacite et votre rendement'
  },
  teamwork: {
    id: 'teamwork',
    name: 'Collaboration',
    emoji: '🤝',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    description: 'Renforcez vos competences d\'equipe'
  },
  leadership: {
    id: 'leadership',
    name: 'Leadership',
    emoji: '👑',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20',
    description: 'Developpez vos qualites de leader'
  },
  mastery: {
    id: 'mastery',
    name: 'Maitrise',
    emoji: '🎯',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/20',
    description: 'Perfectionnez vos competences techniques'
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation',
    emoji: '💡',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/20',
    description: 'Cultivez votre creativite et innovation'
  }
};

// Arbre de competences complet
export const SKILLS = {
  // ====== BRANCHE PRODUCTIVITE ======
  // Tier 1
  focus_basic: {
    id: 'focus_basic',
    name: 'Concentration',
    branch: 'productivity',
    tier: 1,
    emoji: '🎯',
    description: 'Ameliore la concentration sur les taches',
    effect: '+5% XP sur taches completees',
    xpBonus: 5,
    cost: 1,
    requires: [],
    position: { x: 0, y: 0 }
  },
  speed_basic: {
    id: 'speed_basic',
    name: 'Rapidite',
    branch: 'productivity',
    tier: 1,
    emoji: '⚡',
    description: 'Complete les taches plus rapidement',
    effect: 'Bonus temps sur taches urgentes',
    xpBonus: 3,
    cost: 1,
    requires: [],
    position: { x: 1, y: 0 }
  },
  // Tier 2
  multitask: {
    id: 'multitask',
    name: 'Multitache',
    branch: 'productivity',
    tier: 2,
    emoji: '🔄',
    description: 'Gere plusieurs taches simultanement',
    effect: '+10% XP quand 3+ taches/jour',
    xpBonus: 10,
    cost: 2,
    requires: ['focus_basic', 'speed_basic'],
    position: { x: 0.5, y: 1 }
  },
  efficiency: {
    id: 'efficiency',
    name: 'Efficacite',
    branch: 'productivity',
    tier: 2,
    emoji: '📈',
    description: 'Optimise le rendement global',
    effect: '+8% XP sur toutes les taches',
    xpBonus: 8,
    cost: 2,
    requires: ['focus_basic'],
    position: { x: -0.5, y: 1 }
  },
  // Tier 3
  productivity_master: {
    id: 'productivity_master',
    name: 'Maitre Productif',
    branch: 'productivity',
    tier: 3,
    emoji: '🏆',
    description: 'Maitrise ultime de la productivite',
    effect: '+15% XP global + Badge special',
    xpBonus: 15,
    cost: 3,
    requires: ['multitask', 'efficiency'],
    position: { x: 0, y: 2 }
  },

  // ====== BRANCHE COLLABORATION ======
  // Tier 1
  team_spirit: {
    id: 'team_spirit',
    name: 'Esprit d\'Equipe',
    branch: 'teamwork',
    tier: 1,
    emoji: '💪',
    description: 'Renforce la cohesion d\'equipe',
    effect: '+5% XP sur defis d\'equipe',
    xpBonus: 5,
    cost: 1,
    requires: [],
    position: { x: 0, y: 0 }
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    branch: 'teamwork',
    tier: 1,
    emoji: '💬',
    description: 'Ameliore les echanges',
    effect: 'Bonus sur pulses partages',
    xpBonus: 3,
    cost: 1,
    requires: [],
    position: { x: 1, y: 0 }
  },
  // Tier 2
  synergy: {
    id: 'synergy',
    name: 'Synergie',
    branch: 'teamwork',
    tier: 2,
    emoji: '🔗',
    description: 'Cree des synergies puissantes',
    effect: '+10% XP contributions pool',
    xpBonus: 10,
    cost: 2,
    requires: ['team_spirit', 'communication'],
    position: { x: 0.5, y: 1 }
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat',
    branch: 'teamwork',
    tier: 2,
    emoji: '🎓',
    description: 'Guide les nouveaux membres',
    effect: '+8% XP aide equipe',
    xpBonus: 8,
    cost: 2,
    requires: ['team_spirit'],
    position: { x: -0.5, y: 1 }
  },
  // Tier 3
  team_master: {
    id: 'team_master',
    name: 'Champion d\'Equipe',
    branch: 'teamwork',
    tier: 3,
    emoji: '🤝',
    description: 'Leader naturel de l\'equipe',
    effect: '+15% XP equipe + Badge special',
    xpBonus: 15,
    cost: 3,
    requires: ['synergy', 'mentoring'],
    position: { x: 0, y: 2 }
  },

  // ====== BRANCHE LEADERSHIP ======
  // Tier 1
  initiative: {
    id: 'initiative',
    name: 'Initiative',
    branch: 'leadership',
    tier: 1,
    emoji: '🚀',
    description: 'Prend l\'initiative sur les projets',
    effect: '+5% XP creation taches',
    xpBonus: 5,
    cost: 1,
    requires: [],
    position: { x: 0, y: 0 }
  },
  decision: {
    id: 'decision',
    name: 'Decision',
    branch: 'leadership',
    tier: 1,
    emoji: '⚖️',
    description: 'Prend des decisions eclairees',
    effect: 'Bonus validation taches',
    xpBonus: 3,
    cost: 1,
    requires: [],
    position: { x: 1, y: 0 }
  },
  // Tier 2
  strategy: {
    id: 'strategy',
    name: 'Strategie',
    branch: 'leadership',
    tier: 2,
    emoji: '🗺️',
    description: 'Planifie avec vision',
    effect: '+10% XP campagnes',
    xpBonus: 10,
    cost: 2,
    requires: ['initiative', 'decision'],
    position: { x: 0.5, y: 1 }
  },
  inspiration: {
    id: 'inspiration',
    name: 'Inspiration',
    branch: 'leadership',
    tier: 2,
    emoji: '✨',
    description: 'Inspire l\'equipe',
    effect: '+8% XP defis lances',
    xpBonus: 8,
    cost: 2,
    requires: ['initiative'],
    position: { x: -0.5, y: 1 }
  },
  // Tier 3
  leader_master: {
    id: 'leader_master',
    name: 'Grand Leader',
    branch: 'leadership',
    tier: 3,
    emoji: '👑',
    description: 'Leader accompli et respecte',
    effect: '+15% XP leadership + Badge special',
    xpBonus: 15,
    cost: 3,
    requires: ['strategy', 'inspiration'],
    position: { x: 0, y: 2 }
  },

  // ====== BRANCHE MAITRISE ======
  // Tier 1
  precision: {
    id: 'precision',
    name: 'Precision',
    branch: 'mastery',
    tier: 1,
    emoji: '🎯',
    description: 'Travail precis et soigne',
    effect: '+5% XP taches parfaites',
    xpBonus: 5,
    cost: 1,
    requires: [],
    position: { x: 0, y: 0 }
  },
  consistency: {
    id: 'consistency',
    name: 'Regularite',
    branch: 'mastery',
    tier: 1,
    emoji: '📊',
    description: 'Performance constante',
    effect: 'Bonus streak journalier',
    xpBonus: 3,
    cost: 1,
    requires: [],
    position: { x: 1, y: 0 }
  },
  // Tier 2
  expertise: {
    id: 'expertise',
    name: 'Expertise',
    branch: 'mastery',
    tier: 2,
    emoji: '🔬',
    description: 'Connaissance approfondie',
    effect: '+10% XP specialisation',
    xpBonus: 10,
    cost: 2,
    requires: ['precision', 'consistency'],
    position: { x: 0.5, y: 1 }
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    branch: 'mastery',
    tier: 2,
    emoji: '💎',
    description: 'Vise l\'excellence',
    effect: '+8% XP qualite',
    xpBonus: 8,
    cost: 2,
    requires: ['precision'],
    position: { x: -0.5, y: 1 }
  },
  // Tier 3
  mastery_master: {
    id: 'mastery_master',
    name: 'Grand Maitre',
    branch: 'mastery',
    tier: 3,
    emoji: '🏅',
    description: 'Maitrise absolue du domaine',
    effect: '+15% XP maitrise + Badge special',
    xpBonus: 15,
    cost: 3,
    requires: ['expertise', 'perfectionist'],
    position: { x: 0, y: 2 }
  },

  // ====== BRANCHE INNOVATION ======
  // Tier 1
  creativity: {
    id: 'creativity',
    name: 'Creativite',
    branch: 'innovation',
    tier: 1,
    emoji: '🎨',
    description: 'Pense de maniere creative',
    effect: '+5% XP idees nouvelles',
    xpBonus: 5,
    cost: 1,
    requires: [],
    position: { x: 0, y: 0 }
  },
  curiosity: {
    id: 'curiosity',
    name: 'Curiosite',
    branch: 'innovation',
    tier: 1,
    emoji: '🔍',
    description: 'Explore de nouvelles pistes',
    effect: 'Bonus exploration',
    xpBonus: 3,
    cost: 1,
    requires: [],
    position: { x: 1, y: 0 }
  },
  // Tier 2
  problem_solving: {
    id: 'problem_solving',
    name: 'Resolution',
    branch: 'innovation',
    tier: 2,
    emoji: '🧩',
    description: 'Resout les problemes complexes',
    effect: '+10% XP defis difficiles',
    xpBonus: 10,
    cost: 2,
    requires: ['creativity', 'curiosity'],
    position: { x: 0.5, y: 1 }
  },
  adaptability: {
    id: 'adaptability',
    name: 'Adaptabilite',
    branch: 'innovation',
    tier: 2,
    emoji: '🌊',
    description: 'S\'adapte aux changements',
    effect: '+8% XP flexibilite',
    xpBonus: 8,
    cost: 2,
    requires: ['creativity'],
    position: { x: -0.5, y: 1 }
  },
  // Tier 3
  innovation_master: {
    id: 'innovation_master',
    name: 'Visionnaire',
    branch: 'innovation',
    tier: 3,
    emoji: '💡',
    description: 'Innovateur visionnaire',
    effect: '+15% XP innovation + Badge special',
    xpBonus: 15,
    cost: 3,
    requires: ['problem_solving', 'adaptability'],
    position: { x: 0, y: 2 }
  }
};

// ==========================================
// SERVICE SKILL TREE
// ==========================================

class SkillTreeService {
  constructor() {
    this.skills = SKILLS;
    this.branches = SKILL_BRANCHES;
  }

  /**
   * Obtenir les competences d'un utilisateur
   */
  async getUserSkills(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return { unlockedSkills: [], skillPoints: 0 };

      const data = userDoc.data();
      return {
        unlockedSkills: data.skillTree?.unlockedSkills || [],
        skillPoints: data.skillTree?.skillPoints || 0,
        totalPointsSpent: data.skillTree?.totalPointsSpent || 0
      };
    } catch (error) {
      console.error('Erreur recuperation skills:', error);
      return { unlockedSkills: [], skillPoints: 0, totalPointsSpent: 0 };
    }
  }

  /**
   * Calculer les points de competence disponibles
   * 1 point par niveau atteint
   */
  calculateAvailablePoints(level, totalPointsSpent) {
    return Math.max(0, level - totalPointsSpent);
  }

  /**
   * Verifier si une competence peut etre debloquee
   */
  canUnlockSkill(skillId, unlockedSkills, availablePoints) {
    const skill = this.skills[skillId];
    if (!skill) return { canUnlock: false, reason: 'Competence inconnue' };

    // Deja debloquee ?
    if (unlockedSkills.includes(skillId)) {
      return { canUnlock: false, reason: 'Deja debloquee' };
    }

    // Assez de points ?
    if (availablePoints < skill.cost) {
      return { canUnlock: false, reason: `${skill.cost - availablePoints} point(s) manquant(s)` };
    }

    // Prerequisites remplis ?
    const missingPrereqs = skill.requires.filter(req => !unlockedSkills.includes(req));
    if (missingPrereqs.length > 0) {
      const missingNames = missingPrereqs.map(id => this.skills[id]?.name || id).join(', ');
      return { canUnlock: false, reason: `Requis: ${missingNames}` };
    }

    return { canUnlock: true };
  }

  /**
   * Debloquer une competence
   */
  async unlockSkill(userId, skillId) {
    try {
      const skill = this.skills[skillId];
      if (!skill) {
        return { success: false, error: 'Competence inconnue' };
      }

      // Recuperer donnees utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'Utilisateur non trouve' };
      }

      const data = userDoc.data();
      const level = data.gamification?.level || 1;
      const unlockedSkills = data.skillTree?.unlockedSkills || [];
      const totalPointsSpent = data.skillTree?.totalPointsSpent || 0;
      const availablePoints = this.calculateAvailablePoints(level, totalPointsSpent);

      // Verifier si peut debloquer
      const check = this.canUnlockSkill(skillId, unlockedSkills, availablePoints);
      if (!check.canUnlock) {
        return { success: false, error: check.reason };
      }

      // Debloquer la competence
      const newUnlockedSkills = [...unlockedSkills, skillId];
      const newTotalPointsSpent = totalPointsSpent + skill.cost;

      await updateDoc(userRef, {
        'skillTree.unlockedSkills': newUnlockedSkills,
        'skillTree.totalPointsSpent': newTotalPointsSpent,
        'skillTree.lastUnlock': serverTimestamp(),
        'skillTree.lastUnlockedSkill': skillId
      });

      return {
        success: true,
        skill,
        remainingPoints: availablePoints - skill.cost
      };
    } catch (error) {
      console.error('Erreur deblocage skill:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir les competences par branche
   */
  getSkillsByBranch(branchId) {
    return Object.values(this.skills).filter(s => s.branch === branchId);
  }

  /**
   * Obtenir le bonus XP total de l'utilisateur
   */
  calculateTotalXPBonus(unlockedSkills) {
    return unlockedSkills.reduce((total, skillId) => {
      const skill = this.skills[skillId];
      return total + (skill?.xpBonus || 0);
    }, 0);
  }

  /**
   * Obtenir la progression par branche
   */
  getBranchProgress(branchId, unlockedSkills) {
    const branchSkills = this.getSkillsByBranch(branchId);
    const unlockedInBranch = branchSkills.filter(s => unlockedSkills.includes(s.id));

    return {
      total: branchSkills.length,
      unlocked: unlockedInBranch.length,
      percentage: Math.round((unlockedInBranch.length / branchSkills.length) * 100),
      maxTier: Math.max(...unlockedInBranch.map(s => s.tier), 0)
    };
  }

  /**
   * Obtenir les statistiques globales
   */
  getGlobalStats(unlockedSkills) {
    const totalSkills = Object.keys(this.skills).length;
    const totalXPBonus = this.calculateTotalXPBonus(unlockedSkills);

    const branchStats = {};
    Object.keys(this.branches).forEach(branchId => {
      branchStats[branchId] = this.getBranchProgress(branchId, unlockedSkills);
    });

    // Competences maitrisees (tier 3)
    const masteredBranches = Object.values(branchStats).filter(b => b.maxTier >= 3).length;

    return {
      totalSkills,
      unlockedCount: unlockedSkills.length,
      percentage: Math.round((unlockedSkills.length / totalSkills) * 100),
      totalXPBonus,
      branchStats,
      masteredBranches
    };
  }

  /**
   * Obtenir les prochaines competences disponibles
   */
  getAvailableSkills(unlockedSkills, availablePoints) {
    return Object.values(this.skills).filter(skill => {
      const check = this.canUnlockSkill(skill.id, unlockedSkills, availablePoints);
      return check.canUnlock;
    });
  }

  /**
   * Obtenir les competences presque disponibles (prereqs ok, pas assez de points)
   */
  getAlmostAvailableSkills(unlockedSkills, availablePoints) {
    return Object.values(this.skills).filter(skill => {
      if (unlockedSkills.includes(skill.id)) return false;

      // Prereqs remplis ?
      const hasPrereqs = skill.requires.every(req => unlockedSkills.includes(req));
      if (!hasPrereqs) return false;

      // Pas assez de points ?
      return availablePoints < skill.cost;
    });
  }
}

// Export singleton
export const skillTreeService = new SkillTreeService();
export default skillTreeService;
