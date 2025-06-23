// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store Gamification COMPLET - Version Corrigée
// ==========================================

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

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
        
        // Données modales
        levelUpData: null,
        newBadge: null,
        xpGained: null,

        // 🔄 Références pour cleanup
        unsubscribe: null,

        // 🎯 Actions principales
        setGameData: (data) => {
          console.log('🔄 GameData changed, forcing re-render');
          set({ 
            gameData: data,
            isInitialized: true 
          });
        },

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

        triggerXPAnimation: (xpGained) => set({
          showXPAnimation: true,
          xpGained
        }),

        hideXPAnimation: () => set({
          showXPAnimation: false,
          xpGained: null
        }),

        // 📝 Gestion de l'activité récente
        addRecentActivity: (activity) => set(state => ({
          recentActivity: [
            {
              ...activity,
              id: Date.now(),
              timestamp: new Date().toISOString()
            },
            ...state.recentActivity.slice(0, 9) // Garder les 10 dernières
          ]
        })),

        clearRecentActivity: () => set({ recentActivity: [] }),

        // 🧮 Getters calculés
        getters: {
          getCurrentLevel: () => {
            const gameData = get().gameData;
            return gameData?.level || 1;
          },

          getTotalXP: () => {
            const gameData = get().gameData;
            return gameData?.totalXp || 0;
          },

          getProgressPercentage: () => {
            const gameData = get().gameData;
            if (!gameData?.level) return 0;
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || 0;
            const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            const progress = totalXP - currentLevelXP;
            const levelRange = nextLevelXP - currentLevelXP;
            
            return Math.round((progress / levelRange) * 100);
          },

          getXPForNextLevel: () => {
            const gameData = get().gameData;
            if (!gameData?.level) return 100;
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || 0;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            
            return Math.max(0, nextLevelXP - totalXP);
          },

          getBadgeCount: () => {
            const gameData = get().gameData;
            return gameData?.badges?.length || 0;
          },

          getTasksCompleted: () => {
            const gameData = get().gameData;
            return gameData?.tasksCompleted || 0;
          },

          getLoginStreak: () => {
            const gameData = get().gameData;
            return gameData?.loginStreak || 0;
          }
        },

        // ✅ CORRECTION: Cleanup fonction
        cleanup: () => {
          console.log('🧹 GameStore cleanup...');
          const state = get();
          
          if (state.unsubscribe) {
            state.unsubscribe();
            console.log('🛑 GameStore listener arrêté');
          }
          
          set({
            unsubscribe: null,
            isLoading: false,
            error: null,
            showLevelUpModal: false,
            showBadgeModal: false,
            showXPAnimation: false,
            levelUpData: null,
            newBadge: null,
            xpGained: null
          });
        },

        // 🔄 Sauvegarder référence unsubscribe
        setUnsubscribe: (unsubscribeFn) => set({ unsubscribe: unsubscribeFn }),

        // 🧹 Reset complet du store
        reset: () => {
          get().cleanup();
          set({
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
            xpGained: null,
            unsubscribe: null
          });
        }
      }),
      {
        name: 'synergia-game',
        partialize: (state) => ({
          gameData: state.gameData,
          recentActivity: state.recentActivity,
          isInitialized: state.isInitialized
        }),
        version: 1
      }
    )
  )
);

export default useGameStore;
