// authStore.js - Store d'authentification complet avec Firebase
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
        
        const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
          if (firebaseUser) {
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              loginAt: new Date().toISOString()
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
          
          return { success: true, user: userData }
        } catch (error) {
          const errorMessage = error.code === 'auth/popup-closed-by-user' 
            ? 'Connexion annulée par l\'utilisateur'
            : error.code === 'auth/popup-blocked'
            ? 'Popup bloquée par le navigateur'
            : 'Erreur de connexion'
          
          set({ 
            loading: false, 
            error: errorMessage 
          })
          
          console.error('❌ Erreur connexion Google:', error)
          return { success: false, error: errorMessage }
        }
      },

      signOut: async () => {
        set({ loading: true })
        
        try {
          await authService.signOut()
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: null 
          })
          
          return { success: true }
        } catch (error) {
          set({ loading: false, error: 'Erreur lors de la déconnexion' })
          console.error('❌ Erreur déconnexion:', error)
          return { success: false, error: 'Erreur lors de la déconnexion' }
        }
      },

      clearError: () => {
        set({ error: null })
      },

      // Getters
      getUser: () => get().user,
      isLoading: () => get().loading,
      getError: () => get().error,
      isUserAuthenticated: () => get().isAuthenticated
    }),
    {
      name: 'synergia-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)
