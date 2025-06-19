// src/shared/stores/gameStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useGameStore = create(
  subscribeWithSelector((set, get) => ({
    // 🎮 État de la gamification
    gameData: null,
    isLoading: false,
    error: null,
    isInitialized: false,

    // 📊 État de l'interface
    showLevelUpModal: false,
    showBadgeModal: false,
    showXPAnimation: false,
    recentActivity: [],

    // 🎯 Actions principales
    setGameData: (data) => set({ 
      gameData: data,
      isInitialized: true 
    }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),

    // 🎊 Actions d'interface pour feedback utilisateur
    showLevelUpNotification: (levelData) => set({
      showLevelUpModal: true,
      levelUpData: levelData
    }),

    hideLevelUpNotification: () => set({
      showLevelUpModal: false,
      levelUpData: null
    }),

    showBadgeNotification: (badge) => set({
      showBadgeModal: true,
      newBadge: badge
    }),

    hideBadgeNotification: () => set({
      showBadgeModal: false,
      newBadge: null
    }),

    triggerXPAnimation: (xpGained) => {
      set({ showXPAnimation: true, xpGained });
      // Auto-hide après animation
      setTimeout(() => {
        set({ showXPAnimation: false, xpGained: null });
      }, 2000);
    },

    // 📝 Gestion de l'historique d'activité récente
    addRecentActivity: (activity) => set((state) => ({
      recentActivity: [
        {
          ...activity,
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString()
        },
        ...state.recentActivity.slice(0, 9) // Garder les 10 dernières
      ]
    })),

    clearRecentActivity: () => set({ recentActivity: [] }),

    // 🔄 Reset complet du store
    resetGameStore: () => set({
      gameData: null,
      isLoading: false,
      error: null,
      isInitialized: false,
      showLevelUpModal: false,
      showBadgeModal: false,
      showXPAnimation: false,
      recentActivity: [],
      levelUpData: null,
      newBadge: null,
      xpGained: null
    }),

    // 🧮 Sélecteurs calculés (getters)
    getters: {
      getCurrentLevel: () => get().gameData?.level || 1,
      
      getCurrentXP: () => get().gameData?.xp || 0,
      
      getTotalXP: () => get().gameData?.totalXp || 0,
      
      getBadgeCount: () => get().gameData?.badges?.length || 0,
      
      getLoginStreak: () => get().gameData?.loginStreak || 0,
      
      getTasksCompleted: () => get().gameData?.tasksCompleted || 0,
      
      getRecentBadges: (limit = 3) => {
        const badges = get().gameData?.badges || [];
        return badges
          .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
          .slice(0, limit);
      },
      
      getProgressPercentage: () => {
        const gameData = get().gameData;
        if (!gameData) return 0;
        
        const currentLevelXP = Math.pow(gameData.level - 1, 2) * 100;
        const nextLevelXP = Math.pow(gameData.level, 2) * 100;
        const progress = gameData.totalXp - currentLevelXP;
        const needed = nextLevelXP - currentLevelXP;
        
        return Math.min((progress / needed) * 100, 100);
      },
      
      getXPForNextLevel: () => {
        const gameData = get().gameData;
        if (!gameData) return 100;
        
        const nextLevelXP = Math.pow(gameData.level, 2) * 100;
        return Math.max(nextLevelXP - gameData.totalXp, 0);
      },
      
      getBadgesByCategory: (category) => {
        const badges = get().gameData?.badges || [];
        return badges.filter(badge => badge.category === category);
      },
      
      hasError: () => !!get().error,
      
      isReady: () => get().isInitialized && !get().isLoading && !get().error
    }
  }))
);

// 🎯 Hook pour accéder facilement aux getters
export const useGameGetters = () => {
  const store = useGameStore();
  return store.getters;
};

// 🔔 Sélecteurs spécifiques pour optimiser les re-renders
export const useGameLevel = () => useGameStore(state => state.gameData?.level || 1);
export const useGameXP = () => useGameStore(state => state.gameData?.xp || 0);
export const useGameBadges = () => useGameStore(state => state.gameData?.badges || []);
export const useGameLoading = () => useGameStore(state => state.isLoading);
export const useGameError = () => useGameStore(state => state.error);

// 🎊 Sélecteurs pour les notifications
export const useLevelUpModal = () => useGameStore(state => ({
  show: state.showLevelUpModal,
  data: state.levelUpData,
  hide: state.hideLevelUpNotification
}));

export const useBadgeModal = () => useGameStore(state => ({
  show: state.showBadgeModal,
  badge: state.newBadge,
  hide: state.hideBadgeNotification
}));

export const useXPAnimation = () => useGameStore(state => ({
  show: state.showXPAnimation,
  amount: state.xpGained
}));
