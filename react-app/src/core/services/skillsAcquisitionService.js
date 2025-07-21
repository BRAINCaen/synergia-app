// ==========================================
// 📁 react-app/src/core/services/skillsAcquisitionService.js
// CORRECTION - CALCULS COMPÉTENCES FONCTIONNELS
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// 🎮 COMPÉTENCES PAR EXPÉRIENCE - STRUCTURE CORRIGÉE
export const EXPERIENCE_SKILLS = {
  gamemaster: {
    decouverte_immersion: [
      {
        id: 'connaissance_salles',
        name: 'Connaissance parfaite des 3 salles',
        description: 'Maîtriser Prison, Psychiatric et Back to the 80s',
        category: 'decouverte_immersion'
      },
      {
        id: 'scenarios_enigmes',
        name: 'Scénarios et énigmes par cœur',
        description: 'Connaître tous les puzzles et leur résolution',
        category: 'decouverte_immersion'
      },
      {
        id: 'immersion_univers',
        name: 'Immersion dans l\'univers de chaque salle',
        description: 'Comprendre l\'ambiance et l\'histoire de chaque expérience',
        category: 'decouverte_immersion'
      }
    ],
    gestion_technique: [
      {
        id: 'systeme_cameras',
        name: 'Maîtrise du système de caméras',
        description: 'Navigation fluide entre les vues caméra',
        category: 'gestion_technique'
      },
      {
        id: 'effets_sonores',
        name: 'Gestion des effets sonores et ambiances',
        description: 'Utilisation appropriée des sons d\'ambiance',
        category: 'gestion_technique'
      },
      {
        id: 'indices_distants',
        name: 'Délivrer des indices à distance',
        description: 'Communiquer efficacement via micro/haut-parleurs',
        category: 'gestion_technique'
      }
    ],
    animation_clients: [
      {
        id: 'accueil_briefing',
        name: 'Accueil et briefing joueurs',
        description: 'Présenter les règles et mettre en ambiance',
        category: 'animation_clients'
      },
      {
        id: 'gestion_stress',
        name: 'Gestion du stress et des peurs',
        description: 'Aider les joueurs à surmonter leurs appréhensions',
        category: 'animation_clients'
      },
      {
        id: 'debriefing_photo',
        name: 'Debriefing et session photo',
        description: 'Conclure l\'expérience et immortaliser le moment',
        category: 'animation_clients'
      }
    ],
    quiz_game: [
      {
        id: 'animation_quiz',
        name: 'Animation du Quiz Game',
        description: 'Animer les soirées quiz avec dynamisme',
        category: 'quiz_game'
      },
      {
        id: 'gestion_classements',
        name: 'Gestion des scores et classements',
        description: 'Tenir à jour les résultats en temps réel',
        category: 'quiz_game'
      }
    ]
  }
};

// 📋 TEMPLATE DE SUIVI HEBDOMADAIRE
export const WEEKLY_FOLLOW_UP_TEMPLATE = {
  week: '',
  progressHighlights: '',
  difficultiesEncountered: '',
  skillsImproved: [],
  sessionsCompleted: 0,
  adminFeedback: '',
  employeeComments: '',
  nextWeekObjectives: ''
};

// 🎯 SERVICE ACQUISITION DE COMPÉTENCES
class SkillsAcquisitionService {
  constructor() {
    this.COLLECTION_NAME = 'skillsAcquisition';
    console.log('🎯 SkillsAcquisitionService initialisé');
  }

  /**
   * 📊 Récupérer le profil de compétences
   */
  async getSkillsProfile(userId) {
    try {
      console.log('📊 Récupération profil compétences pour:', userId);
      
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('📝 Aucun profil Game Master trouvé');
        return { success: false, error: 'Profil non trouvé' };
      }

      const profileData = docSnap.data();
      console.log('✅ Profil Game Master récupéré');
      return { success: true, data: profileData };

    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🚀 Créer un profil Game Master avec données de base
   */
  async createGameMasterProfile(userId) {
    try {
      console.log('🚀 Création profil Game Master pour:', userId);
      
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      // Supprimer l'ancien profil s'il existe
      try {
        const oldDocRef = doc(db, this.COLLECTION_NAME, userId);
        await setDoc(oldDocRef, {}, { merge: false });
        console.log('🗑️ Ancien profil supprimé');
      } catch (error) {
        console.log('ℹ️ Pas d\'ancien profil à supprimer');
      }

      // Créer le nouveau profil avec structure complète
      const skillsProfile = {
        userId,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        experiences: {
          gamemaster: {
            started: true,
            completed: false,
            startDate: new Date().toISOString(),
            completionDate: null,
            skills: {},
            adminValidations: [],
            sessionsCompleted: 0,
            currentPhase: 'decouverte_immersion',
            weeklyFollowUps: []
          }
        },
        interviews: [],
        earnedBadges: [],
        metrics: {
          totalExperiences: 1,
          completedExperiences: 0,
          totalSkills: 0,
          validatedSkills: 0,
          averageCompletionRate: 0,
          weeklyFollowUps: 0
        }
      };

      // Initialiser toutes les compétences Game Master
      let totalSkills = 0;
      Object.keys(EXPERIENCE_SKILLS.gamemaster).forEach(category => {
        const categorySkills = EXPERIENCE_SKILLS.gamemaster[category];
        if (Array.isArray(categorySkills)) {
          categorySkills.forEach(skill => {
            skillsProfile.experiences.gamemaster.skills[skill.id] = {
              completed: false,
              validatedBy: null,
              validationDate: null,
              adminComments: '',
              selfAssessment: false
            };
            totalSkills++;
          });
        }
      });

      skillsProfile.metrics.totalSkills = totalSkills;

      // Sauvegarder dans Firebase
      await setDoc(doc(db, this.COLLECTION_NAME, userId), skillsProfile);
      console.log('✅ Profil Game Master créé avec succès');
      
      return { success: true, profileId: userId, data: skillsProfile };

    } catch (error) {
      console.error('❌ Erreur création profil Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 Calculer les statistiques du profil
   */
  calculateProfileStats(profileData) {
    if (!profileData || !profileData.experiences) {
      return {
        totalSkills: 0,
        validatedSkills: 0,
        completionRate: 0,
        weeklyFollowUps: 0
      };
    }

    const gameMasterExp = profileData.experiences.gamemaster;
    if (!gameMasterExp || !gameMasterExp.skills) {
      return {
        totalSkills: 0,
        validatedSkills: 0,
        completionRate: 0,
        weeklyFollowUps: 0
      };
    }

    const skills = gameMasterExp.skills;
    const totalSkills = Object.keys(skills).length;
    const validatedSkills = Object.values(skills).filter(skill => skill.completed).length;
    const completionRate = totalSkills > 0 ? Math.round((validatedSkills / totalSkills) * 100) : 0;
    const weeklyFollowUps = gameMasterExp.weeklyFollowUps?.length || 0;

    return {
      totalSkills,
      validatedSkills,
      completionRate,
      weeklyFollowUps
    };
  }

  /**
   * ✅ Valider une compétence
   */
  async validateSkill(userId, skillId, validatorId, comments = '') {
    try {
      console.log('✅ Validation compétence:', skillId, 'pour utilisateur:', userId);
      
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Profil non trouvé' };
      }

      const profileData = docSnap.data();
      
      if (!profileData.experiences?.gamemaster?.skills?.[skillId]) {
        return { success: false, error: 'Compétence non trouvée' };
      }

      // Marquer la compétence comme validée
      profileData.experiences.gamemaster.skills[skillId] = {
        completed: true,
        validatedBy: validatorId,
        validationDate: new Date().toISOString(),
        adminComments: comments,
        selfAssessment: false
      };

      // Recalculer les métriques
      const stats = this.calculateProfileStats(profileData);
      profileData.metrics = {
        ...profileData.metrics,
        ...stats
      };

      profileData.lastUpdate = new Date().toISOString();

      // Sauvegarder
      await setDoc(docRef, profileData);
      
      console.log('✅ Compétence validée avec succès');
      return { success: true, data: profileData };

    } catch (error) {
      console.error('❌ Erreur validation compétence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 Ajouter un suivi hebdomadaire
   */
  async addWeeklyFollowUp(userId, followUpData) {
    try {
      console.log('📝 Ajout suivi hebdomadaire pour:', userId);
      
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Profil non trouvé' };
      }

      const profileData = docSnap.data();
      
      // Ajouter le suivi hebdomadaire
      const weeklyFollowUp = {
        ...followUpData,
        date: new Date().toISOString(),
        week: `Semaine ${(profileData.experiences.gamemaster.weeklyFollowUps?.length || 0) + 1}`
      };

      if (!profileData.experiences.gamemaster.weeklyFollowUps) {
        profileData.experiences.gamemaster.weeklyFollowUps = [];
      }

      profileData.experiences.gamemaster.weeklyFollowUps.push(weeklyFollowUp);
      
      // Mettre à jour les métriques
      profileData.metrics.weeklyFollowUps = profileData.experiences.gamemaster.weeklyFollowUps.length;
      profileData.lastUpdate = new Date().toISOString();

      // Sauvegarder
      await setDoc(docRef, profileData);
      
      console.log('✅ Suivi hebdomadaire ajouté');
      return { success: true, data: profileData };

    } catch (error) {
      console.error('❌ Erreur ajout suivi:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 Obtenir les compétences par catégorie avec progression
   */
  getSkillsByCategory(profileData) {
    if (!profileData?.experiences?.gamemaster?.skills) {
      return {};
    }

    const skillsStatus = profileData.experiences.gamemaster.skills;
    const result = {};

    Object.keys(EXPERIENCE_SKILLS.gamemaster).forEach(category => {
      const categorySkills = EXPERIENCE_SKILLS.gamemaster[category];
      result[category] = categorySkills.map(skill => ({
        ...skill,
        status: skillsStatus[skill.id] || {
          completed: false,
          validatedBy: null,
          validationDate: null,
          adminComments: '',
          selfAssessment: false
        }
      }));
    });

    return result;
  }

  /**
   * 📊 Statistiques globales de formation
   */
  getTrainingOverview(profileData) {
    if (!profileData) return null;

    const stats = this.calculateProfileStats(profileData);
    const skillsByCategory = this.getSkillsByCategory(profileData);
    
    // Calculer progression par catégorie
    const categoryProgress = {};
    Object.keys(skillsByCategory).forEach(category => {
      const categorySkills = skillsByCategory[category];
      const completed = categorySkills.filter(skill => skill.status.completed).length;
      const total = categorySkills.length;
      categoryProgress[category] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    return {
      globalStats: stats,
      categoryProgress,
      skillsByCategory,
      experience: profileData.experiences.gamemaster,
      lastUpdate: profileData.lastUpdate
    };
  }
}

export { SkillsAcquisitionService };
export default new SkillsAcquisitionService();
