// ==========================================
// react-app/src/core/services/leaveAccrualService.js
// SERVICE DE GESTION AUTOMATISÉE DES CONGÉS PAYÉS
// Accumulation mensuelle + Déduction automatique + Audit
// ==========================================

import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION DES CONGÉS
// ==========================================
const LEAVE_CONFIG = {
  // Taux d'accumulation mensuel (25 jours / 12 mois = 2.08 jours/mois)
  MONTHLY_ACCRUAL_RATE: 2.08,

  // Jours CP annuels par défaut
  ANNUAL_CP_DAYS: 25,

  // Maximum de jours reportables N-1
  MAX_CARRYOVER_DAYS: 5,

  // Mois de reset (0 = Janvier, 5 = Juin pour année fiscale)
  RESET_MONTH: 0, // Janvier

  // Types de congés qui déduisent du solde
  DEDUCTIBLE_TYPES: ['paid_leave', 'cp', 'conge_paye'],

  // Types bonus
  BONUS_TYPES: ['bonus_day', 'bonus'],

  // Types RTT
  RTT_TYPES: ['rtt']
};

// ==========================================
// SERVICE D'ACCUMULATION
// ==========================================
class LeaveAccrualService {
  constructor() {
    console.log('🏖️ LeaveAccrualService initialisé');
  }

  // ==========================================
  // ACCUMULATION MENSUELLE
  // ==========================================

  /**
   * Exécuter l'accumulation mensuelle pour tous les employés
   * À appeler le 1er de chaque mois (manuellement ou via Cloud Function)
   */
  async runMonthlyAccrual(options = {}) {
    const {
      accrualRate = LEAVE_CONFIG.MONTHLY_ACCRUAL_RATE,
      targetMonth = new Date().getMonth(),
      targetYear = new Date().getFullYear(),
      dryRun = false
    } = options;

    console.log(`🔄 Accumulation mensuelle CP - ${targetMonth + 1}/${targetYear}`);

    const results = {
      processed: 0,
      updated: 0,
      errors: [],
      details: []
    };

    try {
      // Récupérer tous les utilisateurs actifs
      const usersSnapshot = await getDocs(collection(db, 'users'));

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Ignorer les utilisateurs inactifs
        if (userData.isActive === false) {
          continue;
        }

        results.processed++;

        try {
          const currentBalance = userData.leaveBalance || this.getDefaultBalance();

          // Vérifier si l'accumulation a déjà été faite ce mois
          const lastAccrual = currentBalance.lastAccrualDate?.toDate?.() || null;
          if (lastAccrual) {
            const lastAccrualMonth = lastAccrual.getMonth();
            const lastAccrualYear = lastAccrual.getFullYear();

            if (lastAccrualMonth === targetMonth && lastAccrualYear === targetYear) {
              results.details.push({
                userId: userDoc.id,
                name: userData.displayName || userData.email,
                status: 'skipped',
                reason: 'Déjà accumulé ce mois'
              });
              continue;
            }
          }

          // Calculer le nouveau solde
          const previousCP = currentBalance.paidLeaveDays || 0;
          const newCP = Math.round((previousCP + accrualRate) * 100) / 100;

          const updateData = {
            'leaveBalance.paidLeaveDays': newCP,
            'leaveBalance.lastAccrualDate': serverTimestamp(),
            'leaveBalance.lastAccrualAmount': accrualRate,
            'leaveBalance.lastUpdated': serverTimestamp()
          };

          if (!dryRun) {
            await updateDoc(doc(db, 'users', userDoc.id), updateData);

            // Enregistrer dans l'historique
            await this.logBalanceChange({
              userId: userDoc.id,
              type: 'accrual',
              previousValue: previousCP,
              newValue: newCP,
              change: accrualRate,
              reason: `Accumulation mensuelle ${targetMonth + 1}/${targetYear}`,
              automatic: true
            });
          }

          results.updated++;
          results.details.push({
            userId: userDoc.id,
            name: userData.displayName || userData.email,
            status: 'updated',
            previousCP,
            newCP,
            added: accrualRate
          });

        } catch (error) {
          results.errors.push({
            userId: userDoc.id,
            error: error.message
          });
        }
      }

      console.log(`✅ Accumulation terminée: ${results.updated}/${results.processed} mis à jour`);
      return results;

    } catch (error) {
      console.error('❌ Erreur accumulation mensuelle:', error);
      throw error;
    }
  }

  /**
   * Accumuler les CP pour un employé spécifique
   */
  async accrueForEmployee(userId, amount = LEAVE_CONFIG.MONTHLY_ACCRUAL_RATE, reason = 'Accumulation manuelle') {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const currentBalance = userData.leaveBalance || this.getDefaultBalance();
      const previousCP = currentBalance.paidLeaveDays || 0;
      const newCP = Math.round((previousCP + amount) * 100) / 100;

      await updateDoc(userRef, {
        'leaveBalance.paidLeaveDays': newCP,
        'leaveBalance.lastUpdated': serverTimestamp()
      });

      await this.logBalanceChange({
        userId,
        type: 'accrual',
        previousValue: previousCP,
        newValue: newCP,
        change: amount,
        reason,
        automatic: false
      });

      return { previousCP, newCP, added: amount };

    } catch (error) {
      console.error('❌ Erreur accumulation employé:', error);
      throw error;
    }
  }

  // ==========================================
  // DÉDUCTION AUTOMATIQUE
  // ==========================================

  /**
   * Déduire les CP lors de l'approbation d'une demande
   */
  async deductLeaveOnApproval(userId, leaveType, days, requestId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const currentBalance = userData.leaveBalance || this.getDefaultBalance();

      let fieldToUpdate = null;
      let usedFieldToUpdate = null;
      let previousValue = 0;

      // Déterminer quel compteur déduire
      const leaveTypeLower = (leaveType || '').toLowerCase();

      if (LEAVE_CONFIG.DEDUCTIBLE_TYPES.some(t => leaveTypeLower.includes(t))) {
        fieldToUpdate = 'leaveBalance.paidLeaveDays';
        usedFieldToUpdate = 'leaveBalance.usedPaidLeaveDays';
        previousValue = currentBalance.paidLeaveDays || 0;
      } else if (LEAVE_CONFIG.BONUS_TYPES.some(t => leaveTypeLower.includes(t))) {
        fieldToUpdate = 'leaveBalance.bonusOffDays';
        usedFieldToUpdate = 'leaveBalance.usedBonusDays';
        previousValue = currentBalance.bonusOffDays || 0;
      } else if (LEAVE_CONFIG.RTT_TYPES.some(t => leaveTypeLower.includes(t))) {
        fieldToUpdate = 'leaveBalance.rttDays';
        usedFieldToUpdate = 'leaveBalance.usedRttDays';
        previousValue = currentBalance.rttDays || 0;
      } else {
        // Type non déductible (maladie, sans solde, etc.)
        console.log(`ℹ️ Type ${leaveType} non déductible du solde`);
        return { deducted: false, reason: 'Type non déductible' };
      }

      // Vérifier le solde disponible
      const usedField = usedFieldToUpdate.split('.')[1];
      const used = currentBalance[usedField] || 0;
      const available = previousValue - used;

      if (available < days) {
        throw new Error(`Solde insuffisant: ${available} jours disponibles, ${days} demandés`);
      }

      // Mettre à jour le compteur "utilisé"
      const newUsed = Math.round((used + days) * 100) / 100;

      await updateDoc(userRef, {
        [usedFieldToUpdate]: newUsed,
        'leaveBalance.lastUpdated': serverTimestamp()
      });

      await this.logBalanceChange({
        userId,
        type: 'deduction',
        leaveType,
        previousValue: used,
        newValue: newUsed,
        change: -days,
        reason: `Congé approuvé (${days} jours)`,
        requestId,
        automatic: true
      });

      console.log(`✅ ${days} jours déduits pour ${userId} (${leaveType})`);
      return {
        deducted: true,
        days,
        previousUsed: used,
        newUsed,
        remaining: previousValue - newUsed
      };

    } catch (error) {
      console.error('❌ Erreur déduction congés:', error);
      throw error;
    }
  }

  /**
   * Restaurer les CP lors du rejet/annulation d'une demande approuvée
   */
  async restoreLeaveOnCancellation(userId, leaveType, days, requestId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const currentBalance = userData.leaveBalance || this.getDefaultBalance();

      let usedFieldToUpdate = null;
      const leaveTypeLower = (leaveType || '').toLowerCase();

      if (LEAVE_CONFIG.DEDUCTIBLE_TYPES.some(t => leaveTypeLower.includes(t))) {
        usedFieldToUpdate = 'leaveBalance.usedPaidLeaveDays';
      } else if (LEAVE_CONFIG.BONUS_TYPES.some(t => leaveTypeLower.includes(t))) {
        usedFieldToUpdate = 'leaveBalance.usedBonusDays';
      } else if (LEAVE_CONFIG.RTT_TYPES.some(t => leaveTypeLower.includes(t))) {
        usedFieldToUpdate = 'leaveBalance.usedRttDays';
      } else {
        return { restored: false, reason: 'Type non déductible' };
      }

      const usedField = usedFieldToUpdate.split('.')[1];
      const currentUsed = currentBalance[usedField] || 0;
      const newUsed = Math.max(0, Math.round((currentUsed - days) * 100) / 100);

      await updateDoc(userRef, {
        [usedFieldToUpdate]: newUsed,
        'leaveBalance.lastUpdated': serverTimestamp()
      });

      await this.logBalanceChange({
        userId,
        type: 'restoration',
        leaveType,
        previousValue: currentUsed,
        newValue: newUsed,
        change: days,
        reason: `Congé annulé/rejeté (${days} jours restaurés)`,
        requestId,
        automatic: true
      });

      console.log(`✅ ${days} jours restaurés pour ${userId}`);
      return { restored: true, days, previousUsed: currentUsed, newUsed };

    } catch (error) {
      console.error('❌ Erreur restauration congés:', error);
      throw error;
    }
  }

  // ==========================================
  // MODIFICATION MANUELLE
  // ==========================================

  /**
   * Modifier manuellement le solde d'un employé (admin)
   */
  async adjustBalance(userId, adjustments, reason, adminId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const currentBalance = userData.leaveBalance || this.getDefaultBalance();
      const updates = {};
      const changes = [];

      // Appliquer chaque ajustement
      if (adjustments.paidLeaveDays !== undefined) {
        const prev = currentBalance.paidLeaveDays || 0;
        updates['leaveBalance.paidLeaveDays'] = adjustments.paidLeaveDays;
        changes.push({ field: 'CP', prev, new: adjustments.paidLeaveDays });
      }

      if (adjustments.usedPaidLeaveDays !== undefined) {
        const prev = currentBalance.usedPaidLeaveDays || 0;
        updates['leaveBalance.usedPaidLeaveDays'] = adjustments.usedPaidLeaveDays;
        changes.push({ field: 'CP utilisés', prev, new: adjustments.usedPaidLeaveDays });
      }

      if (adjustments.bonusOffDays !== undefined) {
        const prev = currentBalance.bonusOffDays || 0;
        updates['leaveBalance.bonusOffDays'] = adjustments.bonusOffDays;
        changes.push({ field: 'Bonus', prev, new: adjustments.bonusOffDays });
      }

      if (adjustments.rttDays !== undefined) {
        const prev = currentBalance.rttDays || 0;
        updates['leaveBalance.rttDays'] = adjustments.rttDays;
        changes.push({ field: 'RTT', prev, new: adjustments.rttDays });
      }

      updates['leaveBalance.lastUpdated'] = serverTimestamp();

      await updateDoc(userRef, updates);

      // Logger chaque changement
      for (const change of changes) {
        await this.logBalanceChange({
          userId,
          type: 'manual_adjustment',
          field: change.field,
          previousValue: change.prev,
          newValue: change.new,
          change: change.new - change.prev,
          reason: reason || 'Ajustement manuel',
          adminId,
          automatic: false
        });
      }

      console.log(`✅ Solde ajusté pour ${userId}:`, changes);
      return { success: true, changes };

    } catch (error) {
      console.error('❌ Erreur ajustement solde:', error);
      throw error;
    }
  }

  // ==========================================
  // RESET ANNUEL
  // ==========================================

  /**
   * Effectuer le reset annuel des compteurs
   * À appeler le 1er janvier (ou autre date selon config)
   */
  async runAnnualReset(options = {}) {
    const {
      carryoverMax = LEAVE_CONFIG.MAX_CARRYOVER_DAYS,
      resetBonusDays = true,
      resetRttDays = true,
      dryRun = false
    } = options;

    console.log('🔄 Reset annuel des congés...');

    const results = {
      processed: 0,
      reset: 0,
      carryovers: [],
      errors: []
    };

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        if (userData.isActive === false) continue;

        results.processed++;

        try {
          const currentBalance = userData.leaveBalance || this.getDefaultBalance();

          // Calculer le reliquat
          const totalCP = currentBalance.paidLeaveDays || 0;
          const usedCP = currentBalance.usedPaidLeaveDays || 0;
          const remainingCP = totalCP - usedCP;
          const carryover = Math.min(remainingCP, carryoverMax);

          const updates = {
            // Nouveaux CP = accumulation annuelle
            'leaveBalance.paidLeaveDays': LEAVE_CONFIG.ANNUAL_CP_DAYS,
            // Reset du compteur utilisé
            'leaveBalance.usedPaidLeaveDays': 0,
            // Stocker le reliquat N-1
            'leaveBalance.carryoverDays': carryover,
            'leaveBalance.lastResetDate': serverTimestamp(),
            'leaveBalance.lastUpdated': serverTimestamp()
          };

          if (resetBonusDays) {
            updates['leaveBalance.bonusOffDays'] = 0;
            updates['leaveBalance.usedBonusDays'] = 0;
          }

          if (resetRttDays) {
            updates['leaveBalance.rttDays'] = 0;
            updates['leaveBalance.usedRttDays'] = 0;
          }

          if (!dryRun) {
            await updateDoc(doc(db, 'users', userDoc.id), updates);

            await this.logBalanceChange({
              userId: userDoc.id,
              type: 'annual_reset',
              previousValue: totalCP,
              newValue: LEAVE_CONFIG.ANNUAL_CP_DAYS,
              carryover,
              reason: `Reset annuel - ${carryover} jours reportés`,
              automatic: true
            });
          }

          results.reset++;
          results.carryovers.push({
            userId: userDoc.id,
            name: userData.displayName || userData.email,
            previousTotal: totalCP,
            previousUsed: usedCP,
            carryover
          });

        } catch (error) {
          results.errors.push({
            userId: userDoc.id,
            error: error.message
          });
        }
      }

      console.log(`✅ Reset annuel terminé: ${results.reset}/${results.processed}`);
      return results;

    } catch (error) {
      console.error('❌ Erreur reset annuel:', error);
      throw error;
    }
  }

  // ==========================================
  // HISTORIQUE ET AUDIT
  // ==========================================

  /**
   * Enregistrer un changement de solde dans l'historique
   */
  async logBalanceChange(data) {
    try {
      // Filtrer les valeurs undefined pour éviter les erreurs Firebase
      const cleanData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          cleanData[key] = data[key];
        }
      });

      await addDoc(collection(db, 'leave_balance_history'), {
        ...cleanData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('⚠️ Erreur log historique:', error);
      // Ne pas bloquer l'opération principale
    }
  }

  /**
   * Récupérer l'historique des modifications pour un employé
   */
  async getBalanceHistory(userId, limit = 50) {
    try {
      const q = query(
        collection(db, 'leave_balance_history'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()
      }));

    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      return [];
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Obtenir le solde par défaut
   */
  getDefaultBalance() {
    return {
      paidLeaveDays: 0,
      usedPaidLeaveDays: 0,
      bonusOffDays: 0,
      usedBonusDays: 0,
      rttDays: 0,
      usedRttDays: 0,
      carryoverDays: 0,
      lastUpdated: null,
      lastAccrualDate: null
    };
  }

  /**
   * Calculer le solde disponible pour un employé
   */
  async getAvailableBalance(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const userData = userSnap.data();
      const balance = userData.leaveBalance || this.getDefaultBalance();

      return {
        cp: {
          total: balance.paidLeaveDays || 0,
          used: balance.usedPaidLeaveDays || 0,
          available: (balance.paidLeaveDays || 0) - (balance.usedPaidLeaveDays || 0),
          carryover: balance.carryoverDays || 0
        },
        bonus: {
          total: balance.bonusOffDays || 0,
          used: balance.usedBonusDays || 0,
          available: (balance.bonusOffDays || 0) - (balance.usedBonusDays || 0)
        },
        rtt: {
          total: balance.rttDays || 0,
          used: balance.usedRttDays || 0,
          available: (balance.rttDays || 0) - (balance.usedRttDays || 0)
        },
        lastUpdated: balance.lastUpdated?.toDate?.() || null,
        lastAccrual: balance.lastAccrualDate?.toDate?.() || null
      };

    } catch (error) {
      console.error('❌ Erreur récupération solde:', error);
      return null;
    }
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig() {
    return { ...LEAVE_CONFIG };
  }
}

// Export singleton
const leaveAccrualService = new LeaveAccrualService();
export default leaveAccrualService;
export { leaveAccrualService, LEAVE_CONFIG };
