import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, googleProvider } from '../../../core/firebase.js'
import { db } from '../../../core/firebase.js'

class AuthService {
  static async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user, error: null }
    } catch (error) {
      console.error('Erreur connexion email:', error)
      return { success: false, user: null, error: this.formatAuthError(error) }
    }
  }

  static async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Créer le profil utilisateur basique
      await this.createBasicProfile(result.user.uid, {
        email,
        displayName,
        photoURL: null
      })
      
      return { success: true, user: result.user, error: null }
    } catch (error) {
      console.error('Erreur inscription email:', error)
      return { success: false, user: null, error: this.formatAuthError(error) }
    }
  }

  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      // Créer le profil utilisateur basique s'il n'existe pas
      await this.createBasicProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      })
      
      return { success: true, user: result.user, error: null }
    } catch (error) {
      console.error('Erreur connexion Google:', error)
      return { success: false, user: null, error: this.formatAuthError(error) }
    }
  }

  static async signOut() {
    try {
      await signOut(auth)
      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      return { success: false, error: error.message }
    }
  }

  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur envoi email reset:', error)
      return { success: false, error: this.formatAuthError(error) }
    }
  }

  static async createBasicProfile(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid)
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
      }
      
      await setDoc(userRef, defaultProfile, { merge: true })
      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur création profil:', error)
      return { success: false, error: error.message }
    }
  }

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
    }
    
    return errorMessages[error.code] || error.message || 'Une erreur est survenue lors de l\'authentification.'
  }
}

export default AuthService
export { AuthService }
