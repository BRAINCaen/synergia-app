// src/shared/stores/authStore.js - STORE ZUSTAND POUR L'AUTHENTIFICATION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      }),

      // Getters
      getCurrentUser: () => get().user,
      
      isAdmin: () => {
        const user = get().user;
        return user?.profile?.role === 'admin';
      },

      isManager: () => {
        const user = get().user;
        return user?.profile?.role === 'manager' || user?.profile?.role === 'admin';
      },

      getUserRole: () => {
        const user = get().user;
        return user?.profile?.role || 'employee';
      },

      getUserDisplayName: () => {
        const user = get().user;
        return user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';
      },

      getUserXP: () => {
        const user = get().user;
        return user?.profile?.gamification?.xp || 0;
      },

      getUserLevel: () => {
        const user = get().user;
        return user?.profile?.gamification?.level || 1;
      },

      getUserBadges: () => {
        const user = get().user;
        return user?.profile?.gamification?.badges || [];
      },

      // Actions de mise à jour du profil
      updateUserProfile: (profileUpdates) => set((state) => ({
        user: state.user ? {
          ...state.user,
          profile: {
            ...state.user.profile,
            ...profileUpdates
          }
        } : null
      })),

      updateUserXP: (newXP, newLevel) => set((state) => ({
        user: state.user ? {
          ...state.user,
          profile: {
            ...state.user.profile,
            gamification: {
              ...state.user.profile?.gamification,
              xp: newXP,
              level: newLevel
            }
          }
        } : null
      })),

      addUserBadge: (badge) => set((state) => ({
        user: state.user ? {
          ...state.user,
          profile: {
            ...state.user.profile,
            gamification: {
              ...state.user.profile?.gamification,
              badges: [
                ...(state.user.profile?.gamification?.badges || []),
                badge
              ]
            }
          }
        } : null
      })),

      // Reset du store
      reset: () => set({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'synergia-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
