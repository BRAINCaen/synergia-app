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

      // ✅ CORRIGÉ: Initialiser les statistiques utilisateur
      initializeUser: async (userId, userEmail) => {
        set({ loading: true, error: null });

        try {
          // ✅ Utiliser la méthode qui existe vraiment
          const stats = await gamificationService.initializeUserData(userId);
          set({ userStats: stats, loading: false });
          
          // ✅ Connecter l'utilisateur (connexion quotidienne)
          await gamificationService.dailyLogin(userId);
          
          console.log('✅ Statistiques utilisateur initialisées');
          return { success: true, stats };
        } catch (error) {
          console.error('❌ Erreur initialisation utilisateur:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // ✅ CORRIGÉ: Initialiser l'écoute en temps réel des statistiques
      initializeStatsSync: (userId) => {
        const { unsubscribe: currentUnsubscribe } = get();
        
        // Nettoyer l'ancien abonnement s'il existe
        if (currentUnsubscribe) {
          currentUnsubscribe();
        }

        try {
          // ✅ Utiliser la méthode qui existe vraiment
          const unsubscribe = gamificationService.subscribeToUserData(
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

      // ✅ CORRIGÉ: Ajouter des points XP avec validation
      addXP: async (amount, reason = 'Activité') => {
        try {
          // ✅ Récupérer l'userId depuis authStore ou autre source
          // Pour l'instant, on va récupérer l'ID depuis le contexte auth
          const authStore = window?.authStore || {};
          const userId = authStore.user?.uid;
          
          if (!userId) {
            console.error('❌ Aucun utilisateur connecté pour addXP');
            return { success: false, error: 'Utilisateur non connecté' };
          }

          // ✅ Validation stricte de l'ID utilisateur
          const validUserId = String(userId);
          console.log('🔧 AddXP appelé avec userId:', validUserId, 'amount:', amount, 'reason:', reason);
          
          const result = await gamificationService.addXP(validUserId, amount, reason);
          
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

      // ✅ CORRIGÉ: Charger le leaderboard
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

      // ✅ CORRIGÉ: Obtenir les statistiques utilisateur
      getUserStats: async (userId) => {
        set({ loading: true, error: null });

        try {
          const stats = await gamificationService.getUserData(userId);
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

      // ✅ CORRIGÉ: Mettre à jour les statistiques de tâche
      updateTaskStats: async (userId, action) => {
        try {
          if (action === 'completed') {
            await gamificationService.completeTask(userId, 'normal');
          }
          console.log(`✅ Stats tâche mises à jour: ${action}`);
        } catch (error) {
          console.error('❌ Erreur mise à jour stats tâche:', error);
        }
      },

      // ✅ CORRIGÉ: Vérifier les nouveaux badges
      checkForNewBadges: async (userId) => {
        try {
          const newBadges = await gamificationService.checkAndUnlockBadges(userId);
          
          if (newBadges.length > 0) {
            const notifications = newBadges.map(badgeId => ({
              id: Date.now() + '_badge_' + badgeId,
              type: 'badge',
              title: 'Nouveau badge !',
              message: `Vous avez débloqué un nouveau badge !`,
              icon: '🏆',
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

      // ✅ CORRIGÉ: Obtenir les badges disponibles
      getAvailableBadges: () => {
        const { userStats } = get();
        const userBadgeIds = userStats.badges || [];
        
        // Badges basiques disponibles
        const availableBadges = [
          { id: 'first_task', name: 'Première Tâche', icon: '🎯', unlocked: userBadgeIds.includes('first_task') },
          { id: 'task_master', name: 'Maître des Tâches', icon: '🏆', unlocked: userBadgeIds.includes('task_master') },
          { id: 'level_master', name: 'Maître du Niveau', icon: '⭐', unlocked: userBadgeIds.includes('level_master') },
          { id: 'streak_warrior', name: 'Guerrier de la Série', icon: '🔥', unlocked: userBadgeIds.includes('streak_warrior') }
        ];
        
        return availableBadges;
      },

      // ✅ CORRIGÉ: Calculer la progression vers le niveau suivant
      getLevelProgress: () => {
        const { userStats } = get();
        const currentLevel = userStats.level || 1;
        const currentXp = userStats.totalXp || 0;
        const nextLevelXp = gamificationService.getXPForNextLevel(currentLevel);
        const currentLevelXp = currentLevel > 1 ? gamificationService.getXPForNextLevel(currentLevel - 1) : 0;
        
        const progress = Math.max(0, currentXp - currentLevelXp);
        const needed = Math.max(0, nextLevelXp - currentLevelXp);
        
        return {
          progress,
          xpNeeded: Math.max(0, nextLevelXp - currentXp),
          percentage: needed > 0 ? Math.round((progress / needed) * 100) : 100
        };
      },

      // ✅ CORRIGÉ: Obtenir les informations de niveau
      getLevelInfo: (level) => {
        const targetLevel = level || get().userStats.level || 1;
        
        const levelNames = {
          1: { name: 'Novice', color: '#9CA3AF' },
          2: { name: 'Apprenti', color: '#6366F1' },
          3: { name: 'Compétent', color: '#8B5CF6' },
          4: { name: 'Expert', color: '#EC4899' },
          5: { name: 'Maître', color: '#F59E0B' }
        };
        
        return levelNames[targetLevel] || { name: 'Légendaire', color: '#EF4444' };
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
            score: Math.min(100, (userStats.loginStreak || 0) * 10),
            label: (userStats.loginStreak || 0) >= 7 ? 'Très régulier' :
                   (userStats.loginStreak || 0) >= 3 ? 'Régulier' :
                   (userStats.loginStreak || 0) >= 1 ? 'Occasionnel' : 'Irrégulier'
          },
          engagement: {
            score: Math.min(100, Math.round(((userStats.badges?.length || 0) / 8) * 100)),
            label: (userStats.badges?.length || 0) >= 6 ? 'Très engagé' :
                   (userStats.badges?.length || 0) >= 3 ? 'Engagé' :
                   (userStats.badges?.length || 0) >= 1 ? 'Actif' : 'Débutant'
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
        const avgXpPerDay = (userStats.totalXp || 0) / Math.max(1, (userStats.loginStreak || 1));
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
        
        if ((userStats.tasksCreated || 0) === 0) {
          recommendations.push({
            action: 'Créez votre première tâche',
            xp: 5,
            icon: '🎯'
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
      }
    }),
    {
      name: 'game-store'
    }
  )
);

export default useGameStore;
