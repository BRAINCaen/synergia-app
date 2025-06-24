// react-app/src/shared/stores/gameStore.js
// Store de gamification corrigé avec bonnes méthodes

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { gamificationService } from '../../core/services/gamificationService.js'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // État
      userStats: null,
      leaderboard: [],
      notifications: [],
      loading: false,
      error: null,
      unsubscribe: null,

      // ✅ CORRIGÉ: Initialiser le store avec userId
      initializeGameStore: async (userId) => {
        if (!userId) {
          console.error('❌ Aucun userId fourni pour initializeGameStore');
          return;
        }

        try {
          set({ loading: true, error: null });
          console.log('🎮 Initialisation GameStore pour:', userId);

          // ✅ Utiliser la bonne méthode qui existe
          await gamificationService.initializeUserData(userId);

          // ✅ S'abonner aux changements des stats avec la bonne méthode
          const unsubscribe = gamificationService.subscribeToUserData(
            userId,
            (stats) => {
              set({ userStats: stats });
              console.log('📊 Statistiques synchronisées:', stats);
            }
          );

          set({ unsubscribe, loading: false });
          return unsubscribe;
        } catch (error) {
          console.error('❌ Erreur initialisation GameStore:', error);
          set({ error: error.message, loading: false });
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

      // ✅ FONCTION ADDXP CORRIGÉE - Auto-détection userId depuis authStore
      addXP: async (amount, reason = 'Activité') => {
        try {
          // Importer authStore dynamiquement pour éviter les imports circulaires
          const { useAuthStore } = await import('./authStore.js');
          const authState = useAuthStore.getState();
          
          if (!authState.user?.uid) {
            console.error('❌ Aucun utilisateur connecté pour addXP');
            throw new Error('Utilisateur non connecté');
          }

          const userId = authState.user.uid;
          console.log('🎯 Ajout XP:', { userId, amount, reason });

          const result = await gamificationService.addXP(userId, amount, reason);
          
          // Ajouter une notification si niveau up ou nouveaux badges
          const notifications = [];
          
          if (result.leveledUp) {
            notifications.push({
              id: Date.now() + '_levelup',
              type: 'levelUp',
              title: 'Niveau supérieur !',
              message: `Félicitations ! Vous êtes maintenant niveau ${result.newLevel}`,
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
                message: `Vous avez débloqué : ${badge.name}`,
                icon: badge.icon,
                timestamp: new Date()
              });
            });
          }
          
          // Ajouter les notifications au store
          if (notifications.length > 0) {
            set(state => ({
              notifications: [...state.notifications, ...notifications]
            }));
          }
          
          console.log('✅ XP ajouté avec succès:', result);
          return result;
        } catch (error) {
          console.error('❌ Erreur ajout XP:', error);
          set({ error: error.message });
          throw error;
        }
      },

      // Charger le leaderboard
      loadLeaderboard: async () => {
        try {
          set({ loading: true });
          const leaderboard = await gamificationService.getLeaderboard();
          set({ leaderboard, loading: false });
        } catch (error) {
          console.error('❌ Erreur chargement leaderboard:', error);
          set({ error: error.message, loading: false });
        }
      },

      // Marquer une notification comme lue
      markNotificationAsRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        }));
      },

      // Supprimer toutes les notifications
      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Calculer le niveau actuel
      getCurrentLevel: () => {
        const { userStats } = get();
        if (!userStats) return 1;
        return userStats.level || gamificationService.calculateLevel(userStats.totalXp || 0);
      },

      // ✅ CORRIGÉ: Calculer les progrès vers le niveau suivant
      getLevelProgress: () => {
        const { userStats } = get();
        if (!userStats) return { current: 0, needed: 100, percentage: 0, remaining: 100 };
        
        // Si les données sont déjà calculées dans userStats
        if (userStats.levelProgress) {
          return userStats.levelProgress;
        }

        // Sinon calculer manuellement avec la méthode corrigée
        const currentLevel = userStats.level || 1;
        const totalXp = userStats.totalXp || 0;
        
        // ✅ CORRECTION: Utiliser la bonne méthode qui existe maintenant
        return gamificationService.calculateLevelProgress(totalXp, currentLevel);
      },

      // Obtenir les badges débloqués
      getUnlockedBadges: () => {
        const { userStats } = get();
        if (!userStats) return [];
        return userStats.badges || [];
      },

      // Obtenir les badges disponibles
      getAvailableBadges: () => {
        return gamificationService.getAllBadges();
      },

      // Calculer les insights utilisateur
      getUserInsights: () => {
        const { userStats } = get();
        if (!userStats) return null;

        return {
          productivity: {
            score: Math.min(100, Math.round((userStats.tasksCompleted / Math.max(1, userStats.tasksCreated)) * 100)),
            label: userStats.tasksCompleted >= userStats.tasksCreated * 0.8 ? 'Excellent' : 
                   userStats.tasksCompleted >= userStats.tasksCreated * 0.6 ? 'Bon' : 'À améliorer'
          },
          consistency: {
            score: Math.min(100, (userStats.loginStreak || 0) * 10),
            label: userStats.loginStreak >= 7 ? 'Très régulier' : 
                   userStats.loginStreak >= 3 ? 'Régulier' : 'Irrégulier'
          },
          engagement: {
            score: Math.min(100, Math.round(((userStats.totalXp || 0) / 500) * 100)),
            label: userStats.totalXp >= 500 ? 'Très engagé' : 
                   userStats.totalXp >= 200 ? 'Engagé' : 'Débutant'
          }
        };
      },

      // Obtenir le rang d'un utilisateur
      getUserRank: async (userId) => {
        try {
          const { leaderboard } = get();
          if (!leaderboard.length) {
            await get().loadLeaderboard();
          }
          
          const userIndex = leaderboard.findIndex(user => user.userId === userId);
          return userIndex !== -1 ? userIndex + 1 : null;
        } catch (error) {
          console.error('❌ Erreur récupération rang:', error);
          return null;
        }
      },

      // Prédire le temps pour atteindre le niveau suivant
      predictTimeToNextLevel: () => {
        const { userStats } = get();
        if (!userStats) return null;

        const currentLevel = userStats.level || 1;
        const totalXp = userStats.totalXp || 0;
        const levelProgress = get().getLevelProgress();
        
        // Calculer l'XP moyen par jour (basé sur les 7 derniers jours)
        const dailyXpAverage = userStats.weeklyXp ? userStats.weeklyXp / 7 : 10;
        
        if (dailyXpAverage <= 0) return null;
        
        const daysToNextLevel = Math.ceil(levelProgress.remaining / dailyXpAverage);
        
        return {
          days: daysToNextLevel,
          dailyXpNeeded: Math.ceil(levelProgress.remaining / Math.max(1, daysToNextLevel)),
          estimatedDate: new Date(Date.now() + (daysToNextLevel * 24 * 60 * 60 * 1000))
        };
      },

      // Obtenir des recommandations XP
      getXpRecommendations: () => {
        const { userStats } = get();
        if (!userStats) return [];

        const recommendations = [];
        
        if ((userStats.loginStreak || 0) === 0) {
          recommendations.push({
            action: 'Connectez-vous quotidiennement',
            xp: '5 XP par jour + bonus série',
            icon: '🔥'
          });
        }
        
        if ((userStats.tasksCompleted || 0) < 5) {
          recommendations.push({
            action: 'Complétez plus de tâches',
            xp: '10-35 par tâche',
            icon: '✅'
          });
        }
        
        if ((userStats.projectsCreated || 0) === 0) {
          recommendations.push({
            action: 'Créez votre premier projet',
            xp: 25,
            icon: '📁'
          });
        }
        
        if ((userStats.loginStreak || 0) < 7) {
          recommendations.push({
            action: 'Connectez-vous quotidiennement',
            xp: '5 par jour + bonus série',
            icon: '🔥'
          });
        }
        
        return recommendations;
      },

      // Actions rapides pour les tâches
      taskCompleted: async (difficulty = 'medium') => {
        try {
          const { useAuthStore } = await import('./authStore.js');
          const authState = useAuthStore.getState();
          
          if (!authState.user?.uid) {
            throw new Error('Utilisateur non connecté');
          }

          return await gamificationService.completeTask(authState.user.uid, difficulty);
        } catch (error) {
          console.error('❌ Erreur completion tâche:', error);
          return { success: false, error: error.message };
        }
      },

      taskCreated: async () => {
        try {
          const { useAuthStore } = await import('./authStore.js');
          const authState = useAuthStore.getState();
          
          if (!authState.user?.uid) {
            throw new Error('Utilisateur non connecté');
          }

          return await gamificationService.createProject(authState.user.uid);
        } catch (error) {
          console.error('❌ Erreur création tâche:', error);
          return { success: false, error: error.message };
        }
      },

      dailyLogin: async () => {
        try {
          const { useAuthStore } = await import('./authStore.js');
          const authState = useAuthStore.getState();
          
          if (!authState.user?.uid) {
            throw new Error('Utilisateur non connecté');
          }

          return await gamificationService.dailyLogin(authState.user.uid);
        } catch (error) {
          console.error('❌ Erreur connexion quotidienne:', error);
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'game-store',
      // Ne pas persister les fonctions et listeners
      partialize: (state) => ({
        userStats: state.userStats,
        leaderboard: state.leaderboard,
        notifications: state.notifications
      })
    }
  )
);

export default useGameStore;
