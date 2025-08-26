// ==========================================
// 📁 react-app/src/core/firebase.js
// Configuration Firebase COMPLÈTE avec PERSISTENCE D'AUTH
// ==========================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  GoogleAuthProvider 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Re-export des fonctions Firestore pour compatibilité
export {
  // Fonctions de base
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  
  // Requêtes
  query,
  where,
  orderBy,
  limit,
  
  // Temps réel
  onSnapshot,
  
  // Utilitaires
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  
  // Transactions et batch
  writeBatch,
  runTransaction
} from 'firebase/firestore';

// Configuration Firebase (utilisez vos vraies clés)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "synergia-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "synergia-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "synergia-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🔐 CONFIGURATION DE LA PERSISTENCE AUTH
// Cette fonction configure Firebase pour garder l'utilisateur connecté
const setupAuthPersistence = async () => {
  try {
    // Configurer la persistence pour garder l'utilisateur connecté
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ [FIREBASE] Persistence d\'auth configurée - l\'utilisateur restera connecté');
  } catch (error) {
    console.error('❌ [FIREBASE] Erreur configuration persistence:', error);
  }
};

// Configurer la persistence immédiatement
setupAuthPersistence();

// Provider Google pour l'authentification
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 🔧 Service d'authentification amélioré
export const authService = {
  // Observer les changements d'état auth
  onAuthStateChanged: (callback) => {
    return auth.onAuthStateChanged ? auth.onAuthStateChanged(callback) : () => {};
  },
  
  // Déconnexion
  signOut: () => {
    return auth.signOut ? auth.signOut() : Promise.resolve();
  },
  
  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!auth.currentUser;
  }
};

// 📊 Configuration d'emulation pour développement
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  console.log('🔧 Mode développement - Émulateurs Firebase activés');
  // Configurer les émulateurs si nécessaire
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

// Export par défaut
export default app;

// 📋 Logs de confirmation
console.log('✅ [FIREBASE] Initialisé avec succès');
console.log('🔧 [FIREBASE] Auth Domain:', firebaseConfig.authDomain);
console.log('🔧 [FIREBASE] Project ID:', firebaseConfig.projectId);
console.log('🔐 [FIREBASE] Persistence: browserLocalPersistence (utilisateur reste connecté)');

// 🛡️ Vérification de la configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0 && import.meta.env.PROD) {
  console.warn('⚠️ [FIREBASE] Variables d\'environnement manquantes:', missingVars);
}
