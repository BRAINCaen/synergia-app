// ==========================================
// 📁 react-app/src/core/services/teamFirebaseService.js
// SERVICE FIREBASE POUR LA GESTION D'ÉQUIPE
// ==========================================

import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔥 SERVICE FIREBASE POUR LA GESTION D'ÉQUIPE
 * Gestion complète des rôles, membres et données d'équipe
 */
class TeamFirebaseService {
  
  constructor() {
    this.listeners = new Map();
  }

  // ==========================================
  // 👥 GESTION DES MEMBRES D'ÉQUIPE
  // ==========================================

  /**
   * 📋 Créer ou mettre à jour un profil de membre
   */
  async createOrUpdateMember(userId, memberData) {
    try {
      console.log('🔄 Création/MAJ membre:', userId);
      
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      const defaultMemberData = {
        id: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        synergiaRoles: [],
        teamStats: {
          totalXp: 0,
          level: 1,
          tasksCompleted: 0,
          rolesCount: 0,
          joinedAt: serverTimestamp()
        },
        permissions: [],
        status: 'active'
      };

      if (memberDoc.exists()) {
        // Mise à jour membre existant
        await updateDoc(memberRef, {
          ...memberData,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Membre mis à jour:', userId);
      } else {
        // Création nouveau membre
        await setDoc(memberRef, {
          ...defaultMemberData,
          ...memberData
        });
        console.log('✅ Nouveau membre créé:', userId);
      }

      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur création/MAJ membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 Obtenir les données d'un membre
   */
  async getMember(userId) {
    try {
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (memberDoc.exists()) {
        return {
          success: true,
          data: {
            id: memberDoc.id,
            ...memberDoc.data()
          }
        };
      } else {
        return { success: false, error: 'Membre non trouvé' };
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération membre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 Obtenir tous les membres de l'équipe
   */
  async getAllMembers() {
    try {
      console.log('🔄 Récupération tous les membres...');
      
      const membersQuery = query(
        collection(db, 'teamMembers'),
        where('status', '==', 'active'),
        orderBy('teamStats.level', 'desc')
      );
      
      const snapshot = await getDocs(membersQuery);
      const members = [];
      
      snapshot.forEach((doc) => {
        members.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ ${members.length} membres récupérés`);
      return { success: true, data: members };
      
    } catch (error) {
      console.error('❌ Erreur récupération membres:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👂 Écouter les changements de l'équipe en temps réel
   */
  subscribeToTeamChanges(callback) {
    try {
      console.log('👂 Abonnement changements équipe...');
      
      const membersQuery = query(
        collection(db, 'teamMembers'),
        where('status', '==', 'active'),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
        const members = [];
        snapshot.forEach((doc) => {
          members.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`🔄 Mise à jour temps réel: ${members.length} membres`);
        callback(members);
      });
      
      this.listeners.set('teamChanges', unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur abonnement équipe:', error);
      return () => {};
    }
  }

  // ==========================================
  // 🎭 GESTION DES RÔLES SYNERGIA
  // ==========================================

  /**
   * ➕ Assigner un rôle à un membre
   */
  async assignRole(userId, roleData, assignedBy) {
    try {
      console.log('🎭 Assignation rôle:', { userId, roleId: roleData.roleId, assignedBy });
      
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // Vérifier si le rôle n'est pas déjà assigné
      if (currentRoles.some(role => role.roleId === roleData.roleId)) {
        throw new Error('Ce rôle est déjà assigné à ce membre');
      }
      
      // Créer le nouveau rôle
      const newRole = {
        roleId: roleData.roleId,
        assignedAt: serverTimestamp(),
        assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice',
        permissions: roleData.permissions || [],
        lastActivity: serverTimestamp()
      };
      
      // Mettre à jour le membre
      await updateDoc(memberRef, {
        synergiaRoles: arrayUnion(newRole),
        'teamStats.rolesCount': increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Enregistrer l'action dans l'historique
      await this.addRoleHistory(userId, 'assign', roleData.roleId, assignedBy);
      
      console.log('✅ Rôle assigné avec succès');
      return { success: true, role: newRole };
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ➖ Retirer un rôle d'un membre
   */
  async removeRole(userId, roleId, removedBy) {
    try {
      console.log('🗑️ Suppression rôle:', { userId, roleId, removedBy });
      
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // Trouver le rôle à supprimer
      const roleToRemove = currentRoles.find(role => role.roleId === roleId);
      if (!roleToRemove) {
        throw new Error('Rôle non trouvé pour ce membre');
      }
      
      // Retirer le rôle
      await updateDoc(memberRef, {
        synergiaRoles: arrayRemove(roleToRemove),
        'teamStats.rolesCount': increment(-1),
        updatedAt: serverTimestamp()
      });
      
      // Enregistrer l'action dans l'historique
      await this.addRoleHistory(userId, 'remove', roleId, removedBy);
      
      console.log('✅ Rôle retiré avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 Mettre à jour la progression d'un rôle
   */
  async updateRoleProgress(userId, roleId, xpToAdd, tasksCompleted = 0) {
    try {
      console.log('📈 MAJ progression rôle:', { userId, roleId, xpToAdd });
      
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // Trouver et mettre à jour le rôle
      const updatedRoles = currentRoles.map(role => {
        if (role.roleId === roleId) {
          const newXp = role.xpInRole + xpToAdd;
          const newTasksCompleted = role.tasksCompleted + tasksCompleted;
          const newLevel = this.calculateRoleLevel(newXp);
          
          return {
            ...role,
            xpInRole: newXp,
            tasksCompleted: newTasksCompleted,
            level: newLevel,
            lastActivity: serverTimestamp()
          };
        }
        return role;
      });
      
      // Mettre à jour le membre
      await updateDoc(memberRef, {
        synergiaRoles: updatedRoles,
        'teamStats.totalXp': increment(xpToAdd),
        'teamStats.tasksCompleted': increment(tasksCompleted),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Progression rôle mise à jour');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur MAJ progression rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧮 Calculer le niveau d'un rôle basé sur l'XP
   */
  calculateRoleLevel(xp) {
    if (xp >= 5000) return 'maitre';
    if (xp >= 3000) return 'expert';
    if (xp >= 1500) return 'competent';
    if (xp >= 500) return 'apprenti';
    return 'novice';
  }

  // ==========================================
  // 📊 STATISTIQUES ET ANALYTICS
  // ==========================================

  /**
   * 📊 Obtenir les statistiques globales de l'équipe
   */
  async getTeamStats() {
    try {
      console.log('📊 Calcul stats équipe...');
      
      const members = await this.getAllMembers();
      if (!members.success) {
        throw new Error('Impossible de récupérer les membres');
      }
      
      const teamData = members.data;
      
      // Calculer les statistiques
      const stats = {
        totalMembers: teamData.length,
        activeMembers: teamData.filter(m => m.status === 'active').length,
        totalXp: teamData.reduce((sum, m) => sum + (m.teamStats?.totalXp || 0), 0),
        totalTasks: teamData.reduce((sum, m) => sum + (m.teamStats?.tasksCompleted || 0), 0),
        totalRoles: teamData.reduce((sum, m) => sum + (m.synergiaRoles?.length || 0), 0),
        averageLevel: teamData.length > 0 
          ? Math.round(teamData.reduce((sum, m) => sum + (m.teamStats?.level || 1), 0) / teamData.length)
          : 0,
        
        // Répartition des rôles
        roleDistribution: {},
        
        // Top performers
        topPerformers: teamData
          .sort((a, b) => (b.teamStats?.totalXp || 0) - (a.teamStats?.totalXp || 0))
          .slice(0, 5)
          .map(m => ({
            id: m.id,
            name: m.displayName || m.email,
            totalXp: m.teamStats?.totalXp || 0,
            level: m.teamStats?.level || 1,
            rolesCount: m.synergiaRoles?.length || 0
          })),
        
        lastUpdated: new Date()
      };
      
      // Calculer la répartition des rôles
      teamData.forEach(member => {
        if (member.synergiaRoles) {
          member.synergiaRoles.forEach(role => {
            if (!stats.roleDistribution[role.roleId]) {
              stats.roleDistribution[role.roleId] = {
                count: 0,
                totalXp: 0,
                users: []
              };
            }
            stats.roleDistribution[role.roleId].count++;
            stats.roleDistribution[role.roleId].totalXp += role.xpInRole || 0;
            stats.roleDistribution[role.roleId].users.push({
              id: member.id,
              name: member.displayName || member.email,
              xp: role.xpInRole || 0,
              level: role.level
            });
          });
        }
      });
      
      console.log('✅ Stats équipe calculées');
      return { success: true, data: stats };
      
    } catch (error) {
      console.error('❌ Erreur calcul stats équipe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 Obtenir les stats d'un rôle spécifique
   */
  async getRoleStats(roleId) {
    try {
      const members = await this.getAllMembers();
      if (!members.success) {
        throw new Error('Impossible de récupérer les membres');
      }
      
      const membersWithRole = members.data.filter(member => 
        member.synergiaRoles?.some(role => role.roleId === roleId)
      );
      
      const roleStats = {
        roleId,
        totalUsers: membersWithRole.length,
        activeUsers: membersWithRole.filter(m => m.status === 'active').length,
        totalXp: 0,
        averageXp: 0,
        totalTasks: 0,
        averageTasks: 0,
        levelDistribution: {
          novice: 0,
          apprenti: 0,
          competent: 0,
          expert: 0,
          maitre: 0
        },
        topPerformers: []
      };
      
      // Calculer les stats
      membersWithRole.forEach(member => {
        const userRole = member.synergiaRoles.find(role => role.roleId === roleId);
        if (userRole) {
          roleStats.totalXp += userRole.xpInRole || 0;
          roleStats.totalTasks += userRole.tasksCompleted || 0;
          roleStats.levelDistribution[userRole.level]++;
          
          roleStats.topPerformers.push({
            id: member.id,
            name: member.displayName || member.email,
            xp: userRole.xpInRole || 0,
            level: userRole.level,
            tasksCompleted: userRole.tasksCompleted || 0
          });
        }
      });
      
      // Calculer les moyennes
      if (roleStats.totalUsers > 0) {
        roleStats.averageXp = Math.round(roleStats.totalXp / roleStats.totalUsers);
        roleStats.averageTasks = Math.round(roleStats.totalTasks / roleStats.totalUsers);
      }
      
      // Trier les top performers
      roleStats.topPerformers.sort((a, b) => b.xp - a.xp);
      roleStats.topPerformers = roleStats.topPerformers.slice(0, 10);
      
      return { success: true, data: roleStats };
      
    } catch (error) {
      console.error('❌ Erreur stats rôle:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 📝 HISTORIQUE ET LOGS
  // ==========================================

  /**
   * 📝 Ajouter une entrée à l'historique des rôles
   */
  async addRoleHistory(userId, action, roleId, performedBy, metadata = {}) {
    try {
      const historyRef = collection(db, 'roleHistory');
      
      const historyEntry = {
        userId,
        action, // 'assign', 'remove', 'update'
        roleId,
        performedBy,
        timestamp: serverTimestamp(),
        metadata
      };
      
      await addDoc(historyRef, historyEntry);
      
      console.log('📝 Historique ajouté:', action, roleId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur ajout historique:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 Obtenir l'historique des rôles
   */
  async getRoleHistory(userId = null, limit = 50) {
    try {
      let historyQuery;
      
      if (userId) {
        historyQuery = query(
          collection(db, 'roleHistory'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limit)
        );
      } else {
        historyQuery = query(
          collection(db, 'roleHistory'),
          orderBy('timestamp', 'desc'),
          limit(limit)
        );
      }
      
      const snapshot = await getDocs(historyQuery);
      const history = [];
      
      snapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: history };
      
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 🧹 UTILITIES ET CLEANUP
  // ==========================================

  /**
   * 🧹 Nettoyer les listeners
   */
  cleanup() {
    console.log('🧹 Nettoyage listeners TeamFirebaseService...');
    this.listeners.forEach((unsubscribe, key) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
        console.log(`✅ Listener ${key} nettoyé`);
      }
    });
    this.listeners.clear();
  }

  /**
   * 🔄 Synchroniser un utilisateur avec son profil Firebase Auth
   */
  async syncUserWithAuth(user) {
    try {
      const memberData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        authProvider: user.providerData?.[0]?.providerId || 'unknown'
      };
      
      return await this.createOrUpdateMember(user.uid, memberData);
      
    } catch (error) {
      console.error('❌ Erreur sync utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 Rechercher des membres
   */
  async searchMembers(searchTerm, filters = {}) {
    try {
      const members = await this.getAllMembers();
      if (!members.success) {
        throw new Error('Impossible de récupérer les membres');
      }
      
      let filteredMembers = members.data;
      
      // Filtre par terme de recherche
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredMembers = filteredMembers.filter(member => 
          (member.displayName || '').toLowerCase().includes(term) ||
          (member.email || '').toLowerCase().includes(term)
        );
      }
      
      // Filtres additionnels
      if (filters.roleId) {
        filteredMembers = filteredMembers.filter(member =>
          member.synergiaRoles?.some(role => role.roleId === filters.roleId)
        );
      }
      
      if (filters.minLevel) {
        filteredMembers = filteredMembers.filter(member =>
          (member.teamStats?.level || 1) >= filters.minLevel
        );
      }
      
      if (filters.status) {
        filteredMembers = filteredMembers.filter(member =>
          member.status === filters.status
        );
      }
      
      return { success: true, data: filteredMembers };
      
    } catch (error) {
      console.error('❌ Erreur recherche membres:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export du service singleton
export const teamFirebaseService = new TeamFirebaseService();
export default teamFirebaseService;
