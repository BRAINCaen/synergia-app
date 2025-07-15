// ==========================================
// 📁 react-app/src/core/services/skillsAcquisitionService.js
// SERVICE ACQUISITION COMPÉTENCES - BUGS CORRIGÉS
// ==========================================

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

// 🧠 MODÈLE D'EXPÉRIENCES BRAIN
export const BRAIN_EXPERIENCES = {
  GAMEMASTER: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    description: 'Maîtriser l\'animation et la gestion des sessions de jeu',
    duration: '4-6 semaines',
    difficulty: 'intermediate',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  MAINTENANCE: {
    id: 'maintenance', 
    name: 'Entretien & Maintenance',
    icon: '🔧',
    description: 'Gérer la maintenance et l\'entretien des salles',
    duration: '3-4 semaines',
    difficulty: 'beginner',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  REPUTATION: {
    id: 'reputation',
    name: 'Gestion des Avis',
    icon: '⭐',
    description: 'Optimiser la réputation en ligne et gérer les avis clients',
    duration: '3-5 semaines', 
    difficulty: 'intermediate',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  STOCK: {
    id: 'stock',
    name: 'Gestion des Stocks',
    icon: '📦',
    description: 'Organiser et gérer les stocks et le matériel',
    duration: '2-3 semaines',
    difficulty: 'beginner', 
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  ORGANIZATION: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    description: 'Gérer les plannings, RH et l\'organisation interne',
    duration: '4-6 semaines',
    difficulty: 'advanced',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  CONTENT: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    description: 'Créer du contenu créatif et engageant',
    duration: '5-7 semaines',
    difficulty: 'intermediate',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  MENTORING: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    description: 'Former et accompagner les nouveaux membres',
    duration: '6-8 semaines',
    difficulty: 'advanced',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  PARTNERSHIPS: {
    id: 'partnerships',
    name: 'Partenariats',
    icon: '🤝',
    description: 'Développer des partenariats et relations externes',
    duration: '4-6 semaines',
    difficulty: 'intermediate',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  COMMUNICATION: {
    id: 'communication',
    name: 'Communication & Réseaux',
    icon: '📱',
    description: 'Gérer la communication et les réseaux sociaux',
    duration: '3-5 semaines',
    difficulty: 'intermediate',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  },
  B2B: {
    id: 'b2b',
    name: 'Relations B2B',
    icon: '💼',
    description: 'Développer les relations et devis B2B',
    duration: '5-7 semaines',
    difficulty: 'advanced',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  }
};

// 🎯 COMPÉTENCES PAR EXPÉRIENCE
export const EXPERIENCE_SKILLS = {
  gamemaster: {
    animation: [
      { id: 'accueil_briefing', name: 'Accueil et briefing', description: 'Maîtriser l\'accueil et le briefing des équipes' },
      { id: 'mastering_live', name: 'Mastering en live', description: 'Animer les sessions en temps réel' },
      { id: 'debriefing', name: 'Débriefing', description: 'Conduire un débriefing efficace' }
    ],
    technique: [
      { id: 'gestion_cameras', name: 'Gestion caméras', description: 'Utiliser le système de caméras' },
      { id: 'gestion_sons', name: 'Gestion sons', description: 'Maîtriser le système audio' },
      { id: 'gestion_enigmes', name: 'Gestion énigmes', description: 'Gérer les mécanismes d\'énigmes' }
    ],
    relationnel: [
      { id: 'gestion_stress', name: 'Gestion du stress', description: 'Gérer le stress des participants' },
      { id: 'adaptation_public', name: 'Adaptation au public', description: 'S\'adapter à différents types de groupes' }
    ]
  },
  maintenance: {
    technique: [
      { id: 'verification_salles', name: 'Vérification des salles', description: 'Contrôler l\'état des salles quotidiennement' },
      { id: 'maintenance_base', name: 'Maintenance de base', description: 'Effectuer la maintenance préventive' },
      { id: 'reparations_simples', name: 'Réparations simples', description: 'Réaliser des petites réparations' }
    ],
    organisation: [
      { id: 'planning_maintenance', name: 'Planning maintenance', description: 'Organiser les tâches de maintenance' },
      { id: 'gestion_materiel', name: 'Gestion matériel', description: 'Gérer l\'outillage et les pièces' }
    ]
  },
  reputation: {
    communication: [
      { id: 'veille_avis', name: 'Veille des avis', description: 'Surveiller les avis en ligne' },
      { id: 'reponses_avis', name: 'Réponses aux avis', description: 'Rédiger des réponses personnalisées' },
      { id: 'gestion_negatifs', name: 'Gestion avis négatifs', description: 'Gérer les retours négatifs' }
    ],
    analyse: [
      { id: 'analyse_trends', name: 'Analyse des tendances', description: 'Analyser les tendances des avis' },
      { id: 'reporting', name: 'Reporting', description: 'Créer des rapports de réputation' }
    ]
  }
  // Ajoutez les autres expériences...
};

// 🏆 BADGES D'EXPÉRIENCE
export const EXPERIENCE_BADGES = {
  gamemaster: {
    id: 'master_animator',
    name: 'Maître Animateur',
    description: 'Expert en animation de sessions',
    icon: '🎮',
    rarity: 'epic'
  },
  maintenance: {
    id: 'tech_expert', 
    name: 'Expert Technique',
    description: 'Maître de la maintenance',
    icon: '🔧',
    rarity: 'rare'
  },
  reputation: {
    id: 'reputation_guardian',
    name: 'Gardien de la Réputation', 
    description: 'Protecteur de l\'image de marque',
    icon: '⭐',
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
   * 🔧 CORRECTION: Retourner 'data' au lieu de 'profile'
   */
  static async getSkillsProfile(userId) {
    try {
      const docRef = doc(db, 'skillsAcquisition', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      }
      return { success: false, error: 'Profil non trouvé' };

    } catch (error) {
      console.error('Erreur récupération profil compétences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Toggle une compétence (auto-évaluation)
   */
  static async toggleSkill(userId, experienceId, skillId) {
    try {
      // D'abord récupérer le profil actuel
      const profileResult = await this.getSkillsProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil non trouvé' };
      }

      const currentSkill = profileResult.data.experiences[experienceId]?.skills[skillId];
      const newState = !currentSkill?.selfAssessment;

      const updatePath = `experiences.${experienceId}.skills.${skillId}.selfAssessment`;
      const updates = {
        [updatePath]: newState,
        [`experiences.${experienceId}.skills.${skillId}.selfAssessmentDate`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      return { success: true, newState };

    } catch (error) {
      console.error('Erreur toggle compétence:', error);
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
      const profileResult = await this.getSkillsProfile(userId);
      if (!profileResult.success) return;

      const experience = profileResult.data.experiences[experienceId];
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
   * 🔧 CORRECTION: Vérifier que profile existe avant d'accéder à ses propriétés
   */
  static calculateProfileStats(profile) {
    // 🔧 CORRECTION: Vérification de l'existence du profil et de ses expériences
    if (!profile || !profile.experiences) {
      console.warn('⚠️ Profil invalide pour calcul de stats:', profile);
      return {
        totalExperiences: 0,
        completedExperiences: 0,
        totalSkills: 0,
        validatedSkills: 0,
        averageCompletionRate: 0,
        badgesEarned: 0,
        weeklyFollowUps: 0,
        adminInterviews: 0
      };
    }

    const experiences = Object.keys(profile.experiences);
    const totalExperiences = experiences.length;
    const completedExperiences = experiences.filter(exp => profile.experiences[exp].completed).length;

    let totalSkills = 0;
    let validatedSkills = 0;

    experiences.forEach(expId => {
      const experience = profile.experiences[expId];
      if (experience && experience.skills) {
        Object.values(experience.skills).forEach(skill => {
          totalSkills++;
          if (skill.completed) validatedSkills++;
        });
      }
    });

    return {
      totalExperiences,
      completedExperiences,
      totalSkills,
      validatedSkills,
      averageCompletionRate: totalSkills > 0 ? Math.round((validatedSkills / totalSkills) * 100) : 0,
      badgesEarned: profile.earnedBadges ? profile.earnedBadges.length : 0,
      weeklyFollowUps: profile.weeklyFollowUps ? profile.weeklyFollowUps.length : 0,
      adminInterviews: profile.adminInterviews ? profile.adminInterviews.length : 0
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
