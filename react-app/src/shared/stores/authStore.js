// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// Store d'authentification CORRIGÉ avec imports Zustand
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État utilisateur
      user: null,
      loading: true,
      error: null,
      isInitialized: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        error: null,
        isInitialized: true 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      clearAuth: () => set({ 
        user: null, 
        error: null,
        isInitialized: true 
      }),

      // Getters
      isAuthenticated: () => {
        const { user } = get()
        return !!user
      },

      getUserDisplayName: () => {
        const { user } = get()
        return user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
      },

      getUserInitials: () => {
        const { user } = get()
        if (user?.displayName) {
          return user.displayName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        }
        return user?.email?.charAt(0).toUpperCase() || '?'
      }
    }),
    {
      name: 'synergia-auth', // Clé localStorage
      partialize: (state) => ({
        user: state.user,
        isInitialized: state.isInitialized
      }),
      version: 1
    }
  )
)

// Export par défaut pour compatibilité
export default useAuthStore
