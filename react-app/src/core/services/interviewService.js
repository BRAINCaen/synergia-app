// ==========================================
// 📁 react-app/src/core/services/interviewService.js
// SERVICE ENTRETIENS COMPLET AVEC TOUS LES EXPORTS
// ==========================================

import { 
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
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📋 TYPES D'ENTRETIENS DISPONIBLES
 */
export const INTERVIEW_TYPES = {
  initial: {
    name: 'Entretien Initial',
    description: 'Premier contact et définition des objectifs',
    duration: 30,
    color: 'blue'
  },
  weekly: {
    name: 'Suivi Hebdomadaire',
    description: 'Point régulier sur les progrès',
    duration: 20,
    color: 'green'
  },
  milestone: {
    name: 'Validation Étape',
    description: 'Validation de fin de phase',
    duration: 45,
    color: 'purple'
  },
  final: {
    name: 'Entretien Final',
    description: 'Validation complète de l\'intégration',
    duration: 60,
    color: 'orange'
  },
  support: {
    name: 'Accompagnement',
    description: 'Soutien en cas de difficultés',
    duration: 30,
    color: 'red'
  }
};

/**
 * 📝 TEMPLATES D'ENTRETIENS
 */
export const INTERVIEW_TEMPLATES = {
  initial: {
    title: 'Entretien d\'accueil',
    objectives: [
      'Présenter l\'équipe et l\'environnement',
      'Définir les objectifs personnalisés',
      'Planifier le parcours d\'intégration'
    ],
    questions: [
      'Pouvez-vous vous présenter brièvement ?',
      'Quelles sont vos attentes pour ce poste ?',
      'Avez-vous des questions sur l\'équipe ou l\'organisation ?'
    ]
  },
  weekly: {
    title: 'Point hebdomadaire',
    objectives: [
      'Évaluer les progrès de la semaine',
      'Identifier les difficultés rencontrées',
      'Planifier les objectifs suivants'
    ],
    questions: [
      'Comment s\'est passée votre semaine ?',
      'Quels objectifs avez-vous atteints ?',
      'Rencontrez-vous des difficultés particulières ?'
    ]
  },
  milestone: {
    title: 'Validation d\'étape',
    objectives: [
      'Valider l\'acquisition des compétences',
      'Évaluer l\'adaptation au poste',
      'Préparer la phase suivante'
    ],
    questions: [
      'Vous sentez-vous à l\'aise avec vos missions actuelles ?',
      'Quelles compétences avez-vous développées ?',
      'Êtes-vous prêt(e) pour plus de responsabilités ?'
    ]
  }
};

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

      // Ajouter l'ID au document
      await updateDoc(docRef, { id: docRef.id });

      console.log('✅ Entretien programmé:', docRef.id);
      return { 
        success: true, 
        interviewId: docRef.id,
        data: { ...interview, id: docRef.id }
      };
      
    }, { success: false, interviewId: null });
  }

  /**
   * ✅ FINALISER UN ENTRETIEN
   */
  static async completeInterview(interviewId, completionData) {
    return safeExecute(async () => {
      console.log('✅ Finalisation entretien:', interviewId);
      
      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      const updateData = {
        // Résultats
        responses: completionData.responses || {},
        evaluations: completionData.evaluations || {},
        globalAssessment: completionData.globalAssessment || '',
        referentNotes: completionData.referentNotes || '',
        nextSteps: completionData.nextSteps || [],
        actionPlan: completionData.actionPlan || [],
        
        // Validation
        validated: completionData.validated || false,
        validationComments: completionData.validationComments || '',
        validatedBy: completionData.validatedBy,
        validatedAt: completionData.validated ? serverTimestamp() : null,
        
        // Statut
        status: INTERVIEW_CONFIG.STATUS.COMPLETED,
        completed: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updateData);

      // Archiver dans l'historique
      await addDoc(collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEW_HISTORY), {
        originalInterviewId: interviewId,
        ...interviewDoc.data(),
        ...updateData,
        archivedAt: serverTimestamp()
      });

      console.log('✅ Entretien finalisé et archivé');
      return { 
        success: true, 
        data: updateData 
      };
      
    }, { success: false });
  }

  /**
   * 📋 OBTENIR LES ENTRETIENS D'UN UTILISATEUR
   */
  static async getUserInterviews(userId, filters = {}) {
    return safeExecute(async () => {
      console.log('📋 Récupération entretiens utilisateur:', userId);
      
      const interviewsRef = collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS);
      let q = query(
        interviewsRef,
        where('createdBy', '==', userId),
        orderBy('scheduledDate', 'desc')
      );

      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const interviews = [];

      snapshot.forEach(doc => {
        interviews.push({ id: doc.id, ...doc.data() });
      });

      console.log(`📊 ${interviews.length} entretiens récupérés`);
      return { success: true, data: interviews };
      
    }, { success: false, data: [] });
  }

  /**
   * 🔄 REPROGRAMMER UN ENTRETIEN
   */
  static async rescheduleInterview(interviewId, newDate, reason = '') {
    return safeExecute(async () => {
      console.log('🔄 Reprogrammation entretien:', interviewId);
      
      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      const interviewDoc = await getDoc(interviewRef);
      
      if (!interviewDoc.exists()) {
        throw new Error('Entretien introuvable');
      }

      const originalData = interviewDoc.data();

      await updateDoc(interviewRef, {
        scheduledDate: newDate,
        status: INTERVIEW_CONFIG.STATUS.PLANNED,
        rescheduledFrom: originalData.scheduledDate,
        rescheduleReason: reason,
        rescheduleCount: (originalData.rescheduleCount || 0) + 1,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Entretien reprogrammé');
      return { success: true };
      
    }, { success: false });
  }

  /**
   * ❌ ANNULER UN ENTRETIEN
   */
  static async cancelInterview(interviewId, reason = '') {
    return safeExecute(async () => {
      console.log('❌ Annulation entretien:', interviewId);
      
      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      
      await updateDoc(interviewRef, {
        status: INTERVIEW_CONFIG.STATUS.CANCELLED,
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Entretien annulé');
      return { success: true };
      
    }, { success: false });
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'ENTRETIENS
   */
  static async getInterviewStats(userId) {
    return safeExecute(async () => {
      console.log('📊 Calcul statistiques entretiens...');
      
      const interviewsRef = collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS);
      const q = query(interviewsRef, where('createdBy', '==', userId));
      const snapshot = await getDocs(q);

      const stats = {
        total: 0,
        planned: 0,
        completed: 0,
        cancelled: 0,
        byType: {}
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        stats.total++;
        
        // Compter par statut
        switch (data.status) {
          case INTERVIEW_CONFIG.STATUS.PLANNED:
            stats.planned++;
            break;
          case INTERVIEW_CONFIG.STATUS.COMPLETED:
            stats.completed++;
            break;
          case INTERVIEW_CONFIG.STATUS.CANCELLED:
            stats.cancelled++;
            break;
        }
        
        // Compter par type
        const type = data.templateId || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      console.log('📊 Statistiques calculées:', stats);
      return { success: true, data: stats };
      
    }, { success: false, data: {} });
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
   * 📝 OBTENIR LES QUESTIONS PAR TYPE
   */
  static getQuestionsByType(type) {
    const questions = {
      initial: [
        'Pouvez-vous vous présenter et nous parler de votre parcours ?',
        'Quelles sont vos attentes concernant ce poste ?',
        'Comment envisagez-vous votre intégration dans l\'équipe ?',
        'Avez-vous des questions sur l\'organisation ou les processus ?'
      ],
      weekly: [
        'Comment s\'est déroulée votre semaine ?',
        'Quels objectifs avez-vous atteints ?',
        'Quelles difficultés avez-vous rencontrées ?',
        'De quoi avez-vous besoin pour la semaine prochaine ?'
      ],
      milestone: [
        'Comment évaluez-vous votre progression depuis le dernier point ?',
        'Quelles sont vos réussites principales ?',
        'Sur quels points devez-vous encore progresser ?',
        'Vous sentez-vous prêt(e) pour la phase suivante ?'
      ],
      final: [
        'Comment jugez-vous votre intégration globale ?',
        'Quelles compétences vous semblent les plus développées ?',
        'Quels aspects aimeriez-vous encore améliorer ?',
        'Avez-vous des suggestions pour améliorer le parcours ?'
      ],
      support: [
        'Quelles sont les principales difficultés rencontrées ?',
        'Quel type d\'accompagnement vous aiderait le plus ?',
        'Comment pourrait-on adapter votre parcours ?',
        'Vous sentez-vous soutenu(e) par l\'équipe ?'
      ]
    };
    
    return questions[type] || questions.initial;
  }

  /**
   * 📋 OBTENIR LE TEMPLATE PAR TYPE
   */
  static getTemplateByType(type) {
    const templates = {
      initial: {
        description: 'Premier contact et définition des objectifs',
        duration: 30,
        mandatory: true
      },
      weekly: {
        description: 'Point régulier sur les progrès',
        duration: 20,
        recurring: true
      },
      milestone: {
        description: 'Validation de fin de phase',
        duration: 45,
        mandatory: true
      },
      final: {
        description: 'Validation complète de l\'intégration',
        duration: 60,
        mandatory: true
      },
      support: {
        description: 'Accompagnement en cas de difficultés',
        duration: 30,
        onDemand: true
      }
    };
    
    return templates[type] || templates.initial;
  }

  /**
   * 🔄 SYNCHRONISER LES ENTRETIENS TEMPORAIRES
   */
  static async syncTemporaryInterviews() {
    try {
      const storageKey = `synergia_interviews`;
      const tempInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      if (tempInterviews.length === 0) return { success: true, synced: 0 };
      
      let syncedCount = 0;
      const remainingInterviews = [];
      
      for (const interview of tempInterviews) {
        try {
          await addDoc(collection(db, 'interviews'), interview);
          syncedCount++;
          console.log(`✅ [SYNC] Entretien ${interview.id} synchronisé`);
        } catch (syncError) {
          console.warn(`⚠️ [SYNC] Échec sync ${interview.id}:`, syncError.message);
          remainingInterviews.push(interview);
        }
      }
      
      // Mettre à jour le localStorage
      localStorage.setItem(storageKey, JSON.stringify(remainingInterviews));
      
      return { 
        success: true, 
        synced: syncedCount, 
        remaining: remainingInterviews.length 
      };
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur synchronisation:', error);
      return { success: false, error: error.message };
    }
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

      console.log(`📊 Sync terminée: ${syncedCount} synchronisés, ${failedInterviews.length} échecs`);
      return { 
        success: true, 
        synced: syncedCount, 
        failed: failedInterviews.length 
      };
      
    }, { success: false, synced: 0, failed: 0 });
  }

  /**
   * 📊 OBTENIR TOUS LES ENTRETIENS (ADMIN)
   */
  static async getAllInterviews(filters = {}) {
    return safeExecute(async () => {
      console.log('📊 Récupération de tous les entretiens...');
      
      const interviewsRef = collection(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS);
      let q = query(interviewsRef, orderBy('scheduledDate', 'desc'));

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const interviews = [];

      snapshot.forEach(doc => {
        interviews.push({ id: doc.id, ...doc.data() });
      });

      console.log(`📊 ${interviews.length} entretiens récupérés (admin)`);
      return { success: true, data: interviews };
      
    }, { success: false, data: [] });
  }

  /**
   * 🗑️ SUPPRIMER UN ENTRETIEN
   */
  static async deleteInterview(interviewId) {
    return safeExecute(async () => {
      console.log('🗑️ Suppression entretien:', interviewId);
      
      const interviewRef = doc(db, INTERVIEW_CONFIG.COLLECTIONS.INTERVIEWS, interviewId);
      await deleteDoc(interviewRef);

      console.log('✅ Entretien supprimé');
      return { success: true };
      
    }, { success: false });
  }
}

// Export par défaut
export default InterviewService;
