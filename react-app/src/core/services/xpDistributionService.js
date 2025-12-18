// ==========================================
// 📁 react-app/src/core/services/xpDistributionService.js
// SERVICE DISTRIBUTION XP - SYSTÈME 100% + 20% BONUS
// ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
// ==========================================

import { doc, updateDoc, increment, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 💎 SERVICE DE DISTRIBUTION XP - SYSTÈME 100% + 20% BONUS
 * 
 * RÈGLE : Quand un utilisateur gagne des XP :
 * - 100% vont sur son compte personnel (users/{uid}/gamification/totalXp)
 * - 100% vont AUSSI sur ses XP dépensables (users/{uid}/gamification/spendableXp)
 * - 20% EN BONUS vont au pool équipe collectif (teamPool/main/totalXP)
 * 
 * ✅ SYSTÈME 2 COMPTEURS :
 * - totalXp : XP de PRESTIGE (classements, niveaux, profil) → NE DIMINUE JAMAIS
 * - spendableXp : XP DÉPENSABLES (récompenses individuelles) → SE DÉDUIT À L'ACHAT
 * 
 * EXEMPLE : 100 XP gagnés
 * → Utilisateur totalXp : +100 XP (prestige, jamais déduit)
 * → Utilisateur spendableXp : +100 XP (pour achats récompenses)
 * → Pool équipe : +20 XP (bonus)
 * → Total créé : 120 XP
 */

/**
 * ✅ ATTRIBUER DES XP AVEC BONUS 20% AU POOL
 * @param {string} userId - ID de l'utilisateur qui gagne des XP
 * @param {number} xpAmount - XP à attribuer à l'utilisateur (il recevra 100%)
 * @param {string} source - Source des XP (ex: "task_validation", "badge_unlock", etc.)
 * @param {string} sourceId - ID de la source (ex: task ID, badge ID, etc.)
 * @returns {Promise<{userXP: number, teamXP: number, total: number}>} - XP distribués
 */
export const distributeXP = async (userId, xpAmount, source = 'unknown', sourceId = null) => {
  try {
    console.log(`💎 [XP Distribution] Attribution de ${xpAmount} XP pour ${userId}`);
    console.log(`📊 [XP Distribution] Source: ${source}, ID: ${sourceId || 'N/A'}`);

    // ✅ CALCUL : 100% utilisateur + 20% bonus pool
    const userXP = xpAmount;                      // 100% pour l'utilisateur
    const teamXP = Math.floor(xpAmount * 0.2);   // 20% bonus pour l'équipe
    const totalCreated = userXP + teamXP;         // Total créé dans le système

    console.log(`👤 [XP Distribution] XP Utilisateur: ${userXP} (100%)`);
    console.log(`💰 [XP Distribution] XP Dépensables: ${userXP} (100%)`);
    console.log(`👥 [XP Distribution] XP Pool Équipe: ${teamXP} (bonus 20%)`);
    console.log(`📊 [XP Distribution] Total créé: ${totalCreated} XP`);

    // ✅ 1. CRÉDITER L'UTILISATEUR (100% totalXp + 100% spendableXp)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      // ✅ XP DE PRESTIGE (classements, niveaux) - NE DIMINUE JAMAIS
      'gamification.totalXp': increment(userXP),
      // ✅ XP DÉPENSABLES (récompenses) - SE DÉDUIT À L'ACHAT
      'gamification.spendableXp': increment(userXP),
      'gamification.lastXpGained': userXP,
      'gamification.lastXpSource': source,
      'gamification.lastXpDate': serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    console.log(`✅ [XP Distribution] +${userXP} XP crédités (totalXp + spendableXp)`);

    // ✅ 2. CRÉDITER LE POOL ÉQUIPE (20% BONUS)
    const poolRef = doc(db, 'teamPool', 'main');
    
    // Vérifier si le pool existe
    const poolDoc = await getDoc(poolRef);
    
    if (!poolDoc.exists()) {
      // Créer le pool s'il n'existe pas
      console.log('🆕 [XP Distribution] Création du pool équipe...');
      await setDoc(poolRef, {
        totalXP: teamXP,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        description: 'Pool collectif d\'XP pour récompenses d\'équipe - Bonus 20% des XP gagnés',
        lastContribution: {
          userId,
          amount: teamXP,
          source,
          sourceId,
          timestamp: serverTimestamp()
        }
      });
      console.log(`✅ [XP Distribution] Pool créé avec ${teamXP} XP`);
    } else {
      // Mettre à jour le pool existant
      await updateDoc(poolRef, {
        totalXP: increment(teamXP),
        updatedAt: serverTimestamp(),
        lastContribution: {
          userId,
          amount: teamXP,
          source,
          sourceId,
          timestamp: serverTimestamp()
        }
      });
      console.log(`✅ [XP Distribution] +${teamXP} XP ajoutés au pool équipe`);
    }

    // ✅ 3. RÉSULTAT
    console.log(`✅ [XP Distribution] Distribution terminée avec succès`);
    console.log(`📊 [XP Distribution] Répartition: ${userXP} XP (user totalXp + spendableXp) + ${teamXP} XP (pool bonus) = ${totalCreated} XP créés`);

    return {
      userXP,      // XP reçus par l'utilisateur (100%)
      teamXP,      // XP ajoutés au pool (bonus 20%)
      total: totalCreated  // Total XP créés
    };

  } catch (error) {
    console.error('❌ [XP Distribution] Erreur lors de la distribution:', error);
    throw error;
  }
};

/**
 * 📊 OBTENIR LES STATS DU POOL ÉQUIPE
 * @returns {Promise<{totalXP: number, lastContribution: object}>}
 */
export const getTeamPoolStats = async () => {
  try {
    const poolRef = doc(db, 'teamPool', 'main');
    const poolDoc = await getDoc(poolRef);

    if (!poolDoc.exists()) {
      console.log('⚠️ [XP Distribution] Pool équipe non initialisé');
      return {
        totalXP: 0,
        lastContribution: null,
        exists: false
      };
    }

    const data = poolDoc.data();
    return {
      totalXP: data.totalXP || 0,
      lastContribution: data.lastContribution || null,
      updatedAt: data.updatedAt,
      exists: true
    };

  } catch (error) {
    console.error('❌ [XP Distribution] Erreur récupération stats pool:', error);
    return {
      totalXP: 0,
      lastContribution: null,
      exists: false,
      error: error.message
    };
  }
};

/**
 * 🔧 INITIALISER LE POOL ÉQUIPE (Si nécessaire)
 * @param {number} initialXP - XP initiaux (défaut: 0)
 */
export const initializeTeamPool = async (initialXP = 0) => {
  try {
    const poolRef = doc(db, 'teamPool', 'main');
    const poolDoc = await getDoc(poolRef);

    if (poolDoc.exists()) {
      console.log('✅ [XP Distribution] Pool équipe déjà initialisé');
      return { success: true, alreadyExists: true };
    }

    await setDoc(poolRef, {
      totalXP: initialXP,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      description: 'Pool collectif d\'XP pour récompenses d\'équipe - Bonus 20% des XP gagnés'
    });

    console.log(`✅ [XP Distribution] Pool équipe créé avec ${initialXP} XP`);
    return { success: true, alreadyExists: false, initialXP };

  } catch (error) {
    console.error('❌ [XP Distribution] Erreur initialisation pool:', error);
    throw error;
  }
};

/**
 * 📝 EXEMPLES D'UTILISATION
 * 
 * // Lors de la validation d'une tâche valant 100 XP :
 * await distributeXP(userId, 100, 'task_validation', taskId);
 * // → Utilisateur totalXp : +100 XP (prestige, jamais déduit)
 * // → Utilisateur spendableXp : +100 XP (pour achats)
 * // → Pool équipe : +20 XP (bonus)
 * // → Total créé: 120 XP
 * 
 * // Récupérer les stats du pool :
 * const stats = await getTeamPoolStats();
 * console.log(`Pool équipe: ${stats.totalXP} XP`);
 */

export default {
  distributeXP,
  getTeamPoolStats,
  initializeTeamPool
};
