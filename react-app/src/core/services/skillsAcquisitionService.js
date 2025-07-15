// ==========================================
// 📁 react-app/src/core/services/skillsAcquisitionService.js
// SERVICE ACQUISITION COMPÉTENCES - VERSION FINALE GAME MASTER UNIQUEMENT
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
import { db } from '../firebase.js';

// 🎮 EXPÉRIENCE GAME MASTER UNIQUEMENT
export const BRAIN_EXPERIENCES = {
  GAMEMASTER: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    description: 'Maîtriser l\'animation et la gestion des sessions de jeu',
    duration: '4-6 semaines',
    difficulty: 'intermediate',
    phases: ['decouverte_immersion', 'pratique_autonome', 'maitrise_complete']
  }
};

// 🎯 COMPÉTENCES GAME MASTER COMPLÈTES
export const EXPERIENCE_SKILLS = {
  gamemaster: {
    decouverte_immersion: [
      { id: 'scenario_psychiatric', name: 'Scénario Psychiatric', description: 'Connaître le scénario et l\'univers Psychiatric' },
      { id: 'scenario_prison', name: 'Scénario Prison', description: 'Connaître le scénario et l\'univers Prison' },
      { id: 'scenario_back80s', name: 'Scénario Back to 80s', description: 'Connaître le scénario et l\'univers années 80' },
      { id: 'ambiance_generale', name: 'Ambiance générale', description: 'Maîtriser l\'ambiance et l\'immersion' },
      { id: 'regles_base', name: 'Règles de base', description: 'Connaître les règles fondamentales' }
    ],
    gestion_technique: [
      { id: 'cameras_psychiatric', name: 'Caméras Psychiatric', description: 'Utiliser le système de caméras Psychiatric' },
      { id: 'cameras_prison', name: 'Caméras Prison', description: 'Utiliser le système de caméras Prison' },
      { id: 'cameras_back80s', name: 'Caméras Back to 80s', description: 'Utiliser le système de caméras Back to 80s' },
      { id: 'effets_sonores', name: 'Effets sonores', description: 'Maîtriser les effets sonores et musiques' },
      { id: 'effets_speciaux', name: 'Effets spéciaux', description: 'Gérer les effets spéciaux de chaque salle' },
      { id: 'reset_salles', name: 'Reset des salles', description: 'Savoir faire un reset complet et rapide' }
    ],
    animation_clients: [
      { id: 'accueil_briefing', name: 'Accueil et briefing', description: 'Maîtriser l\'accueil et le briefing des équipes' },
      { id: 'mastering_live', name: 'Mastering en live', description: 'Animer les sessions en temps réel' },
      { id: 'debriefing', name: 'Débriefing', description: 'Conduire un débriefing efficace' },
      { id: 'gestion_stress', name: 'Gestion du stress', description: 'Gérer le stress et la panique des participants' },
      { id: 'adaptation_public', name: 'Adaptation au public', description: 'S\'adapter à différents types de groupes' }
    ],
    quiz_game: [
      { id: 'animation_quiz', name: 'Animation quiz', description: 'Animer des sessions de Quiz Game' },
      { id: 'gestion_equipes', name: 'Gestion d\'équipes', description: 'Gérer plusieurs équipes simultanément' },
      { id: 'scoring_quiz', name: 'Système de score', description: 'Maîtriser le système de scoring' }
    ]
  }
};

// 🏆 BADGE GAME MASTER
export const EXPERIENCE_BADGES = {
  gamemaster: {
    id: 'master_animator',
    name: 'Maître Game Master',
    description: 'Expert en animation de toutes les expériences Brain',
    icon: '🎮',
    rarity: 'legendary'
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

// 🎯 SERVICE PRINCIPAL - VERSION FINALE
export class SkillsAcquisitionService {

  /**
   * 📋 Créer un profil de compétences Game Master
   */
  static async createSkillsProfile(userId, experiences = ['gamemaster']) {
    try {
      console.log('🚀 Création profil Game Master pour:', userId);
      
      const skillsProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        experiences: {},
        weeklyFollowUps: [],
        adminInterviews: [],
        earnedBadges: [],
        metrics: {
          totalExperiences: 1,
          completedExperiences: 0,
          totalSkills: 0,
          validatedSkills: 0,
          averageCompletionRate: 0
        }
      };

      // Initialiser l'expérience Game Master
      skillsProfile.experiences.gamemaster = {
        started: true,
        completed: false,
        startDate: new Date().toISOString(),
        completionDate: null,
        skills: {},
        adminValidations: [],
        sessionsCompleted: 0,
        currentPhase: 'decouverte_immersion'
      };

      // Initialiser toutes les compétences Game Master
      const gameMasterSkills = EXPERIENCE_SKILLS.gamemaster;
      Object.keys(gameMasterSkills).forEach(category => {
        gameMasterSkills[category].forEach(skill => {
          skillsProfile.experiences.gamemaster.skills[skill.id] = {
            completed: false,
            validatedBy: null,
            validationDate: null,
            adminComments: '',
            selfAssessment: false
          };
        });
      });

      // Calculer le total des compétences
      let totalSkills = 0;
      Object.keys(gameMasterSkills).forEach(category => {
        totalSkills += gameMasterSkills[category].length;
      });
      skillsProfile.metrics.totalSkills = totalSkills;

      await setDoc(doc(db, 'skillsAcquisition', userId), skillsProfile);
      console.log('✅ Profil Game Master créé avec succès');
      return { success: true, profileId: userId };

    } catch (error) {
      console.error('❌ Erreur création profil Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Récupérer le profil de compétences
   */
  static async getSkillsProfile(userId) {
    try {
      console.log('🔍 Récupération profil Game Master pour:', userId);
      
      const docRef = doc(db, 'skillsAcquisition', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Profil Game Master trouvé');
        return { success: true, data: docSnap.data() };
      }
      
      console.log('❌ Profil Game Master non trouvé');
      return { success: false, error: 'Profil non trouvé' };

    } catch (error) {
      console.error('❌ Erreur récupération profil Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Toggle une compétence Game Master (auto-évaluation)
   */
  static async toggleSkill(userId, experienceId, skillId) {
    try {
      console.log('🔄 Toggle compétence Game Master:', skillId);
      
      // Récupérer le profil actuel
      const profileResult = await this.getSkillsProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil non trouvé' };
      }

      const currentSkill = profileResult.data.experiences.gamemaster?.skills[skillId];
      const newState = !currentSkill?.selfAssessment;

      const updatePath = `experiences.gamemaster.skills.${skillId}.selfAssessment`;
      const updates = {
        [updatePath]: newState,
        [`experiences.gamemaster.skills.${skillId}.selfAssessmentDate`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      console.log('✅ Compétence Game Master toggleée:', skillId, '→', newState);
      return { success: true, newState };

    } catch (error) {
      console.error('❌ Erreur toggle compétence Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🛡️ Validation admin d'une compétence Game Master
   */
  static async adminValidateSkill(userId, experienceId, skillId, validatorId, validated = true, comments = '') {
    try {
      const updatePath = `experiences.gamemaster.skills.${skillId}`;
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

      updates[`experiences.gamemaster.adminValidations`] = arrayUnion(validationEntry);

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);

      // Vérifier si le parcours Game Master est complet
      await this.checkGameMasterCompletion(userId);

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur validation admin Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 Vérifier la completion du parcours Game Master
   */
  static async checkGameMasterCompletion(userId) {
    try {
      const profileResult = await this.getSkillsProfile(userId);
      if (!profileResult.success) return;

      const gameMasterExp = profileResult.data.experiences.gamemaster;
      if (!gameMasterExp) return;

      const allSkills = EXPERIENCE_SKILLS.gamemaster;
      let totalSkills = 0;
      let validatedSkills = 0;

      Object.keys(allSkills).forEach(category => {
        allSkills[category].forEach(skill => {
          totalSkills++;
          if (gameMasterExp.skills[skill.id]?.completed) {
            validatedSkills++;
          }
        });
      });

      const completionRate = (validatedSkills / totalSkills) * 100;

      // Si 100% des compétences sont validées = Game Master certifié
      if (completionRate === 100 && !gameMasterExp.completed) {
        const updates = {
          'experiences.gamemaster.completed': true,
          'experiences.gamemaster.completionDate': serverTimestamp(),
          'metrics.completedExperiences': 1,
          earnedBadges: arrayUnion('gamemaster'),
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'skillsAcquisition', userId), updates);

        console.log('🏆 GAME MASTER CERTIFIÉ !', userId);
        return { success: true, gameMasterCertified: true };
      }

      return { success: true, gameMasterCertified: false, completionRate };

    } catch (error) {
      console.error('❌ Erreur vérification completion Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Ajouter un suivi hebdomadaire Game Master
   */
  static async addWeeklyFollowUp(userId, experienceId, followUpData) {
    try {
      const followUp = {
        experienceId: 'gamemaster',
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
      console.error('❌ Erreur ajout suivi hebdomadaire Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques Game Master
   */
  static calculateProfileStats(profile) {
    console.log('📊 Calcul stats Game Master');
    
    if (!profile || !profile.experiences || !profile.experiences.gamemaster) {
      console.warn('⚠️ Profil Game Master invalide');
      return {
        totalExperiences: 1,
        completedExperiences: 0,
        totalSkills: 0,
        validatedSkills: 0,
        averageCompletionRate: 0,
        badgesEarned: 0,
        weeklyFollowUps: 0,
        adminInterviews: 0
      };
    }

    const gameMasterExp = profile.experiences.gamemaster;
    const allSkills = EXPERIENCE_SKILLS.gamemaster;
    
    let totalSkills = 0;
    let validatedSkills = 0;
    let selfAssessedSkills = 0;

    Object.keys(allSkills).forEach(category => {
      allSkills[category].forEach(skill => {
        totalSkills++;
        if (gameMasterExp.skills[skill.id]?.completed) {
          validatedSkills++;
        }
        if (gameMasterExp.skills[skill.id]?.selfAssessment) {
          selfAssessedSkills++;
        }
      });
    });

    const stats = {
      totalExperiences: 1,
      completedExperiences: gameMasterExp.completed ? 1 : 0,
      totalSkills,
      validatedSkills,
      selfAssessedSkills,
      averageCompletionRate: totalSkills > 0 ? Math.round((validatedSkills / totalSkills) * 100) : 0,
      selfAssessmentRate: totalSkills > 0 ? Math.round((selfAssessedSkills / totalSkills) * 100) : 0,
      badgesEarned: profile.earnedBadges ? profile.earnedBadges.length : 0,
      weeklyFollowUps: profile.weeklyFollowUps ? profile.weeklyFollowUps.length : 0,
      adminInterviews: profile.adminInterviews ? profile.adminInterviews.length : 0,
      isGameMasterCertified: gameMasterExp.completed || false
    };

    console.log('✅ Stats Game Master calculées:', stats);
    return stats;
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
   * 🔍 Rechercher tous les profils Game Master (admin)
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
      console.error('❌ Erreur récupération profils Game Master:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SkillsAcquisitionService;
