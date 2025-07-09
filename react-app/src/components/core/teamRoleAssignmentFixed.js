// ==========================================
// 📁 react-app/src/core/services/teamRoleAssignmentFixed.js
// SERVICE CORRIGÉ POUR L'ATTRIBUTION DE RÔLES SYNERGIA
// ==========================================

import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎭 SERVICE CORRIGÉ D'ATTRIBUTION DE RÔLES SYNERGIA
 * Résout les erreurs serverTimestamp avec arrayUnion
 */
class TeamRoleAssignmentFixed {
  
  /**
   * ✅ ASSIGNER UN RÔLE SYNERGIA CORRIGÉ
   */
  async assignSynergiaRole(userId, roleData, assignedBy) {
    try {
      console.log('🎭 [FIXED] Assignation rôle Synergia:', { userId, roleId: roleData.id, assignedBy });
      
      if (!userId || !roleData || !roleData.id) {
        throw new Error('Paramètres manquants pour l\'assignation de rôle');
      }

      // 1. Récupérer le membre dans teamMembers
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        // Créer le membre s'il n'existe pas
        await this.createTeamMember(userId);
      }
      
      // 2. Récupérer les données actuelles
      const currentMemberDoc = await getDoc(memberRef);
      const memberData = currentMemberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // 3. Vérifier si le rôle n'est pas déjà assigné
      if (currentRoles.some(role => role.roleId === roleData.id)) {
        throw new Error('Ce rôle est déjà assigné à ce membre');
      }
      
      // 4. ✅ CORRECTION: Créer le nouvel objet rôle SANS serverTimestamp
      const newRole = {
        roleId: roleData.id,
        roleName: roleData.name,
        assignedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp()
        assignedBy: assignedBy || 'system',
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice',
        permissions: roleData.permissions || [],
        lastActivity: new Date().toISOString(), // ✅ String au lieu de serverTimestamp()
        isActive: true
      };
      
      // 5. ✅ MÉTHODE SÉCURISÉE: Mettre à jour le tableau complet
      const updatedRoles = [...currentRoles, newRole];
      
      await updateDoc(memberRef, {
        synergiaRoles: updatedRoles, // Remplacer tout le tableau
        'teamStats.rolesCount': updatedRoles.length,
        updatedAt: serverTimestamp(), // ✅ OK ici car pas dans arrayUnion
        lastRoleUpdate: new Date().toISOString()
      });
      
      console.log('✅ [FIXED] Rôle Synergia assigné avec succès');
      return { 
        success: true, 
        role: newRole,
        message: `Rôle "${roleData.name}" assigné avec succès`
      };
      
    } catch (error) {
      console.error('❌ [FIXED] Erreur assignation rôle Synergia:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * ✅ RETIRER UN RÔLE SYNERGIA CORRIGÉ
   */
  async removeSynergiaRole(userId, roleId, removedBy) {
    try {
      console.log('🗑️ [FIXED] Suppression rôle Synergia:', { userId, roleId, removedBy });
      
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // Filtrer pour retirer le rôle spécifique
      const updatedRoles = currentRoles.filter(role => role.roleId !== roleId);
      
      if (updatedRoles.length === currentRoles.length) {
        throw new Error('Rôle non trouvé pour ce membre');
      }
      
      // ✅ MÉTHODE SÉCURISÉE: Remplacer tout le tableau
      await updateDoc(memberRef, {
        synergiaRoles: updatedRoles,
        'teamStats.rolesCount': updatedRoles.length,
        updatedAt: serverTimestamp(),
        lastRoleUpdate: new Date().toISOString()
      });
      
      console.log('✅ [FIXED] Rôle Synergia supprimé avec succès');
      return { 
        success: true,
        message: `Rôle supprimé avec succès`
      };
      
    } catch (error) {
      console.error('❌ [FIXED] Erreur suppression rôle Synergia:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * ✅ ASSIGNER UN RÔLE DE PROJET CORRIGÉ
   */
  async assignProjectRole(projectId, userId, newRole, assignedBy) {
    try {
      console.log('👤 [FIXED] Assignation rôle projet:', { projectId, userId, newRole, assignedBy });
      
      if (!projectId || !userId || !newRole) {
        throw new Error('Paramètres manquants pour l\'assignation de rôle');
      }

      // Récupérer le projet
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Trouver le membre dans l'équipe
      const memberIndex = team.findIndex(m => m.userId === userId);
      if (memberIndex === -1) {
        throw new Error('Membre non trouvé dans l\'équipe');
      }
      
      // ✅ CORRECTION: Créer la nouvelle équipe SANS serverTimestamp dans l'objet
      const updatedTeam = [...team];
      const currentMember = updatedTeam[memberIndex];
      
      updatedTeam[memberIndex] = {
        ...currentMember,
        role: newRole,
        roleUpdatedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp()
        roleUpdatedBy: assignedBy || 'system'
      };
      
      // ✅ CORRECTION: Mettre à jour le document avec la nouvelle équipe
      await updateDoc(projectRef, {
        team: updatedTeam, // Remplacer tout le tableau
        updatedAt: serverTimestamp(), // ✅ OK ici car pas dans un objet arrayUnion
        lastTeamModification: new Date().toISOString()
      });
      
      console.log('✅ [FIXED] Rôle projet assigné avec succès');
      return { 
        success: true, 
        member: updatedTeam[memberIndex],
        message: `Rôle "${newRole}" assigné avec succès`
      };
      
    } catch (error) {
      console.error('❌ [FIXED] Erreur assignation rôle projet:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * 👤 CRÉER UN MEMBRE D'ÉQUIPE S'IL N'EXISTE PAS
   */
  async createTeamMember(userId) {
    try {
      const memberRef = doc(db, 'teamMembers', userId);
      
      // Récupérer les infos utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const defaultMemberData = {
        id: userId,
        email: userData.email || '',
        displayName: userData.displayName || 'Utilisateur Inconnu',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        synergiaRoles: [],
        teamStats: {
          totalXp: 0,
          level: 1,
          tasksCompleted: 0,
          rolesCount: 0,
          joinedAt: new Date().toISOString() // ✅ String pour éviter les erreurs
        },
        permissions: [],
        status: 'active'
      };

      await updateDoc(memberRef, defaultMemberData).catch(async () => {
        // Si le document n'existe pas, le créer
        await setDoc(memberRef, defaultMemberData);
      });
      
      console.log('✅ [FIXED] Membre d\'équipe créé:', userId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [FIXED] Erreur création membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES RÔLES D'UN MEMBRE
   */
  async getMemberRoles(userId) {
    try {
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        return { success: true, roles: [] };
      }
      
      const memberData = memberDoc.data();
      const roles = memberData.synergiaRoles || [];
      
      return { 
        success: true, 
        roles: roles.filter(role => role.isActive !== false) 
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération rôles membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 METTRE À JOUR LA PROGRESSION D'UN RÔLE
   */
  async updateRoleProgress(userId, roleId, xpToAdd = 0, tasksToAdd = 0) {
    try {
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // Mettre à jour le rôle spécifique
      const updatedRoles = currentRoles.map(role => {
        if (role.roleId === roleId) {
          const newXp = (role.xpInRole || 0) + xpToAdd;
          const newTasks = (role.tasksCompleted || 0) + tasksToAdd;
          
          return {
            ...role,
            xpInRole: newXp,
            tasksCompleted: newTasks,
            lastActivity: new Date().toISOString()
          };
        }
        return role;
      });
      
      // ✅ MÉTHODE SÉCURISÉE: Remplacer tout le tableau
      await updateDoc(memberRef, {
        synergiaRoles: updatedRoles,
        updatedAt: serverTimestamp(),
        'teamStats.totalXp': (memberData.teamStats?.totalXp || 0) + xpToAdd,
        'teamStats.tasksCompleted': (memberData.teamStats?.tasksCompleted || 0) + tasksToAdd
      });
      
      console.log('✅ Progression rôle mise à jour');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
      return { success: false, error: error.message };
    }
  }
}

// ✅ Export de l'instance
const teamRoleAssignmentFixed = new TeamRoleAssignmentFixed();

export { teamRoleAssignmentFixed };
export default teamRoleAssignmentFixed;
