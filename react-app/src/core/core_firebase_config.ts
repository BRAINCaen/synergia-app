// src/core/firebase/config.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Validation de la configuration
const validateConfig = (config: FirebaseConfig): void => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !config[key as keyof FirebaseConfig]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
  }
};

// Initialisation Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

const initializeFirebase = async (): Promise<void> => {
  try {
    validateConfig(firebaseConfig);
    
    // Initialisation de l'app Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialisation des services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Analytics (optionnel)
    if (await isAnalyticsSupported()) {
      analytics = getAnalytics(app);
    }
    
    console.log('✅ Firebase initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur d\'initialisation Firebase:', error);
    throw error;
  }
};

// Export des instances
export { 
  app, 
  auth, 
  db, 
  storage, 
  analytics, 
  initializeFirebase 
};

export type { FirebaseConfig };