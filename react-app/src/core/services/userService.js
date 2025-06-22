// src/modules/auth/services/userService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../../core/firebase.js";
import { COLLECTIONS, USER_ROLES, USER_STATUS } from "../../../core/constants.js";

class UserService {
  // Récupérer le profil utilisateur complet
  async getUserProfile(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Vérifier et corriger les données manquantes
        const correctedData = await this.ensureUserDataIntegrity(uid, userData);
        
        return { profile: correctedData, error: null };
      } else {
        // Auto-créer le profil s'il n'existe pas
        const newProfile = await this.createDefaultProfile(uid);
        return { profile: newProfile, error: null };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return { profile: null, error: error.message };
    }
  }

  // Créer un profil par défaut
  async createDefaultProfile(uid, additionalData = {}) {
    const defaultProfile = {
      uid,
      email: additionalData.email || '',
      displayName: additionalData.displayName || '',
      photoURL: additionalData.photoURL || '',
      role: USER_ROLES.EMPLOYEE,
      status: USER_STATUS.ACTIVE,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      preferences: {
        theme: 'dark',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          inApp: true
        }
      },
      profile: {
        bio: '',
        department: '',
        position: '',
        skills: [],
        phone: '',
        location: ''
      },
      gamification: {
        xp: 0,
        level: 1,
        totalXp: 0,
        badges: [],
        achievements: [],
        streakDays: 0,
        lastActivityAt: serverTimestamp(),
        joinedAt: serverTimestamp()
      },
      ...additionalData
    };

    await setDoc(doc(db, COLLECTIONS.USERS, uid), defaultProfile);
    return defaultProfile;
  }

  // Assurer l'intégrité des données utilisateur
  async ensureUserDataIntegrity(uid, userData) {
    let needsUpdate = false;
    const updates = { ...userData };

    // Vérifier les champs obligatoires
    if (!updates.role) {
      updates.role = USER_ROLES.EMPLOYEE;
      needsUpdate = true;
    }

    if (!updates.status) {
      updates.status = USER_STATUS.ACTIVE;
      needsUpdate = true;
    }

    if (!updates.preferences) {
      updates.preferences = {
        theme: 'dark',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          inApp: true
        }
      };
      needsUpdate = true;
    }

    if (!updates.profile) {
      updates.profile = {
        bio: '',
        department: '',
        position: '',
        skills: [],
        phone: '',
        location: ''
      };
      needsUpdate = true;
    }

    if (!updates.gamification) {
      updates.gamification = {
        xp: 0,
        level: 1,
        totalXp: 0,
        badges: [],
        achievements: [],
        streakDays: 0,
        lastActivityAt: serverTimestamp(),
        joinedAt: userData.createdAt || serverTimestamp()
      };
      needsUpdate = true;
    }

    // Mettre à jour si nécessaire
    if (needsUpdate) {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
    }

    return updates;
  }

  // Mettre à jour le profil utilisateur
  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { error: error.message };
    }
  }

  // Mettre à jour les préférences
  async updateUserPreferences(uid, preferences) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        preferences: {
          ...preferences
        },
        updatedAt: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      return { error: error.message };
    }
  }

  // Mettre à jour la dernière activité
  async updateLastActivity(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        lastActivityAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière activité:', error);
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(searchTerm, filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.USERS);

      // Appliquer les filtres
      if (filters.role) {
        q = query(q, where('role', '==', filters.role));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.department) {
        q = query(q, where('profile.department', '==', filters.department));
      }

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Filtrer par terme de recherche côté client
        if (!searchTerm || 
            userData.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userData.profile?.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
          users.push({ id: doc.id, ...userData });
        }
      });

      return { users, error: null };
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return { users: [], error: error.message };
    }
  }

  // Obtenir tous les utilisateurs d'un département
  async getUsersByDepartment(department) {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('profile.department', '==', department),
        where('status', '==', USER_STATUS.ACTIVE)
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return { users, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par département:', error);
      return { users: [], error: error.message };
    }
  }

  // Obtenir les statistiques utilisateur
  async getUserStats(uid) {
    try {
      const userProfile = await this.getUserProfile(uid);
      
      if (userProfile.error) {
        return { stats: null, error: userProfile.error };
      }

      const stats = {
        totalXp: userProfile.profile.gamification?.totalXp || 0,
        level: userProfile.profile.gamification?.level || 1,
        badgesCount: userProfile.profile.gamification?.badges?.length || 0,
        achievementsCount: userProfile.profile.gamification?.achievements?.length || 0,
        streakDays: userProfile.profile.gamification?.streakDays || 0,
        joinedDaysAgo: this.calculateDaysSince(userProfile.profile.createdAt),
        lastLoginDaysAgo: this.calculateDaysSince(userProfile.profile.lastLoginAt)
      };

      return { stats, error: null };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { stats: null, error: error.message };
    }
  }

  // Calculer le nombre de jours depuis une date
  calculateDaysSince(date) {
    if (!date) return 0;
    
    const now = new Date();
    const targetDate = date.toDate ? date.toDate() : new Date(date);
    const diffTime = Math.abs(now - targetDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Vérifier si l'utilisateur a les permissions
  checkPermission(userRole, requiredRole) {
    const roleHierarchy = {
      [USER_ROLES.GUEST]: 0,
      [USER_ROLES.EMPLOYEE]: 1,
      [USER_ROLES.MANAGER]: 2,
      [USER_ROLES.ADMIN]: 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}

export default new UserService();
