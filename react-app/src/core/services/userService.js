// ==========================================
// 📁 react-app/src/core/services/userService.js
// SERVICE UTILISATEURS COMPLET AVEC GESTION DE PROFIL
// ==========================================

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 👤 SERVICE DE GESTION DES UTILISATEURS
 */
class UserService {
  constructor() {
    console.log('👤 UserService initialisé');
  }

  // Créer ou mettre à jour le profil utilisateur
  async createOrUpdateUserProfile(userData) {
    try {
      const userRef = doc(db, 'users', userData.uid);
      
      const profileData = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL || null,
        
        // Profil étendu
        profile: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          department: userData.department || '',
          role: userData.role || 'member',
          joinedAt: userData.joinedAt || serverTimestamp(),
          bio: userData.bio || '',
          skills: userData.skills || [],
          preferences: {
            theme: 'dark',
            language: 'fr',
            notifications: true
          }
        },
        
        // Gamification
        gamification: {
          xp: userData.xp || 0,
          level: userData.level || 1,
          totalPoints: userData.totalPoints || 0,
          weeklyXp: userData.weeklyXp || 0,
          monthlyXp: userData.monthlyXp || 0,
          badges: userData.badges || [],
          achievements: userData.achievements || []
        },
        
        // Métadonnées
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      await setDoc(userRef, profileData, { merge: true });
      console.log('✅ Profil utilisateur mis à jour:', userData.uid);
      
      return profileData;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  }

  // Obtenir le profil complet d'un utilisateur
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { uid: userId, ...userDoc.data() };
      } else {
        console.warn(`⚠️ Profil utilisateur introuvable: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return null;
    }
  }

  // Obtenir tous les utilisateurs
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      
      console.log(`👥 ${users.length} utilisateurs récupérés`);
      return users;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return [];
    }
  }

  // Mettre à jour les statistiques de gamification
  async updateGamificationStats(userId, stats) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        'gamification.xp': stats.xp || 0,
        'gamification.level': stats.level || 1,
        'gamification.totalPoints': stats.totalPoints || 0,
        'gamification.weeklyXp': stats.weeklyXp || 0,
        'gamification.monthlyXp': stats.monthlyXp || 0,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Stats gamification mises à jour:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour stats gamification:', error);
      return false;
    }
  }

  // Ajouter un badge à un utilisateur
  async addBadgeToUser(userId, badge) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentBadges = userData.gamification?.badges || [];
        
        // Vérifier que le badge n'existe pas déjà
        const badgeExists = currentBadges.some(b => b.id === badge.id);
        if (badgeExists) {
          console.warn(`⚠️ Badge ${badge.id} déjà possédé par ${userId}`);
          return false;
        }
        
        const newBadge = {
          ...badge,
          earnedAt: serverTimestamp(),
          earnedDate: new Date().toISOString()
        };
        
        await updateDoc(userRef, {
          'gamification.badges': [...currentBadges, newBadge],
          updatedAt: serverTimestamp()
        });
        
        console.log(`🏆 Badge ${badge.id} ajouté à ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur ajout badge:', error);
      return false;
    }
  }

  // Obtenir les utilisateurs actifs
  async getActiveUsers(daysActive = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysActive);
      
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('lastLogin', '>=', cutoffDate),
        orderBy('lastLogin', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const activeUsers = [];
      
      snapshot.forEach(doc => {
        activeUsers.push({ uid: doc.id, ...doc.data() });
      });
      
      console.log(`👥 ${activeUsers.length} utilisateurs actifs trouvés`);
      return activeUsers;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs actifs:', error);
      return [];
    }
  }

  // Écouter les changements du leaderboard
  onLeaderboardChange(callback) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('isActive', '==', true),
        orderBy('gamification.xp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leaderboard = [];
        snapshot.forEach(doc => {
          const userData = doc.data();
          leaderboard.push({
            uid: doc.id,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            xp: userData.gamification?.xp || 0,
            level: userData.gamification?.level || 1,
            weeklyXp: userData.gamification?.weeklyXp || 0,
            monthlyXp: userData.gamification?.monthlyXp || 0
          });
        });

        console.log(`📊 Leaderboard mis à jour: ${leaderboard.length} utilisateurs`);
        callback(leaderboard);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur écoute leaderboard:', error);
      callback([]);
      return () => {};
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(searchTerm, department = null) {
    try {
      let q = collection(db, 'users');
      
      if (department) {
        q = query(q, where('profile.department', '==', department));
      }

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        const displayName = userData.displayName || '';
        const email = userData.email || '';
        
        // Recherche simple par nom ou email
        if (displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())) {
          users.push({
            uid: doc.id,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
            department: userData.profile?.department,
            level: userData.gamification?.level || 1
          });
        }
      });

      return users;
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }
}

// Instance du service
const userServiceInstance = new UserService();

// Export par défaut
export default userServiceInstance;

// Export nommé pour compatibilité
export const userService = userServiceInstance;
