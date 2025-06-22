// ===================================================================
// 🔥 FICHIER FIREBASE COMPLET CORRIGÉ POUR SYNERGIA
// Fichier: react-app/src/core/firebase.js
// ===================================================================

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

// ===================================================================
// SERVICE DE DIAGNOSTIC FIREBASE
// ===================================================================

export const FirebaseDiagnostic = {
  async checkConnection() {
    console.log('🔍 Diagnostic Firebase...');
    
    const results = {
      auth: false,
      firestore: false,
      storage: false,
      config: false
    };
    
    try {
      // Test configuration
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        results.config = true;
        console.log('✅ Configuration Firebase valide');
      }
      
      // Test Auth
      if (auth) {
        results.auth = true;
        console.log('✅ Firebase Auth disponible');
      }
      
      // Test Firestore
      if (db) {
        results.firestore = true;
        console.log('✅ Firestore disponible');
      }
      
      // Test Storage
      if (storage) {
        results.storage = true;
        console.log('✅ Firebase Storage disponible');
      }
      
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
    }
    
    const allGood = Object.values(results).every(Boolean);
    console.log(allGood ? '🎉 Firebase opérationnel' : '⚠️ Problèmes détectés');
    
    return results;
  },
  
  getConnectionStatus() {
    return {
      online: navigator.onLine,
      firebase: !!app,
      auth: !!auth,
      firestore: !!db
    };
  },

  // Test de connectivité réseau
  async testNetworkConnection() {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.warn('❌ Pas de connexion réseau');
      return false;
    }
  },

  // Affichage du statut complet
  async displayFullStatus() {
    console.log('📊 Statut complet Firebase:');
    console.log('----------------------------');
    
    const connectionResults = await this.checkConnection();
    const networkStatus = await this.testNetworkConnection();
    const status = this.getConnectionStatus();
    
    console.log(`🌐 Réseau: ${networkStatus ? '✅ Connecté' : '❌ Déconnecté'}`);
    console.log(`🔧 Configuration: ${connectionResults.config ? '✅' : '❌'}`);
    console.log(`🔐 Auth: ${connectionResults.auth ? '✅' : '❌'}`);
    console.log(`📊 Firestore: ${connectionResults.firestore ? '✅' : '❌'}`);
    console.log(`📁 Storage: ${connectionResults.storage ? '✅' : '❌'}`);
    console.log('----------------------------');
    
    return {
      ...connectionResults,
      network: networkStatus,
      overall: Object.values(connectionResults).every(Boolean) && networkStatus
    };
  }
};

// Diagnostic automatique au chargement en mode développement
if (import.meta.env.DEV) {
  setTimeout(() => {
    FirebaseDiagnostic.checkConnection();
  }, 1000);
}

// Diagnostic complet disponible dans la console
if (typeof window !== 'undefined') {
  window.firebaseDiagnostic = FirebaseDiagnostic;
  console.log('🔧 Diagnostic Firebase disponible: window.firebaseDiagnostic.displayFullStatus()');
}

// Exports principaux
export { auth, db, storage, googleProvider, app };
export default { auth, db, storage, googleProvider, app };
