// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// Service Onboarding SÉCURISÉ - Exports corrigés
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

// ✅ IMPORT SÉCURISÉ avec try/catch
let db = null;
let gamificationService = null;

try {
  const firebaseModule = await import('../firebase.js');
  db = firebaseModule.db;
} catch (error) {
  console.warn('Firebase non disponible pour OnboardingService');
}

try {
  const gamificationModule = await import('./gamificationService.js');
  gamificationService = gamificationModule.gamificationService || gamificationModule.default;
} catch (error) {
  console.warn('GamificationService non disponible');
}

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
    autoValidation: false
  },

  // Phase Quiz Formation (Jours 2-4)
  QUIZ_APPRENTISSAGE: {
    id: 'quiz_apprentissage',
    phase: 'quiz_formation',
    title: 'Apprentissage Quiz Game',
    description: 'Comprendre le fonctionnement du Quiz Game',
    xpReward: 75,
    badge: 'quiz_apprenti',
    duration: 120,
    dayTarget: 2,
    autoValidation: false
  },
  QUIZ_PRATIQUE: {
    id: 'quiz_pratique',
    phase: 'quiz_formation',
    title: 'Pratique Quiz Game',
    description: 'Animer une session de Quiz Game en autonomie',
    xpReward: 100,
    badge: 'quiz_master',
    duration: 180,
    dayTarget: 4,
    autoValidation: false
  },

  // Phase Escape Formation (Jours 5-16)
  ESCAPE_APPRENTISSAGE: {
    id: 'escape_apprentissage',
    phase: 'escape_formation',
    title: 'Apprentissage Escape Game',
    description: 'Comprendre le fonctionnement de l\'Escape Game',
    xpReward: 100,
    badge: 'escape_apprenti',
    duration: 240,
    dayTarget: 5,
    autoValidation: false
  },
  ESCAPE_PRATIQUE: {
    id: 'escape_pratique',
    phase: 'escape_formation',
    title: 'Pratique Escape Game',
    description: 'Maîtriser une salle d\'Escape Game',
    xpReward: 150,
    badge: 'escape_master',
    duration: 300,
    dayTarget: 10,
    autoValidation: false
  },

  // Phase Autonomie (À partir du jour 17)
  AUTONOMIE_COMPLETE: {
    id: 'autonomie_complete',
    phase: 'autonomie',
    title: 'Autonomie complète',
    description: 'Travailler en totale autonomie',
    xpReward: 200,
    badge: 'autonome',
    duration: null,
    dayTarget: 17,
    autoValidation: false
  }
};

// Badges d'intégration
export const ONBOARDING_BADGES = {
  explorateur: {
    id: 'explorateur',
    name: 'Explorateur',
    description: 'A découvert tous les espaces de travail',
    icon: '🗺️',
    rarity: 'common'
  },
  membre_equipe: {
    id: 'membre_equipe',
    name: 'Membre d\'équipe',
    description: 'A rencontré toute l\'équipe',
    icon: '👥',
    rarity: 'common'
  },
  quiz_apprenti: {
    id: 'quiz_apprenti',
    name: 'Quiz Apprenti',
    description: 'A appris le Quiz Game',
    icon: '🧠',
    rarity: 'rare'
  },
  quiz_master: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Maîtrise le Quiz Game',
    icon: '🎯',
    rarity: 'epic'
  },
  escape_apprenti: {
    id: 'escape_apprenti',
    name: 'Escape Apprenti',
    description: 'A appris l\'Escape Game',
    icon: '🔐',
    rarity: 'rare'
  },
  escape_master: {
    id: 'escape_master',
    name: 'Escape Master',
    description: 'Maîtrise l\'Escape Game',
    icon: '🏆',
    rarity: 'epic'
  },
  autonome: {
    id: 'autonome',
    name: 'Autonome',
    description: 'Travaille en totale autonomie',
    icon: '⭐',
    rarity: 'legendary'
  }
};

/**
 * 📚 SERVICE D'INTÉGRATION SÉCURISÉ
 */
class OnboardingService {
  
  /**
   * 🚀 Créer un profil d'intégration
   */
  static async createOnboardingProfile(userId, personalInfo) {
    if (!db) {
      console.warn('Firebase non disponible');
      return { success: false, error: 'Firebase non disponible' };
    }

    try {
      const profile = {
        // Informations personnelles
        personalInfo: {
          firstName: personalInfo.firstName || '',
          lastName: personalInfo.lastName || '',
          email: personalInfo.email || '',
          startDate: personalInfo.startDate || new Date().toISOString().split('T')[0],
          position: personalInfo.position || '',
          department: personalInfo.department || '',
          mentor: personalInfo.mentor || null
        },
        
        // Progression des phases
        phases: {
          current: 'accueil',
          completed: [],
          timeline: [{
            phase: 'accueil',
            startDate: new Date().toISOString(),
            endDate: null,
            status: 'in_progress'
          }]
        },
        
        // Gamification
        gamification: {
          totalXP: 0,
          level: 1,
          badges: []
        },
        
        // Quêtes
        quests: {
          completed: [],
          available: Object.keys(ONBOARDING_QUESTS).filter(questId => 
            ONBOARDING_QUESTS[questId].phase === 'accueil'
          ),
          inProgress: []
        },
        
        // Feedback et notes
        feedback: {
          selfAssessment: [],
          managerNotes: [],
          peerFeedback: []
        },
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: '1.0'
      };
      
      const docRef = doc(db, 'onboarding', userId);
      await setDoc(docRef, profile);
      
      console.log('✅ Profil d\'intégration créé');
      return { success: true, profile };
      
    } catch (error) {
      console.error('❌ Erreur création profil:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📖 Récupérer le profil d'intégration
   */
  static async getOnboardingProfile(userId) {
    if (!db) {
      return { success: false, error: 'Firebase non disponible' };
    }

    try {
      const docRef = doc(db, 'onboarding', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, profile: docSnap.data() };
      } else {
        return { success: false, error: 'Profil non trouvé' };
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 📈 Obtenir les statistiques d'intégration
   */
  static async getOnboardingStats(userId) {
    if (!db) {
      return { success: false, error: 'Firebase non disponible' };
    }

    try {
      const profileResult = await this.getOnboardingProfile(userId);
      if (!profileResult.success) {
        return profileResult;
      }
      
      const profile = profileResult.profile;
      const stats = {
        questsCompleted: profile.quests.completed.length,
        totalQuests: Object.keys(ONBOARDING_QUESTS).length,
        xpEarned: profile.gamification.totalXP,
        badgesEarned: profile.gamification.badges.length,
        currentPhase: profile.phases.current,
        phasesCompleted: profile.phases.completed.length,
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
   * ✅ Compléter une quête
   */
  static async completeQuest(userId, questId, validatedBy, evidence) {
    if (!db) {
      return { success: false, error: 'Firebase non disponible' };
    }

    try {
      const profileResult = await this.getOnboardingProfile(userId);
      if (!profileResult.success) {
        return profileResult;
      }
      
      const profile = profileResult.profile;
      const quest = ONBOARDING_QUESTS[questId];
      
      if (!quest) {
        return { success: false, error: 'Quête non trouvée' };
      }
      
      // Ajouter la quête aux complétées
      const completedQuest = {
        questId,
        completedAt: new Date().toISOString(),
        validatedBy,
        evidence,
        xpEarned: quest.xpReward
      };
      
      const updatedQuests = {
        ...profile.quests,
        completed: [...profile.quests.completed, completedQuest],
        available: profile.quests.available.filter(id => id !== questId),
        inProgress: profile.quests.inProgress.filter(id => id !== questId)
      };
      
      // Mettre à jour XP
      const updatedGamification = {
        ...profile.gamification,
        totalXP: profile.gamification.totalXP + quest.xpReward
      };
      
      // Ajouter badge si applicable
      if (quest.badge && ONBOARDING_BADGES[quest.badge]) {
        const badge = {
          badgeId: quest.badge,
          earnedAt: new Date().toISOString(),
          questId
        };
        updatedGamification.badges = [...updatedGamification.badges, badge];
      }
      
      const docRef = doc(db, 'onboarding', userId);
      await updateDoc(docRef, {
        quests: updatedQuests,
        gamification: updatedGamification,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Quête complétée:', questId);
      return { success: true, xpEarned: quest.xpReward };
      
    } catch (error) {
      console.error('❌ Erreur complétion quête:', error);
      return { success: false, error: error.message };
    }
  }
}

// ✅ EXPORTS SÉCURISÉS
export { OnboardingService };
export default OnboardingService;

// 🚀 Logs de chargement
console.log('✅ OnboardingService chargé - Exports SÉCURISÉS');
console.log('📋 Phases disponibles:', Object.keys(ONBOARDING_PHASES).length);
console.log('🎯 Quêtes disponibles:', Object.keys(ONBOARDING_QUESTS).length);
console.log('🏆 Badges disponibles:', Object.keys(ONBOARDING_BADGES).length);
