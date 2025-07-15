// ==========================================
// 📁 react-app/src/core/services/skillsAcquisitionService.js
// SERVICE ACQUISITION COMPÉTENCES - VERSION STABLE MINIMALE
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

// 🧠 EXPÉRIENCES BRAIN - DÉFINITION SIMPLE
const BRAIN_EXPERIENCES_DATA = {
  GAMEMASTER: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    description: 'Maîtriser l\'animation et la gestion des sessions de jeu',
    duration: '4-6 semaines',
    difficulty: 'intermediate'
  },
  MAINTENANCE: {
    id: 'maintenance', 
    name: 'Entretien & Maintenance',
    icon: '🔧',
    description: 'Gérer la maintenance et l\'entretien des salles',
    duration: '3-4 semaines',
    difficulty: 'beginner'
  },
  REPUTATION: {
    id: 'reputation',
    name: 'Gestion des Avis',
    icon: '⭐',
    description: 'Optimiser la réputation en ligne et gérer les avis clients',
    duration: '3-5 semaines', 
    difficulty: 'intermediate'
  }
};

// Export constant
export const BRAIN_EXPERIENCES = BRAIN_EXPERIENCES_DATA;

// 🎯 COMPÉTENCES PAR EXPÉRIENCE - DÉFINITION SIMPLE
const EXPERIENCE_SKILLS_DATA = {
  gamemaster: {
    animation: [
      { id: 'accueil_briefing', name: 'Accueil et briefing', description: 'Maîtriser l\'accueil et le briefing des équipes' },
      { id: 'mastering_live', name: 'Mastering en live', description: 'Animer les sessions en temps réel' },
      { id: 'debriefing', name: 'Débriefing', description: 'Conduire un débriefing efficace' }
    ],
    technique: [
      { id: 'gestion_cameras', name: 'Gestion caméras', description: 'Utiliser le système de caméras' },
      { id: 'gestion_sons', name: 'Gestion sons', description: 'Maîtriser le système audio' }
    ]
  },
  maintenance: {
    technique: [
      { id: 'verification_salles', name: 'Vérification des salles', description: 'Contrôler l\'état des salles quotidiennement' },
      { id: 'maintenance_base', name: 'Maintenance de base', description: 'Effectuer la maintenance préventive' }
    ]
  },
  reputation: {
    communication: [
      { id: 'veille_avis', name: 'Veille des avis', description: 'Surveiller les avis en ligne' },
      { id: 'reponses_avis', name: 'Réponses aux avis', description: 'Rédiger des réponses personnalisées' }
    ]
  }
};

// Export constant
export const EXPERIENCE_SKILLS = EXPERIENCE_SKILLS_DATA;

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

// 🎯 SERVICE PRINCIPAL - VERSION STABLE
export class SkillsAcquisitionService {

  /**
   * 📋 Créer un profil de compétences pour un utilisateur
   */
  static async createSkillsProfile(userId, experiences = []) {
    try {
      console.log('🚀 Création profil compétences pour:', userId, experiences);
      
      const skillsProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        experiences: {},
        weeklyFollowUps: [],
        adminInterviews: [],
        earnedBadges: [],
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
        console.log('🎯 Initialisation expérience:', expId);
        
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
        const expSkills = EXPERIENCE_SKILLS_DATA[expId];
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
      });

      await setDoc(doc(db, 'skillsAcquisition', userId), skillsProfile);
      console.log('✅ Profil créé avec succès');
      return { success: true, profileId: userId };

    } catch (error) {
      console.error('❌ Erreur création profil compétences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Récupérer le profil de compétences
   */
  static async getSkillsProfile(userId) {
    try {
      console.log('🔍 Récupération profil pour:', userId);
      
      const docRef = doc(db, 'skillsAcquisition', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Profil trouvé');
        return { success: true, data: docSnap.data() };
      }
      
      console.log('❌ Profil non trouvé');
      return { success: false, error: 'Profil non trouvé' };

    } catch (error) {
      console.error('❌ Erreur récupération profil compétences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Toggle une compétence (auto-évaluation)
   */
  static async toggleSkill(userId, experienceId, skillId) {
    try {
      console.log('🔄 Toggle skill:', skillId, 'pour expérience:', experienceId);
      
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
      console.log('✅ Skill toggleée avec succès');
      return { success: true, newState };

    } catch (error) {
      console.error('❌ Erreur toggle compétence:', error);
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
      console.error('❌ Erreur ajout suivi hebdomadaire:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques d'un profil
   */
  static calculateProfileStats(profile) {
    console.log('📊 Calcul stats pour profil:', profile);
    
    // Vérification de sécurité
    if (!profile || !profile.experiences) {
      console.warn('⚠️ Profil invalide pour calcul de stats');
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

    const stats = {
      totalExperiences,
      completedExperiences,
      totalSkills,
      validatedSkills,
      averageCompletionRate: totalSkills > 0 ? Math.round((validatedSkills / totalSkills) * 100) : 0,
      badgesEarned: profile.earnedBadges ? profile.earnedBadges.length : 0,
      weeklyFollowUps: profile.weeklyFollowUps ? profile.weeklyFollowUps.length : 0,
      adminInterviews: profile.adminInterviews ? profile.adminInterviews.length : 0
    };

    console.log('✅ Stats calculées:', stats);
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
      console.error('❌ Erreur récupération tous les profils:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SkillsAcquisitionService;
