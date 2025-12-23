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

  // Boîte à idées
  NEW_IDEA: 'new_idea',
  IDEA_VOTED: 'idea_voted',
  IDEA_ADOPTED: 'idea_adopted',
  IDEA_IMPLEMENTED: 'idea_implemented',

  // Congés
  LEAVE_REQUEST: 'leave_request',
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',

  // Pointages / Paie
  TIMESHEET_VALIDATION_REQUIRED: 'timesheet_validation_required',
  TIMESHEET_VALIDATION_REMINDER: 'timesheet_validation_reminder',
  TIMESHEET_VALIDATED: 'timesheet_validated',

  // Messages privés
  MESSAGE_RECEIVED: 'message_received',

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
  // 💡 NOTIFICATIONS BOÎTE À IDÉES
  // ==========================================

  /**
   * 💡 NOTIFIER TOUS LES UTILISATEURS D'UNE NOUVELLE IDÉE
   */
  async notifyAllUsersNewIdea(data) {
    try {
      const { ideaId, ideaTitle, authorId, authorName, category } = data;

      const usersSnapshot = await getDocs(collection(db, 'users'));

      if (usersSnapshot.empty) {
        return { success: false, message: 'Aucun utilisateur' };
      }

      // Notifier tous les utilisateurs sauf l'auteur
      const notificationPromises = usersSnapshot.docs
        .filter(userDoc => userDoc.id !== authorId)
        .map(userDoc =>
          this.createNotification({
            userId: userDoc.id,
            type: NOTIFICATION_TYPES.NEW_IDEA,
            title: '💡 Nouvelle idée !',
            message: `${authorName} a proposé une nouvelle idée : "${ideaTitle}"`,
            icon: '💡',
            link: '/infos?tab=ideas',
            data: { ideaId, ideaTitle, authorName, category },
            priority: 'medium'
          })
        );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${usersSnapshot.size - 1} utilisateurs notifiés pour nouvelle idée`);

      return { success: true, count: usersSnapshot.size - 1 };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification nouvelle idée:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👍 NOTIFIER L'AUTEUR D'UN VOTE SUR SON IDÉE
   */
  async notifyIdeaVoted(data) {
    try {
      const { ideaId, ideaTitle, authorId, voterName, voteCount } = data;

      await this.createNotification({
        userId: authorId,
        type: NOTIFICATION_TYPES.IDEA_VOTED,
        title: '👍 Vote sur ton idée !',
        message: `${voterName} a voté pour ton idée "${ideaTitle}" (${voteCount} vote${voteCount > 1 ? 's' : ''})`,
        icon: '👍',
        link: '/infos?tab=ideas',
        data: { ideaId, ideaTitle, voterName, voteCount },
        priority: 'low'
      });

      console.log(`🔔 [NOTIF] Auteur notifié du vote sur idée ${ideaId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification vote idée:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👑 NOTIFIER L'AUTEUR QUE SON IDÉE A ÉTÉ ADOPTÉE
   */
  async notifyIdeaAdopted(data) {
    try {
      const { ideaId, ideaTitle, authorId, reviewerName, xpAwarded } = data;

      await this.createNotification({
        userId: authorId,
        type: NOTIFICATION_TYPES.IDEA_ADOPTED,
        title: '🎉 Idée adoptée !',
        message: `${reviewerName} a adopté ton idée "${ideaTitle}" ! +${xpAwarded} XP`,
        icon: '👑',
        link: '/infos?tab=ideas',
        data: { ideaId, ideaTitle, reviewerName, xpAwarded },
        priority: 'high'
      });

      console.log(`🔔 [NOTIF] Auteur notifié de l'adoption de l'idée ${ideaId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification idée adoptée:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏗️ NOTIFIER TOUS LES UTILISATEURS QU'UNE IDÉE A ÉTÉ IMPLÉMENTÉE
   */
  async notifyIdeaImplemented(data) {
    try {
      const { ideaId, ideaTitle, authorName, implementerName } = data;

      const usersSnapshot = await getDocs(collection(db, 'users'));

      const notificationPromises = usersSnapshot.docs.map(userDoc =>
        this.createNotification({
          userId: userDoc.id,
          type: NOTIFICATION_TYPES.IDEA_IMPLEMENTED,
          title: '🎊 Idée implémentée !',
          message: `L'idée "${ideaTitle}" de ${authorName} a été implémentée par ${implementerName} !`,
          icon: '🏗️',
          link: '/infos?tab=ideas',
          data: { ideaId, ideaTitle, authorName, implementerName },
          priority: 'high'
        })
      );

      await Promise.all(notificationPromises);
      console.log(`🔔 [NOTIF] ${usersSnapshot.size} utilisateurs notifiés de l'implémentation`);

      return { success: true, count: usersSnapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification idée implémentée:', error);
      return { success: false, error: error.message };
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

  // ==========================================
  // 🏖️ NOTIFICATIONS CONGÉS
  // ==========================================

  /**
   * 🏖️ NOTIFIER LES ADMINS PLANNING D'UNE DEMANDE DE CONGÉ
   */
  async notifyLeaveRequest(data) {
    try {
      const { requestId, userId, userName, leaveType, leaveLabel, startDate, endDate, reason } = data;

      // Récupérer tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));

      // Récupérer les permissions des rôles
      const rolePermSnapshot = await getDocs(collection(db, 'rolePermissions'));
      const rolePermissions = {};
      rolePermSnapshot.forEach(doc => {
        rolePermissions[doc.id] = doc.data().permissions || [];
      });

      let notifiedCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        if (userDoc.id === userId) continue; // Ne pas notifier le demandeur

        const userData = userDoc.data();
        let hasPlanningAdmin = false;

        // Vérifier si admin global
        if (userData.isAdmin === true || userData.role === 'admin') {
          hasPlanningAdmin = true;
        }

        // Vérifier les rôles Synergia
        const userRoles = userData.synergiaRoles || [];
        for (const role of userRoles) {
          const perms = rolePermissions[role.roleId] || [];
          if (perms.includes('planning_admin') || perms.includes('full_access')) {
            hasPlanningAdmin = true;
            break;
          }
        }

        // Vérifier si rôle organisation
        if (userRoles.some(r => r.roleId === 'organization')) {
          hasPlanningAdmin = true;
        }

        if (hasPlanningAdmin) {
          await this.createNotification({
            userId: userDoc.id,
            type: NOTIFICATION_TYPES.LEAVE_REQUEST,
            title: '🏖️ Nouvelle demande de congé',
            message: `${userName} demande un ${leaveLabel} du ${startDate}${endDate !== startDate ? ` au ${endDate}` : ''}`,
            icon: '🏖️',
            link: '/hr?tab=leaves',
            data: {
              requestId,
              requesterId: userId,
              requesterName: userName,
              leaveType,
              startDate,
              endDate,
              reason
            },
            priority: 'high'
          });
          notifiedCount++;
        }
      }

      console.log(`🏖️ [NOTIF] ${notifiedCount} admins planning notifiés de la demande de congé`);
      return { success: true, count: notifiedCount };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification demande congé:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ NOTIFIER L'UTILISATEUR D'UN CONGÉ APPROUVÉ
   */
  async notifyLeaveApproved(userId, data) {
    try {
      const { requestId, leaveLabel, startDate, endDate, approverName } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.LEAVE_APPROVED,
        title: '✅ Congé approuvé !',
        message: `Votre demande de ${leaveLabel} du ${startDate}${endDate !== startDate ? ` au ${endDate}` : ''} a été approuvée par ${approverName}`,
        icon: '✅',
        link: '/planning',
        data: { requestId, leaveLabel, startDate, endDate, approverName },
        priority: 'high'
      });

      console.log(`✅ [NOTIF] Utilisateur ${userId} notifié - congé approuvé`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification congé approuvé:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ❌ NOTIFIER L'UTILISATEUR D'UN CONGÉ REFUSÉ
   */
  async notifyLeaveRejected(userId, data) {
    try {
      const { requestId, leaveLabel, startDate, endDate, rejectedByName, reason } = data;

      await this.createNotification({
        userId,
        type: NOTIFICATION_TYPES.LEAVE_REJECTED,
        title: '❌ Congé refusé',
        message: `Votre demande de ${leaveLabel} du ${startDate}${endDate !== startDate ? ` au ${endDate}` : ''} a été refusée${reason ? `. Raison: ${reason}` : ''}`,
        icon: '❌',
        link: '/planning',
        data: { requestId, leaveLabel, startDate, endDate, rejectedByName, reason },
        priority: 'high'
      });

      console.log(`❌ [NOTIF] Utilisateur ${userId} notifié - congé refusé`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification congé refusé:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // ⏰ NOTIFICATIONS POINTAGES / PAIE
  // ==========================================

  /**
   * ⏰ NOTIFIER LES EMPLOYÉS QUE LES POINTAGES DOIVENT ÊTRE VALIDÉS (URGENT)
   */
  async notifyTimesheetValidationRequired(data) {
    try {
      const { periodId, month, year, monthLabel, employees, requestedByName, isReminder = false } = data;

      console.log(`⏰ [NOTIF] Envoi notifications pointages ${isReminder ? '(RAPPEL)' : ''} pour ${monthLabel} ${year}`);

      const notificationPromises = employees.map(employee =>
        this.createNotification({
          userId: employee.id,
          type: isReminder ? NOTIFICATION_TYPES.TIMESHEET_VALIDATION_REMINDER : NOTIFICATION_TYPES.TIMESHEET_VALIDATION_REQUIRED,
          title: isReminder ? '🚨 RAPPEL URGENT: Pointages à signer !' : '⏰ Pointages à valider',
          message: isReminder
            ? `${requestedByName} vous rappelle de signer vos pointages de ${monthLabel} ${year} ! C'est urgent pour la paie.`
            : `${requestedByName} vous demande de valider vos pointages de ${monthLabel} ${year} par signature électronique.`,
          icon: isReminder ? '🚨' : '⏰',
          link: '/hr?tab=payroll',
          data: {
            periodId,
            month,
            year,
            requestedByName,
            isReminder
          },
          priority: 'high' // Toujours haute priorité pour les pointages
        })
      );

      await Promise.all(notificationPromises);
      console.log(`⏰ [NOTIF] ${employees.length} employés notifiés pour validation pointages`);

      return { success: true, count: employees.length };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification pointages:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ NOTIFIER LE GESTIONNAIRE QU'UN EMPLOYÉ A SIGNÉ SES POINTAGES
   */
  async notifyTimesheetSigned(data) {
    try {
      const { employeeId, employeeName, month, year, monthLabel, managerId } = data;

      await this.createNotification({
        userId: managerId,
        type: NOTIFICATION_TYPES.TIMESHEET_VALIDATED,
        title: '✅ Pointage signé',
        message: `${employeeName} a signé ses pointages de ${monthLabel} ${year}`,
        icon: '✅',
        link: '/hr?tab=payroll',
        data: {
          employeeId,
          employeeName,
          month,
          year
        },
        priority: 'medium'
      });

      console.log(`✅ [NOTIF] Gestionnaire ${managerId} notifié - signature de ${employeeName}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification signature pointages:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎉 NOTIFIER LE GESTIONNAIRE QUE TOUS LES POINTAGES SONT SIGNÉS
   */
  async notifyAllTimesheetsSigned(data) {
    try {
      const { month, year, monthLabel, managerId, totalEmployees } = data;

      await this.createNotification({
        userId: managerId,
        type: NOTIFICATION_TYPES.TIMESHEET_VALIDATED,
        title: '🎉 Tous les pointages sont signés !',
        message: `${totalEmployees} employés ont signé leurs pointages de ${monthLabel} ${year}. Prêt à envoyer à la paie !`,
        icon: '🎉',
        link: '/hr?tab=payroll',
        data: {
          month,
          year,
          totalEmployees,
          allSigned: true
        },
        priority: 'high'
      });

      console.log(`🎉 [NOTIF] Gestionnaire ${managerId} notifié - tous pointages signés`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification tous signés:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 💬 NOTIFICATIONS MESSAGES
  // ==========================================

  /**
   * 💬 NOTIFIER UN NOUVEAU MESSAGE PRIVÉ
   */
  async notifyMessageReceived(recipientId, data) {
    try {
      const { senderId, senderName, senderPhoto, messagePreview, conversationId } = data;

      await this.createNotification({
        userId: recipientId,
        type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
        title: '💬 Nouveau message',
        message: `${senderName} vous a envoyé un message : "${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}"`,
        icon: '💬',
        link: '/taverne',
        data: {
          senderId,
          senderName,
          senderPhoto,
          conversationId
        },
        priority: 'medium'
      });

      console.log(`💬 [NOTIF] Utilisateur ${recipientId} notifié - nouveau message de ${senderName}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification message:', error);
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
