// react-app/src/core/services/onboardingService.js

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
import { db } from '../config/firebase';
import { gamificationService } from './gamificationService';

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
    description: 'Consultation du dossier de procédures',
    xpReward: 40,
    badge: 'gardien_securite',
    duration: 90,
    dayTarget: 1,
    autoValidation: true
  },
  DECOUVERTE_4ESCAPE: {
    id: 'decouverte_4escape',
    phase: 'accueil',
    title: 'Découverte 4Escape',
    description: 'Apprentissage du système de gestion',
    xpReward: 60,
    badge: 'initie',
    duration: 120,
    dayTarget: 1,
    autoValidation: false
  },

  // Phase Quiz Formation (J+1 à J+3)
  QUIZ_EXPLICATIONS: {
    id: 'quiz_explications',
    phase: 'quiz_formation',
    title: 'Quiz Game - Explications',
    description: 'Comprendre le fonctionnement du Quiz Game',
    xpReward: 80,
    badge: 'apprenti_quiz_master',
    duration: 180,
    dayTarget: 2,
    autoValidation: false
  },
  QUIZ_SHADOW_1: {
    id: 'quiz_shadow_1',
    phase: 'quiz_formation',
    title: 'Quiz Game - Shadow Session 1',
    description: 'Observer une première session de Quiz',
    xpReward: 60,
    badge: null,
    duration: 90,
    dayTarget: 2,
    autoValidation: false
  },
  QUIZ_SHADOW_2: {
    id: 'quiz_shadow_2',
    phase: 'quiz_formation',
    title: 'Quiz Game - Shadow Session 2',
    description: 'Observer une seconde session de Quiz',
    xpReward: 60,
    badge: 'observateur',
    duration: 90,
    dayTarget: 2,
    autoValidation: false
  },
  QUIZ_EXERCICES: {
    id: 'quiz_exercices',
    phase: 'quiz_formation',
    title: 'Quiz Game - Exercices',
    description: 'Pratique des briefings et débriefings',
    xpReward: 100,
    badge: null,
    duration: 120,
    dayTarget: 2,
    autoValidation: false
  },
  QUIZ_SESSION_ENCADREE: {
    id: 'quiz_session_encadree',
    phase: 'quiz_formation',
    title: 'Quiz Game - Session encadrée',
    description: 'Première session de Quiz sous supervision',
    xpReward: 150,
    badge: 'quiz_master',
    duration: 90,
    dayTarget: 3,
    autoValidation: false
  },
  QUIZ_VALIDE: {
    id: 'quiz_valide',
    phase: 'quiz_formation',
    title: 'Quiz Game - Validé',
    description: 'Autonomie complète sur le Quiz Game',
    xpReward: 200,
    badge: 'quiz_master_certifie',
    duration: 0,
    dayTarget: 4,
    autoValidation: false
  },

  // Phase Escape Formation (J+2 à J+14)
  ESCAPE_EXPLICATIONS: {
    id: 'escape_explications',
    phase: 'escape_formation',
    title: 'Escape Game - Explications',
    description: 'Méthodologie et valeurs du Game Master',
    xpReward: 100,
    badge: 'apprenti_game_master',
    duration: 240,
    dayTarget: 3,
    autoValidation: false
  },
  ESCAPE_SHADOW_1: {
    id: 'escape_shadow_1',
    phase: 'escape_formation',
    title: 'Escape Game - Shadow Session 1',
    description: 'Observer un GM expérimenté',
    xpReward: 80,
    badge: null,
    duration: 120,
    dayTarget: 4,
    autoValidation: false
  },
  ESCAPE_SHADOW_2: {
    id: 'escape_shadow_2',
    phase: 'escape_formation',
    title: 'Escape Game - Shadow Session 2',
    description: 'Deuxième observation avec prise de notes',
    xpReward: 80,
    badge: null,
    duration: 120,
    dayTarget: 7,
    autoValidation: false
  },
  ESCAPE_SHADOW_3: {
    id: 'escape_shadow_3',
    phase: 'escape_formation',
    title: 'Escape Game - Shadow Session 3',
    description: 'Troisième observation avec participation',
    xpReward: 80,
    badge: 'observateur_expert',
    duration: 120,
    dayTarget: 10,
    autoValidation: false
  },
  ESCAPE_EXERCICES: {
    id: 'escape_exercices',
    phase: 'escape_formation',
    title: 'Escape Game - Exercices',
    description: 'Acting, immersion, gestion de groupes',
    xpReward: 150,
    badge: 'acteur_immersion',
    duration: 300,
    dayTarget: 10,
    autoValidation: false
  },
  ESCAPE_SESSION_ENCADREE: {
    id: 'escape_session_encadree',
    phase: 'escape_formation',
    title: 'Escape Game - Session encadrée',
    description: 'Première session Escape sous supervision',
    xpReward: 250,
    badge: 'game_master_novice',
    duration: 120,
    dayTarget: 12,
    autoValidation: false
  },
  ESCAPE_VALIDE: {
    id: 'escape_valide',
    phase: 'escape_formation',
    title: 'Escape Game - Validé',
    description: 'Autonomie complète sur une salle minimum',
    xpReward: 300,
    badge: 'game_master_certifie',
    duration: 0,
    dayTarget: 15,
    autoValidation: false
  },

  // Phase Formation Supplémentaire
  FORMATION_MENAGE: {
    id: 'formation_menage',
    phase: 'autonomie',
    title: 'Formation - Ménage',
    description: 'Organisation et nettoyage du local',
    xpReward: 30,
    badge: null,
    duration: 60,
    dayTarget: 4,
    autoValidation: true
  },
  FORMATION_OUVERTURE_FERMETURE: {
    id: 'formation_ouverture_fermeture',
    phase: 'autonomie',
    title: 'Formation - Ouverture/Fermeture',
    description: 'Procédures d\'ouverture et fermeture',
    xpReward: 50,
    badge: 'gardien_local',
    duration: 90,
    dayTarget: 8,
    autoValidation: false
  },
  FORMATION_RESERVATIONS: {
    id: 'formation_reservations',
    phase: 'autonomie',
    title: 'Formation - Réservations',
    description: 'Gestion téléphone et réservations',
    xpReward: 70,
    badge: 'ambassadeur_client',
    duration: 120,
    dayTarget: 15,
    autoValidation: false
  },

  // Phase Autonomie & Expertise
  AUTONOMIE_PARTIELLE: {
    id: 'autonomie_partielle',
    phase: 'autonomie',
    title: 'Autonomie partielle',
    description: '2 salles + Quiz + présence locale',
    xpReward: 200,
    badge: 'game_master_independant',
    duration: 0,
    dayTarget: 22,
    autoValidation: false
  },
  AUTONOMIE_TOTALE: {
    id: 'autonomie_totale',
    phase: 'autonomie',
    title: 'Autonomie totale',
    description: 'GM officiel avec confiance complète',
    xpReward: 500,
    badge: 'game_master_expert',
    duration: 0,
    dayTarget: 45,
    autoValidation: false
  }
};

// Badges spécifiques à l'intégration
export const ONBOARDING_BADGES = {
  explorateur: {
    id: 'explorateur',
    name: 'Explorateur',
    description: 'A découvert tous les recoins du local',
    icon: '🗺️',
    color: '#8B5CF6',
    rarity: 'common'
  },
  membre_equipe: {
    id: 'membre_equipe',
    name: 'Membre de l\'équipe',
    description: 'Fait maintenant partie de la famille',
    icon: '👥',
    color: '#10B981',
    rarity: 'common'
  },
  gardien_securite: {
    id: 'gardien_securite',
    name: 'Gardien de la sécurité',
    description: 'Connaît toutes les procédures de sécurité',
    icon: '🛡️',
    color: '#EF4444',
    rarity: 'uncommon'
  },
  initie: {
    id: 'initie',
    name: 'Initié',
    description: 'Maîtrise le système 4Escape',
    icon: '🔮',
    color: '#8B5CF6',
    rarity: 'common'
  },
  apprenti_quiz_master: {
    id: 'apprenti_quiz_master',
    name: 'Apprenti Quiz Master',
    description: 'Premiers pas dans l\'univers du Quiz',
    icon: '🧠',
    color: '#3B82F6',
    rarity: 'common'
  },
  observateur: {
    id: 'observateur',
    name: 'Observateur',
    description: 'Œil attentif et apprentissage actif',
    icon: '👁️',
    color: '#6B7280',
    rarity: 'common'
  },
  quiz_master: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Capable d\'animer une session de Quiz',
    icon: '🎯',
    color: '#10B981',
    rarity: 'rare'
  },
  quiz_master_certifie: {
    id: 'quiz_master_certifie',
    name: 'Quiz Master Certifié',
    description: 'Autonomie complète sur le Quiz Game',
    icon: '🏆',
    color: '#F59E0B',
    rarity: 'epic'
  },
  apprenti_game_master: {
    id: 'apprenti_game_master',
    name: 'Apprenti Game Master',
    description: 'En formation pour devenir GM',
    icon: '🎭',
    color: '#8B5CF6',
    rarity: 'common'
  },
  observateur_expert: {
    id: 'observateur_expert',
    name: 'Observateur Expert',
    description: 'Maîtrise l\'art de l\'observation',
    icon: '🔍',
    color: '#6B7280',
    rarity: 'uncommon'
  },
  acteur_immersion: {
    id: 'acteur_immersion',
    name: 'Acteur d\'immersion',
    description: 'Excelle dans l\'acting et l\'immersion',
    icon: '🎪',
    color: '#EC4899',
    rarity: 'rare'
  },
  game_master_novice: {
    id: 'game_master_novice',
    name: 'Game Master Novice',
    description: 'Première session Escape réussie',
    icon: '🌟',
    color: '#10B981',
    rarity: 'rare'
  },
  game_master_certifie: {
    id: 'game_master_certifie',
    name: 'Game Master Certifié',
    description: 'Autonomie sur les Escape Games',
    icon: '👑',
    color: '#F59E0B',
    rarity: 'epic'
  },
  gardien_local: {
    id: 'gardien_local',
    name: 'Gardien du local',
    description: 'Responsable de l\'ouverture/fermeture',
    icon: '🔑',
    color: '#6B7280',
    rarity: 'uncommon'
  },
  ambassadeur_client: {
    id: 'ambassadeur_client',
    name: 'Ambassadeur Client',
    description: 'Expert en relation client et réservations',
    icon: '📞',
    color: '#3B82F6',
    rarity: 'rare'
  },
  game_master_independant: {
    id: 'game_master_independant',
    name: 'Game Master Indépendant',
    description: 'Autonomie partielle acquise',
    icon: '🚀',
    color: '#8B5CF6',
    rarity: 'epic'
  },
  game_master_expert: {
    id: 'game_master_expert',
    name: 'Game Master Expert',
    description: 'Maîtrise complète et autonomie totale',
    icon: '💎',
    color: '#EF4444',
    rarity: 'legendary'
  }
};

class OnboardingService {
  
  // Créer un parcours d'intégration pour un nouvel utilisateur
  async createOnboardingJourney(userId, userEmail, startDate = new Date()) {
    try {
      const onboardingRef = doc(db, 'onboarding', userId);
      
      const onboardingData = {
        userId,
        userEmail,
        startDate: startDate,
        currentPhase: 'accueil',
        completedQuests: [],
        totalXpEarned: 0,
        totalBadgesEarned: 0,
        progressPercentage: 0,
        estimatedCompletionDate: this.calculateEstimatedCompletion(startDate),
        status: 'active', // active, completed, paused
        mentorId: null,
        notes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(onboardingRef, onboardingData);
      
      // Créer les quêtes pour la première phase
      await this.initializePhaseQuests(userId, 'accueil');
      
      return onboardingData;
    } catch (error) {
      console.error('Erreur création parcours intégration:', error);
      throw error;
    }
  }

  // Initialiser les quêtes d'une phase
  async initializePhaseQuests(userId, phase) {
    try {
      const phaseQuests = Object.values(ONBOARDING_QUESTS)
        .filter(quest => quest.phase === phase);

      const batch = [];
      
      for (const quest of phaseQuests) {
        const questRef = doc(db, 'onboardingQuests', `${userId}_${quest.id}`);
        const questData = {
          ...quest,
          userId,
          status: 'available', // available, in_progress, completed, locked
          progress: 0,
          startedAt: null,
          completedAt: null,
          validatedBy: null,
          notes: '',
          isLocked: quest.dayTarget > 1, // Verrouiller les quêtes futures
          createdAt: serverTimestamp()
        };
        
        batch.push({ ref: questRef, data: questData });
      }

      // Traitement par batch de 10 (limite Firestore)
      for (let i = 0; i < batch.length; i += 10) {
        const batchSlice = batch.slice(i, i + 10);
        await Promise.all(
          batchSlice.map(item => setDoc(item.ref, item.data))
        );
      }

    } catch (error) {
      console.error('Erreur initialisation quêtes phase:', error);
      throw error;
    }
  }

  // Démarrer une quête
  async startQuest(userId, questId) {
    try {
      const questRef = doc(db, 'onboardingQuests', `${userId}_${questId}`);
      const questDoc = await getDoc(questRef);
      
      if (!questDoc.exists()) {
        throw new Error('Quête non trouvée');
      }

      const questData = questDoc.data();
      
      if (questData.status !== 'available' || questData.isLocked) {
        throw new Error('Quête non disponible');
      }

      await updateDoc(questRef, {
        status: 'in_progress',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, message: 'Quête démarrée' };
    } catch (error) {
      console.error('Erreur démarrage quête:', error);
      throw error;
    }
  }

  // Compléter une quête
  async completeQuest(userId, questId, validatedBy = null, notes = '') {
    try {
      const questRef = doc(db, 'onboardingQuests', `${userId}_${questId}`);
      const questDoc = await getDoc(questRef);
      
      if (!questDoc.exists()) {
        throw new Error('Quête non trouvée');
      }

      const questData = questDoc.data();
      const quest = ONBOARDING_QUESTS[questId];
      
      if (!quest) {
        throw new Error('Définition de quête non trouvée');
      }

      // Mettre à jour la quête
      await updateDoc(questRef, {
        status: 'completed',
        progress: 100,
        completedAt: serverTimestamp(),
        validatedBy: validatedBy || 'auto',
        notes: notes,
        updatedAt: serverTimestamp()
      });

      // Donner XP
      await gamificationService.awardXP(userId, quest.xpReward, `Quête complétée: ${quest.title}`);

      // Donner badge si applicable
      if (quest.badge && ONBOARDING_BADGES[quest.badge]) {
        await gamificationService.awardBadge(userId, quest.badge);
      }

      // Mettre à jour le parcours d'intégration
      await this.updateOnboardingProgress(userId);

      // Déverrouiller les prochaines quêtes
      await this.unlockNextQuests(userId, questData.phase);

      return { 
        success: true, 
        xpEarned: quest.xpReward,
        badgeEarned: quest.badge ? ONBOARDING_BADGES[quest.badge] : null
      };
    } catch (error) {
      console.error('Erreur completion quête:', error);
      throw error;
    }
  }

  // Mettre à jour la progression globale
  async updateOnboardingProgress(userId) {
    try {
      const onboardingRef = doc(db, 'onboarding', userId);
      
      // Récupérer toutes les quêtes de l'utilisateur
      const questsQuery = query(
        collection(db, 'onboardingQuests'),
        where('userId', '==', userId)
      );
      
      const questsSnapshot = await getDocs(questsQuery);
      const quests = questsSnapshot.docs.map(doc => doc.data());
      
      const totalQuests = quests.length;
      const completedQuests = quests.filter(q => q.status === 'completed');
      const progressPercentage = Math.round((completedQuests.length / totalQuests) * 100);
      
      const totalXpEarned = completedQuests.reduce((total, quest) => {
        const questDef = ONBOARDING_QUESTS[quest.id];
        return total + (questDef?.xpReward || 0);
      }, 0);

      const totalBadgesEarned = completedQuests.filter(quest => {
        const questDef = ONBOARDING_QUESTS[quest.id];
        return questDef?.badge;
      }).length;

      // Déterminer la phase actuelle
      const currentPhase = this.determineCurrentPhase(completedQuests);

      await updateDoc(onboardingRef, {
        completedQuests: completedQuests.map(q => q.id),
        totalXpEarned,
        totalBadgesEarned,
        progressPercentage,
        currentPhase,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Erreur mise à jour progression:', error);
      throw error;
    }
  }

  // Déterminer la phase actuelle basée sur les quêtes complétées
  determineCurrentPhase(completedQuests) {
    const completedIds = completedQuests.map(q => q.id);
    
    // Vérifier si toutes les quêtes d'autonomie sont complétées
    const autonomieQuests = Object.keys(ONBOARDING_QUESTS).filter(id => 
      ONBOARDING_QUESTS[id].phase === 'autonomie'
    );
    if (autonomieQuests.every(id => completedIds.includes(id))) {
      return 'completed';
    }
    
    // Vérifier si toutes les quêtes d'escape sont complétées
    const escapeQuests = Object.keys(ONBOARDING_QUESTS).filter(id => 
      ONBOARDING_QUESTS[id].phase === 'escape_formation'
    );
    if (escapeQuests.every(id => completedIds.includes(id))) {
      return 'autonomie';
    }
    
    // Vérifier si toutes les quêtes de quiz sont complétées
    const quizQuests = Object.keys(ONBOARDING_QUESTS).filter(id => 
      ONBOARDING_QUESTS[id].phase === 'quiz_formation'
    );
    if (quizQuests.every(id => completedIds.includes(id))) {
      return 'escape_formation';
    }
    
    // Vérifier si toutes les quêtes d'accueil sont complétées
    const accueilQuests = Object.keys(ONBOARDING_QUESTS).filter(id => 
      ONBOARDING_QUESTS[id].phase === 'accueil'
    );
    if (accueilQuests.every(id => completedIds.includes(id))) {
      return 'quiz_formation';
    }
    
    return 'accueil';
  }

  // Déverrouiller les prochaines quêtes
  async unlockNextQuests(userId, currentPhase) {
    try {
      const today = new Date();
      const startDate = await this.getUserStartDate(userId);
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Récupérer toutes les quêtes verrouillées de l'utilisateur
      const questsQuery = query(
        collection(db, 'onboardingQuests'),
        where('userId', '==', userId),
        where('isLocked', '==', true)
      );
      
      const questsSnapshot = await getDocs(questsQuery);
      
      for (const questDoc of questsSnapshot.docs) {
        const questData = questDoc.data();
        const quest = ONBOARDING_QUESTS[questData.id];
        
        if (quest && quest.dayTarget <= daysSinceStart) {
          await updateDoc(questDoc.ref, {
            isLocked: false,
            status: 'available',
            updatedAt: serverTimestamp()
          });
        }
      }

      // Si on change de phase, créer les quêtes de la nouvelle phase
      const nextPhase = this.getNextPhase(currentPhase);
      if (nextPhase) {
        await this.initializePhaseQuests(userId, nextPhase);
      }

    } catch (error) {
      console.error('Erreur déverrouillage quêtes:', error);
      throw error;
    }
  }

  // Obtenir la phase suivante
  getNextPhase(currentPhase) {
    const phases = ['accueil', 'quiz_formation', 'escape_formation', 'autonomie'];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  }

  // Récupérer la date de début d'un utilisateur
  async getUserStartDate(userId) {
    try {
      const onboardingDoc = await getDoc(doc(db, 'onboarding', userId));
      if (onboardingDoc.exists()) {
        return onboardingDoc.data().startDate.toDate();
      }
      return new Date();
    } catch (error) {
      console.error('Erreur récupération date début:', error);
      return new Date();
    }
  }

  // Calculer la date estimée de fin
  calculateEstimatedCompletion(startDate) {
    const estimatedDays = 45; // 45 jours pour un parcours complet
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + estimatedDays);
    return completionDate;
  }

  // Récupérer le parcours d'intégration d'un utilisateur
  async getOnboardingJourney(userId) {
    try {
      const onboardingDoc = await getDoc(doc(db, 'onboarding', userId));
      
      if (!onboardingDoc.exists()) {
        return null;
      }

      const onboardingData = onboardingDoc.data();
      
      // Récupérer les quêtes
      const questsQuery = query(
        collection(db, 'onboardingQuests'),
        where('userId', '==', userId),
        orderBy('dayTarget', 'asc')
      );
      
      const questsSnapshot = await getDocs(questsQuery);
      const quests = questsSnapshot.docs.map(doc => ({ 
        firestoreId: doc.id,
        ...doc.data() 
      }));

      return {
        ...onboardingData,
        quests
      };
    } catch (error) {
      console.error('Erreur récupération parcours:', error);
      throw error;
    }
  }

  // Récupérer tous les parcours d'intégration (pour les mentors)
  async getAllOnboardingJourneys() {
    try {
      const onboardingQuery = query(
        collection(db, 'onboarding'),
        orderBy('startDate', 'desc')
      );
      
      const snapshot = await getDocs(onboardingQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur récupération tous les parcours:', error);
      throw error;
    }
  }

  // Assigner un mentor
  async assignMentor(userId, mentorId) {
    try {
      const onboardingRef = doc(db, 'onboarding', userId);
      await updateDoc(onboardingRef, {
        mentorId,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Mentor assigné' };
    } catch (error) {
      console.error('Erreur assignation mentor:', error);
      throw error;
    }
  }

  // Ajouter une note de progression
  async addProgressNote(userId, note, authorId) {
    try {
      const onboardingRef = doc(db, 'onboarding', userId);
      const noteData = {
        content: note,
        authorId,
        timestamp: serverTimestamp()
      };
      
      await updateDoc(onboardingRef, {
        notes: arrayUnion(noteData),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Note ajoutée' };
    } catch (error) {
      console.error('Erreur ajout note:', error);
      throw error;
    }
  }

  // Récupérer les statistiques d'intégration
  async getOnboardingStats() {
    try {
      const onboardingQuery = query(collection(db, 'onboarding'));
      const snapshot = await getDocs(onboardingQuery);
      
      const journeys = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        totalJourneys: journeys.length,
        activeJourneys: journeys.filter(j => j.status === 'active').length,
        completedJourneys: journeys.filter(j => j.status === 'completed').length,
        averageProgress: journeys.reduce((sum, j) => sum + j.progressPercentage, 0) / journeys.length,
        averageXpEarned: journeys.reduce((sum, j) => sum + j.totalXpEarned, 0) / journeys.length,
        phaseDistribution: {
          accueil: journeys.filter(j => j.currentPhase === 'accueil').length,
          quiz_formation: journeys.filter(j => j.currentPhase === 'quiz_formation').length,
          escape_formation: journeys.filter(j => j.currentPhase === 'escape_formation').length,
          autonomie: journeys.filter(j => j.currentPhase === 'autonomie').length,
          completed: journeys.filter(j => j.currentPhase === 'completed').length
        }
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();
