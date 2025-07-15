// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// SERVICE ONBOARDING FORMATION GÉNÉRALE BRAIN ESCAPE & QUIZ GAME
// ==========================================

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

import { db } from '../firebase.js';
import { gamificationService } from './gamificationService.js';

// 🎯 PHASES D'INTÉGRATION BRAIN ESCAPE & QUIZ GAME
export const ONBOARDING_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain & de l\'équipe',
    description: 'Première immersion dans l\'univers Brain',
    duration: 2, // en jours
    color: 'from-purple-500 to-pink-500',
    icon: '💡',
    order: 1,
    xpTotal: 50,
    badge: 'Bienvenue chez Brain !'
  },
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client·e & expérience joueur·euse',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-blue-500 to-cyan-500',
    icon: '👥',
    order: 2,
    xpTotal: 80,
    badge: 'Ambassadeur·rice Brain'
  },
  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité, matériel & procédures',
    description: 'Sécurité et gestion du matériel',
    duration: 3,
    color: 'from-orange-500 to-red-500',
    icon: '🔐',
    order: 3,
    xpTotal: 100,
    badge: 'Gardien·ne du Temple'
  },
  FORMATION_EXPERIENCE: {
    id: 'formation_experience',
    name: '🔎 Formation par expérience',
    description: 'Maîtrise des Escape Games et Quiz Games',
    duration: 12,
    color: 'from-green-500 to-emerald-500',
    icon: '🔎',
    order: 4,
    xpTotal: 120,
    badge: 'Expert·e [Salle/Jeu]'
  },
  TACHES_QUOTIDIEN: {
    id: 'taches_quotidien',
    name: '🛠️ Tâches du quotidien & gestion',
    description: 'Autonomie dans les tâches quotidiennes',
    duration: 5,
    color: 'from-cyan-500 to-blue-500',
    icon: '🛠️',
    order: 5,
    xpTotal: 90,
    badge: 'Pilier du Quotidien'
  },
  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft Skills & communication',
    description: 'Développement des compétences humaines',
    duration: 7,
    color: 'from-pink-500 to-rose-500',
    icon: '🌱',
    order: 6,
    xpTotal: 70,
    badge: 'Esprit Brain'
  },
  VALIDATION_FINALE: {
    id: 'validation_finale',
    name: '🚩 Validation finale & intégration',
    description: 'Certification Game Master Brain',
    duration: 2,
    color: 'from-violet-500 to-purple-500',
    icon: '🚩',
    order: 7,
    xpTotal: 200,
    badge: 'Game Master certifié·e Brain'
  }
};

class OnboardingService {
  constructor() {
    this.FORMATION_COLLECTION = 'onboardingFormation';
    this.INTERVIEWS_COLLECTION = 'onboardingInterviews';
  }

  /**
   * 🚀 Créer un profil de formation vide
   */
  async createFormationProfile(userId) {
    try {
      console.log('🚀 Création profil formation pour:', userId);
      
      // Supprimer l'ancien profil s'il existe
      try {
        const existingProfile = await this.getFormationProfile(userId);
        if (existingProfile.success) {
          console.log('🗑️ Suppression ancien profil formation');
          await this.deleteFormationProfile(userId);
        }
      } catch (error) {
        console.log('ℹ️ Pas d\'ancien profil formation à supprimer');
      }
      
      const formationProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startDate: new Date().toISOString(),
        completionDate: null,
        currentPhase: 'decouverte_brain',
        phases: {},
        interviews: [],
        earnedBadges: [],
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          totalXP: 0,
          earnedXP: 0,
          completionRate: 0,
          averageTaskTime: 0
        }
      };

      // Initialiser toutes les phases
      Object.keys(ONBOARDING_PHASES).forEach(phaseKey => {
        const phaseId = ONBOARDING_PHASES[phaseKey].id;
        formationProfile.phases[phaseId] = {
          started: false,
          completed: false,
          startDate: null,
          completionDate: null,
          tasks: {},
          notes: '',
          referentComments: ''
        };
      });

      await setDoc(doc(db, this.FORMATION_COLLECTION, userId), formationProfile);
      console.log('✅ Profil formation créé');
      return { success: true, data: formationProfile };

    } catch (error) {
      console.error('❌ Erreur création profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Récupérer le profil de formation
   */
  async getFormationProfile(userId) {
    try {
      console.log('📊 Récupération profil formation pour:', userId);
      
      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Profil formation trouvé');
        return { success: true, data };
      } else {
        console.log('❌ Profil formation non trouvé');
        return { success: false, error: 'Profil formation non trouvé' };
      }

    } catch (error) {
      console.error('❌ Erreur récupération profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ Supprimer le profil de formation
   */
  async deleteFormationProfile(userId) {
    try {
      console.log('🗑️ Suppression profil formation pour:', userId);
      
      await deleteDoc(doc(db, this.FORMATION_COLLECTION, userId));
      console.log('✅ Profil formation supprimé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Toggle une tâche de formation
   */
  async toggleTask(userId, phaseId, taskId) {
    try {
      console.log('🔄 Toggle tâche formation:', phaseId, taskId);
      
      // Récupérer le profil actuel
      const profileResult = await this.getFormationProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil formation non trouvé' };
      }

      const currentTask = profileResult.data.phases?.[phaseId]?.tasks?.[taskId];
      const newState = !currentTask?.completed;

      // Construire le chemin de mise à jour
      const taskPath = `phases.${phaseId}.tasks.${taskId}`;
      
      const updates = {
        [`${taskPath}.completed`]: newState,
        [`${taskPath}.completionDate`]: newState ? new Date().toISOString() : null,
        [`${taskPath}.completedBy`]: newState ? userId : null,
        updatedAt: serverTimestamp()
      };

      // Si c'est la première tâche de la phase, marquer la phase comme commencée
      if (newState && !profileResult.data.phases[phaseId].started) {
        updates[`phases.${phaseId}.started`] = true;
        updates[`phases.${phaseId}.startDate`] = new Date().toISOString();
      }

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      
      // Ajouter des XP si tâche complétée
      if (newState) {
        try {
          // Trouver les détails de la tâche pour récupérer les XP
          const taskXP = this.getTaskXP(phaseId, taskId);
          if (taskXP > 0) {
            await gamificationService.addExperience(
              userId, 
              taskXP, 
              `Tâche formation complétée: ${taskId}`,
              'formation'
            );
            console.log(`✅ +${taskXP} XP ajoutés pour la tâche ${taskId}`);
          }
        } catch (xpError) {
          console.warn('⚠️ Erreur ajout XP:', xpError);
        }
      }

      console.log('✅ Tâche formation toggleée:', taskId, '→', newState);
      return { success: true, newState };

    } catch (error) {
      console.error('❌ Erreur toggle tâche formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 Récupérer les XP d'une tâche
   */
  getTaskXP(phaseId, taskId) {
    // Cette méthode devrait normalement récupérer les XP depuis PHASE_TASKS
    // Pour simplifier, on retourne une valeur par défaut
    const defaultXP = {
      decouverte_brain: { default: 10 },
      parcours_client: { default: 12 },
      securite_procedures: { default: 15 },
      formation_experience: { default: 20 },
      taches_quotidien: { default: 12 },
      soft_skills: { default: 10 },
      validation_finale: { default: 40 }
    };

    return defaultXP[phaseId]?.default || 10;
  }

  /**
   * 📝 Ajouter des commentaires référent
   */
  async addReferentComments(userId, phaseId, comments, referentId) {
    try {
      console.log('📝 Ajout commentaires référent formation:', phaseId);
      
      const updates = {
        [`phases.${phaseId}.referentComments`]: comments,
        [`phases.${phaseId}.lastCommentDate`]: new Date().toISOString(),
        [`phases.${phaseId}.lastCommentBy`]: referentId,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      console.log('✅ Commentaires référent ajoutés');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur ajout commentaires référent formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 Valider une phase complète
   */
  async validatePhase(userId, phaseId, validatorId) {
    try {
      console.log('🏆 Validation phase formation:', phaseId);
      
      const updates = {
        [`phases.${phaseId}.completed`]: true,
        [`phases.${phaseId}.completionDate`]: new Date().toISOString(),
        [`phases.${phaseId}.validatedBy`]: validatorId,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      
      // Ajouter un badge si c'est défini pour cette phase
      const phase = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseId);
      if (phase?.badge) {
        try {
          await gamificationService.awardBadge(
            userId,
            phase.badge,
            `Phase ${phase.name} complétée`,
            'formation'
          );
          console.log(`🏅 Badge "${phase.badge}" attribué`);
        } catch (badgeError) {
          console.warn('⚠️ Erreur attribution badge:', badgeError);
        }
      }

      // Ajouter XP de completion de phase
      if (phase?.xpTotal) {
        try {
          await gamificationService.addExperience(
            userId,
            phase.xpTotal,
            `Phase ${phase.name} validée`,
            'formation'
          );
          console.log(`✅ +${phase.xpTotal} XP ajoutés pour validation phase`);
        } catch (xpError) {
          console.warn('⚠️ Erreur ajout XP phase:', xpError);
        }
      }

      console.log('✅ Phase formation validée');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur validation phase formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎤 Planifier un entretien référent
   */
  async scheduleInterview(userId, referentId, scheduledDate, type = 'suivi') {
    try {
      console.log('🎤 Planification entretien formation');
      
      const interview = {
        id: `interview_${Date.now()}`,
        userId,
        referentId,
        type, // 'suivi', 'evaluation', 'final'
        scheduledDate,
        status: 'scheduled', // 'scheduled', 'completed', 'cancelled'
        createdAt: new Date().toISOString(),
        notes: '',
        feedback: '',
        actionPoints: []
      };

      await setDoc(
        doc(db, this.INTERVIEWS_COLLECTION, interview.id), 
        interview
      );

      // Ajouter la référence dans le profil formation
      const updates = {
        interviews: arrayUnion(interview.id),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      
      console.log('✅ Entretien formation planifié');
      return { success: true, interviewId: interview.id };

    } catch (error) {
      console.error('❌ Erreur planification entretien formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques de formation
   */
  async calculateFormationStats(userId) {
    try {
      console.log('📊 Calcul statistiques formation');
      
      const profileResult = await this.getFormationProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil formation non trouvé' };
      }

      const profile = profileResult.data;
      let totalTasks = 0;
      let completedTasks = 0;
      let totalXP = 0;
      let earnedXP = 0;
      let completedPhases = 0;

      // Parcourir toutes les phases
      Object.keys(profile.phases || {}).forEach(phaseId => {
        const phase = profile.phases[phaseId];
        const phaseInfo = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseId);
        
        if (phase.completed) {
          completedPhases++;
          if (phaseInfo?.xpTotal) {
            earnedXP += phaseInfo.xpTotal;
          }
        }
        
        // Compter les tâches
        Object.keys(phase.tasks || {}).forEach(taskId => {
          totalTasks++;
          if (phase.tasks[taskId].completed) {
            completedTasks++;
          }
        });
        
        if (phaseInfo?.xpTotal) {
          totalXP += phaseInfo.xpTotal;
        }
      });

      const stats = {
        totalTasks,
        completedTasks,
        totalXP,
        earnedXP,
        completedPhases,
        totalPhases: Object.keys(ONBOARDING_PHASES).length,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      };

      // Mettre à jour les métriques dans le profil
      const updates = {
        'metrics.totalTasks': totalTasks,
        'metrics.completedTasks': completedTasks,
        'metrics.totalXP': totalXP,
        'metrics.earnedXP': earnedXP,
        'metrics.completionRate': stats.completionRate,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);

      console.log('✅ Statistiques formation calculées');
      return { success: true, stats };

    } catch (error) {
      console.error('❌ Erreur calcul statistiques formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👥 Récupérer tous les profils de formation (admin)
   */
  async getAllFormationProfiles() {
    try {
      console.log('👥 Récupération tous profils formation');
      
      const q = query(
        collection(db, this.FORMATION_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${profiles.length} profils formation récupérés`);
      return { success: true, data: profiles };

    } catch (error) {
      console.error('❌ Erreur récupération profils formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 Rechercher profils par phase
   */
  async getProfilesByPhase(phaseId) {
    try {
      console.log('🔍 Recherche profils par phase:', phaseId);
      
      const q = query(
        collection(db, this.FORMATION_COLLECTION),
        where('currentPhase', '==', phaseId)
      );
      
      const querySnapshot = await getDocs(q);
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${profiles.length} profils trouvés pour phase ${phaseId}`);
      return { success: true, data: profiles };

    } catch (error) {
      console.error('❌ Erreur recherche profils par phase:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton
export const onboardingService = new OnboardingService();
export default onboardingService;
