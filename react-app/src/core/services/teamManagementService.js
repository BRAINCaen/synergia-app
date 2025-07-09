// ==========================================
// 📁 react-app/src/core/services/teamManagementService.js
// SERVICE GESTION D'ÉQUIPE - CORRECTION RÉELLE DU PROBLÈME
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  setDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 👥 SERVICE DE GESTION D'ÉQUIPE - VERSION CORRIGÉE
 */
class TeamManagementService {
  constructor() {
    this.listeners = new Map();
    console.log('👥 TeamManagementService initialisé - Version corrigée');
  }

  /**
   * 🎭 ASSIGNER UN RÔLE - FONCTION CORRIGÉE
   */
  async assignRole(userId, roleId, assignedBy) {
    try {
      console.log('🎭 [CORRIGÉ] Assignation rôle:', { userId, roleId, assignedBy });
      
      // ✅ SOLUTION 1: Utiliser setDoc au lieu d'arrayUnion
      const memberRef = doc(db, 'teamMembers', userId);
      
      await setDoc(memberRef, {
        userId: userId,
        roleId: roleId,
        assignedBy: assignedBy,
        assignedAt: serverTimestamp(), // ✅ OK avec setDoc
        isActive: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ [CORRIGÉ] Rôle assigné avec succès');
      return { success: true, roleId, userId };
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👤 AJOUTER UN MEMBRE À L'ÉQUIPE - VERSION CORRIGÉE
   */
  async addTeamMember(projectId, userEmail, role = 'contributor', permissions = []) {
    try {
      console.log('➕ [CORRIGÉ] Ajout membre équipe:', { projectId, userEmail, role });
      
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
      
      // ✅ CORRECTION: Créer le membre SANS serverTimestamp pour arrayUnion
      const newMember = {
        userId: userId,
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        role: role,
        permissions: permissions,
        joinedAt: new Date().toISOString(), // ✅ String timestamp à la place
        isActive: true,
        invitedBy: null
      };
      
      // ✅ SOLUTION 2: Utiliser la méthode "remplacer le tableau complet"
      const updatedTeam = [...currentTeam, newMember];
      
      await updateDoc(doc(db, 'projects', projectId), {
        team: updatedTeam, // ✅ Remplacer le tableau complet
        updatedAt: serverTimestamp(), // ✅ OK ici
        teamSize: updatedTeam.length
      });
      
      // Ajouter le projet aux projets de l'utilisateur
      await updateDoc(doc(db, 'users', userId), {
        projects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [CORRIGÉ] Membre ajouté avec succès');
      return { success: true, member: newMember };
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur ajout membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 MODIFIER LE RÔLE D'UN MEMBRE - VERSION CORRIGÉE
   */
  async updateMemberRole(projectId, userId, newRole, newPermissions = []) {
    try {
      console.log('🔄 [CORRIGÉ] Modification rôle membre:', { projectId, userId, newRole });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // Trouver et modifier le membre
      const memberIndex = team.findIndex(m => m.userId === userId);
      if (memberIndex === -1) {
        throw new Error('Membre non trouvé dans l\'équipe');
      }
      
      // ✅ CORRECTION: Créer la nouvelle équipe sans serverTimestamp dans l'objet
      const updatedTeam = [...team];
      updatedTeam[memberIndex] = {
        ...updatedTeam[memberIndex],
        role: newRole,
        permissions: newPermissions,
        roleUpdatedAt: new Date().toISOString(), // ✅ String timestamp
        roleUpdatedBy: userId
      };
      
      // ✅ Remplacer le tableau complet
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp() // ✅ OK ici
      });
      
      console.log('✅ [CORRIGÉ] Rôle modifié avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur modification rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UN MEMBRE DE L'ÉQUIPE - VERSION CORRIGÉE
   */
  async removeMember(projectId, userId) {
    try {
      console.log('🗑️ [CORRIGÉ] Suppression membre:', { projectId, userId });
      
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }
      
      const projectData = projectDoc.data();
      const team = projectData.team || [];
      
      // ✅ CORRECTION: Filtrer l'équipe au lieu d'utiliser arrayRemove
      const updatedTeam = team.filter(member => member.userId !== userId);
      
      await updateDoc(projectRef, {
        team: updatedTeam,
        updatedAt: serverTimestamp(),
        teamSize: updatedTeam.length
      });
      
      // Retirer le projet de la liste de l'utilisateur
      try {
        await updateDoc(doc(db, 'users', userId), {
          projects: arrayRemove(projectId),
          updatedAt: serverTimestamp()
        });
      } catch (userError) {
        console.warn('⚠️ [CORRIGÉ] Erreur mise à jour utilisateur:', userError);
      }
      
      console.log('✅ [CORRIGÉ] Membre retiré avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur suppression membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 RÉCUPÉRER L'ÉQUIPE D'UN PROJET
   */
  async getProjectTeam(projectId) {
    try {
      console.log('🔍 [CORRIGÉ] Récupération équipe projet:', projectId);
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        console.warn('❌ [CORRIGÉ] Projet introuvable:', projectId);
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
            console.warn('⚠️ [CORRIGÉ] Erreur enrichissement membre:', member.userId, error);
            return {
              ...member,
              displayName: member.displayName || 'Utilisateur Inconnu',
              isActive: true
            };
          }
        })
      );
      
      console.log('✅ [CORRIGÉ] Équipe chargée:', enrichedTeam.length, 'membres');
      return enrichedTeam;
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur récupération équipe:', error);
      return [];
    }
  }

  /**
   * 👥 OBTENIR LES MEMBRES PAR RÔLE
   */
  async getMembersByRole(roleId) {
    try {
      console.log('🔍 [CORRIGÉ] Récupération membres par rôle:', roleId);
      
      const membersQuery = query(
        collection(db, 'teamMembers'),
        where('roleId', '==', roleId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(membersQuery);
      const members = [];
      
      querySnapshot.forEach((doc) => {
        const memberData = doc.data();
        members.push({
          id: doc.id,
          ...memberData
        });
      });
      
      console.log(`✅ [CORRIGÉ] ${members.length} membres trouvés pour le rôle ${roleId}`);
      return members;
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur récupération membres par rôle:', error);
      return [];
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
      console.error('❌ [CORRIGÉ] Erreur stats équipe:', error);
      return null;
    }
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS
   */
  async searchUsers(searchTerm, limit = 10) {
    try {
      console.log('🔍 [CORRIGÉ] Recherche utilisateurs:', searchTerm);
      
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
        
        // Filtrage côté client
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
      console.error('❌ [CORRIGÉ] Erreur recherche utilisateurs:', error);
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
      }, (error) => {
        console.error('❌ [CORRIGÉ] Erreur listener équipe:', error);
      });
      
      this.listeners.set(projectId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur listener équipe:', error);
      return null;
    }
  }

  /**
   * 🏷️ RÔLES DISPONIBLES
   */
  getAvailableRoles() {
    return [
      { value: 'maintenance', label: 'Entretien, Réparations & Maintenance', icon: '🔧' },
      { value: 'reputation', label: 'Gestion des Avis & de la Réputation', icon: '⭐' },
      { value: 'stock', label: 'Gestion des Stocks & Matériel', icon: '📦' },
      { value: 'admin', label: 'Administrateur', icon: '👑' }
    ];
  }

  /**
   * 🎨 COULEUR DU RÔLE
   */
  getRoleColor(role) {
    const colors = {
      maintenance: 'bg-orange-100 text-orange-800',
      reputation: 'bg-yellow-100 text-yellow-800',
      stock: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
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
