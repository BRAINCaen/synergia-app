// src/shared/stores/authStore.js
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, error: null }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    user: null,
    userProfile: null,
    loading: false,
    error: null
  })
}))

export default useAuthStore
