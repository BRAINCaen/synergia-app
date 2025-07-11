// ==========================================
// 📁 react-app/src/core/services/synergiaRolesService.js
// SERVICE DE GESTION DES RÔLES SYNERGIA
// ==========================================

import { db } from '../firebase/config.js';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

/**
 * 🎭 RÔLES SYNERGIA - Basés sur le CSV des tâches
 */
export const SYNERGIA_ROLES = {
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Responsable de la maintenance et des réparations',
    permissions: ['maintenance_access', 'repair_management'],
    taskCount: 100
  },
  
  REPUTATION: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et des retours clients',
    permissions: ['reputation_management', 'review_access'],
    taskCount: 100
  },
  
  STOCK: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements',
    permissions: ['inventory_management', 'stock_access'],
    taskCount: 100
  },
  
  ORGANIZATION: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes',
    permissions: ['organization_access', 'workflow_management'],
    taskCount: 100
  },
  
  CONTENT: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    permissions: ['content_creation', 'design_access'],
    taskCount: 100
  },
  
  MENTORING: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    permissions: ['training_access', 'mentoring_rights'],
    taskCount: 100
  },
  
  PARTNERSHIPS: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques',
    permissions: ['partnership_management', 'networking_access'],
    taskCount: 100
  },
  
  COMMUNICATION: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale',
    permissions: ['social_media_access', 'communication_rights'],
    taskCount: 100
  },
  
  B2B: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et devis',
    permissions: ['b2b_access', 'quote_management'],
    taskCount: 100
  },
  
  GAMIFICATION: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Gestion du système de gamification',
    permissions: ['gamification_admin', 'xp_management'],
    taskCount: 100
  }
};

/**
 * 🏷️ NIVEAUX DE RÔLES
 */
export const ROLE_LEVELS = {
  NOVICE: {
    id: 'novice',
    name: 'Novice',
    icon: '🌱',
    minXp: 0,
    maxXp: 499,
    color: 'text-green-600'
  },
  APPRENTI: {
    id: 'apprenti',
    name: 'Apprenti',
    icon: '📚',
    minXp: 500,
    maxXp: 1499,
    color: 'text-blue-600'
  },
  COMPETENT: {
    id: 'competent',
    name: 'Compétent',
    icon: '⚡',
    minXp: 1500,
    maxXp: 2999,
    color: 'text-purple-600'
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert',
    icon: '🏆',
    minXp: 3000,
    maxXp: 4999,
    color: 'text-orange-600'
  },
  MAITRE: {
    id: 'maitre',
    name: 'Maître',
    icon: '👑',
    minXp: 5000,
    maxXp: Infinity,
    color: 'text-yellow-600'
  }
};

/**
 * 🎯 SERVICE DE GESTION DES RÔLES
 */
class SynergiaRolesService {
  
  /**
   * 📋 Obtenir tous les rôles disponibles
   */
  getAllRoles() {
    return Object.values(SYNERGIA_ROLES);
  }
  
  /**
   * 🔍 Obtenir un rôle par ID
   */
  getRoleById(roleId) {
    return Object.values(SYNERGIA_ROLES).find(role => role.id === roleId);
  }
  
  /**
   * 👤 Assigner un rôle à un utilisateur
   */
  async assignRole(userId, roleId, assignedBy) {
    try {
      const role = this.getRoleById(roleId);
      if (!role) {
        throw new Error('Rôle non trouvé');
      }
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentRoles = userData.synergiaRoles || [];
      
      // Vérifier si le rôle n'est pas déjà assigné
      if (currentRoles.some(r => r.roleId === roleId)) {
        throw new Error('Ce rôle est déjà assigné à cet utilisateur');
      }
      
      // Ajouter le nouveau rôle
      const newRole = {
        roleId,
        assignedAt: new Date(),
        assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice'
      };
      
      await updateDoc(userRef, {
        synergiaRoles: [...currentRoles, newRole],
        updatedAt: new Date()
      });
      
      console.log(`✅ Rôle ${role.name} assigné à l'utilisateur ${userId}`);
      return { success: true, role: newRole };
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * ❌ Retirer un rôle d'un utilisateur
   */
  async removeRole(userId, roleId, removedBy) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentRoles = userData.synergiaRoles || [];
      
      // Retirer le rôle
      const updatedRoles = currentRoles.filter(r => r.roleId !== roleId);
      
      await updateDoc(userRef, {
        synergiaRoles: updatedRoles,
        updatedAt: new Date()
      });
      
      console.log(`✅ Rôle ${roleId} retiré de l'utilisateur ${userId}`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression rôle:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📊 Obtenir les statistiques des rôles d'un utilisateur
   */
  async getUserRoleStats(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      const userRoles = userData.synergiaRoles || [];
      
      return userRoles.map(userRole => {
        const roleInfo = this.getRoleById(userRole.roleId);
        const level = this.calculateRoleLevel(userRole.xpInRole);
        
        return {
          ...roleInfo,
          ...userRole,
          levelInfo: level,
          progress: this.calculateProgress(userRole.xpInRole, level)
        };
      });
      
    } catch (error) {
      console.error('❌ Erreur stats rôles utilisateur:', error);
      return null;
    }
  }
  
  /**
   * 📈 Calculer le niveau d'un rôle basé sur l'XP
   */
  calculateRoleLevel(xp) {
    for (const level of Object.values(ROLE_LEVELS)) {
      if (xp >= level.minXp && xp <= level.maxXp) {
        return level;
      }
    }
    return ROLE_LEVELS.NOVICE;
  }
  
  /**
   * 📊 Calculer le progrès vers le niveau suivant
   */
  calculateProgress(xp, currentLevel) {
    if (currentLevel.maxXp === Infinity) {
      return 100; // Niveau maximum atteint
    }
    
    const progressInLevel = xp - currentLevel.minXp;
    const levelRange = currentLevel.maxXp - currentLevel.minXp;
    
    return Math.round((progressInLevel / levelRange) * 100);
  }
  
  /**
   * 🎯 Ajouter de l'XP à un rôle spécifique
   */
  async addRoleXp(userId, roleId, xpToAdd, reason = '') {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentRoles = userData.synergiaRoles || [];
      
      // Trouver et mettre à jour le rôle
      const updatedRoles = currentRoles.map(role => {
        if (role.roleId === roleId) {
          const newXp = role.xpInRole + xpToAdd;
          const oldLevel = this.calculateRoleLevel(role.xpInRole);
          const newLevel = this.calculateRoleLevel(newXp);
          
          return {
            ...role,
            xpInRole: newXp,
            level: newLevel.id,
            lastXpGain: {
              amount: xpToAdd,
              reason,
              timestamp: new Date()
            }
          };
        }
        return role;
      });
      
      await updateDoc(userRef, {
        synergiaRoles: updatedRoles,
        updatedAt: new Date()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur ajout XP rôle:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📊 Obtenir les statistiques globales des rôles
   */
  async getGlobalRoleStats() {
    try {
      // Cette fonction nécessiterait une collection dédiée pour les stats
      // Pour l'instant, on retourne des données simulées
      
      const roleStats = Object.values(SYNERGIA_ROLES).map(role => ({
        ...role,
        activeUsers: Math.floor(Math.random() * 20) + 5,
        averageXp: Math.floor(Math.random() * 3000) + 500,
        totalTasksCompleted: Math.floor(Math.random() * 500) + 100
      }));
      
      return roleStats;
      
    } catch (error) {
      console.error('❌ Erreur stats globales rôles:', error);
      return [];
    }
  }
}

// Export du service singleton
export const synergiaRolesService = new SynergiaRolesService();
export default synergiaRolesService;
