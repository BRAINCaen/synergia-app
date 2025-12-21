// ==========================================
// 📁 react-app/src/core/services/rewardsService.js  
// SERVICE COMPLET DE GESTION DES RÉCOMPENSES - PERMISSIONS CORRIGÉES
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
import notificationService from './notificationService.js';

/**
 * 🎁 SERVICE DE GESTION DES RÉCOMPENSES - VERSION CORRIGÉE
 */
class RewardsService {
  constructor() {
    this.listeners = new Map();
    this.adminEmails = ['alan.boehme61@gmail.com']; // Liste des admins
  }

  /**
   * 🛡️ VÉRIFICATION ADMIN CORRIGÉE - COMPATIBLE UID ET USER OBJECT
   */
  async checkAdminPermissions(userIdOrObject) {
    try {
      let user = userIdOrObject;
      
      // Si c'est juste un UID, récupérer les données utilisateur
      if (typeof userIdOrObject === 'string') {
        const userRef = doc(db, 'users', userIdOrObject);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.warn('⚠️ Utilisateur non trouvé:', userIdOrObject);
          return false;
        }
        
        user = { uid: userIdOrObject, ...userDoc.data() };
      }
      
      // Vérifications multiples robustes
      const isAdminEmail = this.adminEmails.includes(user.email);
      const isRoleAdmin = user.role === 'admin';
      const hasAdminFlag = user.isAdmin === true;
      const isProfileRoleAdmin = user.profile?.role === 'admin';
      const hasAdminPermissions = Array.isArray(user.permissions) && 
        (user.permissions.includes('admin_access') || user.permissions.includes('manage_rewards'));
      
      const isAdmin = isAdminEmail || isRoleAdmin || hasAdminFlag || isProfileRoleAdmin || hasAdminPermissions;
      
      console.log('🛡️ Vérification admin récompenses:', {
        userEmail: user.email,
        userUid: user.uid,
        checks: { isAdminEmail, isRoleAdmin, hasAdminFlag, isProfileRoleAdmin, hasAdminPermissions },
        finalResult: isAdmin
      });
      
      return isAdmin;
      
    } catch (error) {
      console.error('❌ Erreur vérification admin récompenses:', error);
      return false;
    }
  }

  /**
   * ✅ CRÉER UNE NOUVELLE RÉCOMPENSE (ADMIN)
   */
  async createReward(adminId, rewardData) {
    try {
      // Vérifier les permissions admin avec la nouvelle méthode
      const hasPermission = await this.checkAdminPermissions(adminId);
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
      // Vérifier les permissions admin avec la nouvelle méthode
      const hasPermission = await this.checkAdminPermissions(adminId);
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
      // Vérifier les permissions admin avec la nouvelle méthode
      const hasPermission = await this.checkAdminPermissions(adminId);
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
        throw new Error(`Points insuffisants. Requis: ${reward.cost}, Disponible: ${userPoints}`);
      }

      // Créer la demande d'échange
      const redemptionData = {
        userId,
        rewardId,
        rewardName: reward.name,
        rewardType: reward.type,
        cost: reward.cost,
        status: 'pending',
        requestedAt: serverTimestamp(),
        processedAt: null,
        processedBy: null,
        notes: ''
      };

      const redemptionRef = await addDoc(collection(db, 'reward_redemptions'), redemptionData);

      // Mettre à jour les statistiques de la récompense
      await updateDoc(rewardRef, {
        timesRedeemed: (reward.timesRedeemed || 0) + 1,
        lastRedeemedAt: serverTimestamp()
      });

      console.log('✅ Échange de récompense créé:', redemptionRef.id);

      // 🔔 NOTIFIER LES ADMINS DE LA DEMANDE DE RÉCOMPENSE
      try {
        // Récupérer le nom de l'utilisateur
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userName = userDoc.exists()
          ? (userDoc.data().displayName || userDoc.data().email || 'Utilisateur')
          : 'Utilisateur';

        await notificationService.notifyRewardRequested({
          rewardId,
          rewardName: reward.name,
          userId,
          userName,
          cost: reward.cost
        });
        console.log('🔔 Admins notifiés de la demande de récompense');
      } catch (notifError) {
        console.warn('⚠️ Erreur notification demande récompense:', notifError);
      }

      return {
        success: true,
        redemptionId: redemptionRef.id,
        message: 'Demande d\'échange créée. En attente de validation.'
      };

    } catch (error) {
      console.error('❌ Erreur redeemReward:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES RÉCOMPENSES (ADMIN)
   */
  async getRewardsStatistics(adminId) {
    try {
      // Vérifier les permissions admin
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      // Récupérer toutes les récompenses
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      const redemptionsSnapshot = await getDocs(collection(db, 'reward_redemptions'));

      const stats = {
        totalRewards: rewardsSnapshot.size,
        activeRewards: 0,
        totalRedemptions: redemptionsSnapshot.size,
        pendingRedemptions: 0,
        approvedRedemptions: 0,
        rejectedRedemptions: 0,
        mostPopularReward: null,
        totalPointsSpent: 0
      };

      // Analyser les récompenses
      rewardsSnapshot.forEach((doc) => {
        const reward = doc.data();
        if (reward.isActive) stats.activeRewards++;
      });

      // Analyser les échanges
      const redemptionsByReward = {};
      let totalPointsSpent = 0;

      redemptionsSnapshot.forEach((doc) => {
        const redemption = doc.data();
        
        // Compter par statut
        if (redemption.status === 'pending') stats.pendingRedemptions++;
        if (redemption.status === 'approved') {
          stats.approvedRedemptions++;
          totalPointsSpent += redemption.cost || 0;
        }
        if (redemption.status === 'rejected') stats.rejectedRedemptions++;

        // Compter par récompense
        if (!redemptionsByReward[redemption.rewardId]) {
          redemptionsByReward[redemption.rewardId] = {
            count: 0,
            name: redemption.rewardName
          };
        }
        redemptionsByReward[redemption.rewardId].count++;
      });

      stats.totalPointsSpent = totalPointsSpent;

      // Trouver la récompense la plus populaire
      let maxCount = 0;
      for (const [rewardId, data] of Object.entries(redemptionsByReward)) {
        if (data.count > maxCount) {
          maxCount = data.count;
          stats.mostPopularReward = {
            id: rewardId,
            name: data.name,
            redemptions: data.count
          };
        }
      }

      console.log('📊 Statistiques récompenses calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erreur getRewardsStatistics:', error);
      throw error;
    }
  }

  /**
   * ✅ APPROUVER UN ÉCHANGE DE RÉCOMPENSE (ADMIN)
   */
  async approveRedemption(adminId, redemptionId, adminNotes = '') {
    try {
      // Vérifier les permissions admin
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const redemptionRef = doc(db, 'reward_redemptions', redemptionId);
      const redemptionDoc = await getDoc(redemptionRef);

      if (!redemptionDoc.exists()) {
        throw new Error('Échange introuvable');
      }

      const redemption = redemptionDoc.data();

      if (redemption.status !== 'pending') {
        throw new Error('Cet échange a déjà été traité');
      }

      // Mettre à jour le statut
      await updateDoc(redemptionRef, {
        status: 'approved',
        processedAt: serverTimestamp(),
        processedBy: adminId,
        notes: adminNotes
      });

      console.log('✅ Échange approuvé:', redemptionId);

      return { success: true, message: 'Échange approuvé avec succès' };

    } catch (error) {
      console.error('❌ Erreur approveRedemption:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UN ÉCHANGE DE RÉCOMPENSE (ADMIN)
   */
  async rejectRedemption(adminId, redemptionId, adminNotes = '') {
    try {
      // Vérifier les permissions admin
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const redemptionRef = doc(db, 'reward_redemptions', redemptionId);
      const redemptionDoc = await getDoc(redemptionRef);

      if (!redemptionDoc.exists()) {
        throw new Error('Échange introuvable');
      }

      const redemption = redemptionDoc.data();

      if (redemption.status !== 'pending') {
        throw new Error('Cet échange a déjà été traité');
      }

      // Mettre à jour le statut
      await updateDoc(redemptionRef, {
        status: 'rejected',
        processedAt: serverTimestamp(),
        processedBy: adminId,
        notes: adminNotes
      });

      console.log('✅ Échange rejeté:', redemptionId);

      return { success: true, message: 'Échange rejeté' };

    } catch (error) {
      console.error('❌ Erreur rejectRedemption:', error);
      throw error;
    }
  }

  /**
   * 📋 OBTENIR TOUS LES ÉCHANGES (ADMIN)
   */
  async getAllRedemptions(adminId, status = 'all') {
    try {
      // Vérifier les permissions admin
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

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

      console.log('📋 Échanges récupérés:', redemptions.length);
      return redemptions;

    } catch (error) {
      console.error('❌ Erreur getAllRedemptions:', error);
      return [];
    }
  }
}

// Export de l'instance unique
export const rewardsService = new RewardsService();
export default rewardsService;

console.log('✅ RewardsService corrigé - Permissions admin compatibles');
