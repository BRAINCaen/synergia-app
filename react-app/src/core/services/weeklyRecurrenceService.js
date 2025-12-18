// ==========================================
// 📁 react-app/src/core/services/weeklyRecurrenceService.js
// SERVICE DE GESTION DES TÂCHES RÉCURRENTES AVEC CHOIX DU JOUR
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📅 SERVICE DE RÉCURRENCE HEBDOMADAIRE INTELLIGENT
 * Gère les tâches qui se répètent certains jours de la semaine
 */
class WeeklyRecurrenceService {
  constructor() {
    this.TASKS_COLLECTION = 'tasks';
    this.RECURRING_TEMPLATES_COLLECTION = 'recurring_task_templates';
    
    // 📅 MAPPING DES JOURS DE LA SEMAINE
    this.WEEKDAY_MAP = {
      0: 'sunday',
      1: 'monday', 
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };

    this.WEEKDAY_NAMES = {
      'sunday': 'Dimanche',
      'monday': 'Lundi',
      'tuesday': 'Mardi', 
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi'
    };

    console.log('📅 WeeklyRecurrenceService initialisé');
  }

  /**
   * 🎯 CRÉER UNE TÂCHE RÉCURRENTE
   * Supporte: daily, weekly, biweekly, monthly
   */
  async createRecurringTask(taskData) {
    try {
      const recurrenceType = taskData.recurrenceType || 'weekly';
      console.log(`🎯 Création tâche récurrente [${recurrenceType}]:`, taskData.title);

      // 🛡️ VALIDATION
      if ((recurrenceType === 'weekly' || recurrenceType === 'biweekly') &&
          (!taskData.recurrenceDays || taskData.recurrenceDays.length === 0)) {
        throw new Error('Au moins un jour de récurrence doit être spécifié pour les récurrences hebdomadaires');
      }

      if (!taskData.title) {
        throw new Error('Titre est obligatoire');
      }

      // 📝 CRÉER LE TEMPLATE DE RÉCURRENCE
      const templateData = {
        // Données de base
        title: taskData.title,
        description: taskData.description || '',
        createdBy: taskData.createdBy,

        // Configuration de récurrence
        isRecurring: true,
        recurrenceType: recurrenceType,
        recurrenceInterval: taskData.recurrenceInterval || 1,
        recurrenceDays: taskData.recurrenceDays || [], // ['monday', 'wednesday', etc.]
        recurrenceEndDate: taskData.recurrenceEndDate || null,

        // Paramètres de la tâche
        difficulty: taskData.difficulty || 'medium',
        priority: taskData.priority || 'medium',
        xpReward: taskData.xpReward || 25,
        estimatedHours: taskData.estimatedHours || 1,
        roleId: taskData.roleId || null,
        category: taskData.category || 'general',
        openToVolunteers: taskData.openToVolunteers || false,
        requiredSkills: taskData.requiredSkills || [],
        tags: taskData.tags || [],

        // Métadonnées
        isTemplate: true,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Pour monthly: jour du mois où créer
        monthlyDayOfMonth: new Date().getDate(),

        // Statistiques
        totalInstances: 0,
        completedInstances: 0,
        lastInstanceCreated: null
      };

      // Sauvegarder le template
      const templateRef = await addDoc(
        collection(db, this.RECURRING_TEMPLATES_COLLECTION),
        templateData
      );

      console.log('✅ Template récurrence créé:', templateRef.id);

      // 🗓️ CRÉER LA PREMIÈRE INSTANCE SI APPLICABLE
      const today = new Date();
      const todayWeekday = this.WEEKDAY_MAP[today.getDay()];
      let shouldCreateNow = false;

      if (recurrenceType === 'daily') {
        shouldCreateNow = true;
      } else if (recurrenceType === 'weekly' || recurrenceType === 'biweekly') {
        shouldCreateNow = taskData.recurrenceDays?.includes(todayWeekday);
      } else if (recurrenceType === 'monthly') {
        shouldCreateNow = true; // Créer la première instance maintenant
      }

      if (shouldCreateNow) {
        console.log(`📅 Création instance immédiate`);
        await this.createTaskInstance(templateRef.id, templateData, today);
      }

      // Message de résumé
      let message = '';
      if (recurrenceType === 'daily') {
        message = `Quête récurrente créée: tous les ${taskData.recurrenceInterval > 1 ? taskData.recurrenceInterval + ' jours' : 'jours'}`;
      } else if (recurrenceType === 'weekly') {
        message = `Quête récurrente créée: ${taskData.recurrenceDays?.map(day => this.WEEKDAY_NAMES[day]).join(', ')}`;
      } else if (recurrenceType === 'biweekly') {
        message = `Quête récurrente créée: toutes les 2 semaines le ${taskData.recurrenceDays?.map(day => this.WEEKDAY_NAMES[day]).join(', ')}`;
      } else if (recurrenceType === 'monthly') {
        message = `Quête récurrente créée: tous les mois le ${today.getDate()}`;
      }

      return {
        success: true,
        templateId: templateRef.id,
        message
      };

    } catch (error) {
      console.error('❌ Erreur création tâche récurrente:', error);
      throw error;
    }
  }

  /**
   * 🎯 ALIAS pour compatibilité avec l'ancien nom
   */
  async createWeeklyRecurringTask(taskData) {
    return this.createRecurringTask({ ...taskData, recurrenceType: 'weekly' });
  }

  /**
   * 🔄 VÉRIFIER ET CRÉER LES INSTANCES MANQUANTES
   * À exécuter quotidiennement pour maintenir les tâches à jour
   * Gère: daily, weekly, biweekly, monthly
   */
  async processScheduledTasks() {
    try {
      console.log('🔄 Traitement des tâches programmées...');

      const today = new Date();
      const todayWeekday = this.WEEKDAY_MAP[today.getDay()];
      const todayString = today.toISOString().split('T')[0];
      const todayDayOfMonth = today.getDate();

      console.log(`📅 Aujourd'hui: ${this.WEEKDAY_NAMES[todayWeekday]} (${todayString})`);

      // Récupérer tous les templates actifs (tous types de récurrence)
      const templatesQuery = query(
        collection(db, this.RECURRING_TEMPLATES_COLLECTION),
        where('isActive', '==', true)
      );

      const templatesSnapshot = await getDocs(templatesQuery);
      let processedCount = 0;

      for (const templateDoc of templatesSnapshot.docs) {
        const templateData = templateDoc.data();
        const templateId = templateDoc.id;
        const recurrenceType = templateData.recurrenceType || 'weekly';
        const recurrenceInterval = templateData.recurrenceInterval || 1;

        // Vérifier si la date de fin est dépassée
        if (templateData.recurrenceEndDate) {
          const endDate = new Date(templateData.recurrenceEndDate);
          if (today > endDate) {
            console.log(`⏹️ Récurrence terminée: ${templateData.title}`);
            continue;
          }
        }

        let shouldCreateToday = false;

        // 📅 DAILY - Tous les X jours
        if (recurrenceType === 'daily') {
          if (templateData.lastInstanceCreated) {
            const lastDate = templateData.lastInstanceCreated.toDate ?
              templateData.lastInstanceCreated.toDate() : new Date(templateData.lastInstanceCreated);
            const daysSinceLastInstance = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            shouldCreateToday = daysSinceLastInstance >= recurrenceInterval;
          } else {
            shouldCreateToday = true; // Première instance
          }
        }

        // 📅 WEEKLY - Chaque semaine certains jours
        else if (recurrenceType === 'weekly') {
          if (templateData.recurrenceDays && templateData.recurrenceDays.includes(todayWeekday)) {
            // Vérifier l'intervalle de semaines
            if (recurrenceInterval > 1 && templateData.lastInstanceCreated) {
              const lastDate = templateData.lastInstanceCreated.toDate ?
                templateData.lastInstanceCreated.toDate() : new Date(templateData.lastInstanceCreated);
              const weeksSinceLastInstance = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24 * 7));
              shouldCreateToday = weeksSinceLastInstance >= recurrenceInterval;
            } else {
              shouldCreateToday = true;
            }
          }
        }

        // 📅 BIWEEKLY - Toutes les 2 semaines certains jours
        else if (recurrenceType === 'biweekly') {
          if (templateData.recurrenceDays && templateData.recurrenceDays.includes(todayWeekday)) {
            if (templateData.lastInstanceCreated) {
              const lastDate = templateData.lastInstanceCreated.toDate ?
                templateData.lastInstanceCreated.toDate() : new Date(templateData.lastInstanceCreated);
              const daysSinceLastInstance = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
              shouldCreateToday = daysSinceLastInstance >= 14; // 2 semaines
            } else {
              shouldCreateToday = true;
            }
          }
        }

        // 📅 MONTHLY - Chaque mois (même jour du mois)
        else if (recurrenceType === 'monthly') {
          const templateCreatedDate = templateData.createdAt?.toDate ?
            templateData.createdAt.toDate() : new Date(templateData.createdAt || Date.now());
          const templateDayOfMonth = templateData.monthlyDayOfMonth || templateCreatedDate.getDate();

          // Créer le même jour du mois
          if (todayDayOfMonth === templateDayOfMonth) {
            if (templateData.lastInstanceCreated) {
              const lastDate = templateData.lastInstanceCreated.toDate ?
                templateData.lastInstanceCreated.toDate() : new Date(templateData.lastInstanceCreated);
              const monthsSinceLastInstance =
                (today.getFullYear() - lastDate.getFullYear()) * 12 +
                (today.getMonth() - lastDate.getMonth());
              shouldCreateToday = monthsSinceLastInstance >= recurrenceInterval;
            } else {
              shouldCreateToday = true;
            }
          }
        }

        // Créer l'instance si nécessaire
        if (shouldCreateToday) {
          // Vérifier si une instance existe déjà pour aujourd'hui
          const existingInstanceQuery = query(
            collection(db, this.TASKS_COLLECTION),
            where('templateId', '==', templateId),
            where('scheduledDate', '==', todayString)
          );

          const existingSnapshot = await getDocs(existingInstanceQuery);

          if (existingSnapshot.empty) {
            console.log(`📝 Création instance [${recurrenceType}]: ${templateData.title}`);
            await this.createTaskInstance(templateId, templateData, today);
            processedCount++;
          } else {
            console.log(`✅ Instance déjà existante: ${templateData.title}`);
          }
        }
      }

      console.log(`✅ ${processedCount} nouvelles instances créées`);
      return { success: true, createdInstances: processedCount };

    } catch (error) {
      console.error('❌ Erreur traitement tâches programmées:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📝 CRÉER UNE INSTANCE DE TÂCHE À PARTIR D'UN TEMPLATE
   */
  async createTaskInstance(templateId, templateData, targetDate) {
    try {
      const dateString = targetDate.toISOString().split('T')[0];
      const weekday = this.WEEKDAY_MAP[targetDate.getDay()];

      const instanceData = {
        // Données héritées du template
        title: templateData.title,
        description: templateData.description,
        difficulty: templateData.difficulty,
        priority: templateData.priority,
        xpReward: templateData.xpReward,
        estimatedHours: templateData.estimatedHours || templateData.estimatedTime || 1,
        createdBy: templateData.createdBy,
        roleId: templateData.roleId,
        category: templateData.category,
        openToVolunteers: templateData.openToVolunteers || false,
        requiredSkills: templateData.requiredSkills || [],
        tags: templateData.tags || [],

        // Métadonnées d'instance
        templateId: templateId,
        isRecurringInstance: true,
        scheduledDate: dateString,
        scheduledWeekday: weekday,
        dueDate: dateString,

        // Statut - Si ouverte aux volontaires, pas d'assignation
        status: 'todo',
        assignedTo: templateData.openToVolunteers ? [] : [],

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instanceCreatedAt: serverTimestamp(),

        // Progression
        completedAt: null,
        validatedBy: null,

        // Récurrence
        isRecurring: false, // L'instance elle-même n'est pas récurrente
        parentRecurrenceType: templateData.recurrenceType || 'weekly',
        parentRecurrenceDays: templateData.recurrenceDays
      };

      const instanceRef = await addDoc(collection(db, this.TASKS_COLLECTION), instanceData);

      // Mettre à jour les statistiques du template
      await updateDoc(doc(db, this.RECURRING_TEMPLATES_COLLECTION, templateId), {
        totalInstances: (templateData.totalInstances || 0) + 1,
        lastInstanceCreated: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Instance créée: ${instanceRef.id} pour ${weekday}`);
      return instanceRef.id;

    } catch (error) {
      console.error('❌ Erreur création instance:', error);
      throw error;
    }
  }

  /**
   * ✅ MARQUER UNE INSTANCE COMME TERMINÉE ET GÉRER LA RÉCURRENCE
   */
  async completeTaskInstance(taskId, completionData) {
    try {
      console.log('✅ Completion tâche récurrente:', taskId);

      // Récupérer la tâche
      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();

      // Marquer comme terminée
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: completionData.userId,
        submissionComment: completionData.comment || '',
        updatedAt: serverTimestamp()
      });

      // Si c'est une instance récurrente, mettre à jour le template
      if (taskData.templateId) {
        const templateRef = doc(db, this.RECURRING_TEMPLATES_COLLECTION, taskData.templateId);
        const templateDoc = await getDoc(templateRef);
        
        if (templateDoc.exists()) {
          const templateData = templateDoc.data();
          await updateDoc(templateRef, {
            completedInstances: (templateData.completedInstances || 0) + 1,
            lastInstanceCompleted: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }

      console.log('✅ Tâche récurrente terminée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur completion tâche récurrente:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES DU JOUR POUR UN UTILISATEUR
   */
  async getTodayTasksForUser(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const todayTasksQuery = query(
        collection(db, this.TASKS_COLLECTION),
        where('userId', '==', userId),
        where('scheduledDate', '==', today),
        where('status', 'in', ['todo', 'in_progress']),
        orderBy('priority', 'desc')
      );

      const snapshot = await getDocs(todayTasksQuery);
      const todayTasks = [];

      snapshot.forEach(doc => {
        todayTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`📋 ${todayTasks.length} tâches aujourd'hui pour l'utilisateur`);
      return todayTasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches du jour:', error);
      return [];
    }
  }

  /**
   * 🔄 GÉRER LES TÂCHES NON RÉALISÉES (REPORT AU LENDEMAIN)
   */
  async handleOverdueTasks() {
    try {
      console.log('🔄 Gestion des tâches en retard...');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      // Récupérer les tâches d'hier non terminées
      const overdueQuery = query(
        collection(db, this.TASKS_COLLECTION),
        where('scheduledDate', '==', yesterdayString),
        where('status', '==', 'todo'),
        where('isRecurringInstance', '==', true)
      );

      const snapshot = await getDocs(overdueQuery);
      let reportedCount = 0;

      for (const taskDoc of snapshot.docs) {
        const taskData = taskDoc.data();
        
        // Reporter au lendemain (aujourd'hui)
        const today = new Date().toISOString().split('T')[0];
        
        await updateDoc(doc(db, this.TASKS_COLLECTION, taskDoc.id), {
          scheduledDate: today,
          dueDate: today,
          isOverdue: true,
          originalScheduledDate: yesterdayString,
          reportedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log(`📅 Tâche reportée: ${taskData.title}`);
        reportedCount++;
      }

      console.log(`✅ ${reportedCount} tâches reportées au lendemain`);
      return { success: true, reportedTasks: reportedCount };

    } catch (error) {
      console.error('❌ Erreur gestion tâches en retard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'UNE TÂCHE RÉCURRENTE
   */
  async getRecurringTaskStats(templateId) {
    try {
      // Stats du template
      const templateRef = doc(db, this.RECURRING_TEMPLATES_COLLECTION, templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (!templateDoc.exists()) {
        throw new Error('Template introuvable');
      }

      const templateData = templateDoc.data();

      // Stats des instances
      const instancesQuery = query(
        collection(db, this.TASKS_COLLECTION),
        where('templateId', '==', templateId)
      );

      const instancesSnapshot = await getDocs(instancesQuery);
      const instances = [];

      instancesSnapshot.forEach(doc => {
        instances.push({
          id: doc.id,
          ...doc.data()
        });
      });

      const stats = {
        templateInfo: templateData,
        totalInstances: instances.length,
        completedInstances: instances.filter(i => i.status === 'completed').length,
        pendingInstances: instances.filter(i => i.status === 'todo').length,
        overdueInstances: instances.filter(i => i.isOverdue).length,
        completionRate: instances.length > 0 ? 
          (instances.filter(i => i.status === 'completed').length / instances.length * 100).toFixed(1) : 0,
        recurrenceDays: templateData.recurrenceDays,
        lastWeekInstances: instances.filter(i => {
          const instanceDate = new Date(i.scheduledDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return instanceDate >= weekAgo;
        }).length
      };

      return stats;

    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DÉSACTIVER UNE TÂCHE RÉCURRENTE
   */
  async disableRecurringTask(templateId) {
    try {
      await updateDoc(doc(db, this.RECURRING_TEMPLATES_COLLECTION, templateId), {
        isActive: false,
        disabledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('🗑️ Tâche récurrente désactivée:', templateId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur désactivation:', error);
      throw error;
    }
  }

  /**
   * 🏠 INITIALISATION DU SERVICE (À APPELER AU DÉMARRAGE)
   */
  async initialize() {
    try {
      console.log('🏠 Initialisation WeeklyRecurrenceService...');
      
      // Traiter les tâches programmées pour aujourd'hui
      await this.processScheduledTasks();
      
      // Gérer les tâches en retard
      await this.handleOverdueTasks();
      
      console.log('✅ WeeklyRecurrenceService initialisé avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export du service
const weeklyRecurrenceService = new WeeklyRecurrenceService();
export default weeklyRecurrenceService;
