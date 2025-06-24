// src/core/firebase.js
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Vérifier si la configuration est présente
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'undefined')

console.log('🔧 Configuration Firebase:', {
  configured: isFirebaseConfigured,
  env: import.meta.env.MODE,
  apiKey: firebaseConfig.apiKey ? '✅' : '❌',
  projectId: firebaseConfig.projectId || '❌'
})

// Initialiser Firebase
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
    googleProvider = new GoogleAuthProvider()
    
    console.log('✅ Firebase initialisé avec succès')
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error)
  }
} else {
  console.warn('⚠️ Firebase non configuré - Variables d\'environnement manquantes')
}

// Service d'authentification
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
        emailVerified: user.emailVerified,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      }
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error)
      throw error
    }
  },

  // Connexion avec email/mot de passe
  async signInWithEmail(email, password) {
    if (!auth) {
      throw new Error('Firebase non configuré')
    }
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      console.log('✅ Connexion email réussie:', user.email)
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      }
    } catch (error) {
      console.error('❌ Erreur connexion email:', error)
      throw error
    }
  },

  // Inscription avec email/mot de passe
  async createUserWithEmail(email, password) {
    if (!auth) {
      throw new Error('Firebase non configuré')
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      console.log('✅ Inscription réussie:', user.email)
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      }
    } catch (error) {
      console.error('❌ Erreur inscription:', error)
      throw error
    }
  },

  // Déconnexion
  async signOut() {
    if (!auth) {
      throw new Error('Firebase non configuré')
    }
    
    try {
      await firebaseSignOut(auth)
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
    
    return onAuthStateChanged(auth, callback)
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
