// react-app/src/core/services/analyticsService.js
// SERVICE ANALYTICS COMPLET POUR SYNERGIA
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Récupérer les métriques principales
   */
  async getUserMetrics(userId, timeframe = '7days') {
    try {
      const cacheKey = `metrics_${userId}_${timeframe}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const now = new Date();
      const daysBack = this.getTimeframeDays(timeframe);
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Récupérer les tâches de l'utilisateur
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculer les métriques
      const metrics = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        pendingTasks: tasks.filter(t => !t.completed).length,
        overdueTasks: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
        totalXP: tasks.reduce((sum, task) => sum + (task.xpEarned || 0), 0),
        avgTasksPerDay: Math.round(tasks.length / Math.max(1, daysBack))
      };

      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Erreur getUserMetrics:', error);
      throw error;
    }
  }

  /**
   * Données de progression quotidienne
   */
  async getDailyProgressData(userId, days = 7) {
    try {
      const cacheKey = `daily_progress_${userId}_${days}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('completedAt', '>=', startDate),
        where('completed', '==', true),
        orderBy('completedAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const completedTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Générer les données pour chaque jour
      const progressData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayTasks = completedTasks.filter(task => {
          const taskDate = new Date(task.completedAt);
          return taskDate >= dayStart && taskDate < dayEnd;
        });

        progressData.push({
          date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          fullDate: date.toISOString().split('T')[0],
          completed: dayTasks.length,
          xp: dayTasks.reduce((sum, task) => sum + (task.xpEarned || 20), 0),
          tasks: dayTasks
        });
      }

      this.setCache(cacheKey, progressData);
      return progressData;
    } catch (error) {
      console.error('❌ Erreur getDailyProgressData:', error);
      return [];
    }
  }

  /**
   * Distribution des tâches par priorité
   */
  async getPriorityDistribution(userId, timeframe = '30days') {
    try {
      const cacheKey = `priority_dist_${userId}_${timeframe}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const now = new Date();
      const daysBack = this.getTimeframeDays(timeframe);
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const distribution = {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length
      };

      this.setCache(cacheKey, distribution);
      return distribution;
    } catch (error) {
      console.error('❌ Erreur getPriorityDistribution:', error);
      return { low: 0, medium: 0, high: 0, urgent: 0 };
    }
  }

  /**
   * Métriques par projet
   */
  async getProjectMetrics(userId) {
    try {
      const cacheKey = `project_metrics_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Récupérer les projets de l'utilisateur
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const project = { id: projectDoc.id, ...projectDoc.data() };

        // Récupérer les tâches du projet
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', project.id),
          where('userId', '==', userId)
        );

        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const completedTasks = tasks.filter(t => t.completed);
        const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

        projects.push({
          ...project,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          completionRate,
          totalXP: tasks.reduce((sum, task) => sum + (task.xpEarned || 0), 0)
        });
      }

      this.setCache(cacheKey, projects);
      return projects;
    } catch (error) {
      console.error('❌ Erreur getProjectMetrics:', error);
      return [];
    }
  }

  /**
   * Données de vélocité (tâches complétées par semaine)
   */
  async getVelocityData(userId, weeks = 4) {
    try {
      const cacheKey = `velocity_${userId}_${weeks}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const now = new Date();
      const velocityData = [];

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('completedAt', '>=', weekStart),
          where('completedAt', '<', weekEnd),
          where('completed', '==', true)
        );

        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        velocityData.push({
          week: `S${weeks - i}`,
          completed: tasks.length,
          xp: tasks.reduce((sum, task) => sum + (task.xpEarned || 20), 0),
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0]
        });
      }

      this.setCache(cacheKey, velocityData);
      return velocityData;
    } catch (error) {
      console.error('❌ Erreur getVelocityData:', error);
      return [];
    }
  }

  /**
   * Export des données en CSV
   */
  async exportUserData(userId, timeframe = '30days') {
    try {
      const now = new Date();
      const daysBack = this.getTimeframeDays(timeframe);
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Préparer les données CSV
      const csvData = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.completed ? 'Complétée' : 'En cours',
        createdAt: new Date(task.createdAt).toLocaleDateString('fr-FR'),
        completedAt: task.completedAt ? new Date(task.completedAt).toLocaleDateString('fr-FR') : '',
        xpEarned: task.xpEarned || 0,
        projectId: task.projectId || ''
      }));

      return csvData;
    } catch (error) {
      console.error('❌ Erreur exportUserData:', error);
      throw error;
    }
  }

  /**
   * Utilitaires
   */
  getTimeframeDays(timeframe) {
    switch (timeframe) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case '1year': return 365;
      default: return 7;
    }
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export instance unique
export const analyticsService = new AnalyticsService();
export default analyticsService;
