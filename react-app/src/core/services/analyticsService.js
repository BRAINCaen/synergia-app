// react-app/src/modules/analytics/services/analyticsService.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';

/**
 * Service Analytics pour Synergia v3.3
 * Intégration complète Firebase - Architecture JSX
 */
class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  /**
   * Obtenir les métriques globales temps réel
   */
  async getGlobalMetrics(userId) {
    try {
      const [projects, tasks] = await Promise.all([
        this.getProjectsMetrics(userId),
        this.getTasksMetrics(userId)
      ]);

      return {
        // Métriques projets
        totalProjects: projects.total,
        activeProjects: projects.active,
        completedProjects: projects.completed,
        
        // Métriques tâches
        totalTasks: tasks.total,
        completedTasks: tasks.completed,
        pendingTasks: tasks.pending,
        overdueTasks: tasks.overdue,
        
        // Métriques calculées
        teamMembers: 15, // À adapter selon votre système d'équipes
        avgCompletion: this.calculateAvgCompletion(projects.projects),
        productivity: this.calculateProductivity(tasks.tasks),
        velocity: await this.calculateVelocity(userId, tasks.tasks)
      };
    } catch (error) {
      console.error('❌ Erreur analytics globales:', error);
      throw error;
    }
  }

  /**
   * Métriques des projets avec calculs temps réel
   */
  async getProjectsMetrics(userId) {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(projectsQuery);
    const projects = [];

    for (const doc of snapshot.docs) {
      const projectData = { id: doc.id, ...doc.data() };
      
      // Récupérer les tâches de chaque projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', doc.id)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(taskDoc => taskDoc.data());
      
      // Calculer la completion
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      projects.push({
        ...projectData,
        completion,
        totalTasks,
        completedTasks
      });
    }

    const active = projects.filter(p => p.status !== 'completed').length;
    const completed = projects.filter(p => p.status === 'completed').length;

    return {
      total: projects.length,
      active,
      completed,
      projects
    };
  }

  /**
   * Métriques des tâches avec états détaillés
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
    
    // Tâches en retard
    const overdue = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      return dueDate < now;
    }).length;

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      tasks
    };
  }

  /**
   * Données progression dans le temps (graphique ligne)
   */
  async getProgressOverTime(userId, days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(tasksQuery);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Initialiser les données quotidiennes
    const dailyStats = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = { created: 0, completed: 0 };
    }

    // Compter tâches créées
    tasks.forEach(task => {
      if (!task.createdAt) return;
      const createdDate = task.createdAt.toDate().toISOString().split('T')[0];
      if (dailyStats[createdDate]) {
        dailyStats[createdDate].created++;
      }
    });

    // Compter tâches complétées
    tasks.filter(t => t.completed && t.completedAt).forEach(task => {
      const completedDate = task.completedAt.toDate().toISOString().split('T')[0];
      if (dailyStats[completedDate]) {
        dailyStats[completedDate].completed++;
      }
    });

    // Convertir pour Recharts
    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        created: stats.created,
        completed: stats.completed
      }))
      .slice(-days); // Garder seulement les X derniers jours
  }

  /**
   * Données vélocité par équipe (simulées pour démo)
   */
  async getVelocityData(userId) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [thisWeekTasks, lastWeekTasks] = await Promise.all([
      this.getTasksInPeriod(userId, weekAgo, now),
      this.getTasksInPeriod(userId, twoWeeksAgo, weekAgo)
    ]);

    const thisWeekCompleted = thisWeekTasks.filter(t => t.completed).length;
    const lastWeekCompleted = lastWeekTasks.filter(t => t.completed).length;

    // Générer données équipes (à adapter selon votre structure)
    return [
      { team: 'Frontend', thisWeek: thisWeekCompleted, lastWeek: lastWeekCompleted },
      { team: 'Backend', thisWeek: Math.floor(thisWeekCompleted * 0.8), lastWeek: Math.floor(lastWeekCompleted * 0.9) },
      { team: 'Design', thisWeek: Math.floor(thisWeekCompleted * 0.6), lastWeek: Math.floor(lastWeekCompleted * 0.7) },
      { team: 'Product', thisWeek: Math.floor(thisWeekCompleted * 0.4), lastWeek: Math.floor(lastWeekCompleted * 0.5) }
    ];
  }

  /**
   * Progression détaillée des projets
   */
  async getProjectsProgress(userId) {
    const { projects } = await this.getProjectsMetrics(userId);
    
    return projects.map(project => ({
      name: project.title || project.name || 'Projet sans nom',
      completion: project.completion || 0,
      tasks: `${project.completedTasks || 0}/${project.totalTasks || 0}`,
      priority: project.priority || 'medium',
      status: project.status || 'active',
      dueDate: project.dueDate
    })).sort((a, b) => b.completion - a.completion);
  }

  /**
   * Distribution des tâches pour graphique pie
   */
  async getTasksDistribution(userId) {
    const { completed, pending, overdue } = await this.getTasksMetrics(userId);
    
    return [
      { name: 'Complétées', value: completed, color: '#10b981' },
      { name: 'En cours', value: pending - overdue, color: '#3b82f6' },
      { name: 'En retard', value: overdue, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }

  /**
   * Écouter les changements en temps réel
   */
  subscribeToMetrics(userId, callback) {
    const unsubscribers = [];

    // Écouter les tâches
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    
    const unsubTasks = onSnapshot(tasksQuery, () => {
      console.log('🔄 Mise à jour tâches détectée');
      this.getGlobalMetrics(userId).then(callback).catch(console.error);
    });
    unsubscribers.push(unsubTasks);

    // Écouter les projets
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    );
    
    const unsubProjects = onSnapshot(projectsQuery, () => {
      console.log('🔄 Mise à jour projets détectée');
      this.getGlobalMetrics(userId).then(callback).catch(console.error);
    });
    unsubscribers.push(unsubProjects);

    // Fonction de nettoyage
    return () => {
      console.log('🔌 Déconnexion listeners analytics');
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Export des données
   */
  async exportAnalytics(userId, format = 'json') {
    try {
      const [metrics, progress, velocity, projects, distribution] = await Promise.all([
        this.getGlobalMetrics(userId),
        this.getProgressOverTime(userId),
        this.getVelocityData(userId),
        this.getProjectsProgress(userId),
        this.getTasksDistribution(userId)
      ]);

      const exportData = {
        generatedAt: new Date().toISOString(),
        userId,
        metrics,
        charts: {
          progressOverTime: progress,
          velocityData: velocity,
          projectsProgress: projects,
          tasksDistribution: distribution
        }
      };

      if (format === 'csv') {
        return this.convertToCSV(exportData);
      }
      
      return exportData;
    } catch (error) {
      console.error('❌ Erreur export analytics:', error);
      throw error;
    }
  }

  /**
   * Méthodes utilitaires
   */
  async getTasksInPeriod(userId, startDate, endDate) {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(tasksQuery);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = task.completedAt.toDate();
      return completedDate >= startDate && completedDate <= endDate;
    });
  }

  calculateAvgCompletion(projects) {
    if (!projects.length) return 0;
    const totalCompletion = projects.reduce((sum, p) => sum + (p.completion || 0), 0);
    return Math.round(totalCompletion / projects.length);
  }

  calculateProductivity(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = task.completedAt.toDate();
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }).length;
  }

  async calculateVelocity(userId, tasks) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTasks = tasks.filter(task => {
      if (!task.completedAt) return false;
      return task.completedAt.toDate() >= weekAgo;
    });
    return weeklyTasks.length;
  }

  convertToCSV(data) {
    // Implémentation basique CSV
    const metrics = data.metrics;
    const csv = [
      'Métrique,Valeur',
      `Projets Total,${metrics.totalProjects}`,
      `Projets Actifs,${metrics.activeProjects}`,
      `Tâches Total,${metrics.totalTasks}`,
      `Tâches Complétées,${metrics.completedTasks}`,
      `Completion Moyenne,${metrics.avgCompletion}%`,
      `Productivité Journalière,${metrics.productivity}`,
      `Vélocité Hebdomadaire,${metrics.velocity}`
    ].join('\n');
    
    return csv;
  }
}

// Instance singleton
const analyticsService = new AnalyticsService();
export default analyticsService;
