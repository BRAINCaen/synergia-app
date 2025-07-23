// ==========================================
// 📁 react-app/src/core/services/taskInitializationService.js
// SERVICE D'INITIALISATION DES TÂCHES D'EXEMPLE
// ==========================================

import { taskService } from './taskService.js';

/**
 * 🎯 SERVICE D'INITIALISATION DES TÂCHES
 * Crée des tâches d'exemple pour les nouveaux utilisateurs
 */
class TaskInitializationService {
  constructor() {
    console.log('🎯 TaskInitializationService initialisé');
  }

  /**
   * 🌱 CRÉER DES TÂCHES D'EXEMPLE POUR UN NOUVEL UTILISATEUR
   */
  async createSampleTasks(userId) {
    try {
      console.log('🌱 [INIT] Création tâches d\'exemple pour:', userId);

      const sampleTasks = [
        // Tâches assignées à l'utilisateur
        {
          title: '🎯 Découvrir l\'interface de gestion des tâches',
          description: 'Explorez toutes les fonctionnalités de la page des tâches : filtres, recherche, création...',
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
          title: '📋 Compléter votre première tâche',
          description: 'Changez le statut d\'une tâche et découvrez le système de progression',
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
          description: 'Découvrez comment gagner de l\'XP et débloquer des badges en terminant des tâches',
          status: 'pending',
          priority: 'low',
          assignedTo: [userId],
          tags: ['gamification', 'exploration'],
          estimatedHours: 1,
          xpReward: 75,
          isAvailable: false
        },

        // Tâches disponibles pour le volontariat
        {
          title: '🌟 Améliorer la documentation utilisateur',
          description: 'Contribuez à améliorer notre documentation en identifiant les sections qui manquent de clarté',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['documentation', 'contribution'],
          estimatedHours: 2,
          xpReward: 100,
          isAvailable: true
        },
        {
          title: '🎨 Proposer des améliorations UI/UX',
          description: 'Analysez l\'interface et proposez des améliorations pour l\'expérience utilisateur',
          status: 'open',
          priority: 'low',
          assignedTo: [],
          tags: ['design', 'ux', 'contribution'],
          estimatedHours: 3,
          xpReward: 150,
          isAvailable: true
        },
        {
          title: '🔧 Tester les nouvelles fonctionnalités',
          description: 'Aidez-nous à tester les dernières fonctionnalités avant leur mise en production',
          status: 'open',
          priority: 'high',
          assignedTo: [],
          tags: ['test', 'qa', 'contribution'],
          estimatedHours: 1.5,
          xpReward: 80,
          isAvailable: true
        },
        {
          title: '📊 Analyser les métriques de performance',
          description: 'Examinez les données de performance de l\'application et identifiez les axes d\'amélioration',
          status: 'open',
          priority: 'medium',
          assignedTo: [],
          tags: ['analytics', 'performance'],
          estimatedHours: 2.5,
          xpReward: 120,
          isAvailable: true
        },

        // Tâches d'équipe ouvertes
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

      // Créer les tâches une par une
      const createdTasks = [];
      for (const taskData of sampleTasks) {
        try {
          const createdTask = await taskService.createTask(taskData, userId);
          createdTasks.push(createdTask);
          console.log('✅ Tâche créée:', createdTask.title);
          
          // Petite pause pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('❌ Erreur création tâche:', taskData.title, error);
        }
      }

      console.log('🎉 [INIT] Tâches d\'exemple créées:', createdTasks.length);
      return createdTasks;

    } catch (error) {
      console.error('❌ [INIT] Erreur création tâches d\'exemple:', error);
      throw error;
    }
  }

  /**
   * 🏢 CRÉER DES TÂCHES D'ÉQUIPE GÉNÉRIQUES
   */
  async createTeamTasks(creatorUserId) {
    try {
      console.log('🏢 [TEAM] Création tâches d\'équipe...');

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
          console.error('❌ Erreur création tâche équipe:', taskData.title, error);
        }
      }

      console.log('🎉 [TEAM] Tâches d\'équipe créées:', createdTasks.length);
      return createdTasks;

    } catch (error) {
      console.error('❌ [TEAM] Erreur création tâches équipe:', error);
      throw error;
    }
  }

  /**
   * 🔍 VÉRIFIER SI L'UTILISATEUR A DÉJÀ DES TÂCHES
   */
  async userHasTasks(userId) {
    try {
      const userTasks = await taskService.getUserTasks(userId);
      const createdTasks = await taskService.getTasksByCreator(userId);
      
      return (userTasks.length + createdTasks.length) > 0;
    } catch (error) {
      console.error('❌ Erreur vérification tâches utilisateur:', error);
      return false;
    }
  }

  /**
   * 🚀 INITIALISATION AUTOMATIQUE POUR NOUVEL UTILISATEUR
   */
  async initializeForNewUser(userId) {
    try {
      console.log('🚀 [AUTO_INIT] Initialisation automatique pour:', userId);

      // Vérifier si l'utilisateur a déjà des tâches
      const hasTasks = await this.userHasTasks(userId);
      
      if (hasTasks) {
        console.log('ℹ️ [AUTO_INIT] Utilisateur a déjà des tâches, pas d\'initialisation');
        return { initialized: false, reason: 'already_has_tasks' };
      }

      // Créer les tâches d'exemple
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
}

// ✅ INSTANCE UNIQUE
const taskInitializationService = new TaskInitializationService();

// ✅ EXPORTS
export default TaskInitializationService;
export { taskInitializationService };
