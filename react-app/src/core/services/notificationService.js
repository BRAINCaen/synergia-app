// ==========================================
// 📁 react-app/src/core/services/notificationService.js
// SERVICE NOTIFICATIONS COMPLET - ADMIN + UTILISATEURS + INFOS
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

const COLLECTIONS = {
  NOTIFICATIONS: 'notifications',
  USERS: 'users'
};

/**
 * 🔔 SERVICE DE NOTIFICATIONS SYNERGIA
 */
const notificationService = {

  // ==========================================
  // 📋 TYPES DE NOTIFICATIONS
  // ==========================================
  TYPES: {
    // Admin notifications
    QUEST_VALIDATION_PENDING: 'quest_validation_pending',
    REWARD_REQUEST_PENDING: 'reward_request_pending',
    OBJECTIVE_VALIDATION_PENDING: 'objective_validation_pending',
    NEW_USER_REGISTERED: 'new_user_registered',
    
    // User notifications
    QUEST_APPROVED: 'quest_approved',
    QUEST_REJECTED: 'quest_rejected',
    REWARD_APPROVED: 'reward_approved',
    REWARD_REJECTED: 'reward_rejected',
    XP_EARNED: 'xp_earned',
    BADGE_EARNED: 'badge_earned',
    LEVEL_UP: 'level_up',
    TASK_ASSIGNED: 'task_assigned',
    TASK_REMINDER: 'task_reminder',
    MENTION: 'mention',
    SYSTEM: 'system',
    
    // Notifications infos équipe
    NEW_INFO: 'new_info'
  },

  // ==========================================
  // 🔔 CRÉER UNE NOTIFICATION
  // ==========================================
  async createNotification(data) {
    try {
      const notificationData = {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        icon: data.icon || '🔔',
        link: data.link || null,
        data: data.data || {},
        read: false,
        createdAt: serverTimestamp(),
        expiresAt: data.expiresAt || null
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);
      console.log('🔔 [NOTIF] Notification créée:', docRef.id);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur création:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 👑 NOTIFIER TOUS LES ADMINS
  // ==========================================
  async notifyAllAdmins(data) {
    try {
      console.log('👑 [NOTIF] Notification à tous les admins...');
      
      // Récupérer tous les admins
      const usersRef = collection(db, COLLECTIONS.USERS);
      const usersSnapshot = await getDocs(usersRef);
      
      const adminIds = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        // Vérifier si l'utilisateur est admin
        if (
          userData.role === 'admin' ||
          userData.profile?.role === 'admin' ||
          userData.isAdmin === true ||
          userData.email === 'alan.boehme61@gmail.com'
        ) {
          adminIds.push(doc.id);
        }
      });

      console.log(`👑 [NOTIF] ${adminIds.length} admins trouvés`);

      // Créer une notification pour chaque admin
      const batch = writeBatch(db);
      const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
      
      for (const adminId of adminIds) {
        const notifRef = doc(notificationsRef);
        batch.set(notifRef, {
          userId: adminId,
          type: data.type,
          title: data.title,
          message: data.message,
          icon: data.icon || '👑',
          link: data.link || '/admin',
          data: data.data || {},
          read: false,
          isAdminNotification: true,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      console.log(`✅ [NOTIF] ${adminIds.length} admins notifiés`);
      
      return { success: true, notifiedCount: adminIds.length };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification admins:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 📢 NOTIFIER TOUS LES UTILISATEURS (NOUVELLE INFO)
  // ==========================================
  async notifyAllUsersNewInfo(infoData) {
    try {
      console.log('📢 [NOTIF] Notification nouvelle info à tous les utilisateurs...');
      
      const { infoId, infoText, authorId, authorName } = infoData;
      
      // Récupérer TOUS les utilisateurs
      const usersRef = collection(db, COLLECTIONS.USERS);
      const usersSnapshot = await getDocs(usersRef);
      
      const batch = writeBatch(db);
      const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
      let notifiedCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        
        // Ne pas notifier l'auteur de l'info
        if (userId === authorId) continue;
        
        const notifRef = doc(notificationsRef);
        batch.set(notifRef, {
          userId: userId,
          type: this.TYPES.NEW_INFO,
          title: '📢 Nouvelle information',
          message: `${authorName} a publié une nouvelle info${infoText ? ': ' + infoText.substring(0, 50) + (infoText.length > 50 ? '...' : '') : ''}`,
          icon: '📢',
          link: '/infos',
          data: { infoId, authorId, authorName },
          read: false,
          createdAt: serverTimestamp()
        });
        notifiedCount++;
      }
      
      await batch.commit();
      console.log(`✅ [NOTIF] ${notifiedCount} utilisateurs notifiés de la nouvelle info`);
      
      return { success: true, notifiedCount };
      
    } catch (error) {
      console.error('❌ [NOTIF] Erreur notification nouvelle info:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 🎯 NOTIFICATIONS ADMIN SPÉCIFIQUES
  // ==========================================

  // Nouvelle quête à valider
  async notifyQuestValidationPending(questData) {
    return this.notifyAllAdmins({
      type: this.TYPES.QUEST_VALIDATION_PENDING,
      title: '🛡️ Quête à valider',
      message: `${questData.userName || 'Un utilisateur'} a soumis la quête "${questData.questTitle}" (+${questData.xpAmount || 0} XP)`,
      icon: '🛡️',
      link: '/admin/task-validation',
      data: {
        questId: questData.questId,
        validationId: questData.validationId,
        userId: questData.userId,
        xpAmount: questData.xpAmount
      }
    });
  },

  // Nouvelle demande de récompense
  async notifyRewardRequestPending(rewardData) {
    return this.notifyAllAdmins({
      type: this.TYPES.REWARD_REQUEST_PENDING,
      title: '🎁 Récompense demandée',
      message: `${rewardData.userName || 'Un utilisateur'} demande la récompense "${rewardData.rewardName}" (${rewardData.xpCost} XP)`,
      icon: '🎁',
      link: '/admin/rewards',
      data: {
        rewardId: rewardData.rewardId,
        requestId: rewardData.requestId,
        userId: rewardData.userId,
        xpCost: rewardData.xpCost
      }
    });
  },

  // Nouvel objectif à valider
  async notifyObjectiveValidationPending(objectiveData) {
    return this.notifyAllAdmins({
      type: this.TYPES.OBJECTIVE_VALIDATION_PENDING,
      title: '🎯 Objectif à valider',
      message: `${objectiveData.userName || 'Un utilisateur'} a complété l'objectif "${objectiveData.objectiveTitle}"`,
      icon: '🎯',
      link: '/admin/objective-validation',
      data: {
        objectiveId: objectiveData.objectiveId,
        userId: objectiveData.userId
      }
    });
  },

  // Nouvel utilisateur inscrit
  async notifyNewUserRegistered(userData) {
    return this.notifyAllAdmins({
      type: this.TYPES.NEW_USER_REGISTERED,
      title: '👤 Nouvel utilisateur',
      message: `${userData.displayName || userData.email} vient de s'inscrire sur Synergia`,
      icon: '👤',
      link: '/admin/users',
      data: {
        userId: userData.userId,
        email: userData.email
      }
    });
  },

  // ==========================================
  // 👤 NOTIFICATIONS UTILISATEUR
  // ==========================================

  // Quête approuvée
  async notifyQuestApproved(userId, questData) {
    return this.createNotification({
      userId,
      type: this.TYPES.QUEST_APPROVED,
      title: '✅ Quête validée !',
      message: `Votre quête "${questData.questTitle}" a été approuvée ! +${questData.xpAmount} XP`,
      icon: '✅',
      link: '/tasks',
      data: {
        questId: questData.questId,
        xpAmount: questData.xpAmount
      }
    });
  },

  // Quête rejetée
  async notifyQuestRejected(userId, questData) {
    return this.createNotification({
      userId,
      type: this.TYPES.QUEST_REJECTED,
      title: '❌ Quête rejetée',
      message: `Votre quête "${questData.questTitle}" a été rejetée. ${questData.reason || 'Veuillez la resoumettre.'}`,
      icon: '❌',
      link: '/tasks',
      data: {
        questId: questData.questId,
        reason: questData.reason
      }
    });
  },

  // Récompense approuvée
  async notifyRewardApproved(userId, rewardData) {
    return this.createNotification({
      userId,
      type: this.TYPES.REWARD_APPROVED,
      title: '🎁 Récompense accordée !',
      message: `Votre demande pour "${rewardData.rewardName}" a été approuvée !`,
      icon: '🎁',
      link: '/rewards',
      data: {
        rewardId: rewardData.rewardId,
        rewardName: rewardData.rewardName
      }
    });
  },

  // Récompense rejetée
  async notifyRewardRejected(userId, rewardData) {
    return this.createNotification({
      userId,
      type: this.TYPES.REWARD_REJECTED,
      title: '❌ Récompense refusée',
      message: `Votre demande pour "${rewardData.rewardName}" a été refusée. ${rewardData.reason || ''}`,
      icon: '❌',
      link: '/rewards',
      data: {
        rewardId: rewardData.rewardId,
        reason: rewardData.reason
      }
    });
  },

  // XP gagnés
  async notifyXPEarned(userId, xpData) {
    return this.createNotification({
      userId,
      type: this.TYPES.XP_EARNED,
      title: '⚡ XP gagnés !',
      message: `+${xpData.amount} XP pour : ${xpData.reason}`,
      icon: '⚡',
      link: '/gamification',
      data: {
        amount: xpData.amount,
        reason: xpData.reason
      }
    });
  },

  // Badge obtenu
  async notifyBadgeEarned(userId, badgeData) {
    return this.createNotification({
      userId,
      type: this.TYPES.BADGE_EARNED,
      title: '🏆 Nouveau badge !',
      message: `Vous avez obtenu le badge "${badgeData.badgeName}" !`,
      icon: badgeData.badgeIcon || '🏆',
      link: '/badges',
      data: {
        badgeId: badgeData.badgeId,
        badgeName: badgeData.badgeName
      }
    });
  },

  // Level up
  async notifyLevelUp(userId, levelData) {
    return this.createNotification({
      userId,
      type: this.TYPES.LEVEL_UP,
      title: '🎉 Niveau supérieur !',
      message: `Félicitations ! Vous êtes maintenant niveau ${levelData.newLevel} !`,
      icon: '🎉',
      link: '/profile',
      data: {
        previousLevel: levelData.previousLevel,
        newLevel: levelData.newLevel
      }
    });
  },

  // Tâche assignée
  async notifyTaskAssigned(userId, taskData) {
    return this.createNotification({
      userId,
      type: this.TYPES.TASK_ASSIGNED,
      title: '📋 Nouvelle quête assignée',
      message: `La quête "${taskData.taskTitle}" vous a été assignée`,
      icon: '📋',
      link: '/tasks',
      data: {
        taskId: taskData.taskId,
        taskTitle: taskData.taskTitle
      }
    });
  },

  // ==========================================
  // 📖 RÉCUPÉRER LES NOTIFICATIONS
  // ==========================================
  async getNotifications(userId, options = {}) {
    try {
      const { onlyUnread = false, limitCount = 50 } = options;
      
      let q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (onlyUnread) {
        q = query(
          collection(db, COLLECTIONS.NOTIFICATIONS),
          where('userId', '==', userId),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      return notifications;
    } catch (error) {
      console.error('❌ [NOTIF] Erreur récupération:', error);
      return [];
    }
  },

  // ==========================================
  // 🔴 COMPTER LES NON LUES
  // ==========================================
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('❌ [NOTIF] Erreur comptage:', error);
      return 0;
    }
  },

  // ==========================================
  // 👁️ MARQUER COMME LUE
  // ==========================================
  async markAsRead(notificationId) {
    try {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(notifRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur marquage:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // ✅ MARQUER TOUTES COMME LUES
  // ==========================================
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`✅ [NOTIF] ${snapshot.size} notifications marquées comme lues`);
      
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur marquage global:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 🗑️ SUPPRIMER UNE NOTIFICATION
  // ==========================================
  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId));
      return { success: true };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur suppression:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 🧹 NETTOYER LES VIEILLES NOTIFICATIONS
  // ==========================================
  async cleanOldNotifications(userId, daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', true)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;

      snapshot.forEach(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        if (createdAt && createdAt < cutoffDate) {
          batch.delete(doc.ref);
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        console.log(`🧹 [NOTIF] ${count} vieilles notifications supprimées`);
      }

      return { success: true, deleted: count };
    } catch (error) {
      console.error('❌ [NOTIF] Erreur nettoyage:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // 🎧 LISTENER TEMPS RÉEL
  // ==========================================
  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });
      callback(notifications);
    }, (error) => {
      console.error('❌ [NOTIF] Erreur listener:', error);
      callback([]);
    });
  }
};

export default notificationService;
