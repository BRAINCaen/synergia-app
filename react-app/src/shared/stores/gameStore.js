// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store de gamification SIMPLIFIÉ - Avec export window
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // État de base
      userStats: {
        level: 2,
        totalXp: 175,
        currentXp: 75,
        badges: [],
        tasksCompleted: 12,
        loginStreak: 3
      },
      leaderboard: [],
      notifications: [],
      loading: false,
      error: null,

      // ✅ Méthodes sécurisées qui ne causent pas d'erreur
      initializeGameStore: async (userId) => {
        console.log('🎮 Initialisation GameStore pour:', userId);
        try {
          set({ loading: true, error: null });
          
          // Simuler des données par défaut en attendant la vraie intégration
          const defaultStats = {
            level: 2,
            totalXp: 175,
            currentXp: 75,
            badges: ['welcome', 'first_task'],
            tasksCompleted: 12,
            loginStreak: 3,
            lastLoginDate: new Date().toISOString()
          };

          set({ 
            userStats: defaultStats,
            loading: false 
          });
          
          console.log('✅ GameStore initialisé avec données par défaut');
          return true;
        } catch (error) {
          console.error('❌ Erreur initialisation GameStore:', error);
          set({ error: error.message, loading: false });
          return false;
        }
      },

      // Nettoyer les données
      cleanup: () => {
        console.log('🧹 Nettoyage GameStore...');
        set({ 
          userStats: null,
          leaderboard: [],
          notifications: [],
          error: null
        });
        console.log('✅ GameStore nettoyé');
      },

      // Ajouter de l'XP (version sécurisée)
      addXP: async (amount, reason = 'Activité') => {
        try {
          console.log('🎯 Ajout XP:', { amount, reason });
          
          const { userStats } = get();
          if (!userStats) {
            console.warn('⚠️ Aucun userStats disponible');
            return { success: false, error: 'Pas de stats utilisateur' };
          }

          const newTotalXp = (userStats.totalXp || 0) + amount;
          const newLevel = Math.floor(newTotalXp / 100) + 1;
          const leveledUp = newLevel > (userStats.level || 1);

          const updatedStats = {
            ...userStats,
            totalXp: newTotalXp,
            currentXp: newTotalXp % 100,
            level: newLevel
          };

          set({ userStats: updatedStats });

          // Ajouter notification si level up
          if (leveledUp) {
            const { notifications } = get();
            const newNotification = {
              id: Date.now(),
              type: 'levelUp',
              title: 'Niveau supérieur !',
              message: `Félicitations ! Vous êtes maintenant niveau ${newLevel}`,
              timestamp: new Date().toISOString()
            };

            set({ 
              notifications: [newNotification, ...notifications].slice(0, 10) 
            });
          }

          return { 
            success: true, 
            newXp: newTotalXp,
            newLevel,
            leveledUp 
          };
        } catch (error) {
          console.error('❌ Erreur addXP:', error);
          return { success: false, error: error.message };
        }
      },

      // Compléter une tâche
      completeTask: async (taskId, xpAmount = 10) => {
        try {
          const { userStats } = get();
          if (!userStats) return { success: false, error: 'Pas de stats utilisateur' };

          const updatedStats = {
            ...userStats,
            tasksCompleted: (userStats.tasksCompleted || 0) + 1
          };

          set({ userStats: updatedStats });
          
          // Ajouter l'XP pour la tâche
          return await get().addXP(xpAmount, 'Tâche complétée');
        } catch (error) {
          console.error('❌ Erreur completion tâche:', error);
          return { success: false, error: error.message };
        }
      },

      // Charger le leaderboard (version mock)
      loadLeaderboard: async () => {
        try {
          set({ loading: true });
          
          // Données mock pour le leaderboard
          const mockLeaderboard = [
            { uid: '1', displayName: 'Alice Martin', totalXp: 350, level: 4, tasksCompleted: 25 },
            { uid: '2', displayName: 'Bob Dupont', totalXp: 280, level: 3, tasksCompleted: 20 },
            { uid: 'current', displayName: 'Vous', totalXp: 175, level: 2, tasksCompleted: 12 },
            { uid: '4', displayName: 'Claire Roussel', totalXp: 150, level: 2, tasksCompleted: 10 }
          ];

          set({ leaderboard: mockLeaderboard, loading: false });
          console.log('✅ Leaderboard chargé (données mock)');
        } catch (error) {
          console.error('❌ Erreur chargement leaderboard:', error);
          set({ loading: false, error: error.message });
        }
      },

      // Obtenir le rang d'un utilisateur
      getUserRank: (userId) => {
        const { leaderboard } = get();
        const userIndex = leaderboard.findIndex(user => user.uid === userId);
        return userIndex !== -1 ? userIndex + 1 : null;
      },

      // Obtenir les statistiques utilisateur
      getUserStats: () => get().userStats,

      // Obtenir le progrès vers le niveau suivant
      getLevelProgress: () => {
        const { userStats } = get();
        if (!userStats) return 0;
        
        const currentLevel = userStats.level || 1;
        const totalXp = userStats.totalXp || 0;
        const currentLevelXp = (currentLevel - 1) * 100;
        const nextLevelXp = currentLevel * 100;
        const progressXp = totalXp - currentLevelXp;
        const neededXp = nextLevelXp - currentLevelXp;
        
        return Math.min(100, Math.max(0, (progressXp / neededXp) * 100));
      },

      // Marquer les notifications comme lues
      markNotificationsAsRead: () => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notif => ({ 
          ...notif, 
          read: true 
        }));
        set({ notifications: updatedNotifications });
      },

      // Supprimer une notification
      removeNotification: (notificationId) => {
        const { notifications } = get();
        const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
        set({ notifications: updatedNotifications });
      },

      // Connexion quotidienne
      dailyLogin: async () => {
        try {
          const { userStats } = get();
          if (!userStats) return { success: false, error: 'Pas de stats utilisateur' };

          const today = new Date().toDateString();
          const lastLogin = userStats.lastLoginDate ? new Date(userStats.lastLoginDate).toDateString() : null;
          
          if (lastLogin !== today) {
            const newStreak = lastLogin === new Date(Date.now() - 24*60*60*1000).toDateString() 
              ? (userStats.loginStreak || 0) + 1 
              : 1;

            const updatedStats = {
              ...userStats,
              loginStreak: newStreak,
              lastLoginDate: new Date().toISOString()
            };

            set({ userStats: updatedStats });

            // Bonus XP pour connexion quotidienne
            await get().addXP(5, 'Connexion quotidienne');

            return { success: true, newStreak, bonusXp: 5 };
          }

          return { success: true, message: 'Déjà connecté aujourd\'hui' };
        } catch (error) {
          console.error('❌ Erreur connexion quotidienne:', error);
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        userStats: state.userStats,
        leaderboard: state.leaderboard,
        notifications: state.notifications
      })
    }
  )
);

// Export par défaut pour compatibility
export default useGameStore;
