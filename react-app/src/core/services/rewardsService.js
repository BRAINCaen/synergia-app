// ==========================================
// 📁 react-app/src/core/services/rewardsService.js
// SERVICE COMPLET DE GESTION DES RÉCOMPENSES
// ==========================================

import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { isAdmin } from './adminService.js';

/**
 * 🎁 SERVICE DE GESTION DES RÉCOMPENSES
 */
class RewardsService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * ✅ CRÉER UNE NOUVELLE RÉCOMPENSE (ADMIN)
   */
  async createReward(adminId, rewardData) {
    try {
      // Vérifier les permissions admin
      const hasPermission = await isAdmin({ uid: adminId });
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      // Valider les données
      const { name, description, type, value, cost, icon, requirements } = rewardData;
      
      if (!name || !description || !type || !cost) {
        throw new Error('Données incomplètes pour créer la récompense');
      }

      // Créer la récompense
      const reward = {
        name: name.trim(),
        description: description.trim(),
        type, // 'badge', 'xp', 'virtual_item', 'privilege', 'physical'
        value: value || null, // Valeur de la récompense (XP bonus, etc.)
        cost: parseInt(cost), // Coût en points/tokens
        icon: icon || '🎁',
        requirements: requirements || {}, // Prérequis pour débloquer
        isActive: true,
        isAvailable: true,
        createdBy: adminId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Statistiques
        timesRedeemed: 0,
        usersRedeemedCount: 0,
        lastRedeemedAt: null
      };

      const docRef = await addDoc(collection(db, 'rewards'), reward);
      
      console.log('✅ Récompense créée:', docRef.id);
      
      return {
        success: true,
        rewardId: docRef.id,
        reward: { id: docRef.id, ...reward }
      };

    } catch (error) {
      console.error('❌ Erreur createReward:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES RÉCOMPENSES
   */
  async getAllRewards(includeInactive = false) {
    try {
      let q = query(
        collection(db, 'rewards'),
        orderBy('createdAt', 'desc')
      );

      if (!includeInactive) {
        q = query(
          collection(db, 'rewards'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const rewards = [];

      querySnapshot.forEach((doc) => {
        rewards.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('📋 Récompenses chargées:', rewards.length);
      return rewards;

    } catch (error) {
      console.error('❌ Erreur getAllRewards:', error);
      return [];
    }
  }

  /**
   * 📋 RÉCUPÉRER LES RÉCOMPENSES DISPONIBLES (pour les utilisateurs)
   */
  async getAvailableRewards() {
    try {
      const q = query(
        collection(db, 'rewards'),
        where('isActive', '==', true),
        where('isAvailable', '==', true),
        orderBy('cost', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const rewards = [];

      querySnapshot.forEach((doc) => {
        rewards.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return rewards;

    } catch (error) {
      console.error('❌ Erreur getAvailableRewards:', error);
      return [];
    }
  }

  /**
   * ✏️ MODIFIER UNE RÉCOMPENSE (ADMIN)
   */
  async updateReward(adminId, rewardId, updates) {
    try {
      // Vérifier les permissions admin
      const hasPermission = await isAdmin({ uid: adminId });
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const rewardRef = doc(db, 'rewards', rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Récompense introuvable');
      }

      // Nettoyer les updates
      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.createdAt;
      delete cleanUpdates.createdBy;

      // Ajouter timestamp de modification
      cleanUpdates.updatedAt = serverTimestamp();
      cleanUpdates.updatedBy = adminId;

      await updateDoc(rewardRef, cleanUpdates);

      console.log('✅ Récompense mise à jour:', rewardId);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur updateReward:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE RÉCOMPENSE (ADMIN)
   */
  async deleteReward(adminId, rewardId) {
    try {
      // Vérifier les permissions admin
      const hasPermission = await isAdmin({ uid: adminId });
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const rewardRef = doc(db, 'rewards', rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Récompense introuvable');
      }

      // Vérifier s'il y a des échanges en cours
      const redemptionsQuery = query(
        collection(db, 'reward_redemptions'),
        where('rewardId', '==', rewardId),
        where('status', '==', 'pending')
      );
      
      const pendingRedemptions = await getDocs(redemptionsQuery);
      
      if (!pendingRedemptions.empty) {
        throw new Error('Impossible de supprimer: des échanges sont en cours');
      }

      await deleteDoc(rewardRef);

      console.log('✅ Récompense supprimée:', rewardId);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur deleteReward:', error);
      throw error;
    }
  }

  /**
   * 🎁 ÉCHANGER UNE RÉCOMPENSE (UTILISATEUR)
   */
  async redeemReward(userId, rewardId, userPoints) {
    try {
      const rewardRef = doc(db, 'rewards', rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Récompense introuvable');
      }

      const reward = rewardDoc.data();

      // Vérifier la disponibilité
      if (!reward.isActive || !reward.isAvailable) {
        throw new Error('Récompense non disponible');
      }

      // Vérifier les points de l'utilisateur
      if (userPoints < reward.cost) {
        throw new Error(`Points insuffisants. Requis: ${reward.cost}, Disponibles: ${userPoints}`);
      }

      // Créer la demande d'échange
      const redemption = {
        userId,
        rewardId,
        rewardName: reward.name,
        cost: reward.cost,
        type: reward.type,
        value: reward.value,
        status: 'pending', // 'pending', 'approved', 'delivered', 'rejected'
        requestedAt: serverTimestamp(),
        adminNotes: '',
        deliveredAt: null,
        processedBy: null
      };

      const redemptionRef = await addDoc(collection(db, 'reward_redemptions'), redemption);

      // Mettre à jour les statistiques de la récompense
      await updateDoc(rewardRef, {
        timesRedeemed: (reward.timesRedeemed || 0) + 1,
        lastRedeemedAt: serverTimestamp()
      });

      console.log('🎁 Échange demandé:', redemptionRef.id);

      return {
        success: true,
        redemptionId: redemptionRef.id,
        status: 'pending'
      };

    } catch (error) {
      console.error('❌ Erreur redeemReward:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES DEMANDES D'ÉCHANGE (ADMIN)
   */
  async getRedemptionRequests(status = 'all') {
    try {
      let q = query(
        collection(db, 'reward_redemptions'),
        orderBy('requestedAt', 'desc')
      );

      if (status !== 'all') {
        q = query(
          collection(db, 'reward_redemptions'),
          where('status', '==', status),
          orderBy('requestedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const redemptions = [];

      querySnapshot.forEach((doc) => {
        redemptions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('📋 Demandes d\'échange chargées:', redemptions.length);
      return redemptions;

    } catch (error) {
      console.error('❌ Erreur getRedemptionRequests:', error);
      return [];
    }
  }

  /**
   * ✅ VALIDER UNE DEMANDE D'ÉCHANGE (ADMIN)
   */
  async processRedemption(adminId, redemptionId, action, adminNotes = '') {
    try {
      // Vérifier les permissions admin
      const hasPermission = await isAdmin({ uid: adminId });
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const redemptionRef = doc(db, 'reward_redemptions', redemptionId);
      const redemptionDoc = await getDoc(redemptionRef);

      if (!redemptionDoc.exists()) {
        throw new Error('Demande d\'échange introuvable');
      }

      const redemption = redemptionDoc.data();

      if (redemption.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Mettre à jour la demande
      const updates = {
        status: action, // 'approved', 'rejected', 'delivered'
        processedBy: adminId,
        processedAt: serverTimestamp(),
        adminNotes: adminNotes || ''
      };

      if (action === 'delivered') {
        updates.deliveredAt = serverTimestamp();
      }

      await updateDoc(redemptionRef, updates);

      console.log(`✅ Demande d'échange ${action}:`, redemptionId);

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur processRedemption:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES RÉCOMPENSES
   */
  async getRewardsStats() {
    try {
      const [rewards, redemptions] = await Promise.all([
        this.getAllRewards(true),
        this.getRedemptionRequests('all')
      ]);

      const stats = {
        totalRewards: rewards.length,
        activeRewards: rewards.filter(r => r.isActive).length,
        totalRedemptions: redemptions.length,
        pendingRedemptions: redemptions.filter(r => r.status === 'pending').length,
        approvedRedemptions: redemptions.filter(r => r.status === 'approved').length,
        deliveredRedemptions: redemptions.filter(r => r.status === 'delivered').length,
        rejectedRedemptions: redemptions.filter(r => r.status === 'rejected').length,
        mostPopularRewards: this.getMostPopularRewards(rewards, redemptions),
        recentActivity: redemptions.slice(0, 5)
      };

      return stats;

    } catch (error) {
      console.error('❌ Erreur getRewardsStats:', error);
      return {};
    }
  }

  /**
   * 🏆 OBTENIR LES RÉCOMPENSES LES PLUS POPULAIRES
   */
  getMostPopularRewards(rewards, redemptions) {
    const rewardCounts = {};
    
    redemptions.forEach(redemption => {
      if (redemption.rewardId) {
        rewardCounts[redemption.rewardId] = (rewardCounts[redemption.rewardId] || 0) + 1;
      }
    });

    return rewards
      .map(reward => ({
        ...reward,
        redemptionCount: rewardCounts[reward.id] || 0
      }))
      .sort((a, b) => b.redemptionCount - a.redemptionCount)
      .slice(0, 5);
  }

  /**
   * 🎯 TYPES DE RÉCOMPENSES DISPONIBLES
   */
  getRewardTypes() {
    return [
      {
        id: 'badge',
        name: 'Badge',
        description: 'Badge décoratif pour le profil',
        icon: '🏆'
      },
      {
        id: 'xp',
        name: 'Bonus XP',
        description: 'Points d\'expérience supplémentaires',
        icon: '⚡'
      },
      {
        id: 'virtual_item',
        name: 'Objet Virtuel',
        description: 'Objet décoratif ou fonctionnel',
        icon: '🎁'
      },
      {
        id: 'privilege',
        name: 'Privilège',
        description: 'Accès spécial ou fonctionnalité premium',
        icon: '👑'
      },
      {
        id: 'physical',
        name: 'Récompense Physique',
        description: 'Objet réel à récupérer',
        icon: '📦'
      }
    ];
  }
}

// Export singleton
export const rewardsService = new RewardsService();
export default rewardsService;
