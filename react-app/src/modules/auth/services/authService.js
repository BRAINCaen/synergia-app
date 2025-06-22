// src/modules/auth/services/authService.js - AVEC AUTO-CRÉATION
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
  
  /**
   * 🔐 CONNEXION EMAIL + AUTO-CRÉATION
   */
  async signInWithEmail(email, password) {
    try {
      console.log('🔑 Tentative connexion email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 🤖 AUTO-CRÉATION : Vérifier et créer le profil si nécessaire
      const { profile, wasCreated } = await userService.ensureUserExists(user);
      
      if (wasCreated) {
        console.log('✨ Nouveau profil créé automatiquement !');
      } else {
        console.log('👤 Profil existant mis à jour');
      }
      
      return { 
        user: { ...user, profile }, 
        error: null,
        isNewUser: wasCreated
      };
      
    } catch (error) {
      console.error('❌ Erreur connexion email:', error);
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  /**
   * 📝 INSCRIPTION EMAIL + PROFIL AUTOMATIQUE
   */
  async signUpWithEmail(email, password, additionalData = {}) {
    try {
      console.log('📝 Création compte:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 🤖 CRÉATION AUTOMATIQUE : Profil complet dès l'inscription
      const { profile } = await userService.ensureUserExists(user, additionalData);
      
      console.log('🎉 Compte créé avec profil complet !');
      
      return { 
        user: { ...user, profile }, 
        error: null,
        isNewUser: true
      };
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  /**
   * 🔗 CONNEXION GOOGLE + AUTO-CRÉATION
   */
  async signInWithGoogle() {
    try {
      console.log('🔗 Tentative connexion Google...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 🤖 AUTO-CRÉATION : Profil automatique pour Google aussi
      const { profile, wasCreated } = await userService.ensureUserExists(user);
      
      console.log(wasCreated ? '✨ Nouveau profil Google créé !' : '👤 Profil Google existant');
      
      return { 
        user: { ...user, profile }, 
        error: null,
        isNewUser: wasCreated
      };
      
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  /**
   * 🚪 DÉCONNEXION
   */
  async signOut() {
    try {
      await signOut(auth);
      console.log('👋 Déconnexion réussie');
      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  /**
   * 🔄 RÉINITIALISATION MOT DE PASSE
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  /**
   * 👂 ÉCOUTE CHANGEMENTS D'ÉTAT + AUTO-CORRECTION
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('👤 Utilisateur détecté:', user.email);
          
          // 🤖 AUTO-VÉRIFICATION : S'assurer que le profil existe
          const { profile, wasCreated } = await userService.ensureUserExists(user);
          
          if (wasCreated) {
            console.log('🔧 Auto-correction : profil manquant créé !');
          }
          
          // Retourner l'utilisateur avec son profil complet
          callback({ ...user, profile });
          
        } catch (error) {
          console.error('❌ Erreur auto-vérification:', error);
          // En cas d'erreur, retourner l'utilisateur sans profil
          callback(user);
        }
      } else {
        callback(null);
      }
    });
  }

  /**
   * 🛠️ CORRECTION MANUELLE (pour debug)
   */
  async fixCurrentUser() {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    try {
      const { wasCreated } = await userService.ensureUserExists(user);
      return {
        success: true,
        message: wasCreated 
          ? '✨ Profil créé avec succès' 
          : '✅ Profil déjà existant'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 OBTENIR UTILISATEUR ACTUEL AVEC PROFIL
   */
  async getCurrentUserWithProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const { profile } = await userService.ensureUserExists(user);
      return { ...user, profile };
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return user; // Fallback sans profil
    }
  }

  /**
   * ⚠️ GESTION D'ERREURS
   */
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

  /**
   * 👤 UTILISATEUR ACTUEL
   */
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();
