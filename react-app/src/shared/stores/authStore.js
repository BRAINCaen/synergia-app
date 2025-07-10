// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// VERSION SANS FIREBASE - Bypass total du problème d'import
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

console.log('🚨 authStore SANS FIREBASE - Démarrage...');

// 🚨 MOCK AUTHSERVICE - Remplace Firebase complètement
const mockAuthService = {
  async signInWithGoogle() {
    console.log('🔐 MOCK - Simulation connexion Google');
    return {
      success: true,
      uid: 'mock-user-123',
      email: 'user@synergia.com',
      displayName: 'Utilisateur Synergia',
      photoURL: null,
      emailVerified: true
    };
  },

  async signOut() {
    console.log('🚪 MOCK - Simulation déconnexion');
    return { success: true };
  },

  onAuthStateChanged(callback) {
    console.log('👂 MOCK - Simulation onAuthStateChanged');
    // Simuler un utilisateur connecté immédiatement
    setTimeout(() => {
      callback({
        uid: 'mock-user-123',
        email: 'user@synergia.com',
        displayName: 'Utilisateur Synergia',
        photoURL: null,
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      });
    }, 1000); // 1 seconde pour simuler le chargement
    
    // Retourner une fonction de désabonnement mock
    return () => console.log('🔇 MOCK - Désabonnement auth');
  },

  getCurrentUser() {
    return {
      uid: 'mock-user-123',
      email: 'user@synergia.com',
      displayName: 'Utilisateur Synergia'
    };
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ✅ État initial
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      initialized: false,

      // 🚨 INITIALIZE AUTH SANS FIREBASE
      initializeAuth: async () => {
        console.log('🚀 initializeAuth SANS FIREBASE - Démarrage...');
        set({ loading: true, error: null });
        
        try {
          console.log('🎭 Utilisation mockAuthService au lieu de Firebase');
          
          // ✅ Utiliser mockAuthService au lieu de Firebase
          const unsubscribe = mockAuthService.onAuthStateChanged(async (mockUser) => {
            console.log('🔄 MOCK auth state change:', mockUser ? 'Connecté' : 'Déconnecté');
            
            if (mockUser) {
              const userData = {
                uid: mockUser.uid,
                email: mockUser.email,
                displayName: mockUser.displayName || mockUser.email,
                photoURL: mockUser.photoURL || null,
                emailVerified: mockUser.emailVerified || false,
                loginAt: new Date().toISOString(),
                metadata: {
                  creationTime: mockUser.metadata?.creationTime,
                  lastSignInTime: mockUser.metadata?.lastSignInTime
                }
              };
              
              set({ 
                user: userData, 
                isAuthenticated: true, 
                loading: false, 
                error: null,
                initialized: true
              });
              
              console.log('✅ MOCK - Utilisateur connecté:', userData.email);
              
            } else {
              set({ 
                user: null, 
                isAuthenticated: false, 
                loading: false, 
                error: null,
                initialized: true
              });
              
              console.log('ℹ️ MOCK - Aucun utilisateur connecté');
            }
          });
          
          console.log('✅ initializeAuth SANS FIREBASE terminé avec succès');
          return unsubscribe;
          
        } catch (error) {
          console.error('❌ Erreur initializeAuth MOCK:', error);
          set({ 
            loading: false, 
            error: error.message,
            initialized: true
          });
        }
      },

      // ✅ Connexion avec mockAuthService
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          console.log('🔐 MOCK - Tentative de connexion Google...');
          const result = await mockAuthService.signInWithGoogle();
          
          if (result.success) {
            // Créer userData à partir du résultat mock
            const userData = {
              uid: result.uid,
              email: result.email,
              displayName: result.displayName,
              photoURL: result.photoURL,
              emailVerified: result.emailVerified,
              loginAt: new Date().toISOString()
            };
            
            set({ 
              user: userData,
              isAuthenticated: true,
              loading: false,
              error: null,
              initialized: true
            });
            
            console.log('✅ MOCK - Connexion Google réussie');
            return { success: true };
          } else {
            set({ error: 'Erreur connexion mock', loading: false });
            return { success: false, error: 'Erreur connexion mock' };
          }
        } catch (error) {
          console.error('❌ Erreur connexion Google MOCK:', error);
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },

      // ✅ Déconnexion avec mockAuthService
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          console.log('🚪 MOCK - Tentative de déconnexion...');
          const result = await mockAuthService.signOut();
          
          if (result.success) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false, 
              error: null 
            });
            
            console.log('✅ MOCK - Déconnexion réussie');
            return { success: true };
          } else {
            set({ error: 'Erreur déconnexion mock', loading: false });
            return { success: false, error: 'Erreur déconnexion mock' };
          }
        } catch (error) {
          console.error('❌ Erreur déconnexion MOCK:', error);
          return { success: false, error: error.message };
        }
      },

      // 🚨 FONCTIONS DEBUG AMÉLIORÉES
      forceUnlock: () => {
        console.log('🚨 FORCE UNLOCK');
        set({ 
          loading: false, 
          initialized: true,
          error: null
        });
      },

      debugLogin: () => {
        console.log('🔐 DEBUG LOGIN - Utilisateur mock');
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

      emergencyUnlock: () => {
        console.log('🆘 EMERGENCY UNLOCK - Force totale');
        set({ 
          loading: false, 
          initialized: true, 
          error: null 
        });
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
      name: 'synergia-auth-no-firebase',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      version: 4 // Nouvelle version sans Firebase
    }
  )
);

// 🚨 EXPOSITION COMPLÈTE DES FONCTIONS DEBUG
if (typeof window !== 'undefined') {
  window.debugAuth = {
    forceUnlock: () => useAuthStore.getState().forceUnlock(),
    debugLogin: () => useAuthStore.getState().debugLogin(),
    emergencyUnlock: () => useAuthStore.getState().emergencyUnlock(),
    getState: () => useAuthStore.getState(),
    reset: () => useAuthStore.getState().reset(),
    // 🆕 Fonction de démarrage forcé
    forceStart: () => {
      console.log('🚀 FORCE START - Démarrage forcé de l\'app');
      useAuthStore.getState().debugLogin();
      useAuthStore.getState().forceUnlock();
    }
  };
  
  console.log('🚨 authStore SANS FIREBASE configuré');
  console.log('🎭 Mode MOCK activé - pas de dépendance Firebase');
  console.log('🆘 Fonctions disponibles:');
  console.log('  - window.debugAuth.forceStart() : Démarrage forcé total');
  console.log('  - window.debugAuth.emergencyUnlock() : Déverrouillage d\'urgence');
  console.log('  - window.debugAuth.debugLogin() : Connexion de test');
}

export default useAuthStore;
