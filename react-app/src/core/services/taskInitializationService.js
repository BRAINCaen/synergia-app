// ==========================================
// 📁 react-app/src/core/services/taskInitializationService.js
// SERVICE D'INITIALISATION DES QUÊTES D'EXEMPLE - VERSION QUÊTES
// ==========================================

import { taskService } from './taskService.js';

/**
 * 🎯 SERVICE D'INITIALISATION DES QUÊTES
 * Crée des quêtes d'exemple pour les nouveaux utilisateurs
 */
class TaskInitializationService {
  constructor() {
    console.log('🎯 TaskInitializationService initialisé');
  }

  /**
   * 🌱 CRÉER DES QUÊTES D'EXEMPLE POUR UN NOUVEL UTILISATEUR
   */
  async createSampleTasks(userId) {
    try {
      console.log('🌱 [INIT] Création quêtes d\'exemple pour:', userId);

      const sampleTasks = [
        // Quêtes assignées à l'utilisateur
        {
          title: '🎯 Découvrir l\'interface de gestion des quêtes',
          description: 'Explorez toutes les fonctionnalités de la page des quêtes : filtres, recherche, création...',
          status: 'assigned',
          priority: 'high',
          assignedTo: [userId],
          tags: ['onboarding', 'formation'],
          estimatedHours: 1,
          xpReward: 50,
          isAvailable: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // +7 jours
        },
        {
          title: '📋 Compléter votre première quête',
          description: 'Changez le statut d\'une quête et découvrez le système de progression',
          status: 'pending',
          priority: 'medium',
          assignedTo: [userId],
          tags: ['onboarding', 'gamification'],
          estimatedHours: 0.5,
          xpReward: 25,
          isAvailable: false
        },
        {
          title: '🎮 Explorer le système de gamification',
          description: 'Découvrez comment gagner de l\'XP et débloquer des badges en terminant des quêtes',
          status: 'pending',
          priority: 'medium',
          assignedTo: [userId],
          tags: ['gamification', 'XP', 'badges'],
          estimatedHours: 0.5,
          xpReward: 30,
          isAvailable: false
        },

        // Quêtes disponibles (non assignées)
        {
          title: '🚀 Proposer une amélioration du système',
          description: 'Suggérez une nouvelle fonctionnalité ou amélioration pour Synergia',
          status: 'open',
          priority: 'low',
          assignedTo: [],
          tags: ['innovation', 'feedback'],
          estimatedHours: 1,
          xpReward: 60,
          isAvailable: true
        },
        {
          title: '📝 Rédiger un retour d\'expérience',
          description: 'Partagez votre expérience sur une quête récemment accomplie',
          status: 'open',
          priority: 'low',
          assignedTo: [],
          tags: ['documentation', 'partage'],
          estimatedHours: 1.5,
          xpReward: 75,
          isAvailable: true
        },
        {
          title: '🎨 Contribuer à la documentation',
          description: 'Améliorez la documentation en ajoutant des exemples ou des captures d\'écran',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['documentation', 'contribution'],
          estimatedHours: 2,
          xpReward: 100,
          isAvailable: true
        },

        // Quêtes de défi
        {
          title: '🏆 Terminer 5 quêtes en une semaine',
          description: 'Relevez le défi de compléter 5 quêtes différentes en moins de 7 jours',
          status: 'open',
          priority: 'high',
          assignedTo: [],
          tags: ['défi', 'productivité'],
          estimatedHours: 10,
          xpReward: 250,
          isAvailable: true
        },
        {
          title: '⚡ Devenir expert d\'un rôle Synergia',
          description: 'Complétez toutes les quêtes d\'un rôle spécifique pour devenir expert',
          status: 'open',
          priority: 'high',
          assignedTo: [],
          tags: ['expertise', 'spécialisation'],
          estimatedHours: 15,
          xpReward: 500,
          isAvailable: true
        },

        // Quêtes analytiques
        {
          title: '📊 Analyser les performances de l\'équipe',
          description: 'Générez un rapport d\'analyse des performances et identifiez les points d\'amélioration',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['analytics', 'performance'],
          estimatedHours: 2.5,
          xpReward: 120,
          isAvailable: true
        },

        // Quêtes d'équipe ouvertes
        {
          title: '🤝 Organiser un atelier de brainstorming',
          description: 'Animez un atelier créatif pour générer de nouvelles idées de fonctionnalités',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['équipe', 'créativité', 'animation'],
          estimatedHours: 2,
          xpReward: 90,
          isAvailable: true
        },
        {
          title: '📚 Créer un guide de bonnes pratiques',
          description: 'Rédigez un guide des meilleures pratiques pour utiliser efficacement Synergia',
          status: 'open',
          priority: 'high',
          assignedTo: [],
          tags: ['documentation', 'formation'],
          estimatedHours: 4,
          xpReward: 200,
          isAvailable: true
        }
      ];

      // Créer les quêtes une par une
      const createdTasks = [];
      for (const taskData of sampleTasks) {
        try {
          const createdTask = await taskService.createTask(taskData, userId);
          createdTasks.push(createdTask);
          console.log('✅ Quête créée:', createdTask.title);
          
          // Petite pause pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('❌ Erreur création quête:', taskData.title, error);
        }
      }

      console.log('🎉 [INIT] Quêtes d\'exemple créées:', createdTasks.length);
      return createdTasks;

    } catch (error) {
      console.error('❌ [INIT] Erreur création quêtes d\'exemple:', error);
      throw error;
    }
  }

  /**
   * 🏢 CRÉER DES QUÊTES D'ÉQUIPE GÉNÉRIQUES
   */
  async createTeamTasks(creatorUserId) {
    try {
      console.log('🏢 [TEAM] Création quêtes d\'équipe...');

      const teamTasks = [
        {
          title: '🎯 Définir les objectifs trimestriels',
          description: 'Établir les KPIs et objectifs pour le prochain trimestre en collaboration avec l\'équipe',
          status: 'open',
          priority: 'high',
          assignedTo: [],
          tags: ['stratégie', 'équipe', 'objectifs'],
          estimatedHours: 3,
          xpReward: 150,
          isAvailable: true
        },
        {
          title: '📈 Analyser les performances équipe',
          description: 'Étudier les métriques de productivité et identifier les axes d\'amélioration',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['analytics', 'performance', 'équipe'],
          estimatedHours: 2,
          xpReward: 100,
          isAvailable: true
        },
        {
          title: '🎓 Organiser une session de formation',
          description: 'Planifier et animer une session de formation sur les nouvelles fonctionnalités',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['formation', 'animation', 'partage'],
          estimatedHours: 4,
          xpReward: 180,
          isAvailable: true
        }
      ];

      const createdTasks = [];
      for (const taskData of teamTasks) {
        try {
          const createdTask = await taskService.createTask(taskData, creatorUserId);
          createdTasks.push(createdTask);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('❌ Erreur création quête équipe:', taskData.title, error);
        }
      }

      console.log('🎉 [TEAM] Quêtes d\'équipe créées:', createdTasks.length);
      return createdTasks;

    } catch (error) {
      console.error('❌ [TEAM] Erreur création quêtes équipe:', error);
      throw error;
    }
  }

  /**
   * 🔍 VÉRIFIER SI L'UTILISATEUR A DÉJÀ DES QUÊTES
   */
  async userHasTasks(userId) {
    try {
      const userTasks = await taskService.getUserTasks(userId);
      const createdTasks = await taskService.getTasksByCreator(userId);
      
      return (userTasks.length + createdTasks.length) > 0;
    } catch (error) {
      console.error('❌ Erreur vérification quêtes utilisateur:', error);
      return false;
    }
  }

  /**
   * 🚀 INITIALISATION AUTOMATIQUE POUR NOUVEL UTILISATEUR
   */
  async initializeForNewUser(userId) {
    try {
      console.log('🚀 [AUTO_INIT] Initialisation automatique pour:', userId);

      // Vérifier si l'utilisateur a déjà des quêtes
      const hasTasks = await this.userHasTasks(userId);
      
      if (hasTasks) {
        console.log('ℹ️ [AUTO_INIT] Utilisateur a déjà des quêtes, pas d\'initialisation');
        return { initialized: false, reason: 'already_has_tasks' };
      }

      // Créer les quêtes d'exemple
      const sampleTasks = await this.createSampleTasks(userId);
      
      console.log('🎉 [AUTO_INIT] Initialisation terminée pour nouvel utilisateur');
      return { 
        initialized: true, 
        tasksCreated: sampleTasks.length,
        tasks: sampleTasks
      };

    } catch (error) {
      console.error('❌ [AUTO_INIT] Erreur initialisation automatique:', error);
      return { initialized: false, error: error.message };
    }
  }

  /**
   * 🎮 CRÉER DES QUÊTES DE GAMIFICATION AVANCÉES
   */
  async createGamificationQuests(userId) {
    try {
      console.log('🎮 [GAMIF] Création quêtes de gamification pour:', userId);

      const gamificationQuests = [
        {
          title: '🌟 Atteindre le niveau 10',
          description: 'Gagnez suffisamment d\'XP pour atteindre le niveau 10',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['progression', 'niveau', 'gamification'],
          estimatedHours: 20,
          xpReward: 1000,
          isAvailable: true
        },
        {
          title: '🏅 Débloquer 10 badges',
          description: 'Collectionnez 10 badges différents en accomplissant diverses quêtes',
          status: 'open',
          priority: 'high',
          assignedTo: [],
          tags: ['badges', 'collection', 'gamification'],
          estimatedHours: 30,
          xpReward: 1500,
          isAvailable: true
        },
        {
          title: '⚡ Maintenir un streak de 7 jours',
          description: 'Accomplissez au moins une quête par jour pendant 7 jours consécutifs',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['streak', 'régularité', 'gamification'],
          estimatedHours: 14,
          xpReward: 700,
          isAvailable: true
        }
      ];

      const createdQuests = [];
      for (const questData of gamificationQuests) {
        try {
          const createdQuest = await taskService.createTask(questData, userId);
          createdQuests.push(createdQuest);
          console.log('✅ Quête gamification créée:', createdQuest.title);
        } catch (error) {
          console.error('❌ Erreur création quête gamification:', questData.title, error);
        }
      }

      console.log('🎉 [GAMIF] Quêtes de gamification créées:', createdQuests.length);
      return createdQuests;

    } catch (error) {
      console.error('❌ [GAMIF] Erreur création quêtes gamification:', error);
      throw error;
    }
  }
}

// ✅ INSTANCE UNIQUE
const taskInitializationService = new TaskInitializationService();

// ✅ EXPORTS
export default TaskInitializationService;
export { taskInitializationService };
