// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTH STORE STABLE - SANS BOUCLES DE RÉINITIALISATION
// ==========================================

import { create } from 'zustand';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../../core/firebase.js';

// ==========================================
// 🔧 VERSION STABLE SANS AUTO-RÉINITIALISATION
// ==========================================

// Provider Google
const googleProvider = new GoogleAuthProvider();

// Variable pour éviter les initialisations multiples
let authStateInitialized = false;

// Store stable
export const useAuthStore = create((set, get) => {
  
  // État minimal
  const initialState = {
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    unsubscribe: null
  };

  // ==========================================
  // 🔐 MÉTHODES D'AUTHENTIFICATION STABLES
  // ==========================================

  const methods = {
    
    // Connexion Google
    signInWithGoogle: async () => {
      try {
        set({ loading: true, error: null });
        console.log('🔍 Tentative connexion Google...');
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log('✅ Connexion Google réussie:', user.email);
        set({ 
          user, 
          loading: false, 
          error: null,
          isAuthenticated: true 
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

    // Connexion email
    signInWithEmail: async (email, password) => {
      try {
        set({ loading: true, error: null });
        console.log('📧 Tentative connexion email:', email);
        
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        console.log('✅ Connexion email réussie:', user.email);
        set({ 
          user, 
          loading: false, 
          error: null,
          isAuthenticated: true 
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

    // Inscription
    signUp: async (email, password) => {
      try {
        set({ loading: true, error: null });
        console.log('📝 Tentative inscription:', email);
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        console.log('✅ Inscription réussie:', user.email);
        set({ 
          user, 
          loading: false, 
          error: null,
          isAuthenticated: true 
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

    // Déconnexion
    signOut: async () => {
      try {
        console.log('👋 Déconnexion...');
        await firebaseSignOut(auth);
        set({ 
          user: null, 
          loading: false, 
          error: null,
          isAuthenticated: false 
        });
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

    // ✅ CORRECTION: Initialisation unique et stable
    initializeAuth: () => {
      // Éviter les initialisations multiples
      if (authStateInitialized) {
        console.log('🔒 Auth déjà initialisé, ignorer');
        return;
      }

      console.log('🔍 Initialisation unique auth state...');
      authStateInitialized = true;
      
      // Observer les changements d'état UNE SEULE FOIS
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('🔔 Auth state changed:', user ? `Connecté: ${user.email}` : 'Déconnecté');
        
        set({ 
          user, 
          loading: false, 
          error: null,
          isAuthenticated: !!user 
        });
      }, (error) => {
        console.error('❌ Erreur observer auth:', error);
        set({ 
          error: error.message, 
          loading: false,
          user: null,
          isAuthenticated: false 
        });
      });

      // Stocker la fonction de désabonnement
      set({ unsubscribe });
      
      return unsubscribe;
    },

    // Réinitialiser l'erreur
    clearError: () => {
      set({ error: null });
    },

    // Nettoyer les listeners
    cleanup: () => {
      const { unsubscribe } = get();
      if (unsubscribe) {
        unsubscribe();
        set({ unsubscribe: null });
      }
      authStateInitialized = false;
    }
  };

  // Retourner l'état et les méthodes
  return {
    ...initialState,
    ...methods
  };
});

// ==========================================
// 🚀 INITIALISATION MANUELLE AU LIEU D'AUTO
// ==========================================

// Fonction d'initialisation à appeler manuellement depuis App.jsx
export const initializeAuthStore = () => {
  if (!authStateInitialized) {
    console.log('🚀 Initialisation manuelle AuthStore');
    const store = useAuthStore.getState();
    store.initializeAuth();
  }
};

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ AuthStore stable chargé');
console.log('🔧 Sans auto-réinitialisation');
console.log('🛡️ Appel initializeAuthStore() requis');

// Export par défaut pour compatibilité
export default useAuthStore;
