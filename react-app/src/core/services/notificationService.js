// ==========================================
// 📁 react-app/src/core/services/notificationService.js
// SERVICE DE NOTIFICATIONS - VERSION COMPLÈTE
// ✅ Notifications pour quêtes, infos, badges, XP
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
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔔 TYPES DE NOTIFICATIONS
 */
export const NOTIFICATION_TYPES = {
  // Quêtes
  QUEST_VALIDATION_PENDING: 'quest_validation_pending',
  QUEST_APPROVED: 'quest_approved',
  QUEST_REJECTED: 'quest_rejected',
  QUEST_ASSIGNED: 'quest_assigned',
  QUEST_COMMENT: 'quest_comment',
  
  // XP et Gamification
  XP_EARNED: 'xp_earned',
  LEVEL_UP: 'level_up',
  BADGE_EARNED: 'badge_earned',
  
  // Infos d'équipe
  NEW_INFO: 'new_info',
  INFO_VALIDATED: 'info_validated',
  
  // Récompenses
  REWARD_REQUESTED: 'reward_requested',
  REWARD_APPROVED: 'reward_approved',
  REWARD_REJECTED: 'reward_rejected',
  
  // Système
  SYSTEM: 'system',
  MENTION: 'mention',
  REMINDER: 'reminder'
};

/**
 * 🔔 SERVICE DE NOTIFICATIONS
 */
class NotificationService {
  constructor() {
    this.COLLECTION_NAME = 'notifications';
    this.listeners = new Map();
    console.log('🔔 NotificationService initialisé');
  }

  // ==========================================
  // 📝 MÉTHODES DE BASE
  // ==========================================

  /**
   * ➕ CRÉER UNE NOTIFICATION
   */
  async createNotification(data) {
    try {
      const notificationData = {
        ...data,
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), notificationData);
      console.log('🔔 [NOTIF] Notification créée:', docRef.id);
      
      return { success: true, notificationId: docRef.id };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES NOTIFICATIONS D'UN UTILISATEUR
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { limitCount = 50, unreadOnly = false } = options;

      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (unreadOnly) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      return notifications;
    } catch (error) {
      console.error('❌ [NOTIF] Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * ✅ MARQUER COMME LUE
   */
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur marquage lecture:', error);
      throw error;
    }
  }

  /**
   * ✅ MARQUER TOUTES COMME LUES
   */
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true, readAt: serverTimestamp() })
      );

      await Promise.all(updatePromises);
      console.log(`🔔 [NOTIF] ${snapshot.size} notifications marquées comme lues`);
      
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur marquage toutes lues:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE NOTIFICATION
   */
  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, notificationId));
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * 🔢 COMPTER LES NOTIFICATIONS NON LUES
   */
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('❌ [NOTIF] Erreur comptage:', error);
      return 0;
    }
  }

  // ==========================================
  // 🎯 NOTIFICATIONS QUÊTES
  // ==========================================

  /**
   * 🔔 NOTIFIER LES ADMINS D'UNE QUÊTE EN ATTENTE DE VALIDATION
   */
  async notifyQuestValidationPending(data) {
    try {
      const { questId, validationId, questTitle, userId, userName, xpAmount } = data;

      console.log('🔔 [NOTIF] Notification quête en attente...', { questId, questTitle });

      // Récupérer le nom de l'utilisateur si non fourni
      let displayName = userName;
      if (!displayName && userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            displayName = userData.displayName || userData.profile?.displayName || userData.email?.split('@')[0] || 'Utilisateur';
          }
        } catch (e) {
          displayName = 'Utilisateur';
        }
      }

      // Récupérer tous les admins
      const adminsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const adminsSnapshot = await getDocs(adminsQuery);
      
      if (adminsSnapshot.empty) {
        // Fallback: chercher par email admin connu
        const adminEmailQuery = query(
          collection(db, 'users'),
          where('email', '==', 'alan.boehme61@gmail.com')
        );
        const adminEmailSnapshot = await getDocs(adminEmailQuery);
        
        if (!adminEmailSnapshot.empty) {
          const adminDoc = adminEmailSnapshot.docs[0];
          await this.createNotification({
            userId: adminDoc.id,
            type: NOTIFICATION_TYPES.QUEST_VALIDATION_PENDING,
            title: '🎯 Nouvelle quête à valider',
            message: `${displayName} a soumis la quête "${questTitle}" (+${xpAmount || 25} XP)`,
            data: {
              questId,
              validationId,
              requesterId: userId,
              requesterName: displayName,
              xpAmount: xpAmount || 25,
              questTitle
            },
            priority: 'high',
            actionUrl: '/admin/validation'
          });
          console.log('🔔 [NOTIF] Admin notifié (par email)');
          return { success: true, count: 1 };
        }
        
        console.warn('⚠️ [NOTIF] Aucun admin trouvé');
        return { success: false, message: 'Aucun admin trouvé' };
      }

      // Créer une notification pour chaque admin
      const notificationPromises = adminsSnapshot.docs.map(adminDoc => 
        this.createNotification({
          userId: adminDoc.id,
          type: NOTIFICATION_TYPES.QUEST_VALIDATION_PENDING,
          title: '🎯 Nouvelle quête à valider',
          message: `${displayName} a soumis la quête "${questTitle}" (+${xpAmount || 25} XP)`,
          data: {
            questId,
            validationId,
            requesterId: userId,
            requesterName: displayName,
            xpAmount: xpAmount || 25,
            questTitle
          },
          priority: 'high',
          actionUrl: '/admin/validation'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${adminsSnapshot.size} admins notifiés pour quête ${questId}`);

      return { success: true, count: adminsSnapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification admins:', error);
      // Ne pas propager l'erreur - la notification n'est pas critique
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ NOTIFIER L'UTILISATEUR D'UNE QUÊTE APPROUVÉE
   */
  async notifyQuestApproved(userId, data) {
    try {
      const { questId, questTitle, xpAmount, adminComment } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.QUEST_APPROVED,
        title: '🎉 Quête validée !',
        message: `Votre quête "${questTitle}" a été approuvée ! +${xpAmount || 25} XP`,
        data: {
          questId,
          questTitle,
          xpAmount: xpAmount || 25,
          adminComment
        },
        priority: 'high'
      });

      console.log(`🔔 [NOTIF] Utilisateur ${userId} notifié - quête approuvée`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification approbation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ❌ NOTIFIER L'UTILISATEUR D'UNE QUÊTE REJETÉE
   */
  async notifyQuestRejected(userId, data) {
    try {
      const { questId, questTitle, reason } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.QUEST_REJECTED,
        title: '❌ Quête non validée',
        message: `Votre quête "${questTitle}" n'a pas été validée. Raison: ${reason}`,
        data: {
          questId,
          questTitle,
          reason
        },
        priority: 'high'
      });

      console.log(`🔔 [NOTIF] Utilisateur ${userId} notifié - quête rejetée`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification rejet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 NOTIFIER L'ASSIGNATION D'UNE QUÊTE
   */
  async notifyQuestAssigned(userId, data) {
    try {
      const { questId, questTitle, assignedBy, xpReward } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.QUEST_ASSIGNED,
        title: '📋 Nouvelle quête assignée',
        message: `On vous a assigné la quête "${questTitle}" (+${xpReward || 25} XP)`,
        data: {
          questId,
          questTitle,
          assignedBy,
          xpReward
        },
        priority: 'medium',
        actionUrl: `/tasks?id=${questId}`
      });

      console.log(`🔔 [NOTIF] Utilisateur ${userId} notifié - quête assignée`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification assignation:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 🏆 NOTIFICATIONS GAMIFICATION
  // ==========================================

  /**
   * ⭐ NOTIFIER UN GAIN D'XP
   */
  async notifyXPEarned(userId, data) {
    try {
      const { xpAmount, source, newTotal } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.XP_EARNED,
        title: `⭐ +${xpAmount} XP !`,
        message: `Vous avez gagné ${xpAmount} XP pour: ${source}`,
        data: {
          xpAmount,
          source,
          newTotal
        },
        priority: 'low'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification XP:', error);
      return { success: false };
    }
  }

  /**
   * 🆙 NOTIFIER UN PASSAGE DE NIVEAU
   */
  async notifyLevelUp(userId, data) {
    try {
      const { newLevel, previousLevel } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.LEVEL_UP,
        title: `🎊 Niveau ${newLevel} atteint !`,
        message: `Félicitations ! Vous êtes passé du niveau ${previousLevel} au niveau ${newLevel} !`,
        data: {
          newLevel,
          previousLevel
        },
        priority: 'high'
      });

      console.log(`🔔 [NOTIF] Utilisateur ${userId} notifié - niveau ${newLevel}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification niveau:', error);
      return { success: false };
    }
  }

  /**
   * 🏅 NOTIFIER UN BADGE OBTENU
   */
  async notifyBadgeEarned(userId, data) {
    try {
      const { badgeId, badgeName, badgeIcon, badgeDescription } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.BADGE_EARNED,
        title: `🏅 Nouveau badge : ${badgeName}`,
        message: badgeDescription || `Vous avez débloqué le badge "${badgeName}" !`,
        data: {
          badgeId,
          badgeName,
          badgeIcon,
          badgeDescription
        },
        priority: 'high'
      });

      console.log(`🔔 [NOTIF] Utilisateur ${userId} notifié - badge ${badgeName}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification badge:', error);
      return { success: false };
    }
  }

  // ==========================================
  // 📢 NOTIFICATIONS INFOS D'ÉQUIPE
  // ==========================================

  /**
   * 📢 NOTIFIER TOUS LES UTILISATEURS D'UNE NOUVELLE INFO
   */
  async notifyAllUsersNewInfo(data) {
    try {
      const { infoId, infoTitle, infoType, authorName, priority } = data;

      console.log('🔔 [NOTIF] Notification nouvelle info à tous les utilisateurs...');

      // Récupérer tous les utilisateurs actifs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      if (usersSnapshot.empty) {
        console.warn('⚠️ [NOTIF] Aucun utilisateur trouvé');
        return { success: false, message: 'Aucun utilisateur' };
      }

      // Créer une notification pour chaque utilisateur
      const notificationPromises = usersSnapshot.docs.map(userDoc => 
        this.createNotification({
          userId: userDoc.id,
          type: NOTIFICATION_TYPES.NEW_INFO,
          title: `📢 ${priority === 'urgent' ? '🚨 ' : ''}Nouvelle info : ${infoTitle}`,
          message: `${authorName} a publié une nouvelle information${priority === 'urgent' ? ' URGENTE' : ''}`,
          data: {
            infoId,
            infoTitle,
            infoType,
            authorName,
            priority
          },
          priority: priority === 'urgent' ? 'high' : 'medium',
          actionUrl: '/infos'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${usersSnapshot.size} utilisateurs notifiés pour nouvelle info`);

      return { success: true, count: usersSnapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification nouvelle info:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 🎁 NOTIFICATIONS RÉCOMPENSES
  // ==========================================

  /**
   * 🎁 NOTIFIER LES ADMINS D'UNE DEMANDE DE RÉCOMPENSE
   */
  async notifyRewardRequested(data) {
    try {
      const { rewardId, rewardName, userId, userName, cost } = data;

      // Récupérer tous les admins
      const adminsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const adminsSnapshot = await getDocs(adminsQuery);
      
      const notificationPromises = adminsSnapshot.docs.map(adminDoc => 
        this.createNotification({
          userId: adminDoc.id,
          type: NOTIFICATION_TYPES.REWARD_REQUESTED,
          title: '🎁 Nouvelle demande de récompense',
          message: `${userName} demande la récompense "${rewardName}" (${cost} points)`,
          data: {
            rewardId,
            rewardName,
            requesterId: userId,
            requesterName: userName,
            cost
          },
          priority: 'medium',
          actionUrl: '/admin/rewards'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${adminsSnapshot.size} admins notifiés pour récompense`);

      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification récompense:', error);
      return { success: false };
    }
  }

  /**
   * ✅ NOTIFIER L'APPROBATION D'UNE RÉCOMPENSE
   */
  async notifyRewardApproved(userId, data) {
    try {
      const { rewardName, adminComment } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.REWARD_APPROVED,
        title: '🎉 Récompense approuvée !',
        message: `Votre demande pour "${rewardName}" a été approuvée !`,
        data: { rewardName, adminComment },
        priority: 'high'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification récompense approuvée:', error);
      return { success: false };
    }
  }

  /**
   * ❌ NOTIFIER LE REJET D'UNE RÉCOMPENSE
   */
  async notifyRewardRejected(userId, data) {
    try {
      const { rewardName, reason } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.REWARD_REJECTED,
        title: '❌ Récompense refusée',
        message: `Votre demande pour "${rewardName}" a été refusée. Raison: ${reason}`,
        data: { rewardName, reason },
        priority: 'high'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification récompense refusée:', error);
      return { success: false };
    }
  }

  // ==========================================
  // 🎧 LISTENERS TEMPS RÉEL
  // ==========================================

  /**
   * 🎧 ÉCOUTER LES NOTIFICATIONS EN TEMPS RÉEL
   */
  subscribeToNotifications(userId, callback) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = [];
        snapshot.forEach(doc => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
        callback(notifications);
      }, (error) => {
        console.error('❌ [NOTIF] Erreur listener:', error);
      });

      const listenerId = `notif_${userId}_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);

      return listenerId;
    } catch (error) {
      console.error('❌ [NOTIF] Erreur création listener:', error);
      return null;
    }
  }

  /**
   * 🛑 ARRÊTER L'ÉCOUTE
   */
  unsubscribe(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      console.log('🔔 [NOTIF] Listener arrêté:', listenerId);
    }
  }

  /**
   * 🧹 NETTOYER TOUS LES LISTENERS
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    console.log('🔔 [NOTIF] Tous les listeners nettoyés');
  }
}

// ✅ INSTANCE UNIQUE
const notificationService = new NotificationService();

// ✅ EXPORTS
export { notificationService, NOTIFICATION_TYPES };
export default notificationService;

console.log('🔔 NotificationService prêt - Version complète');
