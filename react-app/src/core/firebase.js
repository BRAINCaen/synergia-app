// src/core/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { APP_CONFIG } from './config.js';

// Configuration Firebase
const firebaseConfig = APP_CONFIG.firebase;

// Validation de la configuration
if (!firebaseConfig.apiKey) {
  throw new Error('Configuration Firebase manquante. Vérifiez vos variables d\'environnement.');
}

// Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Providers d'authentification
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics (conditionnel)
let analytics = null;
if (APP_CONFIG.isProduction) {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Émulateurs pour le développement
if (APP_CONFIG.isDevelopment) {
  try {
    // Firestore emulator
    if (!db._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('🔧 Émulateurs Firebase connectés');
  } catch (error) {
    console.log('ℹ️ Émulateurs non disponibles, utilisation de Firebase production');
  }
}

export { analytics };
export default app;
