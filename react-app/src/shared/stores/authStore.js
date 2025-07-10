// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// Store d'authentification CORRIGÉ - Fonction checkAuth ajoutée
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

      // ✅ FONCTION CHECKAUTH AJOUTÉE - C'était ça le problème !
      checkAuth: async () => {
        set({ loading: true })
        
        try {
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
          
          return unsubscribe
        } catch (error) {
          console.error('❌ Erreur checkAuth:', error)
          set({ 
            loading: false, 
            error: error.message 
          })
        }
      },

      // ✅ FONCTION INITIALIZEAUTH SANS GAMESTORE
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

            // 🚨 GAMESTORE TEMPORAIREMENT DÉSACTIVÉ
            console.log('ℹ️ GameStore désactivé temporairement pour debug')
            
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
        
        return unsubscribe
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null })
          
          const result = await authService.signInWithGoogle()
          
          if (result.success) {
            // L'état sera mis à jour par onAuthStateChanged
            console.log('✅ Connexion Google initiée')
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signInWithEmail: async (email, password) => {
        try {
          set({ loading: true, error: null })
          
          const result = await authService.signInWithEmail(email, password)
          
          if (result.success) {
            console.log('✅ Connexion email réussie')
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          console.error('❌ Erreur connexion email:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signUpWithEmail: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null })
          
          const result = await authService.signUpWithEmail(email, password, displayName)
          
          if (result.success) {
            console.log('✅ Inscription réussie')
            return { success: true }
          } else {
            set({ error: result.error, loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          console.error('❌ Erreur inscription:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null })
          
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
