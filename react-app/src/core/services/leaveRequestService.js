// ==========================================
// 📁 react-app/src/core/services/leaveRequestService.js
// SERVICE DE GESTION DES DEMANDES DE CONGÉS
// Intégré au planning avec validation admin
// ==========================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase.js';
import notificationService from './notificationService.js';

/**
 * 🏖️ TYPES DE CONGÉS
 */
export const LEAVE_TYPES = {
  // === CONGÉS COMPTABILISÉS (jours complets uniquement) ===
  paid_leave: {
    id: 'paid_leave',
    label: 'Congés payés',
    emoji: '🏖️',
    color: '#F59E0B',
    deductsFrom: 'paidLeaveDays',
    category: 'counted',
    fullDayOnly: true
  },
  bonus_day: {
    id: 'bonus_day',
    label: 'Jour bonus (XP)',
    emoji: '🎁',
    color: '#8B5CF6',
    deductsFrom: 'bonusOffDays',
    category: 'counted',
    fullDayOnly: true
  },
  rtt: {
    id: 'rtt',
    label: 'RTT',
    emoji: '⏰',
    color: '#10B981',
    deductsFrom: 'rttDays',
    category: 'counted',
    fullDayOnly: true
  },

  // === ABSENCES JUSTIFIÉES (sans compteur) ===
  sick: {
    id: 'sick',
    label: 'Maladie',
    emoji: '🏥',
    color: '#EF4444',
    deductsFrom: null,
    category: 'justified',
    fullDayOnly: false
  },
  family: {
    id: 'family',
    label: 'Événement familial',
    emoji: '👨‍👩‍👧',
    color: '#EC4899',
    deductsFrom: null,
    category: 'justified',
    fullDayOnly: false
  },
  unpaid: {
    id: 'unpaid',
    label: 'Sans solde',
    emoji: '📅',
    color: '#6B7280',
    deductsFrom: null,
    category: 'justified',
    fullDayOnly: false
  },

  // === DEMANDES SPÉCIFIQUES (illimité, demi-journée/soirée possible) ===
  specific_request: {
    id: 'specific_request',
    label: 'Demande spécifique',
    emoji: '📋',
    color: '#3B82F6',
    deductsFrom: null,
    category: 'specific',
    fullDayOnly: false,
    description: 'Demi-journée, soirée ou repos ponctuel'
  },
  half_day_off: {
    id: 'half_day_off',
    label: 'Demi-journée repos',
    emoji: '🌅',
    color: '#06B6D4',
    deductsFrom: null,
    category: 'specific',
    fullDayOnly: false,
    isHalfDay: true
  },
  evening_off: {
    id: 'evening_off',
    label: 'Soirée libre',
    emoji: '🌙',
    color: '#6366F1',
    deductsFrom: null,
    category: 'specific',
    fullDayOnly: false,
    isEvening: true
  }
};

/**
 * 📊 STATUTS DE DEMANDE
 */
export const REQUEST_STATUS = {
  pending: {
    id: 'pending',
    label: 'En attente',
    emoji: '⏳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  approved: {
    id: 'approved',
    label: 'Approuvée',
    emoji: '✅',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  rejected: {
    id: 'rejected',
    label: 'Refusée',
    emoji: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  }
};

/**
 * 🏖️ SERVICE DE DEMANDES DE CONGÉS
 */
class LeaveRequestService {
  constructor() {
    this.REQUESTS_COLLECTION = 'leave_requests';
    this.USERS_COLLECTION = 'users';
    console.log('🏖️ LeaveRequestService initialisé');
  }

  // ==========================================
  // 📊 SOLDE DE CONGÉS
  // ==========================================

  /**
   * Récupérer le solde de congés d'un utilisateur
   */
  async getLeaveBalance(userId) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return this.getDefaultBalance();
      }

      const userData = userDoc.data();
      const leaveBalance = userData.leaveBalance || this.getDefaultBalance();

      return leaveBalance;
    } catch (error) {
      console.error('❌ Erreur récupération solde congés:', error);
      return this.getDefaultBalance();
    }
  }

  /**
   * Solde par défaut
   */
  getDefaultBalance() {
    return {
      paidLeaveDays: 25, // CP annuels
      bonusOffDays: 0,   // Jours bonus achetés via XP
      rttDays: 0,        // RTT
      usedPaidLeave: 0,
      usedBonusDays: 0,
      usedRtt: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Initialiser le solde de congés pour un utilisateur
   */
  async initializeLeaveBalance(userId, balance = null) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        leaveBalance: balance || this.getDefaultBalance()
      });
      console.log('✅ Solde congés initialisé pour:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur initialisation solde:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ajouter des jours bonus (achetés via XP)
   */
  async addBonusDays(userId, days, source = 'xp_reward') {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        'leaveBalance.bonusOffDays': increment(days),
        'leaveBalance.lastUpdated': new Date().toISOString()
      });
      console.log(`✅ +${days} jours bonus ajoutés pour:`, userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur ajout jours bonus:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 📝 DEMANDES DE CONGÉS
  // ==========================================

  /**
   * Créer une demande de congés
   */
  async createLeaveRequest(requestData) {
    try {
      const {
        userId,
        userName,
        userAvatar,
        leaveType,
        startDate,
        endDate,
        reason,
        halfDayPeriod = null // 'morning', 'afternoon', 'evening'
      } = requestData;

      const leaveTypeConfig = LEAVE_TYPES[leaveType];
      if (!leaveTypeConfig) {
        return { success: false, error: 'Type de congé invalide' };
      }

      // Déterminer si c'est une demande spécifique (illimité)
      const isSpecificRequest = leaveTypeConfig.category === 'specific';
      const isCountedLeave = leaveTypeConfig.category === 'counted';
      const isHalfDayType = leaveTypeConfig.isHalfDay || leaveTypeConfig.isEvening;

      // Calculer le nombre de jours
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      let numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Pour les types demi-journée/soirée, c'est toujours 0.5
      if (isHalfDayType) {
        numberOfDays = 0.5;
      }

      // Vérifier le solde UNIQUEMENT pour les congés comptabilisés
      if (isCountedLeave && leaveTypeConfig.deductsFrom) {
        const balance = await this.getLeaveBalance(userId);
        const available = balance[leaveTypeConfig.deductsFrom] || 0;
        const usedKey = `used${leaveTypeConfig.deductsFrom.charAt(0).toUpperCase() + leaveTypeConfig.deductsFrom.slice(1).replace('Days', '')}Days`;
        const used = balance[usedKey] || 0;
        const remaining = available - used;

        if (numberOfDays > remaining) {
          return {
            success: false,
            error: `Solde insuffisant. Disponible: ${remaining} jour(s), demandé: ${numberOfDays} jour(s)`
          };
        }
      }

      // Créer la demande
      const leaveRequest = {
        userId,
        userName,
        userAvatar: userAvatar || '👤',
        leaveType,
        leaveTypeLabel: leaveTypeConfig.label,
        leaveTypeEmoji: leaveTypeConfig.emoji,
        leaveTypeColor: leaveTypeConfig.color,
        category: leaveTypeConfig.category,
        startDate,
        endDate,
        numberOfDays,
        isSpecificRequest,
        isHalfDay: isHalfDayType,
        halfDayPeriod: halfDayPeriod || (leaveTypeConfig.isEvening ? 'evening' : null),
        reason: reason || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null
      };

      const docRef = await addDoc(collection(db, this.REQUESTS_COLLECTION), leaveRequest);
      console.log('✅ Demande de congés créée:', docRef.id);

      // Notifier les admins planning
      await this.notifyPlanningAdmins(userId, userName, leaveRequest);

      return { success: true, requestId: docRef.id };
    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Approuver une demande
   */
  async approveRequest(requestId, adminId, adminName) {
    try {
      const requestRef = doc(db, this.REQUESTS_COLLECTION, requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return { success: false, error: 'Demande non trouvée' };
      }

      const requestData = requestDoc.data();

      // Mettre à jour le statut
      await updateDoc(requestRef, {
        status: 'approved',
        approvedBy: adminId,
        approvedByName: adminName,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Déduire du solde si applicable
      const leaveTypeConfig = LEAVE_TYPES[requestData.leaveType];
      if (leaveTypeConfig.deductsFrom) {
        const fieldName = `leaveBalance.used${leaveTypeConfig.deductsFrom.charAt(0).toUpperCase() + leaveTypeConfig.deductsFrom.slice(1).replace('Days', '')}Days`;

        const userRef = doc(db, this.USERS_COLLECTION, requestData.userId);
        await updateDoc(userRef, {
          [fieldName]: increment(requestData.numberOfDays),
          'leaveBalance.lastUpdated': new Date().toISOString()
        });
      }

      // Notifier l'utilisateur via la méthode dédiée
      await notificationService.notifyLeaveApproved(requestData.userId, {
        requestId,
        leaveLabel: requestData.leaveTypeLabel,
        startDate: new Date(requestData.startDate).toLocaleDateString('fr-FR'),
        endDate: new Date(requestData.endDate).toLocaleDateString('fr-FR'),
        approverName: adminName
      });

      console.log('✅ Demande approuvée:', requestId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Refuser une demande
   */
  async rejectRequest(requestId, adminId, adminName, reason = '') {
    try {
      const requestRef = doc(db, this.REQUESTS_COLLECTION, requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return { success: false, error: 'Demande non trouvée' };
      }

      const requestData = requestDoc.data();

      // Mettre à jour le statut
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedBy: adminId,
        rejectedByName: adminName,
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      // Notifier l'utilisateur via la méthode dédiée
      await notificationService.notifyLeaveRejected(requestData.userId, {
        requestId,
        leaveLabel: requestData.leaveTypeLabel,
        startDate: new Date(requestData.startDate).toLocaleDateString('fr-FR'),
        endDate: new Date(requestData.endDate).toLocaleDateString('fr-FR'),
        rejectedByName: adminName,
        reason
      });

      console.log('✅ Demande refusée:', requestId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur refus:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 📋 RÉCUPÉRATION DES DEMANDES
  // ==========================================

  /**
   * Récupérer les demandes d'un utilisateur
   */
  async getUserRequests(userId) {
    try {
      const q = query(
        collection(db, this.REQUESTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const requests = [];

      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return requests;
    } catch (error) {
      console.error('❌ Erreur récupération demandes:', error);
      return [];
    }
  }

  /**
   * Récupérer les demandes en attente (pour admin)
   */
  async getPendingRequests() {
    try {
      const q = query(
        collection(db, this.REQUESTS_COLLECTION),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const requests = [];

      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return requests;
    } catch (error) {
      console.error('❌ Erreur récupération demandes en attente:', error);
      return [];
    }
  }

  /**
   * Récupérer les congés approuvés pour une période (affichage planning)
   */
  async getApprovedLeavesForPeriod(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.REQUESTS_COLLECTION),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(q);
      const leaves = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const leaveStart = new Date(data.startDate);
        const leaveEnd = new Date(data.endDate);
        const periodStart = new Date(startDate);
        const periodEnd = new Date(endDate);

        // Vérifier si le congé chevauche la période
        if (leaveStart <= periodEnd && leaveEnd >= periodStart) {
          leaves.push({
            id: doc.id,
            ...data
          });
        }
      });

      return leaves;
    } catch (error) {
      console.error('❌ Erreur récupération congés approuvés:', error);
      return [];
    }
  }

  // ==========================================
  // 🔔 NOTIFICATIONS
  // ==========================================

  /**
   * Notifier les admins planning (basé sur rôles et permissions)
   * Utilise la méthode centralisée du notificationService
   */
  async notifyPlanningAdmins(userId, userName, requestData) {
    try {
      console.log('🔔 Envoi notifications aux admins planning...');

      // Utiliser la méthode centralisée qui gère les rôles et permissions
      const result = await notificationService.notifyLeaveRequest({
        requestId: requestData.id || 'new',
        userId,
        userName,
        leaveType: requestData.leaveType,
        leaveLabel: requestData.leaveTypeLabel,
        startDate: new Date(requestData.startDate).toLocaleDateString('fr-FR'),
        endDate: new Date(requestData.endDate).toLocaleDateString('fr-FR'),
        reason: requestData.reason
      });

      if (result.success) {
        console.log(`✅ ${result.count} admin(s) planning notifié(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur notification admins:', error);
    }
  }

  // ==========================================
  // 🔄 LISTENERS TEMPS RÉEL
  // ==========================================

  /**
   * Écouter les demandes en temps réel (pour admin)
   */
  subscribeToRequests(callback, filters = {}) {
    try {
      let q;

      if (filters.status) {
        q = query(
          collection(db, this.REQUESTS_COLLECTION),
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc')
        );
      } else if (filters.userId) {
        q = query(
          collection(db, this.REQUESTS_COLLECTION),
          where('userId', '==', filters.userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, this.REQUESTS_COLLECTION),
          orderBy('createdAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach(doc => {
          requests.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          });
        });
        callback(requests);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur subscription demandes:', error);
      return () => {};
    }
  }

  /**
   * Écouter le solde de congés en temps réel
   */
  subscribeToLeaveBalance(userId, callback) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);

      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          callback(userData.leaveBalance || this.getDefaultBalance());
        } else {
          callback(this.getDefaultBalance());
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur subscription solde:', error);
      return () => {};
    }
  }
}

// Créer et exporter l'instance du service
const leaveRequestService = new LeaveRequestService();
export default leaveRequestService;
