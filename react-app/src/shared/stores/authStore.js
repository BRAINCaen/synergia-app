// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// Store d'authentification CORRIGÉ - Import authService réparé
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// ✅ CORRECTION CRITIQUE - Import authService depuis firebase.js où il est maintenant exporté
import { authService } from '../../core/firebase.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ✅ État initial
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      initialized: false,

      // ✅ FONCTION CRITIQUE - initializeAuth (c'était ça le blocage !)
      initializeAuth: async () => {
        console.log('🚀 initializeAuth - Démarrage...');
        set({ loading: true, error: null });
        
        try {
          // ✅ Vérifier que authService est disponible
          if (!authService) {
            throw new Error('authService non disponible');
          }

          console.log('🔧 authService disponible, configuration onAuthStateChanged...');

          // ✅ Configurer l'écoute des changements d'auth
          const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
            console.log('🔄 Changement d\'état auth:', firebaseUser ? 'Connecté' : 'Déconnecté');
            
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
              
              console.log('✅ Utilisateur connecté et état mis à jour:', userData.email);
              
            } else {
              // Aucun utilisateur connecté
              set({ 
                user: null, 
                isAuthenticated: false, 
                loading: false, 
                error: null,
                initialized: true
              });
              
              console.log('ℹ️ Aucun utilisateur connecté, état réinitialisé');
            }
          });
          
          // ✅ Retourner la fonction de désabonnement
          console.log('✅ initializeAuth terminé avec succès');
          return unsubscribe;
          
        } catch (error) {
          console.error('❌ Erreur initializeAuth:', error);
          set({ 
            loading: false, 
            error: error.message,
            initialized: true
          });
          // Même en cas d'erreur, marquer comme initialisé pour éviter le blocage
        }
      },

      // ✅ Connexion avec Google
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          console.log('🔐 Tentative de connexion Google...');
          const result = await authService.signInWithGoogle();
          
          if (result.success) {
            console.log('✅ Connexion Google réussie');
            // L'état sera mis à jour automatiquement par onAuthStateChanged
            return { success: true };
          } else {
            console.error('❌ Échec connexion Google:', result.error);
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
          
          console.log('🚪 Tentative de déconnexion...');
          const result = await authService.signOut();
          
          if (result.success) {
            console.log('✅ Déconnexion réussie');
            // L'état sera mis à jour automatiquement par onAuthStateChanged
            return { success: true };
          } else {
            console.error('❌ Échec déconnexion:', result.error);
            set({ error: result.error, loading: false });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error('❌ Erreur déconnexion:', error);
          set({ error: error.message, loading: false });
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
      // ✅ Configuration de persistance - Ne sauvegarder que les données essentielles
      name: 'synergia-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // Ne pas sauvegarder loading, error, initialized
      }),
      // ✅ Version pour gérer les migrations
      version: 1
    }
  )
);

// ✅ Actions rapides pour compatibilité
export const authActions = {
  signInWithGoogle: () => useAuthStore.getState().signInWithGoogle(),
  signOut: () => useAuthStore.getState().signOut(),
  initializeAuth: () => useAuthStore.getState().initializeAuth(),
  reset: () => useAuthStore.getState().reset()
};

// ✅ LOG DE SUCCÈS
console.log('✅ authStore configuré avec authService corrigé');
console.log('🔧 initializeAuth prêt à être appelé par App.jsx');
