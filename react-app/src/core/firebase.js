// ==========================================
// 📁 react-app/src/core/firebase.js
// Configuration Firebase SIMPLIFIÉE - Sans persistence IndexedDB
// ==========================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence  // ⭐ UTILISER MÉMOIRE AU LIEU D'INDEXEDDB
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
  projectId: firebaseConfig.projectId || 'non défini'
});

// Initialisation Firebase
let app, auth, db, storage;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // ⭐ FORCER LA PERSISTENCE EN MÉMOIRE POUR ÉVITER INDEXEDDB
    console.log('🔧 Configuration persistence Firebase en mémoire...');
    setPersistence(auth, inMemoryPersistence)
      .then(() => {
        console.log('✅ Persistence Firebase configurée en mémoire');
      })
      .catch((error) => {
        console.warn('⚠️ Impossible de configurer persistence:', error);
        // Continuer même si la persistence échoue
      });
    
    console.log('✅ Firebase initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase non configuré - variables d\'environnement manquantes');
}

// ⭐ SERVICE D'AUTHENTIFICATION SIMPLIFIÉ
export const authService = {
  // Authentification avec Google
  signInWithGoogle: async () => {
    if (!auth) throw new Error('Firebase Auth non initialisé');
    
    try {
      console.log('🔐 Tentative de connexion Google...');
      const provider = new GoogleAuthProvider();
      
      // ⭐ OPTIONS SIMPLIFIÉES POUR ÉVITER LES ERREURS
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Connexion Google réussie:', result.user.email);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      throw error;
    }
  },

  // Déconnexion
  signOut: async () => {
    if (!auth) throw new Error('Firebase Auth non initialisé');
    
    try {
      console.log('🚪 Déconnexion...');
      await signOut(auth);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  },

  // Observer les changements d'état d'authentification
  onAuthStateChanged: (callback) => {
    if (!auth) {
      console.warn('⚠️ Firebase Auth non initialisé');
      return () => {}; // Retourner une fonction vide
    }
    
    console.log('👀 Écoute des changements d\'authentification...');
    return onAuthStateChanged(auth, (user) => {
      console.log('🔄 État auth changé:', user ? `Connecté: ${user.email}` : 'Déconnecté');
      callback(user);
    });
  },

  // Utilisateur actuel
  get currentUser() {
    return auth?.currentUser || null;
  }
};

// ⭐ EXPORTS SÉCURISÉS - Compatibilité avec les anciens noms
export { auth, db, storage };
export { db as firebaseDb }; // ⭐ ALIAS pour compatibilité
export { auth as firebaseAuth }; // ⭐ ALIAS pour compatibilité  
export default app;

// ⭐ NETTOYAGE GLOBAL D'URGENCE
window.emergencyFirebaseClean = async () => {
  console.log('🚨 NETTOYAGE D\'URGENCE FIREBASE...');
  
  try {
    // Vider IndexedDB Firebase
    if ('indexedDB' in window) {
      const databases = ['firebaseLocalStorageDb'];
      for (const dbName of databases) {
        try {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => console.log(`✅ DB ${dbName} supprimée`);
          deleteReq.onerror = () => console.log(`❌ Erreur suppression ${dbName}`);
        } catch (error) {
          console.warn('⚠️ Erreur suppression DB:', error);
        }
      }
    }
    
    // Vider localStorage Firebase
    const firebaseKeys = Object.keys(localStorage).filter(key => 
      key.includes('firebase') || key.includes('firebaseui')
    );
    firebaseKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Clé localStorage supprimée: ${key}`);
    });
    
    console.log('✅ Nettoyage Firebase terminé');
    
    // Recharger la page après nettoyage
    setTimeout(() => {
      console.log('🔄 Rechargement de la page...');
      window.location.reload(true);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur nettoyage Firebase:', error);
  }
};

console.log('🔧 Firebase configuré - emergencyFirebaseClean() disponible en console');
