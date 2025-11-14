// ==========================================
// 📁 react-app/src/core/services/authService.js
// Service d'authentification PROPRE - IMPORT CENTRALISÉ
// ==========================================

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase.js';

/**
 * 🔐 SERVICE D'AUTHENTIFICATION
 * Classe avec méthodes statiques pour l'authentification Firebase
 */
class AuthService {
  
  /**
   * 📧 Connexion avec email/password
   */
  static async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Vérifier et corriger la structure utilisateur si nécessaire
      await this.ensureCompleteUserStructure(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });
      
      return { success: true, user: result.user, error: null };
    } catch (error) {
      console.error('Erreur connexion email:', error);
      return { success: false, user: null, error: this.formatAuthError(error) };
    }
  }

  /**
   * 📝 Inscription avec email/password
   */
  static async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur COMPLET
      await this.createCompleteProfile(result.user.uid, {
        email,
        displayName,
        photoURL: null
      });
      
      return { success: true, user: result.user, error: null };
    } catch (error) {
      console.error('Erreur inscription email:', error);
      return { success: false, user: null, error: this.formatAuthError(error) };
    }
  }

  /**
   * 🔗 Connexion avec Google
   */
  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log('🔗 Connexion Google réussie:', result.user.email);
      
      // Créer le profil utilisateur COMPLET s'il n'existe pas
      await this.ensureCompleteUserStructure(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });
      
      return { success: true, user: result.user, error: null };
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      return { success: false, user: null, error: this.formatAuthError(error) };
    }
  }

  /**
   * 🚪 Déconnexion
   */
  static async signOut() {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔐 Réinitialisation mot de passe
   */
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur envoi email reset:', error);
      return { success: false, error: this.formatAuthError(error) };
    }
  }

  /**
   * 🔧 VÉRIFIER ET ASSURER LA STRUCTURE COMPLÈTE
   * Vérifie si l'utilisateur existe et a la structure complète
   */
  static async ensureCompleteUserStructure(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data();
        
        // Vérifier si la structure gamification est complète
        const hasCompleteGamification = 
          existingData.gamification && 
          typeof existingData.gamification.totalXp === 'number' &&
          typeof existingData.gamification.level === 'number' &&
          Array.isArray(existingData.gamification.badges);

        if (!hasCompleteGamification) {
          console.log('🔧 Correction structure utilisateur existant:', uid);
          await this.createCompleteProfile(uid, userData, true);
        } else {
          console.log('✅ Structure utilisateur déjà complète:', uid);
        }
      } else {
        console.log('🆕 Création nouvel utilisateur:', uid);
        await this.createCompleteProfile(uid, userData);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur vérification structure:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👤 CRÉER UN PROFIL UTILISATEUR COMPLET
   * Structure conforme à firebaseDataSyncService.js
   */
  static async createCompleteProfile(uid, userData, merge = false) {
    try {
      const userRef = doc(db, 'users', uid);
      const now = new Date().toISOString();
      
      const completeProfile = {
        // Métadonnées
        uid,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
        photoURL: userData.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        
        // Profil
        profile: {
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          bio: userData.bio || 'Membre de l\'équipe Synergia',
          department: userData.department || 'general',
          role: userData.role || 'member',
          timezone: 'Europe/Paris',
          language: 'fr',
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              push: true,
              inApp: true
            },
            privacy: {
              profileVisible: true,
              activityVisible: true
            }
          }
        },
        
        // Gamification COMPLÈTE
        gamification: {
          // XP et niveaux
          totalXp: 0,
          weeklyXp: 0,
          monthlyXp: 0,
          level: 1,
          currentLevelXp: 0,
          nextLevelXpRequired: 100,
          
          // Statistiques d'activité
          tasksCompleted: 0,
          tasksCreated: 0,
          projectsCreated: 0,
          projectsCompleted: 0,
          commentsPosted: 0,
          collaborations: 0,
          
          // Badges et achievements
          badges: [],
          achievements: [],
          badgesUnlocked: 0,
          totalBadgeXp: 0,
          
          // Streaks et engagement
          loginStreak: 1,
          currentStreak: 1,
          maxStreak: 1,
          lastLoginDate: now.split('T')[0],
          lastActivityDate: now,
          
          // Historique
          xpHistory: []
        }
      };

      await setDoc(userRef, completeProfile, { merge });
      console.log('✅ Profil utilisateur complet créé/mis à jour:', uid);
      
      return completeProfile;
    } catch (error) {
      console.error('❌ Erreur création profil:', error);
      throw error;
    }
  }

  /**
   * 🔤 FORMATER LES ERREURS D'AUTHENTIFICATION
   */
  static formatAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Aucun utilisateur trouvé avec cet email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/email-already-in-use': 'Cet email est déjà utilisé.',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
      'auth/invalid-email': 'Email invalide.',
      'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
      'auth/popup-closed-by-user': 'Connexion annulée par l\'utilisateur.',
      'auth/cancelled-popup-request': 'Connexion annulée.',
      'auth/invalid-credential': 'Identifiants invalides.',
      'auth/user-disabled': 'Ce compte utilisateur a été désactivé.',
      'auth/operation-not-allowed': 'Cette méthode de connexion n\'est pas autorisée.'
    };
    
    return errorMessages[error.code] || error.message || 'Une erreur est survenue lors de l\'authentification.';
  }

  /**
   * 👤 Obtenir l'utilisateur actuel
   */
  static getCurrentUser() {
    return auth?.currentUser || null;
  }

  /**
   * 👂 Écouter les changements d'authentification
   */
  static onAuthStateChanged(callback) {
    if (!auth) {
      console.warn('⚠️ Firebase non configuré');
      callback(null);
      return () => {};
    }
    
    return auth.onAuthStateChanged(callback);
  }
}

// ✅ EXPORTS STANDARDS
export default AuthService;
export { AuthService };

console.log('✅ AuthService chargé - Structure COMPLÈTE gamification activée');
