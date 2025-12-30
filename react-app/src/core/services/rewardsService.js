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

      // 📦 GESTION DES STOCKS
      const stockType = rewardData.stockType || 'unlimited'; // 'unlimited' | 'limited'
      const stockTotal = stockType === 'limited' ? parseInt(rewardData.stockTotal) || 0 : null;
      const stockRemaining = stockType === 'limited' ? stockTotal : null;

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
        // 📦 CHAMPS STOCK
        stockType, // 'unlimited' | 'limited'
        stockTotal, // Quantité totale (null si illimité)
        stockRemaining, // Quantité restante (null si illimité)
        // Statistiques
        timesRedeemed: 0,
        usersRedeemedCount: 0,
        lastRedeemedAt: null
      };

      const docRef = await addDoc(collection(db, 'rewards'), reward);

      console.log('✅ Récompense créée:', docRef.id, '| Stock:', stockType === 'limited' ? `${stockTotal} unités` : 'illimité');

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

      // 📦 VÉRIFIER LE STOCK
      if (reward.stockType === 'limited') {
        if (reward.stockRemaining <= 0) {
          throw new Error('Stock épuisé ! Cette récompense n\'est plus disponible.');
        }
      }

      // 👤 VÉRIFIER LA LIMITE PAR UTILISATEUR (1 par défaut pour individuelles)
      const limitSettings = await this.getUserLimitSettings();
      const defaultLimit = reward.type === 'team'
        ? limitSettings.defaultLimitTeam
        : limitSettings.defaultLimitIndividual;
      const limitPerUser = limitSettings.customLimits?.[rewardId] ?? defaultLimit;

      const userRedemptionCheck = await this.canUserRedeemReward(userId, rewardId, limitPerUser);
      if (!userRedemptionCheck.canRedeem) {
        throw new Error(`Limite atteinte ! Tu as déjà échangé cette récompense ${userRedemptionCheck.currentCount}/${limitPerUser} fois.`);
      }

      // Vérifier les points de l'utilisateur
      if (userPoints < reward.cost) {
        throw new Error(`Points insuffisants. Requis: ${reward.cost}, Disponible: ${userPoints}`);
      }

      // 📦 PRÉPARER LES UPDATES (avec décrémentation stock si limité)
      const rewardUpdates = {
        timesRedeemed: (reward.timesRedeemed || 0) + 1,
        lastRedeemedAt: serverTimestamp()
      };

      // Décrémenter le stock si limité
      if (reward.stockType === 'limited') {
        rewardUpdates.stockRemaining = reward.stockRemaining - 1;
        // Désactiver automatiquement si stock épuisé après cette demande
        if (reward.stockRemaining - 1 <= 0) {
          rewardUpdates.isAvailable = false;
        }
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

      // Mettre à jour les statistiques et le stock de la récompense
      await updateDoc(rewardRef, rewardUpdates);

      console.log('✅ Stock après demande:', reward.stockType === 'limited' ? `${reward.stockRemaining - 1} restants` : 'illimité');

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

      // 📦 RESTAURER LE STOCK SI REJETÉ
      const rewardRef = doc(db, 'rewards', redemption.rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (rewardDoc.exists()) {
        const reward = rewardDoc.data();
        if (reward.stockType === 'limited') {
          await updateDoc(rewardRef, {
            stockRemaining: (reward.stockRemaining || 0) + 1,
            isAvailable: true, // Réactiver si le stock était épuisé
            updatedAt: serverTimestamp()
          });
          console.log('📦 Stock restauré pour:', reward.name);
        }
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

  /**
   * 📦 METTRE À JOUR LE STOCK D'UNE RÉCOMPENSE (ADMIN)
   */
  async updateRewardStock(adminId, rewardId, stockData) {
    try {
      // Vérifier les permissions admin
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const rewardRef = doc(db, 'rewards', rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Récompense introuvable');
      }

      const { stockType, stockTotal, addStock } = stockData;
      const currentReward = rewardDoc.data();

      const updates = {
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      };

      // Mode: changer le type de stock
      if (stockType !== undefined) {
        updates.stockType = stockType;

        if (stockType === 'unlimited') {
          updates.stockTotal = null;
          updates.stockRemaining = null;
          updates.isAvailable = true;
        } else if (stockType === 'limited' && stockTotal !== undefined) {
          updates.stockTotal = parseInt(stockTotal);
          updates.stockRemaining = parseInt(stockTotal);
          updates.isAvailable = parseInt(stockTotal) > 0;
        }
      }

      // Mode: ajouter du stock (réapprovisionner)
      if (addStock !== undefined && currentReward.stockType === 'limited') {
        const additional = parseInt(addStock);
        updates.stockTotal = (currentReward.stockTotal || 0) + additional;
        updates.stockRemaining = (currentReward.stockRemaining || 0) + additional;
        updates.isAvailable = true;
      }

      // Mode: définir un stock total précis
      if (stockTotal !== undefined && stockType === undefined) {
        const newTotal = parseInt(stockTotal);
        const currentRemaining = currentReward.stockRemaining || 0;
        const currentTotal = currentReward.stockTotal || 0;
        const diff = newTotal - currentTotal;

        updates.stockTotal = newTotal;
        updates.stockRemaining = Math.max(0, currentRemaining + diff);
        updates.isAvailable = updates.stockRemaining > 0;
      }

      await updateDoc(rewardRef, updates);

      console.log('📦 Stock mis à jour pour:', rewardId, updates);

      return { success: true, message: 'Stock mis à jour' };

    } catch (error) {
      console.error('❌ Erreur updateRewardStock:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES INFOS DE STOCK D'UNE RÉCOMPENSE
   */
  async getRewardStockInfo(rewardId) {
    try {
      const rewardRef = doc(db, 'rewards', rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        return null;
      }

      const reward = rewardDoc.data();

      return {
        stockType: reward.stockType || 'unlimited',
        stockTotal: reward.stockTotal,
        stockRemaining: reward.stockRemaining,
        isAvailable: reward.isAvailable,
        percentageRemaining: reward.stockType === 'limited' && reward.stockTotal > 0
          ? Math.round((reward.stockRemaining / reward.stockTotal) * 100)
          : null
      };

    } catch (error) {
      console.error('❌ Erreur getRewardStockInfo:', error);
      return null;
    }
  }

  // ==========================================
  // 👤 GESTION LIMITES PAR UTILISATEUR
  // ==========================================

  /**
   * 🔢 Compter combien de fois un utilisateur a échangé une récompense
   */
  async getUserRedemptionCount(userId, rewardId) {
    try {
      // Vérifier les échanges approuvés ou en attente (pas les rejetés)
      const redemptionsQuery = query(
        collection(db, 'reward_redemptions'),
        where('userId', '==', userId),
        where('rewardId', '==', rewardId)
      );

      const snapshot = await getDocs(redemptionsQuery);

      // Compter seulement les non-rejetés et non-réinitialisés
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Compter si approved ou pending ET pas réinitialisé
        if ((data.status === 'approved' || data.status === 'pending') && !data.resetByAdmin) {
          count++;
        }
      });

      return count;
    } catch (error) {
      console.error('❌ Erreur getUserRedemptionCount:', error);
      return 0;
    }
  }

  /**
   * ✅ Vérifier si un utilisateur peut échanger une récompense (limite par user)
   */
  async canUserRedeemReward(userId, rewardId, limitPerUser = 1) {
    try {
      const currentCount = await this.getUserRedemptionCount(userId, rewardId);
      return {
        canRedeem: currentCount < limitPerUser,
        currentCount,
        limitPerUser,
        remaining: Math.max(0, limitPerUser - currentCount)
      };
    } catch (error) {
      console.error('❌ Erreur canUserRedeemReward:', error);
      return { canRedeem: false, currentCount: 0, limitPerUser, remaining: 0 };
    }
  }

  /**
   * 👥 Obtenir tous les utilisateurs qui ont échangé une récompense (ADMIN)
   */
  async getUsersWhoRedeemed(adminId, rewardId) {
    try {
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const redemptionsQuery = query(
        collection(db, 'reward_redemptions'),
        where('rewardId', '==', rewardId),
        orderBy('requestedAt', 'desc')
      );

      const snapshot = await getDocs(redemptionsQuery);
      const usersMap = new Map();

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const userId = data.userId;

        if (!usersMap.has(userId)) {
          // Récupérer les infos utilisateur
          let userName = 'Utilisateur inconnu';
          let userEmail = '';
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userName = userData.displayName || userData.firstName || userData.email || 'Utilisateur';
              userEmail = userData.email || '';
            }
          } catch (e) {
            console.warn('Erreur récup user:', e);
          }

          usersMap.set(userId, {
            userId,
            userName,
            userEmail,
            redemptions: [],
            totalRedemptions: 0,
            canRedeem: true
          });
        }

        const userEntry = usersMap.get(userId);
        userEntry.redemptions.push({
          redemptionId: docSnapshot.id,
          status: data.status,
          requestedAt: data.requestedAt?.toDate?.() || data.requestedAt,
          resetByAdmin: data.resetByAdmin || false
        });

        // Compter seulement les non-rejetés et non-réinitialisés
        if ((data.status === 'approved' || data.status === 'pending') && !data.resetByAdmin) {
          userEntry.totalRedemptions++;
        }
      }

      // Déterminer qui peut encore échanger (limite 1 par défaut)
      const result = Array.from(usersMap.values()).map(user => ({
        ...user,
        canRedeem: user.totalRedemptions < 1
      }));

      return result;

    } catch (error) {
      console.error('❌ Erreur getUsersWhoRedeemed:', error);
      return [];
    }
  }

  /**
   * 🔄 Réinitialiser l'échange d'un utilisateur pour une récompense (ADMIN)
   * Permet à l'utilisateur d'échanger à nouveau
   */
  async resetUserRedemption(adminId, userId, rewardId) {
    try {
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      // Trouver tous les échanges approuvés de cet utilisateur pour cette récompense
      const redemptionsQuery = query(
        collection(db, 'reward_redemptions'),
        where('userId', '==', userId),
        where('rewardId', '==', rewardId)
      );

      const snapshot = await getDocs(redemptionsQuery);
      const batch = writeBatch(db);
      let resetCount = 0;

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // Marquer comme réinitialisé si approuvé ou pending
        if ((data.status === 'approved' || data.status === 'pending') && !data.resetByAdmin) {
          batch.update(doc(db, 'reward_redemptions', docSnapshot.id), {
            resetByAdmin: true,
            resetAt: serverTimestamp(),
            resetBy: adminId
          });
          resetCount++;
        }
      });

      if (resetCount > 0) {
        await batch.commit();
        console.log(`✅ ${resetCount} échange(s) réinitialisé(s) pour user ${userId}, reward ${rewardId}`);
      }

      return {
        success: true,
        message: `${resetCount} échange(s) réinitialisé(s). L'utilisateur peut à nouveau échanger.`,
        resetCount
      };

    } catch (error) {
      console.error('❌ Erreur resetUserRedemption:', error);
      throw error;
    }
  }

  /**
   * 📋 Obtenir toutes les récompenses (Firebase + paramètres par défaut)
   */
  async getAllRewardsForAdmin(adminId) {
    try {
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      // Récupérer les récompenses personnalisées de Firebase
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      const customRewards = [];

      rewardsSnapshot.forEach((docSnapshot) => {
        customRewards.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
          isCustom: true
        });
      });

      console.log('📋 Récompenses personnalisées récupérées:', customRewards.length);

      return customRewards;

    } catch (error) {
      console.error('❌ Erreur getAllRewardsForAdmin:', error);
      return [];
    }
  }

  /**
   * ⚙️ Sauvegarder les paramètres de limite par utilisateur
   */
  async saveUserLimitSettings(adminId, settings) {
    try {
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      const settingsRef = doc(db, 'rewardSettings', 'userLimits');
      const { setDoc } = await import('firebase/firestore');

      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      }, { merge: true });

      console.log('✅ Paramètres de limites utilisateur sauvegardés');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur saveUserLimitSettings:', error);
      throw error;
    }
  }

  /**
   * 📖 Récupérer les paramètres de limite par utilisateur
   */
  async getUserLimitSettings() {
    try {
      const settingsRef = doc(db, 'rewardSettings', 'userLimits');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        return settingsDoc.data();
      }

      // Valeurs par défaut : limite 1 pour toutes les récompenses individuelles
      return {
        defaultLimitIndividual: 1,
        defaultLimitTeam: 5,
        customLimits: {} // { rewardId: limitPerUser }
      };

    } catch (error) {
      console.error('❌ Erreur getUserLimitSettings:', error);
      return {
        defaultLimitIndividual: 1,
        defaultLimitTeam: 5,
        customLimits: {}
      };
    }
  }
}

// Export de l'instance unique
export const rewardsService = new RewardsService();
export default rewardsService;

console.log('✅ RewardsService corrigé - Permissions admin compatibles');
