// src/shared/stores/authStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useAuthStore = create(
  devtools(
    (set, get) => ({
      // État initial
      user: null,
      userProfile: null,
      loading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user, error: null }),
      
      setUserProfile: (userProfile) => set({ userProfile }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Réinitialiser le store
      reset: () => set({
        user: null,
        userProfile: null,
        loading: false,
        error: null
      }),

      // Getters
      isAuthenticated: () => !!get().user,
      isAdmin: () => get().userProfile?.role === 'admin',
      isManager: () => ['admin', 'manager'].includes(get().userProfile?.role),
    }),
    { name: 'auth-store' }
  )
)

export default useAuthStore
