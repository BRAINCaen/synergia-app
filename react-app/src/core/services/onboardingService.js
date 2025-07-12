// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// SERVICE ONBOARDING ACTUALISÉ - FORMATION BRAIN ESCAPE & QUIZ GAME
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

import { db } from '../firebase.js';
import { gamificationService } from './gamificationService.js';

// 🎯 PHASES D'INTÉGRATION BRAIN ESCAPE & QUIZ GAME
export const ONBOARDING_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain & de l\'équipe',
    description: 'Première immersion dans l\'univers Brain',
    duration: 2, // en jours
    color: '#8B5CF6',
    icon: '💡',
    order: 1
  },
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client·e & expérience joueur·euse',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: '#10B981',
    icon: '👥',
    order: 2
  },
  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité, matériel & procédures',
    description: 'Sécurité et gestion du matériel',
    duration: 3,
    color: '#F59E0B',
    icon: '🔐',
    order: 3
  },
  FORMATION_EXPERIENCE: {
    id: 'formation_experience',
    name: '🔎 Formation par expérience',
    description: 'Maîtrise des Escape Games et Quiz Games',
    duration: 12,
    color: '#EF4444',
    icon: '🔎',
    order: 4
  },
  TACHES_QUOTIDIEN: {
    id: 'taches_quotidien',
    name: '🛠️ Tâches du quotidien & gestion',
    description: 'Autonomie dans les tâches quotidiennes',
    duration: 5,
    color: '#06B6D4',
    icon: '🛠️',
    order: 5
  },
  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft Skills & communication',
    description: 'Développement des compétences humaines',
    duration: 7,
    color: '#84CC16',
    icon: '🌱',
    order: 6
  },
  VALIDATION_FINALE: {
    id: 'validation_finale',
    name: '🚩 Validation finale & intégration',
    description: 'Certification Game Master Brain',
    duration: 2,
    color: '#7C3AED',
    icon: '🚩',
    order: 7
  }
};

// 🎯 QUÊTES D'INTÉGRATION BRAIN ESCAPE & QUIZ GAME
export const ONBOARDING_QUESTS = {
  
  // ===========================================
  // 💡 PHASE 1: DÉCOUVERTE DE BRAIN & ÉQUIPE
  // ===========================================
  
  ACCUEIL_OFFICIEL: {
    id: 'accueil_officiel',
    phase: 'decouverte_brain',
    title: 'Accueil officiel et tour des locaux',
    description: 'Participer à l\'accueil officiel et faire le tour complet des locaux Brain',
    xpReward: 50,
    badge: 'bienvenue_brain',
    duration: 60,
    dayTarget: 1,
    autoValidation: false,
    priority: 'high'
  },
  
  CHARTE_REGLEMENT: {
    id: 'charte_reglement',
    phase: 'decouverte_brain',
    title: 'Charte et règlement intérieur',
    description: 'Lire la charte, le règlement intérieur et l\'histoire de Brain',
    xpReward: 30,
    badge: 'citoyen_brain',
    duration: 45,
    dayTarget: 1,
    autoValidation: true,
    priority: 'high'
  },
  
  DECOUVERTE_EQUIPE: {
    id: 'decouverte_equipe',
    phase: 'decouverte_brain',
    title: 'Découverte des membres de l\'équipe',
    description: 'Rencontrer tous les membres, leurs rôles et leurs anecdotes',
    xpReward: 40,
    badge: 'membre_equipe',
    duration: 90,
    dayTarget: 1,
    autoValidation: false,
    priority: 'high'
  },
  
  ORGANIGRAMME_BRAIN: {
    id: 'organigramme_brain',
    phase: 'decouverte_brain',
    title: 'Comprendre l\'organigramme',
    description: 'Qui fait quoi chez Brain ? Structure et responsabilités',
    xpReward: 25,
    badge: null,
    duration: 30,
    dayTarget: 1,
    autoValidation: true,
    priority: 'medium'
  },
  
  OUTILS_INTERNES: {
    id: 'outils_internes',
    phase: 'decouverte_brain',
    title: 'Prise en main des outils internes',
    description: 'Messagerie, email, planning, réservations et communication',
    xpReward: 35,
    badge: 'expert_outils',
    duration: 60,
    dayTarget: 2,
    autoValidation: false,
    priority: 'high'
  },
  
  PRESENTATION_PERSONNELLE: {
    id: 'presentation_personnelle',
    phase: 'decouverte_brain',
    title: 'Se présenter à l\'équipe',
    description: 'Présentation personnelle en live ou par message à toute l\'équipe',
    xpReward: 20,
    badge: 'ambassadeur_brain',
    duration: 15,
    dayTarget: 2,
    autoValidation: false,
    priority: 'medium'
  },

  // ===========================================
  // 👥 PHASE 2: PARCOURS CLIENT & EXPÉRIENCE JOUEUR
  // ===========================================
  
  OBSERVATION_ACCUEIL: {
    id: 'observation_accueil',
    phase: 'parcours_client',
    title: 'Observer l\'accueil client·e',
    description: 'Observer l\'accueil client avec un Game Master expérimenté',
    xpReward: 60,
    badge: 'observateur_expert',
    duration: 120,
    dayTarget: 3,
    autoValidation: false,
    priority: 'high'
  },
  
  OBSERVATION_BRIEFING: {
    id: 'observation_briefing',
    phase: 'parcours_client',
    title: 'Observer un briefing client',
    description: 'Observer briefing Escape Game et Quiz Game',
    xpReward: 50,
    badge: null,
    duration: 90,
    dayTarget: 3,
    autoValidation: false,
    priority: 'high'
  },
  
  COMPRENDRE_PARCOURS: {
    id: 'comprendre_parcours',
    phase: 'parcours_client',
    title: 'Comprendre le parcours client type',
    description: 'Maîtriser : accueil, briefing, jeu, débriefing',
    xpReward: 45,
    badge: 'expert_parcours',
    duration: 60,
    dayTarget: 4,
    autoValidation: true,
    priority: 'high'
  },
  
  ACCUEIL_BINOME: {
    id: 'accueil_binome',
    phase: 'parcours_client',
    title: 'Participer à un accueil en duo',
    description: 'Première expérience d\'accueil client en binôme',
    xpReward: 75,
    badge: 'apprenti_accueil',
    duration: 60,
    dayTarget: 5,
    autoValidation: false,
    priority: 'high'
  },
  
  BRIEFING_FICTIF: {
    id: 'briefing_fictif',
    phase: 'parcours_client',
    title: 'Briefing client fictif',
    description: 'Réaliser un briefing client en jeu de rôle',
    xpReward: 65,
    badge: 'briefer_expert',
    duration: 45,
    dayTarget: 6,
    autoValidation: false,
    priority: 'high'
  },
  
  DEBRIEFING_PARTICIPATION: {
    id: 'debriefing_participation',
    phase: 'parcours_client',
    title: 'Participer à un débriefing',
    description: 'Assister et participer à un débriefing client',
    xpReward: 55,
    badge: 'debriefer_expert',
    duration: 30,
    dayTarget: 6,
    autoValidation: false,
    priority: 'medium'
  },
  
  PRISE_NOTES_SESSION: {
    id: 'prise_notes_session',
    phase: 'parcours_client',
    title: 'Prendre des notes sur session réelle',
    description: 'Observer et documenter une session client complète',
    xpReward: 40,
    badge: null,
    duration: 90,
    dayTarget: 7,
    autoValidation: false,
    priority: 'medium'
  },
  
  RETOUR_EXPERIENCE: {
    id: 'retour_experience',
    phase: 'parcours_client',
    title: 'Rédiger retour d\'expérience',
    description: 'Rédiger un retour avec points forts et axes d\'amélioration',
    xpReward: 50,
    badge: 'analyste_experience',
    duration: 60,
    dayTarget: 7,
    autoValidation: false,
    priority: 'medium'
  },

  // ===========================================
  // 🔐 PHASE 3: SÉCURITÉ, MATÉRIEL & PROCÉDURES
  // ===========================================
  
  CONSIGNES_SECURITE: {
    id: 'consignes_securite',
    phase: 'securite_procedures',
    title: 'Lire les consignes de sécurité',
    description: 'Incendie, évacuation, premiers secours - tout maîtriser',
    xpReward: 60,
    badge: 'gardien_securite',
    duration: 45,
    dayTarget: 8,
    autoValidation: true,
    priority: 'high'
  },
  
  EQUIPEMENTS_SECURITE: {
    id: 'equipements_securite',
    phase: 'securite_procedures',
    title: 'Repérer équipements de sécurité',
    description: 'Localiser extincteurs, issues de secours, matériel urgence',
    xpReward: 40,
    badge: null,
    duration: 30,
    dayTarget: 8,
    autoValidation: false,
    priority: 'high'
  },
  
  PROCEDURES_URGENCE: {
    id: 'procedures_urgence',
    phase: 'securite_procedures',
    title: 'Procédures d\'urgence',
    description: 'Coupure courant, alarme, incidents - savoir réagir',
    xpReward: 70,
    badge: 'expert_urgence',
    duration: 60,
    dayTarget: 9,
    autoValidation: false,
    priority: 'high'
  },
  
  OUTILS_TECHNIQUES: {
    id: 'outils_techniques',
    phase: 'securite_procedures',
    title: 'Prise en main outils techniques',
    description: 'Caméras, micros, écrans, effets spéciaux',
    xpReward: 80,
    badge: 'technicien_brain',
    duration: 120,
    dayTarget: 9,
    autoValidation: false,
    priority: 'high'
  },
  
  RESET_SALLE: {
    id: 'reset_salle',
    phase: 'securite_procedures',
    title: 'Reset complet d\'une salle',
    description: 'Apprendre à remettre une salle en état initial',
    xpReward: 75,
    badge: 'maitre_reset',
    duration: 90,
    dayTarget: 10,
    autoValidation: false,
    priority: 'high'
  },
  
  GESTION_MATERIEL: {
    id: 'gestion_materiel',
    phase: 'securite_procedures',
    title: 'Gestion du matériel',
    description: 'Cadenas, accessoires, maintenance de base',
    xpReward: 55,
    badge: 'gestionnaire_materiel',
    duration: 60,
    dayTarget: 10,
    autoValidation: false,
    priority: 'medium'
  },
  
  OUVERTURE_FERMETURE: {
    id: 'ouverture_fermeture',
    phase: 'securite_procedures',
    title: 'Procédure ouverture/fermeture',
    description: 'Ouverture et fermeture complète sous supervision',
    xpReward: 90,
    badge: 'responsable_site',
    duration: 180,
    dayTarget: 10,
    autoValidation: false,
    priority: 'high'
  },

  // ===========================================
  // 🔎 PHASE 4: FORMATION PAR EXPÉRIENCE
  // ===========================================
  
  SCENARIO_ESCAPE_THEORIQUE: {
    id: 'scenario_escape_theorique',
    phase: 'formation_experience',
    title: 'Lire scénario Escape Game complet',
    description: 'Étudier scénario, objectifs et mécaniques de chaque salle',
    xpReward: 100,
    badge: 'erudit_escape',
    duration: 180,
    dayTarget: 11,
    autoValidation: true,
    priority: 'high'
  },
  
  OBSERVATION_ESCAPE_EXPERT: {
    id: 'observation_escape_expert',
    phase: 'formation_experience',
    title: 'Observer session Escape animée par expert',
    description: 'Observer Game Master confirmé animer une session complète',
    xpReward: 120,
    badge: 'observateur_maitre',
    duration: 120,
    dayTarget: 12,
    autoValidation: false,
    priority: 'high'
  },
  
  ENIGMES_SOLUTIONS: {
    id: 'enigmes_solutions',
    phase: 'formation_experience',
    title: 'Apprendre énigmes et solutions',
    description: 'Maîtriser toutes les énigmes, solutions et points d\'aide',
    xpReward: 150,
    badge: 'maitre_enigmes',
    duration: 240,
    dayTarget: 13,
    autoValidation: false,
    priority: 'high'
  },
  
  RESET_SALLE_ESCAPE: {
    id: 'reset_salle_escape',
    phase: 'formation_experience',
    title: 'Maîtriser reset salle Escape',
    description: 'Reset autonome et complet des salles Escape',
    xpReward: 110,
    badge: 'reset_master',
    duration: 90,
    dayTarget: 14,
    autoValidation: false,
    priority: 'high'
  },
  
  GESTION_TECHNIQUE_ESCAPE: {
    id: 'gestion_technique_escape',
    phase: 'formation_experience',
    title: 'Gestion technique Escape',
    description: 'Caméras, indices, effets spéciaux en temps réel',
    xpReward: 140,
    badge: 'techno_maitre',
    duration: 150,
    dayTarget: 15,
    autoValidation: false,
    priority: 'high'
  },
  
  ANIMATION_BINOME_ESCAPE: {
    id: 'animation_binome_escape',
    phase: 'formation_experience',
    title: 'Animation Escape en binôme',
    description: 'Première animation Escape Game en duo supervisé',
    xpReward: 180,
    badge: 'apprenti_maitre_jeu',
    duration: 120,
    dayTarget: 16,
    autoValidation: false,
    priority: 'high'
  },
  
  BRIEFING_DEBRIEFING_ESCAPE: {
    id: 'briefing_debriefing_escape',
    phase: 'formation_experience',
    title: 'Briefing et débriefing Escape',
    description: 'Maîtriser briefing et débriefing complet Escape Game',
    xpReward: 130,
    badge: 'communicateur_expert',
    duration: 90,
    dayTarget: 17,
    autoValidation: false,
    priority: 'high'
  },
  
  INCIDENT_FICTIF_ESCAPE: {
    id: 'incident_fictif_escape',
    phase: 'formation_experience',
    title: 'Gérer incident fictif Escape',
    description: 'Simulation : clé cassée, client bloqué, bug technique',
    xpReward: 160,
    badge: 'problem_solver',
    duration: 60,
    dayTarget: 18,
    autoValidation: false,
    priority: 'high'
  },
  
  SESSION_ESCAPE_VALIDEE: {
    id: 'session_escape_validee',
    phase: 'formation_experience',
    title: 'Session Escape complète validée',
    description: 'Session autonome validée par référent expert',
    xpReward: 200,
    badge: 'escape_game_master',
    duration: 120,
    dayTarget: 19,
    autoValidation: false,
    priority: 'high'
  },
  
  QUIZ_GAME_THEORIQUE: {
    id: 'quiz_game_theorique',
    phase: 'formation_experience',
    title: 'Formation théorique Quiz Game',
    description: 'Règles, mécaniques et animation Quiz Game',
    xpReward: 80,
    badge: 'quiz_theoricien',
    duration: 120,
    dayTarget: 20,
    autoValidation: true,
    priority: 'high'
  },
  
  ANIMATION_QUIZ_SUPERVISION: {
    id: 'animation_quiz_supervision',
    phase: 'formation_experience',
    title: 'Animation Quiz sous supervision',
    description: 'Animer Quiz Game avec encadrement expert',
    xpReward: 120,
    badge: 'apprenti_quiz_master',
    duration: 90,
    dayTarget: 21,
    autoValidation: false,
    priority: 'high'
  },
  
  QUIZ_GAME_AUTONOME: {
    id: 'quiz_game_autonome',
    phase: 'formation_experience',
    title: 'Animation Quiz autonome',
    description: 'Animation Quiz Game en autonomie complète',
    xpReward: 150,
    badge: 'quiz_game_master',
    duration: 90,
    dayTarget: 22,
    autoValidation: false,
    priority: 'high'
  },

  // ===========================================
  // 🛠️ PHASE 5: TÂCHES DU QUOTIDIEN & GESTION
  // ===========================================
  
  PREPARATION_SALLE: {
    id: 'preparation_salle',
    phase: 'taches_quotidien',
    title: 'Préparer salle avant session',
    description: 'Reset, check matériel, mise en condition',
    xpReward: 70,
    badge: 'preparateur_expert',
    duration: 45,
    dayTarget: 23,
    autoValidation: false,
    priority: 'high'
  },
  
  GESTION_STOCKS: {
    id: 'gestion_stocks',
    phase: 'taches_quotidien',
    title: 'Vérifier et réapprovisionner stocks',
    description: 'Consommables, accessoires, inventaire',
    xpReward: 60,
    badge: 'gestionnaire_stocks',
    duration: 60,
    dayTarget: 24,
    autoValidation: false,
    priority: 'medium'
  },
  
  NETTOYAGE_ENTRETIEN: {
    id: 'nettoyage_entretien',
    phase: 'taches_quotidien',
    title: 'Nettoyer et entretenir espaces',
    description: 'Espaces clients et staff - propreté impeccable',
    xpReward: 50,
    badge: 'gardien_proprete',
    duration: 90,
    dayTarget: 24,
    autoValidation: false,
    priority: 'medium'
  },
  
  GESTION_CAISSE_BAR: {
    id: 'gestion_caisse_bar',
    phase: 'taches_quotidien',
    title: 'Gérer caisse et bar',
    description: 'Caisse, consommations, service bar',
    xpReward: 80,
    badge: 'barman_brain',
    duration: 120,
    dayTarget: 25,
    autoValidation: false,
    priority: 'high'
  },
  
  OUTILS_NUMERIQUES: {
    id: 'outils_numeriques',
    phase: 'taches_quotidien',
    title: 'Maîtriser outils numériques',
    description: 'Réservations, mails, rapports d\'activité',
    xpReward: 75,
    badge: 'digital_master',
    duration: 90,
    dayTarget: 26,
    autoValidation: false,
    priority: 'high'
  },
  
  OUVERTURE_AUTONOME: {
    id: 'ouverture_autonome',
    phase: 'taches_quotidien',
    title: 'Ouverture/fermeture autonome',
    description: 'Ouverture et fermeture complète en autonomie',
    xpReward: 100,
    badge: 'responsable_autonome',
    duration: 120,
    dayTarget: 27,
    autoValidation: false,
    priority: 'high'
  },
  
  OBJETS_TROUVES: {
    id: 'objets_trouves',
    phase: 'taches_quotidien',
    title: 'Gérer objets trouvés et rangement',
    description: 'Organisation parfaite des espaces',
    xpReward: 40,
    badge: 'organisateur_expert',
    duration: 30,
    dayTarget: 27,
    autoValidation: false,
    priority: 'low'
  },
  
  RAPPORT_JOURNALIER: {
    id: 'rapport_journalier',
    phase: 'taches_quotidien',
    title: 'Remplir rapport journalier',
    description: 'Carnet de bord et rapports quotidiens',
    xpReward: 35,
    badge: 'chroniqueur_brain',
    duration: 20,
    dayTarget: 27,
    autoValidation: false,
    priority: 'medium'
  },

  // ===========================================
  // 🌱 PHASE 6: SOFT SKILLS & COMMUNICATION
  // ===========================================
  
  FORMATION_COMMUNICATION: {
    id: 'formation_communication',
    phase: 'soft_skills',
    title: 'Formation communication',
    description: 'Jeu de rôle : gestion client difficile, situations délicates',
    xpReward: 90,
    badge: 'communicateur_expert',
    duration: 120,
    dayTarget: 28,
    autoValidation: false,
    priority: 'high'
  },
  
  SITUATION_DELICATE: {
    id: 'situation_delicate',
    phase: 'soft_skills',
    title: 'Observer/gérer situation délicate',
    description: 'Accompagnement dans gestion de client difficile',
    xpReward: 110,
    badge: 'diplomate_brain',
    duration: 60,
    dayTarget: 29,
    autoValidation: false,
    priority: 'high'
  },
  
  FEEDBACK_COLLEGUE: {
    id: 'feedback_collegue',
    phase: 'soft_skills',
    title: 'Donner et recevoir feedback',
    description: 'Échange constructif avec un collègue',
    xpReward: 60,
    badge: 'feedback_master',
    duration: 45,
    dayTarget: 30,
    autoValidation: false,
    priority: 'medium'
  },
  
  PROPOSITION_AMELIORATION: {
    id: 'proposition_amelioration',
    phase: 'soft_skills',
    title: 'Proposer amélioration',
    description: 'Proposer une idée d\'amélioration pour l\'équipe',
    xpReward: 80,
    badge: 'innovateur_brain',
    duration: 60,
    dayTarget: 31,
    autoValidation: false,
    priority: 'medium'
  },
  
  BILAN_PERSONNEL: {
    id: 'bilan_personnel',
    phase: 'soft_skills',
    title: 'Bilan personnel hebdomadaire',
    description: 'Auto-évaluation rapide chaque semaine',
    xpReward: 40,
    badge: 'auto_evaluateur',
    duration: 15,
    dayTarget: 32,
    autoValidation: true,
    priority: 'medium'
  },
  
  INITIATIVE_PERSONNELLE: {
    id: 'initiative_personnelle',
    phase: 'soft_skills',
    title: 'Prendre une initiative',
    description: 'Dépanner collègue, animer moment convivial...',
    xpReward: 70,
    badge: 'esprit_initiative',
    duration: 30,
    dayTarget: 33,
    autoValidation: false,
    priority: 'medium'
  },
  
  ESPRIT_EQUIPE: {
    id: 'esprit_equipe',
    phase: 'soft_skills',
    title: 'Développer esprit d\'équipe',
    description: 'Actions concrètes pour renforcer la cohésion',
    xpReward: 85,
    badge: 'team_builder',
    duration: 45,
    dayTarget: 34,
    autoValidation: false,
    priority: 'high'
  },

  // ===========================================
  // 🚩 PHASE 7: VALIDATION FINALE & INTÉGRATION
  // ===========================================
  
  SESSION_COMPLETE_AUTONOME: {
    id: 'session_complete_autonome',
    phase: 'validation_finale',
    title: 'Session complète en autonomie',
    description: 'Accueil, briefing, gestion, débriefing, reset - TOUT !',
    xpReward: 250,
    badge: 'game_master_autonome',
    duration: 180,
    dayTarget: 35,
    autoValidation: false,
    priority: 'high'
  },
  
  SYNTHESE_PARCOURS: {
    id: 'synthese_parcours',
    phase: 'validation_finale',
    title: 'Synthèse du parcours',
    description: 'Présentation complète du parcours à un manager',
    xpReward: 120,
    badge: 'orateur_brain',
    duration: 90,
    dayTarget: 36,
    autoValidation: false,
    priority: 'high'
  },
  
  RETOUR_FINAL: {
    id: 'retour_final',
    phase: 'validation_finale',
    title: 'Retour d\'expérience final',
    description: 'Bilan complet écrit ou oral du parcours',
    xpReward: 100,
    badge: 'analyste_senior',
    duration: 60,
    dayTarget: 36,
    autoValidation: false,
    priority: 'high'
  },
  
  VALIDATION_MANAGER: {
    id: 'validation_manager',
    phase: 'validation_finale',
    title: 'Validation finale manager',
    description: 'Obtenir la validation officielle',
    xpReward: 200,
    badge: 'certifie_brain',
    duration: 30,
    dayTarget: 36,
    autoValidation: false,
    priority: 'high'
  },
  
  CELEBRATION_INTEGRATION: {
    id: 'celebration_integration',
    phase: 'validation_finale',
    title: 'Célébration d\'intégration',
    description: 'Célébrer l\'intégration officielle avec l\'équipe !',
    xpReward: 300,
    badge: 'game_master_certifie_brain',
    duration: 60,
    dayTarget: 36,
    autoValidation: false,
    priority: 'high'
  }
};

// 🏆 BADGES D'ONBOARDING BRAIN ESCAPE & QUIZ GAME
export const ONBOARDING_BADGES = {
  // Badges Phase 1 - Découverte
  bienvenue_brain: {
    id: 'bienvenue_brain',
    name: 'Bienvenue chez Brain !',
    description: 'Premier pas réussi chez Brain Escape & Quiz Game',
    icon: '🎉',
    color: '#8B5CF6',
    rarity: 'common'
  },
  citoyen_brain: {
    id: 'citoyen_brain',
    name: 'Citoyen Brain',
    description: 'Connaît les règles et l\'histoire de Brain',
    icon: '📋',
    color: '#6366F1',
    rarity: 'common'
  },
  membre_equipe: {
    id: 'membre_equipe',
    name: 'Membre d\'Équipe',
    description: 'Intégré socialement dans l\'équipe Brain',
    icon: '👥',
    color: '#10B981',
    rarity: 'common'
  },
  expert_outils: {
    id: 'expert_outils',
    name: 'Expert Outils',
    description: 'Maîtrise tous les outils internes',
    icon: '🛠️',
    color: '#3B82F6',
    rarity: 'uncommon'
  },
  ambassadeur_brain: {
    id: 'ambassadeur_brain',
    name: 'Ambassadeur Brain',
    description: 'Représente fièrement l\'esprit Brain',
    icon: '🌟',
    color: '#F59E0B',
    rarity: 'uncommon'
  },

  // Badges Phase 2 - Parcours Client
  observateur_expert: {
    id: 'observateur_expert',
    name: 'Observateur Expert',
    description: 'Analyse fine des mécaniques client',
    icon: '👁️',
    color: '#84CC16',
    rarity: 'uncommon'
  },
  expert_parcours: {
    id: 'expert_parcours',
    name: 'Expert Parcours',
    description: 'Maîtrise le parcours client de A à Z',
    icon: '🗺️',
    color: '#06B6D4',
    rarity: 'uncommon'
  },
  apprenti_accueil: {
    id: 'apprenti_accueil',
    name: 'Apprenti Accueil',
    description: 'Premier accueil client réussi',
    icon: '🤝',
    color: '#8B5CF6',
    rarity: 'uncommon'
  },
  briefer_expert: {
    id: 'briefer_expert',
    name: 'Briefer Expert',
    description: 'Maîtrise l\'art du briefing',
    icon: '📢',
    color: '#F59E0B',
    rarity: 'rare'
  },
  debriefer_expert: {
    id: 'debriefer_expert',
    name: 'Débriefer Expert',
    description: 'Débriefing client parfaitement maîtrisé',
    icon: '💬',
    color: '#10B981',
    rarity: 'rare'
  },
  analyste_experience: {
    id: 'analyste_experience',
    name: 'Analyste Expérience',
    description: 'Analyse experte de l\'expérience client',
    icon: '📊',
    color: '#7C3AED',
    rarity: 'rare'
  },

  // Badges Phase 3 - Sécurité & Procédures
  gardien_securite: {
    id: 'gardien_securite',
    name: 'Gardien de la Sécurité',
    description: 'Garant de la sécurité chez Brain',
    icon: '🛡️',
    color: '#EF4444',
    rarity: 'uncommon'
  },
  expert_urgence: {
    id: 'expert_urgence',
    name: 'Expert Urgence',
    description: 'Sait gérer toutes les situations d\'urgence',
    icon: '🚨',
    color: '#DC2626',
    rarity: 'rare'
  },
  technicien_brain: {
    id: 'technicien_brain',
    name: 'Technicien Brain',
    description: 'Maîtrise parfaite des outils techniques',
    icon: '⚙️',
    color: '#6B7280',
    rarity: 'rare'
  },
  maitre_reset: {
    id: 'maitre_reset',
    name: 'Maître du Reset',
    description: 'Reset de salle parfaitement maîtrisé',
    icon: '🔄',
    color: '#059669',
    rarity: 'rare'
  },
  gestionnaire_materiel: {
    id: 'gestionnaire_materiel',
    name: 'Gestionnaire Matériel',
    description: 'Organisation parfaite du matériel',
    icon: '📦',
    color: '#7C2D12',
    rarity: 'uncommon'
  },
  responsable_site: {
    id: 'responsable_site',
    name: 'Responsable Site',
    description: 'Autonomie complète ouverture/fermeture',
    icon: '🗝️',
    color: '#92400E',
    rarity: 'epic'
  },

  // Badges Phase 4 - Formation Expérience
  erudit_escape: {
    id: 'erudit_escape',
    name: 'Érudit Escape',
    description: 'Connaît tous les scénarios par cœur',
    icon: '📚',
    color: '#3730A3',
    rarity: 'rare'
  },
  observateur_maitre: {
    id: 'observateur_maitre',
    name: 'Observateur Maître',
    description: 'Observation experte des sessions',
    icon: '🔍',
    color: '#1E40AF',
    rarity: 'rare'
  },
  maitre_enigmes: {
    id: 'maitre_enigmes',
    name: 'Maître des Énigmes',
    description: 'Toutes les énigmes n\'ont plus de secret',
    icon: '🧩',
    color: '#7C3AED',
    rarity: 'epic'
  },
  reset_master: {
    id: 'reset_master',
    name: 'Reset Master',
    description: 'Reset Escape Game en autonomie',
    icon: '🔧',
    color: '#059669',
    rarity: 'rare'
  },
  techno_maitre: {
    id: 'techno_maitre',
    name: 'Techno Maître',
    description: 'Gestion technique parfaite en temps réel',
    icon: '🎛️',
    color: '#4338CA',
    rarity: 'epic'
  },
  apprenti_maitre_jeu: {
    id: 'apprenti_maitre_jeu',
    name: 'Apprenti Maître du Jeu',
    description: 'Première animation Escape réussie',
    icon: '🎭',
    color: '#F59E0B',
    rarity: 'rare'
  },
  communicateur_expert: {
    id: 'communicateur_expert',
    name: 'Communicateur Expert',
    description: 'Briefing et débriefing Escape maîtrisés',
    icon: '📣',
    color: '#10B981',
    rarity: 'rare'
  },
  problem_solver: {
    id: 'problem_solver',
    name: 'Problem Solver',
    description: 'Résout tous les incidents avec brio',
    icon: '💡',
    color: '#F97316',
    rarity: 'epic'
  },
  escape_game_master: {
    id: 'escape_game_master',
    name: 'Escape Game Master',
    description: 'Maîtrise complète de l\'Escape Game',
    icon: '👑',
    color: '#DC2626',
    rarity: 'legendary'
  },
  quiz_theoricien: {
    id: 'quiz_theoricien',
    name: 'Quiz Théoricien',
    description: 'Connaît toute la théorie Quiz Game',
    icon: '🧠',
    color: '#3B82F6',
    rarity: 'uncommon'
  },
  apprenti_quiz_master: {
    id: 'apprenti_quiz_master',
    name: 'Apprenti Quiz Master',
    description: 'Animation Quiz sous supervision réussie',
    icon: '🎤',
    color: '#8B5CF6',
    rarity: 'rare'
  },
  quiz_game_master: {
    id: 'quiz_game_master',
    name: 'Quiz Game Master',
    description: 'Animation Quiz en autonomie parfaite',
    icon: '🏆',
    color: '#F59E0B',
    rarity: 'epic'
  },

  // Badges Phase 5 - Tâches Quotidien
  preparateur_expert: {
    id: 'preparateur_expert',
    name: 'Préparateur Expert',
    description: 'Préparation de salle impeccable',
    icon: '🎯',
    color: '#059669',
    rarity: 'uncommon'
  },
  gestionnaire_stocks: {
    id: 'gestionnaire_stocks',
    name: 'Gestionnaire Stocks',
    description: 'Gestion des stocks optimale',
    icon: '📋',
    color: '#7C2D12',
    rarity: 'uncommon'
  },
  gardien_proprete: {
    id: 'gardien_proprete',
    name: 'Gardien Propreté',
    description: 'Espaces toujours impeccables',
    icon: '✨',
    color: '#06B6D4',
    rarity: 'common'
  },
  barman_brain: {
    id: 'barman_brain',
    name: 'Barman Brain',
    description: 'Service bar et caisse parfaitement gérés',
    icon: '🍹',
    color: '#F59E0B',
    rarity: 'uncommon'
  },
  digital_master: {
    id: 'digital_master',
    name: 'Digital Master',
    description: 'Tous les outils numériques maîtrisés',
    icon: '💻',
    color: '#3B82F6',
    rarity: 'rare'
  },
  responsable_autonome: {
    id: 'responsable_autonome',
    name: 'Responsable Autonome',
    description: 'Autonomie complète sur toutes les tâches',
    icon: '🚀',
    color: '#7C3AED',
    rarity: 'epic'
  },
  organisateur_expert: {
    id: 'organisateur_expert',
    name: 'Organisateur Expert',
    description: 'Organisation parfaite des espaces',
    icon: '📁',
    color: '#059669',
    rarity: 'uncommon'
  },
  chroniqueur_brain: {
    id: 'chroniqueur_brain',
    name: 'Chroniqueur Brain',
    description: 'Rapports et documentation irréprochables',
    icon: '📝',
    color: '#6B7280',
    rarity: 'uncommon'
  },

  // Badges Phase 6 - Soft Skills
  diplomate_brain: {
    id: 'diplomate_brain',
    name: 'Diplomate Brain',
    description: 'Gestion experte des situations délicates',
    icon: '🕊️',
    color: '#10B981',
    rarity: 'epic'
  },
  feedback_master: {
    id: 'feedback_master',
    name: 'Feedback Master',
    description: 'Maîtrise l\'art du feedback constructif',
    icon: '💬',
    color: '#8B5CF6',
    rarity: 'rare'
  },
  innovateur_brain: {
    id: 'innovateur_brain',
    name: 'Innovateur Brain',
    description: 'Propose des améliorations pertinentes',
    icon: '💡',
    color: '#F59E0B',
    rarity: 'rare'
  },
  auto_evaluateur: {
    id: 'auto_evaluateur',
    name: 'Auto-Évaluateur',
    description: 'Capacité d\'auto-évaluation développée',
    icon: '🪞',
    color: '#6B7280',
    rarity: 'uncommon'
  },
  esprit_initiative: {
    id: 'esprit_initiative',
    name: 'Esprit d\'Initiative',
    description: 'Prend des initiatives positives',
    icon: '⚡',
    color: '#F97316',
    rarity: 'rare'
  },
  team_builder: {
    id: 'team_builder',
    name: 'Team Builder',
    description: 'Renforce la cohésion d\'équipe',
    icon: '🤝',
    color: '#10B981',
    rarity: 'epic'
  },

  // Badges Phase 7 - Validation Finale
  game_master_autonome: {
    id: 'game_master_autonome',
    name: 'Game Master Autonome',
    description: 'Session complète en autonomie réussie',
    icon: '🎮',
    color: '#7C3AED',
    rarity: 'epic'
  },
  orateur_brain: {
    id: 'orateur_brain',
    name: 'Orateur Brain',
    description: 'Présentation de parcours réussie',
    icon: '🎙️',
    color: '#3B82F6',
    rarity: 'rare'
  },
  analyste_senior: {
    id: 'analyste_senior',
    name: 'Analyste Senior',
    description: 'Analyse complète et pertinente du parcours',
    icon: '📈',
    color: '#059669',
    rarity: 'rare'
  },
  certifie_brain: {
    id: 'certifie_brain',
    name: 'Certifié Brain',
    description: 'Validation officielle obtenue',
    icon: '🎓',
    color: '#DC2626',
    rarity: 'epic'
  },
  game_master_certifie_brain: {
    id: 'game_master_certifie_brain',
    name: 'Game Master Certifié Brain',
    description: 'Intégration officielle réussie - Bienvenue dans l\'équipe !',
    icon: '👑',
    color: '#7C3AED',
    rarity: 'legendary'
  }
};

// Service principal d'onboarding actualisé
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
          position: userData.position || 'Game Master',
          department: userData.department || 'Brain Escape & Quiz Game',
          manager: userData.manager || ''
        },
        
        // Progression phases
        phases: {
          current: 'decouverte_brain',
          completed: [],
          progress: {
            decouverte_brain: { started: true, completed: false, startDate: new Date().toISOString(), endDate: null },
            parcours_client: { started: false, completed: false, startDate: null, endDate: null },
            securite_procedures: { started: false, completed: false, startDate: null, endDate: null },
            formation_experience: { started: false, completed: false, startDate: null, endDate: null },
            taches_quotidien: { started: false, completed: false, startDate: null, endDate: null },
            soft_skills: { started: false, completed: false, startDate: null, endDate: null },
            validation_finale: { started: false, completed: false, startDate: null, endDate: null }
          }
        },
        
        // Quêtes et progression
        quests: {
          completed: [],
          inProgress: [],
          unlocked: [
            'accueil_officiel',
            'charte_reglement', 
            'decouverte_equipe',
            'organigramme_brain'
          ],
          failed: []
        },
        
        // Système de gamification
        gamification: {
          totalXP: 0,
          currentLevel: 1,
          badgesEarned: [],
          achievements: [],
          streaks: {
            daily: 0,
            weekly: 0,
            maxDaily: 0,
            maxWeekly: 0
          }
        },
        
        // Métriques de performance
        metrics: {
          questsCompleted: 0,
          averageCompletionTime: 0,
          accuracyRate: 100,
          engagementScore: 0,
          lastActivity: serverTimestamp()
        },
        
        // Feedback et notes
        feedback: {
          managerNotes: [],
          selfAssessments: [],
          peerReviews: [],
          improvements: []
        }
      };

      await setDoc(doc(db, 'onboarding', userId), onboardingProfile);
      return onboardingProfile;
      
    } catch (error) {
      console.error('Erreur création profil onboarding:', error);
      throw error;
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
        return docSnap.data();
      }
      return null;
      
    } catch (error) {
      console.error('Erreur récupération profil onboarding:', error);
      throw error;
    }
  }

  /**
   * ✅ Valider une quête
   */
  static async completeQuest(userId, questId, validatorId = null) {
    try {
      const profile = await this.getOnboardingProfile(userId);
      if (!profile) throw new Error('Profil onboarding introuvable');

      const quest = ONBOARDING_QUESTS[questId.toUpperCase()];
      if (!quest) throw new Error('Quête introuvable');

      // Mettre à jour le profil
      const updates = {
        'quests.completed': arrayUnion(questId),
        'gamification.totalXP': (profile.gamification.totalXP || 0) + quest.xpReward,
        'metrics.questsCompleted': (profile.metrics.questsCompleted || 0) + 1,
        'metrics.lastActivity': serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Ajouter badge si défini
      if (quest.badge) {
        updates['gamification.badgesEarned'] = arrayUnion(quest.badge);
      }

      // Déverrouiller prochaines quêtes
      const nextQuests = this.getNextQuests(questId, profile);
      if (nextQuests.length > 0) {
        updates['quests.unlocked'] = arrayUnion(...nextQuests);
      }

      await updateDoc(doc(db, 'onboarding', userId), updates);

      // Intégration avec système de gamification
      if (gamificationService) {
        await gamificationService.awardXP(userId, quest.xpReward, `Quête complétée: ${quest.title}`);
        
        if (quest.badge) {
          await gamificationService.awardBadge(userId, quest.badge);
        }
      }

      return {
        success: true,
        xpAwarded: quest.xpReward,
        badgeAwarded: quest.badge,
        nextQuests: nextQuests
      };

    } catch (error) {
      console.error('Erreur validation quête:', error);
      throw error;
    }
  }

  /**
   * 🔓 Déterminer les prochaines quêtes à déverrouiller
   */
  static getNextQuests(completedQuestId, profile) {
    const quest = ONBOARDING_QUESTS[completedQuestId.toUpperCase()];
    if (!quest) return [];

    const nextQuests = [];
    const currentDay = this.getCurrentDay(profile.personalInfo.startDate);

    // Logique de déverrouillage basée sur les phases et jours
    Object.values(ONBOARDING_QUESTS).forEach(q => {
      if (
        !profile.quests.completed.includes(q.id) &&
        !profile.quests.unlocked.includes(q.id) &&
        q.dayTarget <= currentDay + 1 &&
        (q.phase === quest.phase || this.isPhaseUnlocked(q.phase, profile))
      ) {
        nextQuests.push(q.id);
      }
    });

    return nextQuests;
  }

  /**
   * 📅 Calculer le jour actuel depuis le début
   */
  static getCurrentDay(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * 🔓 Vérifier si une phase est déverrouillée
   */
  static isPhaseUnlocked(phaseId, profile) {
    const phases = Object.values(ONBOARDING_PHASES);
    const currentPhaseOrder = phases.find(p => p.id === profile.phases.current)?.order || 1;
    const targetPhaseOrder = phases.find(p => p.id === phaseId)?.order || 999;
    
    return targetPhaseOrder <= currentPhaseOrder + 1;
  }

  /**
   * 📈 Calculer les statistiques du parcours
   */
  static calculateStats(profile) {
    const totalQuests = Object.keys(ONBOARDING_QUESTS).length;
    const completedQuests = profile.quests.completed.length;
    const progressPercent = Math.round((completedQuests / totalQuests) * 100);
    
    return {
      progressPercent,
      questsCompleted: completedQuests,
      totalQuests,
      totalXP: profile.gamification.totalXP || 0,
      badgesCount: profile.gamification.badgesEarned.length,
      currentLevel: profile.gamification.currentLevel || 1,
      daysActive: this.getCurrentDay(profile.personalInfo.startDate)
    };
  }

  /**
   * 🎯 Obtenir les quêtes disponibles par phase
   */
  static getQuestsByPhase(phaseId) {
    return Object.values(ONBOARDING_QUESTS).filter(quest => quest.phase === phaseId);
  }

  /**
   * 🏆 Obtenir les badges par rareté
   */
  static getBadgesByRarity() {
    const badges = Object.values(ONBOARDING_BADGES);
    const rarities = {
      legendary: badges.filter(b => b.rarity === 'legendary'),
      epic: badges.filter(b => b.rarity === 'epic'),
      rare: badges.filter(b => b.rarity === 'rare'),
      uncommon: badges.filter(b => b.rarity === 'uncommon'),
      common: badges.filter(b => b.rarity === 'common')
    };
    
    return rarities;
  }
}

export default OnboardingService;
