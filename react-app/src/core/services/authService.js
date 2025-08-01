// ==========================================
// 📁 react-app/src/core/services/authService.js
// Service d'authentification PROPRE - Extension .js corrigée
// ==========================================

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
      
      // Créer le profil utilisateur basique
      await this.createBasicProfile(result.user.uid, {
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
      
      // Créer le profil utilisateur basique s'il n'existe pas
      await this.createBasicProfile(result.user.uid, {
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
   * 👤 Créer un profil utilisateur basique
   */
  static async createBasicProfile(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid);
      const defaultProfile = {
        uid,
        email: userData.email,
        displayName: userData.displayName || userData.email,
        photoURL: userData.photoURL || null,
        profile: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          department: userData.department || ''
        },
        gamification: {
          xp: 0,
          totalXp: 0,
          level: 1,
          badges: [],
          tasksCompleted: 0,
          loginStreak: 0
        },
        stats: {
          tasksCompleted: 0,
          loginCount: 0,
          lastActionAt: new Date()
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userRef, defaultProfile, { merge: true });
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur création profil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ⚠️ Formater les erreurs d'authentification
   */
  static formatAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Aucun utilisateur trouvé avec cette adresse email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
      'auth/invalid-email': 'Adresse email invalide.',
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

console.log('✅ AuthService chargé - Extension .js corrigée');
