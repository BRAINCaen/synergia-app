// ==========================================
// 📁 react-app/src/core/firebase.js
// Configuration Firebase CORRIGÉE - Export authService ajouté
// ==========================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, // ✅ Alias pour éviter collision
  onAuthStateChanged // ✅ AJOUT CRITIQUE pour authStore
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - utilise les variables d'environnement Netlify
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Vérification de la configuration
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'undefined');

console.log('🔧 Configuration Firebase:', {
  configured: isFirebaseConfigured,
  env: import.meta.env.MODE,
  apiKey: firebaseConfig.apiKey ? '✅' : '❌',
  projectId: firebaseConfig.projectId || '❌'
});

// Initialisation Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Configuration Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log('✅ Firebase initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase non configuré - Variables d\'environnement manquantes');
}

// ✅ CORRECTION CRITIQUE - Services d'authentification EXPORTÉS
export const authService = {
  // Connexion avec Google
  async signInWithGoogle() {
    if (!auth || !googleProvider) {
      throw new Error('Firebase non configuré');
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('✅ Connexion Google réussie:', user.email);
      
      return {
        success: true,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      return { success: false, error: error.message };
    }
  },

  // Déconnexion
  async signOut() {
    if (!auth) {
      throw new Error('Firebase non configuré');
    }
    
    try {
      await firebaseSignOut(auth); // ✅ Utilise l'alias
      console.log('✅ Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ FONCTION CRITIQUE - Écouter les changements d'état auth
  onAuthStateChanged(callback) {
    if (!auth) {
      console.warn('⚠️ Firebase non configuré - Mode mock');
      // En mode mock, simuler aucun utilisateur connecté
      setTimeout(() => callback(null), 100);
      return () => {};
    }
    
    // ✅ UTILISE onAuthStateChanged importé depuis firebase/auth
    return onAuthStateChanged(auth, callback);
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return auth?.currentUser || null;
  },

  // ✅ MÉTHODES SUPPLÉMENTAIRES pour authStore
  getAuth() {
    return auth;
  },

  isConfigured() {
    return isFirebaseConfigured;
  }
};

// ✅ EXPORTS ORIGINAUX QUI MARCHAIENT + authService
export { isFirebaseConfigured };
export { auth };
export { db };
export { storage };
export { googleProvider };
export { onAuthStateChanged }; // ✅ Export direct pour compatibilité

// ✅ Exports avec alias pour compatibilité
export const firebaseAuth = auth;
export const firebaseDb = db;
export const firebaseStorage = storage;
export const firebaseGoogleProvider = googleProvider;

// Export par défaut
export default app;

// ✅ LOG DE SUCCÈS pour authService
console.log('✅ authService exporté et disponible pour authStore');
console.log('🔧 onAuthStateChanged correctement importé et exporté');
