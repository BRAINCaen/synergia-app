import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, googleProvider } from '../../../core/firebase.js'
import { UserService } from '../../../core/services/userService.js'

export class AuthService {
  static async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await UserService.updateLastLogin(result.user.uid)
      return result
    } catch (error) {
      console.error('Error signing in:', error)
      throw this.formatAuthError(error)
    }
  }

  static async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      await UserService.createUserProfile(result.user.uid, {
        email,
        displayName,
        photoURL: null
      })
      
      return result
    } catch (error) {
      console.error('Error signing up:', error)
      throw this.formatAuthError(error)
    }
  }

  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      // Check if user profile exists, create if not
      const existingProfile = await UserService.getUserProfile(result.user.uid)
      if (!existingProfile) {
        await UserService.createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        })
      } else {
        await UserService.updateLastLogin(result.user.uid)
      }
      
      return result
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw this.formatAuthError(error)
    }
  }

  static async signOut() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw this.formatAuthError(error)
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
    }
    
    return new Error(errorMessages[error.code] || error.message)
  }
}
