// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// VERSION AUTO-UNLOCK - Force loading=false automatiquement
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 🚨 Import authService avec fallback
let authService = null;
try {
  const firebaseModule = await import('../../core/firebase.js');
  authService = firebaseModule.authService;
  console.log('✅ authStore - authService importé avec succès');
} catch (error) {
  console.error('❌ authStore - Erreur import authService:', error);
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ✅ État initial
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      initialized: false,

      // 🚨 FONCTION AUTO-UNLOCK - Force le déverrouillage
      initializeAuth: async () => {
        console.log('🚀 initializeAuth - Démarrage avec AUTO-UNLOCK...');
        set({ loading: true, error: null });
        
        // 🎯 AUTO-UNLOCK IMMÉDIAT après 3 secondes
        const autoUnlockTimer = setTimeout(() => {
          const currentState = get();
          console.log('🚨 AUTO-UNLOCK activé ! État actuel:', {
            hasUser: !!currentState.user,
            loading: currentState.loading,
            isAuthenticated: currentState.isAuthenticated
          });
          
          // Si on a un utilisateur mais qu'on est toujours en loading, forcer le déverrouillage
          if (currentState.user || currentState.isAuthenticated) {
            console.log('✅ AUTO-UNLOCK - Utilisateur détecté, force déverrouillage');
            set({ 
              loading: false, 
              initialized: true,
              isAuthenticated: true,
              error: null
            });
          } else {
            console.log('ℹ️ AUTO-UNLOCK - Pas d\'utilisateur, mode déconnecté');
            set({ 
              loading: false, 
              initialized: true,
              isAuthenticated: false,
              user: null,
              error: null
            });
          }
        }, 3000); // 3 secondes au lieu de 5
        
        try {
          if (!authService) {
            console.warn('⚠️ authService non disponible, AUTO-UNLOCK dans 3s');
            return;
          }

          console.log('🔧 authService disponible, test Firebase...');

          // ✅ Test Firebase avec timeout court
          const authPromise = new Promise((resolve, reject) => {
            try {
              const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
                console.log('🔄 Firebase auth state change:', firebaseUser ? 'Connecté' : 'Déconnecté');
                clearTimeout(autoUnlockTimer); // Annuler auto-unlock si Firebase répond
                
                if (firebaseUser) {
                  const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email,
                    photoURL: firebaseUser.photoURL || null,
                    emailVerified: firebaseUser.emailVerified || false,
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
                  
                  console.log('✅ Firebase - Utilisateur connecté:', userData.email);
                  resolve(userData);
                  
                } else {
                  set({ 
                    user: null, 
                    isAuthenticated: false, 
                    loading: false, 
                    error: null,
                    initialized: true
                  });
                  
                  console.log('ℹ️ Firebase - Aucun utilisateur connecté');
                  resolve(null);
                }
              });
              
              return unsubscribe;
              
            } catch (error) {
              console.error('❌ Erreur onAuthStateChanged:', error);
              clearTimeout(autoUnlockTimer);
              reject(error);
            }
          });

          // ✅ Timeout Firebase court (6 secondes max)
          await Promise.race([
            authPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout Firebase')), 6000)
            )
          ]);
          
        } catch (error) {
          console.error('❌ Erreur initializeAuth:', error);
          clearTimeout(autoUnlockTimer);
          
          // ✅ En cas d'erreur, débloquer quand même
          set({ 
            loading: false, 
            error: error.message,
            initialized: true
          });
        }
      },

      // 🚨 FONCTION FORCE UNLOCK AMÉLIORÉE
      forceUnlock: () => {
        const currentState = get();
        console.log('🚨 FORCE UNLOCK - État avant:', {
          hasUser: !!currentState.user,
          loading: currentState.loading,
          isAuthenticated: currentState.isAuthenticated
        });
        
        set({ 
          loading: false, 
          initialized: true,
          error: null
        });
        
        console.log('✅ FORCE UNLOCK terminé');
      },

      // 🚨 SIMULATION CONNEXION AMÉLIORÉE
      debugLogin: () => {
        console.log('🔐 DEBUG LOGIN - Création utilisateur de test');
        set({
          user: {
            uid: 'debug-user-123',
            email: 'debug@synergia.com',
            displayName: 'Utilisateur Debug',
            photoURL: null,
            emailVerified: true,
            loginAt: new Date().toISOString()
          },
          isAuthenticated: true,
          loading: false, // ✅ IMPORTANT: loading = false !
          error: null,
          initialized: true
        });
        console.log('✅ DEBUG LOGIN terminé - App débloquée');
      },

      // ✅ Connexion Google (simplifiée)
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          if (!authService) {
            throw new Error('authService non disponible');
          }
          
          const result = await authService.signInWithGoogle();
          
          if (result.success) {
            console.log('✅ Connexion Google réussie');
            return { success: true };
          } else {
            set({ error: result.error, loading: false });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error);
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },

      // ✅ Déconnexion
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          if (authService) {
            await authService.signOut();
          }
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: null 
          });
          
          console.log('✅ Déconnexion réussie');
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur déconnexion:', error);
          return { success: false, error: error.message };
        }
      },

      // ✅ Actions utilitaires
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      reset: () => set({ 
        user: null, 
        loading: false, 
        error: null, 
        isAuthenticated: false,
        initialized: false
      }),

      // ✅ Getters
      getCurrentUser: () => get().user,
      isLoading: () => get().loading,
      hasError: () => !!get().error,
      isReady: () => get().initialized && !get().loading
    }),
    {
      name: 'synergia-auth-auto-unlock',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      version: 3 // Nouvelle version avec auto-unlock
    }
  )
);

// 🚨 EXPOSITION FONCTIONS DEBUG + AUTO-UNLOCK
if (typeof window !== 'undefined') {
  window.debugAuth = {
    forceUnlock: () => useAuthStore.getState().forceUnlock(),
    debugLogin: () => useAuthStore.getState().debugLogin(),
    getState: () => useAuthStore.getState(),
    reset: () => useAuthStore.getState().reset(),
    // 🆕 Nouvelle fonction d'urgence
    emergencyUnlock: () => {
      console.log('🆘 EMERGENCY UNLOCK - Force déverrouillage total !');
      useAuthStore.setState({ 
        loading: false, 
        initialized: true, 
        error: null 
      });
    }
  };
  
  console.log('🚨 DEBUG authStore avec AUTO-UNLOCK activé');
  console.log('⏰ Déverrouillage automatique dans 3 secondes si Firebase ne répond pas');
  console.log('🆘 Fonction d\'urgence: window.debugAuth.emergencyUnlock()');
}

export default useAuthStore;
