// ==========================================
// 📁 react-app/src/core/services/teamManagementService.js
// SERVICE DE GESTION D'ÉQUIPE POUR PROJETS
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Constantes pour les rôles d'équipe
export const TEAM_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  TESTER: 'tester',
  CONTRIBUTOR: 'contributor',
  OBSERVER: 'observer'
};

export const PERMISSION_LEVELS = {
  FULL: 'full',         // Propriétaire - tous droits
  EDIT: 'edit',         // Manager - modification projet et tâches
  CREATE: 'create',     // Contributeur - création tâches
  READ: 'read'          // Observateur - lecture seule
};

/**
 * 👥 SERVICE DE GESTION D'ÉQUIPE
 */
class TeamManagementService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 👤 ASSIGNER UN RÔLE À UN MEMBRE D'ÉQUIPE
   */
  async assignTeamRole(projectId, userId, memberId, role, permissions = null) {
    try {
      console.log(`👥 Attribution rôle ${role} à ${memberId} dans projet ${projectId}`);
      
      // Vérifier les permissions du demandeur
      const hasPermission = await this.checkTeamPermissions(projectId, userId, 'manage_team');
      if (!hasPermission) {
        throw new Error('Permissions insuffisantes pour gérer l\'équipe');
      }

      // Obtenir les permissions par défaut selon le rôle
      const defaultPermissions = this.getDefaultPermissions(role);
      const finalPermissions = permissions || defaultPermissions;

      // Mettre à jour le projet avec les rôles d'équipe
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      
      // Le propriétaire a tous les droits
      if (projectData.ownerId === userId) {
        return true;
      }

      // Vérifier les rôles d'équipe
      const teamRoles = projectData.teamRoles || {};
      const userRole = teamRoles[userId];
      
      if (!userRole) {
        // Utilisateur pas dans l'équipe mais membre du projet = contributeur basique
        const isMember = (projectData.members || []).includes(userId);
        if (!isMember) {
          return false;
        }
        
        // Permissions basiques pour les membres sans rôle défini
        return this.checkActionPermission(TEAM_ROLES.CONTRIBUTOR, requiredAction);
      }

      return this.checkActionPermission(userRole.role, requiredAction);

    } catch (error) {
      console.error('❌ Erreur vérification permissions:', error);
      return false;
    }
  }

  /**
   * ✅ VÉRIFIER SI UN RÔLE PEUT EFFECTUER UNE ACTION
   */
  checkActionPermission(role, action) {
    const rolePermissions = {
      [TEAM_ROLES.OWNER]: ['manage_team', 'edit_project', 'delete_project', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_project'],
      [TEAM_ROLES.MANAGER]: ['manage_team', 'edit_project', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_project'],
      [TEAM_ROLES.DEVELOPER]: ['create_tasks', 'edit_tasks', 'view_project'],
      [TEAM_ROLES.DESIGNER]: ['create_tasks', 'edit_tasks', 'view_project'],
      [TEAM_ROLES.TESTER]: ['create_tasks', 'edit_tasks', 'view_project'],
      [TEAM_ROLES.CONTRIBUTOR]: ['create_tasks', 'view_project'],
      [TEAM_ROLES.OBSERVER]: ['view_project']
    };

    const permissions = rolePermissions[role] || rolePermissions[TEAM_ROLES.OBSERVER];
    return permissions.includes(action);
  }

  /**
   * 🎯 OBTENIR LES PERMISSIONS PAR DÉFAUT SELON LE RÔLE
   */
  getDefaultPermissions(role) {
    const defaultPermissions = {
      [TEAM_ROLES.OWNER]: {
        level: PERMISSION_LEVELS.FULL,
        actions: ['manage_team', 'edit_project', 'delete_project', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_project']
      },
      [TEAM_ROLES.MANAGER]: {
        level: PERMISSION_LEVELS.EDIT,
        actions: ['manage_team', 'edit_project', 'create_tasks', 'edit_tasks', 'delete_tasks', 'view_project']
      },
      [TEAM_ROLES.DEVELOPER]: {
        level: PERMISSION_LEVELS.CREATE,
        actions: ['create_tasks', 'edit_tasks', 'view_project']
      },
      [TEAM_ROLES.DESIGNER]: {
        level: PERMISSION_LEVELS.CREATE,
        actions: ['create_tasks', 'edit_tasks', 'view_project']
      },
      [TEAM_ROLES.TESTER]: {
        level: PERMISSION_LEVELS.CREATE,
        actions: ['create_tasks', 'edit_tasks', 'view_project']
      },
      [TEAM_ROLES.CONTRIBUTOR]: {
        level: PERMISSION_LEVELS.CREATE,
        actions: ['create_tasks', 'view_project']
      },
      [TEAM_ROLES.OBSERVER]: {
        level: PERMISSION_LEVELS.READ,
        actions: ['view_project']
      }
    };

    return defaultPermissions[role] || defaultPermissions[TEAM_ROLES.OBSERVER];
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'ÉQUIPE
   */
  async getTeamStatistics(projectId) {
    try {
      const team = await this.getProjectTeam(projectId);
      
      // Compter par rôle
      const roleCount = {};
      Object.values(TEAM_ROLES).forEach(role => {
        roleCount[role] = team.filter(member => member.teamRole === role).length;
      });

      // Statistiques d'activité
      const totalXP = team.reduce((sum, member) => sum + (member.totalXp || 0), 0);
      const averageLevel = team.length > 0 ? 
        team.reduce((sum, member) => sum + (member.level || 1), 0) / team.length : 0;

      // Membres les plus actifs
      const topContributors = team
        .sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0))
        .slice(0, 5);

      return {
        totalMembers: team.length,
        roleDistribution: roleCount,
        teamXP: totalXP,
        averageLevel: Math.round(averageLevel * 10) / 10,
        topContributors,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur calcul statistiques équipe:', error);
      return {
        totalMembers: 0,
        roleDistribution: {},
        teamXP: 0,
        averageLevel: 0,
        topContributors: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 🔄 TRANSFÉRER LA PROPRIÉTÉ D'UN PROJET
   */
  async transferProjectOwnership(projectId, currentOwnerId, newOwnerId) {
    try {
      console.log(`🔄 Transfert propriété projet ${projectId} vers ${newOwnerId}`);
      
      // Vérifier que le demandeur est bien le propriétaire actuel
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      
      if (projectData.ownerId !== currentOwnerId) {
        throw new Error('Seul le propriétaire peut transférer le projet');
      }

      // Vérifier que le nouveau propriétaire est membre du projet
      if (!(projectData.members || []).includes(newOwnerId)) {
        throw new Error('Le nouveau propriétaire doit être membre du projet');
      }

      // Mettre à jour le propriétaire et les rôles
      const updatedTeamRoles = { ...projectData.teamRoles };
      
      // Ancien propriétaire devient manager
      updatedTeamRoles[currentOwnerId] = {
        role: TEAM_ROLES.MANAGER,
        permissions: this.getDefaultPermissions(TEAM_ROLES.MANAGER),
        assignedAt: serverTimestamp(),
        assignedBy: currentOwnerId
      };

      // Nouveau propriétaire
      updatedTeamRoles[newOwnerId] = {
        role: TEAM_ROLES.OWNER,
        permissions: this.getDefaultPermissions(TEAM_ROLES.OWNER),
        assignedAt: serverTimestamp(),
        assignedBy: currentOwnerId
      };

      await updateDoc(projectRef, {
        ownerId: newOwnerId,
        teamRoles: updatedTeamRoles,
        ownershipTransferredAt: serverTimestamp(),
        previousOwner: currentOwnerId,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Propriété transférée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur transfert propriété:', error);
      throw error;
    }
  }

  /**
   * 👥 INVITER DE NOUVEAUX MEMBRES
   */
  async inviteTeamMembers(projectId, userId, memberEmails, defaultRole = TEAM_ROLES.CONTRIBUTOR) {
    try {
      console.log(`📧 Invitation membres projet ${projectId}:`, memberEmails);
      
      // Vérifier les permissions
      const hasPermission = await this.checkTeamPermissions(projectId, userId, 'manage_team');
      if (!hasPermission) {
        throw new Error('Permissions insuffisantes pour inviter des membres');
      }

      const results = [];
      
      for (const email of memberEmails) {
        try {
          // Rechercher l'utilisateur par email
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const memberId = userDoc.id;
            
            // Ajouter au projet
            await this.addMemberToProject(projectId, userId, memberId, defaultRole);
            
            results.push({
              email,
              success: true,
              userId: memberId,
              name: userData.displayName || email
            });
          } else {
            // Créer une invitation en attente
            await this.createPendingInvitation(projectId, userId, email, defaultRole);
            
            results.push({
              email,
              success: true,
              pending: true,
              message: 'Invitation envoyée - en attente d\'inscription'
            });
          }
        } catch (error) {
          results.push({
            email,
            success: false,
            error: error.message
          });
        }
      }

      console.log('✅ Invitations traitées:', results);
      return { success: true, results };

    } catch (error) {
      console.error('❌ Erreur invitations équipe:', error);
      throw error;
    }
  }

  /**
   * ➕ AJOUTER UN MEMBRE AU PROJET AVEC RÔLE
   */
  async addMemberToProject(projectId, userId, newMemberId, role = TEAM_ROLES.CONTRIBUTOR) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      const currentMembers = projectData.members || [];
      
      // Vérifier si déjà membre
      if (currentMembers.includes(newMemberId)) {
        throw new Error('Utilisateur déjà membre du projet');
      }

      // Ajouter aux membres
      const updatedMembers = [...currentMembers, newMemberId];
      
      // Ajouter le rôle
      const updatedTeamRoles = { ...projectData.teamRoles };
      updatedTeamRoles[newMemberId] = {
        role: role,
        permissions: this.getDefaultPermissions(role),
        assignedAt: serverTimestamp(),
        assignedBy: userId
      };

      await updateDoc(projectRef, {
        members: updatedMembers,
        teamRoles: updatedTeamRoles,
        updatedAt: serverTimestamp()
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur ajout membre projet:', error);
      throw error;
    }
  }

  /**
   * 📬 CRÉER UNE INVITATION EN ATTENTE
   */
  async createPendingInvitation(projectId, inviterId, email, role) {
    try {
      const invitation = {
        projectId,
        inviterId,
        email: email.toLowerCase().trim(),
        role,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      };

      const docRef = await addDoc(collection(db, 'project_invitations'), invitation);
      console.log('📬 Invitation créée:', docRef.id);
      
      return { success: true, invitationId: docRef.id };

    } catch (error) {
      console.error('❌ Erreur création invitation:', error);
      throw error;
    }
  }

  /**
   * 🔍 DÉSASSIGNER UN UTILISATEUR DE TOUTES LES TÂCHES D'UN PROJET
   */
  async unassignUserFromProjectTasks(projectId, userId) {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef, 
        where('projectId', '==', projectId),
        where('assignedTo', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          assignedTo: null,
          assignedAt: null,
          unassignedAt: serverTimestamp(),
          unassignedReason: 'Membre retiré du projet'
        });
      });

      await batch.commit();
      console.log(`✅ ${querySnapshot.size} tâches désassignées pour l'utilisateur ${userId}`);

    } catch (error) {
      console.error('❌ Erreur désassignation tâches:', error);
    }
  }

  /**
   * 📊 OBTENIR LES PROJETS D'UN UTILISATEUR AVEC SES RÔLES
   */
  async getUserProjectsWithRoles(userId) {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const projects = [];
      
      querySnapshot.forEach(doc => {
        const projectData = doc.data();
        const teamRoles = projectData.teamRoles || {};
        const userRole = teamRoles[userId] || {
          role: TEAM_ROLES.CONTRIBUTOR,
          permissions: this.getDefaultPermissions(TEAM_ROLES.CONTRIBUTOR)
        };

        projects.push({
          id: doc.id,
          ...projectData,
          userRole: userRole.role,
          userPermissions: userRole.permissions,
          isOwner: projectData.ownerId === userId
        });
      });

      console.log(`👥 ${projects.length} projets trouvés pour l'utilisateur ${userId}`);
      return projects;

    } catch (error) {
      console.error('❌ Erreur récupération projets utilisateur:', error);
      return [];
    }
  }

  /**
   * 🎯 OBTENIR LES RÔLES DISPONIBLES
   */
  getAvailableRoles() {
    return [
      { value: TEAM_ROLES.MANAGER, label: '👨‍💼 Manager', description: 'Peut gérer l\'équipe et modifier le projet' },
      { value: TEAM_ROLES.DEVELOPER, label: '👨‍💻 Développeur', description: 'Crée et modifie les tâches techniques' },
      { value: TEAM_ROLES.DESIGNER, label: '🎨 Designer', description: 'Responsable du design et de l\'UX' },
      { value: TEAM_ROLES.TESTER, label: '🧪 Testeur', description: 'Tests et validation qualité' },
      { value: TEAM_ROLES.CONTRIBUTOR, label: '👤 Contributeur', description: 'Peut créer des tâches et contribuer' },
      { value: TEAM_ROLES.OBSERVER, label: '👁️ Observateur', description: 'Accès en lecture seule' }
    ];
  }

  /**
   * 🎨 OBTENIR LA COULEUR D'UN RÔLE
   */
  getRoleColor(role) {
    const colors = {
      [TEAM_ROLES.OWNER]: 'bg-yellow-500 text-white',
      [TEAM_ROLES.MANAGER]: 'bg-purple-500 text-white',
      [TEAM_ROLES.DEVELOPER]: 'bg-blue-500 text-white',
      [TEAM_ROLES.DESIGNER]: 'bg-pink-500 text-white',
      [TEAM_ROLES.TESTER]: 'bg-green-500 text-white',
      [TEAM_ROLES.CONTRIBUTOR]: 'bg-gray-500 text-white',
      [TEAM_ROLES.OBSERVER]: 'bg-gray-300 text-gray-700'
    };
    return colors[role] || colors[TEAM_ROLES.OBSERVER];
  }

  /**
   * 🎯 OBTENIR L'ICÔNE D'UN RÔLE
   */
  getRoleIcon(role) {
    const icons = {
      [TEAM_ROLES.OWNER]: '👑',
      [TEAM_ROLES.MANAGER]: '👨‍💼',
      [TEAM_ROLES.DEVELOPER]: '👨‍💻',
      [TEAM_ROLES.DESIGNER]: '🎨',
      [TEAM_ROLES.TESTER]: '🧪',
      [TEAM_ROLES.CONTRIBUTOR]: '👤',
      [TEAM_ROLES.OBSERVER]: '👁️'
    };
    return icons[role] || icons[TEAM_ROLES.OBSERVER];
  }
}

// Export du service
const teamManagementService = new TeamManagementService();
export { teamManagementService };
export default teamManagementService;

// Exports des constantes
export { TEAM_ROLES, PERMISSION_LEVELS };
      const teamRoles = projectData.teamRoles || {};
      
      // Ajouter/mettre à jour le rôle
      teamRoles[memberId] = {
        role: role,
        permissions: finalPermissions,
        assignedAt: serverTimestamp(),
        assignedBy: userId
      };

      await updateDoc(projectRef, {
        teamRoles: teamRoles,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Rôle d\'équipe attribué avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur attribution rôle équipe:', error);
      throw error;
    }
  }

  /**
   * 🔄 MODIFIER LE RÔLE D'UN MEMBRE
   */
  async updateTeamRole(projectId, userId, memberId, newRole, newPermissions = null) {
    try {
      return await this.assignTeamRole(projectId, userId, memberId, newRole, newPermissions);
    } catch (error) {
      console.error('❌ Erreur modification rôle:', error);
      throw error;
    }
  }

  /**
   * 🗑️ RETIRER UN MEMBRE DE L'ÉQUIPE
   */
  async removeTeamMember(projectId, userId, memberId) {
    try {
      console.log(`🗑️ Suppression membre ${memberId} du projet ${projectId}`);
      
      // Vérifier les permissions
      const hasPermission = await this.checkTeamPermissions(projectId, userId, 'manage_team');
      if (!hasPermission) {
        throw new Error('Permissions insuffisantes pour gérer l\'équipe');
      }

      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      
      // Ne pas permettre de retirer le propriétaire
      if (projectData.ownerId === memberId) {
        throw new Error('Impossible de retirer le propriétaire du projet');
      }

      // Retirer des membres et des rôles
      const updatedMembers = (projectData.members || []).filter(id => id !== memberId);
      const updatedTeamRoles = { ...projectData.teamRoles };
      delete updatedTeamRoles[memberId];

      await updateDoc(projectRef, {
        members: updatedMembers,
        teamRoles: updatedTeamRoles,
        updatedAt: serverTimestamp()
      });

      // Retirer aussi des tâches assignées
      await this.unassignUserFromProjectTasks(projectId, memberId);

      console.log('✅ Membre retiré de l\'équipe avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression membre équipe:', error);
      throw error;
    }
  }

  /**
   * 👥 OBTENIR L'ÉQUIPE D'UN PROJET
   */
  async getProjectTeam(projectId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      const memberIds = projectData.members || [];
      const teamRoles = projectData.teamRoles || {};

      // Récupérer les détails des utilisateurs
      const teamMembers = [];
      
      for (const memberId of memberIds) {
        const userRef = doc(db, 'users', memberId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const memberRole = teamRoles[memberId] || {
            role: TEAM_ROLES.CONTRIBUTOR,
            permissions: this.getDefaultPermissions(TEAM_ROLES.CONTRIBUTOR)
          };

          teamMembers.push({
            id: memberId,
            ...userData,
            teamRole: memberRole.role,
            permissions: memberRole.permissions,
            isOwner: memberId === projectData.ownerId,
            joinedAt: memberRole.assignedAt
          });
        }
      }

      console.log('👥 Équipe récupérée:', teamMembers.length, 'membres');
      return teamMembers;

    } catch (error) {
      console.error('❌ Erreur récupération équipe:', error);
      return [];
    }
  }

  /**
   * 🔐 VÉRIFIER LES PERMISSIONS D'UN MEMBRE
   */
  async checkTeamPermissions(projectId, userId, requiredAction) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        return false;
      }

      const projectData = projectSnap.data();
