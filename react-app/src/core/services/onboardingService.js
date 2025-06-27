// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// Service Onboarding COMPLET CORRIGÉ - Import Firebase réparé
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

// ✅ CORRECTION CRITIQUE : Import depuis le bon chemin
import { db } from '../firebase.js';
import { gamificationService } from './gamificationService.js';

// Définition des phases d'intégration
export const ONBOARDING_PHASES = {
  ACCUEIL: {
    id: 'accueil',
    name: 'Accueil',
    description: 'Découverte de l\'environnement de travail',
    duration: 1, // en jours
    color: '#8B5CF6',
    icon: '👋'
  },
  QUIZ_FORMATION: {
    id: 'quiz_formation',
    name: 'Formation Quiz Game',
    description: 'Apprentissage du Quiz Game',
    duration: 3,
    color: '#10B981',
    icon: '🧠'
  },
  ESCAPE_FORMATION: {
    id: 'escape_formation',
    name: 'Formation Escape Game',
    description: 'Maîtrise de l\'Escape Game',
    duration: 12,
    color: '#F59E0B',
    icon: '🔐'
  },
  AUTONOMIE: {
    id: 'autonomie',
    name: 'Autonomie & Expertise',
    description: 'Développement de l\'expertise',
    duration: null, // illimité
    color: '#EF4444',
    icon: '⭐'
  }
};

// Définition des quêtes d'intégration
export const ONBOARDING_QUESTS = {
  // Phase Accueil (Jour 1)
  VISITE_LOCAUX: {
    id: 'visite_locaux',
    phase: 'accueil',
    title: 'Visite des locaux',
    description: 'Tour complet des lieux avec explication des espaces',
    xpReward: 50,
    badge: 'explorateur',
    duration: 60, // minutes
    dayTarget: 1,
    autoValidation: false
  },
  PRESENTATION_EQUIPE: {
    id: 'presentation_equipe',
    phase: 'accueil',
    title: 'Présentation de l\'équipe',
    description: 'Rencontrer tous les membres et comprendre leurs rôles',
    xpReward: 30,
    badge: 'membre_equipe',
    duration: 45,
    dayTarget: 1,
    autoValidation: false
  },
  REGLEMENT_INTERIEUR: {
    id: 'reglement_interieur',
    phase: 'accueil',
    title: 'Règlement intérieur',
    description: 'Lecture et signature du règlement',
    xpReward: 20,
    badge: null,
    duration: 30,
    dayTarget: 1,
    autoValidation: true
  },
  PROCEDURES_SECURITE: {
    id: 'procedures_securite',
    phase: 'accueil',
    title: 'Procédures & Sécurité',
    description: 'Consultation du dossier de prévention',
    xpReward: 15,
    badge: null,
    duration: 20,
    dayTarget: 1,
    autoValidation: true
  },
  
  // Phase Quiz Formation (Jours 2-4)
  FORMATION_QUIZ_THEORIQUE: {
    id: 'formation_quiz_theorique',
    phase: 'quiz_formation',
    title: 'Formation théorique Quiz Game',
    description: 'Apprendre les règles et mécaniques du Quiz Game',
    xpReward: 75,
    badge: 'etudiant',
    duration: 120,
    dayTarget: 2,
    autoValidation: false
  },
  PRATIQUE_QUIZ_SUPERVISE: {
    id: 'pratique_quiz_supervise',
    phase: 'quiz_formation',
    title: 'Pratique supervisée Quiz',
    description: 'Animer des quiz sous supervision',
    xpReward: 100,
    badge: 'apprenti_animateur',
    duration: 180,
    dayTarget: 3,
    autoValidation: false
  },
  AUTONOMIE_QUIZ: {
    id: 'autonomie_quiz',
    phase: 'quiz_formation',
    title: 'Autonomie Quiz Game',
    description: 'Animer des quiz en autonomie complète',
    xpReward: 150,
    badge: 'quiz_master',
    duration: 240,
    dayTarget: 4,
    autoValidation: false
  },
  
  // Phase Escape Formation (Jours 5-16)
  FORMATION_ESCAPE_THEORIQUE: {
    id: 'formation_escape_theorique',
    phase: 'escape_formation',
    title: 'Formation théorique Escape Game',
    description: 'Comprendre les mécaniques et scénarios',
    xpReward: 125,
    badge: 'explorateur_debutant',
    duration: 240,
    dayTarget: 5,
    autoValidation: false
  },
  ASSISTANCE_ESCAPE: {
    id: 'assistance_escape',
    phase: 'escape_formation',
    title: 'Assistance Escape Games',
    description: 'Assister et observer les sessions',
    xpReward: 100,
    badge: 'observateur',
    duration: 300,
    dayTarget: 8,
    autoValidation: false
  },
  ANIMATION_ESCAPE_SUPERVISE: {
    id: 'animation_escape_supervise',
    phase: 'escape_formation',
    title: 'Animation supervisée Escape',
    description: 'Animer sous supervision experte',
    xpReward: 200,
    badge: 'apprenti_maitre_jeu',
    duration: 360,
    dayTarget: 12,
    autoValidation: false
  },
  MAITRISE_ESCAPE: {
    id: 'maitrise_escape',
    phase: 'escape_formation',
    title: 'Maîtrise Escape Game',
    description: 'Animation autonome et expert',
    xpReward: 300,
    badge: 'maitre_jeu',
    duration: 480,
    dayTarget: 16,
    autoValidation: false
  },
  
  // Phase Autonomie (Illimitée)
  INNOVATION_SCENARIO: {
    id: 'innovation_scenario',
    phase: 'autonomie',
    title: 'Innovation & Création',
    description: 'Créer de nouveaux scénarios et mécaniques',
    xpReward: 500,
    badge: 'innovateur',
    duration: null,
    dayTarget: null,
    autoValidation: false
  },
  FORMATION_COLLEGUES: {
    id: 'formation_collegues',
    phase: 'autonomie',
    title: 'Formation Collègues',
    description: 'Former et encadrer les nouveaux arrivants',
    xpReward: 400,
    badge: 'mentor',
    duration: null,
    dayTarget: null,
    autoValidation: false
  }
};

// Badges d'onboarding disponibles
export const ONBOARDING_BADGES = {
  explorateur: {
    id: 'explorateur',
    name: 'Explorateur',
    description: 'Première découverte des lieux',
    icon: '🗺️',
    color: '#6366F1',
    rarity: 'common'
  },
  membre_equipe: {
    id: 'membre_equipe',
    name: 'Membre d\'Équipe',
    description: 'Intégration sociale réussie',
    icon: '👥',
    color: '#10B981',
    rarity: 'common'
  },
  etudiant: {
    id: 'etudiant',
    name: 'Étudiant Appliqué',
    description: 'Formation théorique terminée',
    icon: '📚',
    color: '#3B82F6',
    rarity: 'common'
  },
  apprenti_animateur: {
    id: 'apprenti_animateur',
    name: 'Apprenti Animateur',
    description: 'Premières animations sous supervision',
    icon: '🎭',
    color: '#8B5CF6',
    rarity: 'uncommon'
  },
  quiz_master: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Maîtrise complète du Quiz Game',
    icon: '🧠',
    color: '#F59E0B',
    rarity: 'rare'
  },
  explorateur_debutant: {
    id: 'explorateur_debutant',
    name: 'Explorateur Débutant',
    description: 'Initiation à l\'Escape Game',
    icon: '🔍',
    color: '#06B6D4',
    rarity: 'uncommon'
  },
  observateur: {
    id: 'observateur',
    name: 'Observateur Expert',
    description: 'Analyse fine des mécaniques',
    icon: '👁️',
    color: '#84CC16',
    rarity: 'uncommon'
  },
  apprenti_maitre_jeu: {
    id: 'apprenti_maitre_jeu',
    name: 'Apprenti Maître du Jeu',
    description: 'Animation supervisée réussie',
    icon: '🎮',
    color: '#F97316',
    rarity: 'rare'
  },
  maitre_jeu: {
    id: 'maitre_jeu',
    name: 'Maître du Jeu',
    description: 'Expertise complète en Escape Game',
    icon: '👑',
    color: '#DC2626',
    rarity: 'epic'
  },
  innovateur: {
    id: 'innovateur',
    name: 'Innovateur',
    description: 'Création de nouveaux contenus',
    icon: '💡',
    color: '#7C3AED',
    rarity: 'legendary'
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Guide pour les nouveaux arrivants',
    icon: '🌟',
    color: '#EF4444',
    rarity: 'legendary'
  }
};

// Service principal d'onboarding
export class OnboardingService {
  
  /**
   * 📋 Créer le profil d'onboarding pour un nouveau membre
   */
  static async createOnboardingProfile(userId, userData = {}) {
    try {
      const onboardingProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Informations personnelles
        personalInfo: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          startDate: userData.startDate || new Date().toISOString().split('T')[0],
          position: userData.position || '',
          department: userData.department || '',
          manager: userData.manager || ''
        },
        
        // Progression phases
        phases: {
          current: 'accueil',
          completed: [],
          progress: {
            accueil: { started: true, completed: false, startDate: new Date().toISOString(), endDate: null },
            quiz_formation: { started: false, completed: false, startDate: null, endDate: null },
            escape_formation: { started: false, completed: false, startDate: null, endDate: null },
            autonomie: { started: false, completed: false, startDate: null, endDate: null }
          }
        },
        
        // Quêtes et progression
        quests: {
          completed: [],
          inProgress: [],
          unlocked: Object.keys(ONBOARDING_QUESTS).filter(questId => 
            ONBOARDING_QUESTS[questId].phase === 'accueil'
          )
        },
        
        // Gamification
        gamification: {
          totalXP: 0,
          badgesEarned: [],
          level: 1,
          currentPhaseXP: 0
        },
        
        // Feedback et évaluations
        feedback: {
          managerNotes: [],
          selfAssessments: [],
          peerReviews: []
        },
        
        // Métriques
        metrics: {
          totalDaysActive: 0,
          averageQuestCompletionTime: 0,
          satisfactionScore: null,
          integrationScore: 0
        },

        // Validations
        validations: []
      };
      
      const docRef = doc(db, 'onboarding', userId);
      await setDoc(docRef, onboardingProfile);
      
      console.log('✅ Profil onboarding créé pour:', userId);
      return { success: true, profileId: userId };
      
    } catch (error) {
      console.error('❌ Erreur création profil onboarding:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📊 Récupérer le profil d'onboarding
   */
  static async getOnboardingProfile(userId) {
    try {
      const docRef = doc(db, 'onboarding', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, profile: docSnap.data() };
      } else {
        console.warn('⚠️ Profil onboarding non trouvé pour:', userId);
        return { success: false, error: 'Profil non trouvé' };
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération profil onboarding:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 🎯 Valider une quête et mettre à jour la progression
   */
  static async completeQuest(userId, questId, validatorId = null, notes = '') {
    try {
      const quest = ONBOARDING_QUESTS[questId];
      if (!quest) {
        throw new Error(`Quête ${questId} non trouvée`);
      }
      
      const profileResult = await this.getOnboardingProfile(userId);
      if (!profileResult.success) {
        throw new Error('Profil onboarding non trouvé');
      }
      
      const profile = profileResult.profile;
      const now = new Date().toISOString();
      
      // Mettre à jour les quêtes
      const updatedProfile = {
        ...profile,
        updatedAt: serverTimestamp(),
        quests: {
          ...profile.quests,
          completed: [...profile.quests.completed, questId],
          inProgress: profile.quests.inProgress.filter(id => id !== questId)
        },
        gamification: {
          ...profile.gamification,
          totalXP: profile.gamification.totalXP + quest.xpReward,
          currentPhaseXP: profile.gamification.currentPhaseXP + quest.xpReward
        }
      };
      
      // Ajouter badge si applicable
      if (quest.badge && !profile.gamification.badgesEarned.includes(quest.badge)) {
        updatedProfile.gamification.badgesEarned.push(quest.badge);
      }
      
      // Enregistrer la validation
      const validation = {
        questId,
        completedAt: now,
        validatorId,
        notes,
        xpAwarded: quest.xpReward
      };
      
      updatedProfile.validations = [...(profile.validations || []), validation];
      
      // Sauvegarder
      const docRef = doc(db, 'onboarding', userId);
      await updateDoc(docRef, updatedProfile);
      
      // Synchroniser avec le système de gamification principal
      if (gamificationService && typeof gamificationService.addExperience === 'function') {
        await gamificationService.addExperience(userId, quest.xpReward, `Quête: ${quest.title}`);
      }
      
      console.log(`✅ Quête ${questId} validée pour ${userId} (+${quest.xpReward} XP)`);
      return { success: true, xpAwarded: quest.xpReward, badge: quest.badge };
      
    } catch (error) {
      console.error('❌ Erreur validation quête:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 🔄 Passer à la phase suivante
   */
  static async advanceToNextPhase(userId, currentPhase) {
    try {
      const phaseOrder = ['accueil', 'quiz_formation', 'escape_formation', 'autonomie'];
      const currentIndex = phaseOrder.indexOf(currentPhase);
      const nextPhase = phaseOrder[currentIndex + 1];
      
      if (!nextPhase) {
        console.log('🎉 Toutes les phases complétées!');
        return { success: true, completed: true };
      }
      
      const profileResult = await this.getOnboardingProfile(userId);
      if (!profileResult.success) {
        throw new Error('Profil non trouvé');
      }
      
      const profile = profileResult.profile;
      const now = new Date().toISOString();
      
      // Mettre à jour les phases
      const updatedPhases = {
        ...profile.phases,
        current: nextPhase,
        completed: [...profile.phases.completed, currentPhase],
        progress: {
          ...profile.phases.progress,
          [currentPhase]: {
            ...profile.phases.progress[currentPhase],
            completed: true,
            endDate: now
          },
          [nextPhase]: {
            ...profile.phases.progress[nextPhase],
            started: true,
            startDate: now
          }
        }
      };
      
      // Débloquer les quêtes de la nouvelle phase
      const newQuests = Object.keys(ONBOARDING_QUESTS).filter(questId => 
        ONBOARDING_QUESTS[questId].phase === nextPhase
      );
      
      const updatedQuests = {
        ...profile.quests,
        unlocked: [...profile.quests.unlocked, ...newQuests]
      };
      
      // Sauvegarder
      const docRef = doc(db, 'onboarding', userId);
      await updateDoc(docRef, {
        phases: updatedPhases,
        quests: updatedQuests,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Progression vers phase: ${nextPhase}`);
      return { success: true, newPhase: nextPhase, unlockedQuests: newQuests };
      
    } catch (error) {
      console.error('❌ Erreur progression phase:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📈 Obtenir les statistiques d'onboarding
   */
  static async getOnboardingStats(userId) {
    try {
      const profileResult = await this.getOnboardingProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil non trouvé' };
      }
      
      const profile = profileResult.profile;
      const totalQuests = Object.keys(ONBOARDING_QUESTS).length;
      const completedQuests = profile.quests.completed.length;
      const progressPercent = Math.round((completedQuests / totalQuests) * 100);
      
      const stats = {
        currentPhase: profile.phases.current,
        totalXP: profile.gamification.totalXP,
        badgesCount: profile.gamification.badgesEarned.length,
        questsCompleted: completedQuests,
        totalQuests,
        progressPercent,
        daysSinceStart: profile.personalInfo.startDate ? 
          Math.floor((new Date() - new Date(profile.personalInfo.startDate)) / (1000 * 60 * 60 * 24)) : 0
      };
      
      return { success: true, stats };
      
    } catch (error) {
      console.error('❌ Erreur statistiques onboarding:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 👥 Récupérer tous les profils d'onboarding (pour managers)
   */
  static async getAllOnboardingProfiles() {
    try {
      const querySnapshot = await getDocs(collection(db, 'onboarding'));
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, profiles };
      
    } catch (error) {
      console.error('❌ Erreur récupération profils onboarding:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📝 Ajouter feedback manager
   */
  static async addManagerFeedback(userId, managerId, feedback) {
    try {
      const profileResult = await this.getOnboardingProfile(userId);
      if (!profileResult.success) {
        throw new Error('Profil non trouvé');
      }
      
      const profile = profileResult.profile;
      const newFeedback = {
        id: Date.now().toString(),
        managerId,
        content: feedback.content,
        rating: feedback.rating,
        date: new Date().toISOString(),
        phase: profile.phases.current
      };
      
      const updatedFeedback = {
        ...profile.feedback,
        managerNotes: [...profile.feedback.managerNotes, newFeedback]
      };
      
      const docRef = doc(db, 'onboarding', userId);
      await updateDoc(docRef, {
        feedback: updatedFeedback,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Feedback manager ajouté');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur ajout feedback:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export par défaut
export default OnboardingService;

// 🚀 Logs de chargement
console.log('✅ OnboardingService chargé - Import Firebase CORRIGÉ');
console.log('📋 Phases disponibles:', Object.keys(ONBOARDING_PHASES));
console.log('🎯 Quêtes disponibles:', Object.keys(ONBOARDING_QUESTS).length);
console.log('🏆 Badges disponibles:', Object.keys(ONBOARDING_BADGES).length);
