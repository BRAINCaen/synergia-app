// ==========================================
// 📁 react-app/src/core/services/teamManagementService.js
// SERVICE GESTION D'ÉQUIPE - VERSION CORRIGÉE AVEC ASSIGNROLE
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
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ✅ CONSTANTES RÔLES ET PERMISSIONS
export const TEAM_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  LEAD: 'lead',
  CONTRIBUTOR: 'contributor',
  OBSERVER: 'observer'
};

export const TEAM_PERMISSIONS = {
  MANAGE_TEAM: 'manage_team',
  MANAGE_TASKS: 'manage_tasks',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings'
};

const ROLE_PERMISSIONS = {
  [TEAM_ROLES.OWNER]: [
    TEAM_PERMISSIONS.MANAGE_TEAM,
    TEAM_PERMISSIONS.MANAGE_TASKS,
    TEAM_PERMISSIONS.MANAGE_PROJECTS,
    TEAM_PERMISSIONS.VIEW_ANALYTICS,
    TEAM_PERMISSIONS.MANAGE_SETTINGS
  ],
  [TEAM_ROLES.MANAGER]: [
    TEAM_PERMISSIONS.MANAGE_TEAM,
    TEAM_PERMISSIONS.MANAGE_TASKS,
    TEAM_PERMISSIONS.VIEW_ANALYTICS
  ],
  [TEAM_ROLES.LEAD]: [
    TEAM_PERMISSIONS.MANAGE_TASKS,
    TEAM_PERMISSIONS.VIEW_ANALYTICS
  ],
  [TEAM_ROLES.CONTRIBUTOR]: [
    TEAM_PERMISSIONS.MANAGE_TASKS
  ],
  [TEAM_ROLES.OBSERVER]: []
};

/**
 * 👥 SERVICE DE GESTION D'ÉQUIPE
 * Gestion des membres, rôles, permissions et collaboration
 */
class TeamManagementService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 📋 RÉCUPÉRER L'ÉQUIPE D'UN PROJET
   */
  async getProjectTeam(projectId) {
    try {
      console.log('🔍 Récupération équipe projet:', projectId);
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        console.warn('❌ Projet introuvable:', projectId);
        return [];
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Enrichir les données membres avec infos utilisateur
      const enrichedTeam = await Promise.all(
        team.map(async (member) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', member.userId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            
            return {
              ...member,
              id: member.userId, // Alias pour compatibilité
              displayName: userData.displayName || member.displayName || 'Utilisateur Inconnu',
              email: userData.email || member.email || '',
              avatar: userData.avatar || null,
              photoURL: userData.photoURL || null,
              isActive: userData.isActive !== false,
              lastActivity: userData.lastActivity || null,
              xpTotal: userData.xpTotal || 0,
              level: userData.level || 1,
              teamRole: member.role || TEAM_ROLES.CONTRIBUTOR, // Normaliser le nom du rôle
              role: member.role || TEAM_ROLES.CONTRIBUTOR, // Garder les deux pour compatibilité
              permissions: ROLE_PERMISSIONS[member.role] || [],
              joinedAt: member.joinedAt
            };
          } catch (error) {
            console.warn('⚠️ Erreur enrichissement membre:', member.userId, error);
            return {
              ...member,
              id: member.userId,
              displayName: member.displayName || 'Utilisateur Inconnu',
              isActive: true,
              teamRole: member.role || TEAM_ROLES.CONTRIBUTOR,
              role: member.role || TEAM_ROLES.CONTRIBUTOR,
              permissions: ROLE_PERMISSIONS[member.role] || []
            };
          }
        })
      );
      
      console.log('✅ Équipe chargée:', enrichedTeam.length, 'membres');
      return enrichedTeam;
      
    } catch (error) {
      console.error('❌ Erreur récupération équipe:', error);
      return [];
    }
  }

  /**
   * 🎯 ASSIGNER UN RÔLE À UN MEMBRE (FONCTION MANQUANTE CRITIQUE)
   */
  async assignRole(projectId, userId, newRole) {
    try {
      console.log('🎯 Assignation rôle:', { projectId, userId, newRole });
      
      // Validation du rôle
      if (!Object.values(TEAM_ROLES).includes(newRole)) {
        throw new Error('Rôle invalide');
      }
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Vérifier que le membre existe
      const memberIndex = team.findIndex(member => member.userId === userId);
      if (memberIndex === -1) {
        throw new Error('Membre non trouvé dans l\'équipe');
      }
      
      // Créer une copie du tableau team pour éviter les mutations
      const updatedTeam = [...team];
      
      // Mettre à jour le membre spécifique
      updatedTeam[memberIndex] = {
        ...updatedTeam[memberIndex],
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole] || [],
        updatedAt: new Date().toISOString(), // Utiliser une date JS normale
        roleUpdatedBy: 'system' // TODO: ajouter l'ID de l'utilisateur qui fait la modification
      };
      
      // Sauvegarder dans Firestore avec le tableau complet
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Rôle assigné avec succès');
      return { success: true, newRole };
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      throw error;
    }
  }

  /**
   * 👤 AJOUTER UN MEMBRE À L'ÉQUIPE
   */
  async addTeamMember(projectId, userEmail, role = TEAM_ROLES.CONTRIBUTOR, permissions = []) {
    try {
      console.log('➕ Ajout membre équipe:', { projectId, userEmail, role });
      
      // Trouver l'utilisateur par email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', userEmail.toLowerCase())
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error('Utilisateur introuvable avec cet email');
      }
      
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Vérifier si déjà membre
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      const currentTeam = projectData.team || [];
      
      const existingMember = currentTeam.find(m => m.userId === userId);
      if (existingMember) {
        throw new Error('Cette personne fait déjà partie de l\'équipe');
      }
      
      // Préparer le nouveau membre
      const newMember = {
        userId: userId,
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        role: role,
        permissions: ROLE_PERMISSIONS[role] || permissions,
        joinedAt: new Date().toISOString(), // Utiliser une date JS normale
        isActive: true,
        invitedBy: null // TODO: ajouter l'ID de l'utilisateur qui invite
      };
      
      // Créer un nouveau tableau team avec le nouveau membre
      const updatedTeam = [...currentTeam, newMember];
      
      // Ajouter à l'équipe du projet
      await updateDoc(doc(db, 'projects', projectId), {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      // Ajouter le projet aux projets de l'utilisateur
      try {
        const userRef = doc(db, 'users', userId);
        const userDocData = await getDoc(userRef);
        
        if (userDocData.exists()) {
          const existingProjects = userDocData.data().projects || [];
          if (!existingProjects.includes(projectId)) {
            const updatedUserProjects = [...existingProjects, projectId];
            await updateDoc(userRef, {
              projects: updatedUserProjects,
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (userError) {
        console.warn('⚠️ Erreur mise à jour projets utilisateur:', userError);
      }
      
      console.log('✅ Membre ajouté avec succès');
      return { success: true, member: newMember };
      
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 MODIFIER LE RÔLE D'UN MEMBRE (ALIAS POUR COMPATIBILITÉ)
   */
  async updateMemberRole(projectId, userId, newRole, newPermissions = []) {
    return await this.assignRole(projectId, userId, newRole);
  }

  /**
   * 🔄 METTRE À JOUR LE RÔLE D'UN MEMBRE (AUTRE ALIAS)
   */
  async updateTeamRole(projectId, currentUserId, memberId, newRole) {
    return await this.assignRole(projectId, memberId, newRole);
  }

  /**
   * 🗑️ RETIRER UN MEMBRE DE L'ÉQUIPE
   */
  async removeMember(projectId, userId) {
    try {
      console.log('🗑️ Suppression membre:', { projectId, userId });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Créer un nouveau tableau sans le membre à supprimer
      const updatedTeam = team.filter(member => member.userId !== userId);
      
      // Vérifier que le membre était bien dans l'équipe
      if (updatedTeam.length === team.length) {
        throw new Error('Membre non trouvé dans l\'équipe');
      }
      
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      // Retirer le projet de la liste de l'utilisateur
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userProjects = userData.projects || [];
          const updatedUserProjects = userProjects.filter(id => id !== projectId);
          
          await updateDoc(userRef, {
            projects: updatedUserProjects,
            updatedAt: serverTimestamp()
          });
        }
      } catch (userError) {
        console.warn('⚠️ Erreur mise à jour utilisateur:', userError);
      }
      
      console.log('✅ Membre retiré avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UN MEMBRE DE L'ÉQUIPE (ALIAS)
   */
  async removeTeamMember(projectId, currentUserId, memberId) {
    return await this.removeMember(projectId, memberId);
  }

  /**
   * 🔄 TRANSFÉRER LA PROPRIÉTÉ DU PROJET
   */
  async transferProjectOwnership(projectId, currentOwnerId, newOwnerId) {
    try {
      console.log('🔄 Transfert propriété:', { projectId, currentOwnerId, newOwnerId });
      
      const batch = writeBatch(db);
      
      // Mettre à jour le propriétaire du projet
      const projectRef = doc(db, 'projects', projectId);
      batch.update(projectRef, {
        ownerId: newOwnerId,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour les rôles dans l'équipe
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      const updatedTeam = team.map(member => {
        if (member.userId === newOwnerId) {
          return { ...member, role: TEAM_ROLES.OWNER };
        }
        if (member.userId === currentOwnerId) {
          return { ...member, role: TEAM_ROLES.MANAGER };
        }
        return member;
      });
      
      batch.update(projectRef, {
        team: updatedTeam,
        ownerId: newOwnerId,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      
      console.log('✅ Propriété transférée avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur transfert propriété:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📧 INVITER DES MEMBRES À L'ÉQUIPE
   */
  async inviteTeamMembers(projectId, inviterId, emails, role = TEAM_ROLES.CONTRIBUTOR) {
    try {
      console.log('📧 Invitation membres:', { projectId, emails, role });
      
      const results = [];
      
      for (const email of emails) {
        try {
          const result = await this.addTeamMember(projectId, email, role);
          results.push({ email, ...result });
        } catch (error) {
          results.push({ email, success: false, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        results,
        successCount,
        totalCount: emails.length
      };
      
    } catch (error) {
      console.error('❌ Erreur invitation membres:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS
   */
  async searchUsers(searchTerm, limit = 10) {
    try {
      console.log('🔍 Recherche utilisateurs:', searchTerm);
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('displayName'),
        limit(limit)
      );
      
      const snapshot = await getDocs(usersQuery);
      const users = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        const displayName = userData.displayName || '';
        const email = userData.email || '';
        
        // Filtrage côté client (à améliorer avec recherche serveur)
        if (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          users.push({
            userId: doc.id,
            displayName,
            email,
            avatar: userData.avatar || null,
            xpTotal: userData.xpTotal || 0
          });
        }
      });
      
      return users.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }

  /**
   * 🔐 VÉRIFIER LES PERMISSIONS D'ACTION
   */
  checkActionPermission(userRole, action) {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(action);
  }

  /**
   * 🎨 OBTENIR LA COULEUR D'UN RÔLE
   */
  getRoleColor(role) {
    const colors = {
      [TEAM_ROLES.OWNER]: 'bg-red-100 text-red-800',
      [TEAM_ROLES.MANAGER]: 'bg-purple-100 text-purple-800',
      [TEAM_ROLES.LEAD]: 'bg-blue-100 text-blue-800',
      [TEAM_ROLES.CONTRIBUTOR]: 'bg-green-100 text-green-800',
      [TEAM_ROLES.OBSERVER]: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  }

  /**
   * 🎯 OBTENIR L'ICÔNE D'UN RÔLE
   */
  getRoleIcon(role) {
    const icons = {
      [TEAM_ROLES.OWNER]: '👑',
      [TEAM_ROLES.MANAGER]: '⚡',
      [TEAM_ROLES.LEAD]: '🎯',
      [TEAM_ROLES.CONTRIBUTOR]: '👤',
      [TEAM_ROLES.OBSERVER]: '👁️'
    };
    return icons[role] || '👤';
  }

  /**
   * 📝 OBTENIR LES RÔLES DISPONIBLES
   */
  getAvailableRoles() {
    return [
      {
        value: TEAM_ROLES.OWNER,
        label: 'Propriétaire',
        description: 'Contrôle total du projet'
      },
      {
        value: TEAM_ROLES.MANAGER,
        label: 'Manager',
        description: 'Gestion équipe et tâches'
      },
      {
        value: TEAM_ROLES.LEAD,
        label: 'Leader',
        description: 'Gestion des tâches'
      },
      {
        value: TEAM_ROLES.CONTRIBUTOR,
        label: 'Contributeur',
        description: 'Participation aux tâches'
      },
      {
        value: TEAM_ROLES.OBSERVER,
        label: 'Observateur',
        description: 'Accès lecture seule'
      }
    ];
  }

  /**
   * 🔄 ÉCOUTER LES CHANGEMENTS D'ÉQUIPE EN TEMPS RÉEL
   */
  subscribeToTeamChanges(projectId, callback) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      
      const unsubscribe = onSnapshot(projectRef, (doc) => {
        if (doc.exists()) {
          const team = doc.data().team || [];
          callback(team);
        }
      });
      
      this.listeners.set(projectId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur listener équipe:', error);
      return null;
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
