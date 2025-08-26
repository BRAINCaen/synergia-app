// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTH STORE AVEC PERSISTENCE COMPLÈTE - SOLUTION DÉFINITIVE
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
  browserLocalPersistence,
  getAuth
} from 'firebase/auth';
import { auth } from '../../core/firebase.js';

// Provider Google avec configuration persistence
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Variable pour éviter les initialisations multiples
let authStateInitialized = false;
let unsubscribeAuth = null;

// 🔐 CONFIGURATION PERSISTENCE FIREBASE
const setupFirebaseAuth = async () => {
  try {
    console.log('🔐 Configuration persistence Firebase...');
    
    // Configurer la persistence pour garder l'utilisateur connecté
    await setPersistence(auth, browserLocalPersistence);
    
    console.log('✅ Firebase Auth persistence configurée');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration Firebase persistence:', error);
    return false;
  }
};

// 💾 FONCTIONS DE STOCKAGE LOCAL PERSONNALISÉES
const customStorage = {
  getItem: (name) => {
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Erreur lecture localStorage:', error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.warn('Erreur écriture localStorage:', error);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn('Erreur suppression localStorage:', error);
    }
  },
};

// Store avec persistence Zustand + Firebase
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
          
          // Assurer la persistence avant connexion
          await setupFirebaseAuth();
          
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
          
          // Assurer la persistence avant connexion
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
      signUpWithEmail: async (email, password) => {
        try {
          set({ loading: true, error: null });
          console.log('📝 Tentative inscription...');
          
          // Assurer la persistence avant inscription
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
          console.log('👋 Déconnexion...');
          
          await firebaseSignOut(auth);
          
          set({ 
            user: null, 
            loading: false, 
            error: null,
            isAuthenticated: false,
            lastLoginTime: null,
            sessionExpiry: null
          });
          
          // Nettoyer le localStorage
          customStorage.removeItem('auth-storage');
          
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

      // ✅ INITIALISATION UNIQUE ET STABLE
      initializeAuth: () => {
        // Éviter les initialisations multiples
        if (authStateInitialized) {
          console.log('🔒 Auth déjà initialisé, ignorer');
          return;
        }

        console.log('🔍 Initialisation unique auth state...');
        authStateInitialized = true;
        
        // Configurer Firebase Auth
        setupFirebaseAuth();
        
        // Observer les changements d'état UNE SEULE FOIS
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          console.log('🔔 Auth state changed:', user ? `Connecté: ${user.email}` : 'Déconnecté');
          
          if (user) {
            // Vérifier expiration avant de connecter
            const { checkSessionExpiry } = get();
            if (checkSessionExpiry()) {
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
                sessionExpiry: sessionExpiry
              });
            }
          } else {
            set({ 
              user: null, 
              loading: false, 
              error: null,
              isAuthenticated: false,
              lastLoginTime: null,
              sessionExpiry: null
            });
          }
        }, (error) => {
          console.error('❌ Erreur observer auth:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
        });

        return unsubscribeAuth;
      },

      // 🧹 NETTOYER L'ERREUR
      clearError: () => {
        set({ error: null });
      },

      // 🧹 NETTOYER LES LISTENERS
      cleanup: () => {
        if (unsubscribeAuth) {
          unsubscribeAuth();
          unsubscribeAuth = null;
        }
        authStateInitialized = false;
      }
    }),
    {
      name: 'auth-storage', // nom unique pour le localStorage
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
        sessionExpiry: state.sessionExpiry
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('💾 State réhydraté depuis localStorage');
          
          // Vérifier si la session n'a pas expiré
          if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
            console.log('⏰ Session expirée au démarrage, reset');
            return {
              ...state,
              user: null,
              isAuthenticated: false,
              lastLoginTime: null,
              sessionExpiry: null
            };
          }
          
          // Si utilisateur présent, vérifier avec Firebase
          if (state.user && state.isAuthenticated) {
            setTimeout(() => {
              const currentUser = auth.currentUser;
              if (!currentUser) {
                console.log('⚠️ Utilisateur localStorage mais pas Firebase, déconnexion');
                state.signOut && state.signOut();
              }
            }, 1000);
          }
        }
      },
    }
  )
);

// ==========================================
// 🚀 INITIALISATION UNIQUE ET SÉCURISÉE
// ==========================================

// Fonction d'initialisation à appeler manuellement depuis App.jsx
export const initializeAuthStore = () => {
  if (!authStateInitialized) {
    console.log('🚀 Initialisation unique AuthStore avec persistence');
    const store = useAuthStore.getState();
    
    // S'assurer qu'on ne lance qu'une seule fois
    if (store && typeof store.initializeAuth === 'function') {
      store.initializeAuth();
    }
    
    // Vérification périodique de l'expiration (toutes les 5 minutes)
    setInterval(() => {
      const store = useAuthStore.getState();
      if (store.isAuthenticated) {
        store.checkSessionExpiry();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
  } else {
    console.log('🔒 AuthStore déjà initialisé, ignorer');
  }
};

// ==========================================
// 🔧 HOOK PERSONNALISÉ POUR VÉRIFICATION AUTO
// ==========================================

export const useAuthPersistence = () => {
  const store = useAuthStore();
  
  React.useEffect(() => {
    // Vérification au montage
    if (store.isAuthenticated && !store.checkSessionExpiry()) {
      console.log('Session expirée détectée dans useAuthPersistence');
    }
    
    // Actualiser le token périodiquement si connecté
    if (store.isAuthenticated) {
      const tokenRefreshInterval = setInterval(async () => {
        try {
          await store.refreshAuthToken();
        } catch (error) {
          console.log('Erreur actualisation token, déconnexion');
          store.signOut();
        }
      }, 50 * 60 * 1000); // 50 minutes
      
      return () => clearInterval(tokenRefreshInterval);
    }
  }, [store.isAuthenticated]);
  
  return store;
};

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ AuthStore avec persistence complète chargé');
console.log('🔧 Session persistence: 24h');
console.log('🔄 Token refresh: automatique');
console.log('💾 localStorage: activé');
console.log('🛡️ Appel initializeAuthStore() requis');

// Export par défaut pour compatibilité
export default useAuthStore;
