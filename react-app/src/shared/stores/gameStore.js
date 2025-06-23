// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store Gamification FINAL - Compatible Dashboard optimisé
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

        // 🔧 Cache pour optimisation
        _calculationCache: {},
        _lastCalculationTime: 0,

        // 🎯 Actions principales
        setGameData: (data) => {
          const state = get();
          const prevData = state.gameData;
          
          // Éviter les mises à jour inutiles
          if (prevData && data && 
              prevData.level === data.level && 
              prevData.totalXp === data.totalXp && 
              prevData.badges?.length === data.badges?.length) {
            console.log('🔄 Pas de changement significatif, skip update');
            return;
          }
          
          console.log('🎮 setGameData:', {
            prev: prevData ? `L${prevData.level} - ${prevData.totalXp}XP` : 'null',
            new: data ? `L${data.level} - ${data.totalXp}XP` : 'null'
          });
          
          set({ 
            gameData: data,
            isInitialized: true,
            _calculationCache: {}, // Clear cache
            _lastCalculationTime: Date.now()
          });
        },

        setLoading: (loading) => {
          const currentLoading = get().isLoading;
          if (currentLoading !== loading) {
            console.log('⏳ Loading state:', loading);
            set({ isLoading: loading });
          }
        },

        setError: (error) => {
          if (error) {
            console.error('❌ Game store error:', error);
          }
          set({ error });
        },

        clearError: () => set({ error: null }),

        // 🎊 Actions d'interface
        showLevelUpNotification: (levelData) => {
          console.log('🎉 Show level up:', levelData);
          set({
            showLevelUpModal: true,
            levelUpData: levelData
          });
        },

        hideLevelUpNotification: () => set({
          showLevelUpModal: false,
          levelUpData: null
        }),

        showBadgeNotification: (badge) => {
          console.log('🏅 Show badge notification:', badge.name);
          set({
            showBadgeModal: true,
            newBadge: badge
          });
        },

        hideBadgeNotification: () => set({
          showBadgeModal: false,
          newBadge: null
        }),

        triggerXPAnimation: (xpGained) => {
          console.log('✨ Trigger XP animation:', xpGained);
          set({ showXPAnimation: true, xpGained });
          setTimeout(() => {
            set({ showXPAnimation: false, xpGained: null });
          }, 2000);
        },

        // 📝 Gestion de l'activité récente
        addRecentActivity: (activity) => {
          console.log('📝 Add activity:', activity.type);
          set((state) => ({
            recentActivity: [
              {
                ...activity,
                id: Date.now() + Math.random(),
                timestamp: activity.timestamp || new Date().toISOString()
              },
              ...state.recentActivity.slice(0, 9) // Keep 10 max
            ]
          }));
        },

        clearRecentActivity: () => set({ recentActivity: [] }),

        // 🔄 Reset complet
        resetGameStore: () => {
          console.log('🔄 Reset complete du game store');
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
            _calculationCache: {},
            _lastCalculationTime: 0
          });
        },

        // 🧮 Getters calculés - ULTRA OPTIMISÉS
        getters: {
          getCurrentLevel: () => {
            const level = get().gameData?.level || 1;
            return level;
          },
          
          getCurrentXP: () => {
            const xp = get().gameData?.xp || 0;
            return xp;
          },
          
          getTotalXP: () => {
            const gameData = get().gameData;
            const totalXp = gameData?.totalXp || gameData?.xp || 0;
            return totalXp;
          },
          
          getBadgeCount: () => {
            const count = get().gameData?.badges?.length || 0;
            return count;
          },
          
          getLoginStreak: () => {
            const streak = get().gameData?.loginStreak || 0;
            return streak;
          },
          
          getTasksCompleted: () => {
            const completed = get().gameData?.tasksCompleted || 0;
            return completed;
          },
          
          getRecentBadges: (limit = 3) => {
            const badges = get().gameData?.badges || [];
            return badges
              .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
              .slice(0, limit);
          },
          
          // 🔧 CRITIQUE: Calcul de progression avec cache intelligent
          getProgressPercentage: () => {
            const state = get();
            const gameData = state.gameData;
            
            if (!gameData || !gameData.level) {
              return 0;
            }
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || gameData.xp || 0;
            
            // Cache key unique
            const cacheKey = `progress_${currentLevel}_${totalXP}`;
            const now = Date.now();
            
            // Utiliser le cache si récent (< 2 secondes)
            if (state._calculationCache[cacheKey] && 
                (now - state._lastCalculationTime) < 2000) {
              return state._calculationCache[cacheKey];
            }
            
            // Calcul fresh
            // Formule: XP requis pour niveau N = (N-1)² × 100
            const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            
            const progress = totalXP - currentLevelXP;
            const needed = nextLevelXP - currentLevelXP;
            
            let percentage = 0;
            if (needed > 0) {
              percentage = (progress / needed) * 100;
            }
            
            // Clamp entre 0 et 100
            const result = Math.min(Math.max(percentage, 0), 100);
            
            console.log('📊 Progress calculation:', {
              currentLevel,
              totalXP,
              currentLevelXP,
              nextLevelXP,
              progress,
              needed,
              percentage: result.toFixed(1)
            });
            
            // Mettre en cache
            set(state => ({
              _calculationCache: {
                ...state._calculationCache,
                [cacheKey]: result
              },
              _lastCalculationTime: now
            }));
            
            return result;
          },
          
          // 🔧 CRITIQUE: XP pour prochain niveau avec cache
          getXPForNextLevel: () => {
            const state = get();
            const gameData = state.gameData;
            
            if (!gameData || !gameData.level) {
              return 100;
            }
            
            const currentLevel = gameData.level;
            const totalXP = gameData.totalXp || gameData.xp || 0;
            
            // Cache key
            const cacheKey = `xpneeded_${currentLevel}_${totalXP}`;
            const now = Date.now();
            
            // Utiliser le cache si récent
            if (state._calculationCache[cacheKey] && 
                (now - state._lastCalculationTime) < 2000) {
              return state._calculationCache[cacheKey];
            }
            
            // Calcul fresh
            const nextLevelXP = Math.pow(currentLevel, 2) * 100;
            const needed = Math.max(nextLevelXP - totalXP, 0);
            
            console.log('🎯 XP needed calculation:', {
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
              },
              _lastCalculationTime: now
            }));
            
            return needed;
          },

          // 🔧 Validation des données
          validateGameData: () => {
            const gameData = get().gameData;
            if (!gameData) {
              console.warn('⚠️ Pas de gameData à valider');
              return false;
            }
            
            const issues = [];
            
            if (!gameData.level || gameData.level < 1) {
              issues.push('Level invalide: ' + gameData.level);
            }
            
            if ((gameData.totalXp || 0) < 0) {
              issues.push('TotalXP négatif: ' + gameData.totalXp);
            }
            
            if (gameData.xp !== undefined && gameData.totalXp !== undefined) {
              const diff = Math.abs(gameData.xp - gameData.totalXp);
              if (diff > 1) {
                issues.push(`Incohérence xp/totalXp: ${gameData.xp} vs ${gameData.totalXp}`);
              }
            }
            
            if (issues.length > 0) {
              console.warn('⚠️ Problèmes données gamification:', issues);
              return false;
            }
            
            console.log('✅ GameData valide');
            return true;
          },

          // 🔧 NOUVEAU: Debug info
          getDebugInfo: () => {
            const state = get();
            return {
              hasGameData: !!state.gameData,
              isLoading: state.isLoading,
              error: state.error,
              cacheSize: Object.keys(state._calculationCache).length,
              lastCalcTime: new Date(state._lastCalculationTime).toLocaleTimeString(),
              recentActivityCount: state.recentActivity.length
            };
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

// Hooks utilitaires pour l'UI - OPTIMISÉS
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

// 🔧 NOUVEAU: Hook debug
export const useGameDebug = () => useGameStore(state => state.getters.getDebugInfo());
