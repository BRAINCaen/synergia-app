// src/services/userService.js
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { COLLECTIONS, USER_ROLES, USER_STATUS } from '../core/constants.js';

class UserService {
  // Vérifier et créer le document utilisateur si nécessaire
  async ensureUserDocument(user) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log(`📝 Création du document utilisateur pour ${user.email}`);
        await this.createUserDocument(user);
        return true; // Document créé
      }
      
      return false; // Document existait déjà
    } catch (error) {
      console.error('❌ Erreur vérification document utilisateur:', error);
      throw error;
    }
  }

  // Créer un document utilisateur complet
  async createUserDocument(user) {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      role: USER_ROLES.EMPLOYEE,
      status: USER_STATUS.ACTIVE,
      
      // Timestamps
      createdAt: new Date(),
      lastLoginAt: new Date(),
      updatedAt: new Date(),
      
      // Préférences
      preferences: {
        theme: 'dark',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          inApp: true
        }
      },
      
      // Profile
      profile: {
        bio: '',
        department: '',
        position: '',
        skills: [],
        phone: '',
        location: ''
      },
      
      // Gamification
      gamification: {
        xp: 0,
        level: 1,
        totalXp: 0,
        badges: [],
        achievements: [],
        joinedAt: new Date(),
        streakDays: 0,
        lastActivityAt: new Date()
      },
      
      // Statistiques
      stats: {
        tasksCompleted: 0,
        projectsCreated: 0,
        helpProvided: 0,
        loginCount: 1
      },
      
      // Version de l'app
      version: '3.0',
      migrationComplete: true
    };

    await setDoc(userRef, userData);
    console.log(`✅ Document utilisateur créé pour ${user.email}`);
    return userData;
  }

  // Mettre à jour en toute sécurité (vérifie l'existence avant)
  async safeUpdateUser(uid, updates) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn(`⚠️ Tentative de mise à jour d'un utilisateur inexistant: ${uid}`);
        return { success: false, error: 'Document utilisateur introuvable' };
      }
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer un utilisateur avec création automatique si nécessaire
  async getUserProfile(uid, fallbackUserData = null) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { profile: userSnap.data(), created: false };
      }
      
      // Si le document n'existe pas et qu'on a des données de fallback
      if (fallbackUserData) {
        const newProfile = await this.createUserDocument(fallbackUserData);
        return { profile: newProfile, created: true };
      }
      
      return { profile: null, created: false };
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return { profile: null, error: error.message };
    }
  }

  // Correction de masse pour tous les utilisateurs connectés
  async fixAllMissingUsers() {
    console.log('🔧 Début de la correction des documents utilisateurs manquants...');
    
    // Cette fonction pourrait être appelée par un admin
    // pour corriger tous les problèmes d'un coup
    
    return { success: true, message: 'Correction disponible via ensureUserDocument()' };
  }
}

export default new UserService();
