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

// 🔥 CORRECTION: Chemin correct vers Firebase
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
      { id: 'accessoires_psychiatric', title: 'Je gère les accessoires et costumes avec soin', category: 'technical' }
    ],
    gestion_client: [
      { id: 'briefing_psychiatric', title: 'Je sais faire un briefing complet et engageant', category: 'client' },
      { id: 'indices_psychiatric', title: 'Je donne les indices de manière immersive', category: 'client' },
      { id: 'debriefing_psychiatric', title: 'Je conduis un debriefing constructif et positif', category: 'client' }
    ],
    gestion_problemes: [
      { id: 'urgences_psychiatric', title: 'Je gère les situations d\'urgence avec calme', category: 'emergency' },
      { id: 'pannes_psychiatric', title: 'Je diagnostique et résous les pannes techniques courantes', category: 'emergency' },
      { id: 'blocages_psychiatric', title: 'Je débloque les équipes en difficulté sans casser l\'immersion', category: 'emergency' }
    ]
  },
  
  prison: {
    decouverte_immersion: [
      { id: 'scenario_prison', title: 'J\'ai lu et compris le scénario Prison', category: 'knowledge' },
      { id: 'ambiance_prison', title: 'Je peux présenter l\'ambiance carcérale et les enjeux', category: 'knowledge' },
      { id: 'regles_prison', title: 'Je connais toutes les règles spécifiques Prison', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'cameras_prison', title: 'Je maîtrise le système de caméras Prison', category: 'technical' },
      { id: 'serrures_prison', title: 'Je gère parfaitement les serrures électroniques', category: 'technical' },
      { id: 'reset_prison', title: 'Je fais un reset complet en moins de 10 minutes', category: 'technical' }
    ],
    gestion_client: [
      { id: 'briefing_prison', title: 'Je fais un briefing Prison immersif et sécurisé', category: 'client' },
      { id: 'surveillance_prison', title: 'Je surveille efficacement les équipes en parallèle', category: 'client' },
      { id: 'coordination_prison', title: 'Je coordonne les interactions entre équipes', category: 'client' }
    ],
    gestion_problemes: [
      { id: 'conflits_prison', title: 'Je gère les conflits entre équipes', category: 'emergency' },
      { id: 'triche_prison', title: 'Je détecte et gère les tentatives de triche', category: 'emergency' },
      { id: 'evacuation_prison', title: 'Je maîtrise les procédures d\'évacuation Prison', category: 'emergency' }
    ]
  },
  
  back_to_80s: {
    decouverte_immersion: [
      { id: 'scenario_80s', title: 'J\'ai lu et compris le scénario Back to the 80\'s', category: 'knowledge' },
      { id: 'culture_80s', title: 'Je connais la culture et références des années 80', category: 'knowledge' },
      { id: 'playlist_80s', title: 'Je maîtrise la playlist et ambiance musicale', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'retro_tech_80s', title: 'Je manipule les équipements rétro avec expertise', category: 'technical' },
      { id: 'effets_80s', title: 'Je gère les effets spéciaux années 80', category: 'technical' },
      { id: 'decors_80s', title: 'Je maintiens et ajuste les décors thématiques', category: 'technical' }
    ],
    gestion_client: [
      { id: 'animation_80s', title: 'J\'anime avec l\'énergie et style des années 80', category: 'client' },
      { id: 'costume_80s', title: 'Je porte et fais porter les costumes avec style', category: 'client' },
      { id: 'experience_80s', title: 'Je crée une expérience totalement immersive', category: 'client' }
    ]
  },
  
  quiz_game: {
    animation_base: [
      { id: 'regles_quiz', title: 'Je connais parfaitement les règles du Quiz Game', category: 'knowledge' },
      { id: 'questions_quiz', title: 'Je maîtrise la base de questions et réponses', category: 'knowledge' },
      { id: 'scoring_quiz', title: 'Je gère le système de points et classement', category: 'knowledge' }
    ],
    gestion_technique: [
      { id: 'materiel_quiz', title: 'Je maîtrise tout le matériel technique Quiz', category: 'technical' },
      { id: 'son_quiz', title: 'Je gère parfaitement le système son', category: 'technical' },
      { id: 'ecrans_quiz', title: 'J\'utilise efficacement les écrans d\'affichage', category: 'technical' }
    ],
    animation_avancee: [
      { id: 'energie_quiz', title: 'Je maintiens une énergie constante pendant l\'animation', category: 'animation' },
      { id: 'participation_quiz', title: 'Je fais participer tous les joueurs équitablement', category: 'animation' },
      { id: 'ambiance_quiz', title: 'Je crée une ambiance festive et compétitive', category: 'animation' }
    ]
  }
};

// 🎖️ BADGES PAR EXPÉRIENCE
export const EXPERIENCE_BADGES = {
  psychiatric_rookie: {
    id: 'psychiatric_rookie',
    name: 'Psychiatre Débutant',
    description: 'Première maîtrise de l\'expérience Psychiatric',
    icon: '🩺',
    color: '#DC2626',
    requirements: { experience: 'psychiatric', completion: 50 },
    rarity: 'common'
  },
  psychiatric_expert: {
    id: 'psychiatric_expert',
    name: 'Maître de l\'Asile',
    description: 'Expertise complète de l\'expérience Psychiatric',
    icon: '👨‍⚕️',
    color: '#7C2D12',
    requirements: { experience: 'psychiatric', completion: 100 },
    rarity: 'epic'
  },
  
  prison_guard: {
    id: 'prison_guard',
    name: 'Gardien en Chef',
    description: 'Maîtrise de l\'expérience Prison',
    icon: '🚨',
    color: '#F97316',
    requirements: { experience: 'prison', completion: 100 },
    rarity: 'epic'
  },
  
  retro_master: {
    id: 'retro_master',
    name: 'Maître du Rétro',
    description: 'Expert des années 80',
    icon: '🎸',
    color: '#8B5CF6',
    requirements: { experience: 'back_to_80s', completion: 100 },
    rarity: 'epic'
  },
  
  quiz_animator: {
    id: 'quiz_animator',
    name: 'Animateur Quiz Pro',
    description: 'Animation Quiz Game maîtrisée',
    icon: '🏆',
    color: '#10B981',
    requirements: { experience: 'quiz_game', completion: 100 },
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
   * 🔄 Initialiser le profil si inexistant
   */
  static async initializeProfile(userId, experiences = []) {
    try {
      // Vérifier si le profil existe déjà
      const existing = await this.getSkillsProfile(userId);
      
      if (existing.success) {
        console.log('✅ Profil compétences déjà existant pour:', userId);
        return existing;
      }
      
      // Créer un nouveau profil
      console.log('🆕 Création nouveau profil compétences pour:', userId);
      return await this.createSkillsProfile(userId, experiences);
      
    } catch (error) {
      console.error('Erreur initialisation profil:', error);
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
        return { success: true, data: docSnap.data() };
      }
      return { success: false, error: 'Profil non trouvé' };

    } catch (error) {
      console.error('Erreur récupération profil compétences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Marquer une compétence comme acquise/non-acquise
   */
  static async toggleSkill(userId, experienceId, skillId) {
    try {
      const profile = await this.getSkillsProfile(userId);
      
      if (!profile.success) {
        throw new Error('Profil non trouvé');
      }
      
      const currentState = profile.data.experiences?.[experienceId]?.skills?.[skillId]?.selfAssessment || false;
      const newState = !currentState;
      
      const updatePath = `experiences.${experienceId}.skills.${skillId}.selfAssessment`;
      const updates = {
        [updatePath]: newState,
        [`experiences.${experienceId}.skills.${skillId}.selfAssessmentDate`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      
      console.log(`✅ Compétence ${skillId} ${newState ? 'acquise' : 'retirée'} pour ${userId}`);
      
      return { success: true, newState };

    } catch (error) {
      console.error('Erreur toggle compétence:', error);
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
   * 🎯 Vérifier si une expérience est complète
   */
  static async checkExperienceCompletion(userId, experienceId) {
    try {
      const profile = await this.getSkillsProfile(userId);
      
      if (!profile.success) return { success: false };
      
      const experience = profile.data.experiences[experienceId];
      if (!experience) return { success: false };
      
      const skills = experience.skills;
      const totalSkills = Object.keys(skills).length;
      const completedSkills = Object.values(skills).filter(skill => skill.completed).length;
      
      const completionRate = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;
      const isComplete = completionRate >= 90; // 90% des compétences validées
      
      if (isComplete && !experience.completed) {
        // Marquer l'expérience comme complète
        const updates = {
          [`experiences.${experienceId}.completed`]: true,
          [`experiences.${experienceId}.completionDate`]: serverTimestamp(),
          [`experiences.${experienceId}.completionRate`]: completionRate,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
        
        // Attribuer le badge de l'expérience
        await this.awardExperienceBadge(userId, experienceId);
        
        console.log(`🎉 Expérience ${experienceId} complétée pour ${userId}`);
      }
      
      return { 
        success: true, 
        completed: isComplete, 
        completionRate, 
        completedSkills, 
        totalSkills 
      };

    } catch (error) {
      console.error('Erreur vérification complétion expérience:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎖️ Attribuer un badge d'expérience
   */
  static async awardExperienceBadge(userId, experienceId) {
    try {
      const badgeId = `${experienceId}_expert`;
      const badge = EXPERIENCE_BADGES[badgeId];
      
      if (!badge) return { success: false, error: 'Badge non trouvé' };
      
      const badgeData = {
        ...badge,
        earnedAt: serverTimestamp(),
        earnedBy: experienceId
      };
      
      const updates = {
        earnedBadges: arrayUnion(badgeData),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      
      console.log(`🎖️ Badge ${badge.name} attribué à ${userId}`);
      
      return { success: true, badge: badgeData };

    } catch (error) {
      console.error('Erreur attribution badge:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Soumettre un suivi hebdomadaire
   */
  static async submitWeeklyFollowUp(userId, experienceId, followUpData) {
    try {
      const weeklyEntry = {
        experienceId,
        date: serverTimestamp(),
        data: followUpData,
        submitted: true
      };
      
      const updates = {
        weeklyFollowUps: arrayUnion(weeklyEntry),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      
      return { success: true };

    } catch (error) {
      console.error('Erreur soumission suivi hebdomadaire:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques d'un profil
   */
  static calculateStats(profileData) {
    if (!profileData || !profileData.experiences) {
      return {
        totalExperiences: 0,
        completedExperiences: 0,
        totalSkills: 0,
        validatedSkills: 0,
        selfAssessedSkills: 0,
        averageCompletionRate: 0,
        earnedBadges: 0
      };
    }

    const experiences = Object.values(profileData.experiences);
    const totalExperiences = experiences.length;
    const completedExperiences = experiences.filter(exp => exp.completed).length;
    
    let totalSkills = 0;
    let validatedSkills = 0;
    let selfAssessedSkills = 0;
    
    experiences.forEach(exp => {
      if (exp.skills) {
        const skills = Object.values(exp.skills);
        totalSkills += skills.length;
        validatedSkills += skills.filter(skill => skill.completed).length;
        selfAssessedSkills += skills.filter(skill => skill.selfAssessment).length;
      }
    });
    
    const averageCompletionRate = totalSkills > 0 ? (validatedSkills / totalSkills) * 100 : 0;
    const earnedBadges = profileData.earnedBadges?.length || 0;
    
    return {
      totalExperiences,
      completedExperiences,
      totalSkills,
      validatedSkills,
      selfAssessedSkills,
      averageCompletionRate: Math.round(averageCompletionRate),
      earnedBadges
    };
  }

  /**
   * 📋 Obtenir tous les profils (pour admin)
   */
  static async getAllProfiles() {
    try {
      const querySnapshot = await getDocs(collection(db, 'skillsAcquisition'));
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: profiles };

    } catch (error) {
      console.error('Erreur récupération profils:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 Rechercher des profils par expérience
   */
  static async getProfilesByExperience(experienceId) {
    try {
      const querySnapshot = await getDocs(collection(db, 'skillsAcquisition'));
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.experiences && data.experiences[experienceId]) {
          profiles.push({
            id: doc.id,
            ...data,
            experienceData: data.experiences[experienceId]
          });
        }
      });
      
      return { success: true, data: profiles };

    } catch (error) {
      console.error('Erreur recherche profils par expérience:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export par défaut
export default SkillsAcquisitionService;
