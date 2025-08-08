// ==========================================
// 📁 react-app/src/core/services/interviewService.js
// SERVICE ENTRETIENS AMÉLIORÉ AVEC GESTION D'ERREURS - v3.5
// ==========================================

import { 
  db,
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  arrayUnion 
} from '../firebase.js';

/**
 * 🎯 CONFIGURATION DES ENTRETIENS
 */
export const INTERVIEW_CONFIG = {
  // Collections Firebase
  COLLECTIONS: {
    INTERVIEWS: 'interviews',
    INTERVIEW_HISTORY: 'interviewHistory',
    INTERVIEW_TEMPLATES: 'interviewTemplates',
    NOTIFICATIONS: 'notifications'
  },
  
  // Statuts possibles
  STATUS: {
    PLANNED: 'planned',
    IN_PROGRESS: 'in_progress', 
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    POSTPONED: 'postponed'
  },
  
  // Types d'entretiens
  TYPES: {
    INTEGRATION: 'integration',
    GAMEMASTER: 'gamemaster'
  },
  
  // Évaluations
  EVALUATIONS: {
    EXCELLENT: 'excellent',
    GOOD: 'good', 
    SATISFACTORY: 'satisfactory',
    NEEDS_IMPROVEMENT: 'needs_improvement',
    UNSATISFACTORY: 'unsatisfactory'
  }
};

/**
 * 🛡️ UTILITAIRES DE SÉCURITÉ
 */
const safeExecute = async (operation, fallbackValue = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('🛡️ Safe execution failed:', error);
    return { success: false, error: error.message, fallback: fallbackValue };
  }
};

const validateInput = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Champs requis manquants: ${missing.join(', ')}`);
  }
  return true;
};

/**
 * 🎯 SERVICE PRINCIPAL DE GESTION DES ENTRETIENS
 */
export class InterviewService {

  /**
   * 📅 PROGRAMMER UN ENTRETIEN
   */
  static async scheduleInterview(interviewData) {
    return safeExecute(async () => {
      console.log('📅 Programmation entretien...');
      
      // Validation des données requises
      validateInput(interviewData, [
        'templateId', 
        'scheduledDate', 
        'createdBy'
      ]);

      const interview = {
        // Métadonnées
        templateId: interviewData.templateId,
        templateName: interviewData.templateName,
        category: interviewData.category,
        
        // Planification
        scheduledDate: interviewData.scheduledDate,
        date: interviewData.date,
        time: interviewData.time,
        duration: interviewData.duration || 30,
        
        // Participants
        createdBy: interviewData.createdBy,
        conductedBy: interviewData.conductedBy || interviewData.createdBy,
        participantId: interviewData.participantId,
        participantName: interviewData.participantName,
        
        // Détails
        title: interviewData.title,
        description: interviewData.description,
        location: interviewData.location || 'Bureau',
        type: interviewData.type || 'presentiel',
        notes: interviewData.notes || '',
        
        // Contenu
        objectives: interviewData.objectives || [],
        questions: interviewData.questions || [],
        
        // Statut
        status: INTERVIEW_CONFIG.STATUS.PLANNED,
        completed: false,
        
        // Horodatage
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(
        collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS), 
        interview
      );

      // Ajouter à l'historique
      await this.addToHistory({
        interviewId: docRef.id,
        action: 'scheduled',
        performedBy: interviewData.createdBy,
        metadata: {
          templateId: interviewData.templateId,
          scheduledDate: interviewData.scheduledDate
        }
      });

      console.log('✅ Entretien programmé:', docRef.id);
      return { 
        success: true, 
        interviewId: docRef.id, 
        data: { id: docRef.id, ...interview }
      };
      
    }, { success: false, error: 'Erreur programmation entretien' });
  }

  /**
   * 📖 OBTENIR LES ENTRETIENS D'UN UTILISATEUR
   */
  static async getUserInterviews(userId, filters = {}) {
    return safeExecute(async () => {
      console.log('📖 Chargement entretiens utilisateur:', userId);
      
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }

      let q = query(
        collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS),
        where('createdBy', '==', userId)
      );

      // Filtres optionnels
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      // Tri par date de création (plus récent en premier)
      q = query(q, orderBy('createdAt', 'desc'));

      // Limite optionnelle
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const interviews = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interviews.push({
          id: doc.id,
          ...data,
          // Conversion des timestamps Firestore
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt
        });
      });

      console.log(`✅ ${interviews.length} entretiens chargés`);
      return { success: true, data: interviews };
      
    }, { success: false, data: [] });
  }

  /**
   * 🎯 COMMENCER UN ENTRETIEN
   */
  static async startInterview(interviewId, conductorId) {
    return safeExecute(async () => {
      console.log('🎯 Démarrage entretien:', interviewId);
      
      if (!interviewId || !conductorId) {
        throw new Error('ID entretien et conducteur requis');
      }

      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      const interview = interviewDoc.data();
      
      if (interview.status !== INTERVIEW_CONFIG.STATUS.PLANNED) {
        throw new Error(`Entretien déjà ${interview.status}`);
      }

      const updates = {
        status: INTERVIEW_CONFIG.STATUS.IN_PROGRESS,
        startedAt: serverTimestamp(),
        startedBy: conductorId,
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);

      // Historique
      await this.addToHistory({
        interviewId,
        action: 'started',
        performedBy: conductorId
      });

      console.log('✅ Entretien démarré');
      return { success: true };
      
    }, { success: false, error: 'Erreur démarrage entretien' });
  }

  /**
   * ✅ FINALISER UN ENTRETIEN
   */
  static async completeInterview(interviewId, completionData) {
    return safeExecute(async () => {
      console.log('✅ Finalisation entretien:', interviewId);
      
      validateInput(completionData, ['evaluation', 'completedBy']);

      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      const updates = {
        // Résultats
        responses: completionData.responses || {},
        conductorNotes: completionData.notes || '',
        evaluation: completionData.evaluation,
        nextSteps: completionData.nextSteps || [],
        followUpDate: completionData.followUpDate || null,
        
        // Statut
        status: INTERVIEW_CONFIG.STATUS.COMPLETED,
        completed: true,
        completedAt: serverTimestamp(),
        completedBy: completionData.completedBy,
        
        // Mise à jour
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);

      // Historique détaillé
      await this.addToHistory({
        interviewId,
        action: 'completed',
        performedBy: completionData.completedBy,
        metadata: {
          evaluation: completionData.evaluation,
          nextStepsCount: completionData.nextSteps?.length || 0
        }
      });

      // Créer les notifications de suivi si nécessaire
      if (completionData.followUpDate) {
        await this.createFollowUpNotification(interviewId, completionData.followUpDate);
      }

      console.log('✅ Entretien finalisé');
      return { success: true };
      
    }, { success: false, error: 'Erreur finalisation entretien' });
  }

  /**
   * ❌ ANNULER UN ENTRETIEN
   */
  static async cancelInterview(interviewId, cancelData) {
    return safeExecute(async () => {
      console.log('❌ Annulation entretien:', interviewId);
      
      validateInput(cancelData, ['cancelledBy', 'reason']);

      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      const updates = {
        status: INTERVIEW_CONFIG.STATUS.CANCELLED,
        cancelledAt: serverTimestamp(),
        cancelledBy: cancelData.cancelledBy,
        cancelReason: cancelData.reason,
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);

      // Historique
      await this.addToHistory({
        interviewId,
        action: 'cancelled',
        performedBy: cancelData.cancelledBy,
        metadata: { reason: cancelData.reason }
      });

      console.log('✅ Entretien annulé');
      return { success: true };
      
    }, { success: false, error: 'Erreur annulation entretien' });
  }

  /**
   * 🔄 REPROGRAMMER UN ENTRETIEN
   */
  static async rescheduleInterview(interviewId, rescheduleData) {
    return safeExecute(async () => {
      console.log('🔄 Reprogrammation entretien:', interviewId);
      
      validateInput(rescheduleData, ['newDate', 'newTime', 'rescheduledBy']);

      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      const interview = interviewDoc.data();
      
      const updates = {
        // Nouvelle planification
        scheduledDate: `${rescheduleData.newDate}T${rescheduleData.newTime}:00`,
        date: rescheduleData.newDate,
        time: rescheduleData.newTime,
        
        // Historique de la reprogrammation
        previousSchedule: {
          date: interview.date,
          time: interview.time,
          rescheduledAt: serverTimestamp(),
          rescheduledBy: rescheduleData.rescheduledBy,
          reason: rescheduleData.reason || 'Non spécifié'
        },
        
        // Statut remis à planifié si était en cours
        status: INTERVIEW_CONFIG.STATUS.PLANNED,
        
        // Mise à jour
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);

      // Historique
      await this.addToHistory({
        interviewId,
        action: 'rescheduled',
        performedBy: rescheduleData.rescheduledBy,
        metadata: {
          oldDate: `${interview.date} ${interview.time}`,
          newDate: `${rescheduleData.newDate} ${rescheduleData.newTime}`,
          reason: rescheduleData.reason
        }
      });

      console.log('✅ Entretien reprogrammé');
      return { success: true };
      
    }, { success: false, error: 'Erreur reprogrammation entretien' });
  }

  /**
   * 🗑️ SUPPRIMER UN ENTRETIEN
   */
  static async deleteInterview(interviewId, deletedBy) {
    return safeExecute(async () => {
      console.log('🗑️ Suppression entretien:', interviewId);
      
      if (!interviewId || !deletedBy) {
        throw new Error('ID entretien et utilisateur requis');
      }

      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      // Sauvegarder l'entretien dans l'historique avant suppression
      const interview = interviewDoc.data();
      await this.addToHistory({
        interviewId,
        action: 'deleted',
        performedBy: deletedBy,
        metadata: {
          interviewData: {
            title: interview.title,
            templateName: interview.templateName,
            scheduledDate: interview.scheduledDate,
            status: interview.status
          }
        }
      });

      await deleteDoc(interviewRef);

      console.log('✅ Entretien supprimé');
      return { success: true };
      
    }, { success: false, error: 'Erreur suppression entretien' });
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'ENTRETIENS
   */
  static async getInterviewStats(userId, period = '30days') {
    return safeExecute(async () => {
      console.log('📊 Calcul statistiques entretiens:', userId);
      
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }

      // Calculer la date de début selon la période
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Récupérer tous les entretiens de l'utilisateur
      const result = await this.getUserInterviews(userId);
      if (!result.success) {
        throw new Error('Erreur récupération entretiens');
      }

      const interviews = result.data;
      
      // Filtrer par période
      const periodInterviews = interviews.filter(interview => {
        const interviewDate = new Date(interview.createdAt);
        return interviewDate >= startDate;
      });

      // Calculer les statistiques
      const stats = {
        period,
        total: periodInterviews.length,
        
        // Par statut
        planned: periodInterviews.filter(i => i.status === INTERVIEW_CONFIG.STATUS.PLANNED).length,
        completed: periodInterviews.filter(i => i.status === INTERVIEW_CONFIG.STATUS.COMPLETED).length,
        cancelled: periodInterviews.filter(i => i.status === INTERVIEW_CONFIG.STATUS.CANCELLED).length,
        
        // Par catégorie
        integration: periodInterviews.filter(i => i.category === 'integration').length,
        gamemaster: periodInterviews.filter(i => i.category === 'gamemaster').length,
        
        // Par évaluation (pour les entretiens terminés)
        evaluations: {
          excellent: periodInterviews.filter(i => i.evaluation === INTERVIEW_CONFIG.EVALUATIONS.EXCELLENT).length,
          good: periodInterviews.filter(i => i.evaluation === INTERVIEW_CONFIG.EVALUATIONS.GOOD).length,
          satisfactory: periodInterviews.filter(i => i.evaluation === INTERVIEW_CONFIG.EVALUATIONS.SATISFACTORY).length,
          needs_improvement: periodInterviews.filter(i => i.evaluation === INTERVIEW_CONFIG.EVALUATIONS.NEEDS_IMPROVEMENT).length,
          unsatisfactory: periodInterviews.filter(i => i.evaluation === INTERVIEW_CONFIG.EVALUATIONS.UNSATISFACTORY).length
        },
        
        // Tendances
        completionRate: periodInterviews.length > 0 ? 
          Math.round((periodInterviews.filter(i => i.status === INTERVIEW_CONFIG.STATUS.COMPLETED).length / periodInterviews.length) * 100) : 0,
        
        averageDuration: periodInterviews.length > 0 ?
          Math.round(periodInterviews.reduce((sum, i) => sum + (i.duration || 30), 0) / periodInterviews.length) : 0,
        
        // Prochains entretiens
        upcoming: interviews.filter(i => {
          if (i.status !== INTERVIEW_CONFIG.STATUS.PLANNED) return false;
          const interviewDate = new Date(`${i.date}T${i.time}`);
          return interviewDate >= now;
        }).slice(0, 5)
      };

      console.log('✅ Statistiques calculées');
      return { success: true, data: stats };
      
    }, { success: false, data: null });
  }

  /**
   * 📝 AJOUTER À L'HISTORIQUE
   */
  static async addToHistory(historyData) {
    return safeExecute(async () => {
      const historyEntry = {
        interviewId: historyData.interviewId,
        action: historyData.action,
        performedBy: historyData.performedBy,
        timestamp: serverTimestamp(),
        metadata: historyData.metadata || {}
      };

      await addDoc(
        collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEW_HISTORY), 
        historyEntry
      );

      return { success: true };
    }, { success: false });
  }

  /**
   * 🔔 CRÉER UNE NOTIFICATION DE SUIVI
   */
  static async createFollowUpNotification(interviewId, followUpDate) {
    return safeExecute(async () => {
      const notification = {
        type: 'interview_followup',
        interviewId,
        scheduledDate: followUpDate,
        message: 'Suivi d\'entretien programmé',
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(
        collection(db, INTERVIEW_CONFIG.COLLECTIONS.NOTIFICATIONS), 
        notification
      );

      return { success: true };
    }, { success: false });
  }

  /**
   * 🔍 RECHERCHER DES ENTRETIENS
   */
  static async searchInterviews(userId, searchQuery, filters = {}) {
    return safeExecute(async () => {
      console.log('🔍 Recherche entretiens:', searchQuery);
      
      // Récupérer tous les entretiens de l'utilisateur
      const result = await this.getUserInterviews(userId, filters);
      if (!result.success) {
        throw new Error('Erreur récupération entretiens');
      }

      let interviews = result.data;

      // Filtrer par recherche textuelle si fournie
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        interviews = interviews.filter(interview => {
          return (
            interview.title?.toLowerCase().includes(query) ||
            interview.templateName?.toLowerCase().includes(query) ||
            interview.participantName?.toLowerCase().includes(query) ||
            interview.notes?.toLowerCase().includes(query) ||
            interview.conductorNotes?.toLowerCase().includes(query)
          );
        });
      }

      console.log(`✅ ${interviews.length} entretiens trouvés`);
      return { success: true, data: interviews };
      
    }, { success: false, data: [] });
  }

  /**
   * 📋 OBTENIR LES TEMPLATES DISPONIBLES
   */
  static getAvailableTemplates(category = null) {
    // Cette fonction retourne les templates statiques définis dans le composant
    // Dans une version future, on pourrait les stocker en base de données
    
    const templates = {
      // Templates d'intégration
      initial: { category: 'integration', targetAudience: 'nouveaux' },
      weekly: { category: 'integration', targetAudience: 'nouveaux' },
      milestone: { category: 'integration', targetAudience: 'nouveaux' },
      final: { category: 'integration', targetAudience: 'nouveaux' },
      
      // Templates Game Master
      gamemaster_mission: { category: 'gamemaster', targetAudience: 'anciens' },
      gamemaster_role: { category: 'gamemaster', targetAudience: 'anciens' },
      gamemaster_synergia: { category: 'gamemaster', targetAudience: 'anciens' },
      gamemaster_skills: { category: 'gamemaster', targetAudience: 'anciens' }
    };

    if (category) {
      const filtered = Object.fromEntries(
        Object.entries(templates).filter(([_, template]) => template.category === category)
      );
      return { success: true, data: filtered };
    }

    return { success: true, data: templates };
  }

  /**
   * 🔄 SYNCHRONISATION HORS LIGNE
   */
  static async syncOfflineInterviews() {
    return safeExecute(async () => {
      const storageKey = 'synergia_offline_interviews';
      const offlineInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      if (offlineInterviews.length === 0) {
        return { success: true, synced: 0 };
      }

      let syncedCount = 0;
      const failedInterviews = [];

      for (const interview of offlineInterviews) {
        try {
          const result = await this.scheduleInterview(interview);
          if (result.success) {
            syncedCount++;
            console.log('✅ Entretien hors ligne synchronisé:', result.interviewId);
          } else {
            failedInterviews.push(interview);
          }
        } catch (error) {
          console.warn('⚠️ Échec sync entretien:', error.message);
          failedInterviews.push(interview);
        }
      }

      // Mettre à jour le localStorage avec les entretiens non synchronisés
      localStorage.setItem(storageKey, JSON.stringify(failedInterviews));

      console.log(`✅ ${syncedCount} entretiens synchronisés, ${failedInterviews.length} en attente`);
      return { 
        success: true, 
        synced: syncedCount, 
        pending: failedInterviews.length 
      };
      
    }, { success: false, synced: 0, pending: 0 });
  }

  /**
   * 💾 SAUVEGARDER EN HORS LIGNE
   */
  static saveInterviewOffline(interviewData) {
    try {
      const storageKey = 'synergia_offline_interviews';
      const offlineInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Ajouter un ID temporaire et un timestamp
      const offlineInterview = {
        ...interviewData,
        tempId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedOfflineAt: new Date().toISOString()
      };
      
      offlineInterviews.push(offlineInterview);
      localStorage.setItem(storageKey, JSON.stringify(offlineInterviews));
      
      console.log('💾 Entretien sauvegardé hors ligne');
      return { success: true, tempId: offlineInterview.tempId };
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde hors ligne:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * 🎯 HOOKS ET UTILITAIRES POUR REACT
 */
export const useInterviewService = () => {
  const scheduleInterview = InterviewService.scheduleInterview;
  const getUserInterviews = InterviewService.getUserInterviews;
  const completeInterview = InterviewService.completeInterview;
  const deleteInterview = InterviewService.deleteInterview;
  const getStats = InterviewService.getInterviewStats;
  
  return {
    scheduleInterview,
    getUserInterviews,
    completeInterview,
    deleteInterview,
    getStats
  };
};

export default InterviewService;
