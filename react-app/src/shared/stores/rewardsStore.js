// ==========================================
// 📁 react-app/src/shared/stores/rewardsStore.js
// STORE ZUSTAND POUR LA GESTION DES RÉCOMPENSES
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import rewardsService from '../../core/services/rewardsService.js';

/**
 * 🎁 STORE ZUSTAND POUR LES RÉCOMPENSES
 */
const useRewardsStore = create(
  persist(
    (set, get) => ({
      // 📊 ÉTAT INITIAL
      availableRewards: [],
      teamRewards: [],
      userRewardHistory: [],
      pendingRequests: [],
      userXP: 0,
      teamTotalXP: 0,
      loading: false,
      error: null,
      lastUpdate: null,

      // 🎯 ACTIONS PRINCIPALES

      /**
       * 📥 CHARGER LES RÉCOMPENSES DISPONIBLES POUR L'UTILISATEUR
       */
      loadAvailableRewards: async (userXP) => {
        try {
          set({ loading: true, error: null });
          
          const availableRewards = rewardsService.getAvailableRewardsForUser(userXP);
          
          set({ 
            availableRewards,
            userXP,
            loading: false,
            lastUpdate: new Date().toISOString()
          });
          
          console.log('✅ Récompenses disponibles chargées:', availableRewards.length);
          return availableRewards;
        } catch (error) {
          console.error('❌ Erreur chargement récompenses:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      /**
       * 👥 CHARGER LES RÉCOMPENSES D'ÉQUIPE
       */
      loadTeamRewards: async (teamTotalXP) => {
        try {
          set({ loading: true, error: null });
          
          const teamRewards = rewardsService.getAvailableTeamRewards(teamTotalXP);
          
          set({ 
            teamRewards,
            teamTotalXP,
            loading: false,
            lastUpdate: new Date().toISOString()
          });
          
          console.log('✅ Récompenses d\'équipe chargées:', teamRewards.length);
          return teamRewards;
        } catch (error) {
          console.error('❌ Erreur chargement récompenses équipe:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      /**
       * 🎁 DEMANDER UNE RÉCOMPENSE
       */
      requestReward: async (userId, rewardId, rewardType = 'individual') => {
        try {
          set({ loading: true, error: null });
          
          const result = await rewardsService.requestReward(userId, rewardId, rewardType);
          
          // Recharger l'historique
          get().loadUserRewardHistory(userId);
          
          set({ loading: false });
          
          console.log('✅ Demande de récompense envoyée');
          return result;
        } catch (error) {
          console.error('❌ Erreur demande récompense:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      /**
       * 📈 CHARGER L'HISTORIQUE DES RÉCOMPENSES DE L'UTILISATEUR
       */
      loadUserRewardHistory: async (userId) => {
        try {
          const history = await rewardsService.getUserRewardHistory(userId);
          
          set({ 
            userRewardHistory: history,
            lastUpdate: new Date().toISOString()
          });
          
          console.log('✅ Historique récompenses chargé:', history.length);
          return history;
        } catch (error) {
          console.error('❌ Erreur chargement historique:', error);
          set({ error: error.message });
          throw error;
        }
      },

      /**
       * 👑 CHARGER LES DEMANDES EN ATTENTE (ADMIN)
       */
      loadPendingRequests: async () => {
        try {
          set({ loading: true, error: null });
          
          const requests = await rewardsService.getPendingRewardRequests();
          
          set({ 
            pendingRequests: requests,
            loading: false,
            lastUpdate: new Date().toISOString()
          });
          
          console.log('✅ Demandes en attente chargées:', requests.length);
          return requests;
        } catch (error) {
          console.error('❌ Erreur chargement demandes:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      /**
       * ✅ APPROUVER UNE DEMANDE (ADMIN)
       */
      approveRequest: async (requestId, adminId, userCurrentXP) => {
        try {
          set({ loading: true, error: null });
          
          const result = await rewardsService.approveRewardRequest(requestId, adminId, userCurrentXP);
          
          // Recharger les demandes en attente
          get().loadPendingRequests();
          
          set({ loading: false });
          
          console.log('✅ Demande approuvée');
          return result;
        } catch (error) {
          console.error('❌ Erreur approbation:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      /**
       * ❌ REJETER UNE DEMANDE (ADMIN)
       */
      rejectRequest: async (requestId, adminId, reason) => {
        try {
          set({ loading: true, error: null });
          
          const result = await rewardsService.rejectRewardRequest(requestId, adminId, reason);
          
          // Recharger les demandes en attente
          get().loadPendingRequests();
          
          set({ loading: false });
          
          console.log('✅ Demande rejetée');
          return result;
        } catch (error) {
          console.error('❌ Erreur rejet:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      /**
       * 🔄 ÉCOUTER LES DEMANDES EN TEMPS RÉEL (ADMIN)
       */
      startListeningToPendingRequests: () => {
        try {
          const unsubscribe = rewardsService.listenToPendingRequests((requests) => {
            set({ 
              pendingRequests: requests,
              lastUpdate: new Date().toISOString()
            });
          });
          
          // Stocker l'unsubscribe pour le cleanup
          set({ pendingRequestsListener: unsubscribe });
          
          console.log('🔄 Écoute des demandes en temps réel activée');
          return unsubscribe;
        } catch (error) {
          console.error('❌ Erreur écoute temps réel:', error);
          set({ error: error.message });
        }
      },

      /**
       * 🛑 ARRÊTER L'ÉCOUTE EN TEMPS RÉEL
       */
      stopListeningToPendingRequests: () => {
        const { pendingRequestsListener } = get();
        if (pendingRequestsListener && typeof pendingRequestsListener === 'function') {
          pendingRequestsListener();
          set({ pendingRequestsListener: null });
          console.log('🛑 Écoute des demandes arrêtée');
        }
      },

      // 🎯 GETTERS UTILES

      /**
       * 🏆 OBTENIR LES RÉCOMPENSES PAR CATÉGORIE
       */
      getRewardsByCategory: (category) => {
        const { availableRewards } = get();
        return availableRewards.find(cat => cat.category === category) || null;
      },

      /**
       * 💰 VÉRIFIER SI L'UTILISATEUR PEUT S'OFFRIR UNE RÉCOMPENSE
       */
      canAffordReward: (rewardCost) => {
        const { userXP } = get();
        return userXP >= rewardCost;
      },

      /**
       * 📊 OBTENIR LES STATISTIQUES DES RÉCOMPENSES
       */
      getRewardStats: () => {
        const { userRewardHistory, availableRewards } = get();
        
        const totalRedeemed = userRewardHistory.filter(r => r.status === 'approved').length;
        const totalPending = userRewardHistory.filter(r => r.status === 'pending').length;
        const totalRejected = userRewardHistory.filter(r => r.status === 'rejected').length;
        const totalAvailable = availableRewards.reduce((sum, cat) => sum + cat.rewards.length, 0);
        
        return {
          totalRedeemed,
          totalPending,
          totalRejected,
          totalAvailable
        };
      },

      /**
       * 🎯 OBTENIR LA PROCHAINE RÉCOMPENSE ACCESSIBLE
       */
      getNextReward: () => {
        const { userXP } = get();
        const allRewards = rewardsService.getIndividualRewards();
        
        let nextReward = null;
        let minDifference = Infinity;
        
        Object.values(allRewards).forEach(category => {
          category.rewards.forEach(reward => {
            if (reward.xpCost > userXP) {
              const difference = reward.xpCost - userXP;
              if (difference < minDifference) {
                minDifference = difference;
                nextReward = {
                  ...reward,
                  category: category.category,
                  xpNeeded: difference
                };
              }
            }
          });
        });
        
        return nextReward;
      },

      // 🧹 ACTIONS DE NETTOYAGE

      /**
       * 🔄 RÉINITIALISER LE STORE
       */
      resetStore: () => {
        const { pendingRequestsListener } = get();
        
        // Arrêter l'écoute en temps réel si active
        if (pendingRequestsListener && typeof pendingRequestsListener === 'function') {
          pendingRequestsListener();
        }
        
        set({
          availableRewards: [],
          teamRewards: [],
          userRewardHistory: [],
          pendingRequests: [],
          userXP: 0,
          teamTotalXP: 0,
          loading: false,
          error: null,
          lastUpdate: null,
          pendingRequestsListener: null
        });
        
        console.log('🔄 Store des récompenses réinitialisé');
      },

      /**
       * ❌ NETTOYER LES ERREURS
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'rewards-store',
      // Ne pas persister les listeners et les états temporaires
      partialize: (state) => ({
        userXP: state.userXP,
        teamTotalXP: state.teamTotalXP,
        lastUpdate: state.lastUpdate
      })
    }
  )
);

export { useRewardsStore };
export default useRewardsStore;
