// ==========================================
// 📁 react-app/src/core/services/synergiaBadgeService.js
// SERVICE DE BADGES SPÉCIALISÉS SYNERGIA - NOUVEAU FICHIER
// ==========================================

import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import firebaseDataSyncService from './firebaseDataSyncService.js';

/**
 * 🏆 DÉFINITIONS COMPLÈTES DES BADGES SYNERGIA
 */
export const SYNERGIA_BADGE_DEFINITIONS = {
  // 🔧 BADGES MAINTENANCE & TECHNIQUE
  maintenance_rookie: {
    id: 'maintenance_rookie',
    name: 'Apprenti Mécanicien',
    description: 'Première intervention technique réalisée avec succès',
    icon: '🔧',
    rarity: 'common',
    xpReward: 25,
    category: 'maintenance',
    requirements: {
      role: 'maintenance',
      tasksCompleted: 1,
      category: 'technical'
    },
    checkCondition: (userStats) => {
      const maintenanceStats = userStats.roles?.maintenance || {};
      return maintenanceStats.tasksCompleted >= 1;
    }
  },

  repair_specialist: {
    id: 'repair_specialist',
    name: 'Spécialiste Réparation',
    description: 'Expert reconnu en résolution de problèmes techniques complexes',
    icon: '⚙️',
    rarity: 'rare',
    xpReward: 100,
    category: 'maintenance',
    requirements: {
      role: 'maintenance',
      tasksCompleted: 25,
      difficulty: 'advanced',
      successRate: 85
    },
    checkCondition: (userStats) => {
      const maintenanceStats = userStats.roles?.maintenance || {};
      return maintenanceStats.tasksCompleted >= 25 && 
             maintenanceStats.successRate >= 85;
    }
  },

  safety_guardian: {
    id: 'safety_guardian',
    name: 'Gardien de la Sécurité',
    description: 'Vigilance exceptionnelle et zéro incident de sécurité',
    icon: '🛡️',
    rarity: 'epic',
    xpReward: 200,
    category: 'maintenance',
    requirements: {
      role: 'maintenance',
      safetyChecks: 50,
      incidents: 0,
      trainingCompleted: 5
    },
    checkCondition: (userStats) => {
      const maintenanceStats = userStats.roles?.maintenance || {};
      return maintenanceStats.safetyChecks >= 50 && 
             maintenanceStats.incidents === 0;
    }
  },

  // ⭐ BADGES RÉPUTATION & AVIS
  review_master: {
    id: 'review_master',
    name: 'Maître des Avis',
    description: 'Excellence constante dans la gestion des avis clients',
    icon: '⭐',
    rarity: 'uncommon',
    xpReward: 75,
    category: 'reputation',
    requirements: {
      role: 'reputation',
      reviewsHandled: 10,
      averageRating: 4.5,
      responseTime: 'fast'
    },
    checkCondition: (userStats) => {
      const reputationStats = userStats.roles?.reputation || {};
      return reputationStats.reviewsHandled >= 10 && 
             reputationStats.averageRating >= 4.5;
    }
  },

  crisis_resolver: {
    id: 'crisis_resolver',
    name: 'Résolveur de Crise',
    description: 'Transformation des situations difficiles en succès clients',
    icon: '🚨',
    rarity: 'rare',
    xpReward: 150,
    category: 'reputation',
    requirements: {
      role: 'reputation',
      negativeReviewsResolved: 5,
      satisfactionImprovement: 20,
      conflictResolution: 3
    },
    checkCondition: (userStats) => {
      const reputationStats = userStats.roles?.reputation || {};
      return reputationStats.negativeReviewsResolved >= 5 && 
             reputationStats.satisfactionImprovement >= 20;
    }
  },

  // 📦 BADGES STOCK & LOGISTIQUE
  inventory_ninja: {
    id: 'inventory_ninja',
    name: 'Ninja de l\'Inventaire',
    description: 'Précision et rapidité exceptionnelles dans la gestion des stocks',
    icon: '📦',
    rarity: 'uncommon',
    xpReward: 60,
    category: 'stock',
    requirements: {
      role: 'stock',
      inventoryAccuracy: 98,
      auditsCompleted: 10,
      speedRating: 'excellent'
    },
    checkCondition: (userStats) => {
      const stockStats = userStats.roles?.stock || {};
      return stockStats.inventoryAccuracy >= 98 && 
             stockStats.auditsCompleted >= 10;
    }
  },

  logistics_guru: {
    id: 'logistics_guru',
    name: 'Gourou Logistique',
    description: 'Innovation et optimisation révolutionnaires des flux',
    icon: '🚚',
    rarity: 'epic',
    xpReward: 250,
    category: 'stock',
    requirements: {
      role: 'stock',
      efficiencyImprovement: 30,
      costReduction: 15,
      processesOptimized: 5
    },
    checkCondition: (userStats) => {
      const stockStats = userStats.roles?.stock || {};
      return stockStats.efficiencyImprovement >= 30 && 
             stockStats.costReduction >= 15;
    }
  },

  // 🎮 BADGES ESCAPE GAME SPÉCIFIQUES
  game_master: {
    id: 'game_master',
    name: 'Maître du Jeu',
    description: 'Animation captivante et mémorable d\'escape games',
    icon: '🎭',
    rarity: 'rare',
    xpReward: 120,
    category: 'escape_game',
    requirements: {
      activity: 'escape_game',
      gamesAnimated: 10,
      playerSatisfaction: 4.8,
      immersionScore: 85
    },
    checkCondition: (userStats) => {
      const escapeStats = userStats.activities?.escapeGame || {};
      return escapeStats.gamesAnimated >= 10 && 
             escapeStats.playerSatisfaction >= 4.8;
    }
  },

  puzzle_creator: {
    id: 'puzzle_creator',
    name: 'Créateur d\'Énigmes',
    description: 'Innovation remarquable dans la conception d\'énigmes',
    icon: '🧩',
    rarity: 'epic',
    xpReward: 200,
    category: 'escape_game',
    requirements: {
      activity: 'escape_game',
      puzzlesCreated: 5,
      creativityRating: 4.5,
      originalityScore: 90
    },
    checkCondition: (userStats) => {
      const escapeStats = userStats.activities?.escapeGame || {};
      return escapeStats.puzzlesCreated >= 5 && 
             escapeStats.creativityRating >= 4.5;
    }
  },

  immersion_artist: {
    id: 'immersion_artist',
    name: 'Artiste de l\'Immersion',
    description: 'Création d\'expériences immersives absolument mémorables',
    icon: '🎨',
    rarity: 'legendary',
    xpReward: 500,
    category: 'escape_game',
    requirements: {
      activity: 'escape_game',
      immersionScore: 95,
      testimonials: 20,
      repeatCustomers: 15
    },
    checkCondition: (userStats) => {
      const escapeStats = userStats.activities?.escapeGame || {};
      return escapeStats.immersionScore >= 95 && 
             escapeStats.testimonials >= 20;
    }
  },

  // 🧠 BADGES QUIZ GAME SPÉCIFIQUES
  quiz_master: {
    id: 'quiz_master',
    name: 'Maître du Quiz',
    description: 'Animation dynamique et engagement exceptionnel en quiz',
    icon: '🧠',
    rarity: 'uncommon',
    xpReward: 80,
    category: 'quiz_game',
    requirements: {
      activity: 'quiz_game',
      quizzesAnimated: 5,
      participantEngagement: 85,
      energyLevel: 'high'
    },
    checkCondition: (userStats) => {
      const quizStats = userStats.activities?.quizGame || {};
      return quizStats.quizzesAnimated >= 5 && 
             quizStats.participantEngagement >= 85;
    }
  },

  knowledge_architect: {
    id: 'knowledge_architect',
    name: 'Architecte du Savoir',
    description: 'Création de quiz éducatifs exceptionnellement enrichissants',
    icon: '🏗️',
    rarity: 'rare',
    xpReward: 180,
    category: 'quiz_game',
    requirements: {
      activity: 'quiz_game',
      quizzesCreated: 10,
      educationalValue: 4.7,
      learningOutcomes: 'excellent'
    },
    checkCondition: (userStats) => {
      const quizStats = userStats.activities?.quizGame || {};
      return quizStats.quizzesCreated >= 10 && 
             quizStats.educationalValue >= 4.7;
    }
  },

  trivia_legend: {
    id: 'trivia_legend',
    name: 'Légende du Trivia',
    description: 'Encyclopédie vivante et maître incontesté du trivia',
    icon: '🎓',
    rarity: 'legendary',
    xpReward: 400,
    category: 'quiz_game',
    requirements: {
      activity: 'quiz_game',
      triviaWins: 50,
      knowledgeAreas: 10,
      difficultyLevel: 'expert'
    },
    checkCondition: (userStats) => {
      const quizStats = userStats.activities?.quizGame || {};
      return quizStats.triviaWins >= 50 && 
             quizStats.knowledgeAreas >= 10;
    }
  },

  // 🤝 BADGES COLLABORATION & ÉQUIPE
  team_catalyst: {
    id: 'team_catalyst',
    name: 'Catalyseur d\'Équipe',
    description: 'Inspiration et motivation exceptionnelles de l\'équipe',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 150,
    category: 'collaboration',
    requirements: {
      teamProjectsLed: 3,
      teamSatisfaction: 4.6,
      motivationScore: 90
    },
    checkCondition: (userStats) => {
      const collabStats = userStats.collaboration || {};
      return collabStats.teamProjectsLed >= 3 && 
             collabStats.teamSatisfaction >= 4.6;
    }
  },

  synergy_builder: {
    id: 'synergy_builder',
    name: 'Bâtisseur de Synergie',
    description: 'Création d\'une dynamique d\'équipe parfaite et harmonieuse',
    icon: '🌟',
    rarity: 'epic',
    xpReward: 300,
    category: 'collaboration',
    requirements: {
      successfulCollaborations: 15,
      conflictsResolved: 5,
      teamHarmonyScore: 95
    },
    checkCondition: (userStats) => {
      const collabStats = userStats.collaboration || {};
      return collabStats.successfulCollaborations >= 15 && 
             collabStats.conflictsResolved >= 5;
    }
  },

  // 🎯 BADGES PERFORMANCE & EXCELLENCE
  efficiency_champion: {
    id: 'efficiency_champion',
    name: 'Champion d\'Efficacité',
    description: 'Optimisation constante et mesurable des
