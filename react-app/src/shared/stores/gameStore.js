// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store Gamification CORRIGÉ avec getters robustes
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

        // 🎯 Actions principales
        setGameData: (data) => {
          console.log('🎮 setGameData appelé avec:', data);
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

        // 🧮 Getters calculés - CORRIGÉ
        getters: {
          getCurrentLevel: () => get().gameData?.level || 1,
          getCurrentXP: () => get().gameData?.xp || 0,
          getTotalXP: () => {
            const gameData = get().gameData;
            return gameData?.totalXp || gameData?.xp || 0;
          },
          getBadgeCount: () => get().gameData?.badges?.length || 0,
          getLoginStreak: () => get().gameData?.loginStreak || 0,
          getTasksCompleted: () => get().gameData?.tasksCompleted || 0,
          
          getRecentBadges: (limit = 3) => {
            const badges = get().gameData?.badges || [];
            return badges
              .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
              .slice(0, limit);
          },
          
          // 🔧 CORRECTION: Calcul de progression corrigé
          getProgressPercentage: () => {
            const gameData = get().gameData;
            if (!gameData || !gameData.level) {
              console.log('⚠️ Pas de gameData pour calcul progression');
              return 0;
            }
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || gameData.xp || 0;
            
            // Formule: XP requis pour niveau N = (N-1)² × 100
            const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            
            const progress = totalXP - currentLevelXP;
            const needed = nextLevelXP - currentLevelXP;
            
            const percentage = Math.min((progress / needed) * 100, 100);
            
            console.log('📊 Calcul progression:', {
              currentLevel,
              totalXP,
              currentLevelXP,
              nextLevelXP,
              progress,
              needed,
              percentage
            });
            
            return Math.max(percentage, 0);
          },
          
          // 🔧 CORRECTION: XP pour prochain niveau corrigé
          getXPForNextLevel: () => {
            const gameData = get().gameData;
            if (!gameData || !gameData.level) {
              console.log('⚠️ Pas de gameData pour calcul XP restant');
              return 100;
            }
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || gameData.xp || 0;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            
            const needed = Math.max(nextLevelXP - totalXP, 0);
            
            console.log('🎯 XP restant:', {
              currentLevel,
              totalXP,
              nextLevelXP,
              needed
            });
            
            return needed;
          },

          // 🔧 NOUVEAU: Vérifier la cohérence des données
          validateGameData: () => {
            const gameData = get().gameData;
            if (!gameData) return false;
            
            const issues = [];
            
            if (!gameData.level || gameData.level < 1) {
              issues.push('Level invalide');
            }
            
            if ((gameData.totalXp || 0) < 0) {
              issues.push('TotalXP négatif');
            }
            
            if (gameData.xp !== undefined && gameData.totalXp !== undefined) {
              if (Math.abs(gameData.xp - gameData.totalXp) > 1) {
                issues.push('Incohérence xp/totalXp');
              }
            }
            
            if (issues.length > 0) {
              console.warn('⚠️ Problèmes données gamification:', issues);
              return false;
            }
            
            return true;
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
        version: 1
      }
    )
  )
);

// Hooks utilitaires pour l'UI
export const useGameGetters = () => useGameStore(state => state.getters);

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
