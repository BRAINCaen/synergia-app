// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTH STORE AVEC PERSISTENCE LOCALE UNIQUEMENT (NO SESSIONSTORAGE)
// ==========================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../../core/firebase.js';

// Provider Google avec configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Variable pour éviter les initialisations multiples
let authStateInitialized = false;
let unsubscribeAuth = null;

// 🔐 CONFIGURATION PERSISTENCE FIREBASE (LOCAL STORAGE UNIQUEMENT)
const setupFirebaseAuth = async () => {
  try {
    console.log('🔐 Configuration persistence Firebase (localStorage)...');
    
    // ⚠️ IMPORTANT: Utiliser UNIQUEMENT browserLocalPersistence
    // JAMAIS browserSessionPersistence pour éviter l'erreur sessionStorage
    await setPersistence(auth, browserLocalPersistence);
    
    console.log('✅ Firebase Auth persistence configurée (localStorage)');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration Firebase persistence:', error);
    return false;
  }
};

// Store avec persistence Zustand (localStorage uniquement)
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // États de base
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      lastLoginTime: null,
      sessionExpiry: null,
      
      // 🔐 CONNEXION GOOGLE
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          console.log('🔍 Tentative connexion Google...');
          
          // Assurer la persistence locale avant connexion
          await setupFirebaseAuth();
          
          // ✅ Utiliser signInWithPopup (PAS signInWithRedirect)
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          
          console.log('✅ Connexion Google réussie:', user.email);
          
          // Calculer expiration de session (24h)
          const now = Date.now();
          const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures
          
          set({ 
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified
            }, 
            loading: false, 
            error: null,
            isAuthenticated: true,
            lastLoginTime: now,
            sessionExpiry: sessionExpiry
          });
          
          return user;
          
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // 📧 CONNEXION EMAIL/PASSWORD
      signInWithEmail: async (email, password) => {
        try {
          set({ loading: true, error: null });
          console.log('📧 Tentative connexion email...');
          
          // Assurer la persistence locale avant connexion
          await setupFirebaseAuth();
          
          const result = await signInWithEmailAndPassword(auth, email, password);
          const user = result.user;
          
          console.log('✅ Connexion email réussie:', user.email);
          
          // Calculer expiration de session (24h)
          const now = Date.now();
          const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures
          
          set({ 
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified
            }, 
            loading: false, 
            error: null,
            isAuthenticated: true,
            lastLoginTime: now,
            sessionExpiry: sessionExpiry
          });
          
          return user;
          
        } catch (error) {
          console.error('❌ Erreur connexion email:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // 📝 INSCRIPTION
      signUpWithEmail: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null });
          console.log('📝 Tentative inscription...');
          
          // Assurer la persistence locale
          await setupFirebaseAuth();
          
          const result = await createUserWithEmailAndPassword(auth, email, password);
          const user = result.user;
          
          console.log('✅ Inscription réussie:', user.email);
          
          // Calculer expiration de session (24h)
          const now = Date.now();
          const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures
          
          set({ 
            user: {
              uid: user.uid,
              email: user.email,
              displayName: displayName || user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified
            }, 
            loading: false, 
            error: null,
            isAuthenticated: true,
            lastLoginTime: now,
            sessionExpiry: sessionExpiry
          });
          
          return user;
          
        } catch (error) {
          console.error('❌ Erreur inscription:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // 🚪 DÉCONNEXION
      signOut: async () => {
        try {
          console.log('🔄 Déconnexion...');
          
          await firebaseSignOut(auth);
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null, 
            loading: false,
            lastLoginTime: null,
            sessionExpiry: null
          });
          
          // Nettoyer localStorage
          localStorage.removeItem('auth-storage');
          
          console.log('✅ Déconnexion réussie');
          
        } catch (error) {
          console.error('❌ Erreur déconnexion:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      // 🔄 ACTUALISER TOKEN
      refreshAuthToken: async () => {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const token = await currentUser.getIdToken(true); // Force refresh
            console.log('🔄 Token actualisé');
            return token;
          }
          throw new Error('Aucun utilisateur connecté');
        } catch (error) {
          console.error('❌ Erreur actualisation token:', error);
          throw error;
        }
      },

      // 🕐 VÉRIFIER EXPIRATION SESSION
      checkSessionExpiry: () => {
        const { sessionExpiry, signOut } = get();
        
        if (sessionExpiry && Date.now() > sessionExpiry) {
          console.log('⏰ Session expirée, déconnexion automatique');
          signOut();
          return false;
        }
        
        return true;
      },

      // ✅ INITIALISATION AUTH STATE (UNE SEULE FOIS)
      initializeAuth: () => {
        // Éviter les initialisations multiples
        if (authStateInitialized) {
          console.log('🔒 Auth déjà initialisé, ignorer');
          return;
        }

        console.log('🔍 Initialisation auth state...');
        authStateInitialized = true;
        
        // Configurer Firebase Auth (localStorage uniquement)
        setupFirebaseAuth();
        
        // Observer les changements d'état UNE SEULE FOIS
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          console.log('🔔 Auth state changed:', user ? user.email : 'déconnecté');
          
          if (user) {
            const now = Date.now();
            const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures
            
            set({
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified
              },
              isAuthenticated: true,
              loading: false,
              error: null,
              lastLoginTime: now,
              sessionExpiry: sessionExpiry
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: null,
              lastLoginTime: null,
              sessionExpiry: null
            });
          }
        });
      },

      // 🧹 NETTOYER L'OBSERVER
      cleanup: () => {
        if (unsubscribeAuth) {
          console.log('🧹 Nettoyage observer auth');
          unsubscribeAuth();
          unsubscribeAuth = null;
          authStateInitialized = false;
        }
      }
    }),
    {
      name: 'auth-storage', // Clé localStorage
      storage: createJSONStorage(() => localStorage), // ⚠️ UNIQUEMENT localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
        sessionExpiry: state.sessionExpiry
      }),
    }
  )
);

// ✅ FONCTION D'INITIALISATION EXPORTÉE (pour App.jsx)
export const initializeAuthStore = () => {
  console.log('🚀 initializeAuthStore appelé');
  useAuthStore.getState().initializeAuth();
};

// ✅ INITIALISATION AUTOMATIQUE AU CHARGEMENT
if (typeof window !== 'undefined') {
  console.log('🚀 Initialisation automatique auth store...');
  initializeAuthStore();
}

// ✅ EXPORTS
export default useAuthStore;

console.log('✅ Auth Store chargé avec persistence localStorage uniquement');
