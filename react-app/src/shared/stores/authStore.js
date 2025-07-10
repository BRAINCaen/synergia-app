// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// VERSION DEBUG - FORCE LE DÉVERROUILLAGE pour identifier le problème
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 🚨 Import authService avec fallback en cas d'erreur
let authService = null;
try {
  const firebaseModule = await import('../../core/firebase.js');
  authService = firebaseModule.authService;
  console.log('✅ DEBUG authStore - authService importé avec succès');
} catch (error) {
  console.error('❌ DEBUG authStore - Erreur import authService:', error);
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
      debugMode: true, // 🚨 Mode debug activé

      // 🚨 FONCTION DEBUG - initializeAuth avec timeout forcé
      initializeAuth: async () => {
        console.log('🚨 DEBUG initializeAuth - Démarrage avec timeout forcé...');
        set({ loading: true, error: null });
        
        // 🎯 TIMEOUT FORCÉ - Si pas de réponse en 5 secondes, on force le déverrouillage
        const forceUnlockTimer = setTimeout(() => {
          console.log('🚨 DEBUG - TIMEOUT ATTEINT - Force déverrouillage !');
          set({ 
            loading: false, 
            initialized: true,
            error: 'Timeout Firebase - Mode dégradé activé'
          });
        }, 5000);
        
        try {
          // ✅ Vérifier que authService est disponible
          if (!authService) {
            console.warn('⚠️ DEBUG - authService non disponible, mode dégradé');
            clearTimeout(forceUnlockTimer);
            set({ 
              loading: false, 
              initialized: true,
              error: 'authService non disponible'
            });
            return;
          }

          console.log('🔧 DEBUG - authService disponible, test onAuthStateChanged...');

          // ✅ Test avec timeout pour onAuthStateChanged
          const authPromise = new Promise((resolve, reject) => {
            try {
              const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
                console.log('🔄 DEBUG - Changement d\'état auth:', firebaseUser ? 'Connecté' : 'Déconnecté');
                clearTimeout(forceUnlockTimer);
                
                if (firebaseUser) {
                  // Utilisateur connecté
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
                  
                  console.log('✅ DEBUG - Utilisateur connecté et état mis à jour:', userData.email);
                  resolve(userData);
                  
                } else {
                  // Aucun utilisateur connecté
                  set({ 
                    user: null, 
                    isAuthenticated: false, 
                    loading: false, 
                    error: null,
                    initialized: true
                  });
                  
                  console.log('ℹ️ DEBUG - Aucun utilisateur connecté, état réinitialisé');
                  resolve(null);
                }
              });
              
              // Retourner la fonction de désabonnement
              return unsubscribe;
              
            } catch (error) {
              console.error('❌ DEBUG - Erreur onAuthStateChanged:', error);
              clearTimeout(forceUnlockTimer);
              reject(error);
            }
          });

          // ✅ Attendre max 10 secondes pour la réponse Firebase
          await Promise.race([
            authPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout onAuthStateChanged')), 10000)
            )
          ]);
          
          console.log('✅ DEBUG - initializeAuth terminé avec succès');
          
        } catch (error) {
          console.error('❌ DEBUG - Erreur initializeAuth:', error);
          clearTimeout(forceUnlockTimer);
          set({ 
            loading: false, 
            error: error.message,
            initialized: true
          });
        }
      },

      // 🚨 FONCTION DEBUG - Force déverrouillage manuel
      forceUnlock: () => {
        console.log('🚨 DEBUG - Force déverrouillage manuel !');
        set({ 
          loading: false, 
          initialized: true,
          error: 'Déverrouillage forcé par debug'
        });
      },

      // 🚨 FONCTION DEBUG - Simulation utilisateur connecté
      debugLogin: () => {
        console.log('🔐 DEBUG - Simulation connexion utilisateur');
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
          loading: false,
          error: null,
          initialized: true
        });
      },

      // ✅ Connexion avec Google (avec fallback)
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          if (!authService) {
            throw new Error('authService non disponible');
          }
          
          console.log('🔐 DEBUG - Tentative de connexion Google...');
          const result = await authService.signInWithGoogle();
          
          if (result.success) {
            console.log('✅ DEBUG - Connexion Google réussie');
            return { success: true };
          } else {
            console.error('❌ DEBUG - Échec connexion Google:', result.error);
            set({ error: result.error, loading: false });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ DEBUG - Erreur connexion Google:', error);
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },

      // ✅ Déconnexion (avec fallback)
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          if (!authService) {
            console.log('🚪 DEBUG - Déconnexion locale (authService indisponible)');
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false, 
              error: null 
            });
            return { success: true };
          }
          
          console.log('🚪 DEBUG - Tentative de déconnexion...');
          const result = await authService.signOut();
          
          if (result.success) {
            console.log('✅ DEBUG - Déconnexion réussie');
            return { success: true };
          } else {
            console.error('❌ DEBUG - Échec déconnexion:', result.error);
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ DEBUG - Erreur déconnexion:', error);
          return { success: false, error: error.message };
        }
      },

      // ✅ Actions utilitaires
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // ✅ Reset complet du store
      reset: () => set({ 
        user: null, 
        loading: false, 
        error: null, 
        isAuthenticated: false,
        initialized: false
      }),

      // ✅ Getters utiles
      getCurrentUser: () => get().user,
      isLoading: () => get().loading,
      hasError: () => !!get().error,
      isReady: () => get().initialized && !get().loading
    }),
    {
      name: 'synergia-auth-debug',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      version: 2 // Nouvelle version pour le debug
    }
  )
);

// 🚨 EXPOSITION DES FONCTIONS DEBUG DANS WINDOW
if (typeof window !== 'undefined') {
  window.debugAuth = {
    forceUnlock: () => useAuthStore.getState().forceUnlock(),
    debugLogin: () => useAuthStore.getState().debugLogin(),
    getState: () => useAuthStore.getState(),
    reset: () => useAuthStore.getState().reset()
  };
  
  console.log('🚨 DEBUG - Fonctions exposées dans window.debugAuth:');
  console.log('  - window.debugAuth.forceUnlock() : Force le déverrouillage');
  console.log('  - window.debugAuth.debugLogin() : Simule une connexion');
  console.log('  - window.debugAuth.getState() : Voir l\'état actuel');
  console.log('  - window.debugAuth.reset() : Reset complet');
}

// ✅ LOG DE SUCCÈS
console.log('🚨 DEBUG authStore configuré avec timeout forcé et fonctions debug');
console.log('⏰ Auto-déverrouillage en 5 secondes si Firebase ne répond pas');

export default useAuthStore;
