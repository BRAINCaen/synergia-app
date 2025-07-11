// ==========================================
// 📁 react-app/src/core/firebase.js
// Configuration Firebase SIMPLIFIÉE
// ==========================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Service d'authentification simple
export const authService = {
  onAuthStateChanged: (callback) => {
    return auth.onAuthStateChanged ? auth.onAuthStateChanged(callback) : () => {};
  },
  
  signOut: () => {
    return auth.signOut ? auth.signOut() : Promise.resolve();
  }
};

// Export par défaut
export default app;

console.log('✅ Firebase initialisé avec succès');
console.log('🔧 Auth Domain:', firebaseConfig.authDomain);
console.log('🔧 Project ID:', firebaseConfig.projectId);
