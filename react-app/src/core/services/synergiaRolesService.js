// ==========================================
// 📁 react-app/src/core/services/synergiaRolesService.js
// SERVICE DE GESTION DES RÔLES SYNERGIA - IMPORT FIREBASE CORRIGÉ
// ==========================================

import { db, doc, updateDoc, getDoc, setDoc } from '../firebase.js';

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
    description: 'Développement des partenariats et visibilité',
    permissions: ['partnership_management', 'networking_access'],
    taskCount: 100
  },
  
  COMMUNICATION: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-cyan-500',
    description: 'Gestion des réseaux sociaux et communication',
    permissions: ['social_media_access', 'communication_rights'],
    taskCount: 100
  },
  
  B2B: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations professionnelles',
    permissions: ['b2b_management', 'quote_access'],
    taskCount: 100
  }
};

/**
 * 📊 NIVEAUX DE PROGRESSION DANS CHAQUE RÔLE
 */
export const ROLE_LEVELS = {
  NOVICE: {
    id: 'novice',
    name: 'Novice',
    xpRequired: 0,
    color: 'bg-gray-400',
    description: 'Débutant dans le rôle'
  },
  APPRENTI: {
    id: 'apprenti',
    name: 'Apprenti',
    xpRequired: 100,
    color: 'bg-green-400',
    description: 'Compétences de base acquises'
  },
  COMPETENT: {
    id: 'competent',
    name: 'Compétent',
    xpRequired: 300,
    color: 'bg-blue-400',
    description: 'Maîtrise solide du rôle'
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert',
    xpRequired: 600,
    color: 'bg-purple-400',
    description: 'Expertise reconnue'
  },
  MAITRE: {
    id: 'maitre',
    name: 'Maître',
    xpRequired: 1000,
    color: 'bg-yellow-400',
    description: 'Maîtrise exceptionnelle'
  }
};

/**
 * 🏛️ SERVICE PRINCIPAL DE GESTION DES RÔLES
 */
export class SynergiaRolesService {
  
  /**
   * 🎭 Assigner un rôle à un utilisateur
   */
  async assignRole(userId, roleId, assignedBy = 'system') {
    try {
      if (!SYNERGIA_ROLES[roleId.toUpperCase()]) {
        throw new Error(`Rôle ${roleId} non reconnu`);
      }
      
      const role = SYNERGIA_ROLES[roleId.toUpperCase()];
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentRoles = userData.synergiaRoles || [];
      
      // Vérifier si le rôle n'est pas déjà assigné
      if (currentRoles.find(r => r.roleId === roleId)) {
        throw new Error('Rôle déjà assigné');
      }
      
      // Créer le nouveau rôle
      const newRole = {
        roleId: roleId,
        roleName: role.name,
        assignedAt: new Date(),
        assignedBy: assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice',
        permissions: role.permissions,
        lastActivity: new Date()
      };
      
      // Mettre à jour l'utilisateur
      const updatedRoles = [...currentRoles, newRole];
      
      await updateDoc(userRef, {
        synergiaRoles: updatedRoles,
        updatedAt: new Date()
      });
      
      return { success: true, role: newRole };
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 🏆 Calculer le niveau d'un rôle selon l'XP
   */
  calculateRoleLevel(xp) {
    const levels = Object.values(ROLE_LEVELS).sort((a, b) => b.xpRequired - a.xpRequired);
    
    for (const level of levels) {
      if (xp >= level.xpRequired) {
        return level;
      }
    }
    
    return ROLE_LEVELS.NOVICE;
  }
  
  /**
   * 📈 Ajouter de l'XP dans un rôle
   */
  async addRoleXP(userId, roleId, xpToAdd, reason = 'Tâche complétée') {
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
