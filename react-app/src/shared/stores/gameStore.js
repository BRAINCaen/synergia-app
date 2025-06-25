// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// Store de gamification corrigé avec exports cohérents
// ==========================================

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
          console.log('🎮 Initialisation données gamification pour:', userId);

          // ✅ Vérifier si gamificationService existe et a les bonnes méthodes
          if (!gamificationService) {
            throw new Error('gamificationService non disponible');
          }

          // ✅ Essayer d'abord initializeUserData si elle existe
          if (typeof gamificationService.initializeUserData === 'function') {
            await gamificationService.initializeUserData(userId);
          } else if (typeof gamificationService.getUserGameData === 'function') {
            // Fallback vers getUserGameData
            const userData = await gamificationService.getUserGameData(userId);
            set({ userStats: userData });
          } else {
            console.warn('⚠️ Aucune méthode d\'initialisation disponible dans gamificationService');
          }

          // ✅ S'abonner aux changements des stats si la méthode existe
          if (typeof gamificationService.subscribeToUserData === 'function') {
            const unsubscribe = gamificationService.subscribeToUserData(
              userId,
              (stats) => {
                set({ userStats: stats });
                console.log('📊 Statistiques synchronisées:', stats);
              }
            );
            set({ unsubscribe });
          }

          set({ loading: false });
          console.log('🎮 GameStore initialisé avec succès pour:', userId);
        } catch (error) {
          console.error('❌ Erreur initialisation GameStore:', error);
          set({ error: error.message, loading: false });
        }
      },

      // Nettoyer l'abonnement
      cleanup: () => {
        console.log('🧹 Nettoyage GameStore...');
        const { unsubscribe } = get();
        if (unsubscribe && typeof unsubscribe === 'function') {
          try {
            unsubscribe();
            console.log('✅ Désabonnement GameStore réussi');
          } catch (error) {
            console.warn('⚠️ Erreur lors du désabonnement GameStore:', error);
          }
        }
        
        set({ 
          unsubscribe: null,
          userStats: null,
          leaderboard: [],
          notifications: [],
          error: null
        });
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

          // Vérifier que gamificationService existe et a la méthode addXP
          if (!gamificationService || typeof gamificationService.addXP !== 'function') {
            console.warn('⚠️ gamificationService.addXP non disponible');
            return { success: false, error: 'Service non disponible' };
          }

          const result = await gamificationService.addXP(userId, amount, reason);
          
          // Ajouter une notification si niveau up ou nouveaux badges
          const notifications = [];
          
          if (result.leveledUp) {
            notifications.push({
              id: Date.now() + '_levelup',
              type: 'levelUp',
              title: 'Niveau supérieur !',
              message: `Félicitations ! Vous êtes maintenant niveau ${result.newLevel}`,
              timestamp: new Date().toISOString()
            });
          }

          if (result.newBadges && result.newBadges.length > 0) {
            result.newBadges.forEach(badge => {
              notifications.push({
                id: Date.now() + '_badge_' + badge.id,
                type: 'newBadge',
                title: 'Nouveau badge !',
                message: `Vous avez débloqué : ${badge.name}`,
                badge: badge,
                timestamp: new Date().toISOString()
              });
            });
          }

          // Ajouter les notifications au store
          if (notifications.length > 0) {
            const currentNotifications = get().notifications;
            set({ 
              notifications: [...notifications, ...currentNotifications].slice(0, 50) // Garder max 50 notifications
            });
          }

          return { success: true, ...result };
        } catch (error) {
          console.error('❌ Erreur addXP:', error);
          return { success: false, error: error.message };
        }
      },

      // Marquer une tâche comme complétée (avec XP)
      completeTask: async (taskId, xpAmount = 10) => {
        try {
          const { useAuthStore } = await import('./authStore.js');
          const authState = useAuthStore.getState();
          
          if (!authState.user?.uid) {
            throw new Error('Utilisateur non connecté');
          }

          // Vérifier que gamificationService existe et a la méthode completeTask
          if (!gamificationService || typeof gamificationService.completeTask !== 'function') {
            console.warn('⚠️ gamificationService.completeTask non disponible');
            return await get().addXP(xpAmount, 'Tâche complétée');
          }

          return await gamificationService.completeTask(authState.user.uid, taskId, xpAmount);
        } catch (error) {
          console.error('❌ Erreur completion tâche:', error);
          return { success: false, error: error.message };
        }
      },

      // Charger le leaderboard
      loadLeaderboard: async () => {
        try {
          set({ loading: true });
          
          // Vérifier que gamificationService existe
          if (!gamificationService || typeof gamificationService.getLeaderboard !== 'function') {
            console.warn('⚠️ gamificationService.getLeaderboard non disponible');
            set({ loading: false });
            return;
          }

          const leaderboard = await gamificationService.getLeaderboard();
          set({ leaderboard, loading: false });
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

      // Obtenir les statistiques utilisateur
      getUserStats: () => get().userStats,

      // Vérifier si l'utilisateur peut monter de niveau
      canLevelUp: () => {
        const { userStats } = get();
        if (!userStats) return false;
        
        const xpNeeded = userStats.level * 100; // 100 XP par niveau
        return userStats.totalXp >= xpNeeded;
      },

      // Connexion quotidienne (bonus)
      dailyLogin: async () => {
        try {
          const { useAuthStore } = await import('./authStore.js');
          const authState = useAuthStore.getState();
          
          if (!authState.user?.uid) {
            throw new Error('Utilisateur non connecté');
          }

          // Vérifier que gamificationService existe
          if (!gamificationService || typeof gamificationService.dailyLogin !== 'function') {
            console.warn('⚠️ gamificationService.dailyLogin non disponible');
            return { success: false, error: 'Service non disponible' };
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

// ✅ EXPORT PAR DÉFAUT pour compatibility
export default useGameStore;
