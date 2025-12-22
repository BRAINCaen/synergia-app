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
  paid_leave: {
    id: 'paid_leave',
    label: 'Congés payés',
    emoji: '🏖️',
    color: '#F59E0B',
    deductsFrom: 'paidLeaveDays' // Déduit du compteur CP
  },
  bonus_day: {
    id: 'bonus_day',
    label: 'Jour bonus (XP)',
    emoji: '🎁',
    color: '#8B5CF6',
    deductsFrom: 'bonusOffDays' // Déduit du compteur jours bonus
  },
  rtt: {
    id: 'rtt',
    label: 'RTT',
    emoji: '⏰',
    color: '#10B981',
    deductsFrom: 'rttDays'
  },
  unpaid: {
    id: 'unpaid',
    label: 'Sans solde',
    emoji: '📅',
    color: '#6B7280',
    deductsFrom: null // Ne déduit rien
  },
  sick: {
    id: 'sick',
    label: 'Maladie',
    emoji: '🏥',
    color: '#EF4444',
    deductsFrom: null
  },
  family: {
    id: 'family',
    label: 'Événement familial',
    emoji: '👨‍👩‍👧',
    color: '#EC4899',
    deductsFrom: null
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
        halfDay = false,
        halfDayPeriod = null // 'morning' ou 'afternoon'
      } = requestData;

      // Calculer le nombre de jours
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      let numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (halfDay) {
        numberOfDays = 0.5;
      }

      // Vérifier le solde disponible
      const balance = await this.getLeaveBalance(userId);
      const leaveTypeConfig = LEAVE_TYPES[leaveType];

      if (leaveTypeConfig.deductsFrom) {
        const available = balance[leaveTypeConfig.deductsFrom] || 0;
        const used = balance[`used${leaveTypeConfig.deductsFrom.charAt(0).toUpperCase() + leaveTypeConfig.deductsFrom.slice(1)}`] || 0;
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
        startDate,
        endDate,
        numberOfDays,
        halfDay,
        halfDayPeriod,
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

      // Notifier l'utilisateur
      await notificationService.createNotification({
        userId: requestData.userId,
        type: 'leave_approved',
        title: '✅ Congés approuvés !',
        message: `Votre demande de ${requestData.leaveTypeLabel} du ${new Date(requestData.startDate).toLocaleDateString('fr-FR')} au ${new Date(requestData.endDate).toLocaleDateString('fr-FR')} a été approuvée par ${adminName}.`,
        icon: '🏖️',
        link: '/planning'
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

      // Notifier l'utilisateur
      await notificationService.createNotification({
        userId: requestData.userId,
        type: 'leave_rejected',
        title: '❌ Demande de congés refusée',
        message: `Votre demande de ${requestData.leaveTypeLabel} a été refusée${reason ? `: ${reason}` : '.'}`,
        icon: '🏖️',
        link: '/planning'
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
   * Notifier les admins planning
   */
  async notifyPlanningAdmins(userId, userName, requestData) {
    try {
      // Récupérer les admins planning (ceux avec permission planning_admin)
      const usersQuery = query(
        collection(db, this.USERS_COLLECTION),
        where('role', 'in', ['admin', 'manager'])
      );

      const usersSnapshot = await getDocs(usersQuery);

      usersSnapshot.forEach(async (userDoc) => {
        if (userDoc.id !== userId) {
          await notificationService.createNotification({
            userId: userDoc.id,
            type: 'leave_request',
            title: '📅 Nouvelle demande de congés',
            message: `${userName} demande ${requestData.numberOfDays} jour(s) de ${requestData.leaveTypeLabel} du ${new Date(requestData.startDate).toLocaleDateString('fr-FR')} au ${new Date(requestData.endDate).toLocaleDateString('fr-FR')}`,
            icon: '🏖️',
            link: '/planning',
            actionRequired: true
          });
        }
      });

      console.log('✅ Admins planning notifiés');
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
