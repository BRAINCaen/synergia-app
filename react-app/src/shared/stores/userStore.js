// src/shared/stores/userStore.js
import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  // État du profil utilisateur
  profile: null,
  preferences: {
    theme: 'dark',
    language: 'fr',
    notifications: {
      email: true,
      push: true,
      inApp: true
    }
  },
  isProfileLoading: false,
  
  // Actions
  setProfile: (profile) => set({ 
    profile,
    isProfileLoading: false 
  }),
  
  setProfileLoading: (isLoading) => set({ 
    isProfileLoading: isLoading 
  }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  
  setPreferences: (preferences) => set({ preferences }),
  
  updatePreferences: (updates) => set((state) => ({
    preferences: { ...state.preferences, ...updates }
  })),
  
  // Getters
  getProfile: () => get().profile,
  getPreferences: () => get().preferences,
  getTheme: () => get().preferences.theme,
}));

export default useUserStore;
