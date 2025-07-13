// ==========================================
// 📁 react-app/src/core/services/interviewService.js
// SERVICE DE GESTION DES ENTRETIENS AVEC LES RÉFÉRENTS
// ==========================================

import { 
  db
} from '../firebase.js';

import {
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';

/**
 * 📅 TYPES D'ENTRETIENS
 */
export const INTERVIEW_TYPES = {
  INITIAL: {
    id: 'initial',
    name: 'Entretien Initial',
    description: 'Premier entretien de prise de contact et définition des objectifs',
    duration: 30,
    mandatory: true,
    dayTarget: 1
  },
  WEEKLY: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    description: 'Point hebdomadaire sur les progrès et les difficultés',
    duration: 20,
    mandatory: false,
    recurring: 'weekly'
  },
  MILESTONE: {
    id: 'milestone',
    name: 'Entretien d\'Étape',
    description: 'Validation de fin de phase et passage à l\'étape suivante',
    duration: 45,
    mandatory: true,
    triggerEvent: 'phase_completion'
  },
  FINAL: {
    id: 'final',
    name: 'Entretien de Validation',
    description: 'Entretien final de validation de l\'intégration',
    duration: 60,
    mandatory: true,
    dayTarget: 30
  },
  SUPPORT: {
    id: 'support',
    name: 'Entretien de Soutien',
    description: 'Entretien en cas de difficultés ou de besoin d\'accompagnement',
    duration: 30,
    mandatory: false,
    onDemand: true
  }
};

/**
 * 📋 MODÈLES D'ENTRETIENS PAR TYPE
 */
export const INTERVIEW_TEMPLATES = {
  initial: {
    questions: [
      'Comment vous sentez-vous pour ce premier jour ?',
      'Avez-vous des questions sur l\'organisation ?',
      'Quels sont vos objectifs pour cette formation ?',
      'Y a-t-il des points spécifiques que vous aimeriez approfondir ?'
    ],
    evaluationCriteria: [
      'Motivation',
      'Compréhension des enjeux',
      'Questions pertinentes',
      'Attitude générale'
    ]
  },
  
  weekly: {
    questions: [
      'Quelles compétences avez-vous développées cette semaine ?',
      'Quelles difficultés avez-vous rencontrées ?',
      'Comment vous sentez-vous dans l\'équipe ?',
      'Avez-vous besoin d\'aide sur des points spécifiques ?'
    ],
    evaluationCriteria: [
      'Progression technique',
      'Intégration équipe',
      'Autonomie',
      'Identification des difficultés'
    ]
  },
  
  milestone: {
    questions: [
      'Comment évaluez-vous votre progression sur cette phase ?',
      'Quelles sont vos réussites principales ?',
      'Sur quels points devez-vous encore progresser ?',
      'Vous sentez-vous prêt(e) pour la phase suivante ?'
    ],
    evaluationCriteria: [
      'Maîtrise des compétences',
      'Auto-évaluation',
      'Capacité d\'analyse',
      'Préparation phase suivante'
    ]
  },
  
  final: {
    questions: [
      'Comment jugez-vous votre intégration globale ?',
      'Quelles compétences vous semblent les plus développées ?',
      'Quels aspects aimeriez-vous encore améliorer ?',
      'Avez-vous des suggestions pour améliorer le parcours ?'
    ],
    evaluationCriteria: [
      'Intégration réussie',
      'Autonomie opérationnelle',
      'Esprit critique constructif',
      'Vision d\'amélioration'
    ]
  }
};

/**
 * 🎯 SERVICE PRINCIPAL DE GESTION DES ENTRETIENS
 */
export class InterviewService {
  
  /**
   * 📅 Programmer un entretien
   */
  static async scheduleInterview(data) {
    try {
      const interview = {
        // Informations de base
        employeeId: data.employeeId,
        referentId: data.referentId,
        type: data.type,
        
        // Planification
        scheduledDate: data.scheduledDate,
        duration: data.duration || INTERVIEW_TYPES[data.type]?.duration || 30,
        location: data.location || 'Bureau référent',
        
        // Statut
        status: 'scheduled', // scheduled, completed, cancelled, postponed
        
        // Contenu
        objectives: data.objectives || [],
        notes: data.notes || '',
        
        // Template
        template: INTERVIEW_TEMPLATES[data.type] || {},
        
        // Métadonnées
        createdAt: serverTimestamp(),
        createdBy: data.referentId,
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'interviews'), interview);
      
      // Ajouter à l'historique onboarding de l'employé
      await this.addToOnboardingHistory(data.employeeId, {
        type: 'interview_scheduled',
        interviewId: docRef.id,
        interviewType: data.type,
        scheduledDate: data.scheduledDate,
        referentId: data.referentId
      });

      return { success: true, interviewId: docRef.id, data: interview };
      
    } catch (error) {
      console.error('Erreur programmation entretien:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Finaliser un entretien avec les résultats
   */
  static async completeInterview(interviewId, completionData) {
    try {
      const interviewRef = doc(db, 'interviews', interviewId);
      
      const updates = {
        status: 'completed',
        completedAt: serverTimestamp(),
        
        // Résultats de l'entretien
        responses: completionData.responses || {},
        evaluations: completionData.evaluations || {},
        globalAssessment: completionData.globalAssessment || '',
        referentNotes: completionData.referentNotes || '',
        
        // Suivi
        nextSteps: completionData.nextSteps || [],
        actionPlan: completionData.actionPlan || [],
        nextInterviewDate: completionData.nextInterviewDate || null,
        
        // Validation
        validated: completionData.validated || false,
        validationComments: completionData.validationComments || '',
        
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);
      
      // Mettre à jour l'historique onboarding
      const interview = await getDoc(interviewRef);
      const interviewData = interview.data();
      
      await this.addToOnboardingHistory(interviewData.employeeId, {
        type: 'interview_completed',
        interviewId,
        interviewType: interviewData.type,
        completedAt: serverTimestamp(),
        validated: completionData.validated,
        referentId: interviewData.referentId
      });

      return { success: true };
      
    } catch (error) {
      console.error('Erreur finalisation entretien:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 Récupérer les entretiens d'un employé
   */
  static async getEmployeeInterviews(employeeId) {
    try {
      const q = query(
        collection(db, 'interviews'),
        where('employeeId', '==', employeeId),
        orderBy('scheduledDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const interviews = [];
      
      querySnapshot.forEach((doc) => {
        interviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, interviews };
      
    } catch (error) {
      console.error('Erreur récupération entretiens employé:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 Récupérer les entretiens d'un référent
   */
  static async getReferentInterviews(referentId, status = 'all') {
    try {
      let q;
      
      if (status === 'all') {
        q = query(
          collection(db, 'interviews'),
          where('referentId', '==', referentId),
          orderBy('scheduledDate', 'desc')
        );
      } else {
        q = query(
          collection(db, 'interviews'),
          where('referentId', '==', referentId),
          where('status', '==', status),
          orderBy('scheduledDate', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const interviews = [];
      
      querySnapshot.forEach((doc) => {
        interviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, interviews };
      
    } catch (error) {
      console.error('Erreur récupération entretiens référent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Reprogrammer un entretien
   */
  static async rescheduleInterview(interviewId, newDate, reason = '') {
    try {
      const interviewRef = doc(db, 'interviews', interviewId);
      const interview = await getDoc(interviewRef);
      
      if (!interview.exists()) {
        throw new Error('Entretien introuvable');
      }

      const updates = {
        scheduledDate: newDate,
        status: 'rescheduled',
        previousDate: interview.data().scheduledDate,
        rescheduleReason: reason,
        rescheduledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);
      
      // Ajouter à l'historique
      await this.addToOnboardingHistory(interview.data().employeeId, {
        type: 'interview_rescheduled',
        interviewId,
        newDate,
        reason,
        rescheduledAt: serverTimestamp()
      });

      return { success: true };
      
    } catch (error) {
      console.error('Erreur reprogrammation entretien:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ❌ Annuler un entretien
   */
  static async cancelInterview(interviewId, reason = '') {
    try {
      const interviewRef = doc(db, 'interviews', interviewId);
      const interview = await getDoc(interviewRef);
      
      if (!interview.exists()) {
        throw new Error('Entretien introuvable');
      }

      const updates = {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(interviewRef, updates);
      
      // Ajouter à l'historique
      await this.addToOnboardingHistory(interview.data().employeeId, {
        type: 'interview_cancelled',
        interviewId,
        reason,
        cancelledAt: serverTimestamp()
      });

      return { success: true };
      
    } catch (error) {
      console.error('Erreur annulation entretien:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🤖 Programmer automatiquement les entretiens obligatoires
   */
  static async autoScheduleMandatoryInterviews(employeeId, referentId, startDate) {
    try {
      const mandatoryInterviews = [];
      
      // Entretien initial (J+1)
      const initialDate = new Date(startDate);
      initialDate.setDate(initialDate.getDate() + 1);
      
      const initialInterview = await this.scheduleInterview({
        employeeId,
        referentId,
        type: 'initial',
        scheduledDate: initialDate,
        objectives: ['Accueil et prise de contact', 'Présentation du parcours', 'Définition des objectifs'],
        notes: 'Entretien initial automatiquement programmé'
      });
      
      if (initialInterview.success) {
        mandatoryInterviews.push(initialInterview);
      }

      // Entretien final (J+30)
      const finalDate = new Date(startDate);
      finalDate.setDate(finalDate.getDate() + 30);
      
      const finalInterview = await this.scheduleInterview({
        employeeId,
        referentId,
        type: 'final',
        scheduledDate: finalDate,
        objectives: ['Bilan de l\'intégration', 'Validation des compétences', 'Perspectives d\'évolution'],
        notes: 'Entretien final automatiquement programmé'
      });
      
      if (finalInterview.success) {
        mandatoryInterviews.push(finalInterview);
      }

      return { 
        success: true, 
        scheduledInterviews: mandatoryInterviews.length,
        interviews: mandatoryInterviews 
      };
      
    } catch (error) {
      console.error('Erreur programmation automatique:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Statistiques des entretiens pour un référent
   */
  static async getReferentInterviewStats(referentId) {
    try {
      const allInterviews = await this.getReferentInterviews(referentId);
      
      if (!allInterviews.success) {
        throw new Error('Erreur récupération entretiens');
      }

      const interviews = allInterviews.interviews;
      
      const stats = {
        total: interviews.length,
        scheduled: interviews.filter(i => i.status === 'scheduled').length,
        completed: interviews.filter(i => i.status === 'completed').length,
        cancelled: interviews.filter(i => i.status === 'cancelled').length,
        rescheduled: interviews.filter(i => i.status === 'rescheduled').length,
        
        // Par type
        byType: {
          initial: interviews.filter(i => i.type === 'initial').length,
          weekly: interviews.filter(i => i.type === 'weekly').length,
          milestone: interviews.filter(i => i.type === 'milestone').length,
          final: interviews.filter(i => i.type === 'final').length,
          support: interviews.filter(i => i.type === 'support').length
        },
        
        // Taux de validation
        validationRate: interviews.filter(i => i.validated).length / Math.max(interviews.filter(i => i.status === 'completed').length, 1) * 100
      };

      return { success: true, stats };
      
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Ajouter à l'historique onboarding
   */
  static async addToOnboardingHistory(employeeId, event) {
    try {
      const onboardingRef = doc(db, 'onboarding', employeeId);
      
      const updates = {
        'interviewHistory': arrayUnion({
          ...event,
          timestamp: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      };

      await updateDoc(onboardingRef, updates);
      
    } catch (error) {
      console.error('Erreur ajout historique onboarding:', error);
    }
  }

  /**
   * 🔍 Rechercher des entretiens
   */
  static async searchInterviews(criteria) {
    try {
      let q = collection(db, 'interviews');
      
      // Construire la requête selon les critères
      if (criteria.employeeId) {
        q = query(q, where('employeeId', '==', criteria.employeeId));
      }
      
      if (criteria.referentId) {
        q = query(q, where('referentId', '==', criteria.referentId));
      }
      
      if (criteria.status) {
        q = query(q, where('status', '==', criteria.status));
      }
      
      if (criteria.type) {
        q = query(q, where('type', '==', criteria.type));
      }
      
      q = query(q, orderBy('scheduledDate', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const interviews = [];
      
      querySnapshot.forEach((doc) => {
        interviews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, interviews };
      
    } catch (error) {
      console.error('Erreur recherche entretiens:', error);
      return { success: false, error: error.message };
    }
  }
}

export default InterviewService;
