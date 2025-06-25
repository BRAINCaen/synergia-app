// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// Store d'authentification PREMIUM ORIGINAL restauré
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

      // ✅ FONCTION INITIALIZEAUTH ORIGINALE RESTAURÉE
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

            // 🎮 INITIALISATION GAMESTORE SÉCURISÉE (sans import dynamique)
            try {
              // Initialiser avec un délai pour éviter les conflits
              setTimeout(async () => {
                try {
                  // Utiliser le GameStore directement depuis le window si disponible
                  if (window.useGameStore) {
                    const gameStore = window.useGameStore.getState();
                    if (gameStore.initializeGameStore) {
                      await gameStore.initializeGameStore(userData.uid);
                      console.log('🎮 GameStore initialisé pour:', userData.uid);
                    }
                  }
                } catch (gameError) {
                  console.warn('⚠️ GameStore non disponible:', gameError);
                }
              }, 500);
            } catch (error) {
              console.warn('⚠️ Erreur initialisation GameStore:', error);
            }
            
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false, 
              error: null 
            })
            
            console.log('ℹ️ Aucun utilisateur connecté')
          }
        })

        // Retourner la fonction de désabonnement
        return unsubscribe
      },

      // ✅ CONNEXION GOOGLE ORIGINALE
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null })
          const result = await authService.signInWithGoogle()
          
          console.log('✅ Connexion Google réussie')
          return { success: true, user: result }
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error)
          set({ error: error.message, loading: false })
          throw error
        }
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
          
          // 🎮 Nettoyer GameStore avant déconnexion (sécurisé)
          try {
            if (window.useGameStore) {
              const gameStore = window.useGameStore.getState();
              if (gameStore.cleanup) {
                gameStore.cleanup();
                console.log('🎮 GameStore nettoyé');
              }
            }
          } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage GameStore:', cleanupError);
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
