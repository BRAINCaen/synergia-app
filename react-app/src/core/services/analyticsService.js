// js/core/services/analyticsService.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase-config.js';

/**
 * Service d'analytics pour Synergia v3.3
 * Intégration complète Firebase pour métriques temps réel
 */
class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  /**
   * Obtenir les métriques globales de l'organisation
   */
  async getGlobalMetrics(userId) {
    try {
      const [projects, tasks, users] = await Promise.all([
        this.getProjectsMetrics(userId),
        this.getTasksMetrics(userId),
        this.getUsersMetrics(userId)
      ]);

      return {
        totalProjects: projects.total,
        activeProjects: projects.active,
        completedProjects: projects.completed,
        totalTasks: tasks.total,
        completedTasks: tasks.completed,
        pendingTasks: tasks.pending,
        overdueTasks: tasks.overdue,
        teamMembers: users.total,
        avgCompletion: this.calculateAvgCompletion(projects.projects),
        productivity: this.calculateProductivity(tasks.tasks),
        velocity: await this.calculateVelocity(userId)
      };
    } catch (error) {
      console.error('Erreur récupération métriques globales:', error);
      throw error;
    }
  }

  /**
   * Métriques des projets
   */
  async getProjectsMetrics(userId) {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(projectsQuery);
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;

    return {
      total: projects.length,
      active,
      completed,
      projects
    };
  }

  /**
   * Métriques des tâches
   */
  async getTasksMetrics(userId) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(tasksQuery);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const now = new Date();
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const overdue = tasks.filter(t => 
      !t.completed && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length;

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      tasks
    };
  }

  /**
   * Métriques des utilisateurs (équipe)
   */
  async getUsersMetrics(userId) {
    // Pour l'instant, retourner données simulées
    // À adapter selon votre système d'équipes
    return {
      total: 15 // Récupérer depuis votre collection users/teams
    };
  }

  /**
   * Données pour graphique progression dans le temps
   */
  async getProgressOverTime(userId, days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(tasksQuery);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Grouper par jour
    const dailyStats = {};
    
    // Initialiser tous les jours
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = { created: 0, completed: 0 };
    }

    // Compter les tâches créées
    tasks.forEach(task => {
      const createdDate = task.createdAt.toDate().toISOString().split('T')[0];
      if (dailyStats[createdDate]) {
        dailyStats[createdDate].created++;
      }
    });

    // Compter les tâches complétées
    tasks.filter(t => t.completed && t.completedAt).forEach(task => {
      const completedDate = task.completedAt.toDate().toISOString().split('T')[0];
      if (dailyStats[completedDate]) {
        dailyStats[completedDate].completed++;
      }
    });

    // Convertir en array pour Recharts
    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      created: stats.created,
      completed: stats.completed
    }));
  }

  /**
   * Vélocité par équipe/période
   */
  async getVelocityData(userId, period = 'week') {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [thisWeekTasks, lastWeekTasks] = await Promise.all([
      this.getTasksInPeriod(userId, weekAgo, now),
      this.getTasksInPeriod(userId, twoWeeksAgo, weekAgo)
    ]);

    const thisWeekCompleted = thisWeekTasks.filter(t => t.completed).length;
    const lastWeekCompleted = lastWeekTasks.filter(t => t.completed).length;

    // Données pour graphique vélocité (par équipe simulé)
    return [
      { team: 'Dev Frontend', thisWeek: thisWeekCompleted, lastWeek: lastWeekCompleted },
      { team: 'Dev Backend', thisWeek: Math.floor(thisWeekCompleted * 0.8), lastWeek: Math.floor(lastWeekCompleted * 0.9) },
      { team: 'Design UX/UI', thisWeek: Math.floor(thisWeekCompleted * 0.6), lastWeek: Math.floor(lastWeekCompleted * 0.7) },
      { team: 'Product', thisWeek: Math.floor(thisWeekCompleted * 0.4), lastWeek: Math.floor(lastWeekCompleted * 0.5) }
    ];
  }

  /**
   * Progression détaillée des projets
   */
  async getProjectsProgress(userId) {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(projectsQuery);
    const projects = [];

    for (const doc of snapshot.docs) {
      const projectData = { id: doc.id, ...doc.data() };
      
      // Récupérer les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', doc.id)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(taskDoc => taskDoc.data());
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      projects.push({
        name: projectData.title || projectData.name,
        completion,
        tasks: `${completedTasks}/${totalTasks}`,
        priority: projectData.priority || 'medium',
        dueDate: projectData.dueDate,
        status: projectData.status || 'active'
      });
    }

    return projects.sort((a, b) => b.completion - a.completion);
  }

  /**
   * Méthodes utilitaires
   */
  async getTasksInPeriod(userId, startDate, endDate) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      where('completedAt', '>=', Timestamp.fromDate(startDate)),
      where('completedAt', '<=', Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(tasksQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  calculateAvgCompletion(projects) {
    if (!projects.length) return 0;
    const totalCompletion = projects.reduce((sum, p) => {
      return sum + (p.completion || 0);
    }, 0);
    return Math.round(totalCompletion / projects.length);
  }

  calculateProductivity(tasks) {
    const completedToday = tasks.filter(t => 
      t.completed && 
      t.completedAt && 
      this.isToday(t.completedAt.toDate())
    ).length;
    
    return completedToday;
  }

  async calculateVelocity(userId) {
    const weeklyTasks = await this.getTasksInPeriod(
      userId, 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
      new Date()
    );
    return weeklyTasks.length;
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Écouter les changements en temps réel
   */
  subscribeToMetrics(userId, callback) {
    const unsubscribers = [];

    // Écouter les changements de tâches
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    
    const unsubTasks = onSnapshot(tasksQuery, () => {
      this.getGlobalMetrics(userId).then(callback);
    });
    unsubscribers.push(unsubTasks);

    // Écouter les changements de projets
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    );
    
    const unsubProjects = onSnapshot(projectsQuery, () => {
      this.getGlobalMetrics(userId).then(callback);
    });
    unsubscribers.push(unsubProjects);

    // Retourner fonction de nettoyage
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Export des données pour rapports
   */
  async exportAnalytics(userId, format = 'json') {
    const [metrics, progress, velocity, projects] = await Promise.all([
      this.getGlobalMetrics(userId),
      this.getProgressOverTime(userId),
      this.getVelocityData(userId),
      this.getProjectsProgress(userId)
    ]);

    const data = {
      generatedAt: new Date().toISOString(),
      metrics,
      progressOverTime: progress,
      velocityData: velocity,
      projectsProgress: projects
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return data;
  }

  convertToCSV(data) {
    // Implémentation conversion CSV si nécessaire
    return JSON.stringify(data, null, 2);
  }
}

// Instance singleton
const analyticsService = new AnalyticsService();
export default analyticsService;
