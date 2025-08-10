// ==========================================
// 📁 react-app/src/core/services/rewardsPurchaseService.js
// SERVICE D'ACHAT DE RÉCOMPENSES AVEC DÉDUCTION XP GARANTIE
// ==========================================

import { 
  doc, 
  updateDoc, 
  getDoc, 
  addDoc,
  collection,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🛒 SERVICE D'ACHAT DE RÉCOMPENSES AVEC DÉDUCTION XP
 * Garantit que les XP sont correctement déduits et l'interface mise à jour
 */
class RewardsPurchaseService {
  constructor() {
    this.purchasing = false;
  }

  /**
   * 🛒 ACHETER UNE RÉCOMPENSE AVEC TRANSACTION SÉCURISÉE
   * Utilise une transaction Firebase pour garantir la cohérence
   */
  async purchaseReward(userId, reward) {
    if (this.purchasing) {
      throw new Error('Achat en cours, veuillez patienter');
    }

    this.purchasing = true;

    try {
      console.log('🛒 [REWARDS] Début achat récompense:', {
        userId,
        rewardId: reward.id,
        cost: reward.cost
      });

      // Utiliser une transaction pour garantir la cohérence
      const result = await runTransaction(db, async (transaction) => {
        // 1. Lire les données utilisateur actuelles
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('Utilisateur introuvable');
        }
        
        const userData = userDoc.data();
        const gamification = userData.gamification || {};
        const currentXp = gamification.totalXp || 0;
        
        // 2. Vérifier que l'utilisateur a assez d'XP
        if (currentXp < reward.cost) {
          throw new Error(`XP insuffisants. Vous avez ${currentXp} XP, il en faut ${reward.cost}`);
        }
        
        // 3. Calculer les nouvelles valeurs
        const newTotalXp = currentXp - reward.cost;
        const purchasedRewards = gamification.purchasedRewards || [];
        
        // Vérifier si déjà acheté (pour éviter les doublons)
        if (purchasedRewards.some(pr => pr.id === reward.id)) {
          throw new Error('Récompense déjà achetée');
        }
        
        // 4. Préparer la mise à jour
        const rewardPurchase = {
          id: reward.id,
          name: reward.name,
          cost: reward.cost,
          purchasedAt: new Date().toISOString(),
          category: reward.category,
          description: reward.description,
          icon: reward.icon
        };
        
        const updates = {
          'gamification.totalXp': newTotalXp,
          'gamification.purchasedRewards': [...purchasedRewards, rewardPurchase],
          'gamification.totalSpentXp': (gamification.totalSpentXp || 0) + reward.cost,
          'gamification.rewardsCount': (gamification.rewardsCount || 0) + 1,
          'gamification.lastPurchaseAt': serverTimestamp(),
          updatedAt: serverTimestamp(),
          'syncMetadata.lastRewardSync': serverTimestamp()
        };
        
        // 5. Appliquer la mise à jour
        transaction.update(userRef, updates);
        
        return {
          previousXp: currentXp,
          newXp: newTotalXp,
          reward: rewardPurchase
        };
      });

      console.log('✅ [REWARDS] Achat réussi:', {
        previousXp: result.previousXp,
        newXp: result.newXp,
        rewardName: result.reward.name
      });

      // 6. Enregistrer dans l'historique des achats
      await this.createPurchaseRecord(userId, result.reward, result.previousXp, result.newXp);

      // 7. Déclencher un événement pour notifier les composants
      this.notifyPurchaseSuccess(userId, result);

      return {
        success: true,
        previousXp: result.previousXp,
        newXp: result.newXp,
        reward: result.reward,
        message: `🎉 ${result.reward.name} acheté avec succès ! ${result.reward.cost} XP déduits.`
      };

    } catch (error) {
      console.error('❌ [REWARDS] Erreur achat:', error);
      throw error;
    } finally {
      this.purchasing = false;
    }
  }

  /**
   * 📝 CRÉER UN ENREGISTREMENT D'ACHAT
   */
  async createPurchaseRecord(userId, reward, previousXp, newXp) {
    try {
      const purchaseRecord = {
        userId,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardCost: reward.cost,
        rewardCategory: reward.category,
        previousXp,
        newXp,
        purchasedAt: serverTimestamp(),
        status: 'completed'
      };

      await addDoc(collection(db, 'rewardPurchases'), purchaseRecord);
      console.log('📝 [REWARDS] Enregistrement d\'achat créé');

    } catch (error) {
      console.warn('⚠️ [REWARDS] Erreur création enregistrement:', error);
      // Ne pas faire échouer l'achat pour ça
    }
  }

  /**
   * 📢 NOTIFIER LE SUCCÈS D'ACHAT
   */
  notifyPurchaseSuccess(userId, result) {
    // Émettre un événement personnalisé
    const event = new CustomEvent('rewardPurchased', {
      detail: {
        userId,
        reward: result.reward,
        previousXp: result.previousXp,
        newXp: result.newXp,
        timestamp: new Date()
      }
    });

    window.dispatchEvent(event);

    // Aussi émettre un événement XP pour la synchronisation
    const xpEvent = new CustomEvent('xpUpdated', {
      detail: {
        userId,
        gamificationData: {
          totalXp: result.newXp,
          lastPurchaseAt: new Date().toISOString()
        },
        source: 'reward_purchase',
        timestamp: new Date()
      }
    });

    window.dispatchEvent(xpEvent);

    console.log('📢 [REWARDS] Événements d\'achat émis');
  }

  /**
   * 💰 VÉRIFIER SI UN UTILISATEUR PEUT ACHETER
   */
  async canAffordReward(userId, rewardCost) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { canAfford: false, reason: 'Utilisateur introuvable' };
      }
      
      const userData = userDoc.data();
      const currentXp = userData.gamification?.totalXp || 0;
      
      return {
        canAfford: currentXp >= rewardCost,
        currentXp,
        needed: Math.max(0, rewardCost - currentXp),
        reason: currentXp >= rewardCost ? 'OK' : 'XP insuffisants'
      };
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur vérification XP:', error);
      return { canAfford: false, reason: 'Erreur de vérification' };
    }
  }

  /**
   * 🎁 OBTENIR LES RÉCOMPENSES ACHETÉES D'UN UTILISATEUR
   */
  async getPurchasedRewards(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return [];
      }
      
      const userData = userDoc.data();
      return userData.gamification?.purchasedRewards || [];
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur récupération achats:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'ACHAT
   */
  async getPurchaseStats(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      const gamification = userData.gamification || {};
      
      return {
        totalSpentXp: gamification.totalSpentXp || 0,
        rewardsCount: gamification.rewardsCount || 0,
        lastPurchaseAt: gamification.lastPurchaseAt || null,
        purchasedRewards: gamification.purchasedRewards || []
      };
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur stats achats:', error);
      return null;
    }
  }

  /**
   * 🔄 REMBOURSER UNE RÉCOMPENSE (ADMIN SEULEMENT)
   */
  async refundReward(userId, rewardId, reason = 'Remboursement administratif') {
    try {
      console.log('🔄 [REWARDS] Remboursement:', { userId, rewardId, reason });

      const result = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('Utilisateur introuvable');
        }
        
        const userData = userDoc.data();
        const gamification = userData.gamification || {};
        const purchasedRewards = gamification.purchasedRewards || [];
        
        // Trouver la récompense
        const rewardIndex = purchasedRewards.findIndex(r => r.id === rewardId);
        if (rewardIndex === -1) {
          throw new Error('Récompense non trouvée dans les achats');
        }
        
        const reward = purchasedRewards[rewardIndex];
        const refundAmount = reward.cost;
        
        // Supprimer de la liste et rembourser
        const updatedRewards = purchasedRewards.filter(r => r.id !== rewardId);
        
        const updates = {
          'gamification.totalXp': (gamification.totalXp || 0) + refundAmount,
          'gamification.purchasedRewards': updatedRewards,
          'gamification.totalSpentXp': Math.max(0, (gamification.totalSpentXp || 0) - refundAmount),
          'gamification.rewardsCount': Math.max(0, (gamification.rewardsCount || 0) - 1),
          updatedAt: serverTimestamp()
        };
        
        transaction.update(userRef, updates);
        
        return { reward, refundAmount };
      });

      console.log('✅ [REWARDS] Remboursement réussi:', result);
      return { success: true, ...result };

    } catch (error) {
      console.error('❌ [REWARDS] Erreur remboursement:', error);
      throw error;
    }
  }
}

// Export de l'instance singleton
export const rewardsPurchaseService = new RewardsPurchaseService();

// Export par défaut
export default rewardsPurchaseService;

console.log('✅ [REWARDS] Service d\'achat de récompenses chargé');
