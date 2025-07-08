// ==========================================
// 📁 react-app/src/core/services/teamManagementService.js
// Service de gestion d'équipe CORRIGÉ - Sans erreurs Firebase
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
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏢 SERVICE DE GESTION D'ÉQUIPE CORRIGÉ
 */
class TeamManagementService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 👥 RÉCUPÉRER L'ÉQUIPE D'UN PROJET
   */
  async getProjectTeam(projectId) {
    try {
      console.log('👥 Récupération équipe projet:', projectId);
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        console.log('⚠️ Projet introuvable');
        return [];
      }
      
      const team = projectDoc.data().team || [];
      console.log(`✅ ${team.length} membres dans l'équipe`);
      
      return team;
      
    } catch (error) {
      console.error('❌ Erreur récupération équipe:', error);
      return [];
    }
  }

  /**
   * ➕ AJOUTER UN MEMBRE À L'ÉQUIPE
   */
  async addTeamMember(projectId, userId, role = 'member', permissions = []) {
    try {
      console.log('➕ Ajout membre équipe:', { projectId, userId, role });
      
      // Récupérer les données utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur introuvable');
      }
      
      const userData = userDoc.data();
      
      // Vérifier si le projet existe
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const currentTeam = projectData.team || [];
      
      const existingMember = currentTeam.find(m => m.userId === userId);
      if (existingMember) {
        throw new Error('Cette personne fait déjà partie de l\'équipe');
      }
      
      // ✅ CORRECTION: Créer le timestamp AVANT l'utilisation dans arrayUnion
      const joinedAtTimestamp = new Date().toISOString();
      
      // Préparer le nouveau membre SANS serverTimestamp() à l'intérieur
      const newMember = {
        userId: userId,
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        role: role,
        permissions: permissions,
        joinedAt: joinedAtTimestamp, // ✅ Utiliser un timestamp fixe
        isActive: true,
        invitedBy: null
      };
      
      // Ajouter à l'équipe du projet
      await updateDoc(doc(db, 'projects', projectId), {
        team: arrayUnion(newMember),
        updatedAt: serverTimestamp() // ✅ serverTimestamp() OK ici car pas dans arrayUnion
      });
      
      // Ajouter le projet aux projets de l'utilisateur
      await updateDoc(doc(db, 'users', userId), {
        projects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Membre ajouté avec succès');
      return { success: true, member: newMember };
      
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 MODIFIER LE RÔLE D'UN MEMBRE - CORRIGÉ POUR L'ERREUR CONSOLE
   */
  async updateMemberRole(projectId, userId, newRole, newPermissions = []) {
    try {
      console.log('🎭 Assignation rôle:', { projectId, userId, newRole });
      
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
      
      // ✅ CORRECTION: Créer la nouvelle équipe complète SANS serverTimestamp dans l'objet
      const updatedTeam = [...team];
      updatedTeam[memberIndex] = {
        ...updatedTeam[memberIndex],
        role: newRole,
        permissions: newPermissions,
        roleUpdatedAt: new Date().toISOString() // ✅ Timestamp fixe STRING au lieu de serverTimestamp()
      };
      
      // ✅ CORRECTION: Remplacer toute l'équipe au lieu d'utiliser arrayUnion
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp(), // ✅ OK ici car pas dans arrayUnion
        lastTeamUpdate: new Date().toISOString()
      });
      
      console.log('✅ Rôle membre mis à jour avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ❌ RETIRER UN MEMBRE DE L'ÉQUIPE
   */
  async removeTeamMember(projectId, userId) {
    try {
      console.log('❌ Suppression membre équipe:', { projectId, userId });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Trouver et retirer le membre
      const memberToRemove = team.find(m => m.userId === userId);
      if (!memberToRemove) {
        throw new Error('Membre non trouvé dans l\'équipe');
      }
      
      // ✅ CORRECTION: Filtrer l'équipe au lieu d'utiliser arrayRemove
      const updatedTeam = team.filter(m => m.userId !== userId);
      
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      // Retirer le projet des projets de l'utilisateur
      await updateDoc(doc(db, 'users', userId), {
        projects: arrayRemove(projectId),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Membre retiré avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      return { success: false, error: error.message };
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
        activeMembers: team.filter(m => m.isActive).length,
        roleDistribution: {},
        averageXp: 0,
        mostActiveMembers: []
      };
      
      // Distribution des rôles
      team.forEach(member => {
        stats.roleDistribution[member.role] = (stats.roleDistribution[member.role] || 0) + 1;
      });
      
      // XP moyenne
      if (team.length > 0) {
        const totalXp = team.reduce((sum, member) => sum + (member.xpTotal || 0), 0);
        stats.averageXp = Math.round(totalXp / team.length);
      }
      
      // Membres les plus actifs (basé sur XP)
      stats.mostActiveMembers = team
        .sort((a, b) => (b.xpTotal || 0) - (a.xpTotal || 0))
        .slice(0, 3)
        .map(member => ({
          userId: member.userId,
          displayName: member.displayName,
          role: member.role,
          xpTotal: member.xpTotal || 0
        }));
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats équipe:', error);
      return null;
    }
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS - MÉTHODE SIMPLIFIÉE
   */
  async searchUsers(searchTerm, limit = 10) {
    try {
      console.log('🔍 Recherche utilisateurs:', searchTerm);
      
      // ✅ CORRECTION: Requête simple sans index complexe
      const usersQuery = query(
        collection(db, 'users'),
        limit(50) // Récupérer plus d'utilisateurs pour filtrer côté client
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
   * 🔄 ÉCOUTER LES CHANGEMENTS D'ÉQUIPE EN TEMPS RÉEL - SIMPLIFIÉ
   */
  subscribeToTeamChanges(projectId, callback) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      
      const unsubscribe = onSnapshot(projectRef, (doc) => {
        if (doc.exists()) {
          const team = doc.data().team || [];
          callback(team);
        }
      }, (error) => {
        console.error('❌ Erreur listener équipe:', error);
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
