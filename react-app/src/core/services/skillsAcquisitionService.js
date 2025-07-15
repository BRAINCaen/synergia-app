// ==========================================
// 📁 react-app/src/core/services/skillsAcquisitionService.js
// SERVICE ACQUISITION DE COMPÉTENCES GAME MASTER - IMPORTS FIREBASE CORRIGÉS
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

// 🎯 COMPÉTENCES PAR EXPÉRIENCE
export const EXPERIENCE_SKILLS = {
  gamemaster: {
    decouverte_immersion: [
      { id: 'connaissance_scenarios', name: 'Connaissance des scénarios', description: 'Maîtriser tous les scénarios et leurs variantes' },
      { id: 'culture_escape', name: 'Culture escape game', description: 'Comprendre l\'univers et les codes des escape games' },
      { id: 'immersion_joueur', name: 'Immersion joueur', description: 'Savoir créer une ambiance immersive' },
      { id: 'storytelling', name: 'Storytelling', description: 'Raconter une histoire captivante' }
    ],
    gestion_technique: [
      { id: 'manipulation_cameras', name: 'Manipulation caméras', description: 'Utiliser efficacement le système de caméras' },
      { id: 'gestion_son', name: 'Gestion du son', description: 'Maîtriser l\'ambiance sonore et les effets' },
      { id: 'eclairage_ambiance', name: 'Éclairage et ambiance', description: 'Contrôler l\'éclairage pour l\'immersion' },
      { id: 'maintenance_materiel', name: 'Maintenance matériel', description: 'Entretenir et réparer le matériel technique' },
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

// 🎯 SERVICE PRINCIPAL - VERSION ULTRA-ROBUSTE
export class SkillsAcquisitionService {

  /**
   * 📋 Créer un profil de compétences Game Master
   */
  static async createSkillsProfile(userId, experiences = ['gamemaster']) {
    try {
      console.log('🚀 Création profil Game Master pour:', userId);
      
      // 🔧 CORRECTION: Toujours supprimer l'ancien profil d'abord
      try {
        const existingProfile = await this.getSkillsProfile(userId);
        if (existingProfile.success) {
          console.log('🗑️ Suppression ancien profil Game Master');
          await this.deleteSkillsProfile(userId);
        }
      } catch (error) {
        console.log('ℹ️ Pas d\'ancien profil à supprimer');
      }
      
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

      // Initialiser l'expérience Game Master avec structure complète
      skillsProfile.experiences.gamemaster = {
        started: true,
        completed: false,
        startDate: new Date().toISOString(),
        completionDate: null,
        skills: {}, // 🔧 CORRECTION: Initialiser explicitement
        adminValidations: [],
        sessionsCompleted: 0,
        currentPhase: 'decouverte_immersion'
      };

      // 🔧 CORRECTION: Initialiser toutes les compétences Game Master avec vérification
      const gameMasterSkills = EXPERIENCE_SKILLS.gamemaster;
      if (gameMasterSkills && typeof gameMasterSkills === 'object') {
        Object.keys(gameMasterSkills).forEach(category => {
          const categorySkills = gameMasterSkills[category];
          if (Array.isArray(categorySkills)) {
            categorySkills.forEach(skill => {
              if (skill && skill.id) {
                skillsProfile.experiences.gamemaster.skills[skill.id] = {
                  completed: false,
                  validatedBy: null,
                  validationDate: null,
                  adminComments: '',
                  selfAssessment: false
                };
              }
            });
          }
        });

        // Calculer le total des compétences
        let totalSkills = 0;
        Object.keys(gameMasterSkills).forEach(category => {
          const categorySkills = gameMasterSkills[category];
          if (Array.isArray(categorySkills)) {
            totalSkills += categorySkills.length;
          }
        });
        skillsProfile.metrics.totalSkills = totalSkills;
      }

      await setDoc(doc(db, 'skillsAcquisition', userId), skillsProfile);
      console.log('✅ Profil Game Master créé avec succès');
      return { success: true, profileId: userId };

    } catch (error) {
      console.error('❌ Erreur création profil Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ Supprimer un profil Game Master
   */
  static async deleteSkillsProfile(userId) {
    try {
      await deleteDoc(doc(db, 'skillsAcquisition', userId));
      console.log('🗑️ Profil Game Master supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression profil:', error);
    }
  }

  /**
   * 📊 Récupérer le profil de compétences avec réparation automatique
   */
  static async getSkillsProfile(userId) {
    try {
      console.log('🔍 Récupération profil Game Master pour:', userId);
      
      const docRef = doc(db, 'skillsAcquisition', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Profil Game Master trouvé');
        let profileData = docSnap.data();
        
        // 🔧 CORRECTION: Vérifier et réparer la structure IMMÉDIATEMENT
        if (!profileData.experiences?.gamemaster?.skills) {
          console.log('🔧 Réparation structure Game Master...');
          profileData = await this.repairProfileStructure(userId, profileData);
        }
        
        return { success: true, data: profileData };
      }
      
      console.log('❌ Profil Game Master non trouvé');
      return { success: false, error: 'Profil non trouvé' };

    } catch (error) {
      console.error('❌ Erreur récupération profil Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔧 Réparer la structure d'un profil Game Master
   */
  static async repairProfileStructure(userId, profileData) {
    try {
      console.log('🔧 Réparation structure Game Master');
      
      // S'assurer que la structure experiences existe
      if (!profileData.experiences) {
        profileData.experiences = {};
      }
      
      // S'assurer que l'expérience gamemaster existe
      if (!profileData.experiences.gamemaster) {
        profileData.experiences.gamemaster = {
          started: true,
          completed: false,
          startDate: new Date().toISOString(),
          completionDate: null,
          skills: {},
          adminValidations: [],
          sessionsCompleted: 0,
          currentPhase: 'decouverte_immersion'
        };
      }
      
      // S'assurer que skills existe
      if (!profileData.experiences.gamemaster.skills) {
        profileData.experiences.gamemaster.skills = {};
      }
      
      // Ajouter toutes les compétences Game Master manquantes
      const gameMasterSkills = EXPERIENCE_SKILLS.gamemaster;
      if (gameMasterSkills && typeof gameMasterSkills === 'object') {
        Object.keys(gameMasterSkills).forEach(category => {
          const categorySkills = gameMasterSkills[category];
          if (Array.isArray(categorySkills)) {
            categorySkills.forEach(skill => {
              if (skill && skill.id && !profileData.experiences.gamemaster.skills[skill.id]) {
                profileData.experiences.gamemaster.skills[skill.id] = {
                  completed: false,
                  validatedBy: null,
                  validationDate: null,
                  adminComments: '',
                  selfAssessment: false
                };
              }
            });
          }
        });
      }
      
      // Sauvegarder la structure réparée
      await setDoc(doc(db, 'skillsAcquisition', userId), profileData);
      console.log('✅ Structure Game Master réparée');
      
      return profileData;
      
    } catch (error) {
      console.error('❌ Erreur réparation structure:', error);
      return profileData; // Retourner les données originales en cas d'erreur
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

      const currentSkill = profileResult.data.experiences.gamemaster?.skills?.[skillId];
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
   * 📝 Ajouter un suivi hebdomadaire Game Master
   */
  static async addWeeklyFollowUp(userId, experienceId, followUpData) {
    try {
      console.log('📝 Ajout suivi hebdomadaire Game Master...');
      
      // 🔧 CORRECTION: Utiliser une date normale au lieu de serverTimestamp()
      const followUp = {
        experienceId: 'gamemaster',
        week: this.getCurrentWeek(),
        date: new Date().toISOString(), // 🔧 Date normale
        timestamp: Date.now(), // Timestamp pour le tri
        ...followUpData
      };

      const updates = {
        weeklyFollowUps: arrayUnion(followUp),
        updatedAt: serverTimestamp() // 🔧 serverTimestamp() seulement ici
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      console.log('✅ Suivi hebdomadaire Game Master ajouté');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur ajout suivi hebdomadaire Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques Game Master - VERSION ULTRA-SÉCURISÉE
   */
  static calculateProfileStats(profile) {
    console.log('📊 Calcul stats Game Master');
    
    // 🔧 CORRECTION: Vérifications multiples
    if (!profile) {
      console.warn('⚠️ Profil null');
      return this.getDefaultStats();
    }
    
    if (!profile.experiences) {
      console.warn('⚠️ Pas d\'expériences');
      return this.getDefaultStats();
    }
    
    if (!profile.experiences.gamemaster) {
      console.warn('⚠️ Pas d\'expérience Game Master');
      return this.getDefaultStats();
    }

    const gameMasterExp = profile.experiences.gamemaster;
    
    if (!gameMasterExp.skills) {
      console.warn('⚠️ Pas de compétences Game Master');
      return this.getDefaultStats();
    }

    let totalSkills = 0;
    let validatedSkills = 0;
    let selfAssessedSkills = 0;

    // 🔧 CORRECTION: Compter toutes les compétences avec vérification
    Object.keys(gameMasterExp.skills).forEach(skillId => {
      const skill = gameMasterExp.skills[skillId];
      if (skill && typeof skill === 'object') {
        totalSkills++;
        
        if (skill.completed || skill.validatedBy) {
          validatedSkills++;
        }
        
        if (skill.selfAssessment) {
          selfAssessedSkills++;
        }
      }
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
   * 📊 Statistiques par défaut
   */
  static getDefaultStats() {
    return {
      totalExperiences: 1,
      completedExperiences: 0,
      totalSkills: 19, // Total des compétences Game Master
      validatedSkills: 0,
      selfAssessedSkills: 0,
      averageCompletionRate: 0,
      selfAssessmentRate: 0,
      badgesEarned: 0,
      weeklyFollowUps: 0,
      adminInterviews: 0,
      isGameMasterCertified: false
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
   * 🔍 Rechercher tous les profils Game Master (admin)
   */
  static async getAllSkillsProfiles() {
    try {
      console.log('🔍 Récupération tous profils Game Master...');
      
      const querySnapshot = await getDocs(collection(db, 'skillsAcquisition'));
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${profiles.length} profils Game Master récupérés`);
      return { success: true, profiles };

    } catch (error) {
      console.error('❌ Erreur récupération profils Game Master:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Validation admin d'une compétence
   */
  static async adminValidateSkill(userId, experienceId, skillId, adminId, validated, comments = '') {
    try {
      console.log('✅ Validation admin compétence:', skillId);
      
      const updatePath = `experiences.${experienceId}.skills.${skillId}`;
      const updates = {
        [`${updatePath}.completed`]: validated,
        [`${updatePath}.validatedBy`]: validated ? adminId : null,
        [`${updatePath}.validationDate`]: validated ? serverTimestamp() : null,
        [`${updatePath}.adminComments`]: comments,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      console.log('✅ Compétence validée par admin');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur validation admin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎤 Ajouter un entretien admin
   */
  static async addAdminInterview(userId, adminId, interviewData) {
    try {
      console.log('🎤 Ajout entretien admin...');
      
      const interview = {
        adminId,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        ...interviewData
      };

      const updates = {
        adminInterviews: arrayUnion(interview),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'skillsAcquisition', userId), updates);
      console.log('✅ Entretien admin ajouté');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur ajout entretien admin:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SkillsAcquisitionService;
