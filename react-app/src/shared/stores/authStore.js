// src/shared/stores/authStore.js
// Store d'authentification avec méthodes gamification corrigées
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../../core/firebase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      // Actions
      initializeAuth: () => {
        set({ loading: true })
        
        const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
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
            }
            
            set({ 
              user: userData, 
              isAuthenticated: true, 
              loading: false, 
              error: null 
            })
            
            console.log('✅ Utilisateur connecté:', userData.email)

            // 🎮 Initialiser le GameStore une fois que l'utilisateur est connecté
            try {
              const { useGameStore } = await import('./gameStore.js');
              const gameStore = useGameStore.getState();
              await gameStore.initializeGameStore(userData.uid);
              console.log('🎮 GameStore initialisé pour:', userData.uid);
            } catch (gameStoreError) {
              console.warn('⚠️ Erreur initialisation GameStore:', gameStoreError);
            }
            
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false, 
              error: null 
            })
            
            console.log('ℹ️ Aucun utilisateur connecté')

            // 🎮 Nettoyer le GameStore lors de la déconnexion
            try {
              const { useGameStore } = await import('./gameStore.js');
              const gameStore = useGameStore.getState();
              gameStore.cleanup();
              console.log('🎮 GameStore nettoyé');
            } catch (gameStoreError) {
              console.warn('⚠️ Erreur nettoyage GameStore:', gameStoreError);
            }
          }
        })

        // Retourner la fonction de nettoyage
        return unsubscribe
      },

      signInWithGoogle: async () => {
        set({ loading: true, error: null })
        
        try {
          const userData = await authService.signInWithGoogle()
          
          set({ 
            user: userData, 
            isAuthenticated: true, 
            loading: false, 
            error: null 
          })
          
          // ✅ CORRIGÉ: Initialiser la gamification avec les bonnes méthodes
          try {
            const { gamificationService } = await import('../../core/services/gamificationService.js');
            await gamificationService.initializeUserData(userData.uid);
            await gamificationService.dailyLogin(userData.uid);
            console.log('✅ Gamification initialisée pour:', userData.email);
          } catch (gamificationError) {
            console.warn('⚠️ Erreur initialisation gamification:', gamificationError);
          }
          
          return { success: true, user: userData }
        } catch (error) {
          const errorMessage = error.code === 'auth/popup-closed-by-user' 
            ? 'Connexion annulée par l\'utilisateur'
            : error.code === 'auth/popup-blocked'
            ? 'Pop-up bloquée par le navigateur'
            : error.code === 'auth/network-request-failed'
            ? 'Erreur de connexion réseau'
            : 'Erreur lors de la connexion'
          
          set({ 
            error: errorMessage, 
            loading: false 
          })
          
          return { success: false, error: errorMessage }
        }
      },

      signInWithEmail: async (email, password) => {
        set({ loading: true, error: null })
        
        try {
          const userData = await authService.signInWithEmail(email, password)
          
          set({ 
            user: userData, 
            isAuthenticated: true, 
            loading: false, 
            error: null 
          })
          
          // ✅ CORRIGÉ: Initialiser la gamification avec les bonnes méthodes
          try {
            const { gamificationService } = await import('../../core/services/gamificationService.js');
            await gamificationService.initializeUserData(userData.uid);
            await gamificationService.dailyLogin(userData.uid);
            console.log('✅ Gamification initialisée pour:', userData.email);
          } catch (gamificationError) {
            console.warn('⚠️ Erreur initialisation gamification:', gamificationError);
          }
          
          return { success: true, user: userData }
        } catch (error) {
          const errorMessage = error.code === 'auth/user-not-found'
            ? 'Aucun compte trouvé avec cet email'
            : error.code === 'auth/wrong-password'
            ? 'Mot de passe incorrect'
            : error.code === 'auth/invalid-email'
            ? 'Email invalide'
            : 'Erreur lors de la connexion'
          
          set({ 
            error: errorMessage, 
            loading: false 
          })
          
          return { success: false, error: errorMessage }
        }
      },

      signOut: async () => {
        set({ loading: true })
        
        try {
          // 🎮 Nettoyer le GameStore avant la déconnexion
          try {
            const { useGameStore } = await import('./gameStore.js');
            const gameStore = useGameStore.getState();
            gameStore.cleanup();
          } catch (gameStoreError) {
            console.warn('⚠️ Erreur nettoyage GameStore:', gameStoreError);
          }

          await authService.signOut()
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: null 
          })
          
          console.log('✅ Déconnexion réussie')
          return { success: true }
        } catch (error) {
          set({ 
            error: 'Erreur lors de la déconnexion', 
            loading: false 
          })
          
          console.error('❌ Erreur déconnexion:', error)
          return { success: false, error: 'Erreur lors de la déconnexion' }
        }
      },

      // Fonctions utilitaires
      clearError: () => set({ error: null }),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      getCurrentUser: () => get().user,
      
      isUserAuthenticated: () => get().isAuthenticated && !!get().user?.uid
    }),
    {
      name: 'auth-store',
      // Ne pas persister les états de chargement et d'erreur
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
