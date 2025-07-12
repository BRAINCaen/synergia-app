// ==========================================
// 📁 react-app/src/core/services/skillsAcquisitionService.js
// SERVICE ACQUISITION DE COMPÉTENCES PAR EXPÉRIENCE - BRAIN
// ==========================================

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

import { db } from '../firebase.js';

// 🎯 DÉFINITION DES EXPÉRIENCES BRAIN
export const BRAIN_EXPERIENCES = {
  PSYCHIATRIC: {
    id: 'psychiatric',
    name: '🩺 Psychiatric',
    description: 'Escape Game d\'horreur psychologique',
    difficulty: 'Expert',
    color: '#DC2626',
    icon: '🩺',
    minSessions: 2,
    category: 'escape_game'
  },
  PRISON: {
    id: 'prison',
    name: '🚨 Prison',
    description: 'Escape Game carcéral en équipes',
    difficulty: 'Avancé',
    color: '#F97316',
    icon: '🚨',
    minSessions: 2,
    category: 'escape_game'
  },
  BACK_TO_80S: {
    id: 'back_to_80s',
    name: '🎸 Back to the 80\'s',
    description: 'Escape Game rétro années 80',
    difficulty: 'Intermédiaire',
    color: '#8B5CF6',
    icon: '🎸',
    minSessions: 2,
    category: 'escape_game'
  },
  QUIZ_GAME: {
    id: 'quiz_game',
    name: '🏆 Quiz Game',
    description: 'Animation quiz interactif',
    difficulty: 'Débutant',
    color: '#10B981',
    icon: '🏆',
    minSessions: 2,
    category: 'animation'
  }
};

// 🎯 COMPÉTENCES PAR EXPÉRIENCE
export const EXPERIENCE_SKILLS = {
  psychiatric: {
    decouverte_immersion: [
      { id: 'scenario_psychiatric', title: 'J\'ai lu et compris le scénario Psychiatric', category: 'knowledge' },
      { id: 'ambiance_psychiatric', title: 'Je peux présenter l\'ambiance, les enjeux et les moments clés', category: 'knowledge' },
      { id: 'musiques_psychiatric', title: 'Je connais les musiques et effets sonores principaux', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'cameras_psychiatric', title: 'Je sais utiliser les caméras et micros spécifiques à la salle', category: 'technical' },
      { id: 'effets_psychiatric', title: 'Je maîtrise l\'utilisation des effets spéciaux Psychiatric', category: 'technical' },
      { id: 'reset_psychiatric', title: 'Je sais faire un reset complet et rapide avec check de tous les éléments', category: 'technical' },
      { id: 'accessoires_psychiatric', title: 'Je sais gérer les accessoires fragiles et repérer les mécanismes sensibles', category: 'technical' },
      { id: 'urgence_psychiatric', title: 'Je connais la procédure d\'urgence (incendie, malaise joueur)', category: 'safety' }
    ],
    gestion_joueur: [
      { id: 'rassurer_psychiatric', title: 'Je sais rassurer et accompagner un groupe anxieux ou effrayé', category: 'soft_skills' },
      { id: 'indices_psychiatric', title: 'Je sais donner des indices adaptés sans casser l\'immersion', category: 'soft_skills' },
      { id: 'public_psychiatric', title: 'Je m\'adapte au public : briefing spécifique selon âge/expérience', category: 'soft_skills' },
      { id: 'gestion_situation_psychiatric', title: 'Je sais gérer une situation de blocage, de peur ou de conflit', category: 'soft_skills' },
      { id: 'briefing_psychiatric', title: 'J\'ai pratiqué le briefing Psychiatric en jeu de rôle ou réel', category: 'practice' },
      { id: 'debriefing_psychiatric', title: 'J\'ai pratiqué le débriefing Psychiatric en jeu de rôle ou réel', category: 'practice' }
    ],
    soft_skills: [
      { id: 'attitude_psychiatric', title: 'Je garde une attitude bienveillante même en cas de stress', category: 'soft_skills' },
      { id: 'apaiser_psychiatric', title: 'Je sais apaiser un joueur en difficulté émotionnelle', category: 'soft_skills' },
      { id: 'diplomatie_psychiatric', title: 'Je gère les situations conflictuelles avec diplomatie', category: 'soft_skills' }
    ],
    validation: [
      { id: 'sessions_psychiatric', title: 'J\'ai animé au moins 2 sessions Psychiatric (dont 1 en quasi-autonomie)', category: 'validation' },
      { id: 'referent_psychiatric', title: 'Mon référent a validé ma prise en main de la salle', category: 'validation' }
    ]
  },

  prison: {
    decouverte_immersion: [
      { id: 'scenario_prison', title: 'J\'ai lu et compris le scénario Prison', category: 'knowledge' },
      { id: 'ambiance_prison', title: 'Je sais expliquer les enjeux et l\'ambiance carcérale', category: 'knowledge' },
      { id: 'temps_forts_prison', title: 'Je repère les temps forts : stress, compétition, coopération', category: 'knowledge' },
      { id: 'equipes_prison', title: 'Je connais la gestion des équipes multiples (si applicable)', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'securite_prison', title: 'Je maîtrise l\'utilisation des dispositifs de sécurité (portes, menottes, alarmes)', category: 'technical' },
      { id: 'effets_prison', title: 'Je sais lancer/arrêter les effets sonores et lumineux au bon moment', category: 'technical' },
      { id: 'reset_prison', title: 'Je sais faire un reset complet (cellules, objets cachés, routine nettoyage)', category: 'technical' },
      { id: 'fragiles_prison', title: 'Je repère les éléments fragiles à surveiller', category: 'technical' },
      { id: 'urgence_prison', title: 'Je connais les procédures d\'urgence spécifiques Prison', category: 'safety' }
    ],
    gestion_joueur: [
      { id: 'equipes_prison_gestion', title: 'Je gère les interactions entre équipes (compétition ou coopération)', category: 'soft_skills' },
      { id: 'intervention_prison', title: 'J\'interviens discrètement en cas de triche ou blocage technique', category: 'soft_skills' },
      { id: 'aide_prison', title: 'J\'adapte l\'aide au niveau des joueurs', category: 'soft_skills' },
      { id: 'briefing_prison', title: 'J\'ai pratiqué le briefing Prison (jeu de rôle ou réel)', category: 'practice' },
      { id: 'debriefing_prison', title: 'J\'ai pratiqué le débriefing Prison (jeu de rôle ou réel)', category: 'practice' }
    ],
    soft_skills: [
      { id: 'recadrer_prison', title: 'Je sais recadrer sans casser l\'ambiance', category: 'soft_skills' },
      { id: 'valoriser_prison', title: 'Je valorise le groupe, même en cas d\'échec', category: 'soft_skills' },
      { id: 'calme_prison', title: 'Je reste calme face à des comportements "limite" (énervement, provocation)', category: 'soft_skills' }
    ],
    validation: [
      { id: 'sessions_prison', title: 'J\'ai animé au moins 2 sessions Prison (dont 1 en quasi-autonomie)', category: 'validation' },
      { id: 'referent_prison', title: 'Mon référent a validé ma prise en main de la salle', category: 'validation' }
    ]
  },

  back_to_80s: {
    decouverte_immersion: [
      { id: 'scenario_80s', title: 'J\'ai lu et compris le scénario Back to the 80\'s', category: 'knowledge' },
      { id: 'references_80s', title: 'Je connais les références, anecdotes, musiques et objets emblématiques', category: 'knowledge' },
      { id: 'playlist_80s', title: 'Je sais gérer la playlist et renforcer l\'ambiance rétro', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'objets_80s', title: 'Je maîtrise l\'utilisation des objets et mécanismes vintage (téléphone, cassettes)', category: 'technical' },
      { id: 'reset_80s', title: 'Je sais faire un reset complet (remise en place de tous les éléments fragiles)', category: 'technical' },
      { id: 'entretien_80s', title: 'Je connais les points sensibles et la routine nettoyage', category: 'technical' }
    ],
    gestion_joueur: [
      { id: 'culture_80s', title: 'J\'adapte l\'accompagnement selon la culture 80\'s du groupe', category: 'soft_skills' },
      { id: 'inclusif_80s', title: 'Je rends l\'expérience inclusive et fun, quel que soit l\'âge', category: 'soft_skills' },
      { id: 'humour_80s', title: 'Je gère l\'humour et les clins d\'œil à l\'époque pour détendre', category: 'soft_skills' },
      { id: 'briefing_80s', title: 'J\'ai pratiqué le briefing 80\'s (jeu de rôle ou réel)', category: 'practice' },
      { id: 'debriefing_80s', title: 'J\'ai pratiqué le débriefing 80\'s (jeu de rôle ou réel)', category: 'practice' }
    ],
    soft_skills: [
      { id: 'nostalgie_80s', title: 'Je stimule la nostalgie sans exclure les plus jeunes', category: 'soft_skills' },
      { id: 'ambiance_80s', title: 'Je crée une ambiance légère même en cas de difficulté', category: 'soft_skills' },
      { id: 'valorisation_80s', title: 'Je valorise chaque membre du groupe', category: 'soft_skills' }
    ],
    validation: [
      { id: 'sessions_80s', title: 'J\'ai animé au moins 2 sessions Back to the 80\'s (dont 1 en quasi-autonomie)', category: 'validation' },
      { id: 'referent_80s', title: 'Mon référent a validé ma prise en main de la salle', category: 'validation' }
    ]
  },

  quiz_game: {
    decouverte_animation: [
      { id: 'modes_quiz', title: 'Je connais tous les modes de jeu et les règles du Quiz Game', category: 'knowledge' },
      { id: 'plateau_quiz', title: 'Je sais présenter le plateau et ses fonctionnalités', category: 'knowledge' },
      { id: 'micro_quiz', title: 'Je maîtrise la prise de micro et l\'animation de base', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'modes_quiz_tech', title: 'Je sais lancer chaque mode de jeu (buzzers, tablettes, pupitres)', category: 'technical' },
      { id: 'scores_quiz', title: 'Je gère l\'affichage des scores et la gestion des transitions', category: 'technical' },
      { id: 'bugs_quiz', title: 'Je sais réagir en cas de bug technique ou litige sur une réponse', category: 'technical' },
      { id: 'securite_quiz', title: 'Je maîtrise la sécurité : déplacements sur le plateau, surveillance du matériel', category: 'safety' }
    ],
    gestion_public: [
      { id: 'ambiance_quiz', title: 'Je crée l\'ambiance et motive chaque équipe', category: 'soft_skills' },
      { id: 'improvisation_quiz', title: 'J\'improvise en cas de problème ou de question litigieuse', category: 'soft_skills' },
      { id: 'adaptation_quiz', title: 'J\'adapte l\'animation au public (enfants, EVJF/G, entreprises, familles)', category: 'soft_skills' },
      { id: 'lancement_quiz', title: 'J\'ai pratiqué le lancement d\'une session Quiz Game', category: 'practice' },
      { id: 'debriefing_quiz', title: 'J\'ai pratiqué le débriefing Quiz Game (jeu de rôle ou réel)', category: 'practice' }
    ],
    soft_skills: [
      { id: 'micro_aisance', title: 'Je suis à l\'aise au micro, je parle clairement', category: 'soft_skills' },
      { id: 'humour_quiz', title: 'Je fais preuve d\'humour et de diplomatie', category: 'soft_skills' },
      { id: 'energie_quiz', title: 'Je garde l\'énergie même avec des publics difficiles', category: 'soft_skills' }
    ],
    validation: [
      { id: 'sessions_quiz', title: 'J\'ai animé au moins 2 sessions Quiz Game (dont 1 en quasi-autonomie)', category: 'validation' },
      { id: 'referent_quiz', title: 'Mon référent a validé ma prise en main du Quiz Game', category: 'validation' }
    ]
  }
};

// 🏆 BADGES PAR EXPÉRIENCE
export const EXPERIENCE_BADGES = {
  psychiatric: {
    id: 'expert_psychiatric',
    name: 'Expert Psychiatric',
    description: 'Maîtrise complète de l\'expérience Psychiatric',
    icon: '🩺',
    color: '#DC2626',
    rarity: 'epic'
  },
  prison: {
    id: 'expert_prison',
    name: 'Expert Prison',
    description: 'Maîtrise complète de l\'expérience Prison',
    icon: '🚨',
    color: '#F97316',
    rarity: 'epic'
  },
  back_to_80s: {
    id: 'expert_80s',
    name: 'Expert Back to the 80\'s',
    description: 'Maîtrise complète de l\'expérience Back to the 80\'s',
    icon: '🎸',
    color: '#8B5CF6',
    rarity: 'epic'
  },
  quiz_game: {
    id: 'expert_quiz',
    name: 'Expert Quiz Game',
    description: 'Maîtrise complète du Quiz Game',
    icon: '🏆',
    color: '#10B981',
    rarity: 'epic'
  }
};

// 📝 MODÈLE DE FICHE DE SUIVI HEBDOMADAIRE
export const WEEKLY_FOLLOW_UP_TEMPLATE = {
  competences_techniques: '',
  difficultes_rencontrees: '',
  situations_marquantes: '',
  competences_approfondir: '',
  besoin_aide: '',
  feedback_referent: ''
};

// 🎯 SERVICE PRINCIPAL
export class SkillsAcquisitionService {

  /**
   * 📋 Créer un profil de compétences pour un utilisateur
   */
  static async createSkillsProfile(userId, experiences = []) {
    try {
      const skillsProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Progression par expérience
        experiences: {},
        
        // Suivi hebdomadaire
        weeklyFollowUps: [],
        
        // Entretiens avec admin
        adminInterviews: [],
        
        // Badges obtenus
        earnedBadges: [],
        
        // Métriques globales
        metrics: {
          totalExperiences: 0,
          completedExperiences: 0,
          totalSkills: 0,
          validatedSkills: 0,
          averageCompletionRate: 0
        }
      };

      // Initialiser les expériences demandées
      experiences.forEach(expId => {
        if (BRAIN_EXPERIENCES[expId.toUpperCase()]) {
          skillsProfile.experiences[expId] = {
            started: true,
            completed: false,
            startDate: new Date().toISOString(),
            completionDate: null,
            skills: {},
            adminValidations: [],
            sessionsCompleted: 0,
            currentPhase: 'decouverte_immersion'
          };

          // Initialiser toutes les compétences à false
          const expSkills = EXPERIENCE_SKILLS[expId];
          if (expSkills) {
            Object.keys(expSkills).forEach(category => {
              expSkills[category].forEach(skill => {
                skillsProfile.experiences[expId].skills[skill.id] = {
                  completed: false,
                  validatedBy: null,
                  validationDate: null,
                  adminComments: '',
                  selfAssessment: false
                };
              });
            });
          }
        }
      });

      await setDoc(doc(db, 'skillsAcquisition', userId), skillsProfile);
      return { success: true, profileId: userId };

    } catch (error) {
      console.error('Erreur création profil compétences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Récupérer le profil de compétences
   */
  static async getSkillsProfile(userId) {
    try {
      const docRef = doc(db, 'skillsAcquisition', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, profile: docSnap.data() };
      }
      return { success: false, error: 'Profil non trouvé' };

    } catch (error) {
      console.error('Erreur récupération profil compétences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Auto-évaluation d'une compétence par l'utilisateur
   */
  static async selfAssessSkill(userId, experienceId, skillId, selfAssessment = true) {
    try {
      const updatePath = `experiences.${experienceId}.skills.${skillId}.selfAssessment`;
      const updates = {
        [updatePath]: selfAssessment,
        [`experiences.${experienceId}.skills.${skillId}.selfAssessmentDate`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      return { success: true };

    } catch (error) {
      console.error('Erreur auto-évaluation compétence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🛡️ Validation admin d'une compétence avec commentaires
   */
  static async adminValidateSkill(userId, experienceId, skillId, validatorId, validated = true, comments = '') {
    try {
      const updatePath = `experiences.${experienceId}.skills.${skillId}`;
      const updates = {
        [`${updatePath}.completed`]: validated,
        [`${updatePath}.validatedBy`]: validatorId,
        [`${updatePath}.validationDate`]: serverTimestamp(),
        [`${updatePath}.adminComments`]: comments,
        updatedAt: serverTimestamp()
      };

      // Ajouter l'historique de validation
      const validationEntry = {
        skillId,
        validated,
        validatorId,
        comments,
        date: serverTimestamp()
      };

      updates[`experiences.${experienceId}.adminValidations`] = arrayUnion(validationEntry);

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);

      // Vérifier si l'expérience est complète
      await this.checkExperienceCompletion(userId, experienceId);

      return { success: true };

    } catch (error) {
      console.error('Erreur validation admin compétence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Ajouter un suivi hebdomadaire
   */
  static async addWeeklyFollowUp(userId, experienceId, followUpData) {
    try {
      const followUp = {
        experienceId,
        week: this.getCurrentWeek(),
        date: serverTimestamp(),
        ...followUpData
      };

      const updates = {
        weeklyFollowUps: arrayUnion(followUp),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      return { success: true };

    } catch (error) {
      console.error('Erreur ajout suivi hebdomadaire:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎤 Ajouter un entretien admin avec commentaires
   */
  static async addAdminInterview(userId, interviewerId, interviewData) {
    try {
      const interview = {
        interviewerId,
        date: serverTimestamp(),
        experienceId: interviewData.experienceId,
        competencesTechniques: interviewData.competencesTechniques || '',
        difficultesRencontrees: interviewData.difficultesRencontrees || '',
        situationsMarquantes: interviewData.situationsMarquantes || '',
        competencesApprofondir: interviewData.competencesApprofondir || '',
        besoinAide: interviewData.besoinAide || '',
        feedbackReferent: interviewData.feedbackReferent || '',
        globalAssessment: interviewData.globalAssessment || '',
        nextSteps: interviewData.nextSteps || '',
        rating: interviewData.rating || null
      };

      const updates = {
        adminInterviews: arrayUnion(interview),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      return { success: true };

    } catch (error) {
      console.error('Erreur ajout entretien admin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 Vérifier et décerner le badge d'expérience
   */
  static async checkExperienceCompletion(userId, experienceId) {
    try {
      const profile = await this.getSkillsProfile(userId);
      if (!profile.success) return;

      const experience = profile.profile.experiences[experienceId];
      if (!experience) return;

      const expSkills = EXPERIENCE_SKILLS[experienceId];
      if (!expSkills) return;

      // Compter les compétences validées
      let totalSkills = 0;
      let validatedSkills = 0;

      Object.keys(expSkills).forEach(category => {
        expSkills[category].forEach(skill => {
          totalSkills++;
          if (experience.skills[skill.id]?.completed) {
            validatedSkills++;
          }
        });
      });

      const completionRate = (validatedSkills / totalSkills) * 100;

      // Si 100% des compétences sont validées
      if (completionRate === 100 && !experience.completed) {
        const updates = {
          [`experiences.${experienceId}.completed`]: true,
          [`experiences.${experienceId}.completionDate`]: serverTimestamp(),
          earnedBadges: arrayUnion(experienceId),
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'skillsAcquisition', userId), updates);

        // Intégration avec le système de gamification
        if (typeof gamificationService !== 'undefined') {
          const badge = EXPERIENCE_BADGES[experienceId];
          await gamificationService.awardBadge(userId, badge.id);
          await gamificationService.awardXP(userId, 500, `Expérience ${badge.name} maîtrisée`);
        }

        return { success: true, experienceCompleted: true, badge: EXPERIENCE_BADGES[experienceId] };
      }

      return { success: true, experienceCompleted: false, completionRate };

    } catch (error) {
      console.error('Erreur vérification completion expérience:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques d'un profil
   */
  static calculateProfileStats(profile) {
    const experiences = Object.keys(profile.experiences);
    const totalExperiences = experiences.length;
    const completedExperiences = experiences.filter(exp => profile.experiences[exp].completed).length;

    let totalSkills = 0;
    let validatedSkills = 0;

    experiences.forEach(expId => {
      const experience = profile.experiences[expId];
      Object.values(experience.skills).forEach(skill => {
        totalSkills++;
        if (skill.completed) validatedSkills++;
      });
    });

    return {
      totalExperiences,
      completedExperiences,
      totalSkills,
      validatedSkills,
      averageCompletionRate: totalSkills > 0 ? Math.round((validatedSkills / totalSkills) * 100) : 0,
      badgesEarned: profile.earnedBadges.length,
      weeklyFollowUps: profile.weeklyFollowUps.length,
      adminInterviews: profile.adminInterviews.length
    };
  }

  /**
   * 📅 Obtenir la semaine actuelle
   */
  static getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  /**
   * 🔍 Rechercher tous les profils (admin)
   */
  static async getAllSkillsProfiles() {
    try {
      const querySnapshot = await getDocs(collection(db, 'skillsAcquisition'));
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, profiles };

    } catch (error) {
      console.error('Erreur récupération tous les profils:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SkillsAcquisitionService;
