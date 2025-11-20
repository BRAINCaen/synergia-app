// ==========================================
// 📁 react-app/src/core/services/activityTrackingService.js
// 🛡️ SERVICE DE TRACKING D'ACTIVITÉ COMPLET SYNERGIA
// Enregistre TOUTES les actions utilisateurs dans Firebase
// ==========================================

import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎯 TYPES D'ÉVÉNEMENTS TRACKÉS
 */
export const EVENT_TYPES = {
  // Authentification
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  
  // Quêtes/Tâches
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  TASK_ASSIGNED: 'task_assigned',
  TASK_VALIDATION_SUBMITTED: 'task_validation_submitted',
  TASK_VALIDATION_APPROVED: 'task_validation_approved',
  TASK_VALIDATION_REJECTED: 'task_validation_rejected',
  
  // Projets
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_JOINED: 'project_joined',
  PROJECT_LEFT: 'project_left',
  
  // Objectifs
  OBJECTIVE_CLAIMED: 'objective_claimed',
  OBJECTIVE_APPROVED: 'objective_approved',
  OBJECTIVE_REJECTED: 'objective_rejected',
  
  // Récompenses
  REWARD_REQUESTED: 'reward_requested',
  REWARD_GRANTED: 'reward_granted',
  REWARD_REJECTED: 'reward_rejected',
  
  // Badges
  BADGE_EARNED: 'badge_earned',
  BADGE_REMOVED: 'badge_removed',
  
  // XP et Progression
  XP_GAINED: 'xp_gained',
  XP_LOST: 'xp_lost',
  LEVEL_UP: 'level_up',
  
  // Collaboration
  COMMENT_ADDED: 'comment_added',
  COMMENT_EDITED: 'comment_edited',
  COMMENT_DELETED: 'comment_deleted',
  POOL_MESSAGE_SENT: 'pool_message_sent',
  
  // Profil
  PROFILE_UPDATED: 'profile_updated',
  AVATAR_CHANGED: 'avatar_changed',
  ROLE_CHANGED: 'role_changed',
  
  // Volontariat
  VOLUNTEER_JOINED: 'volunteer_joined',
  VOLUNTEER_LEFT: 'volunteer_left',
  
  // RH
  TIMETRACK_CHECKIN: 'timetrack_checkin',
  TIMETRACK_CHECKOUT: 'timetrack_checkout',
  ABSENCE_REQUESTED: 'absence_requested',
  ABSENCE_APPROVED: 'absence_approved',
  
  // Administration
  GODMOD_ACTION: 'godmod_action',
  ADMIN_ACTION: 'admin_action',
  SETTINGS_CHANGED: 'settings_changed',
  
  // Système
  ERROR_OCCURRED: 'error_occurred',
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported'
};

/**
 * 🎨 CATÉGORIES D'ÉVÉNEMENTS (pour filtrage)
 */
export const EVENT_CATEGORIES = {
  AUTHENTICATION: 'Authentification',
  TASKS: 'Quêtes',
  PROJECTS: 'Projets',
  OBJECTIVES: 'Objectifs',
  REWARDS: 'Récompenses',
  BADGES: 'Badges',
  PROGRESSION: 'Progression',
  COLLABORATION: 'Collaboration',
  PROFILE: 'Profil',
  VOLUNTEER: 'Volontariat',
  HR: 'RH',
  ADMIN: 'Administration',
  SYSTEM: 'Système'
};

/**
 * 🛡️ SERVICE DE TRACKING D'ACTIVITÉ
 */
class ActivityTrackingService {
  constructor() {
    this.collectionName = 'activity_logs';
    console.log('🎯 ActivityTrackingService initialisé');
  }

  /**
   * 📝 ENREGISTRER UN ÉVÉNEMENT D'ACTIVITÉ
   * 
   * @param {Object} eventData - Données de l'événement
   * @param {string} eventData.type - Type d'événement (EVENT_TYPES)
   * @param {string} eventData.userId - ID de l'utilisateur
   * @param {string} eventData.userName - Nom de l'utilisateur
   * @param {string} eventData.userEmail - Email de l'utilisateur (optionnel)
   * @param {string} eventData.category - Catégorie de l'événement
   * @param {string} eventData.action - Description de l'action
   * @param {string} eventData.details - Détails supplémentaires (optionnel)
   * @param {Object} eventData.metadata - Métadonnées additionnelles (optionnel)
   * @param {string} eventData.entityType - Type d'entité concernée (optionnel)
   * @param {string} eventData.entityId - ID de l'entité concernée (optionnel)
   * @param {string} eventData.status - Statut de l'action (optionnel)
   * @param {number} eventData.xpAmount - Montant XP impliqué (optionnel)
   */
  async logActivity(eventData) {
    try {
      // 🛡️ VALIDATION DES DONNÉES OBLIGATOIRES
      if (!eventData.type || !eventData.userId || !eventData.userName || !eventData.category || !eventData.action) {
        console.warn('⚠️ [TRACKING] Données obligatoires manquantes:', eventData);
        return { success: false, error: 'Données obligatoires manquantes' };
      }

      // 📝 STRUCTURE COMPLÈTE DE L'ÉVÉNEMENT
      const activityLog = {
        // Identifiants
        type: eventData.type,
        userId: eventData.userId,
        userName: eventData.userName,
        userEmail: eventData.userEmail || '',
        
        // Classification
        category: eventData.category,
        action: eventData.action,
        
        // Informations complémentaires
        details: eventData.details || '',
        metadata: eventData.metadata || {},
        
        // Entité concernée (si applicable)
        entityType: eventData.entityType || null,
        entityId: eventData.entityId || null,
        
        // Statut et résultat
        status: eventData.status || 'completed',
        
        // XP (si applicable)
        xpAmount: eventData.xpAmount || 0,
        
        // Horodatage
        timestamp: serverTimestamp(),
        clientTimestamp: new Date().toISOString(),
        
        // Métadonnées système
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'
      };

      // 💾 SAUVEGARDE FIREBASE
      const docRef = await addDoc(collection(db, this.collectionName), activityLog);
      
      console.log(`✅ [TRACKING] Événement enregistré: ${eventData.type}`, {
        id: docRef.id,
        user: eventData.userName,
        action: eventData.action
      });
      
      return { 
        success: true, 
        logId: docRef.id,
        log: {
          id: docRef.id,
          ...activityLog
        }
      };
      
    } catch (error) {
      console.error('❌ [TRACKING] Erreur enregistrement événement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔐 TRACKER CONNEXION UTILISATEUR
   */
  async logLogin(userId, userName, userEmail) {
    return await this.logActivity({
      type: EVENT_TYPES.USER_LOGIN,
      userId,
      userName,
      userEmail,
      category: EVENT_CATEGORIES.AUTHENTICATION,
      action: 'Connexion',
      details: 'Utilisateur connecté avec succès',
      status: 'success'
    });
  }

  /**
   * 🚪 TRACKER DÉCONNEXION UTILISATEUR
   */
  async logLogout(userId, userName, userEmail) {
    return await this.logActivity({
      type: EVENT_TYPES.USER_LOGOUT,
      userId,
      userName,
      userEmail,
      category: EVENT_CATEGORIES.AUTHENTICATION,
      action: 'Déconnexion',
      details: 'Utilisateur déconnecté',
      status: 'success'
    });
  }

  /**
   * ✅ TRACKER CRÉATION DE TÂCHE
   */
  async logTaskCreated(userId, userName, taskId, taskTitle) {
    return await this.logActivity({
      type: EVENT_TYPES.TASK_CREATED,
      userId,
      userName,
      category: EVENT_CATEGORIES.TASKS,
      action: 'Quête Créée',
      details: taskTitle,
      entityType: 'task',
      entityId: taskId,
      status: 'created'
    });
  }

  /**
   * ✅ TRACKER COMPLÉTION DE TÂCHE
   */
  async logTaskCompleted(userId, userName, taskId, taskTitle, xpEarned) {
    return await this.logActivity({
      type: EVENT_TYPES.TASK_COMPLETED,
      userId,
      userName,
      category: EVENT_CATEGORIES.TASKS,
      action: 'Quête Terminée',
      details: `${taskTitle} - ${xpEarned} XP gagnés`,
      entityType: 'task',
      entityId: taskId,
      xpAmount: xpEarned,
      status: 'completed'
    });
  }

  /**
   * 🎯 TRACKER VALIDATION DE QUÊTE SOUMISE
   */
  async logTaskValidationSubmitted(userId, userName, taskId, taskTitle, xpAmount) {
    return await this.logActivity({
      type: EVENT_TYPES.TASK_VALIDATION_SUBMITTED,
      userId,
      userName,
      category: EVENT_CATEGORIES.TASKS,
      action: 'Validation Soumise',
      details: `${taskTitle} - ${xpAmount} XP`,
      entityType: 'task',
      entityId: taskId,
      xpAmount,
      status: 'pending'
    });
  }

  /**
   * ✅ TRACKER VALIDATION APPROUVÉE
   */
  async logTaskValidationApproved(userId, userName, taskId, taskTitle, xpAmount, validatedBy) {
    return await this.logActivity({
      type: EVENT_TYPES.TASK_VALIDATION_APPROVED,
      userId,
      userName,
      category: EVENT_CATEGORIES.TASKS,
      action: 'Validation Approuvée',
      details: `${taskTitle} - ${xpAmount} XP`,
      entityType: 'task',
      entityId: taskId,
      xpAmount,
      status: 'approved',
      metadata: { validatedBy }
    });
  }

  /**
   * ❌ TRACKER VALIDATION REJETÉE
   */
  async logTaskValidationRejected(userId, userName, taskId, taskTitle, reason, rejectedBy) {
    return await this.logActivity({
      type: EVENT_TYPES.TASK_VALIDATION_REJECTED,
      userId,
      userName,
      category: EVENT_CATEGORIES.TASKS,
      action: 'Validation Rejetée',
      details: `${taskTitle} - Raison: ${reason}`,
      entityType: 'task',
      entityId: taskId,
      status: 'rejected',
      metadata: { reason, rejectedBy }
    });
  }

  /**
   * 🏆 TRACKER BADGE GAGNÉ
   */
  async logBadgeEarned(userId, userName, badgeId, badgeName, xpReward) {
    return await this.logActivity({
      type: EVENT_TYPES.BADGE_EARNED,
      userId,
      userName,
      category: EVENT_CATEGORIES.BADGES,
      action: 'Badge Obtenu',
      details: `${badgeName} - ${xpReward} XP`,
      entityType: 'badge',
      entityId: badgeId,
      xpAmount: xpReward,
      status: 'earned'
    });
  }

  /**
   * ⚡ TRACKER GAIN D'XP
   */
  async logXpGained(userId, userName, xpAmount, source, details) {
    return await this.logActivity({
      type: EVENT_TYPES.XP_GAINED,
      userId,
      userName,
      category: EVENT_CATEGORIES.PROGRESSION,
      action: 'XP Gagnés',
      details: `+${xpAmount} XP - ${details}`,
      xpAmount,
      status: 'gained',
      metadata: { source }
    });
  }

  /**
   * 🎉 TRACKER NIVEAU SUPÉRIEUR
   */
  async logLevelUp(userId, userName, newLevel, xpTotal) {
    return await this.logActivity({
      type: EVENT_TYPES.LEVEL_UP,
      userId,
      userName,
      category: EVENT_CATEGORIES.PROGRESSION,
      action: 'Montée de Niveau',
      details: `Niveau ${newLevel} atteint ! (${xpTotal} XP total)`,
      status: 'achieved',
      metadata: { level: newLevel, totalXp: xpTotal }
    });
  }

  /**
   * 💬 TRACKER COMMENTAIRE AJOUTÉ
   */
  async logCommentAdded(userId, userName, entityType, entityId, commentContent) {
    return await this.logActivity({
      type: EVENT_TYPES.COMMENT_ADDED,
      userId,
      userName,
      category: EVENT_CATEGORIES.COLLABORATION,
      action: 'Commentaire Ajouté',
      details: commentContent.substring(0, 100) + (commentContent.length > 100 ? '...' : ''),
      entityType,
      entityId,
      status: 'added'
    });
  }

  /**
   * 🎯 TRACKER OBJECTIF RÉCLAMÉ
   */
  async logObjectiveClaimed(userId, userName, objectiveId, objectiveName, xpReward) {
    return await this.logActivity({
      type: EVENT_TYPES.OBJECTIVE_CLAIMED,
      userId,
      userName,
      category: EVENT_CATEGORIES.OBJECTIVES,
      action: 'Objectif Réclamé',
      details: `${objectiveName} - ${xpReward} XP`,
      entityType: 'objective',
      entityId: objectiveId,
      xpAmount: xpReward,
      status: 'claimed'
    });
  }

  /**
   * 🎁 TRACKER RÉCOMPENSE DEMANDÉE
   */
  async logRewardRequested(userId, userName, rewardId, rewardName, xpCost) {
    return await this.logActivity({
      type: EVENT_TYPES.REWARD_REQUESTED,
      userId,
      userName,
      category: EVENT_CATEGORIES.REWARDS,
      action: 'Récompense Demandée',
      details: `${rewardName} - ${xpCost} XP`,
      entityType: 'reward',
      entityId: rewardId,
      xpAmount: xpCost,
      status: 'requested'
    });
  }

  /**
   * 👤 TRACKER MISE À JOUR PROFIL
   */
  async logProfileUpdated(userId, userName, fieldsUpdated) {
    return await this.logActivity({
      type: EVENT_TYPES.PROFILE_UPDATED,
      userId,
      userName,
      category: EVENT_CATEGORIES.PROFILE,
      action: 'Profil Mis à Jour',
      details: `Champs modifiés: ${fieldsUpdated.join(', ')}`,
      status: 'updated',
      metadata: { fields: fieldsUpdated }
    });
  }

  /**
   * 👑 TRACKER ACTION GODMOD
   */
  async logGodmodAction(adminId, adminName, targetUserId, targetUserName, action, details) {
    return await this.logActivity({
      type: EVENT_TYPES.GODMOD_ACTION,
      userId: adminId,
      userName: adminName,
      category: EVENT_CATEGORIES.ADMIN,
      action: `GODMOD: ${action}`,
      details: `${details} (Cible: ${targetUserName})`,
      status: 'executed',
      metadata: { 
        targetUserId, 
        targetUserName,
        actionType: action
      }
    });
  }

  /**
   * ⏰ TRACKER POINTAGE (Check-in/Check-out)
   */
  async logTimetrack(userId, userName, type, timestamp) {
    return await this.logActivity({
      type: type === 'checkin' ? EVENT_TYPES.TIMETRACK_CHECKIN : EVENT_TYPES.TIMETRACK_CHECKOUT,
      userId,
      userName,
      category: EVENT_CATEGORIES.HR,
      action: type === 'checkin' ? 'Pointage Entrée' : 'Pointage Sortie',
      details: `Pointage effectué à ${new Date(timestamp).toLocaleTimeString()}`,
      status: 'recorded',
      metadata: { timestamp, type }
    });
  }

  /**
   * 📊 RÉCUPÉRER L'HISTORIQUE D'UN UTILISATEUR
   */
  async getUserActivity(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      const activities = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.clientTimestamp)
        });
      });

      console.log(`📊 [TRACKING] ${activities.length} activités récupérées pour l'utilisateur`);
      return activities;

    } catch (error) {
      console.error('❌ [TRACKING] Erreur récupération activités:', error);
      return [];
    }
  }

  /**
   * 📈 RÉCUPÉRER TOUTES LES ACTIVITÉS (ADMIN/GODMOD)
   */
  async getAllActivities(limitCount = 200) {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      const activities = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.clientTimestamp)
        });
      });

      console.log(`📈 [TRACKING] ${activities.length} activités totales récupérées`);
      return activities;

    } catch (error) {
      console.error('❌ [TRACKING] Erreur récupération activités globales:', error);
      return [];
    }
  }

  /**
   * 🔍 FILTRER LES ACTIVITÉS PAR CATÉGORIE
   */
  async getActivitiesByCategory(category, limitCount = 100) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      const activities = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.clientTimestamp)
        });
      });

      console.log(`🔍 [TRACKING] ${activities.length} activités trouvées pour ${category}`);
      return activities;

    } catch (error) {
      console.error('❌ [TRACKING] Erreur filtrage par catégorie:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES D'ACTIVITÉ
   */
  async getActivityStats(userId = null) {
    try {
      let q;
      
      if (userId) {
        q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId)
        );
      } else {
        q = query(collection(db, this.collectionName));
      }

      const snapshot = await getDocs(q);
      
      const stats = {
        totalActivities: snapshot.size,
        byCategory: {},
        byType: {},
        totalXpGained: 0,
        todayActivities: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Par catégorie
        stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
        
        // Par type
        stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
        
        // XP total
        if (data.xpAmount) {
          stats.totalXpGained += data.xpAmount;
        }
        
        // Aujourd'hui
        const activityDate = data.timestamp?.toDate?.() || new Date(data.clientTimestamp);
        if (activityDate >= today) {
          stats.todayActivities++;
        }
      });

      console.log('📊 [TRACKING] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [TRACKING] Erreur calcul statistiques:', error);
      return null;
    }
  }
}

// 🎯 INSTANCE SINGLETON
const activityTrackingService = new ActivityTrackingService();

// 📤 EXPORTS
export { activityTrackingService };
export default activityTrackingService;

console.log('✅ Activity Tracking Service chargé et prêt');
