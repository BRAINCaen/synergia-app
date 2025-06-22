import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  clearAuth: () => set({ user: null, error: null }),

  isAuthenticated: () => {
    const { user } = get()
    return !!user
  },

  getUserDisplayName: () => {
    const { user } = get()
    return user?.displayName || user?.email || 'Utilisateur'
  }
}))
