// ==========================================
// 📁 react-app/src/core/services/teamManagementService.js
// SERVICE GESTION D'ÉQUIPE ET RÔLES - NOUVEAU
// ==========================================

import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  updateDoc, 
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

// Constantes pour les rôles et permissions
export const PROJECT_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  LEAD: 'lead',
  CONTRIBUTOR: 'contributor',
  OBSERVER: 'observer'
};

export const PERMISSIONS = {
  // Gestion du projet
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  ARCHIVE_PROJECT: 'archive_project',
  
  // Gestion d'équipe
  ADD_MEMBERS: 'add_members',
  REMOVE_MEMBERS: 'remove_members',
  EDIT_ROLES: 'edit_roles',
  
  // Gestion des tâches
  CREATE_TASKS: 'create_tasks',
  ASSIGN_TASKS: 'assign_tasks',
  VALIDATE_TASKS: 'validate_tasks',
  DELETE_TASKS: 'delete_tasks',
  
  // Rapports et analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // Général
  VIEW_PROJECT: 'view_project',
  COMMENT: 'comment'
};

/**
 * 👥 SERVICE DE GESTION D'ÉQUIPE ET RÔLES
 */
class TeamManagementService {
  constructor() {
    this.listeners = new Map();
    console.log('👥 TeamManagementService initialisé');
  }

  /**
   * 🎭 OBTENIR LES PERMISSIONS PAR DÉFAUT POUR UN RÔLE
   */
  getDefaultPermissions(role) {
    const permissionSets = {
      [PROJECT_ROLES.OWNER]: [
        // Toutes les permissions
        ...Object.values(PERMISSIONS)
      ],
      
      [PROJECT_ROLES.MANAGER]: [
        PERMISSIONS.EDIT_PROJECT,
        PERMISSIONS.ADD_MEMBERS,
        PERMISSIONS.REMOVE_MEMBERS,
        PERMISSIONS.EDIT_ROLES,
        PERMISSIONS.CREATE_TASKS,
        PERMISSIONS.ASSIGN_TASKS,
        PERMISSIONS.VALIDATE_TASKS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_DATA,
        PERMISSIONS.VIEW_PROJECT,
        PERMISSIONS.COMMENT
      ],
      
      [PROJECT_ROLES.LEAD]: [
        PERMISSIONS.ADD_MEMBERS,
        PERMISSIONS.CREATE_TASKS,
        PERMISSIONS.ASSIGN_TASKS,
        PERMISSIONS.VALIDATE_TASKS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECT,
        PERMISSIONS.COMMENT
      ],
      
      [PROJECT_ROLES.CONTRIBUTOR]: [
        PERMISSIONS.CREATE_TASKS,
        PERMISSIONS.VIEW_PROJECT,
        PERMISSIONS.COMMENT
      ],
      
      [PROJECT_ROLES.OBSERVER]: [
        PERMISSIONS.VIEW_PROJECT,
        PERMISSIONS.COMMENT
      ]
    };
    
    return permissionSets[role] || permissionSets[PROJECT_ROLES.OBSERVER];
  }

  /**
   * 👤 AJOUTER UN MEMBRE À UN PROJET
   */
  async addTeamMember(projectId, userEmail, role = PROJECT_ROLES.CONTRIBUTOR, addedBy) {
    try {
      console.log(`👤 Ajout membre ${userEmail} au projet ${projectId} avec rôle ${role}`);
      
      // Récupérer l'utilisateur par email
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', userEmail)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('Utilisateur non trouvé avec cet email');
      }
      
      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Vérifier que l'utilisateur n'est pas déjà membre
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const existingMember = projectData.team?.find(member => member.userId === userId);
      if (existingMember) {
        throw new Error('Cet utilisateur est déjà membre du projet');
      }
      
      // Créer l'objet membre
      const newMember = {
        userId: userId,
        email: userData.email,
        displayName: userData.displayName || 'Utilisateur',
        photoURL: userData.photoURL || null,
        role: role,
        permissions: this.getDefaultPermissions(role),
        joinedAt: serverTimestamp(),
        addedBy: addedBy,
        isActive: true
      };
      
      // Ajouter le membre à l'équipe
      await updateDoc(doc(db, 'projects', projectId), {
        team: arrayUnion(newMember),
        teamSize: (projectData.teamSize || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      // Ajouter une activité
      await this.addTeamActivity(projectId, {
        type: 'member_added',
        userId: addedBy,
        targetUserId: userId,
        details: {
          memberName: newMember.displayName,
          role: role
        },
        description: `${newMember.displayName} ajouté au projet avec le rôle ${role}`
      });
      
      console.log('✅ Membre ajouté avec succès');
      return newMember;
      
    } catch (error) {
      console.error('❌ Erreur ajout membre équipe:', error);
      throw error;
    }
  }

  /**
   * 🔄 MODIFIER LE RÔLE D'UN MEMBRE
   */
  async updateMemberRole(projectId, memberId, newRole, updatedBy) {
    try {
      console.log(`🔄 Modification rôle membre ${memberId} vers ${newRole}`);
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      // Vérifier que ce n'est pas le propriétaire
      const member = projectData.team?.find(m => m.userId === memberId);
      if (member?.role === PROJECT_ROLES.OWNER) {
        throw new Error('Impossible de modifier le rôle du propriétaire');
      }
      
      // Mettre à jour l'équipe
      const updatedTeam = projectData.team.map(member => {
        if (member.userId === memberId) {
          return {
            ...member,
            role: newRole,
            permissions: this.getDefaultPermissions(newRole),
            roleUpdatedAt: serverTimestamp(),
            roleUpdatedBy: updatedBy
          };
        }
        return member;
      });
      
      await updateDoc(doc(db, 'projects', projectId), {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      // Ajouter une activité
      await this.addTeamActivity(projectId, {
        type: 'role_updated',
        userId: updatedBy,
        targetUserId: memberId,
        details: {
          oldRole: member.role,
          newRole: newRole,
          memberName: member.displayName
        },
        description: `Rôle de ${member.displayName} modifié de ${member.role} vers ${newRole}`
      });
      
      console.log('✅ Rôle membre mis à jour');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur modification rôle membre:', error);
      throw error;
    }
  }

  /**
   * ❌ RETIRER UN MEMBRE DE L'ÉQUIPE
   */
  async removeMember(projectId, memberId, removedBy) {
    try {
      console.log(`❌ Suppression membre ${memberId} du projet ${projectId}`);
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const memberToRemove = projectData.team?.find(m => m.userId === memberId);
      
      // Vérifier que ce n'est pas le propriétaire
      if (memberToRemove?.role === PROJECT_ROLES.OWNER) {
        throw new Error('Impossible de retirer le propriétaire du projet');
      }
      
      // Filtrer l'équipe pour retirer le membre
      const updatedTeam = projectData.team.filter(member => member.userId !== memberId);
      
      await updateDoc(doc(db, 'projects', projectId), {
        team: updatedTeam,
        teamSize: Math.max(0, (projectData.teamSize || 0) - 1),
        updatedAt: serverTimestamp()
      });
      
      // Désassigner toutes les tâches de ce membre
      await this.unassignUserTasks(projectId, memberId);
      
      // Ajouter une activité
      await this.addTeamActivity(projectId, {
        type: 'member_removed',
        userId: removedBy,
        targetUserId: memberId,
        details: {
          memberName: memberToRemove?.displayName || 'Utilisateur',
          role: memberToRemove?.role
        },
        description: `${memberToRemove?.displayName || 'Utilisateur'} retiré du projet`
      });
      
      console.log('✅ Membre retiré avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      throw error;
    }
  }

  /**
   * 🔍 VÉRIFIER LES PERMISSIONS D'UN UTILISATEUR
   */
  async checkUserPermission(projectId, userId, permission) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const member = projectData.team?.find(m => m.userId === userId);
      
      if (!member) {
        return false; // Utilisateur pas membre du projet
      }
      
      return member.permissions?.includes(permission) || false;
      
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false;
    }
  }

  /**
   * 👥 OBTENIR LES MEMBRES D'UN PROJET
   */
  async getProjectTeam(projectId) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      return projectData.team || [];
      
    } catch (error) {
      console.error('❌ Erreur récupération équipe:', error);
      return [];
    }
  }

  /**
   * 🎧 ÉCOUTER LES CHANGEMENTS D'ÉQUIPE
   */
  subscribeToTeamUpdates(projectId, callback) {
    try {
      const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (doc) => {
        if (doc.exists()) {
          const projectData = doc.data();
          callback(projectData.team || []);
        } else {
          callback([]);
        }
      });
      
      this.listeners.set(`team-${projectId}`, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur écoute équipe:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 📊 STATISTIQUES DE L'ÉQUIPE
   */
  async getTeamStats(projectId) {
    try {
      const team = await this.getProjectTeam(projectId);
      
      const stats = {
        totalMembers: team.length,
        activeMembers: team.filter(m => m.isActive !== false).length,
        roles: {},
        averageJoinDuration: 0
      };
      
      // Compter les rôles
      team.forEach(member => {
        stats.roles[member.role] = (stats.roles[member.role] || 0) + 1;
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques équipe:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        roles: {},
        averageJoinDuration: 0
      };
    }
  }

  /**
   * 📝 AJOUTER UNE ACTIVITÉ D'ÉQUIPE
   */
  async addTeamActivity(projectId, activityData) {
    try {
      const activity = {
        id: Date.now().toString(),
        timestamp: serverTimestamp(),
        ...activityData
      };
      
      await updateDoc(doc(db, 'projects', projectId), {
        teamActivities: arrayUnion(activity)
      });
      
      return activity;
      
    } catch (error) {
      console.error('❌ Erreur ajout activité équipe:', error);
    }
  }

  /**
   * 🔄 DÉSASSIGNER LES TÂCHES D'UN UTILISATEUR
   */
  async unassignUserTasks(projectId, userId) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        where('assignedTo', '==', userId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      if (!tasksSnapshot.empty) {
        const batch = writeBatch(db);
        
        tasksSnapshot.forEach((taskDoc) => {
          batch.update(taskDoc.ref, {
            assignedTo: null,
            unassignedAt: serverTimestamp(),
            unassignedReason: 'member_removed'
          });
        });
        
        await batch.commit();
        console.log(`✅ ${tasksSnapshot.size} tâches désassignées`);
      }
      
    } catch (error) {
      console.error('❌ Erreur désassignation tâches:', error);
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// ✅ Export de l'instance singleton
const teamManagementService = new TeamManagementService();

export { teamManagementService };
export default teamManagementService;
