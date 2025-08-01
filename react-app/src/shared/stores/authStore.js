// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// Store d'authentification SIMPLIFIÉ QUI FONCTIONNE
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../../core/firebase.js';

// Créer le provider Google
const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      initialized: false,

      // Actions
      initializeAuth: () => {
        console.log('🔄 Initialisation de l\'authentification...');
        
        set({ loading: true });
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('🔔 Auth state changed:', firebaseUser ? 'Connecté' : 'Déconnecté');
          
          if (firebaseUser) {
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified
            };
            
            set({ 
              user: userData, 
              isAuthenticated: true, 
              loading: false, 
              error: null,
              initialized: true
            });
            
            console.log('✅ Utilisateur connecté:', userData.email);
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false, 
              error: null,
              initialized: true
            });
            
            console.log('ℹ️ Aucun utilisateur connecté');
          }
        });

        // Retourner la fonction de nettoyage
        return unsubscribe;
      },

      // Connexion avec Google
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          console.log('🔐 Tentative de connexion Google...');
          
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          
          console.log('✅ Connexion Google réussie:', user.email);
          
          return { success: true, user };
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error);
          
          let errorMessage = 'Erreur de connexion';
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Connexion annulée';
          } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup bloquée par le navigateur';
          }
          
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Déconnexion
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          await firebaseSignOut(auth);
          
          console.log('✅ Déconnexion réussie');
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false,
            error: null 
          });
          
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur déconnexion:', error);
          
          set({ error: 'Erreur de déconnexion', loading: false });
          return { success: false, error: error.message };
        }
      },

      // Nettoyer les erreurs
      clearError: () => {
        set({ error: null });
      },

      // Mettre à jour l'utilisateur
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Auto-initialisation
let authInitialized = false;

if (!authInitialized) {
  const store = useAuthStore.getState();
  store.initializeAuth();
  authInitialized = true;
  console.log('🚀 AuthStore auto-initialisé');
}

export default useAuthStore;
