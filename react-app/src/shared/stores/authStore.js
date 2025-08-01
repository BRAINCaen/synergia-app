// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// VERSION STABLE RESTAURÉE - AUTH SIMPLE QUI MARCHE
// ==========================================

import { create } from 'zustand';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../../core/firebase.js';

// Provider Google
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * 🔐 STORE D'AUTHENTIFICATION SIMPLE ET FONCTIONNEL
 */
export const useAuthStore = create((set, get) => ({
  // État initial
  user: null,
  loading: true,
  error: null,

  // ==========================================
  // 🚀 CONNEXION GOOGLE
  // ==========================================
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🔐 Tentative de connexion Google...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('✅ Connexion réussie:', user.email);
      
      // Pas de set() ici, onAuthStateChanged s'en charge
      return user;
      
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // ==========================================
  // 🚪 DÉCONNEXION
  // ==========================================
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🚪 Déconnexion...');
      
      await firebaseSignOut(auth);
      console.log('✅ Déconnexion réussie');
      
      // Pas de set() ici, onAuthStateChanged s'en charge
      
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // ==========================================
  // 🔄 INITIALISATION DE L'ÉCOUTE AUTH
  // ==========================================
  initializeAuth: () => {
    console.log('🔄 Initialisation listener auth...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔔 Auth state changed:', user?.email || 'Non connecté');
      
      if (user) {
        // Utilisateur connecté
        set({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          },
          loading: false,
          error: null
        });
      } else {
        // Utilisateur déconnecté
        set({
          user: null,
          loading: false,
          error: null
        });
      }
    });

    return unsubscribe;
  },

  // ==========================================
  // 🧹 ACTIONS UTILITAIRES
  // ==========================================
  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading) => {
    set({ loading });
  }
}));

// ==========================================
// 🚀 INITIALISATION AUTOMATIQUE
// ==========================================
console.log('🔐 AuthStore initialisé');

// Démarrer l'écoute auth automatiquement
let unsubscribe = null;

// Fonction d'initialisation
const initAuth = () => {
  const store = useAuthStore.getState();
  unsubscribe = store.initializeAuth();
};

// Initialiser dès que possible
if (typeof window !== 'undefined') {
  initAuth();
}

// Nettoyage à la fermeture
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
}
