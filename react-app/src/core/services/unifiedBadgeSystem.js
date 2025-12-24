// ==========================================
// 📁 react-app/src/core/services/unifiedBadgeSystem.js
// SYSTÈME UNIFIÉ DE BADGES SYNERGIA v2.0
// Consolidation complète de tous les modules
// ==========================================

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// 🏆 DÉFINITIONS COMPLÈTES DES BADGES
// ==========================================

export const BADGE_CATEGORIES = {
  ONBOARDING: 'onboarding',
  PRODUCTIVITY: 'productivity',
  PROGRESSION: 'progression',
  COLLABORATION: 'collaboration',
  ENGAGEMENT: 'engagement',
  BOOST: 'boost',
  CHALLENGES: 'challenges',
  CAMPAIGNS: 'campaigns',
  RETROSPECTIVES: 'retrospectives',
  IDEAS: 'ideas',
  CHECKPOINTS: 'checkpoints',
  EXCELLENCE: 'excellence',
  SPECIAL: 'special',
  ROLES: 'roles'
};

export const BADGE_RARITY = {
  COMMON: { id: 'common', color: '#9CA3AF', bgColor: '#F3F4F6', label: 'Commun' },
  UNCOMMON: { id: 'uncommon', color: '#10B981', bgColor: '#ECFDF5', label: 'Peu commun' },
  RARE: { id: 'rare', color: '#3B82F6', bgColor: '#EFF6FF', label: 'Rare', glow: true },
  EPIC: { id: 'epic', color: '#8B5CF6', bgColor: '#F5F3FF', label: 'Épique', glow: true },
  LEGENDARY: { id: 'legendary', color: '#F59E0B', bgColor: '#FFFBEB', label: 'Légendaire', glow: true, animation: 'pulse' }
};

/**
 * 🏆 DÉFINITIONS COMPLÈTES DES BADGES - 100+ BADGES
 */
export const UNIFIED_BADGE_DEFINITIONS = {

  // ==========================================
  // 🚀 BADGES ONBOARDING (8 badges)
  // ==========================================

  first_login: {
    id: 'first_login',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    rarity: 'common',
    category: BADGE_CATEGORIES.ONBOARDING,
    xpReward: 10,
    autoCheck: (userData) => true,
    trigger: 'login'
  },

  profile_completed: {
    id: 'profile_completed',
    name: 'Profil Complet',
    description: 'Profil utilisateur entièrement rempli',
    icon: '👤',
    rarity: 'common',
    category: BADGE_CATEGORIES.ONBOARDING,
    xpReward: 25,
    autoCheck: (userData) => {
      const profile = userData.profile || {};
      return profile.firstName && profile.lastName && profile.department;
    },
    trigger: 'profile_update'
  },

  first_week: {
    id: 'first_week',
    name: 'Première Semaine',
    description: 'Une semaine d\'utilisation active',
    icon: '📅',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.ONBOARDING,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.activeDays || 0) >= 7,
    trigger: 'daily_login'
  },

  first_month: {
    id: 'first_month',
    name: 'Premier Mois',
    description: 'Un mois d\'utilisation active',
    icon: '🗓️',
    rarity: 'rare',
    category: BADGE_CATEGORIES.ONBOARDING,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.activeDays || 0) >= 30,
    trigger: 'daily_login'
  },

  // ==========================================
  // ✅ BADGES PRODUCTIVITÉ (12 badges)
  // ==========================================

  first_task: {
    id: 'first_task',
    name: 'Premier Pas',
    description: 'Première tâche créée',
    icon: '✅',
    rarity: 'common',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 15,
    autoCheck: (userData) => (userData.gamification?.tasksCreated || 0) >= 1,
    trigger: 'task_created'
  },

  task_completer: {
    id: 'task_completer',
    name: 'Finisseur',
    description: 'Première tâche complétée',
    icon: '🎯',
    rarity: 'common',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 20,
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 1,
    trigger: 'task_completed'
  },

  five_tasks: {
    id: 'five_tasks',
    name: '5 Quêtes',
    description: 'Compléter 5 quêtes',
    icon: '📋',
    rarity: 'common',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 35,
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 5,
    trigger: 'task_completed'
  },

  task_enthusiast: {
    id: 'task_enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter 10 tâches',
    icon: '🔥',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 10,
    trigger: 'task_completed'
  },

  task_expert: {
    id: 'task_expert',
    name: 'Expert',
    description: 'Compléter 50 tâches',
    icon: '⚡',
    rarity: 'rare',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 50,
    trigger: 'task_completed'
  },

  task_master: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Compléter 100 tâches',
    icon: '👑',
    rarity: 'epic',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 300,
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 100,
    trigger: 'task_completed'
  },

  productivity_legend: {
    id: 'productivity_legend',
    name: 'Légende de Productivité',
    description: 'Compléter 500 tâches',
    icon: '🏆',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 1000,
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 500,
    trigger: 'task_completed'
  },

  speed_demon: {
    id: 'speed_demon',
    name: 'Démon de Vitesse',
    description: 'Compléter 5 tâches en une journée',
    icon: '💨',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 75,
    autoCheck: (userData) => (userData.gamification?.dailyTasksRecord || 0) >= 5,
    trigger: 'task_completed'
  },

  early_bird: {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Compléter une tâche avant 8h',
    icon: '🌅',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 50,
    autoCheck: (userData) => userData.gamification?.earlyBirdUnlocked === true,
    trigger: 'task_completed'
  },

  night_owl: {
    id: 'night_owl',
    name: 'Oiseau de Nuit',
    description: 'Compléter une tâche après 22h',
    icon: '🦉',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 50,
    autoCheck: (userData) => userData.gamification?.nightOwlUnlocked === true,
    trigger: 'task_completed'
  },

  deadline_champion: {
    id: 'deadline_champion',
    name: 'Champion des Délais',
    description: 'Compléter 25 tâches avant leur deadline',
    icon: '⏰',
    rarity: 'rare',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 120,
    autoCheck: (userData) => (userData.gamification?.onTimeDeliveries || 0) >= 25,
    trigger: 'task_completed'
  },

  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Maintenir un taux de validation de 95%+ sur 50 tâches',
    icon: '✨',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    xpReward: 500,
    autoCheck: (userData) => {
      const completed = userData.gamification?.tasksCompleted || 0;
      const validated = userData.gamification?.tasksValidated || 0;
      const rate = completed > 0 ? (validated / completed) * 100 : 0;
      return completed >= 50 && rate >= 95;
    },
    trigger: 'task_validated'
  },

  // ==========================================
  // 📈 BADGES PROGRESSION (8 badges)
  // ==========================================

  level_5: {
    id: 'level_5',
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '🌟',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 75,
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 5,
    trigger: 'level_up'
  },

  level_10: {
    id: 'level_10',
    name: 'Niveau 10',
    description: 'Atteindre le niveau 10',
    icon: '💎',
    rarity: 'rare',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 10,
    trigger: 'level_up'
  },

  level_25: {
    id: 'level_25',
    name: 'Expert Synergia',
    description: 'Atteindre le niveau 25',
    icon: '🔥',
    rarity: 'epic',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 400,
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 25,
    trigger: 'level_up'
  },

  level_50: {
    id: 'level_50',
    name: 'Maître Synergia',
    description: 'Atteindre le niveau 50',
    icon: '⚡',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 1500,
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 50,
    trigger: 'level_up'
  },

  xp_collector: {
    id: 'xp_collector',
    name: 'Collectionneur XP',
    description: 'Atteindre 1000 XP total',
    icon: '💎',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.totalXp || 0) >= 1000,
    trigger: 'xp_gained'
  },

  xp_millionaire: {
    id: 'xp_millionaire',
    name: 'Millionnaire XP',
    description: 'Atteindre 10000 XP total',
    icon: '💰',
    rarity: 'epic',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 250,
    autoCheck: (userData) => (userData.gamification?.totalXp || 0) >= 10000,
    trigger: 'xp_gained'
  },

  rising_star: {
    id: 'rising_star',
    name: 'Étoile Montante',
    description: 'Progression rapide en une semaine',
    icon: '⭐',
    rarity: 'rare',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.weeklyXpGain || 0) >= 500,
    trigger: 'xp_gained'
  },

  veteran: {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Un an d\'ancienneté sur Synergia',
    icon: '🏛️',
    rarity: 'epic',
    category: BADGE_CATEGORIES.PROGRESSION,
    xpReward: 365,
    autoCheck: (userData) => {
      if (!userData.createdAt) return false;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const joinDate = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
      return joinDate <= oneYearAgo;
    },
    trigger: 'daily_login'
  },

  // ==========================================
  // 🔥 BADGES ENGAGEMENT (8 badges)
  // ==========================================

  daily_user: {
    id: 'daily_user',
    name: 'Utilisateur Quotidien',
    description: 'Se connecter 7 jours consécutifs',
    icon: '📅',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.ENGAGEMENT,
    xpReward: 60,
    autoCheck: (userData) => (userData.gamification?.loginStreak || 0) >= 7,
    trigger: 'daily_login'
  },

  streak_champion: {
    id: 'streak_champion',
    name: 'Champion de Série',
    description: 'Se connecter 30 jours consécutifs',
    icon: '🔥',
    rarity: 'rare',
    category: BADGE_CATEGORIES.ENGAGEMENT,
    xpReward: 200,
    autoCheck: (userData) => (userData.gamification?.loginStreak || 0) >= 30,
    trigger: 'daily_login'
  },

  dedication_master: {
    id: 'dedication_master',
    name: 'Maître du Dévouement',
    description: 'Se connecter 100 jours consécutifs',
    icon: '💪',
    rarity: 'epic',
    category: BADGE_CATEGORIES.ENGAGEMENT,
    xpReward: 500,
    autoCheck: (userData) => (userData.gamification?.loginStreak || 0) >= 100,
    trigger: 'daily_login'
  },

  comeback_kid: {
    id: 'comeback_kid',
    name: 'Retour Gagnant',
    description: 'Revenir après 7+ jours d\'absence',
    icon: '🔄',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.ENGAGEMENT,
    xpReward: 50,
    autoCheck: (userData) => userData.gamification?.comebackUnlocked === true,
    trigger: 'daily_login'
  },

  // ==========================================
  // 👥 BADGES COLLABORATION (8 badges)
  // ==========================================

  team_player: {
    id: 'team_player',
    name: 'Joueur d\'Équipe',
    description: 'Rejoindre sa première équipe',
    icon: '🤝',
    rarity: 'common',
    category: BADGE_CATEGORIES.COLLABORATION,
    xpReward: 30,
    autoCheck: (userData) => (userData.gamification?.teamsJoined || 0) >= 1,
    trigger: 'team_joined'
  },

  collaborator: {
    id: 'collaborator',
    name: 'Collaborateur',
    description: 'Participer à 5 projets collaboratifs',
    icon: '👥',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.COLLABORATION,
    xpReward: 80,
    autoCheck: (userData) => (userData.gamification?.collaborativeProjects || 0) >= 5,
    trigger: 'project_joined'
  },

  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Responsable d\'un·e stagiaire durant toute la période de stage ! Badge acquis au terme du stage si le·a stagiaire valide le mentorat !',
    icon: '👨‍🏫',
    rarity: 'rare',
    category: BADGE_CATEGORIES.COLLABORATION,
    xpReward: 300,
    autoCheck: (userData) => (userData.gamification?.stagiairesValidated || 0) >= 1,
    trigger: 'mentoring_completed'
  },

  communicator: {
    id: 'communicator',
    name: 'Communicateur',
    description: 'Poster 25 commentaires',
    icon: '💬',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.COLLABORATION,
    xpReward: 70,
    autoCheck: (userData) => (userData.gamification?.commentsPosted || 0) >= 25,
    trigger: 'comment_posted'
  },

  // ==========================================
  // 💖 BADGES BOOST (10 badges)
  // ==========================================

  first_boost: {
    id: 'first_boost',
    name: 'Premier Encouragement',
    description: 'Envoyer son premier Boost',
    icon: '💖',
    rarity: 'common',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 15,
    autoCheck: (userData) => (userData.gamification?.boostsSent || 0) >= 1,
    trigger: 'boost_sent'
  },

  boost_giver: {
    id: 'boost_giver',
    name: 'Donneur d\'Énergie',
    description: 'Envoyer 10 Boosts',
    icon: '⚡',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.boostsSent || 0) >= 10,
    trigger: 'boost_sent'
  },

  boost_champion: {
    id: 'boost_champion',
    name: 'Champion du Boost',
    description: 'Envoyer 50 Boosts',
    icon: '🌟',
    rarity: 'rare',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.boostsSent || 0) >= 50,
    trigger: 'boost_sent'
  },

  boost_legend: {
    id: 'boost_legend',
    name: 'Légende du Boost',
    description: 'Envoyer 100 Boosts',
    icon: '👑',
    rarity: 'epic',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 300,
    autoCheck: (userData) => (userData.gamification?.boostsSent || 0) >= 100,
    trigger: 'boost_sent'
  },

  boost_received_first: {
    id: 'boost_received_first',
    name: 'Première Étoile',
    description: 'Recevoir son premier Boost',
    icon: '✨',
    rarity: 'common',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 10,
    autoCheck: (userData) => (userData.gamification?.boostsReceived || 0) >= 1,
    trigger: 'boost_received'
  },

  boost_popular: {
    id: 'boost_popular',
    name: 'Populaire',
    description: 'Recevoir 25 Boosts',
    icon: '🔥',
    rarity: 'rare',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.boostsReceived || 0) >= 25,
    trigger: 'boost_received'
  },

  boost_superstar: {
    id: 'boost_superstar',
    name: 'Superstar',
    description: 'Recevoir 100 Boosts',
    icon: '🌈',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 500,
    autoCheck: (userData) => (userData.gamification?.boostsReceived || 0) >= 100,
    trigger: 'boost_received'
  },

  boost_variety: {
    id: 'boost_variety',
    name: 'Multi-Booster',
    description: 'Envoyer des Boosts à 10 personnes différentes',
    icon: '🎯',
    rarity: 'rare',
    category: BADGE_CATEGORIES.BOOST,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.uniqueBoostRecipients || 0) >= 10,
    trigger: 'boost_sent'
  },

  // ==========================================
  // 🎯 BADGES DÉFIS (10 badges)
  // ==========================================

  first_challenge: {
    id: 'first_challenge',
    name: 'Premier Défi',
    description: 'Proposer son premier défi',
    icon: '🎯',
    rarity: 'common',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 20,
    autoCheck: (userData) => (userData.gamification?.challengesCreated || 0) >= 1,
    trigger: 'challenge_created'
  },

  challenge_completer: {
    id: 'challenge_completer',
    name: 'Défi Relevé',
    description: 'Compléter son premier défi',
    icon: '🏅',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.challengesCompleted || 0) >= 1,
    trigger: 'challenge_completed'
  },

  challenge_warrior: {
    id: 'challenge_warrior',
    name: 'Guerrier des Défis',
    description: 'Compléter 10 défis',
    icon: '⚔️',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.challengesCompleted || 0) >= 10,
    trigger: 'challenge_completed'
  },

  challenge_master: {
    id: 'challenge_master',
    name: 'Maître des Défis',
    description: 'Compléter 25 défis',
    icon: '🏆',
    rarity: 'epic',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 350,
    autoCheck: (userData) => (userData.gamification?.challengesCompleted || 0) >= 25,
    trigger: 'challenge_completed'
  },

  challenge_legend: {
    id: 'challenge_legend',
    name: 'Légende des Défis',
    description: 'Compléter 50 défis',
    icon: '👑',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 1000,
    autoCheck: (userData) => (userData.gamification?.challengesCompleted || 0) >= 50,
    trigger: 'challenge_completed'
  },

  hard_challenge_completer: {
    id: 'hard_challenge_completer',
    name: 'Courageux',
    description: 'Compléter un défi difficile',
    icon: '💪',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.hardChallengesCompleted || 0) >= 1,
    trigger: 'challenge_completed'
  },

  challenge_creator: {
    id: 'challenge_creator',
    name: 'Créateur de Défis',
    description: 'Créer 5 défis adoptés par d\'autres',
    icon: '💡',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CHALLENGES,
    xpReward: 120,
    autoCheck: (userData) => (userData.gamification?.challengesAdopted || 0) >= 5,
    trigger: 'challenge_adopted'
  },

  // ==========================================
  // ⚔️ BADGES CAMPAGNES (12 badges)
  // ==========================================

  first_campaign: {
    id: 'first_campaign',
    name: 'Première Campagne',
    description: 'Participer à sa première campagne',
    icon: '🏰',
    rarity: 'common',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 25,
    autoCheck: (userData) => (userData.gamification?.campaignsJoined || 0) >= 1,
    trigger: 'campaign_joined'
  },

  campaign_veteran: {
    id: 'campaign_veteran',
    name: 'Vétéran de Campagne',
    description: 'Participer à 5 campagnes',
    icon: '⚔️',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.campaignsJoined || 0) >= 5,
    trigger: 'campaign_joined'
  },

  campaign_winner: {
    id: 'campaign_winner',
    name: 'Victorieux',
    description: 'Terminer une campagne avec succès',
    icon: '🏆',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 200,
    autoCheck: (userData) => (userData.gamification?.campaignsCompleted || 0) >= 1,
    trigger: 'campaign_completed'
  },

  campaign_conqueror: {
    id: 'campaign_conqueror',
    name: 'Conquérant',
    description: 'Terminer 5 campagnes avec succès',
    icon: '👑',
    rarity: 'epic',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 500,
    autoCheck: (userData) => (userData.gamification?.campaignsCompleted || 0) >= 5,
    trigger: 'campaign_completed'
  },

  campaign_leader: {
    id: 'campaign_leader',
    name: 'Meneur de Campagne',
    description: 'Créer et mener une campagne jusqu\'à la victoire',
    icon: '🎖️',
    rarity: 'epic',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 400,
    autoCheck: (userData) => (userData.gamification?.campaignsLed || 0) >= 1,
    trigger: 'campaign_led'
  },

  campaign_legend: {
    id: 'campaign_legend',
    name: 'Légende des Campagnes',
    description: 'Mener 10 campagnes victorieuses',
    icon: '🌟',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 1500,
    autoCheck: (userData) => (userData.gamification?.campaignsLed || 0) >= 10,
    trigger: 'campaign_led'
  },

  campaign_mvp: {
    id: 'campaign_mvp',
    name: 'MVP de Campagne',
    description: 'Être désigné MVP d\'une campagne',
    icon: '🥇',
    rarity: 'epic',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 300,
    autoCheck: (userData) => (userData.gamification?.campaignMVPs || 0) >= 1,
    trigger: 'campaign_mvp'
  },

  campaign_contributor: {
    id: 'campaign_contributor',
    name: 'Contributeur Assidu',
    description: 'Compléter 50 tâches dans les campagnes',
    icon: '🎯',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CAMPAIGNS,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.campaignTasksCompleted || 0) >= 50,
    trigger: 'campaign_task_completed'
  },

  // ==========================================
  // 🔄 BADGES RÉTROSPECTIVES (10 badges) - NOUVEAU MODULE
  // ==========================================

  first_retro: {
    id: 'first_retro',
    name: 'Première Rétro',
    description: 'Participer à sa première rétrospective',
    icon: '🔄',
    rarity: 'common',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 25,
    autoCheck: (userData) => (userData.gamification?.retroParticipations || 0) >= 1,
    trigger: 'retro_participated'
  },

  retro_regular: {
    id: 'retro_regular',
    name: 'Habitué des Rétros',
    description: 'Participer à 5 rétrospectives',
    icon: '📊',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 75,
    autoCheck: (userData) => (userData.gamification?.retroParticipations || 0) >= 5,
    trigger: 'retro_participated'
  },

  retro_veteran: {
    id: 'retro_veteran',
    name: 'Vétéran des Rétros',
    description: 'Participer à 20 rétrospectives',
    icon: '🏅',
    rarity: 'rare',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 200,
    autoCheck: (userData) => (userData.gamification?.retroParticipations || 0) >= 20,
    trigger: 'retro_participated'
  },

  first_retro_animator: {
    id: 'first_retro_animator',
    name: 'Premier Animateur',
    description: 'Animer sa première rétrospective',
    icon: '🎯',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 40,
    autoCheck: (userData) => (userData.gamification?.retrosAnimated || 0) >= 1,
    trigger: 'retro_animated'
  },

  retro_facilitator: {
    id: 'retro_facilitator',
    name: 'Facilitateur',
    description: 'Animer 5 rétrospectives',
    icon: '🎙️',
    rarity: 'rare',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.retrosAnimated || 0) >= 5,
    trigger: 'retro_animated'
  },

  retro_master: {
    id: 'retro_master',
    name: 'Maître des Rétros',
    description: 'Animer 15 rétrospectives',
    icon: '👑',
    rarity: 'epic',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 350,
    autoCheck: (userData) => (userData.gamification?.retrosAnimated || 0) >= 15,
    trigger: 'retro_animated'
  },

  retro_contributor: {
    id: 'retro_contributor',
    name: 'Contributeur Actif',
    description: 'Proposer 25 points en rétrospective',
    icon: '💬',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 60,
    autoCheck: (userData) => (userData.gamification?.retroItemsAdded || 0) >= 25,
    trigger: 'retro_item_added'
  },

  retro_action_hero: {
    id: 'retro_action_hero',
    name: 'Héros des Actions',
    description: 'Compléter 10 actions issues de rétrospectives',
    icon: '⚡',
    rarity: 'rare',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 120,
    autoCheck: (userData) => (userData.gamification?.retroActionsCompleted || 0) >= 10,
    trigger: 'retro_action_completed'
  },

  retro_scribe: {
    id: 'retro_scribe',
    name: 'Scribe Expert',
    description: 'Être scribe dans 5 rétrospectives',
    icon: '📝',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.retroScribeCount || 0) >= 5,
    trigger: 'retro_role_assigned'
  },

  retro_timekeeper: {
    id: 'retro_timekeeper',
    name: 'Gardien du Temps',
    description: 'Être time-keeper dans 5 rétrospectives',
    icon: '⏱️',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.RETROSPECTIVES,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.retroTimekeeperCount || 0) >= 5,
    trigger: 'retro_role_assigned'
  },

  // ==========================================
  // 💡 BADGES BOÎTE À IDÉES (10 badges) - NOUVEAU MODULE
  // ==========================================

  first_idea: {
    id: 'first_idea',
    name: 'Première Idée',
    description: 'Soumettre sa première idée',
    icon: '💡',
    rarity: 'common',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 10,
    autoCheck: (userData) => (userData.gamification?.ideasSubmitted || 0) >= 1,
    trigger: 'idea_submitted'
  },

  idea_machine: {
    id: 'idea_machine',
    name: 'Machine à Idées',
    description: 'Soumettre 10 idées',
    icon: '🧠',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 75,
    autoCheck: (userData) => (userData.gamification?.ideasSubmitted || 0) >= 10,
    trigger: 'idea_submitted'
  },

  idea_factory: {
    id: 'idea_factory',
    name: 'Usine à Idées',
    description: 'Soumettre 50 idées',
    icon: '🏭',
    rarity: 'rare',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 200,
    autoCheck: (userData) => (userData.gamification?.ideasSubmitted || 0) >= 50,
    trigger: 'idea_submitted'
  },

  innovator: {
    id: 'innovator',
    name: 'Innovateur',
    description: 'Avoir une idée adoptée',
    icon: '🚀',
    rarity: 'rare',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.ideasAdopted || 0) >= 1,
    trigger: 'idea_adopted'
  },

  builder: {
    id: 'builder',
    name: 'Bâtisseur',
    description: 'Avoir une idée implémentée',
    icon: '🏗️',
    rarity: 'epic',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 200,
    autoCheck: (userData) => (userData.gamification?.ideasImplemented || 0) >= 1,
    trigger: 'idea_implemented'
  },

  visionary: {
    id: 'visionary',
    name: 'Visionnaire',
    description: 'Avoir 5 idées implémentées',
    icon: '🔮',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 500,
    autoCheck: (userData) => (userData.gamification?.ideasImplemented || 0) >= 5,
    trigger: 'idea_implemented'
  },

  idea_voter: {
    id: 'idea_voter',
    name: 'Votant Actif',
    description: 'Voter pour 25 idées',
    icon: '👍',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 40,
    autoCheck: (userData) => (userData.gamification?.ideaVotes || 0) >= 25,
    trigger: 'idea_voted'
  },

  idea_popular: {
    id: 'idea_popular',
    name: 'Idée Populaire',
    description: 'Recevoir 20 votes sur une idée',
    icon: '🌟',
    rarity: 'rare',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.maxIdeaVotes || 0) >= 20,
    trigger: 'idea_vote_received'
  },

  idea_commenter: {
    id: 'idea_commenter',
    name: 'Commentateur',
    description: 'Commenter 25 idées',
    icon: '💬',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 50,
    autoCheck: (userData) => (userData.gamification?.ideaComments || 0) >= 25,
    trigger: 'idea_commented'
  },

  idea_champion: {
    id: 'idea_champion',
    name: 'Champion des Idées',
    description: 'Avoir 3 idées adoptées',
    icon: '🏆',
    rarity: 'epic',
    category: BADGE_CATEGORIES.IDEAS,
    xpReward: 250,
    autoCheck: (userData) => (userData.gamification?.ideasAdopted || 0) >= 3,
    trigger: 'idea_adopted'
  },

  // ==========================================
  // ✓ BADGES CHECKPOINTS (8 badges) - NOUVEAU MODULE
  // ==========================================

  first_checkpoint: {
    id: 'first_checkpoint',
    name: 'Premier Checkpoint',
    description: 'Compléter son premier checkpoint',
    icon: '✓',
    rarity: 'common',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 15,
    autoCheck: (userData) => (userData.gamification?.checkpointsCompleted || 0) >= 1,
    trigger: 'checkpoint_completed'
  },

  checkpoint_regular: {
    id: 'checkpoint_regular',
    name: 'Régulier',
    description: 'Compléter 10 checkpoints',
    icon: '📋',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 60,
    autoCheck: (userData) => (userData.gamification?.checkpointsCompleted || 0) >= 10,
    trigger: 'checkpoint_completed'
  },

  checkpoint_pro: {
    id: 'checkpoint_pro',
    name: 'Pro des Checkpoints',
    description: 'Compléter 50 checkpoints',
    icon: '🎯',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.checkpointsCompleted || 0) >= 50,
    trigger: 'checkpoint_completed'
  },

  checkpoint_master: {
    id: 'checkpoint_master',
    name: 'Maître des Checkpoints',
    description: 'Compléter 100 checkpoints',
    icon: '👑',
    rarity: 'epic',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 300,
    autoCheck: (userData) => (userData.gamification?.checkpointsCompleted || 0) >= 100,
    trigger: 'checkpoint_completed'
  },

  checkpoint_validator: {
    id: 'checkpoint_validator',
    name: 'Validateur',
    description: 'Valider 25 checkpoints d\'équipe',
    icon: '✅',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.checkpointsValidated || 0) >= 25,
    trigger: 'checkpoint_validated'
  },

  checkpoint_streak: {
    id: 'checkpoint_streak',
    name: 'Série de Checkpoints',
    description: 'Compléter des checkpoints 7 jours consécutifs',
    icon: '🔥',
    rarity: 'rare',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.checkpointStreak || 0) >= 7,
    trigger: 'checkpoint_completed'
  },

  checkpoint_perfect: {
    id: 'checkpoint_perfect',
    name: 'Sans Faute',
    description: 'Taux de validation de 100% sur 25 checkpoints',
    icon: '💯',
    rarity: 'epic',
    category: BADGE_CATEGORIES.CHECKPOINTS,
    xpReward: 200,
    autoCheck: (userData) => {
      const completed = userData.gamification?.checkpointsCompleted || 0;
      const validated = userData.gamification?.checkpointsValidatedFirst || 0;
      return completed >= 25 && validated === completed;
    },
    trigger: 'checkpoint_validated'
  },

  // ==========================================
  // 🌟 BADGES EXCELLENCE (6 badges)
  // ==========================================

  synergia_ambassador: {
    id: 'synergia_ambassador',
    name: 'Ambassadeur Synergia',
    description: 'Incarner parfaitement les valeurs de Synergia',
    icon: '🌟',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.EXCELLENCE,
    xpReward: 2000,
    autoCheck: (userData) => {
      return (userData.gamification?.level || 1) >= 30 &&
             (userData.gamification?.totalXp || 0) >= 5000 &&
             (userData.gamification?.teamContributions || 0) >= 50;
    },
    trigger: 'manual'
  },

  innovation_pioneer: {
    id: 'innovation_pioneer',
    name: 'Pionnier de l\'Innovation',
    description: 'Révolutionner une méthode de travail',
    icon: '🚀',
    rarity: 'legendary',
    category: BADGE_CATEGORIES.EXCELLENCE,
    xpReward: 3000,
    autoCheck: (userData) => userData.gamification?.innovationPioneer === true,
    trigger: 'manual'
  },

  all_rounder: {
    id: 'all_rounder',
    name: 'Polyvalent',
    description: 'Obtenir un badge dans chaque catégorie',
    icon: '🎭',
    rarity: 'epic',
    category: BADGE_CATEGORIES.EXCELLENCE,
    xpReward: 500,
    autoCheck: (userData) => {
      const badges = userData.gamification?.badges || [];
      const categories = new Set(badges.map(b => b.category));
      return categories.size >= Object.keys(BADGE_CATEGORIES).length - 2; // -2 for special and roles
    },
    trigger: 'badge_unlocked'
  },

  badge_collector_bronze: {
    id: 'badge_collector_bronze',
    name: 'Collectionneur Bronze',
    description: 'Obtenir 10 badges',
    icon: '🥉',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.EXCELLENCE,
    xpReward: 75,
    autoCheck: (userData) => (userData.gamification?.badges?.length || 0) >= 10,
    trigger: 'badge_unlocked'
  },

  badge_collector_silver: {
    id: 'badge_collector_silver',
    name: 'Collectionneur Argent',
    description: 'Obtenir 25 badges',
    icon: '🥈',
    rarity: 'rare',
    category: BADGE_CATEGORIES.EXCELLENCE,
    xpReward: 150,
    autoCheck: (userData) => (userData.gamification?.badges?.length || 0) >= 25,
    trigger: 'badge_unlocked'
  },

  badge_collector_gold: {
    id: 'badge_collector_gold',
    name: 'Collectionneur Or',
    description: 'Obtenir 50 badges',
    icon: '🥇',
    rarity: 'epic',
    category: BADGE_CATEGORIES.EXCELLENCE,
    xpReward: 400,
    autoCheck: (userData) => (userData.gamification?.badges?.length || 0) >= 50,
    trigger: 'badge_unlocked'
  },

  // ==========================================
  // 🎮 BADGES SPÉCIAUX (6 badges)
  // ==========================================

  beta_tester: {
    id: 'beta_tester',
    name: 'Testeur Bêta',
    description: 'Participer à la phase bêta de Synergia',
    icon: '🧪',
    rarity: 'rare',
    category: BADGE_CATEGORIES.SPECIAL,
    xpReward: 250,
    autoCheck: (userData) => userData.gamification?.betaTester === true,
    trigger: 'manual'
  },

  bug_hunter: {
    id: 'bug_hunter',
    name: 'Chasseur de Bugs',
    description: 'Signaler 5 bugs critiques',
    icon: '🐛',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.SPECIAL,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.bugsReported || 0) >= 5,
    trigger: 'bug_reported'
  },

  feature_suggester: {
    id: 'feature_suggester',
    name: 'Suggéreur de Fonctionnalités',
    description: 'Proposer 3 améliorations adoptées',
    icon: '💡',
    rarity: 'rare',
    category: BADGE_CATEGORIES.SPECIAL,
    xpReward: 200,
    autoCheck: (userData) => (userData.gamification?.featuresAdopted || 0) >= 3,
    trigger: 'feature_adopted'
  },

  anniversary_year_one: {
    id: 'anniversary_year_one',
    name: 'Un An avec Synergia',
    description: 'Célébrer sa première année sur Synergia',
    icon: '🎂',
    rarity: 'epic',
    category: BADGE_CATEGORIES.SPECIAL,
    xpReward: 365,
    autoCheck: (userData) => {
      if (!userData.createdAt) return false;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const joinDate = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
      return joinDate <= oneYearAgo;
    },
    trigger: 'daily_login'
  },

  holiday_spirit: {
    id: 'holiday_spirit',
    name: 'Esprit de Fête',
    description: 'Se connecter pendant les fêtes de fin d\'année',
    icon: '🎄',
    rarity: 'uncommon',
    category: BADGE_CATEGORIES.SPECIAL,
    xpReward: 50,
    autoCheck: (userData) => userData.gamification?.holidaySpirit === true,
    trigger: 'seasonal'
  },

  night_warrior: {
    id: 'night_warrior',
    name: 'Guerrier Nocturne',
    description: 'Compléter 10 tâches après 20h',
    icon: '🌙',
    rarity: 'rare',
    category: BADGE_CATEGORIES.SPECIAL,
    xpReward: 100,
    autoCheck: (userData) => (userData.gamification?.nightTasks || 0) >= 10,
    trigger: 'task_completed'
  }
};

// ==========================================
// 📊 STATISTIQUES DES BADGES
// ==========================================

export const calculateBadgeStats = () => {
  const badges = Object.values(UNIFIED_BADGE_DEFINITIONS);

  return {
    total: badges.length,
    byRarity: {
      common: badges.filter(b => b.rarity === 'common').length,
      uncommon: badges.filter(b => b.rarity === 'uncommon').length,
      rare: badges.filter(b => b.rarity === 'rare').length,
      epic: badges.filter(b => b.rarity === 'epic').length,
      legendary: badges.filter(b => b.rarity === 'legendary').length
    },
    byCategory: Object.keys(BADGE_CATEGORIES).reduce((acc, cat) => {
      acc[BADGE_CATEGORIES[cat]] = badges.filter(b => b.category === BADGE_CATEGORIES[cat]).length;
      return acc;
    }, {}),
    totalXpAvailable: badges.reduce((total, badge) => total + badge.xpReward, 0)
  };
};

// ==========================================
// 🏆 SERVICE UNIFIÉ DE BADGES
// ==========================================

class UnifiedBadgeService {
  constructor() {
    this.badgeDefinitions = UNIFIED_BADGE_DEFINITIONS;
    this.stats = calculateBadgeStats();
    console.log('🏆 [UNIFIED] Service de badges initialisé avec', this.stats.total, 'badges');
  }

  /**
   * 🔍 VÉRIFIER ET DÉBLOQUER LES BADGES
   */
  async checkAndUnlockBadges(userId, triggerType = 'automatic') {
    try {
      console.log('🔍 [UNIFIED] Vérification badges pour:', userId, 'trigger:', triggerType);

      // Récupérer les données utilisateur
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn('⚠️ [UNIFIED] Utilisateur non trouvé:', userId);
        return { success: false, newBadges: [], message: 'Utilisateur non trouvé' };
      }

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      const currentBadgeIds = currentBadges.map(b => b.id);

      const newlyUnlocked = [];

      // Vérifier chaque badge
      for (const [badgeId, badgeDef] of Object.entries(this.badgeDefinitions)) {
        // Skip si déjà obtenu
        if (currentBadgeIds.includes(badgeId)) continue;

        // Vérifier si le trigger correspond
        if (triggerType !== 'automatic' && badgeDef.trigger !== triggerType && badgeDef.trigger !== 'manual') {
          continue;
        }

        try {
          // Vérifier la condition
          if (typeof badgeDef.autoCheck === 'function' && badgeDef.autoCheck(userData)) {
            const newBadge = {
              id: badgeId,
              name: badgeDef.name,
              description: badgeDef.description,
              icon: badgeDef.icon,
              rarity: badgeDef.rarity,
              category: badgeDef.category,
              xpReward: badgeDef.xpReward,
              unlockedAt: new Date().toISOString(),
              trigger: triggerType
            };
            newlyUnlocked.push(newBadge);
          }
        } catch (error) {
          console.warn(`⚠️ [UNIFIED] Erreur vérification badge ${badgeId}:`, error.message);
        }
      }

      // Sauvegarder les nouveaux badges
      if (newlyUnlocked.length > 0) {
        await this.saveBadges(userId, userData, newlyUnlocked);
      }

      console.log(`✅ [UNIFIED] ${newlyUnlocked.length} nouveaux badges débloqués`);
      return { success: true, newBadges: newlyUnlocked };

    } catch (error) {
      console.error('❌ [UNIFIED] Erreur vérification badges:', error);
      return { success: false, newBadges: [], error: error.message };
    }
  }

  /**
   * 💾 SAUVEGARDER LES BADGES - VERSION SÉCURISÉE
   */
  async saveBadges(userId, userData, newBadges) {
    try {
      const userRef = doc(db, 'users', userId);
      const currentBadges = userData.gamification?.badges || [];
      const allBadges = [...currentBadges, ...newBadges];

      const totalXpFromNewBadges = newBadges.reduce((total, b) => total + (b.xpReward || 0), 0);
      const currentTotalXp = userData.gamification?.totalXp || 0;

      // ✅ Utiliser setDoc avec merge pour éviter les problèmes de serverTimestamp
      await setDoc(userRef, {
        gamification: {
          ...userData.gamification,
          badges: allBadges,
          badgesUnlocked: allBadges.length,
          totalXp: currentTotalXp + totalXpFromNewBadges,
          lastBadgeUnlock: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Déclencher les notifications
      newBadges.forEach(badge => {
        this.triggerNotification(badge);
      });

      console.log(`✅ [UNIFIED] ${newBadges.length} badges sauvegardés, +${totalXpFromNewBadges} XP`);
      return { success: true };

    } catch (error) {
      console.error('❌ [UNIFIED] Erreur sauvegarde badges:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎊 DÉCLENCHER NOTIFICATION
   */
  triggerNotification(badge) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('badgeUnlocked', {
        detail: { badge, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    }
    console.log(`🎊 [UNIFIED] Badge débloqué: ${badge.name} (+${badge.xpReward} XP)`);
  }

  /**
   * 🏅 ATTRIBUER UN BADGE MANUELLEMENT (ADMIN)
   */
  async awardBadgeManually(userId, badgeId, adminId, reason = 'Attribué par admin') {
    try {
      console.log(`🏅 [ADMIN] Attribution manuelle: ${badgeId} à ${userId}`);

      const badgeDef = this.badgeDefinitions[badgeId];
      if (!badgeDef) {
        return { success: false, message: 'Badge non trouvé dans les définitions' };
      }

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];

      // Vérifier si déjà obtenu
      if (currentBadges.some(b => b.id === badgeId)) {
        return { success: false, message: 'Badge déjà attribué' };
      }

      const newBadge = {
        id: badgeId,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        rarity: badgeDef.rarity,
        category: badgeDef.category,
        xpReward: badgeDef.xpReward,
        unlockedAt: new Date().toISOString(),
        awardedBy: adminId,
        awardedReason: reason,
        isManual: true
      };

      await this.saveBadges(userId, userData, [newBadge]);

      return { success: true, badge: newBadge };

    } catch (error) {
      console.error('❌ [ADMIN] Erreur attribution manuelle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UN BADGE (ADMIN)
   */
  async removeBadge(userId, badgeId, adminId) {
    try {
      console.log(`🗑️ [ADMIN] Retrait badge: ${badgeId} de ${userId}`);

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      const badgeToRemove = currentBadges.find(b => b.id === badgeId);

      if (!badgeToRemove) {
        return { success: false, message: 'Badge non trouvé chez cet utilisateur' };
      }

      const updatedBadges = currentBadges.filter(b => b.id !== badgeId);
      const xpToRemove = badgeToRemove.xpReward || 0;
      const currentTotalXp = userData.gamification?.totalXp || 0;

      await setDoc(userRef, {
        gamification: {
          ...userData.gamification,
          badges: updatedBadges,
          badgesUnlocked: updatedBadges.length,
          totalXp: Math.max(0, currentTotalXp - xpToRemove),
          lastBadgeRemoval: new Date().toISOString(),
          removedBy: adminId
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log(`✅ [ADMIN] Badge retiré: ${badgeId}, -${xpToRemove} XP`);
      return { success: true };

    } catch (error) {
      console.error('❌ [ADMIN] Erreur retrait badge:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES UTILISATEUR
   */
  async getUserBadgeStats(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const userData = userSnap.data();
      const userBadges = userData.gamification?.badges || [];
      const allBadges = Object.values(this.badgeDefinitions);

      // Calculer les stats par catégorie
      const byCategory = {};
      Object.values(BADGE_CATEGORIES).forEach(cat => {
        const total = allBadges.filter(b => b.category === cat).length;
        const earned = userBadges.filter(b => b.category === cat).length;
        byCategory[cat] = { earned, total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
      });

      // Calculer les stats par rareté
      const byRarity = {};
      Object.keys(BADGE_RARITY).forEach(rarity => {
        const r = rarity.toLowerCase();
        const total = allBadges.filter(b => b.rarity === r).length;
        const earned = userBadges.filter(b => b.rarity === r).length;
        byRarity[r] = { earned, total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
      });

      return {
        total: allBadges.length,
        earned: userBadges.length,
        percentage: Math.round((userBadges.length / allBadges.length) * 100),
        totalXpFromBadges: userBadges.reduce((sum, b) => sum + (b.xpReward || 0), 0),
        byCategory,
        byRarity,
        recentBadges: userBadges.slice(-5).reverse(),
        nextBadges: this.getNextBadges(userData, 3)
      };

    } catch (error) {
      console.error('❌ [UNIFIED] Erreur stats utilisateur:', error);
      return null;
    }
  }

  /**
   * 🎯 OBTENIR LES PROCHAINS BADGES
   */
  getNextBadges(userData, limit = 3) {
    const userBadges = userData.gamification?.badges || [];
    const earnedIds = userBadges.map(b => b.id);

    const available = Object.entries(this.badgeDefinitions)
      .filter(([id]) => !earnedIds.includes(id))
      .map(([id, def]) => {
        // Calculer la progression approximative
        let progress = 0;
        try {
          if (typeof def.autoCheck === 'function') {
            // On ne peut pas vraiment calculer la progression sans connaître les seuils
            // Pour l'instant, on retourne 0
            progress = 0;
          }
        } catch (e) {
          progress = 0;
        }
        return { ...def, progress };
      })
      .sort((a, b) => {
        // Prioriser les badges avec le plus de progression
        if (b.progress !== a.progress) return b.progress - a.progress;
        // Puis par XP reward (plus faciles d'abord)
        return a.xpReward - b.xpReward;
      });

    return available.slice(0, limit);
  }

  /**
   * 📋 OBTENIR TOUS LES BADGES PAR CATÉGORIE
   */
  getBadgesByCategory(category) {
    return Object.values(this.badgeDefinitions).filter(b => b.category === category);
  }

  /**
   * 📋 OBTENIR TOUS LES BADGES PAR RARETÉ
   */
  getBadgesByRarity(rarity) {
    return Object.values(this.badgeDefinitions).filter(b => b.rarity === rarity);
  }

  /**
   * 🔍 RECHERCHER UN BADGE
   */
  getBadgeById(badgeId) {
    return this.badgeDefinitions[badgeId] || null;
  }

  /**
   * 📊 OBTENIR TOUTES LES DÉFINITIONS
   */
  getAllBadges() {
    return Object.values(this.badgeDefinitions);
  }
}

// ==========================================
// 🚀 EXPORT
// ==========================================

// Instance singleton
const unifiedBadgeService = new UnifiedBadgeService();

// Exposition globale pour debug
if (typeof window !== 'undefined') {
  window.unifiedBadgeService = unifiedBadgeService;
  window.UNIFIED_BADGES = UNIFIED_BADGE_DEFINITIONS;
}

export default unifiedBadgeService;
export { UnifiedBadgeService };
