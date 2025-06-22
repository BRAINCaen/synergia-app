import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Configuration Firebase avec gestion des erreurs CORS
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-Key-Replace-With-Yours",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com", 
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Variables globales pour éviter les erreurs de réinitialisation
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  // Initialisation Firebase avec vérification
  console.log('🔥 Initialisation Firebase...');
  app = initializeApp(firebaseConfig);
  
  // Services Firebase
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Configuration Google Provider sécurisée
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    access_type: 'offline'
  });
  
  // Configuration des émulateurs en mode développement
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    console.log('🛠️ Mode émulateur activé');
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (emulatorError) {
      console.warn('⚠️ Émulateurs Firebase non disponibles:', emulatorError.message);
    }
  }
  
  console.log('✅ Firebase initialisé avec succès');
  
} catch (initError) {
  console.error('❌ Erreur initialisation Firebase:', initError);
  
  // Mode dégradé avec données mock
  console.warn('🔄 Activation du mode dégradé...');
  
  // Créer des objets mock pour éviter les erreurs
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => callback(null),
    signOut: () => Promise.resolve()
  };
  
  db = {
    collection: () => ({
      get: () => Promise.resolve({ docs: [] }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      })
    })
  };
}
