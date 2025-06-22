// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store Gamification avec PERSISTENCE - MISE À JOUR
// ==========================================

export const useGameStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
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

        // 🎊 Actions d'interface
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
          setTimeout(() => {
            set({ showXPAnimation: false, xpGained: null });
          }, 2000);
        },

        // 📝 Gestion de l'activité récente
        addRecentActivity: (activity) => set((state) => ({
          recentActivity: [
            {
              ...activity,
              id: Date.now() + Math.random(),
              timestamp: new Date().toISOString()
            },
            ...state.recentActivity.slice(0, 9)
          ]
        })),

        clearRecentActivity: () => set({ recentActivity: [] }),

        // 🔄 Reset complet
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

        // 🧮 Getters
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
          }
        }
      }),
      {
        name: 'synergia-game', // Clé localStorage
        partialize: (state) => ({
          gameData: state.gameData,
          recentActivity: state.recentActivity,
          isInitialized: state.isInitialized
        }),
        version: 1,
        // Gérer la réhydratation des fonctions
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...persistedState,
          getters: currentState.getters // Réattacher les getters
        })
      }
    )
  )
);
