// ==========================================
// 📁 react-app/src/core/services/roleUnlockService.js
// SERVICE DE DÉVERROUILLAGE PROGRESSIF PAR RÔLES
// Système intelligent qui déverrouille contenu selon les rôles et niveaux
// ==========================================

import { db } from '../firebase/config.js';
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
      tasks: ['response_basic', 'review_monitoring', 'sentiment_tracking'],
      projects: ['daily_reviews'],
      features: ['review_dashboard', 'basic_responses'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['reputation_guardian', 'satisfaction_booster'],
      tasks: ['crisis_response', 'satisfaction_surveys', 'competitor_analysis'],
      projects: ['reputation_campaign', 'customer_retention'],
      features: ['sentiment_analysis', 'automated_responses'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['brand_ambassador', 'trust_builder'],
      tasks: ['strategy_development', 'influencer_relations', 'content_strategy'],
      projects: ['brand_enhancement', 'reputation_recovery'],
      features: ['social_listening', 'campaign_management'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['reputation_master', 'brand_strategist'],
      tasks: ['reputation_consulting', 'crisis_management', 'stakeholder_relations'],
      projects: ['corporate_reputation', 'brand_transformation'],
      features: ['predictive_reputation', 'executive_reporting'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['reputation_legend', 'trust_architect'],
      tasks: ['industry_thought_leadership', 'reputation_innovation'],
      projects: ['market_reputation_leadership', 'industry_standards'],
      features: ['ai_reputation_engine', 'market_intelligence'],
      xpMultiplier: 2.0
    }
  },

  // 📦 STOCK - Gestion des Stocks & Matériel
  stock: {
    NOVICE: {
      badges: ['inventory_tracker', 'stock_rookie'],
      tasks: ['item_counting', 'basic_ordering', 'receiving_goods'],
      projects: ['daily_inventory'],
      features: ['stock_viewer', 'basic_alerts'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['supply_specialist', 'efficiency_tracker'],
      tasks: ['demand_forecasting', 'vendor_evaluation', 'cost_optimization'],
      projects: ['supply_chain_optimization', 'vendor_management'],
      features: ['demand_analytics', 'supplier_portal'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['logistics_master', 'supply_strategist'],
      tasks: ['supply_strategy', 'risk_assessment', 'team_leadership'],
      projects: ['supply_chain_transformation', 'logistics_optimization'],
      features: ['supply_intelligence', 'risk_analytics'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['supply_chain_guru', 'logistics_innovator'],
      tasks: ['strategic_sourcing', 'supply_innovation', 'global_logistics'],
      projects: ['enterprise_supply_strategy', 'supply_automation'],
      features: ['ai_forecasting', 'global_supply_management'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['supply_legend', 'logistics_visionary'],
      tasks: ['supply_ecosystem_design', 'industry_disruption'],
      projects: ['supply_revolution', 'market_transformation'],
      features: ['quantum_logistics', 'ecosystem_orchestration'],
      xpMultiplier: 2.0
    }
  },

  // 📋 ORGANIZATION - Organisation Interne du Travail
  organization: {
    NOVICE: {
      badges: ['task_organizer', 'workflow_rookie'],
      tasks: ['task_scheduling', 'basic_coordination', 'process_documentation'],
      projects: ['team_organization'],
      features: ['task_planner', 'basic_workflows'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['process_optimizer', 'team_coordinator'],
      tasks: ['workflow_design', 'efficiency_analysis', 'cross_team_coordination'],
      projects: ['process_improvement', 'workflow_optimization'],
      features: ['process_analytics', 'team_dashboards'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['organization_expert', 'efficiency_master'],
      tasks: ['organizational_design', 'change_management', 'performance_optimization'],
      projects: ['organizational_transformation', 'efficiency_programs'],
      features: ['org_intelligence', 'change_analytics'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['org_strategist', 'transformation_leader'],
      tasks: ['strategic_organization', 'culture_development', 'innovation_management'],
      projects: ['enterprise_transformation', 'culture_change'],
      features: ['strategic_org_tools', 'culture_analytics'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['organization_legend', 'future_architect'],
      tasks: ['future_org_design', 'paradigm_innovation'],
      projects: ['organizational_revolution', 'future_workplace'],
      features: ['ai_organization', 'future_work_tools'],
      xpMultiplier: 2.0
    }
  },

  // 🎨 CONTENT - Création de Contenu & Affichages
  content: {
    NOVICE: {
      badges: ['content_creator', 'visual_rookie'],
      tasks: ['basic_design', 'content_writing', 'image_editing'],
      projects: ['daily_content'],
      features: ['design_tools', 'content_library'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['design_specialist', 'brand_creator'],
      tasks: ['brand_design', 'video_creation', 'campaign_content'],
      projects: ['brand_campaign', 'video_series'],
      features: ['advanced_design', 'video_studio'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['creative_master', 'brand_strategist'],
      tasks: ['creative_strategy', 'brand_identity', 'content_strategy'],
      projects: ['brand_transformation', 'creative_campaigns'],
      features: ['brand_intelligence', 'creative_analytics'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['creative_guru', 'visual_innovator'],
      tasks: ['creative_innovation', 'design_leadership', 'trend_setting'],
      projects: ['creative_transformation', 'design_revolution'],
      features: ['ai_creativity', 'trend_analytics'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['content_legend', 'creative_visionary'],
      tasks: ['creative_paradigms', 'artistic_innovation'],
      projects: ['creative_revolution', 'artistic_transformation'],
      features: ['quantum_creativity', 'artistic_ai'],
      xpMultiplier: 2.0
    }
  },

  // 🎓 MENTORING - Mentorat & Formation Interne
  mentoring: {
    NOVICE: {
      badges: ['knowledge_seeker', 'learning_enthusiast'],
      tasks: ['skill_learning', 'knowledge_sharing', 'peer_helping'],
      projects: ['learning_journey'],
      features: ['learning_portal', 'skill_tracker'],
      xpMultiplier: 1.0
    },
    APPRENTI: {
      badges: ['mentor_rookie', 'skill_builder'],
      tasks: ['basic_mentoring', 'skill_assessment', 'training_delivery'],
      projects: ['mentoring_program', 'skill_development'],
      features: ['mentoring_tools', 'skill_analytics'],
      xpMultiplier: 1.2
    },
    COMPETENT: {
      badges: ['master_mentor', 'knowledge_architect'],
      tasks: ['curriculum_design', 'advanced_mentoring', 'learning_innovation'],
      projects: ['learning_transformation', 'mentoring_excellence'],
      features: ['learning_intelligence', 'mentoring_analytics'],
      xpMultiplier: 1.5
    },
    EXPERT: {
      badges: ['mentoring_guru', 'wisdom_keeper'],
      tasks: ['mentoring_strategy', 'learning_leadership', 'knowledge_management'],
      projects: ['learning_ecosystem', 'mentoring_mastery'],
      features: ['ai_mentoring', 'wisdom_analytics'],
      xpMultiplier: 1.8
    },
    MAITRE: {
      badges: ['mentoring_legend', 'wisdom_architect'],
      tasks: ['wisdom_cultivation', 'mentoring_innovation'],
      projects: ['wisdom_revolution', 'mentoring_transformation'],
      features: ['quantum_learning', 'wisdom_ai'],
      xpMultiplier: 2.0
    }
  }
};

/**
 * 🎖️ BADGES EXCLUSIFS PAR RÔLE
 */
export const ROLE_EXCLUSIVE_BADGES = {
  maintenance: [
    { id: 'wrench_master', name: 'Maître de la Clé', icon: '🔧', rarity: 'legendary' },
    { id: 'facility_guardian', name: 'Gardien des Installations', icon: '🏭', rarity: 'epic' }
  ],
  reputation: [
    { id: 'trust_builder', name: 'Bâtisseur de Confiance', icon: '🤝', rarity: 'legendary' },
    { id: 'reputation_shield', name: 'Bouclier de Réputation', icon: '🛡️', rarity: 'epic' }
  ],
  stock: [
    { id: 'supply_wizard', name: 'Magicien des Stocks', icon: '🧙‍♂️', rarity: 'legendary' },
    { id: 'logistics_emperor', name: 'Empereur Logistique', icon: '👑', rarity: 'epic' }
  ],
  organization: [
    { id: 'efficiency_god', name: 'Dieu de l\'Efficacité', icon: '⚡', rarity: 'legendary' },
    { id: 'workflow_architect', name: 'Architecte des Flux', icon: '🏗️', rarity: 'epic' }
  ],
  content: [
    { id: 'creative_genius', name: 'Génie Créatif', icon: '🎨', rarity: 'legendary' },
    { id: 'brand_prophet', name: 'Prophète de la Marque', icon: '🔮', rarity: 'epic' }
  ],
  mentoring: [
    { id: 'wisdom_sage', name: 'Sage de la Sagesse', icon: '🧠', rarity: 'legendary' },
    { id: 'knowledge_oracle', name: 'Oracle du Savoir', icon: '📜', rarity: 'epic' }
  ]
};

/**
 * 🚀 SERVICE PRINCIPAL DE DÉVERROUILLAGE
 */
class RoleUnlockService {

  /**
   * 🎯 CALCULER LE NIVEAU D'UN UTILISATEUR DANS UN RÔLE
   */
  calculateRoleLevel(roleXp) {
    for (const [levelId, levelData] of Object.entries(ROLE_LEVELS)) {
      if (roleXp >= levelData.minXp && roleXp <= levelData.maxXp) {
        return levelId;
      }
    }
    return 'NOVICE';
  }

  /**
   * 🔓 OBTENIR LES DÉVERROUILLAGES D'UN UTILISATEUR
   */
  getUserUnlocks(userRoles = {}) {
    const unlocks = {
      badges: [],
      tasks: [],
      projects: [],
      features: [],
      totalXpMultiplier: 1.0
    };

    // Pour chaque rôle de l'utilisateur
    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      const roleXp = roleData.xp || 0;
      const roleLevel = this.calculateRoleLevel(roleXp);
      
      // Obtenir les déverrouillages pour ce rôle et niveau
      const roleUnlocks = ROLE_UNLOCKS[roleId];
      if (roleUnlocks && roleUnlocks[roleLevel]) {
        const levelUnlocks = roleUnlocks[roleLevel];
        
        // Ajouter les déverrouillages
        unlocks.badges.push(...levelUnlocks.badges.map(b => ({ 
          id: b, 
          role: roleId, 
          level: roleLevel 
        })));
        
        unlocks.tasks.push(...levelUnlocks.tasks.map(t => ({ 
          id: t, 
          role: roleId, 
          level: roleLevel 
        })));
        
        unlocks.projects.push(...levelUnlocks.projects.map(p => ({ 
          id: p, 
          role: roleId, 
          level: roleLevel 
        })));
        
        unlocks.features.push(...levelUnlocks.features.map(f => ({ 
          id: f, 
          role: roleId, 
          level: roleLevel 
        })));

        // Multiplicateur d'XP cumulatif
        unlocks.totalXpMultiplier += (levelUnlocks.xpMultiplier - 1.0);
      }

      // Ajouter les badges exclusifs du rôle
      const exclusiveBadges = ROLE_EXCLUSIVE_BADGES[roleId] || [];
      unlocks.badges.push(...exclusiveBadges.map(b => ({ 
        ...b, 
        role: roleId, 
        exclusive: true 
      })));
    });

    return unlocks;
  }

  /**
   * ✅ VÉRIFIER SI UNE TÂCHE EST DÉVERROUILLÉE
   */
  isTaskUnlocked(taskId, userRoles = {}) {
    const unlocks = this.getUserUnlocks(userRoles);
    return unlocks.tasks.some(task => task.id === taskId);
  }

  /**
   * ✅ VÉRIFIER SI UN PROJET EST DÉVERROUILLÉ
   */
  isProjectUnlocked(projectId, userRoles = {}) {
    const unlocks = this.getUserUnlocks(userRoles);
    return unlocks.projects.some(project => project.id === projectId);
  }

  /**
   * ✅ VÉRIFIER SI UNE FONCTIONNALITÉ EST DÉVERROUILLÉE
   */
  isFeatureUnlocked(featureId, userRoles = {}) {
    const unlocks = this.getUserUnlocks(userRoles);
    return unlocks.features.some(feature => feature.id === featureId);
  }

  /**
   * 🎖️ OBTENIR LES BADGES DISPONIBLES POUR UN UTILISATEUR
   */
  getAvailableBadges(userRoles = {}) {
    const unlocks = this.getUserUnlocks(userRoles);
    return unlocks.badges;
  }

  /**
   * 📊 OBTENIR LES PROCHAINS DÉVERROUILLAGES
   */
  getNextUnlocks(userRoles = {}) {
    const nextUnlocks = {};

    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      const currentXp = roleData.xp || 0;
      const currentLevel = this.calculateRoleLevel(currentXp);
      
      // Trouver le niveau suivant
      const levelOrder = Object.keys(ROLE_LEVELS);
      const currentIndex = levelOrder.indexOf(currentLevel);
      
      if (currentIndex < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentIndex + 1];
        const nextLevelData = ROLE_LEVELS[nextLevel];
        const xpNeeded = nextLevelData.minXp - currentXp;
        
        const roleUnlocks = ROLE_UNLOCKS[roleId];
        if (roleUnlocks && roleUnlocks[nextLevel]) {
          nextUnlocks[roleId] = {
            currentLevel,
            nextLevel,
            xpNeeded,
            unlocks: roleUnlocks[nextLevel]
          };
        }
      }
    });

    return nextUnlocks;
  }

  /**
   * 🎁 DÉBLOQUER DU CONTENU LORS D'UN GAIN D'XP
   */
  async handleXpGain(userId, roleId, xpGained) {
    try {
      // Récupérer les données utilisateur
      const userRef = doc(db, 'teamMembers', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      const userRoles = userData.roles || {};
      const roleData = userRoles[roleId] || { xp: 0 };

      // Calculer le niveau avant et après
      const levelBefore = this.calculateRoleLevel(roleData.xp);
      const newXp = (roleData.xp || 0) + xpGained;
      const levelAfter = this.calculateRoleLevel(newXp);

      // Mettre à jour l'XP
      await updateDoc(userRef, {
        [`roles.${roleId}.xp`]: newXp,
        [`roles.${roleId}.lastXpGain`]: serverTimestamp()
      });

      // Vérifier si un niveau a été gagné
      if (levelBefore !== levelAfter) {
        console.log(`🎉 Niveau gagné ! ${roleId}: ${levelBefore} → ${levelAfter}`);
        
        // Débloquer le nouveau contenu
        const newUnlocks = this.getNewUnlocksForLevel(roleId, levelAfter);
        
        // Déclencher les événements de déverrouillage
        await this.triggerUnlockEvents(userId, roleId, levelAfter, newUnlocks);
        
        return {
          success: true,
          levelUp: true,
          newLevel: levelAfter,
          newUnlocks
        };
      }

      return {
        success: true,
        levelUp: false,
        newXp
      };

    } catch (error) {
      console.error('❌ Erreur handleXpGain:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔓 OBTENIR LES NOUVEAUX DÉVERROUILLAGES D'UN NIVEAU
   */
  getNewUnlocksForLevel(roleId, level) {
    const roleUnlocks = ROLE_UNLOCKS[roleId];
    if (!roleUnlocks || !roleUnlocks[level]) {
      return {};
    }

    return roleUnlocks[level];
  }

  /**
   * 🎊 DÉCLENCHER LES ÉVÉNEMENTS DE DÉVERROUILLAGE
   */
  async triggerUnlockEvents(userId, roleId, newLevel, newUnlocks) {
    try {
      // Déclencher l'événement personnalisé
      if (typeof window !== 'undefined') {
        const unlockEvent = new CustomEvent('roleUnlock', {
          detail: {
            userId,
            roleId,
            level: newLevel,
            unlocks: newUnlocks,
            timestamp: new Date()
          }
        });
        window.dispatchEvent(unlockEvent);
      }

      // Notification au système de badges
      if (window.badgeSystem) {
        await window.badgeSystem.checkBadges({
          trigger: 'role_level_up',
          roleId,
          level: newLevel
        });
      }

      console.log('🎉 Événements de déverrouillage déclenchés!');

    } catch (error) {
      console.error('❌ Erreur triggerUnlockEvents:', error);
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE PROGRESSION
   */
  getProgressionStats(userRoles = {}) {
    const stats = {
      totalRoles: Object.keys(userRoles).length,
      totalXp: 0,
      averageLevel: 0,
      completionPercentage: 0,
      unlockedContent: {
        badges: 0,
        tasks: 0,
        projects: 0,
        features: 0
      }
    };

    // Calculer les stats
    const unlocks = this.getUserUnlocks(userRoles);
    stats.unlockedContent.badges = unlocks.badges.length;
    stats.unlockedContent.tasks = unlocks.tasks.length;
    stats.unlockedContent.projects = unlocks.projects.length;
    stats.unlockedContent.features = unlocks.features.length;

    // Calculer XP total et niveau moyen
    let totalLevelPoints = 0;
    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      stats.totalXp += roleData.xp || 0;
      
      const level = this.calculateRoleLevel(roleData.xp || 0);
      const levelIndex = Object.keys(ROLE_LEVELS).indexOf(level);
      totalLevelPoints += levelIndex;
    });

    if (stats.totalRoles > 0) {
      stats.averageLevel = totalLevelPoints / stats.totalRoles;
      stats.completionPercentage = (stats.averageLevel / (Object.keys(ROLE_LEVELS).length - 1)) * 100;
    }

    return stats;
  }
}

// Instance singleton
const roleUnlockService = new RoleUnlockService();

export default roleUnlockService;
