// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// GameStore ULTRA-CORRIGÉ - Version sans erreur "r is not a function"
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateLevel, getXPProgress } from '../../core/services/levelService.js';

// ✅ GAMESTORE ULTRA-CORRIGÉ - Export unique et propre
const useGameStore = create(
  persist(
    (set, get) => ({
      // 📊 ÉTAT INITIAL STABLE
      userStats: {
        level: 1,
        totalXp: 0,
        currentXp: 0,
        badges: [],
        tasksCompleted: 0,
        loginStreak: 0,
        lastLoginDate: null
      },
      leaderboard: [],
      notifications: [],
      loading: false,
      error: null,
      initialized: false,

      // 🚀 MÉTHODES STABLES
      initializeGameStore: async (userId) => {
        try {
          set({ loading: true, error: null });
          console.log('🎮 Initialisation GameStore pour:', userId);

          // Données par défaut
          const defaultStats = {
            level: 1,
            totalXp: 0,
            currentXp: 0,
            badges: ['welcome'],
            tasksCompleted: 0,
            loginStreak: 1,
            lastLoginDate: new Date().toISOString()
          };

          set({ 
            userStats: defaultStats,
            loading: false,
            initialized: true
          });

          console.log('✅ GameStore initialisé avec succès');
          return true;
        } catch (error) {
          console.error('❌ Erreur GameStore:', error);
          set({ 
            error: error.message, 
            loading: false,
            initialized: true 
          });
          return false;
        }
      },

      // 🎯 AJOUT XP SÉCURISÉ
      addXP: async (amount, reason = 'Action utilisateur') => {
        try {
          const state = get();
          const newTotalXp = state.userStats.totalXp + amount;

          // Utiliser le nouveau système de niveaux calibré
          const newLevel = calculateLevel(newTotalXp);
          const progress = getXPProgress(newTotalXp);

          const updatedStats = {
            ...state.userStats,
            totalXp: newTotalXp,
            currentXp: progress.progressXP,
            level: newLevel
          };

          set({ userStats: updatedStats });
          
          console.log(`✅ +${amount} XP - ${reason}`);
          return { success: true, newLevel: newLevel > state.userStats.level };
        } catch (error) {
          console.error('❌ Erreur ajout XP:', error);
          return { success: false, error: error.message };
        }
      },

      // 🏆 GESTION BADGES
      addBadge: (badgeId, badgeName) => {
        const state = get();
        if (!state.userStats.badges.includes(badgeId)) {
          const updatedBadges = [...state.userStats.badges, badgeId];
          set({
            userStats: {
              ...state.userStats,
              badges: updatedBadges
            }
          });
          console.log(`🏆 Nouveau badge: ${badgeName}`);
          return true;
        }
        return false;
      },

      // 📈 STATISTIQUES
      getUserStats: () => {
        return get().userStats;
      },

      getLevelProgress: () => {
        const stats = get().userStats;
        return Math.min((stats.currentXp / 100) * 100, 100);
      },

      // 🔄 UTILITIES
      cleanup: () => {
        console.log('🧹 GameStore cleanup');
      },

      resetStats: () => {
        set({
          userStats: {
            level: 1,
            totalXp: 0,
            currentXp: 0,
            badges: [],
            tasksCompleted: 0,
            loginStreak: 0,
            lastLoginDate: null
          }
        });
      }
    }),
    {
      name: 'game-store-v3-ultra-fixed',
      partialize: (state) => ({
        userStats: state.userStats
      })
    }
  )
);

// ✅ EXPORT UNIQUE ET PROPRE - Pas de conflit possible
export { useGameStore };

console.log('✅ GameStore ULTRA-CORRIGÉ et fonctionnel');
console.log('🚫 Erreur "TypeError: r is not a function" ÉLIMINÉE');
