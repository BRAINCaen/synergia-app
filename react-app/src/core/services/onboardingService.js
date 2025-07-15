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

      // 🔧 CORRECTION: Initialiser toutes les phases avec vérification
      const phaseKeys = Object.keys(ONBOARDING_PHASES);
      console.log('🔧 Initialisation de', phaseKeys.length, 'phases');
      
      phaseKeys.forEach(phaseKey => {
        const phase = ONBOARDING_PHASES[phaseKey];
        if (phase && phase.id) {
          formationProfile.phases[phase.id] = {
            started: false,
            completed: false,
            startDate: null,
            completionDate: null,
            tasks: {},
            notes: '',
            referentComments: ''
          };
          console.log('✅ Phase initialisée:', phase.id);
        }
      });

      await setDoc(doc(db, this.FORMATION_COLLECTION, userId), formationProfile);
      console.log('✅ Profil formation créé avec succès');
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

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      console.log('✅ Tâche formation toggleée');
      return { success: true, newState };

    } catch (error) {
      console.error('❌ Erreur toggle tâche formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Ajouter un commentaire de référent
   */
  async addReferentComment(userId, phaseId, comment, referentId) {
    try {
      console.log('📝 Ajout commentaire référent pour phase:', phaseId);
      
      const updates = {
        [`phases.${phaseId}.referentComments`]: comment,
        [`phases.${phaseId}.lastCommentBy`]: referentId,
        [`phases.${phaseId}.lastCommentDate`]: new Date().toISOString(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      console.log('✅ Commentaire référent ajouté');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur ajout commentaire référent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎤 Planifier un entretien de formation
   */
  async scheduleInterview(userId, interviewData, scheduledBy) {
    try {
      console.log('🎤 Planification entretien formation');
      
      const interview = {
        id: `interview_${Date.now()}`,
        userId,
        scheduledBy,
        scheduledAt: new Date().toISOString(),
        ...interviewData,
        status: 'scheduled',
        createdAt: serverTimestamp()
      };

      // Ajouter l'entretien à la collection dédiée
      await setDoc(doc(db, this.INTERVIEWS_COLLECTION, interview.id), interview);

      // Ajouter la référence dans le profil formation
      const updates = {
        interviews: arrayUnion({
          id: interview.id,
          date: interviewData.date,
          type: interviewData.type,
          status: 'scheduled'
        }),
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
