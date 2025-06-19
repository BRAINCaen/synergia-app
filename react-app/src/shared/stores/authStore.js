import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  // État minimal
  user: null,
  isLoading: false,
  error: null,

  // Actions de base
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Action de test
  loginTest: () => {
    set({ isLoading: true })
    setTimeout(() => {
      set({ 
        user: { name: 'Utilisateur Test', email: 'test@synergia.com' },
        isLoading: false,
        error: null
      })
    }, 1000)
  },

  logout: () => set({ user: null, error: null })
}))

export default useAuthStore
