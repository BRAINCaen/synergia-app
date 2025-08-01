// ==========================================
// 📁 react-app/src/core/firebase.js
// CONFIGURATION FIREBASE SIMPLIFIÉE ET CORRIGÉE
// ==========================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase avec valeurs par défaut pour éviter les erreurs
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-Key-Replace-With-Your-Real-Key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "synergia-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "synergia-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "synergia-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo123456"
};

// Initialiser Firebase
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  console.log('🔥 Initialisation Firebase...');
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Provider Google
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  console.log('✅ Firebase initialisé avec succès');
  console.log('🔧 Project ID:', firebaseConfig.projectId);
  
} catch (error) {
  console.error('❌ Erreur initialisation Firebase:', error);
  
  // Fallbacks pour éviter les crashes
  auth = null;
  db = null;
  storage = null;
  googleProvider = null;
}

// Exports sécurisés
export { auth, db, storage, googleProvider };
export default app;
