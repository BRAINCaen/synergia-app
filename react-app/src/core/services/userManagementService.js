// src/core/services/userManagementService.js
// Service pour gérer et récupérer les utilisateurs
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  startAfter,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase.js';

class UserManagementService {
  constructor() {
    this.listeners = new Map();
  }

  // 👥 Récupérer tous les utilisateurs avec connexion Google
  async getAllGoogleUsers(options = {}) {
    try {
      const {
        limitCount = 50,
        orderByField = 'createdAt',
        orderDirection = 'desc',
        startAfterDoc = null
      } = options;

      let q = query(
        collection(db, 'users'),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      // Pagination si fournie
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        
        // Filtrer uniquement les utilisateurs Google (qui ont photoURL ou displayName typique Google)
        if (this.isGoogleUser(userData)) {
          users.push({
            id: doc.id,
            ...userData,
            // Convertir les timestamps en dates
            createdAt: userData.createdAt?.toDate?.() || null,
            updatedAt: userData.updatedAt?.toDate?.() || null,
            lastLoginAt: userData.lastLoginAt?.toDate?.() || null
          });
        }
      });

      console.log(`👥 ${users.length} utilisateurs Google récupérés`);
      
      return {
        users,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs Google:', error);
      throw error;
    }
  }

  // 🔍 Rechercher des utilisateurs par nom/email
  async searchUsers(searchTerm, options = {}) {
    try {
      const { limitCount = 20 } = options;
      
      // Firebase ne supporte pas les recherches full-text natives
      // On récupère tous les utilisateurs et on filtre côté client
      const allUsersResult = await this.getAllGoogleUsers({ limitCount: 100 });
      
      const searchTermLower = searchTerm.toLowerCase();
      const filteredUsers = allUsersResult.users.filter(user => {
        const displayName = (user.displayName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const department = (user.profile?.department || '').toLowerCase();
        
        return displayName.includes(searchTermLower) || 
               email.includes(searchTermLower) || 
               department.includes(searchTermLower);
      });

      console.log(`🔍 ${filteredUsers.length} utilisateurs trouvés pour "${searchTerm}"`);
      
      return {
        users: filteredUsers.slice(0, limitCount),
        hasMore: filteredUsers.length > limitCount
      };
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      throw error;
    }
  }

  // 📊 Obtenir les statistiques des utilisateurs
  async getUserStats() {
    try {
      const allUsersResult = await this.getAllGoogleUsers({ limitCount: 1000 });
      const users = allUsersResult.users;

      const stats = {
        totalUsers: users.length,
        activeToday: 0,
        activeThisWeek: 0,
        activeThisMonth: 0,
        averageXP: 0,
        topLevel: 0,
        departmentBreakdown: {},
        levelDistribution: {},
        recentJoins: 0
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const weekAgoTimestamp = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      let totalXP = 0;

      users.forEach(user => {
        // Activité
        if (user.lastLoginAt) {
          if (user.lastLoginAt >= today) stats.activeToday++;
          if (user.lastLoginAt >= weekAgo) stats.activeThisWeek++;
          if (user.lastLoginAt >= monthAgo) stats.activeThisMonth++;
        }

        // XP et niveau
        const userXP = user.gamification?.totalXp || 0;
        const userLevel = user.gamification?.level || 1;
        totalXP += userXP;
        
        if (userLevel > stats.topLevel) {
          stats.topLevel = userLevel;
        }

        // Distribution des niveaux
        const levelRange = this.getLevelRange(userLevel);
        stats.levelDistribution[levelRange] = (stats.levelDistribution[levelRange] || 0) + 1;

        // Départements
        const department = user.profile?.department || 'Non défini';
        stats.departmentBreakdown[department] = (stats.departmentBreakdown[department] || 0) + 1;

        // Nouveaux membres
        if (user.createdAt && user.createdAt >= weekAgoTimestamp) {
          stats.recentJoins++;
        }
      });

      stats.averageXP = users.length > 0 ? Math.round(totalXP / users.length) : 0;

      console.log('📊 Statistiques utilisateurs calculées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      throw error;
    }
  }

  // 🏆 Obtenir le leaderboard des utilisateurs
  async getLeaderboard(limitCount = 10) {
    try {
      const allUsersResult = await this.getAllGoogleUsers({ limitCount: 200 });
      
      // Trier par XP total descendant
      const sortedUsers = allUsersResult.users
        .sort((a, b) => (b.gamification?.totalXp || 0) - (a.gamification?.totalXp || 0))
        .slice(0, limitCount)
        .map((user, index) => ({
          rank: index + 1,
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          department: user.profile?.department,
          totalXp: user.gamification?.totalXp || 0,
          level: user.gamification?.level || 1,
          badges: user.gamification?.badges?.length || 0,
          tasksCompleted: user.gamification?.tasksCompleted || 0,
          loginStreak: user.gamification?.loginStreak || 0
        }));

      console.log(`🏆 Leaderboard généré avec ${sortedUsers.length} utilisateurs`);
      return sortedUsers;
    } catch (error) {
      console.error('❌ Erreur génération leaderboard:', error);
      throw error;
    }
  }

  // 👤 Obtenir un utilisateur spécifique
  async getUserById(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          id: userSnap.id,
          ...userData,
          createdAt: userData.createdAt?.toDate?.() || null,
          updatedAt: userData.updatedAt?.toDate?.() || null,
          lastLoginAt: userData.lastLoginAt?.toDate?.() || null
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  // 📡 Écouter les changements d'utilisateurs en temps réel
  subscribeToUsers(callback, options = {}) {
    try {
      const { limitCount = 50 } = options;
      
      const q = query(
        collection(db, 'users'),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = [];
        
        snapshot.docs.forEach(doc => {
          const userData = doc.data();
          
          if (this.isGoogleUser(userData)) {
            users.push({
              id: doc.id,
              ...userData,
              createdAt: userData.createdAt?.toDate?.() || null,
              updatedAt: userData.updatedAt?.toDate?.() || null,
              lastLoginAt: userData.lastLoginAt?.toDate?.() || null
            });
          }
        });

        callback(users);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur souscription utilisateurs:', error);
      return () => {}; // Fonction vide pour éviter les erreurs
    }
  }

  // 🔄 Fonctions utilitaires privées
  isGoogleUser(userData) {
    // Identifier les utilisateurs Google par leurs caractéristiques
    return userData.email && (
      userData.photoURL || // Google fournit généralement une photo
      userData.displayName || // Google fournit le nom
      userData.email.includes('gmail.com') // Souvent Gmail mais pas toujours
    );
  }

  getLevelRange(level) {
    if (level >= 10) return '10+';
    if (level >= 5) return '5-9';
    if (level >= 2) return '2-4';
    return '1';
  }

  // 🧹 Nettoyer les listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// Export singleton
export const userManagementService = new UserManagementService();
export default userManagementService;
