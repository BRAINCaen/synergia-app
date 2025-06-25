// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// Store d'authentification avec import GameStore corrigé
// ==========================================

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

            // 🎮 CORRECTION : Initialiser le GameStore de manière sécurisée
            try {
              // Import dynamique avec timeout et gestion d'erreur
              const gameStoreModule = await Promise.race([
                import('./gameStore.js'),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout import GameStore')), 5000)
                )
              ]);
              
              // Vérifier que le module et les exports existent
              if (gameStoreModule && gameStoreModule.default) {
                const gameStore = gameStoreModule.default.getState();
                
                // Vérifier que la méthode existe avant de l'appeler
                if (typeof gameStore.initializeGameStore === 'function') {
                  await gameStore.initializeGameStore(userData.uid);
                  console.log('🎮 GameStore initialisé pour:', userData.uid);
                } else {
                  console.warn('⚠️ Méthode initializeGameStore non disponible');
                }
              } else {
                console.warn('⚠️ GameStore module non disponible');
              }
            } catch (gameStoreError) {
              console.warn('⚠️ Erreur initialisation GameStore:', gameStoreError.message);
              // Ne pas bloquer l'authentification si GameStore échoue
            }
            
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false, 
              error: null 
            })
            
            console.log('ℹ️ Aucun utilisateur connecté')

            // 🎮 CORRECTION : Nettoyer le GameStore de manière sécurisée
            try {
              const gameStoreModule = await import('./gameStore.js');
              if (gameStoreModule && gameStoreModule.default) {
                const gameStore = gameStoreModule.default.getState();
                if (typeof gameStore.cleanup === 'function') {
                  gameStore.cleanup();
                  console.log('🎮 GameStore nettoyé');
                }
              }
            } catch (gameStoreError) {
              console.warn('⚠️ Erreur nettoyage GameStore:', gameStoreError.message);
            }
          }
        })

        // Retourner la fonction de désabonnement
        return unsubscribe
      },

      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const result = await authService.signInWithEmailAndPassword(email, password)
          console.log('✅ Connexion réussie')
          return result
        } catch (error) {
          console.error('❌ Erreur de connexion:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signUp: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null })
          const result = await authService.createUserWithEmailAndPassword(email, password)
          
          if (displayName && result.user) {
            await authService.updateProfile(result.user, { displayName })
          }
          
          console.log('✅ Inscription réussie')
          return result
        } catch (error) {
          console.error('❌ Erreur d\'inscription:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signOut: async () => {
        try {
          set({ loading: true })
          
          // 🎮 Nettoyer GameStore avant déconnexion
          try {
            const gameStoreModule = await import('./gameStore.js');
            if (gameStoreModule && gameStoreModule.default) {
              const gameStore = gameStoreModule.default.getState();
              if (typeof gameStore.cleanup === 'function') {
                gameStore.cleanup();
              }
            }
          } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage GameStore lors déconnexion:', cleanupError.message);
          }
          
          await authService.signOut()
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: null 
          })
          
          console.log('✅ Déconnexion réussie')
        } catch (error) {
          console.error('❌ Erreur de déconnexion:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      resetPassword: async (email) => {
        try {
          set({ loading: true, error: null })
          await authService.sendPasswordResetEmail(email)
          set({ loading: false })
          console.log('✅ Email de réinitialisation envoyé')
        } catch (error) {
          console.error('❌ Erreur réinitialisation:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      updateProfile: async (updates) => {
        try {
          const currentUser = authService.currentUser
          if (!currentUser) throw new Error('Aucun utilisateur connecté')

          set({ loading: true, error: null })
          await authService.updateProfile(currentUser, updates)
          
          // Mettre à jour le store local
          const currentState = get()
          if (currentState.user) {
            set({
              user: { ...currentState.user, ...updates },
              loading: false
            })
          }
          
          console.log('✅ Profil mis à jour')
        } catch (error) {
          console.error('❌ Erreur mise à jour profil:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
