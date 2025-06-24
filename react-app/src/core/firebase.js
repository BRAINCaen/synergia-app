// Configuration Firebase complète pour Synergia avec Google Auth
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuration Firebase - utilise les variables d'environnement Netlify
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Vérification de la configuration
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'undefined')

// Initialisation Firebase
let app = null
let auth = null
let db = null
let storage = null
let googleProvider = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    // Configuration Google Auth Provider
    googleProvider = new GoogleAuthProvider()
    googleProvider.addScope('email')
    googleProvider.addScope('profile')
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    })
    
    console.log('🔥 Firebase et Google Auth initialisés avec succès')
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error)
  }
} else {
  console.warn('⚠️ Firebase non configuré - Variables d\'environnement manquantes')
}

// Services d'authentification
export const authService = {
  // Connexion avec Google
  async signInWithGoogle() {
    if (!auth || !googleProvider) {
      throw new Error('Firebase non configuré')
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      console.log('✅ Connexion Google réussie:', user.email)
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      }
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error)
      throw error
    }
  },

  // Déconnexion
  async signOut() {
    if (!auth) {
      throw new Error('Firebase non configuré')
    }
    
    try {
      await signOut(auth)
      console.log('✅ Déconnexion réussie')
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error)
      throw error
    }
  },

  // Écouter les changements d'état auth
  onAuthStateChanged(callback) {
    if (!auth) {
      console.warn('⚠️ Firebase non configuré - Mode mock')
      callback(null)
      return () => {}
    }
    
    return auth.onAuthStateChanged(callback)
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return auth?.currentUser || null
  }
}

// Exports séparés pour éviter les conflits de syntaxe
export const firebaseAuth = auth
export const firebaseDb = db
export const firebaseStorage = storage
export const firebaseGoogleProvider = googleProvider
export { isFirebaseConfigured }

// Export par défaut
export default app
