// ==========================================
// 📁 react-app/src/core/firebase.js
// CONFIGURATION FIREBASE COMPLÈTE AVEC GOOGLEPROVIDER
// ==========================================

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🔑 GOOGLE AUTH PROVIDER CENTRALISÉ
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configuration de la persistance
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('❌ [FIREBASE] Erreur persistance auth:', error);
});

console.log('✅ [FIREBASE] Firebase initialisé avec Storage et GoogleProvider');

export default app;
