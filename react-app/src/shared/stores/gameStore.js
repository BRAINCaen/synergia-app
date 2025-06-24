// src/shared/stores/gameStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { gamificationService } from '../../core/services/gamificationService.js';

export const useGameStore = create(
  devtools(
    (set, get) => ({
      // État
      userStats: {
        totalXp: 0,
        level: 1,
        tasksCreated: 0,
        tasksCompleted: 0,
        projectsCreated: 0,
        projectsJoined: 0,
        badges: [],
        loginStreak: 0,
        completionRate: 0,
        levelInfo: { name: 'Novice', color: '#9CA3AF' },
        levelProgress: { progress: 0, xpNeeded: 100 }
      },
      leaderboard: [],
      loading: false,
      error: null,
      unsubscribe: null,
      notifications: [], // Pour les notifications de niveau/badges

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialiser les statistiques utilisateur
      initializeUser: async (userId, userEmail) => {
        set({ loading: true, error: null });

        try {
          const stats = await gamificationService.initializeUserStats(userId, userEmail);
          set({ userStats: stats, loading: false });
          
          // Mettre à jour la série de connexions
          await gamificationService.updateLoginStreak(userId);
          
          console.log('✅ Statistiques utilisateur initialisées');
          return { success: true, stats };
        } catch (error) {
          console.error('❌ Erreur initialisation utilisateur:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Initialiser l'écoute en temps réel des statistiques
      initializeStatsSync: (userId) => {
        const { unsubscribe: currentUnsubscribe } = get();
        
        // Nettoyer l'ancien abonnement s'il existe
        if (currentUnsubscribe) {
          currentUnsubscribe();
        }

        try {
          // Écouter les changements de statistiques en temps réel
          const unsubscribe = gamificationService.subscribeToUserStats(
            userId,
            (stats) => {
              set({ userStats: stats });
              console.log('📊 Statistiques synchronisées:', stats);
            }
          );

          set({ unsubscribe });
          return unsubscribe;
        } catch (error) {
          console.error('❌ Erreur initialisation sync stats:', error);
          set({ error: error.message });
        }
      },

      // Nettoyer l'abonnement
      cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      // Ajouter des points XP
      addXP: async (userId, amount, reason = 'Activité') => {
        try {
          const result = await gamificationService.addXP(userId, amount, reason);
          
          // Ajouter une notification si niveau up ou nouveaux badges
          const notifications = [];
          
          if (result.levelUp) {
            notifications.push({
              id: Date.now() + '_levelup',
              type: 'levelUp',
              title: 'Niveau supérieur !',
              message: `Félicitations ! Vous êtes maintenant niveau ${result.level}`,
              icon: '🎉',
              timestamp: new Date()
            });
          }
          
          if (result.newBadges && result.newBadges.length > 0) {
            result.newBadges.forEach(badge => {
              notifications.push({
                id: Date.now() + '_badge_' + badge.id,
                type: 'badge',
                title: 'Nouveau badge !',
                message: `Vous avez débloqué: ${badge.name}`,
                icon: badge.icon,
                timestamp: new Date()
              });
            });
          }
          
          if (notifications.length > 0) {
            set(state => ({
              notifications: [...state.notifications, ...notifications]
            }));
          }
          
          return result;
        } catch (error) {
          console.error('❌ Erreur ajout XP:', error);
          return { success: false, error: error.message };
        }
      },

      // Charger le leaderboard
      loadLeaderboard: async (limit = 10) => {
        set({ loading: true, error: null });

        try {
          const leaderboard = await gamificationService.getLeaderboard(limit);
          set({ leaderboard, loading: false });
          
          console.log(`✅ Leaderboard chargé: ${leaderboard.length} entrées`);
          return { success: true, leaderboard };
        } catch (error) {
          console.error('❌ Erreur chargement leaderboard:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Obtenir les statistiques utilisateur
      getUserStats: async (userId) => {
        set({ loading: true, error: null });

        try {
          const stats = await gamificationService.getUserStats(userId);
          if (stats) {
            set({ userStats: stats, loading: false });
          } else {
            set({ loading: false });
          }
          
          return { success: true, stats };
        } catch (error) {
          console.error('❌ Erreur récupération stats:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Mettre à jour les statistiques de tâche
      updateTaskStats: async (userId, action) => {
        try {
          await gamificationService.updateTaskStats(userId, action);
          console.log(`✅ Stats tâche mises à jour: ${action}`);
        } catch (error) {
          console.error('❌ Erreur mise à jour stats tâche:', error);
        }
      },

      // Vérifier les nouveaux badges
      checkForNewBadges: async (userId) => {
        try {
          const newBadges = await gamificationService.checkForNewBadges(userId);
          
          if (newBadges.length > 0) {
            const notifications = newBadges.map(badge => ({
              id: Date.now() + '_badge_' + badge.id,
              type: 'badge',
              title: 'Nouveau badge !',
              message: `Vous avez débloqué: ${badge.name}`,
              icon: badge.icon,
              timestamp: new Date()
            }));
            
            set(state => ({
              notifications: [...state.notifications, ...notifications]
            }));
          }
          
          return newBadges;
        } catch (error) {
          console.error('❌ Erreur vérification badges:', error);
          return [];
        }
      },

      // Marquer une notification comme lue
      markNotificationAsRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        }));
      },

      // Marquer toutes les notifications comme lues
      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      // Obtenir les badges disponibles
      getAvailableBadges: () => {
        const { userStats } = get();
        const userBadgeIds = userStats.badges.map(badge => badge.id);
        
        return Object.values(gamificationService.BADGES_CONFIG || {}).map(badge => ({
          ...badge,
          unlocked: userBadgeIds.includes(badge.id),
          canUnlock: badge.condition && badge.condition(userStats)
        }));
      },

      // Calculer la progression vers le niveau suivant
      getLevelProgress: () => {
        const { userStats } = get();
        return gamificationService.calculateLevelProgress(userStats.totalXp, userStats.level);
      },

      // Obtenir les informations de niveau
      getLevelInfo: (level) => {
        return gamificationService.getLevelInfo(level || get().userStats.level);
      },

      // Obtenir les statistiques de performance
      getPerformanceStats: () => {
        const { userStats } = get();
        
        return {
          productivity: {
            score: Math.min(100, Math.round((userStats.tasksCompleted / Math.max(1, userStats.tasksCreated)) * 100)),
            label: userStats.completionRate >= 80 ? 'Excellent' : 
                   userStats.completionRate >= 60 ? 'Bien' : 
                   userStats.completionRate >= 40 ? 'Correct' : 'À améliorer'
          },
          consistency: {
            score: Math.min(100, userStats.loginStreak * 10),
            label: userStats.loginStreak >= 7 ? 'Très régulier' :
                   userStats.loginStreak >= 3 ? 'Régulier' :
                   userStats.loginStreak >= 1 ? 'Occasionnel' : 'Irrégulier'
          },
          engagement: {
            score: Math.min(100, Math.round((userStats.badges.length / 8) * 100)),
            label: userStats.badges.length >= 6 ? 'Très engagé' :
                   userStats.badges.length >= 3 ? 'Engagé' :
                   userStats.badges.length >= 1 ? 'Actif' : 'Débutant'
          }
        };
      },

      // Obtenir le rang dans le leaderboard
      getUserRank: (userId) => {
        const { leaderboard } = get();
        const userEntry = leaderboard.find(entry => entry.userId === userId);
        return userEntry ? userEntry.rank : null;
      },

      // Prédire le temps pour atteindre le niveau suivant
      predictTimeToNextLevel: () => {
        const { userStats } = get();
        const levelProgress = get().getLevelProgress();
        
        if (levelProgress.xpNeeded <= 0) {
          return 'Niveau maximum atteint';
        }
        
        // Estimer basé sur la performance récente (XP par jour)
        const avgXpPerDay = userStats.totalXp / Math.max(1, userStats.loginStreak);
        const daysToNextLevel = Math.ceil(levelProgress.xpNeeded / Math.max(1, avgXpPerDay));
        
        if (daysToNextLevel <= 1) return '1 jour';
        if (daysToNextLevel <= 7) return `${daysToNextLevel} jours`;
        if (daysToNextLevel <= 30) return `${Math.ceil(daysToNextLevel / 7)} semaines`;
        return `${Math.ceil(daysToNextLevel / 30)} mois`;
      },

      // Obtenir les recommandations pour gagner plus d'XP
      getXpRecommendations: () => {
        const { userStats } = get();
        const recommendations = [];
        
        if (userStats.tasksCreated === 0) {
          recommendations.push({
            action: 'Créez votre première tâche',
            xp: 5,
            icon: '🎯'
          });
        }
        
        if (userStats.tasksCompleted < 5) {
          recommendations.push({
            action: 'Complétez plus de tâches',
            xp: '10-35 par tâche',
            icon: '✅'
          });
        }
        
        if (userStats.projectsCreated === 0) {
          recommendations.push({
            action: 'Créez votre premier projet',
            xp: 25,
            icon: '📁'
          });
        }
        
        if (userStats.loginStreak < 7) {
          recommendations.push({
            action: 'Connectez-vous quotidiennement',
            xp: '5 par jour + bonus série',
            icon: '🔥'
          });
        }
        
        return recommendations;
      }
    }),
    {
      name: 'game-store'
    }
  )
);

export default useGameStore;
