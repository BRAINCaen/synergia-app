// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store Gamification OPTIMISÉ - Évite les recalculs en boucle
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

        // 🔧 Cache pour éviter les recalculs
        _calculationCache: {},
        _lastCalculationTime: 0,

        // 🎯 Actions principales
        setGameData: (data) => {
          const prevData = get().gameData;
          console.log('🎮 setGameData appelé:', {
            prev: prevData ? `L${prevData.level} - ${prevData.totalXp}XP` : 'null',
            new: data ? `L${data.level} - ${data.totalXp}XP` : 'null'
          });
          
          set({ 
            gameData: data,
            isInitialized: true,
            // 🔧 Clear cache si données changées
            _calculationCache: {},
            _lastCalculationTime: Date.now()
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
          xpGained: null,
          _calculationCache: {},
          _lastCalculationTime: 0
        }),

        // 🧮 Getters calculés - OPTIMISÉS avec cache
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
          
          // 🔧 OPTIMISÉ: Calcul de progression avec cache
          getProgressPercentage: () => {
            const state = get();
            const gameData = state.gameData;
            
            if (!gameData || !gameData.level) {
              return 0;
            }
            
            // Cache key basé sur les données importantes
            const cacheKey = `progress_${gameData.level}_${gameData.totalXp}`;
            const now = Date.now();
            
            // Utiliser le cache si récent (< 1 seconde)
            if (state._calculationCache[cacheKey] && (now - state._lastCalculationTime) < 1000) {
              return state._calculationCache[cacheKey];
            }
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || gameData.xp || 0;
            
            // Formule: XP requis pour niveau N = (N-1)² × 100
            const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            
            const progress = totalXP - currentLevelXP;
            const needed = nextLevelXP - currentLevelXP;
            
            const percentage = needed > 0 ? Math.min((progress / needed) * 100, 100) : 0;
            const result = Math.max(percentage, 0);
            
            console.log('📊 Calcul progression (fresh):', {
              currentLevel,
              totalXP,
              currentLevelXP,
              nextLevelXP,
              progress,
              needed,
              percentage: result
            });
            
            // Mettre en cache
            set(state => ({
              _calculationCache: {
                ...state._calculationCache,
                [cacheKey]: result
              }
            }));
            
            return result;
          },
          
          // 🔧 OPTIMISÉ: XP pour prochain niveau avec cache
          getXPForNextLevel: () => {
            const state = get();
            const gameData = state.gameData;
            
            if (!gameData || !gameData.level) {
              return 100;
            }
            
            // Cache key
            const cacheKey = `xpneeded_${gameData.level}_${gameData.totalXp}`;
            const now = Date.now();
            
            // Utiliser le cache si récent
            if (state._calculationCache[cacheKey] && (now - state._lastCalculationTime) < 1000) {
              return state._calculationCache[cacheKey];
            }
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || gameData.xp || 0;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            
            const needed = Math.max(nextLevelXP - totalXP, 0);
            
            console.log('🎯 XP restant (fresh):', {
              currentLevel,
              totalXP,
              nextLevelXP,
              needed
            });
            
            // Mettre en cache
            set(state => ({
              _calculationCache: {
                ...state._calculationCache,
                [cacheKey]: needed
              }
            }));
            
            return needed;
          },

          // 🔧 Validation des données
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
