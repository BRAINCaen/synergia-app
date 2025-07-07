// ==========================================
// 📁 react-app/src/core/services/teamManagementService.js
// SERVICE GESTION D'ÉQUIPE - NOUVEAU FICHIER CRÉATION
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
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../config/firebase.js';

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
              displayName: userData.displayName || member.displayName || 'Utilisateur Inconnu',
              email: userData.email || member.email || '',
              avatar: userData.avatar || null,
              isActive: userData.isActive !== false,
              lastActivity: userData.lastActivity || null,
              xpTotal: userData.xpTotal || 0
            };
          } catch (error) {
            console.warn('⚠️ Erreur enrichissement membre:', member.userId, error);
            return {
              ...member,
              displayName: member.displayName || 'Utilisateur Inconnu',
              isActive: true
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
   * 👤 AJOUTER UN MEMBRE À L'ÉQUIPE
   */
  async addTeamMember(projectId, userEmail, role = 'contributor', permissions = []) {
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
        permissions: permissions,
        joinedAt: serverTimestamp(),
        isActive: true,
        invitedBy: null // TODO: ajouter l'ID de l'utilisateur qui invite
      };
      
      // Ajouter à l'équipe du projet
      await updateDoc(doc(db, 'projects', projectId), {
        team: arrayUnion(newMember),
        updatedAt: serverTimestamp()
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
   * 🔄 MODIFIER LE RÔLE D'UN MEMBRE
   */
  async updateMemberRole(projectId, userId, newRole, newPermissions = []) {
    try {
      console.log('🔄 Modification rôle membre:', { projectId, userId, newRole });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Trouver et modifier le membre
      const updatedTeam = team.map(member => {
        if (member.userId === userId) {
          return {
            ...member,
            role: newRole,
            permissions: newPermissions,
            updatedAt: serverTimestamp()
          };
        }
        return member;
      });
      
      // Sauvegarder
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Rôle modifié avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur modification rôle:', error);
      return { success: false, error: error.message };
    }
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
      
      // Retirer le membre de l'équipe
      const updatedTeam = team.filter(member => member.userId !== userId);
      
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp()
      });
      
      // Retirer le projet de la liste de l'utilisateur
      try {
        await updateDoc(doc(db, 'users', userId), {
          projects: arrayRemove(projectId),
          updatedAt: serverTimestamp()
        });
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
   * 🔍 RECHERCHER DES UTILISATEURS
   */
  async searchUsers(searchTerm, limit = 10) {
    try {
      console.log('🔍 Recherche utilisateurs:', searchTerm);
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('displayName'),
        // TODO: Ajouter un filtre de recherche textuelle
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
