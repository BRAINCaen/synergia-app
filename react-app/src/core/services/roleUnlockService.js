// ==========================================
// 📁 react-app/src/core/services/roleUnlockService.js
// SERVICE DE DÉVERROUILLAGE PROGRESSIF PAR RÔLES - IMPORT FIREBASE CORRIGÉ
// ==========================================

import { db } from '../firebase.js';
import { doc, updateDoc, getDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { SYNERGIA_ROLES, ROLE_LEVELS } from './synergiaRolesService.js';

/**
 * 🎯 DÉFINITION DES DÉVERROUILLAGES PAR RÔLE ET NIVEAU
 */
export const ROLE_UNLOCKS = {
  // 🔧 MAINTENANCE - Entretien, Réparations & Maintenance
  maintenance: {
    NOVICE: {
      badges: ['maintenance_rookie', 'tool_master'],
      tasks: ['basic_repair', 'equipment_check', 'safety_inspection'],
      projects: ['daily_maintenance'],
      features: ['maintenance_calendar', 'basic_reports'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['repair_specialist', 'efficiency_expert'],
      tasks: ['advanced_repair', 'preventive_maintenance', 'equipment_upgrade'],
      projects: ['weekly_maintenance', 'equipment_audit'],
      features: ['maintenance_analytics', 'inventory_tracking'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['maintenance_guru', 'innovation_award'],
      tasks: ['system_optimization', 'training_others', 'cost_analysis'],
      projects: ['maintenance_strategy', 'team_leadership'],
      features: ['budget_management', 'team_analytics'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['master_technician', 'strategy_architect'],
      tasks: ['process_design', 'vendor_management', 'policy_creation'],
      projects: ['facility_transformation', 'maintenance_program'],
      features: ['executive_dashboard', 'advanced_analytics'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['maintenance_legend', 'facility_visionary'],
      tasks: ['facility_design', 'strategic_planning', 'mentoring_experts'],
      projects: ['enterprise_transformation', 'industry_innovation'],
      features: ['c_suite_access', 'predictive_analytics'],
      xpMultiplier: 2.0
    }
  },

  // ⭐ REPUTATION - Gestion des Avis & de la Réputation
  reputation: {
    NOVICE: {
      badges: ['review_tracker', 'customer_voice'],
      tasks: ['response_basic', 'monitoring_setup', 'review_analysis'],
      projects: ['reputation_baseline'],
      features: ['review_dashboard', 'response_templates'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['response_master', 'sentiment_analyzer'],
      tasks: ['advanced_responses', 'crisis_management', 'trend_analysis'],
      projects: ['reputation_strategy', 'customer_survey'],
      features: ['sentiment_analytics', 'competitor_tracking'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['reputation_guardian', 'brand_advocate'],
      tasks: ['strategy_development', 'team_training', 'partner_relations'],
      projects: ['brand_transformation', 'reputation_recovery'],
      features: ['advanced_analytics', 'automation_tools'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['reputation_strategist', 'crisis_navigator'],
      tasks: ['policy_creation', 'industry_leadership', 'consultant_training'],
      projects: ['enterprise_reputation', 'industry_standards'],
      features: ['predictive_modeling', 'executive_reporting'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['reputation_visionary', 'industry_leader'],
      tasks: ['thought_leadership', 'industry_speaking', 'mentoring_experts'],
      projects: ['reputation_innovation', 'industry_transformation'],
      features: ['ai_integration', 'strategic_consulting'],
      xpMultiplier: 2.0
    }
  },

  // 📦 STOCK - Gestion des Stocks & Matériel
  stock: {
    NOVICE: {
      badges: ['inventory_tracker', 'organization_rookie'],
      tasks: ['basic_counting', 'receiving_goods', 'stock_updates'],
      projects: ['inventory_organization'],
      features: ['basic_inventory', 'simple_reports'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['efficiency_optimizer', 'supply_coordinator'],
      tasks: ['demand_forecasting', 'vendor_management', 'cost_optimization'],
      projects: ['supply_chain_analysis', 'vendor_evaluation'],
      features: ['forecasting_tools', 'vendor_portal'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['supply_strategist', 'cost_controller'],
      tasks: ['strategy_planning', 'team_leadership', 'process_improvement'],
      projects: ['supply_chain_redesign', 'cost_reduction'],
      features: ['advanced_analytics', 'automation_systems'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['supply_architect', 'innovation_leader'],
      tasks: ['system_design', 'technology_integration', 'consultant_training'],
      projects: ['digital_transformation', 'supply_innovation'],
      features: ['ai_optimization', 'predictive_analytics'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['supply_visionary', 'industry_pioneer'],
      tasks: ['industry_leadership', 'technology_innovation', 'expert_mentoring'],
      projects: ['supply_revolution', 'industry_standards'],
      features: ['cutting_edge_tech', 'strategic_consulting'],
      xpMultiplier: 2.0
    }
  }
};

/**
 * 🔓 SERVICE PRINCIPAL DE DÉVERROUILLAGE
 */
export class RoleUnlockService {
  
  /**
   * 🔍 Vérifier les déverrouillages pour un utilisateur
   */
  async checkUnlocks(userId, roleId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const userRoles = userData.synergiaRoles || [];
      const userRole = userRoles.find(role => role.roleId === roleId);
      
      if (!userRole) {
        return { unlocks: [], level: 'NOVICE' };
      }
      
      // Calculer le niveau actuel
      const currentLevel = this.calculateLevel(userRole.xpInRole);
      const roleUnlocks = ROLE_UNLOCKS[roleId] || {};
      const levelUnlocks = roleUnlocks[currentLevel.toUpperCase()] || {};
      
      return {
        unlocks: levelUnlocks,
        level: currentLevel,
        xp: userRole.xpInRole,
        nextLevel: this.getNextLevel(currentLevel),
        xpToNext: this.getXpToNextLevel(userRole.xpInRole)
      };
      
    } catch (error) {
      console.error('❌ Erreur vérification déverrouillages:', error);
      return { unlocks: [], level: 'NOVICE' };
    }
  }
  
  /**
   * 📊 Calculer le niveau selon l'XP
   */
  calculateLevel(xp) {
    const levels = Object.values(ROLE_LEVELS).sort((a, b) => b.xpRequired - a.xpRequired);
    
    for (const level of levels) {
      if (xp >= level.xpRequired) {
        return level.id;
      }
    }
    
    return 'novice';
  }
  
  /**
   * ⬆️ Obtenir le niveau suivant
   */
  getNextLevel(currentLevel) {
    const levelOrder = ['novice', 'apprenti', 'competent', 'expert', 'maitre'];
    const currentIndex = levelOrder.indexOf(currentLevel.toLowerCase());
    
    if (currentIndex < levelOrder.length - 1) {
      return levelOrder[currentIndex + 1];
    }
    
    return 'maitre'; // Niveau maximum
  }
  
  /**
   * 🎯 Calculer l'XP nécessaire pour le niveau suivant
   */
  getXpToNextLevel(currentXp) {
    const currentLevel = this.calculateLevel(currentXp);
    const nextLevel = this.getNextLevel(currentLevel);
    const nextLevelData = Object.values(ROLE_LEVELS).find(l => l.id === nextLevel);
    
    if (!nextLevelData) {
      return 0; // Niveau maximum atteint
    }
    
    return Math.max(0, nextLevelData.xpRequired - currentXp);
  }
  
  /**
   * 🏆 Débloquer du contenu pour un niveau
   */
  async unlockContent(userId, roleId, contentType, contentId) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Créer la structure de déverrouillage si elle n'existe pas
      const unlockPath = `roleUnlocks.${roleId}.${contentType}`;
      
      await updateDoc(userRef, {
        [unlockPath]: arrayUnion(contentId),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur déverrouillage contenu:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📋 Obtenir tout le contenu déverrouillé
   */
  async getUnlockedContent(userId, roleId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { tasks: [], badges: [], projects: [], features: [] };
      }
      
      const userData = userDoc.data();
      const roleUnlocks = userData.roleUnlocks?.[roleId] || {};
      
      return {
        tasks: roleUnlocks.tasks || [],
        badges: roleUnlocks.badges || [],
        projects: roleUnlocks.projects || [],
        features: roleUnlocks.features || []
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération contenu déverrouillé:', error);
      return { tasks: [], badges: [], projects: [], features: [] };
    }
  }
}

// Export du service singleton
export const roleUnlockService = new RoleUnlockService();
export default roleUnlockService;
