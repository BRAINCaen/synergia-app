// ==========================================
// 📁 react-app/src/core/services/roleTaskManager.js
// GESTIONNAIRE DE TÂCHES SPÉCIFIQUES PAR RÔLE
// Système intelligent qui génère et gère les tâches selon les rôles et niveaux
// ==========================================

import { db } from '../firebase/config.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import roleUnlockService from './roleUnlockService.js';

/**
 * 🎯 DÉFINITION DES TÂCHES SPÉCIFIQUES PAR RÔLE ET NIVEAU
 */
export const ROLE_SPECIFIC_TASKS = {
  // 🔧 MAINTENANCE - Entretien, Réparations & Maintenance
  maintenance: {
    NOVICE: [
      {
        id: 'basic_repair_001',
        title: 'Réparation Basique d\'Équipement',
        description: 'Effectuer une réparation simple d\'équipement de bureau',
        difficulty: 'Facile',
        estimatedTime: 30,
        xpReward: 25,
        category: 'repair',
        skills: ['basic_tools', 'safety_procedures'],
        requirements: ['safety_training'],
        steps: [
          'Identifier le problème',
          'Rassembler les outils nécessaires',
          'Effectuer la réparation',
          'Tester le bon fonctionnement',
          'Documenter l\'intervention'
        ]
      },
      {
        id: 'equipment_check_001',
        title: 'Inspection Préventive Hebdomadaire',
        description: 'Effectuer l\'inspection préventive des équipements assignés',
        difficulty: 'Facile',
        estimatedTime: 45,
        xpReward: 30,
        category: 'inspection',
        skills: ['observation', 'documentation'],
        requirements: ['equipment_access'],
        recurring: 'weekly'
      },
      {
        id: 'safety_inspection_001',
        title: 'Contrôle de Sécurité Quotidien',
        description: 'Vérifier la conformité des installations de sécurité',
        difficulty: 'Facile',
        estimatedTime: 20,
        xpReward: 20,
        category: 'safety',
        skills: ['safety_protocols', 'attention_to_detail'],
        requirements: ['safety_certification'],
        recurring: 'daily'
      }
    ],
    APPRENTI: [
      {
        id: 'advanced_repair_001',
        title: 'Réparation Complexe de Système',
        description: 'Diagnostiquer et réparer un système technique complexe',
        difficulty: 'Moyen',
        estimatedTime: 90,
        xpReward: 75,
        category: 'repair',
        skills: ['advanced_troubleshooting', 'system_analysis'],
        requirements: ['advanced_tools_access', 'novice_level_complete'],
        unlockCondition: { level: 'APPRENTI', role: 'maintenance' }
      },
      {
        id: 'preventive_maintenance_001',
        title: 'Programme de Maintenance Préventive',
        description: 'Concevoir et implémenter un programme de maintenance préventive',
        difficulty: 'Moyen',
        estimatedTime: 120,
        xpReward: 100,
        category: 'planning',
        skills: ['maintenance_planning', 'process_design'],
        requirements: ['planning_tools_access'],
        deliverables: ['maintenance_schedule', 'procedure_document']
      }
    ],
    COMPETENT: [
      {
        id: 'system_optimization_001',
        title: 'Optimisation de Système Critique',
        description: 'Analyser et optimiser les performances d\'un système critique',
        difficulty: 'Difficile',
        estimatedTime: 180,
        xpReward: 150,
        category: 'optimization',
        skills: ['system_analysis', 'performance_optimization', 'data_analysis'],
        requirements: ['system_admin_access', 'competent_level'],
        unlockCondition: { level: 'COMPETENT', role: 'maintenance' }
      }
    ]
  },

  // ⭐ REPUTATION - Gestion des Avis & de la Réputation
  reputation: {
    NOVICE: [
      {
        id: 'review_monitoring_001',
        title: 'Surveillance des Avis Clients',
        description: 'Surveiller et cataloguer les nouveaux avis clients',
        difficulty: 'Facile',
        estimatedTime: 30,
        xpReward: 25,
        category: 'monitoring',
        skills: ['attention_to_detail', 'customer_focus'],
        requirements: ['review_platform_access'],
        recurring: 'daily'
      },
      {
        id: 'response_basic_001',
        title: 'Réponse Basique aux Avis',
        description: 'Rédiger des réponses standardisées aux avis clients',
        difficulty: 'Facile',
        estimatedTime: 45,
        xpReward: 35,
        category: 'response',
        skills: ['written_communication', 'empathy'],
        requirements: ['response_templates'],
        deliverables: ['response_drafts']
      }
    ],
    APPRENTI: [
      {
        id: 'sentiment_analysis_001',
        title: 'Analyse de Sentiment Clients',
        description: 'Analyser les tendances de sentiment dans les avis clients',
        difficulty: 'Moyen',
        estimatedTime: 90,
        xpReward: 70,
        category: 'analysis',
        skills: ['data_analysis', 'sentiment_interpretation'],
        requirements: ['analytics_tools_access'],
        deliverables: ['sentiment_report']
      }
    ],
    COMPETENT: [
      {
        id: 'reputation_strategy_001',
        title: 'Stratégie de Réputation',
        description: 'Développer une stratégie complète de gestion de réputation',
        difficulty: 'Difficile',
        estimatedTime: 240,
        xpReward: 200,
        category: 'strategy',
        skills: ['strategic_thinking', 'reputation_management', 'stakeholder_analysis'],
        requirements: ['strategy_planning_access'],
        deliverables: ['reputation_strategy_document', 'action_plan']
      }
    ]
  },

  // 📦 STOCK - Gestion des Stocks & Matériel
  stock: {
    NOVICE: [
      {
        id: 'item_counting_001',
        title: 'Inventaire Physique',
        description: 'Effectuer le comptage physique des articles en stock',
        difficulty: 'Facile',
        estimatedTime: 60,
        xpReward: 30,
        category: 'inventory',
        skills: ['attention_to_detail', 'organization'],
        requirements: ['warehouse_access'],
        recurring: 'weekly'
      },
      {
        id: 'basic_ordering_001',
        title: 'Commande de Réapprovisionnement',
        description: 'Passer une commande de réapprovisionnement standard',
        difficulty: 'Facile',
        estimatedTime: 45,
        xpReward: 35,
        category: 'ordering',
        skills: ['procurement_basics', 'vendor_communication'],
        requirements: ['ordering_system_access']
      }
    ],
    APPRENTI: [
      {
        id: 'demand_forecasting_001',
        title: 'Prévision de Demande',
        description: 'Analyser les données historiques pour prévoir la demande',
        difficulty: 'Moyen',
        estimatedTime: 120,
        xpReward: 85,
        category: 'forecasting',
        skills: ['data_analysis', 'forecasting_methods', 'statistical_analysis'],
        requirements: ['forecasting_tools_access'],
        deliverables: ['demand_forecast_report']
      }
    ]
  },

  // 📋 ORGANIZATION - Organisation Interne du Travail
  organization: {
    NOVICE: [
      {
        id: 'task_scheduling_001',
        title: 'Planification des Tâches d\'Équipe',
        description: 'Organiser et planifier les tâches quotidiennes de l\'équipe',
        difficulty: 'Facile',
        estimatedTime: 40,
        xpReward: 30,
        category: 'planning',
        skills: ['time_management', 'team_coordination'],
        requirements: ['scheduling_tools_access'],
        recurring: 'daily'
      }
    ],
    APPRENTI: [
      {
        id: 'workflow_design_001',
        title: 'Conception de Flux de Travail',
        description: 'Concevoir un flux de travail optimisé pour un processus spécifique',
        difficulty: 'Moyen',
        estimatedTime: 150,
        xpReward: 100,
        category: 'workflow',
        skills: ['process_design', 'workflow_optimization', 'stakeholder_analysis'],
        requirements: ['workflow_tools_access'],
        deliverables: ['workflow_diagram', 'process_documentation']
      }
    ]
  },

  // 🎨 CONTENT - Création de Contenu & Affichages
  content: {
    NOVICE: [
      {
        id: 'basic_design_001',
        title: 'Création de Visuel Simple',
        description: 'Créer un visuel simple pour communication interne',
        difficulty: 'Facile',
        estimatedTime: 60,
        xpReward: 40,
        category: 'design',
        skills: ['basic_design', 'visual_communication'],
        requirements: ['design_software_access'],
        deliverables: ['visual_design']
      },
      {
        id: 'content_writing_001',
        title: 'Rédaction de Contenu',
        description: 'Rédiger du contenu pour les supports de communication',
        difficulty: 'Facile',
        estimatedTime: 45,
        xpReward: 35,
        category: 'writing',
        skills: ['copywriting', 'brand_voice'],
        requirements: ['content_guidelines_access'],
        deliverables: ['written_content']
      }
    ],
    APPRENTI: [
      {
        id: 'video_creation_001',
        title: 'Création de Contenu Vidéo',
        description: 'Concevoir et produire une vidéo de communication',
        difficulty: 'Moyen',
        estimatedTime: 180,
        xpReward: 120,
        category: 'video',
        skills: ['video_editing', 'storytelling', 'visual_design'],
        requirements: ['video_software_access', 'equipment_access'],
        deliverables: ['final_video', 'production_notes']
      }
    ]
  },

  // 🎓 MENTORING - Mentorat & Formation Interne
  mentoring: {
    NOVICE: [
      {
        id: 'peer_helping_001',
        title: 'Assistance Entre Pairs',
        description: 'Aider un collègue dans son apprentissage',
        difficulty: 'Facile',
        estimatedTime: 30,
        xpReward: 25,
        category: 'support',
        skills: ['empathy', 'knowledge_sharing', 'patience'],
        requirements: ['peer_support_guidelines'],
        recurring: 'as_needed'
      }
    ],
    APPRENTI: [
      {
        id: 'basic_mentoring_001',
        title: 'Session de Mentorat Structurée',
        description: 'Conduire une session de mentorat avec un plan structuré',
        difficulty: 'Moyen',
        estimatedTime: 90,
        xpReward: 75,
        category: 'mentoring',
        skills: ['mentoring_techniques', 'active_listening', 'goal_setting'],
        requirements: ['mentoring_training_complete'],
        deliverables: ['mentoring_session_report', 'development_plan']
      }
    ]
  }
};

/**
 * 🎯 GESTIONNAIRE PRINCIPAL DES TÂCHES PAR RÔLE
 */
class RoleTaskManager {

  /**
   * 🔍 OBTENIR LES TÂCHES DISPONIBLES POUR UN UTILISATEUR
   */
  getAvailableTasksForUser(userRoles = {}) {
    const availableTasks = [];

    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      const roleLevel = roleUnlockService.calculateRoleLevel(roleData.xp || 0);
      const roleTasks = ROLE_SPECIFIC_TASKS[roleId];

      if (roleTasks && roleTasks[roleLevel]) {
        const levelTasks = roleTasks[roleLevel].map(task => ({
          ...task,
          roleId,
          roleLevel,
          isUnlocked: this.isTaskUnlocked(task, userRoles)
        }));
        
        availableTasks.push(...levelTasks);
      }
    });

    return availableTasks;
  }

  /**
   * ✅ VÉRIFIER SI UNE TÂCHE EST DÉVERROUILLÉE
   */
  isTaskUnlocked(task, userRoles = {}) {
    // Vérifier les conditions de déverrouillage
    if (task.unlockCondition) {
      const { level, role } = task.unlockCondition;
      const userRole = userRoles[role];
      
      if (!userRole) return false;
      
      const userLevel = roleUnlockService.calculateRoleLevel(userRole.xp || 0);
      const levelOrder = ['NOVICE', 'APPRENTI', 'COMPETENT', 'EXPERT', 'MAITRE'];
      const requiredLevelIndex = levelOrder.indexOf(level);
      const userLevelIndex = levelOrder.indexOf(userLevel);
      
      return userLevelIndex >= requiredLevelIndex;
    }

    // Par défaut, les tâches sans condition sont déverrouillées
    return true;
  }

  /**
   * 🎯 CRÉER UNE INSTANCE DE TÂCHE POUR UN UTILISATEUR
   */
  async createTaskInstance(userId, taskTemplate, assignedBy = 'system') {
    try {
      const taskInstance = {
        ...taskTemplate,
        userId,
        assignedBy,
        status: 'assigned',
        createdAt: serverTimestamp(),
        assignedAt: serverTimestamp(),
        progress: 0,
        metadata: {
          roleSpecific: true,
          template: taskTemplate.id,
          roleId: taskTemplate.roleId,
          roleLevel: taskTemplate.roleLevel
        }
      };

      // Ajouter à la collection des tâches
      const taskRef = await addDoc(collection(db, 'tasks'), taskInstance);
      
      console.log('🎯 Tâche spécifique créée:', { taskId: taskRef.id, template: taskTemplate.id });
      
      return {
        success: true,
        taskId: taskRef.id,
        taskInstance: { ...taskInstance, id: taskRef.id }
      };

    } catch (error) {
      console.error('❌ Erreur création tâche spécifique:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 GÉNÉRER DES TÂCHES AUTOMATIQUES POUR UN UTILISATEUR
   */
  async generateAutomaticTasks(userId, userRoles = {}, options = {}) {
    try {
      const { 
        maxTasks = 3, 
        priorityCategories = ['daily', 'weekly'],
        forceGenerate = false 
      } = options;

      console.log('🤖 Génération automatique de tâches pour:', userId);

      const availableTasks = this.getAvailableTasksForUser(userRoles);
      const generatedTasks = [];

      // Filtrer les tâches par priorité et récurrence
      const priorityTasks = availableTasks.filter(task => {
        if (!task.isUnlocked) return false;
        
        // Privilégier les tâches récurrentes
        if (task.recurring && priorityCategories.includes(task.recurring)) {
          return true;
        }
        
        // Inclure les tâches importantes par catégorie
        return priorityCategories.includes(task.category);
      });

      // Sélectionner les meilleures tâches
      const selectedTasks = this.selectOptimalTasks(priorityTasks, maxTasks, userRoles);

      // Créer les instances de tâches
      for (const taskTemplate of selectedTasks) {
        const result = await this.createTaskInstance(userId, taskTemplate, 'auto_generator');
        
        if (result.success) {
          generatedTasks.push(result.taskInstance);
        }
      }

      return {
        success: true,
        generatedCount: generatedTasks.length,
        tasks: generatedTasks
      };

    } catch (error) {
      console.error('❌ Erreur génération automatique:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 SÉLECTIONNER LES TÂCHES OPTIMALES
   */
  selectOptimalTasks(availableTasks, maxTasks, userRoles) {
    // Algorithme de sélection intelligent
    const scoredTasks = availableTasks.map(task => {
      let score = 0;
      
      // Score basé sur la difficulté et le niveau utilisateur
      const userRole = userRoles[task.roleId];
      if (userRole) {
        const userLevel = roleUnlockService.calculateRoleLevel(userRole.xp || 0);
        const levelMatch = task.roleLevel === userLevel;
        score += levelMatch ? 10 : 5;
      }
      
      // Score basé sur la récompense XP
      score += task.xpReward / 10;
      
      // Bonus pour les tâches récurrentes importantes
      if (task.recurring === 'daily') score += 15;
      if (task.recurring === 'weekly') score += 10;
      
      // Bonus pour les tâches avec livrables
      if (task.deliverables && task.deliverables.length > 0) score += 5;
      
      // Malus pour les tâches très longues
      if (task.estimatedTime > 120) score -= 5;
      
      return { ...task, score };
    });

    // Trier par score et sélectionner les meilleures
    return scoredTasks
      .sort((a, b) => b.score - a.score)
      .slice(0, maxTasks);
  }

  /**
   * ✅ COMPLÉTER UNE TÂCHE SPÉCIFIQUE
   */
  async completeRoleTask(taskId, userId, completionData = {}) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Mettre à jour le statut de la tâche
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: userId,
        completionData: {
          ...completionData,
          completionTime: new Date(),
          autoCompleted: false
        },
        progress: 100
      });

      // Récupérer les détails de la tâche pour calculer les récompenses
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        throw new Error('Tâche non trouvée');
      }

      const taskData = taskDoc.data();
      const xpGained = taskData.xpReward || 0;
      const roleId = taskData.roleId;

      // Attribuer l'XP au rôle approprié
      if (roleId && xpGained > 0) {
        await roleUnlockService.handleXpGain(userId, roleId, xpGained);
      }

      // Déclencher les événements de gamification
      if (typeof window !== 'undefined' && window.badgeSystem) {
        await window.badgeSystem.onTaskCompleted({
          taskId,
          roleId,
          xpGained,
          category: taskData.category,
          difficulty: taskData.difficulty
        });
      }

      console.log('✅ Tâche spécifique complétée:', { taskId, xpGained, roleId });

      return {
        success: true,
        xpGained,
        roleId,
        levelUpCheck: true
      };

    } catch (error) {
      console.error('❌ Erreur completion tâche spécifique:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE TÂCHES PAR RÔLE
   */
  async getRoleTaskStats(userId, roleId = null) {
    try {
      let tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('metadata.roleSpecific', '==', true)
      );

      if (roleId) {
        tasksQuery = query(tasksQuery, where('metadata.roleId', '==', roleId));
      }

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Calculer les statistiques
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        assigned: tasks.filter(t => t.status === 'assigned').length,
        totalXpEarned: tasks
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.xpReward || 0), 0),
        averageCompletionTime: this.calculateAverageCompletionTime(tasks),
        tasksByCategory: this.groupTasksByCategory(tasks),
        tasksByDifficulty: this.groupTasksByDifficulty(tasks)
      };

      return { success: true, stats, tasks };

    } catch (error) {
      console.error('❌ Erreur stats tâches rôle:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🕒 CALCULER LE TEMPS MOYEN DE COMPLETION
   */
  calculateAverageCompletionTime(tasks) {
    const completedTasks = tasks.filter(t => 
      t.status === 'completed' && 
      t.assignedAt && 
      t.completedAt
    );

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const assignedTime = task.assignedAt.toDate ? task.assignedAt.toDate() : new Date(task.assignedAt);
      const completedTime = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
      return sum + (completedTime - assignedTime);
    }, 0);

    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // Heures
  }

  /**
   * 📊 GROUPER LES TÂCHES PAR CATÉGORIE
   */
  groupTasksByCategory(tasks) {
    return tasks.reduce((groups, task) => {
      const category = task.category || 'other';
      if (!groups[category]) {
        groups[category] = { total: 0, completed: 0 };
      }
      groups[category].total++;
      if (task.status === 'completed') {
        groups[category].completed++;
      }
      return groups;
    }, {});
  }

  /**
   * 📊 GROUPER LES TÂCHES PAR DIFFICULTÉ
   */
  groupTasksByDifficulty(tasks) {
    return tasks.reduce((groups, task) => {
      const difficulty = task.difficulty || 'Unknown';
      if (!groups[difficulty]) {
        groups[difficulty] = { total: 0, completed: 0 };
      }
      groups[difficulty].total++;
      if (task.status === 'completed') {
        groups[difficulty].completed++;
      }
      return groups;
    }, {});
  }

  /**
   * 🔄 GÉNÉRER DES TÂCHES RÉCURRENTES
   */
  async generateRecurringTasks(userId, userRoles = {}) {
    try {
      const now = new Date();
      const today = now.toDateString();
      
      const availableTasks = this.getAvailableTasksForUser(userRoles);
      const recurringTasks = availableTasks.filter(task => 
        task.recurring && task.isUnlocked
      );

      const generatedTasks = [];

      for (const taskTemplate of recurringTasks) {
        // Vérifier si cette tâche récurrente a déjà été générée aujourd'hui
        const existingQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('metadata.template', '==', taskTemplate.id),
          where('createdAt', '>=', new Date(today))
        );

        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          // Générer la tâche récurrente
          const result = await this.createTaskInstance(
            userId, 
            { ...taskTemplate, isRecurring: true }, 
            'recurring_generator'
          );
          
          if (result.success) {
            generatedTasks.push(result.taskInstance);
          }
        }
      }

      return {
        success: true,
        generatedCount: generatedTasks.length,
        tasks: generatedTasks
      };

    } catch (error) {
      console.error('❌ Erreur génération tâches récurrentes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 RECOMMANDER DES TÂCHES POUR PROGRESSION
   */
  getTaskRecommendations(userRoles = {}, targetRole = null) {
    const recommendations = [];

    Object.entries(userRoles).forEach(([roleId, roleData]) => {
      // Skip si on se concentre sur un rôle spécifique
      if (targetRole && roleId !== targetRole) return;

      const currentLevel = roleUnlockService.calculateRoleLevel(roleData.xp || 0);
      const nextUnlocks = roleUnlockService.getNextUnlocks({ [roleId]: roleData });
      
      if (nextUnlocks[roleId]) {
        const { xpNeeded, nextLevel } = nextUnlocks[roleId];
        const roleTasks = ROLE_SPECIFIC_TASKS[roleId];
        
        if (roleTasks && roleTasks[currentLevel]) {
          const currentLevelTasks = roleTasks[currentLevel]
            .filter(task => this.isTaskUnlocked(task, userRoles))
            .sort((a, b) => b.xpReward - a.xpReward);

          recommendations.push({
            roleId,
            currentLevel,
            nextLevel,
            xpNeeded,
            recommendedTasks: currentLevelTasks.slice(0, 3),
            priorityMessage: `Complétez ${Math.ceil(xpNeeded / (currentLevelTasks[0]?.xpReward || 25))} tâches pour atteindre ${nextLevel}`
          });
        }
      }
    });

    return recommendations;
  }

  /**
   * 🎖️ OBTENIR LES BADGES POTENTIELS POUR LES TÂCHES
   */
  getTaskBadgePotential(taskId, userRoles = {}) {
    // Cette méthode sera intégrée avec le système de badges
    // pour montrer quels badges peuvent être débloqués en complétant certaines tâches
    
    const potentialBadges = [];

    // Logique pour identifier les badges potentiels basés sur:
    // - Le type de tâche
    // - La série de tâches similaires
    // - Les jalons de progression
    // - Les performances exceptionnelles

    return potentialBadges;
  }
}

// Instance singleton
const roleTaskManager = new RoleTaskManager();

export default roleTaskManager;
export { ROLE_SPECIFIC_TASKS };
