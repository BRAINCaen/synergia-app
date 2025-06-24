// src/shared/stores/gameStore.js
// Store de gamification complet avec gestion automatique userId
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

      // Initialiser le store avec un userId
      initializeGameStore: async (userId) => {
        if (!userId) {
          console.error('❌ Aucun userId fourni pour initializeGameStore');
          return;
        }

        try {
          set({ loading: true, error: null });
          console.log('🎮 Initialisation GameStore pour:', userId);

          // Initialiser les stats utilisateur s'il n'en a pas
          await gamificationService.initializeUserStats(userId);

          // S'abonner aux changements des stats
          const unsubscribe = gamificationService.subscribeToUserStats(
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
        return gamificationService.calculateLevel(userStats.totalXp);
      },

      // Calculer les progrès vers le niveau suivant
      getLevelProgress: () => {
        const { userStats } = get();
        if (!userStats) return { current: 0, needed: 100, percentage: 0 };
        
        const currentLevel = gamificationService.calculateLevel(userStats.totalXp);
        const xpForCurrentLevel = gamificationService.getXpForLevel(currentLevel);
        const xpForNextLevel = gamificationService.getXpForLevel(currentLevel + 1);
        
        const currentLevelXp = userStats.totalXp - xpForCurrentLevel;
        const neededForNext = xpForNextLevel - xpForCurrentLevel;
        
        return {
          current: currentLevelXp,
          needed: neededForNext,
          remaining: Math.max(0, xpForNextLevel - userStats.totalXp),
          percentage: Math.round((currentLevelXp / neededForNext) * 100)
        };
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
            label: userStats.tasksCompleted >= userStats.tasksCreated * 0.8 ? 'Très productif' :
                   userStats.tasksCompleted >= userStats.tasksCreated * 0.6 ? 'Productif' :
                   userStats.tasksCompleted >= userStats.tasksCreated * 0.3 ? 'Modéré' : 'À améliorer'
          },
          consistency: {
            score: Math.min(100, userStats.loginStreak * 10),
            label: userStats.loginStreak >= 10 ? 'Très régulier' :
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
        
        if (levelProgress.remaining <= 0) {
          return 'Niveau maximum atteint';
        }
        
        // Estimer basé sur la performance récente (XP par jour)
        const avgXpPerDay = userStats.totalXp / Math.max(1, userStats.loginStreak);
        const daysToNextLevel = Math.ceil(levelProgress.remaining / Math.max(1, avgXpPerDay));
        
        if (daysToNextLevel <= 1) return '1 jour';
        if (daysToNextLevel <= 7) return `${daysToNextLevel} jours`;
        if (daysToNextLevel <= 30) return `${Math.ceil(daysToNextLevel / 7)} semaines`;
        return `${Math.ceil(daysToNextLevel / 30)} mois`;
      },

      // Obtenir les recommandations pour gagner plus d'XP
      getXpRecommendations: () => {
        const { userStats } = get();
        if (!userStats) return [];
        
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
