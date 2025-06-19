// src/modules/auth/services/authService.js
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../../../core/firebase.js";
import { COLLECTIONS, USER_ROLES, USER_STATUS, ERROR_MESSAGES } from "../../../core/constants.js";

class AuthService {
  // Connexion par email/mot de passe
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.updateLastLogin(userCredential.user.uid);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  // Inscription par email/mot de passe
  async signUpWithEmail(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur
      await this.createUserProfile(userCredential.user, userData);
      
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: this.handleAuthError(error) };
    }
  }

  // Connexion avec Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Vérifier si le profil existe, sinon le créer
      const profileExists = await this.checkUserProfileExists(result.user.uid);
      if (!profileExists) {
        await this.createUserProfile(result.user);
      } else {
        await this.updateLastLogin(result.user.uid);
      }
      
      return { user: result.user, error: null };
    } catch (error) {
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

  // Créer le profil utilisateur dans Firestore
  async createUserProfile(user, additionalData = {}) {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || '',
      role: USER_ROLES.EMPLOYEE,
      status: USER_STATUS.ACTIVE,
      createdAt: new Date(),
      lastLoginAt: new Date(),
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
        department: additionalData.department || '',
        position: additionalData.position || '',
        skills: [],
        phone: additionalData.phone || '',
        location: additionalData.location || ''
      },
      gamification: {
        xp: 0,
        level: 1,
        totalXp: 0,
        badges: [],
        achievements: [],
        joinedAt: new Date()
      },
      ...additionalData
    };

    await setDoc(userRef, userData);
    return userData;
  }

  // Vérifier si le profil utilisateur existe
  async checkUserProfileExists(uid) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  }

  // Mettre à jour la dernière connexion
  async updateLastLogin(uid) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      lastLoginAt: new Date()
    });
  }

  // Mettre à jour le profil utilisateur
  async updateUserProfile(uid, updates) {
    try {
      // Mise à jour dans Firebase Auth si nécessaire
      if (updates.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }

      // Mise à jour dans Firestore
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });

      return { error: null };
    } catch (error) {
      return { error: this.handleAuthError(error) };
    }
  }

  // Récupérer le profil utilisateur complet
  async getUserProfile(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { profile: userSnap.data(), error: null };
      } else {
        return { profile: null, error: 'Profil utilisateur introuvable' };
      }
    } catch (error) {
      return { profile: null, error: this.handleAuthError(error) };
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

  // Observer les changements d'état d'authentification
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();
