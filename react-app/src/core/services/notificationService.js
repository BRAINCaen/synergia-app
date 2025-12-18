// ==========================================
// 📁 react-app/src/core/services/notificationService.js
// SERVICE DE NOTIFICATIONS - VERSION CORRIGÉE
// ✅ FIX: subscribeToNotifications retourne la fonction unsubscribe
// ✅ FIX: Conversion des timestamps Firestore en Date JavaScript
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
const NOTIFICATION_TYPES = {
  // Quêtes/Tâches
  QUEST_VALIDATION_PENDING: 'quest_validation_pending',
  QUEST_APPROVED: 'quest_approved',
  QUEST_REJECTED: 'quest_rejected',
  QUEST_ASSIGNED: 'quest_assigned',
  TASK_ASSIGNED: 'task_assigned',

  // XP et Gamification
  XP_EARNED: 'xp_earned',
  LEVEL_UP: 'level_up',
  BADGE_EARNED: 'badge_earned',

  // Boosts (micro-feedback entre collègues)
  BOOST_RECEIVED: 'boost_received',

  // Infos d'équipe
  NEW_INFO: 'new_info',

  // Récompenses
  REWARD_REQUESTED: 'reward_requested',
  REWARD_APPROVED: 'reward_approved',
  REWARD_REJECTED: 'reward_rejected',

  // Cagnotte équipe
  POOL_CONTRIBUTION: 'pool_contribution',
  POOL_LEVEL_UP: 'pool_level_up',
  POOL_REWARD_PURCHASED: 'pool_reward_purchased',

  // Système
  SYSTEM: 'system',
  MENTION: 'mention'
};

/**
 * 🔔 SERVICE DE NOTIFICATIONS
 */
class NotificationService {
  constructor() {
    this.COLLECTION_NAME = 'notifications';
    console.log('🔔 NotificationService initialisé');
  }

  // ==========================================
  // 🔧 HELPER: Convertir Timestamp Firestore en Date
  // ==========================================
  
  convertTimestamp(timestamp) {
    if (!timestamp) return null;
    
    try {
      // Si c'est un Timestamp Firestore avec toDate()
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      // Si c'est un objet avec seconds (Timestamp sérialisé)
      if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000);
      }
      // Si c'est déjà une Date
      if (timestamp instanceof Date) {
        return timestamp;
      }
      // Si c'est un string ISO
      if (typeof timestamp === 'string') {
        return new Date(timestamp);
      }
      // Si c'est un nombre (timestamp en ms)
      if (typeof timestamp === 'number') {
        return new Date(timestamp);
      }
      return null;
    } catch (error) {
      console.warn('⚠️ [NOTIF] Erreur conversion timestamp:', error);
      return null;
    }
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
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 RÉCUPÉRER LES NOTIFICATIONS D'UN UTILISATEUR
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { limitCount = 50 } = options;

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({ 
          id: doc.id, 
          ...data,
          // ✅ CONVERTIR LE TIMESTAMP EN DATE
          createdAt: this.convertTimestamp(data.createdAt),
          readAt: this.convertTimestamp(data.readAt)
        });
      });

      return notifications;
    } catch (error) {
      console.error('❌ [NOTIF] Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * 🎧 ÉCOUTER LES NOTIFICATIONS EN TEMPS RÉEL
   * ✅ CORRIGÉ: Retourne directement la fonction unsubscribe
   */
  subscribeToNotifications(userId, callback) {
    try {
      if (!userId) {
        console.warn('⚠️ [NOTIF] userId manquant pour subscription');
        return () => {}; // Retourner une fonction vide
      }

      console.log('🔔 [NOTIF] Abonnement notifications pour:', userId);

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      // ✅ RETOURNER DIRECTEMENT la fonction unsubscribe de onSnapshot
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          try {
            const notifications = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              notifications.push({ 
                id: doc.id, 
                ...data,
                // ✅ CONVERTIR LES TIMESTAMPS EN DATE
                createdAt: this.convertTimestamp(data.createdAt),
                readAt: this.convertTimestamp(data.readAt)
              });
            });
            
            // Appeler le callback avec les notifications converties
            if (typeof callback === 'function') {
              callback(notifications);
            }
          } catch (error) {
            console.error('❌ [NOTIF] Erreur traitement snapshot:', error);
            if (typeof callback === 'function') {
              callback([]);
            }
          }
        },
        (error) => {
          console.error('❌ [NOTIF] Erreur listener notifications:', error);
          if (typeof callback === 'function') {
            callback([]);
          }
        }
      );

      // ✅ RETOURNER LA FONCTION UNSUBSCRIBE DIRECTEMENT
      return unsubscribe;

    } catch (error) {
      console.error('❌ [NOTIF] Erreur création subscription:', error);
      return () => {}; // Retourner une fonction vide en cas d'erreur
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
      console.log('✅ [NOTIF] Notification marquée comme lue:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur marquage lecture:', error);
      return { success: false, error: error.message };
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
      const updatePromises = snapshot.docs.map(docSnap => 
        updateDoc(doc(db, this.COLLECTION_NAME, docSnap.id), { 
          read: true, 
          readAt: serverTimestamp() 
        })
      );

      await Promise.all(updatePromises);
      console.log(`🔔 [NOTIF] ${snapshot.size} notifications marquées comme lues`);
      
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur marquage toutes lues:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE NOTIFICATION
   */
  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, notificationId));
      console.log('🗑️ [NOTIF] Notification supprimée:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur suppression:', error);
      return { success: false, error: error.message };
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
            icon: '🎯',
            link: '/admin/task-validation',
            data: {
              questId,
              validationId,
              requesterId: userId,
              requesterName: displayName,
              xpAmount: xpAmount || 25
            },
            priority: 'high'
          });
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
          icon: '🎯',
          link: '/admin/task-validation',
          data: {
            questId,
            validationId,
            requesterId: userId,
            requesterName: displayName,
            xpAmount: xpAmount || 25
          },
          priority: 'high'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${adminsSnapshot.size} admins notifiés`);

      return { success: true, count: adminsSnapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification admins:', error);
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
        icon: '✅',
        link: '/tasks',
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
        icon: '❌',
        link: '/tasks',
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

  // ==========================================
  // 🏆 NOTIFICATIONS GAMIFICATION
  // ==========================================

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
        icon: badgeIcon || '🏆',
        link: '/badges',
        data: { badgeId, badgeName },
        priority: 'high'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification badge:', error);
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
        icon: '⭐',
        link: '/profile',
        data: { newLevel, previousLevel },
        priority: 'high'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification niveau:', error);
      return { success: false };
    }
  }

  // ==========================================
  // ⚡ NOTIFICATIONS BOOST
  // ==========================================

  /**
   * ⚡ NOTIFIER UN BOOST REÇU
   */
  async notifyBoostReceived(userId, data) {
    try {
      const { boostId, boostType, boostEmoji, boostLabel, fromUserName, message, xpAmount } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.BOOST_RECEIVED,
        title: `${boostEmoji} Boost reçu !`,
        message: `${fromUserName} vous a envoyé un Boost ${boostLabel}${message ? ` : "${message}"` : ''} (+${xpAmount} XP)`,
        icon: boostEmoji || '⚡',
        link: '/boosts',
        data: {
          boostId,
          boostType,
          fromUserName,
          xpAmount
        },
        priority: 'high'
      });

      console.log(`⚡ [NOTIF] Utilisateur ${userId} notifié - boost reçu de ${fromUserName}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification boost:', error);
      return { success: false, error: error.message };
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

      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      if (usersSnapshot.empty) {
        return { success: false, message: 'Aucun utilisateur' };
      }

      const notificationPromises = usersSnapshot.docs.map(userDoc => 
        this.createNotification({
          userId: userDoc.id,
          type: NOTIFICATION_TYPES.NEW_INFO,
          title: `📢 ${priority === 'urgent' ? '🚨 ' : ''}${infoTitle}`,
          message: `${authorName} a publié une nouvelle information${priority === 'urgent' ? ' URGENTE' : ''}`,
          icon: priority === 'urgent' ? '🚨' : '📢',
          link: '/infos',
          data: { infoId, infoTitle, infoType, authorName },
          priority: priority === 'urgent' ? 'high' : 'medium'
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
          message: `${userName} demande "${rewardName}" (${cost} points)`,
          icon: '🎁',
          link: '/admin/rewards',
          data: { rewardId, rewardName, requesterId: userId, cost },
          priority: 'medium'
        })
      );

      await Promise.all(notificationPromises);
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
      const { rewardName } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.REWARD_APPROVED,
        title: '🎉 Récompense approuvée !',
        message: `Votre demande pour "${rewardName}" a été approuvée !`,
        icon: '🎉',
        link: '/rewards',
        data: { rewardName },
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
        icon: '❌',
        link: '/rewards',
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
  // 💰 NOTIFICATIONS CAGNOTTE ÉQUIPE
  // ==========================================

  /**
   * 💰 NOTIFIER UNE CONTRIBUTION SIGNIFICATIVE À LA CAGNOTTE
   * Note: Seulement pour contributions manuelles importantes (>= 200 XP)
   */
  async notifyPoolContribution(data) {
    try {
      const { contributorId, contributorName, amount, newPoolTotal, newLevel } = data;

      // Ne notifier que pour contributions significatives
      if (amount < 200) {
        return { success: true, skipped: true, reason: 'contribution_too_small' };
      }

      // Récupérer tous les utilisateurs sauf le contributeur
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const notificationPromises = usersSnapshot.docs
        .filter(userDoc => userDoc.id !== contributorId)
        .map(userDoc =>
          this.createNotification({
            userId: userDoc.id,
            type: NOTIFICATION_TYPES.POOL_CONTRIBUTION,
            title: '💰 Contribution à la cagnotte !',
            message: `${contributorName} a contribué ${amount} XP à la cagnotte d'équipe ! Total: ${newPoolTotal} XP`,
            icon: '💰',
            link: '/rewards',
            data: { contributorId, contributorName, amount, newPoolTotal },
            priority: 'medium'
          })
        );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${usersSnapshot.size - 1} utilisateurs notifiés de la contribution`);

      return { success: true, count: usersSnapshot.size - 1 };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification contribution pool:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎉 NOTIFIER UN CHANGEMENT DE NIVEAU DE LA CAGNOTTE
   */
  async notifyPoolLevelUp(data) {
    try {
      const { newLevel, previousLevel, totalXP } = data;

      const levelEmojis = {
        BRONZE: '🥉',
        SILVER: '🥈',
        GOLD: '🥇',
        PLATINUM: '💎',
        DIAMOND: '💠'
      };

      // Notifier tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const notificationPromises = usersSnapshot.docs.map(userDoc =>
        this.createNotification({
          userId: userDoc.id,
          type: NOTIFICATION_TYPES.POOL_LEVEL_UP,
          title: `${levelEmojis[newLevel] || '🏆'} Cagnotte niveau ${newLevel} !`,
          message: `La cagnotte d'équipe a atteint le niveau ${newLevel} avec ${totalXP} XP ! De nouvelles récompenses sont disponibles.`,
          icon: levelEmojis[newLevel] || '🏆',
          link: '/rewards',
          data: { newLevel, previousLevel, totalXP },
          priority: 'high'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${usersSnapshot.size} utilisateurs notifiés du level up cagnotte`);

      return { success: true, count: usersSnapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification pool level up:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🛒 NOTIFIER UN ACHAT DE RÉCOMPENSE D'ÉQUIPE
   */
  async notifyPoolRewardPurchased(data) {
    try {
      const { rewardName, rewardIcon, cost, purchasedByName } = data;

      // Notifier tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const notificationPromises = usersSnapshot.docs.map(userDoc =>
        this.createNotification({
          userId: userDoc.id,
          type: NOTIFICATION_TYPES.POOL_REWARD_PURCHASED,
          title: `${rewardIcon || '🎁'} Récompense d'équipe débloquée !`,
          message: `L'équipe a débloqué "${rewardName}" pour ${cost} XP ! Merci ${purchasedByName} !`,
          icon: rewardIcon || '🎁',
          link: '/rewards',
          data: { rewardName, cost, purchasedByName },
          priority: 'high'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${usersSnapshot.size} utilisateurs notifiés de l'achat d'équipe`);

      return { success: true, count: usersSnapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification achat équipe:', error);
      return { success: false, error: error.message };
    }
  }
}

// ✅ INSTANCE UNIQUE
const notificationService = new NotificationService();

// ✅ EXPORTS
export { notificationService, NOTIFICATION_TYPES };
export default notificationService;

console.log('🔔 NotificationService prêt - Version corrigée');
