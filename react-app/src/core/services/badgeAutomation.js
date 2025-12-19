// ==========================================
// 📁 react-app/src/core/services/badgeAutomation.js
// AUTOMATISATION DES BADGES SYNERGIA v2.0
// Déclenchement intelligent et centralisé
// ==========================================

import unifiedBadgeService from './unifiedBadgeSystem.js';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎯 SERVICE D'AUTOMATISATION DES BADGES
 * Gère le déclenchement automatique des badges selon les événements
 */
class BadgeAutomationService {
  constructor() {
    this.isInitialized = false;
    this.eventQueue = [];
    this.processingQueue = false;
    this.debugMode = false;

    console.log('🤖 [AUTOMATION] Service d\'automatisation des badges initialisé');
  }

  /**
   * 🚀 INITIALISER LE SERVICE
   */
  initialize() {
    if (this.isInitialized) return;

    console.log('🚀 [AUTOMATION] Démarrage du service d\'automatisation...');

    // Connecter les événements
    this.setupEventListeners();

    // Démarrer le traitement de la queue
    this.startQueueProcessor();

    this.isInitialized = true;

    // Exposition globale pour debug
    if (typeof window !== 'undefined') {
      window.badgeAutomation = this;
    }

    console.log('✅ [AUTOMATION] Service démarré');
  }

  /**
   * 📡 CONFIGURER LES ÉCOUTEURS D'ÉVÉNEMENTS
   */
  setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Liste des événements à écouter
    const events = [
      // Tâches
      'taskCreated',
      'taskCompleted',
      'taskValidated',

      // Sessions
      'userLogin',
      'dailyCheckIn',

      // Boosts
      'boostSent',
      'boostReceived',

      // Défis
      'challengeCreated',
      'challengeCompleted',

      // Campagnes
      'campaignJoined',
      'campaignCompleted',
      'campaignLed',
      'campaignTaskCompleted',

      // Rétrospectives
      'retroParticipated',
      'retroAnimated',
      'retroItemAdded',
      'retroActionCompleted',
      'retroRoleAssigned',

      // Idées
      'ideaSubmitted',
      'ideaVoted',
      'ideaAdopted',
      'ideaImplemented',
      'ideaCommented',

      // Checkpoints
      'checkpointCompleted',
      'checkpointValidated',

      // Collaboration
      'teamJoined',
      'commentPosted',
      'helpProvided',

      // Progression
      'levelUp',
      'xpGained',

      // Général
      'profileUpdated',
      'badgeUnlocked'
    ];

    events.forEach(eventType => {
      window.addEventListener(eventType, (event) => {
        this.handleEvent(eventType, event.detail);
      });
    });

    console.log(`📡 [AUTOMATION] ${events.length} types d'événements surveillés`);
  }

  /**
   * 🎯 GÉRER UN ÉVÉNEMENT
   */
  handleEvent(eventType, eventData = {}) {
    const userId = eventData.userId || this.getCurrentUserId();

    if (!userId) {
      console.warn('⚠️ [AUTOMATION] userId manquant pour événement:', eventType);
      return;
    }

    // Ajouter à la queue de traitement
    this.eventQueue.push({
      type: eventType,
      userId,
      data: eventData,
      timestamp: Date.now()
    });

    if (this.debugMode) {
      console.log('📥 [AUTOMATION] Événement ajouté à la queue:', eventType, eventData);
    }
  }

  /**
   * ⚙️ DÉMARRER LE PROCESSEUR DE QUEUE
   */
  startQueueProcessor() {
    setInterval(() => {
      if (this.eventQueue.length > 0 && !this.processingQueue) {
        this.processQueue();
      }
    }, 500); // Vérifier toutes les 500ms
  }

  /**
   * 🔄 TRAITER LA QUEUE D'ÉVÉNEMENTS
   */
  async processQueue() {
    if (this.eventQueue.length === 0 || this.processingQueue) return;

    this.processingQueue = true;

    try {
      // Prendre les événements en batch
      const eventsToProcess = this.eventQueue.splice(0, 10);

      // Grouper par utilisateur
      const byUser = {};
      eventsToProcess.forEach(event => {
        if (!byUser[event.userId]) {
          byUser[event.userId] = [];
        }
        byUser[event.userId].push(event);
      });

      // Traiter par utilisateur
      for (const [userId, events] of Object.entries(byUser)) {
        await this.processUserEvents(userId, events);
      }

    } catch (error) {
      console.error('❌ [AUTOMATION] Erreur traitement queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * 👤 TRAITER LES ÉVÉNEMENTS D'UN UTILISATEUR
   */
  async processUserEvents(userId, events) {
    try {
      // D'abord, mettre à jour les statistiques
      await this.updateUserStats(userId, events);

      // Ensuite, vérifier les badges
      const triggers = [...new Set(events.map(e => this.mapEventToTrigger(e.type)))];

      for (const trigger of triggers) {
        await unifiedBadgeService.checkAndUnlockBadges(userId, trigger);
      }

    } catch (error) {
      console.error(`❌ [AUTOMATION] Erreur traitement utilisateur ${userId}:`, error);
    }
  }

  /**
   * 📊 METTRE À JOUR LES STATISTIQUES UTILISATEUR
   */
  async updateUserStats(userId, events) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const gamification = userData.gamification || {};
      const updates = {};

      for (const event of events) {
        const stats = this.getStatsUpdates(event.type, event.data, gamification);
        Object.assign(updates, stats);
      }

      if (Object.keys(updates).length > 0) {
        const gamificationUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
          gamificationUpdates[`gamification.${key}`] = value;
        }
        gamificationUpdates['updatedAt'] = new Date().toISOString();

        await updateDoc(userRef, gamificationUpdates);

        if (this.debugMode) {
          console.log('📊 [AUTOMATION] Stats mises à jour:', updates);
        }
      }

    } catch (error) {
      console.error('❌ [AUTOMATION] Erreur mise à jour stats:', error);
    }
  }

  /**
   * 📈 OBTENIR LES MISES À JOUR DE STATS POUR UN ÉVÉNEMENT
   */
  getStatsUpdates(eventType, eventData, currentStats) {
    const updates = {};

    switch (eventType) {
      // Tâches
      case 'taskCreated':
        updates.tasksCreated = (currentStats.tasksCreated || 0) + 1;
        break;
      case 'taskCompleted':
        updates.tasksCompleted = (currentStats.tasksCompleted || 0) + 1;
        // Vérifier l'heure pour early bird / night owl
        const hour = new Date().getHours();
        if (hour < 8) updates.earlyBirdUnlocked = true;
        if (hour >= 22) updates.nightOwlUnlocked = true;
        // Daily tasks
        const today = new Date().toISOString().split('T')[0];
        const dailyTasks = currentStats.dailyTasks || {};
        dailyTasks[today] = (dailyTasks[today] || 0) + 1;
        updates.dailyTasks = dailyTasks;
        if (dailyTasks[today] > (currentStats.dailyTasksRecord || 0)) {
          updates.dailyTasksRecord = dailyTasks[today];
        }
        break;
      case 'taskValidated':
        updates.tasksValidated = (currentStats.tasksValidated || 0) + 1;
        break;

      // Boosts
      case 'boostSent':
        updates.boostsSent = (currentStats.boostsSent || 0) + 1;
        if (eventData.recipientId) {
          const recipients = new Set(currentStats.boostRecipients || []);
          recipients.add(eventData.recipientId);
          updates.boostRecipients = Array.from(recipients);
          updates.uniqueBoostRecipients = recipients.size;
        }
        break;
      case 'boostReceived':
        updates.boostsReceived = (currentStats.boostsReceived || 0) + 1;
        break;

      // Défis
      case 'challengeCreated':
        updates.challengesCreated = (currentStats.challengesCreated || 0) + 1;
        break;
      case 'challengeCompleted':
        updates.challengesCompleted = (currentStats.challengesCompleted || 0) + 1;
        if (eventData.difficulty === 'hard') {
          updates.hardChallengesCompleted = (currentStats.hardChallengesCompleted || 0) + 1;
        }
        break;

      // Campagnes
      case 'campaignJoined':
        updates.campaignsJoined = (currentStats.campaignsJoined || 0) + 1;
        break;
      case 'campaignCompleted':
        updates.campaignsCompleted = (currentStats.campaignsCompleted || 0) + 1;
        break;
      case 'campaignLed':
        updates.campaignsLed = (currentStats.campaignsLed || 0) + 1;
        break;
      case 'campaignTaskCompleted':
        updates.campaignTasksCompleted = (currentStats.campaignTasksCompleted || 0) + 1;
        break;

      // Rétrospectives
      case 'retroParticipated':
        updates.retroParticipations = (currentStats.retroParticipations || 0) + 1;
        break;
      case 'retroAnimated':
        updates.retrosAnimated = (currentStats.retrosAnimated || 0) + 1;
        break;
      case 'retroItemAdded':
        updates.retroItemsAdded = (currentStats.retroItemsAdded || 0) + 1;
        break;
      case 'retroActionCompleted':
        updates.retroActionsCompleted = (currentStats.retroActionsCompleted || 0) + 1;
        break;
      case 'retroRoleAssigned':
        if (eventData.role === 'scribe') {
          updates.retroScribeCount = (currentStats.retroScribeCount || 0) + 1;
        } else if (eventData.role === 'timekeeper') {
          updates.retroTimekeeperCount = (currentStats.retroTimekeeperCount || 0) + 1;
        }
        break;

      // Idées
      case 'ideaSubmitted':
        updates.ideasSubmitted = (currentStats.ideasSubmitted || 0) + 1;
        break;
      case 'ideaVoted':
        updates.ideaVotes = (currentStats.ideaVotes || 0) + 1;
        break;
      case 'ideaAdopted':
        updates.ideasAdopted = (currentStats.ideasAdopted || 0) + 1;
        break;
      case 'ideaImplemented':
        updates.ideasImplemented = (currentStats.ideasImplemented || 0) + 1;
        break;
      case 'ideaCommented':
        updates.ideaComments = (currentStats.ideaComments || 0) + 1;
        break;

      // Checkpoints
      case 'checkpointCompleted':
        updates.checkpointsCompleted = (currentStats.checkpointsCompleted || 0) + 1;
        break;
      case 'checkpointValidated':
        updates.checkpointsValidated = (currentStats.checkpointsValidated || 0) + 1;
        break;

      // Collaboration
      case 'teamJoined':
        updates.teamsJoined = (currentStats.teamsJoined || 0) + 1;
        break;
      case 'commentPosted':
        updates.commentsPosted = (currentStats.commentsPosted || 0) + 1;
        break;
      case 'helpProvided':
        updates.helpedColleagues = (currentStats.helpedColleagues || 0) + 1;
        break;

      // Connexion
      case 'userLogin':
      case 'dailyCheckIn':
        updates.activeDays = (currentStats.activeDays || 0) + 1;
        // Gérer le streak
        const lastLogin = currentStats.lastLoginDate;
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastLogin) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (lastLogin === yesterdayStr) {
            updates.loginStreak = (currentStats.loginStreak || 0) + 1;
          } else if (lastLogin !== todayStr) {
            // Streak cassé - vérifier comeback
            const lastDate = new Date(lastLogin);
            const diff = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diff >= 7) {
              updates.comebackUnlocked = true;
            }
            updates.loginStreak = 1;
          }
        } else {
          updates.loginStreak = 1;
        }
        updates.lastLoginDate = todayStr;
        break;

      // Progression
      case 'levelUp':
        updates.level = eventData.newLevel || (currentStats.level || 1) + 1;
        break;
      case 'xpGained':
        const xpGained = eventData.amount || 0;
        updates.totalXp = (currentStats.totalXp || 0) + xpGained;
        updates.weeklyXpGain = (currentStats.weeklyXpGain || 0) + xpGained;
        break;
    }

    return updates;
  }

  /**
   * 🔀 MAPPER UN ÉVÉNEMENT VERS UN TRIGGER
   */
  mapEventToTrigger(eventType) {
    const mapping = {
      taskCreated: 'task_created',
      taskCompleted: 'task_completed',
      taskValidated: 'task_validated',
      userLogin: 'daily_login',
      dailyCheckIn: 'daily_login',
      boostSent: 'boost_sent',
      boostReceived: 'boost_received',
      challengeCreated: 'challenge_created',
      challengeCompleted: 'challenge_completed',
      campaignJoined: 'campaign_joined',
      campaignCompleted: 'campaign_completed',
      campaignLed: 'campaign_led',
      campaignTaskCompleted: 'campaign_task_completed',
      retroParticipated: 'retro_participated',
      retroAnimated: 'retro_animated',
      retroItemAdded: 'retro_item_added',
      retroActionCompleted: 'retro_action_completed',
      retroRoleAssigned: 'retro_role_assigned',
      ideaSubmitted: 'idea_submitted',
      ideaVoted: 'idea_voted',
      ideaAdopted: 'idea_adopted',
      ideaImplemented: 'idea_implemented',
      ideaCommented: 'idea_commented',
      checkpointCompleted: 'checkpoint_completed',
      checkpointValidated: 'checkpoint_validated',
      teamJoined: 'team_joined',
      commentPosted: 'comment_posted',
      helpProvided: 'help_provided',
      levelUp: 'level_up',
      xpGained: 'xp_gained',
      profileUpdated: 'profile_update',
      badgeUnlocked: 'badge_unlocked'
    };

    return mapping[eventType] || eventType;
  }

  /**
   * 👤 RÉCUPÉRER L'ID UTILISATEUR ACTUEL
   */
  getCurrentUserId() {
    try {
      // Via localStorage
      const userStorage = localStorage.getItem('synergia-auth-user');
      if (userStorage) {
        const user = JSON.parse(userStorage);
        if (user.uid) return user.uid;
      }

      // Via sessionStorage
      const sessionUser = sessionStorage.getItem('current-user-id');
      if (sessionUser) return sessionUser;

      return null;
    } catch (error) {
      return null;
    }
  }

  // ==========================================
  // 🎯 MÉTHODES DE DÉCLENCHEMENT MANUEL
  // ==========================================

  /**
   * 📤 DÉCLENCHER UN ÉVÉNEMENT
   */
  triggerEvent(eventType, eventData = {}) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(eventType, { detail: eventData });
      window.dispatchEvent(event);
      console.log('📤 [AUTOMATION] Événement déclenché:', eventType);
    }
  }

  /**
   * ✅ DÉCLENCHER - Tâche créée
   */
  onTaskCreated(userId, taskData = {}) {
    this.triggerEvent('taskCreated', { userId, ...taskData });
  }

  /**
   * ✅ DÉCLENCHER - Tâche complétée
   */
  onTaskCompleted(userId, taskData = {}) {
    this.triggerEvent('taskCompleted', { userId, ...taskData });
  }

  /**
   * 💖 DÉCLENCHER - Boost envoyé
   */
  onBoostSent(userId, recipientId, boostType = 'encouragement') {
    this.triggerEvent('boostSent', { userId, recipientId, boostType });
  }

  /**
   * 💖 DÉCLENCHER - Boost reçu
   */
  onBoostReceived(userId, senderId) {
    this.triggerEvent('boostReceived', { userId, senderId });
  }

  /**
   * 🎯 DÉCLENCHER - Défi créé
   */
  onChallengeCreated(userId, challengeData = {}) {
    this.triggerEvent('challengeCreated', { userId, ...challengeData });
  }

  /**
   * 🎯 DÉCLENCHER - Défi complété
   */
  onChallengeCompleted(userId, challengeData = {}) {
    this.triggerEvent('challengeCompleted', { userId, ...challengeData });
  }

  /**
   * ⚔️ DÉCLENCHER - Campagne rejointe
   */
  onCampaignJoined(userId, campaignId) {
    this.triggerEvent('campaignJoined', { userId, campaignId });
  }

  /**
   * ⚔️ DÉCLENCHER - Campagne complétée
   */
  onCampaignCompleted(userId, campaignId) {
    this.triggerEvent('campaignCompleted', { userId, campaignId });
  }

  /**
   * 🔄 DÉCLENCHER - Rétro participée
   */
  onRetroParticipated(userId, retroId) {
    this.triggerEvent('retroParticipated', { userId, retroId });
  }

  /**
   * 🔄 DÉCLENCHER - Rétro animée
   */
  onRetroAnimated(userId, retroId) {
    this.triggerEvent('retroAnimated', { userId, retroId });
  }

  /**
   * 💡 DÉCLENCHER - Idée soumise
   */
  onIdeaSubmitted(userId, ideaData = {}) {
    this.triggerEvent('ideaSubmitted', { userId, ...ideaData });
  }

  /**
   * 💡 DÉCLENCHER - Idée adoptée
   */
  onIdeaAdopted(userId, ideaId) {
    this.triggerEvent('ideaAdopted', { userId, ideaId });
  }

  /**
   * 💡 DÉCLENCHER - Idée implémentée
   */
  onIdeaImplemented(userId, ideaId) {
    this.triggerEvent('ideaImplemented', { userId, ideaId });
  }

  /**
   * ✓ DÉCLENCHER - Checkpoint complété
   */
  onCheckpointCompleted(userId, checkpointData = {}) {
    this.triggerEvent('checkpointCompleted', { userId, ...checkpointData });
  }

  /**
   * 🔐 DÉCLENCHER - Connexion utilisateur
   */
  onUserLogin(userId) {
    this.triggerEvent('userLogin', { userId });
    this.triggerEvent('dailyCheckIn', { userId });
  }

  /**
   * 📈 DÉCLENCHER - XP gagné
   */
  onXpGained(userId, amount, source = 'unknown') {
    this.triggerEvent('xpGained', { userId, amount, source });
  }

  /**
   * 🆙 DÉCLENCHER - Level up
   */
  onLevelUp(userId, newLevel, previousLevel) {
    this.triggerEvent('levelUp', { userId, newLevel, previousLevel });
  }

  // ==========================================
  // 🛠️ UTILITAIRES
  // ==========================================

  /**
   * 🐛 ACTIVER/DÉSACTIVER LE MODE DEBUG
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`🐛 [AUTOMATION] Mode debug: ${enabled ? 'activé' : 'désactivé'}`);
  }

  /**
   * 📊 OBTENIR LES STATS DU SERVICE
   */
  getServiceStats() {
    return {
      isInitialized: this.isInitialized,
      queueLength: this.eventQueue.length,
      processingQueue: this.processingQueue,
      debugMode: this.debugMode
    };
  }

  /**
   * 🔄 FORCER LA VÉRIFICATION DES BADGES
   */
  async forceCheckBadges(userId) {
    console.log('🔄 [AUTOMATION] Vérification forcée pour:', userId);
    return await unifiedBadgeService.checkAndUnlockBadges(userId, 'automatic');
  }

  /**
   * 🧹 NETTOYER LE SERVICE
   */
  cleanup() {
    this.eventQueue = [];
    this.isInitialized = false;
    console.log('🧹 [AUTOMATION] Service nettoyé');
  }
}

// ==========================================
// 🚀 EXPORT
// ==========================================

// Instance singleton
const badgeAutomation = new BadgeAutomationService();

// Auto-initialisation
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      badgeAutomation.initialize();
    });
  } else {
    badgeAutomation.initialize();
  }
}

export default badgeAutomation;
export { BadgeAutomationService };
