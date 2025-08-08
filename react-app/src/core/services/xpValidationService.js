// ==========================================
// 📁 react-app/src/core/services/xpValidationService.js
// SERVICE DE VALIDATION XP - CORRECTIONS MÉTHODE checkAdminPermissions
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase.js';

const COLLECTIONS = {
  XP_REQUESTS: 'xpRequests',
  USERS: 'users',
  TASKS: 'tasks',
  NOTIFICATIONS: 'notifications'
};

const xpValidationService = {

  /**
   * 🛡️ VÉRIFIER LES PERMISSIONS ADMIN - MÉTHODE CORRIGÉE
   */
  async checkAdminPermissions(userId) {
    try {
      console.log('🔍 [XPValidation] Vérification permissions admin pour:', userId);
      
      if (!userId) {
        console.warn('⚠️ checkAdminPermissions: userId manquant');
        return false;
      }

      // Récupérer les données utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur non trouvé:', userId);
        return false;
      }

      const userData = userDoc.data();
      
      // Vérifications multiples pour admin
      const isAdminEmail = userData.email === 'alan.boehme61@gmail.com';
      const isRoleAdmin = userData.profile?.role === 'admin';
      const isProfileRoleAdmin = userData.role === 'admin';
      const hasAdminFlag = userData.isAdmin === true;
      const hasValidatePermission = userData.permissions?.includes('validate_xp');
      const hasAdminPermission = userData.permissions?.includes('admin_access');
      const hasManageTeamPermission = userData.permissions?.includes('manage_team');
      
      const isAdmin = isAdminEmail || isRoleAdmin || isProfileRoleAdmin || 
                     hasAdminFlag || hasValidatePermission || hasAdminPermission || hasManageTeamPermission;
      
      console.log('🔍 [XPValidation] checkAdminPermissions résultat:', {
        userId,
        email: userData.email,
        isAdminEmail,
        isRoleAdmin,
        isProfileRoleAdmin,
        hasAdminFlag,
        hasValidatePermission,
        hasAdminPermission,
        hasManageTeamPermission,
        finalResult: isAdmin
      });
      
      return isAdmin;
      
    } catch (error) {
      console.error('❌ Erreur vérification permissions admin:', error);
      return false;
    }
  },

  /**
   * 📝 CRÉER UNE DEMANDE DE VALIDATION XP
   */
  async createXPRequest(userId, taskId, description, xpAmount, evidenceUrl = null, taskData = null) {
    try {
      const requestData = {
        userId,
        taskId,
        description,
        xpAmount: parseInt(xpAmount),
        evidenceUrl,
        status: 'pending',
        createdAt: new Date(),
        type: 'task_completion',
        
        // Données enrichies de la tâche si disponibles
        taskTitle: taskData?.title || 'Tâche inconnue',
        taskPriority: taskData?.priority || 'medium',
        projectId: taskData?.projectId || null,
        
        // Métadonnées
        submittedFrom: 'web_app',
        version: '1.0'
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.XP_REQUESTS), requestData);
      
      console.log(`📝 Demande XP créée: ${docRef.id} pour ${xpAmount} XP`);
      
      // Créer une notification pour les admins
      await this.notifyAdmins(docRef.id, userId, description, xpAmount);
      
      return {
        success: true,
        requestId: docRef.id,
        message: 'Demande XP soumise avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur création demande XP:', error);
      throw new Error('Impossible de créer la demande XP');
    }
  },

  /**
   * 📊 OBTENIR TOUTES LES DEMANDES XP
   */
  async getAllXPRequests(filters = {}) {
    try {
      const { status = null, userId = null, limit: limitCount = 50 } = filters;
      
      let q = collection(db, COLLECTIONS.XP_REQUESTS);
      
      // Appliquer les filtres
      const queryConstraints = [orderBy('createdAt', 'desc')];
      
      if (status) {
        queryConstraints.push(where('status', '==', status));
      }
      
      if (userId) {
        queryConstraints.push(where('userId', '==', userId));
      }
      
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      
      q = query(q, ...queryConstraints);
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          processedAt: data.processedAt?.toDate ? data.processedAt.toDate() : null
        });
      });

      console.log(`📊 ${requests.length} demandes XP récupérées`);
      return requests;

    } catch (error) {
      console.error('❌ Erreur récupération demandes XP:', error);
      return [];
    }
  },

  /**
   * ✅ VALIDER UNE DEMANDE XP (Admin seulement)
   */
  async validateXPRequest(requestId, adminId, adminNotes = '', autoAwardXP = true) {
    try {
      // Vérifier que l'admin a les permissions
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes pour valider les XP');
      }

      // Récupérer la demande
      const requestRef = doc(db, COLLECTIONS.XP_REQUESTS, requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Demande XP introuvable');
      }

      const requestData = requestSnap.data();
      
      // Vérifier que la demande est en attente
      if (requestData.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Mettre à jour la demande
      await updateDoc(requestRef, {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        adminNotes: adminNotes || 'Demande approuvée',
        processedAt: new Date()
      });

      // Attribuer automatiquement les XP si demandé
      if (autoAwardXP && window.gamificationService) {
        await window.gamificationService.addExperience(
          requestData.userId, 
          requestData.xpAmount, 
          `XP validés par admin: ${requestData.description}`,
          {
            source: 'admin_validation',
            requestId: requestId,
            validatedBy: adminId,
            taskId: requestData.taskId
          }
        );
      }

      // Notifier l'utilisateur
      await this.notifyUser(requestData.userId, 'xp_approved', {
        xpAmount: requestData.xpAmount,
        description: requestData.description,
        adminNotes: adminNotes
      });

      console.log(`✅ Demande XP ${requestId} validée: +${requestData.xpAmount} XP attribués à ${requestData.userId}`);
      
      return {
        success: true,
        message: `${requestData.xpAmount} XP attribués avec succès`,
        xpAwarded: requestData.xpAmount
      };

    } catch (error) {
      console.error('❌ Erreur validation XP:', error);
      throw error;
    }
  },

  /**
   * ❌ REJETER UNE DEMANDE XP
   */
  async rejectXPRequest(requestId, adminId, adminNotes = '') {
    try {
      // Vérifier les permissions admin
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      const requestRef = doc(db, COLLECTIONS.XP_REQUESTS, requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Demande XP introuvable');
      }

      const requestData = requestSnap.data();
      
      if (requestData.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Mettre à jour le statut
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedBy: adminId,
        rejectedAt: new Date(),
        adminNotes: adminNotes || 'Demande rejetée',
        processedAt: new Date()
      });

      // Notifier l'utilisateur du rejet
      await this.notifyUser(requestData.userId, 'xp_rejected', {
        xpAmount: requestData.xpAmount,
        description: requestData.description,
        adminNotes: adminNotes,
        reason: 'Demande rejetée par l\'administrateur'
      });

      console.log(`❌ Demande XP ${requestId} rejetée par admin ${adminId}`);
      
      return {
        success: true,
        message: 'Demande XP rejetée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur rejet XP:', error);
      throw error;
    }
  },

  /**
   * 🔔 NOTIFIER LES ADMINS D'UNE NOUVELLE DEMANDE
   */
  async notifyAdmins(requestId, userId, description, xpAmount) {
    try {
      // Récupérer tous les admins
      const adminsQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('role', '==', 'admin')
      );
      
      const adminsSnapshot = await getDocs(adminsQuery);
      
      // Créer une notification pour chaque admin
      const notifications = adminsSnapshot.docs.map(adminDoc => ({
        userId: adminDoc.id,
        type: 'xp_request',
        title: 'Nouvelle demande XP à valider',
        message: `${description} (+${xpAmount} XP)`,
        data: {
          requestId,
          requesterId: userId,
          xpAmount,
          description
        },
        read: false,
        createdAt: new Date()
      }));

      // Enregistrer toutes les notifications
      await Promise.all(
        notifications.map(notif => 
          addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notif)
        )
      );

      console.log(`🔔 ${notifications.length} admins notifiés pour demande XP ${requestId}`);

    } catch (error) {
      console.error('❌ Erreur notification admins:', error);
    }
  },

  /**
   * 👤 NOTIFIER L'UTILISATEUR DU RÉSULTAT
   */
  async notifyUser(userId, type, data) {
    try {
      const notificationData = {
        userId,
        type,
        title: type === 'xp_approved' ? '🎉 XP Validés !' : '❌ Demande XP Rejetée',
        message: type === 'xp_approved' 
          ? `+${data.xpAmount} XP attribués pour: ${data.description}`
          : `Demande XP rejetée: ${data.description}. Raison: ${data.reason}`,
        data,
        read: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);
      console.log(`🔔 Utilisateur ${userId} notifié: ${type}`);

    } catch (error) {
      console.error('❌ Erreur notification utilisateur:', error);
    }
  },

  /**
   * 📊 OBTENIR LES STATISTIQUES DE VALIDATION XP
   */
  async getXPValidationStats() {
    try {
      const requestsSnapshot = await getDocs(collection(db, COLLECTIONS.XP_REQUESTS));
      
      const stats = {
        total: requestsSnapshot.size,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalXPAwarded: 0
      };

      requestsSnapshot.forEach(doc => {
        const data = doc.data();
        stats[data.status] = (stats[data.status] || 0) + 1;
        
        if (data.status === 'approved') {
          stats.totalXPAwarded += data.xpAmount || 0;
        }
      });

      return stats;

    } catch (error) {
      console.error('❌ Erreur stats validation XP:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0, totalXPAwarded: 0 };
    }
  }
};

export default xpValidationService;
