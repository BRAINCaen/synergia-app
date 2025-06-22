// src/modules/auth/services/authService.js - VERSION CORRIGÉE
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "../../../core/firebase.js";
import userService from "../../../services/userService.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../core/constants.js";

class AuthService {
  // Connexion par email/mot de passe avec vérification du document
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // ✅ CORRECTION : Vérifier et créer le document utilisateur si nécessaire
      await userService.ensureUserDocument(user);
      
      // Mettre à jour la dernière connexion
      await userService.safeUpdateUser(user.uid, {
        lastLoginAt: new Date(),
        'stats.loginCount': { increment: 1 } // Utilise increment pour éviter les race conditions
      });
      
      return { user, error: null };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  // Inscription par email/mot de passe
  async signUpWithEmail(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Créer le profil utilisateur complet
      await userService.createUserDocument({
        ...user,
        ...userData
      });
      
      return { user, error: null };
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  // Connexion avec Google avec vérification
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // ✅ CORRECTION : Toujours vérifier et créer si nécessaire
      const wasCreated = await userService.ensureUserDocument(user);
      
      if (!wasCreated) {
        // Document existait, mettre à jour la dernière connexion
        await userService.safeUpdateUser(user.uid, {
          lastLoginAt: new Date(),
          'stats.loginCount': { increment: 1 }
        });
      }
      
      return { user, error: null };
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  // Déconnexion
  async signOut() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  // Observer les changements d'état avec auto-correction
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ CORRECTION : Auto-fix à chaque changement d'état
        try {
          await userService.ensureUserDocument(user);
          
          // Récupérer le profil complet
          const { profile } = await userService.getUserProfile(user.uid, user);
          callback({ ...user, profile });
        } catch (error) {
          console.error('❌ Erreur auto-correction:', error);
          callback(user); // Fallback : retourner l'utilisateur sans profil
        }
      } else {
        callback(null);
      }
    });
  }

  // Récupérer l'utilisateur actuel avec son profil
  async getCurrentUserWithProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      await userService.ensureUserDocument(user);
      const { profile } = await userService.getUserProfile(user.uid, user);
      return { ...user, profile };
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return user; // Fallback
    }
  }

  // Gestion des erreurs d'authentification
  handleAuthError(error) {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      case 'auth/email-already-in-use':
        return ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS;
      case 'auth/weak-password':
        return ERROR_MESSAGES.AUTH.WEAK_PASSWORD;
      case 'auth/network-request-failed':
        return ERROR_MESSAGES.AUTH.NETWORK_ERROR;
      case 'auth/popup-closed-by-user':
        return 'Connexion annulée par l\'utilisateur';
      default:
        console.error('Erreur d\'authentification:', error);
        return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return auth.currentUser;
  }

  // ✅ NOUVELLE MÉTHODE : Correction manuelle pour utilisateurs existants
  async fixCurrentUser() {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    try {
      const wasCreated = await userService.ensureUserDocument(user);
      return {
        success: true,
        message: wasCreated 
          ? 'Document utilisateur créé avec succès' 
          : 'Document utilisateur déjà existant'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();
