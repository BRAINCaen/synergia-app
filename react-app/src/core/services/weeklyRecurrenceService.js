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
   * 🎯 CRÉER UNE TÂCHE RÉCURRENTE AVEC JOURS SPÉCIFIQUES
   * Exemple: "Nettoyer la cuisine" tous les lundis
   */
  async createWeeklyRecurringTask(taskData) {
    try {
      console.log('🎯 Création tâche récurrente hebdomadaire:', taskData.title);

      // 🛡️ VALIDATION
      if (!taskData.recurrenceDays || taskData.recurrenceDays.length === 0) {
        throw new Error('Au moins un jour de récurrence doit être spécifié');
      }

      if (!taskData.title || !taskData.userId) {
        throw new Error('Titre et userId sont obligatoires');
      }

      // 📝 CRÉER LE TEMPLATE DE RÉCURRENCE
      const templateData = {
        // Données de base
        title: taskData.title,
        description: taskData.description || '',
        userId: taskData.userId,
        createdBy: taskData.createdBy || taskData.userId,
        
        // Configuration de récurrence
        isRecurring: true,
        recurrenceType: 'weekly',
        recurrenceDays: taskData.recurrenceDays, // ['monday', 'wednesday', etc.]
        
        // Paramètres de la tâche
        difficulty: taskData.difficulty || 'medium',
        priority: taskData.priority || 'medium',
        xpReward: taskData.xpReward || 25,
        estimatedTime: taskData.estimatedTime || 1,
        roleId: taskData.roleId || null,
        category: taskData.category || 'general',
        
        // Métadonnées
        isTemplate: true,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Statistiques
        totalInstances: 0,
        completedInstances: 0,
        lastInstanceCreated: null,
        nextScheduledDays: taskData.recurrenceDays
      };

      // Sauvegarder le template
      const templateRef = await addDoc(
        collection(db, this.RECURRING_TEMPLATES_COLLECTION), 
        templateData
      );

      console.log('✅ Template récurrence créé:', templateRef.id);

      // 🗓️ CRÉER LA PREMIÈRE INSTANCE POUR AUJOURD'HUI SI APPLICABLE
      const today = new Date();
      const todayWeekday = this.WEEKDAY_MAP[today.getDay()];
      
      if (taskData.recurrenceDays.includes(todayWeekday)) {
        console.log(`📅 Création instance immédiate (aujourd'hui = ${todayWeekday})`);
        await this.createTaskInstance(templateRef.id, templateData, today);
      }

      return {
        success: true,
        templateId: templateRef.id,
        message: `Tâche récurrente créée pour ${taskData.recurrenceDays.map(day => this.WEEKDAY_NAMES[day]).join(', ')}`
      };

    } catch (error) {
      console.error('❌ Erreur création tâche récurrente:', error);
      throw error;
    }
  }

  /**
   * 🔄 VÉRIFIER ET CRÉER LES INSTANCES MANQUANTES
   * À exécuter quotidiennement pour maintenir les tâches à jour
   */
  async processScheduledTasks() {
    try {
      console.log('🔄 Traitement des tâches programmées...');

      const today = new Date();
      const todayWeekday = this.WEEKDAY_MAP[today.getDay()];
      const todayString = today.toISOString().split('T')[0];

      console.log(`📅 Aujourd'hui: ${this.WEEKDAY_NAMES[todayWeekday]} (${todayString})`);

      // Récupérer tous les templates actifs
      const templatesQuery = query(
        collection(db, this.RECURRING_TEMPLATES_COLLECTION),
        where('isActive', '==', true),
        where('recurrenceType', '==', 'weekly')
      );

      const templatesSnapshot = await getDocs(templatesQuery);
      let processedCount = 0;

      for (const templateDoc of templatesSnapshot.docs) {
        const templateData = templateDoc.data();
        const templateId = templateDoc.id;

        // Vérifier si ce template doit créer une tâche aujourd'hui
        if (templateData.recurrenceDays && templateData.recurrenceDays.includes(todayWeekday)) {
          
          // Vérifier si une instance existe déjà pour aujourd'hui
          const existingInstanceQuery = query(
            collection(db, this.TASKS_COLLECTION),
            where('templateId', '==', templateId),
            where('scheduledDate', '==', todayString),
            where('status', '!=', 'archived')
          );

          const existingSnapshot = await getDocs(existingInstanceQuery);

          if (existingSnapshot.empty) {
            // Créer la nouvelle instance
            console.log(`📝 Création instance pour: ${templateData.title}`);
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
        estimatedTime: templateData.estimatedTime,
        userId: templateData.userId,
        createdBy: templateData.createdBy,
        roleId: templateData.roleId,
        category: templateData.category,

        // Métadonnées d'instance
        templateId: templateId,
        isRecurringInstance: true,
        scheduledDate: dateString,
        scheduledWeekday: weekday,
        dueDate: dateString,
        
        // Statut
        status: 'todo',
        assignedTo: templateData.userId,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instanceCreatedAt: serverTimestamp(),
        
        // Progression
        completedAt: null,
        validatedBy: null,
        
        // Récurrence
        isRecurring: false, // L'instance elle-même n'est pas récurrente
        parentRecurrenceType: 'weekly',
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
