// ==========================================
// 📁 react-app/src/core/services/teamPoolService.js
// SYSTÈME DE CAGNOTTE COLLECTIVE XP POUR L'ÉQUIPE
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏆 SERVICE DE CAGNOTTE COLLECTIVE ÉQUIPE
 * Système qui permet à l'équipe de mettre des XP en commun pour des récompenses collectives
 */
class TeamPoolService {
  constructor() {
    this.COLLECTION_NAME = 'teamPool';
    this.CONTRIBUTIONS_COLLECTION = 'teamContributions';
    this.TEAM_REWARDS_COLLECTION = 'teamRewards';
    
    // 🎯 CONFIGURATION DU SYSTÈME
    this.CONFIG = {
      // Pourcentage automatique des XP versés à la cagnotte (20% par défaut)
      AUTO_CONTRIBUTION_RATE: 0.2,
      
      // XP minimum requis pour contribuer automatiquement
      MIN_XP_FOR_AUTO_CONTRIBUTION: 50,
      
      // Niveau de cagnotte pour débloquer certaines récompenses
      POOL_LEVELS: {
        BRONZE: 1000,
        SILVER: 2500,
        GOLD: 5000,
        PLATINUM: 10000,
        DIAMOND: 20000
      }
    };
  }

  /**
   * 🚀 INITIALISER LA CAGNOTTE ÉQUIPE
   */
  async initializeTeamPool() {
    try {
      console.log('🚀 [TEAM-POOL] Initialisation cagnotte équipe...');
      
      const poolRef = doc(db, this.COLLECTION_NAME, 'main');
      const poolDoc = await getDoc(poolRef);
      
      if (!poolDoc.exists()) {
        // Créer la cagnotte principale
        const initialPool = {
          totalXP: 0,
          currentLevel: 'BRONZE',
          contributorsCount: 0,
          totalContributions: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          statistics: {
            weeklyContributions: 0,
            monthlyContributions: 0,
            averageContribution: 0,
            topContributor: null
          },
          rewards: {
            purchased: [],
            available: true,
            lastPurchase: null
          }
        };
        
        await setDoc(poolRef, initialPool);
        console.log('✅ [TEAM-POOL] Cagnotte créée');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ [TEAM-POOL] Erreur initialisation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 💰 CONTRIBUER À LA CAGNOTTE (Automatique lors de gain XP)
   */
  async contributeToPool(userId, userEmail, xpGained, source = 'auto', isManual = false) {
    try {
      console.log('💰 [TEAM-POOL] Contribution:', { userId, xpGained, source });
      
      // Calculer le montant de contribution
      let contributionAmount;
      
      if (isManual) {
        contributionAmount = xpGained; // Contribution manuelle = montant exact
      } else {
        // Contribution automatique = pourcentage des XP gagnés
        if (xpGained < this.CONFIG.MIN_XP_FOR_AUTO_CONTRIBUTION) {
          console.log('⚠️ [TEAM-POOL] XP insuffisants pour contribution auto');
          return { success: true, contributed: 0, reason: 'below_minimum' };
        }
        
        contributionAmount = Math.round(xpGained * this.CONFIG.AUTO_CONTRIBUTION_RATE);
      }
      
      if (contributionAmount <= 0) {
        return { success: true, contributed: 0, reason: 'no_contribution' };
      }

      // ✅ VÉRIFIER ET DÉDUIRE LES XP POUR CONTRIBUTION MANUELLE
      if (isManual) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          return { success: false, error: 'Utilisateur non trouvé' };
        }

        const userData = userDoc.data();
        const totalXP = userData.gamification?.totalXp || 0;
        const totalSpentXP = userData.gamification?.totalSpentXp || 0;
        const spendableXP = totalXP - totalSpentXP;

        if (spendableXP < contributionAmount) {
          return {
            success: false,
            error: `XP insuffisants (${spendableXP} disponibles, ${contributionAmount} requis)`
          };
        }
      }

      // Utiliser une transaction pour garantir la cohérence
      const result = await runTransaction(db, async (transaction) => {
        // 1. Récupérer l'état actuel de la cagnotte
        const poolRef = doc(db, this.COLLECTION_NAME, 'main');
        const poolDoc = await transaction.get(poolRef);
        
        if (!poolDoc.exists()) {
          throw new Error('Cagnotte non initialisée');
        }
        
        const poolData = poolDoc.data();
        
        // 2. Calculer les nouvelles valeurs
        const newTotalXP = (poolData.totalXP || 0) + contributionAmount;
        const newContributorsCount = poolData.contributorsCount || 0;
        const newTotalContributions = (poolData.totalContributions || 0) + 1;
        
        // 3. Déterminer le nouveau niveau
        const newLevel = this.calculatePoolLevel(newTotalXP);
        
        // 4. Mettre à jour la cagnotte
        const poolUpdates = {
          totalXP: newTotalXP,
          currentLevel: newLevel,
          totalContributions: newTotalContributions,
          updatedAt: serverTimestamp(),
          'statistics.weeklyContributions': (poolData.statistics?.weeklyContributions || 0) + contributionAmount,
          'statistics.monthlyContributions': (poolData.statistics?.monthlyContributions || 0) + contributionAmount,
          'statistics.averageContribution': Math.round(newTotalXP / newTotalContributions)
        };
        
        transaction.update(poolRef, poolUpdates);
        
        // 5. Enregistrer la contribution individuelle
        const contributionRef = doc(collection(db, this.CONTRIBUTIONS_COLLECTION));
        const contributionData = {
          userId,
          userEmail,
          amount: contributionAmount,
          source,
          type: isManual ? 'manual' : 'automatic',
          timestamp: serverTimestamp(),
          poolTotalAfter: newTotalXP,
          poolLevelAfter: newLevel
        };
        
        transaction.set(contributionRef, contributionData);

        // 6. ✅ DÉDUIRE LES XP DU COMPTE UTILISATEUR (contribution manuelle uniquement)
        if (isManual) {
          const userRef = doc(db, 'users', userId);
          const userDoc = await transaction.get(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentSpentXP = userData.gamification?.totalSpentXp || 0;

            transaction.update(userRef, {
              'gamification.totalSpentXp': currentSpentXP + contributionAmount,
              'gamification.lastPoolContribution': serverTimestamp()
            });

            console.log(`💸 [TEAM-POOL] XP déduits du compte: ${contributionAmount} XP`);
          }
        }

        return {
          contributed: contributionAmount,
          newPoolTotal: newTotalXP,
          newLevel,
          levelChanged: newLevel !== poolData.currentLevel
        };
      });
      
      console.log(`✅ [TEAM-POOL] Contribution réussie: +${contributionAmount} XP`);
      
      // Si le niveau a changé, déclencher un événement
      if (result.levelChanged) {
        this.triggerPoolLevelUpEvent(result.newLevel, result.newPoolTotal);
      }
      
      return { success: true, ...result };
      
    } catch (error) {
      console.error('❌ [TEAM-POOL] Erreur contribution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 CALCULER LE NIVEAU DE LA CAGNOTTE
   */
  calculatePoolLevel(totalXP) {
    if (totalXP >= this.CONFIG.POOL_LEVELS.DIAMOND) return 'DIAMOND';
    if (totalXP >= this.CONFIG.POOL_LEVELS.PLATINUM) return 'PLATINUM';
    if (totalXP >= this.CONFIG.POOL_LEVELS.GOLD) return 'GOLD';
    if (totalXP >= this.CONFIG.POOL_LEVELS.SILVER) return 'SILVER';
    return 'BRONZE';
  }

  /**
   * 🎉 DÉCLENCHER ÉVÉNEMENT DE NIVEAU SUPÉRIEUR
   */
  triggerPoolLevelUpEvent(newLevel, totalXP) {
    console.log(`🎉 [TEAM-POOL] NIVEAU SUPÉRIEUR! ${newLevel} (${totalXP} XP)`);
    
    // Émettre un événement global
    const event = new CustomEvent('teamPoolLevelUp', {
      detail: {
        newLevel,
        totalXP,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    
    // TODO: Envoyer des notifications push à tous les membres
  }

  /**
   * 🏪 ACHETER UNE RÉCOMPENSE D'ÉQUIPE
   */
  async purchaseTeamReward(rewardId, rewardData, adminUserId) {
    try {
      console.log('🏪 [TEAM-POOL] Achat récompense équipe:', rewardId);
      
      const result = await runTransaction(db, async (transaction) => {
        // 1. Vérifier l'état de la cagnotte
        const poolRef = doc(db, this.COLLECTION_NAME, 'main');
        const poolDoc = await transaction.get(poolRef);
        
        if (!poolDoc.exists()) {
          throw new Error('Cagnotte non trouvée');
        }
        
        const poolData = poolDoc.data();
        const currentXP = poolData.totalXP || 0;
        
        // 2. Vérifier si assez d'XP
        if (currentXP < rewardData.cost) {
          throw new Error(`XP insuffisants. Cagnotte: ${currentXP}, Requis: ${rewardData.cost}`);
        }
        
        // 3. Déduire les XP
        const newTotalXP = currentXP - rewardData.cost;
        const newLevel = this.calculatePoolLevel(newTotalXP);
        
        // 4. Mettre à jour la cagnotte
        transaction.update(poolRef, {
          totalXP: newTotalXP,
          currentLevel: newLevel,
          updatedAt: serverTimestamp(),
          'rewards.lastPurchase': serverTimestamp()
        });
        
        // 5. Enregistrer l'achat
        const purchaseRef = doc(collection(db, 'teamPurchases'));
        transaction.set(purchaseRef, {
          rewardId,
          rewardName: rewardData.name,
          rewardDescription: rewardData.description,
          cost: rewardData.cost,
          purchasedBy: adminUserId,
          purchasedAt: serverTimestamp(),
          poolBalanceBefore: currentXP,
          poolBalanceAfter: newTotalXP,
          status: 'pending_delivery'
        });
        
        return {
          newPoolTotal: newTotalXP,
          newLevel,
          purchaseId: purchaseRef.id
        };
      });
      
      console.log(`✅ [TEAM-POOL] Récompense achetée! Nouvelle cagnotte: ${result.newPoolTotal} XP`);
      return { success: true, ...result };
      
    } catch (error) {
      console.error('❌ [TEAM-POOL] Erreur achat:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE LA CAGNOTTE
   */
  async getPoolStats() {
    try {
      const poolRef = doc(db, this.COLLECTION_NAME, 'main');
      const poolDoc = await getDoc(poolRef);
      
      if (!poolDoc.exists()) {
        return { success: false, error: 'Cagnotte non initialisée' };
      }
      
      const poolData = poolDoc.data();
      
      // Calculer les stats supplémentaires
      const nextLevel = this.getNextLevel(poolData.currentLevel);
      const progressToNext = this.calculateProgressToNextLevel(poolData.totalXP);
      
      return {
        success: true,
        data: {
          ...poolData,
          nextLevel,
          progressToNext,
          canPurchase: this.getAffordableRewards(poolData.totalXP)
        }
      };
    } catch (error) {
      console.error('❌ [TEAM-POOL] Erreur stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 OBTENIR LE NIVEAU SUIVANT
   */
  getNextLevel(currentLevel) {
    const levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  }

  /**
   * 📈 CALCULER LA PROGRESSION VERS LE NIVEAU SUIVANT
   */
  calculateProgressToNextLevel(totalXP) {
    if (totalXP >= this.CONFIG.POOL_LEVELS.DIAMOND) {
      return { progress: 100, xpNeeded: 0, nextThreshold: null };
    }
    
    let currentThreshold = 0;
    let nextThreshold = this.CONFIG.POOL_LEVELS.BRONZE;
    
    if (totalXP >= this.CONFIG.POOL_LEVELS.PLATINUM) {
      currentThreshold = this.CONFIG.POOL_LEVELS.PLATINUM;
      nextThreshold = this.CONFIG.POOL_LEVELS.DIAMOND;
    } else if (totalXP >= this.CONFIG.POOL_LEVELS.GOLD) {
      currentThreshold = this.CONFIG.POOL_LEVELS.GOLD;
      nextThreshold = this.CONFIG.POOL_LEVELS.PLATINUM;
    } else if (totalXP >= this.CONFIG.POOL_LEVELS.SILVER) {
      currentThreshold = this.CONFIG.POOL_LEVELS.SILVER;
      nextThreshold = this.CONFIG.POOL_LEVELS.GOLD;
    } else if (totalXP >= this.CONFIG.POOL_LEVELS.BRONZE) {
      currentThreshold = this.CONFIG.POOL_LEVELS.BRONZE;
      nextThreshold = this.CONFIG.POOL_LEVELS.SILVER;
    }
    
    const progress = Math.round(((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
    const xpNeeded = nextThreshold - totalXP;
    
    return { progress, xpNeeded, nextThreshold };
  }

  /**
   * 🏆 OBTENIR LES RÉCOMPENSES D'ÉQUIPE DISPONIBLES
   */
  getAffordableRewards(poolXP) {
    const teamRewards = this.getTeamRewards();
    return teamRewards.filter(reward => poolXP >= reward.cost);
  }

  /**
   * 🎁 DÉFINIR LES RÉCOMPENSES D'ÉQUIPE
   */
  getTeamRewards() {
    return [
      // 🥉 BRONZE (1000-2499 XP)
      {
        id: 'team_snack_bronze',
        name: 'Goûter d\'équipe Premium',
        description: 'Assortiment de snacks et boissons pour toute l\'équipe',
        cost: 800,
        category: 'food',
        icon: '🍿',
        level: 'BRONZE',
        type: 'consumable'
      },
      {
        id: 'team_pizza_party',
        name: 'Pizza Party Équipe',
        description: 'Pizzas pour tout le monde + boissons',
        cost: 1200,
        category: 'food',
        icon: '🍕',
        level: 'BRONZE',
        type: 'event'
      },
      
      // 🥈 SILVER (2500-4999 XP)
      {
        id: 'team_laser_game',
        name: 'Sortie Laser Game Équipe',
        description: 'Session laser game pour toute l\'équipe',
        cost: 2000,
        category: 'activity',
        icon: '🎯',
        level: 'SILVER',
        type: 'outing'
      },
      {
        id: 'team_coffee_machine',
        name: 'Machine à Café Premium',
        description: 'Machine à café haut de gamme pour l\'espace de pause',
        cost: 2800,
        category: 'equipment',
        icon: '☕',
        level: 'SILVER',
        type: 'permanent'
      },
      
      // 🥇 GOLD (5000-9999 XP)
      {
        id: 'team_escape_game',
        name: 'Escape Game Géant',
        description: 'Escape game privatisé pour toute l\'équipe + repas',
        cost: 4500,
        category: 'activity',
        icon: '🔐',
        level: 'GOLD',
        type: 'outing'
      },
      {
        id: 'team_gaming_setup',
        name: 'Setup Gaming Équipe',
        description: 'Console + jeux + écran pour l\'espace détente',
        cost: 6000,
        category: 'equipment',
        icon: '🎮',
        level: 'GOLD',
        type: 'permanent'
      },
      
      // 💎 PLATINUM (10000-19999 XP)
      {
        id: 'team_weekend_resort',
        name: 'Weekend Équipe Resort',
        description: 'Weekend team-building dans un resort avec activités',
        cost: 12000,
        category: 'travel',
        icon: '🏨',
        level: 'PLATINUM',
        type: 'event'
      },
      {
        id: 'team_office_upgrade',
        name: 'Upgrade Espace de Travail',
        description: 'Amélioration complète de l\'espace de travail (mobilier, déco)',
        cost: 15000,
        category: 'equipment',
        icon: '🏢',
        level: 'PLATINUM',
        type: 'permanent'
      },
      
      // 💎 DIAMOND (20000+ XP)
      {
        id: 'team_trip_abroad',
        name: 'Voyage d\'Équipe International',
        description: 'Voyage d\'équipe à l\'étranger avec activités team-building',
        cost: 25000,
        category: 'travel',
        icon: '✈️',
        level: 'DIAMOND',
        type: 'event'
      },
      {
        id: 'team_office_renovation',
        name: 'Rénovation Complète Bureau',
        description: 'Rénovation totale de l\'espace de travail selon vos envies',
        cost: 35000,
        category: 'equipment',
        icon: '🏗️',
        level: 'DIAMOND',
        type: 'permanent'
      }
    ];
  }

  /**
   * 👂 ÉCOUTER LES CHANGEMENTS DE CAGNOTTE EN TEMPS RÉEL
   */
  subscribeToPoolChanges(callback) {
    try {
      const poolRef = doc(db, this.COLLECTION_NAME, 'main');
      
      const unsubscribe = onSnapshot(poolRef, (doc) => {
        if (doc.exists()) {
          const poolData = doc.data();
          const stats = {
            ...poolData,
            nextLevel: this.getNextLevel(poolData.currentLevel),
            progressToNext: this.calculateProgressToNextLevel(poolData.totalXP),
            affordableRewards: this.getAffordableRewards(poolData.totalXP)
          };
          
          callback({ success: true, data: stats });
        } else {
          callback({ success: false, error: 'Cagnotte non trouvée' });
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ [TEAM-POOL] Erreur écoute:', error);
      callback({ success: false, error: error.message });
      return null;
    }
  }
}

// Singleton
const teamPoolService = new TeamPoolService();
export default teamPoolService;
