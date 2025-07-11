// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTHSTORE SIMPLIFIÉ ET STABLE - PLUS DE BOUCLE !
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../../core/firebase.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ✅ ÉTAT SIMPLE ET CLAIR
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      initialized: false,

      // ✅ INITIALISATION AUTOMATIQUE AU DÉMARRAGE
      initialize: () => {
        console.log('🔄 Initialisation AuthStore...');
        
        if (get().initialized) {
          console.log('ℹ️ AuthStore déjà initialisé');
          return;
        }

        set({ loading: true });
        
        try {
          const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
              const userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
                loginAt: new Date().toISOString(),
                metadata: {
                  creationTime: firebaseUser.metadata?.creationTime,
                  lastSignInTime: firebaseUser.metadata?.lastSignInTime
                }
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
          
          // Stocker la fonction de désabonnement
          set({ unsubscribe });
          
        } catch (error) {
          console.error('❌ Erreur initialisation auth:', error);
          set({ 
            loading: false, 
            error: error.message,
            initialized: true
          });
        }
      },

      // ✅ CONNEXION GOOGLE
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          const result = await authService.signInWithGoogle();
          
          if (result.success) {
            console.log('✅ Connexion Google initiée');
            return { success: true };
          } else {
            set({ error: result.error, loading: false });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ✅ CONNEXION EMAIL/PASSWORD
      signInWithEmail: async (email, password) => {
        try {
          set({ loading: true, error: null });
          
          const result = await authService.signInWithEmail(email, password);
          
          if (result.success) {
            console.log('✅ Connexion email réussie');
            return { success: true };
          } else {
            set({ error: result.error, loading: false });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ Erreur connexion email:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ✅ INSCRIPTION EMAIL/PASSWORD
      signUpWithEmail: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null });
          
          const result = await authService.signUpWithEmail(email, password, displayName);
          
          if (result.success) {
            console.log('✅ Inscription réussie');
            return { success: true };
          } else {
            set({ error: result.error, loading: false });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ Erreur inscription:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ✅ DÉCONNEXION
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          await authService.signOut();
          
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false, 
            error: null 
          });
          
          console.log('✅ Déconnexion réussie');
        } catch (error) {
          console.error('❌ Erreur de déconnexion:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ✅ RÉINITIALISATION MOT DE PASSE
      resetPassword: async (email) => {
        try {
          set({ loading: true, error: null });
          await authService.sendPasswordResetEmail(email);
          set({ loading: false });
          console.log('✅ Email de réinitialisation envoyé');
        } catch (error) {
          console.error('❌ Erreur réinitialisation:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // ✅ EFFACER ERREUR
      clearError: () => set({ error: null })
    }),
    {
      name: 'synergia-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// ✅ INITIALISATION AUTOMATIQUE AU CHARGEMENT DU MODULE
const initializeStore = () => {
  const store = useAuthStore.getState();
  if (!store.initialized) {
    store.initialize();
  }
};

// Initialiser automatiquement
initializeStore();

console.log('✅ AuthStore chargé et initialisé automatiquement');
