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
import { db } from '../config/firebase';
import { gamificationService } from './gamificationService';

const COLLECTIONS = {
  XP_REQUESTS: 'xpRequests',
  USERS: 'users',
  TASKS: 'tasks',
  NOTIFICATIONS: 'notifications'
};

export const xpValidationService = {

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
      if (autoAwardXP) {
        await gamificationService.addExperience(
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

      console.log(`❌ Demande XP ${requestId} rejetée par ${adminId}`);
      
      return {
        success: true,
        message: 'Demande XP rejetée'
      };

    } catch (error) {
      console.error('❌ Erreur rejet XP:', error);
      throw error;
    }
  },

  /**
   * 🔍 RÉCUPÉRER LES DEMANDES XP (avec filtres)
   */
  async getXPRequests(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.XP_REQUESTS);
      
      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.adminId) {
        q = query(q, where('approvedBy', '==', filters.adminId));
      }

      // Trier par date de création (plus récent en premier)
      q = query(q, orderBy('createdAt', 'desc'));
      
      // Limiter les résultats si spécifié
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`🔍 ${requests.length} demandes XP récupérées avec filtres:`, filters);
      
      return requests;

    } catch (error) {
      console.error('❌ Erreur récupération demandes XP:', error);
      throw error;
    }
  },

  /**
   * 📊 OBTENIR LES STATISTIQUES XP
   */
  async getXPStats(timeRange = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      const allRequests = await this.getXPRequests();
      const recentRequests = allRequests.filter(r => {
        const createdAt = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return createdAt >= cutoffDate;
      });

      const stats = {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'pending').length,
        approved: allRequests.filter(r => r.status === 'approved').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length,
        
        // Stats période récente
        recentTotal: recentRequests.length,
        recentApproved: recentRequests.filter(r => r.status === 'approved').length,
        recentRejected: recentRequests.filter(r => r.status === 'rejected').length,
        
        // XP totaux
        totalXPAwarded: allRequests
          .filter(r => r.status === 'approved')
          .reduce((sum, r) => sum + (r.xpAmount || 0), 0),
        
        // Taux d'approbation
        approvalRate: allRequests.length > 0 
          ? Math.round((allRequests.filter(r => r.status === 'approved').length / allRequests.length) * 100)
          : 0,

        // Temps de traitement moyen (en heures)
        avgProcessingTime: this.calculateAvgProcessingTime(allRequests.filter(r => r.status !== 'pending'))
      };

      console.log('📊 Statistiques XP calculées:', stats);
      
      return stats;

    } catch (error) {
      console.error('❌ Erreur calcul stats XP:', error);
      throw error;
    }
  },

  /**
   * ⏱️ CALCULER LE TEMPS DE TRAITEMENT MOYEN
   */
  calculateAvgProcessingTime(processedRequests) {
    if (processedRequests.length === 0) return 0;

    const totalTime = processedRequests.reduce((sum, request) => {
      const createdAt = request.createdAt.toDate ? request.createdAt.toDate() : new Date(request.createdAt);
      const processedAt = request.processedAt?.toDate ? request.processedAt.toDate() : new Date(request.processedAt);
      
      if (processedAt && createdAt) {
        return sum + (processedAt - createdAt);
      }
      return sum;
    }, 0);

    // Convertir en heures
    return Math.round((totalTime / processedRequests.length) / (1000 * 60 * 60));
  },

  /**
   * 👑 VÉRIFIER LES PERMISSIONS ADMIN
   */
  async checkAdminPermissions(userId) {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      
      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();
      
      // Vérifier si admin ou a permission de valider XP
      return userData.role === 'admin' || 
             userData.permissions?.includes('validate_xp') ||
             userData.permissions?.includes('manage_team');

    } catch (error) {
      console.error('❌ Erreur vérification permissions:', error);
      return false;
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
          : `Demande rejetée: ${data.description}`,
        data,
        read: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);
      
      console.log(`👤 Utilisateur ${userId} notifié: ${type}`);

    } catch (error) {
      console.error('❌ Erreur notification utilisateur:', error);
    }
  },

  /**
   * 🗑️ SUPPRIMER UNE DEMANDE XP (Admin seulement)
   */
  async deleteXPRequest(requestId, adminId) {
    try {
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      await deleteDoc(doc(db, COLLECTIONS.XP_REQUESTS, requestId));
      
      console.log(`🗑️ Demande XP ${requestId} supprimée par ${adminId}`);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression demande XP:', error);
      throw error;
    }
  },

  /**
   * 📡 ÉCOUTER LES CHANGEMENTS EN TEMPS RÉEL
   */
  subscribeToXPRequests(callback, filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.XP_REQUESTS);
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        callback(requests);
      });

      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur souscription XP requests:', error);
      return () => {}; // Retourner une fonction vide en cas d'erreur
    }
  }
};

export default xpValidationService;
