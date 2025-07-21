// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// SERVICE ONBOARDING COMPLET AVEC CORRECTIONS FIREBASE
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
  limit,
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

import { db } from '../firebase.js';
import { firebasePermissionsFix, safeDateParsing } from '../firebasePermissionsFix.js';

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
    badge: 'Bienvenue chez Brain !',
    tasks: [
      {
        id: 'visite_locaux',
        name: 'Visite guidée des locaux et présentation de l\'équipe',
        description: 'Tour complet des espaces Brain avec présentation personnalisée de chaque membre de l\'équipe',
        xp: 10,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'comprendre_valeurs',
        name: 'Comprendre les valeurs et la culture d\'entreprise',
        description: 'Découverte de l\'ADN Brain, notre vision, nos valeurs et notre façon de travailler ensemble',
        xp: 10,
        required: true,
        estimatedTime: 60
      },
      {
        id: 'rencontrer_equipe',
        name: 'Rencontrer individuellement chaque membre de l\'équipe',
        description: 'Discussions informelles avec chaque collaborateur pour mieux comprendre leur rôle',
        xp: 15,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'decouverte_outils',
        name: 'Découverte des outils de travail (Synergia, systèmes internes)',
        description: 'Formation aux outils numériques utilisés au quotidien chez Brain',
        xp: 15,
        required: true,
        estimatedTime: 60
      }
    ]
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
    badge: 'Ambassadeur·rice Brain',
    tasks: [
      {
        id: 'accueil_client',
        name: 'Maîtriser l\'accueil client de A à Z',
        description: 'Techniques d\'accueil, première impression et gestion de l\'arrivée des groupes',
        xp: 15,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'briefing_joueurs',
        name: 'Conduire un briefing joueurs efficace',
        description: 'Présentation des règles, consignes de sécurité et mise en ambiance',
        xp: 20,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'gestion_groupes',
        name: 'Gestion des différents types de groupes',
        description: 'Adapter son approche selon les profils : familles, entreprises, EVJF/EVG, enfants',
        xp: 25,
        required: true,
        estimatedTime: 150
      },
      {
        id: 'debriefing_experience',
        name: 'Debriefing et valorisation de l\'expérience',
        description: 'Techniques pour maximiser la satisfaction client et encourager les recommandations',
        xp: 20,
        required: true,
        estimatedTime: 60
      }
    ]
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
    badge: 'Gardien·ne du Temple',
    tasks: [
      {
        id: 'consignes_securite',
        name: 'Maîtriser toutes les consignes de sécurité',
        description: 'Évacuation, premiers secours, gestion des situations d\'urgence',
        xp: 30,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'gestion_materiel',
        name: 'Gestion et entretien du matériel',
        description: 'Maintenance préventive, réparations courantes, inventaire',
        xp: 25,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'procedures_ouverture_fermeture',
        name: 'Procédures d\'ouverture et fermeture',
        description: 'Checklist complète, vérifications système, sécurisation des lieux',
        xp: 25,
        required: true,
        estimatedTime: 60
      },
      {
        id: 'gestion_incidents',
        name: 'Gestion des incidents et pannes',
        description: 'Procédures de résolution, escalade, communication client en cas de problème',
        xp: 20,
        required: true,
        estimatedTime: 90
      }
    ]
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
    badge: 'Expert·e [Salle/Jeu]',
    tasks: [
      {
        id: 'psychiatric_expert',
        name: 'Devenir expert·e Psychiatric',
        description: 'Maîtrise complète de l\'expérience Psychiatric : scénario, énigmes, game mastering',
        xp: 30,
        required: true,
        estimatedTime: 240
      },
      {
        id: 'prison_expert',
        name: 'Devenir expert·e Prison',
        description: 'Maîtrise complète de l\'expérience Prison : scénario, énigmes, game mastering',
        xp: 30,
        required: true,
        estimatedTime: 240
      },
      {
        id: 'back80s_expert',
        name: 'Devenir expert·e Back to the 80\'s',
        description: 'Maîtrise complète de l\'expérience Back to the 80\'s : scénario, énigmes, game mastering',
        xp: 30,
        required: true,
        estimatedTime: 240
      },
      {
        id: 'quiz_game_expert',
        name: 'Devenir expert·e Quiz Game',
        description: 'Animation de Quiz Game : règles, gestion des équipes, ambiance',
        xp: 30,
        required: true,
        estimatedTime: 180
      }
    ]
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
    badge: 'Pilier du Quotidien',
    tasks: [
      {
        id: 'gestion_planning',
        name: 'Gestion du planning et des réservations',
        description: 'Optimisation des créneaux, gestion des annulations, upselling',
        xp: 25,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'nettoyage_reset',
        name: 'Nettoyage et reset efficace des salles',
        description: 'Procédures de nettoyage, reset rapide, contrôle qualité',
        xp: 20,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'gestion_caisse',
        name: 'Gestion de la caisse et facturation',
        description: 'Encaissements, factures, promotions, moyens de paiement',
        xp: 20,
        required: true,
        estimatedTime: 60
      },
      {
        id: 'communication_digitale',
        name: 'Communication digitale et réseaux sociaux',
        description: 'Répondre aux avis, créer du contenu, animer les réseaux',
        xp: 25,
        required: true,
        estimatedTime: 90
      }
    ]
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
    badge: 'Esprit Brain',
    tasks: [
      {
        id: 'communication_bienveillante',
        name: 'Communication bienveillante et positive',
        description: 'Techniques de communication positive, écoute active, empathie',
        xp: 20,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'gestion_stress',
        name: 'Gestion du stress et des situations tendues',
        description: 'Techniques de gestion du stress, désescalade de conflits',
        xp: 20,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'travail_equipe',
        name: 'Travail en équipe et collaboration',
        description: 'Esprit d\'équipe, entraide, communication interne efficace',
        xp: 15,
        required: true,
        estimatedTime: 60
      },
      {
        id: 'initiative_autonomie',
        name: 'Prise d\'initiative et autonomie',
        description: 'Développer son autonomie, proposer des améliorations, prendre des décisions',
        xp: 15,
        required: true,
        estimatedTime: 90
      }
    ]
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
    badge: 'Game Master certifié·e Brain',
    tasks: [
      {
        id: 'evaluation_complete',
        name: 'Évaluation complète des compétences',
        description: 'Test pratique sur toutes les expériences et compétences acquises',
        xp: 50,
        required: true,
        estimatedTime: 240
      },
      {
        id: 'entretien_final',
        name: 'Entretien final avec l\'équipe dirigeante',
        description: 'Bilan complet, feedback, définition des objectifs futurs',
        xp: 50,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'presentation_equipe',
        name: 'Présentation officielle à l\'équipe',
        description: 'Présentation des compétences acquises et intégration officielle',
        xp: 50,
        required: true,
        estimatedTime: 60
      },
      {
        id: 'certification_game_master',
        name: 'Certification Game Master Brain',
        description: 'Remise officielle du certificat Game Master Brain',
        xp: 50,
        required: true,
        estimatedTime: 30
      }
    ]
  }
};

// 🎯 SERVICE PRINCIPAL ONBOARDING
class OnboardingService {
  constructor() {
    this.FORMATION_COLLECTION = 'onboardingFormation';
    this.INTERVIEWS_COLLECTION = 'onboardingInterviews';
    console.log('🎯 OnboardingService initialisé avec firebasePermissionsFix');
  }

  /**
   * 🚀 Créer un profil de formation - VERSION SÉCURISÉE
   */
  async createFormationProfile(userId) {
    try {
      console.log('🚀 Création profil formation pour userId:', userId);
      
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      // Supprimer l'ancien profil s'il existe
      try {
        await this.deleteFormationProfile(userId);
      } catch (error) {
        console.log('ℹ️ Pas d\'ancien profil à supprimer ou erreur:', error.message);
      }

      const formationProfile = {
        userId,
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

      // Initialiser toutes les phases avec leurs tâches
      Object.values(ONBOARDING_PHASES).forEach(phase => {
        formationProfile.phases[phase.id] = {
          id: phase.id,
          name: phase.name,
          status: phase.order === 1 ? 'active' : 'locked',
          startDate: phase.order === 1 ? new Date().toISOString() : null,
          completionDate: null,
          progress: 0,
          tasks: phase.tasks.map(task => ({
            ...task,
            status: 'not_started',
            completedAt: null,
            timeSpent: 0,
            notes: ''
          })),
          earnedXP: 0,
          badge: null
        };
        
        // Compter les tâches totales
        formationProfile.metrics.totalTasks += phase.tasks.length;
      });

      // Utiliser le service sécurisé Firebase
      const result = await firebasePermissionsFix.safeCreateDocument(
        this.FORMATION_COLLECTION, 
        formationProfile, 
        userId
      );

      if (result.success) {
        console.log('✅ Profil de formation créé avec succès');
        return { 
          success: true, 
          data: { ...formationProfile, id: userId },
          isLocal: result.isLocal 
        };
      } else {
        return result;
      }

    } catch (error) {
      console.error('❌ Erreur création profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 Récupérer un profil de formation
   */
  async getFormationProfile(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      const result = await firebasePermissionsFix.safeReadDocument(
        this.FORMATION_COLLECTION, 
        userId
      );

      if (result.success && result.data) {
        return { 
          success: true, 
          data: result.data,
          isLocal: result.isLocal 
        };
      } else {
        return { success: false, error: result.error || 'Profil non trouvé' };
      }

    } catch (error) {
      console.error('❌ Erreur récupération profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ Supprimer un profil de formation
   */
  async deleteFormationProfile(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      // Supprimer de Firebase
      try {
        if (db) {
          const docRef = doc(db, this.FORMATION_COLLECTION, userId);
          await deleteDoc(docRef);
          console.log('🗑️ Profil Firebase supprimé');
        }
      } catch (firebaseError) {
        console.warn('⚠️ Impossible de supprimer de Firebase:', firebaseError.message);
      }

      // Supprimer de localStorage
      try {
        const localKey = `${this.FORMATION_COLLECTION}_${userId}`;
        localStorage.removeItem(localKey);
        console.log('🗑️ Profil localStorage supprimé');
      } catch (localError) {
        console.warn('⚠️ Impossible de supprimer de localStorage:', localError.message);
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression profil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Mettre à jour le statut d'une tâche
   */
  async updateTaskStatus(userId, phaseId, taskId, status, notes = '') {
    try {
      const profileResult = await this.getFormationProfile(userId);
      if (!profileResult.success) {
        return profileResult;
      }

      const profile = profileResult.data;
      
      if (!profile.phases[phaseId]) {
        return { success: false, error: 'Phase non trouvée' };
      }

      const task = profile.phases[phaseId].tasks.find(t => t.id === taskId);
      if (!task) {
        return { success: false, error: 'Tâche non trouvée' };
      }

      // Mettre à jour la tâche
      task.status = status;
      task.notes = notes;
      
      if (status === 'completed') {
        task.completedAt = new Date().toISOString();
        profile.metrics.completedTasks += 1;
        profile.metrics.earnedXP += task.xp;
        profile.phases[phaseId].earnedXP += task.xp;
      }

      // Calculer la progression de la phase
      const completedTasks = profile.phases[phaseId].tasks.filter(t => t.status === 'completed').length;
      const totalTasks = profile.phases[phaseId].tasks.length;
      profile.phases[phaseId].progress = Math.round((completedTasks / totalTasks) * 100);

      // Vérifier si la phase est terminée
      if (profile.phases[phaseId].progress === 100) {
        profile.phases[phaseId].status = 'completed';
        profile.phases[phaseId].completionDate = new Date().toISOString();
        profile.phases[phaseId].badge = ONBOARDING_PHASES[phaseId.toUpperCase()]?.badge;
        
        // Débloquer la phase suivante
        const currentPhase = ONBOARDING_PHASES[phaseId.toUpperCase()];
        if (currentPhase) {
          const nextPhase = Object.values(ONBOARDING_PHASES).find(p => p.order === currentPhase.order + 1);
          if (nextPhase && profile.phases[nextPhase.id]) {
            profile.phases[nextPhase.id].status = 'active';
            profile.phases[nextPhase.id].startDate = new Date().toISOString();
            profile.currentPhase = nextPhase.id;
          }
        }
      }

      // Calculer les métriques globales
      profile.metrics.completionRate = Math.round((profile.metrics.completedTasks / profile.metrics.totalTasks) * 100);

      // Sauvegarder avec le service sécurisé
      const saveResult = await firebasePermissionsFix.safeCreateDocument(
        this.FORMATION_COLLECTION, 
        profile, 
        userId
      );

      if (saveResult.success) {
        return { success: true, data: profile };
      } else {
        return saveResult;
      }

    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📅 Programmer un entretien
   */
  async scheduleInterview(interviewData) {
    try {
      const result = await firebasePermissionsFix.safeCreateDocument(
        this.INTERVIEWS_COLLECTION, 
        {
          ...interviewData,
          status: 'scheduled',
          scheduledDate: safeDateParsing.parseDate(interviewData.scheduledDate || new Date())
        }
      );

      if (result.success) {
        console.log('✅ Entretien programmé avec succès');
        return result;
      } else {
        return result;
      }

    } catch (error) {
      console.error('❌ Erreur programmation entretien:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 Récupérer les entretiens d'un référent
   */
  async getReferentInterviews(referentId, limit = 50) {
    try {
      const queryConstraints = [
        where('referentId', '==', referentId),
        orderBy('scheduledDate', 'desc')
      ];
      
      if (limit) {
        queryConstraints.push(limit(limit));
      }

      const result = await firebasePermissionsFix.safeReadDocuments(
        this.INTERVIEWS_COLLECTION,
        queryConstraints
      );

      return result;

    } catch (error) {
      console.error('❌ Erreur récupération entretiens:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * 🧪 Test de connexion Firebase
   */
  async testFirebaseConnection() {
    try {
      const result = await firebasePermissionsFix.testFirebasePermissions();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Obtenir les statistiques de formation
   */
  async getFormationStats(userId) {
    try {
      const profileResult = await this.getFormationProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil non trouvé' };
      }

      const profile = profileResult.data;
      const stats = {
        totalPhases: Object.keys(ONBOARDING_PHASES).length,
        completedPhases: Object.values(profile.phases).filter(p => p.status === 'completed').length,
        currentPhase: profile.currentPhase,
        totalTasks: profile.metrics.totalTasks,
        completedTasks: profile.metrics.completedTasks,
        totalXP: Object.values(ONBOARDING_PHASES).reduce((sum, phase) => sum + phase.xpTotal, 0),
        earnedXP: profile.metrics.earnedXP,
        completionRate: profile.metrics.completionRate,
        earnedBadges: profile.earnedBadges.length,
        startDate: profile.startDate,
        estimatedCompletion: this.calculateEstimatedCompletion(profile)
      };

      return { success: true, data: stats };

    } catch (error) {
      console.error('❌ Erreur calcul stats formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔮 Calculer la date estimée de fin
   */
  calculateEstimatedCompletion(profile) {
    try {
      const remainingPhases = Object.values(profile.phases).filter(p => p.status !== 'completed');
      const remainingDays = remainingPhases.reduce((sum, phase) => {
        const phaseConfig = Object.values(ONBOARDING_PHASES).find(p => p.id === phase.id);
        return sum + (phaseConfig?.duration || 0);
      }, 0);

      const startDate = new Date(profile.startDate);
      const estimatedEnd = new Date(startDate);
      estimatedEnd.setDate(startDate.getDate() + remainingDays);

      return estimatedEnd.toISOString();

    } catch (error) {
      console.warn('⚠️ Erreur calcul date estimée:', error);
      return null;
    }
  }
}

// Créer l'instance du service
const onboardingService = new OnboardingService();

export { onboardingService, OnboardingService };
export default onboardingService;

console.log('✅ OnboardingService créé avec support Firebase sécurisé');
