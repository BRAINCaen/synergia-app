// src/shared/stores/authStore.js
// Store d'authentification complet avec Firebase
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
      
      setLoading: (loading) => set({ loading }),
      
      setInitialized: () => set({ loading: false })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Export par défaut pour compatibilité
export default useAuthStore
