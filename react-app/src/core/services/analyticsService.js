// ==========================================
// 📁 react-app/src/core/services/analyticsService.js
// SERVICE ANALYTICS COMPLET - Métriques et rapports avancés
// ==========================================

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * 📊 SERVICE ANALYTICS COMPLET
 * Gestion des métriques, rapports et statistiques avancées
 */
class AnalyticsService {
  constructor() {
    this.listeners = new Set();
    console.log('📊 AnalyticsService initialisé');
  }

  /**
   * 📈 MÉTRIQUES GLOBALES UTILISATEUR
   */
  async getGlobalMetrics(userId) {
    try {
      console.log('📊 Calcul métriques globales pour:', userId);

      // Récupérer les données des tâches
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les données des projets
      const projectsQuery = query(
        collection(db, 'projects'),
        where('team', 'array-contains', { userId, role: 'owner' })
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculer les métriques
      const metrics = {
        // Métriques des tâches
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'inProgress').length,
        
        // Métriques des projets
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        
        // Métriques XP
        totalXP: tasks
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.xpReward || 0), 0),
        potentialXP: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0),
        
        // Métriques de performance
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
        
        // Métriques temporelles
        tasksThisWeek: this.getTasksInPeriod(tasks, 7),
        tasksThisMonth: this.getTasksInPeriod(tasks, 30),
        
        // Productivité
        averageTasksPerDay: this.calculateAverageTasksPerDay(tasks),
        streak: this.calculateActiveStreak(tasks)
      };

      console.log('✅ Métriques globales calculées:', metrics);
      return metrics;

    } catch (error) {
      console.error('❌ Erreur métriques globales:', error);
      return {
        totalTasks: 0, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0,
        totalProjects: 0, activeProjects: 0, completedProjects: 0,
        totalXP: 0, potentialXP: 0, completionRate: 0,
        tasksThisWeek: 0, tasksThisMonth: 0,
        averageTasksPerDay: 0, streak: 0
      };
    }
  }

  /**
   * 📈 PROGRESSION DANS LE TEMPS
   */
  async getProgressOverTime(userId, days = 30) {
    try {
      console.log('📈 Calcul progression sur', days, 'jours pour:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Créer un tableau des X derniers jours
      const progressData = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Compter les tâches complétées ce jour
        const completedToday = tasks.filter(task => {
          if (!task.completedAt) return false;
          const taskDate = task.completedAt.toDate ? 
            task.completedAt.toDate() : new Date(task.completedAt);
          return taskDate.toISOString().split('T')[0] === dateStr;
        }).length;

        // Compter les tâches créées ce jour
        const createdToday = tasks.filter(task => {
          if (!task.createdAt) return false;
          const taskDate = task.createdAt.toDate ? 
            task.createdAt.toDate() : new Date(task.createdAt);
          return taskDate.toISOString().split('T')[0] === dateStr;
        }).length;

        progressData.push({
          date: dateStr,
          completed: completedToday,
          created: createdToday,
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' })
        });
      }

      console.log('✅ Progression temporelle calculée:', progressData.length, 'points');
      return progressData;

    } catch (error) {
      console.error('❌ Erreur progression temporelle:', error);
      return [];
    }
  }

  /**
   * ⚡ DONNÉES DE VÉLOCITÉ
   */
  async getVelocityData(userId) {
    try {
      console.log('⚡ Calcul vélocité pour:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc'),
        limit(100)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const completedTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Grouper par semaine
      const velocityData = [];
      const weeklyGroups = this.groupTasksByWeek(completedTasks);

      Object.entries(weeklyGroups).forEach(([week, tasks]) => {
        const totalXP = tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0);
        velocityData.push({
          week,
          tasksCompleted: tasks.length,
          xpEarned: totalXP,
          averageXpPerTask: tasks.length > 0 ? Math.round(totalXP / tasks.length) : 0
        });
      });

      // Trier par semaine (plus récente en premier)
      velocityData.sort((a, b) => b.week.localeCompare(a.week));

      console.log('✅ Données vélocité calculées:', velocityData.length, 'semaines');
      return velocityData.slice(0, 12); // 12 dernières semaines

    } catch (error) {
      console.error('❌ Erreur vélocité:', error);
      return [];
    }
  }

  /**
   * 📊 PROGRESSION DES PROJETS
   */
  async getProjectsProgress(userId) {
    try {
      console.log('📊 Calcul progression projets pour:', userId);

      const projectsQuery = query(
        collection(db, 'projects'),
        where('team', 'array-contains', { userId, role: 'owner' })
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const projectsProgress = projects.map(project => ({
        id: project.id,
        title: project.title,
        completion: project.progress || 0,
        status: project.status,
        tasksTotal: project.tasksCount || 0,
        tasksCompleted: project.completedTasksCount || 0,
        xpEarned: project.xpEarned || 0,
        team: project.team ? project.team.length : 0
      }));

      console.log('✅ Progression projets calculée:', projectsProgress.length, 'projets');
      return projectsProgress;

    } catch (error) {
      console.error('❌ Erreur progression projets:', error);
      return [];
    }
  }

  /**
   * 🍰 DISTRIBUTION DES TÂCHES
   */
  async getTasksDistribution(userId) {
    try {
      console.log('🍰 Calcul distribution tâches pour:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Distribution par statut
      const statusDistribution = [
        { name: 'Terminées', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
        { name: 'En cours', value: tasks.filter(t => t.status === 'inProgress').length, color: '#3b82f6' },
        { name: 'En attente', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
        { name: 'En validation', value: tasks.filter(t => t.status === 'validation').length, color: '#8b5cf6' }
      ];

      // Distribution par priorité
      const priorityDistribution = [
        { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
        { name: 'Haute', value: tasks.filter(t => t.priority === 'high').length, color: '#f97316' },
        { name: 'Moyenne', value: tasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
        { name: 'Basse', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' }
      ];

      console.log('✅ Distribution tâches calculée');
      return {
        byStatus: statusDistribution,
        byPriority: priorityDistribution,
        total: tasks.length
      };

    } catch (error) {
      console.error('❌ Erreur distribution tâches:', error);
      return {
        byStatus: [],
        byPriority: [],
        total: 0
      };
    }
  }

  /**
   * 📤 EXPORTER LES ANALYTICS
   */
  async exportAnalytics(userId) {
    try {
      console.log('📤 Export analytics pour:', userId);

      const [metrics, progress, velocity, projects, distribution] = await Promise.all([
        this.getGlobalMetrics(userId),
        this.getProgressOverTime(userId, 90), // 3 mois
        this.getVelocityData(userId),
        this.getProjectsProgress(userId),
        this.getTasksDistribution(userId)
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        summary: metrics,
        progressOverTime: progress,
        velocity: velocity,
        projects: projects,
        distribution: distribution
      };

      console.log('✅ Analytics exportés');
      return exportData;

    } catch (error) {
      console.error('❌ Erreur export analytics:', error);
      throw error;
    }
  }

  /**
   * 🔄 S'ABONNER AUX MÉTRIQUES TEMPS RÉEL
   */
  subscribeToMetrics(userId, callback) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        console.log('🔄 Mise à jour métriques temps réel');
        // Recalculer les métriques avec les nouvelles données
        this.getGlobalMetrics(userId).then(callback);
      });

      this.listeners.add(unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur abonnement métriques:', error);
      return () => {}; // Fonction vide comme fallback
    }
  }

  // ==========================================
  // 🛠️ MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * 📅 OBTENIR LES TÂCHES DANS UNE PÉRIODE
   */
  getTasksInPeriod(tasks, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = task.createdAt.toDate ? 
        task.createdAt.toDate() : new Date(task.createdAt);
      return taskDate >= cutoffDate;
    }).length;
  }

  /**
   * 📊 CALCULER LA MOYENNE DE TÂCHES PAR JOUR
   */
  calculateAverageTasksPerDay(tasks) {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (completedTasks.length === 0) return 0;

    // Trouver la première et dernière tâche complétée
    const dates = completedTasks.map(t => {
      const date = t.completedAt?.toDate ? t.completedAt.toDate() : new Date(t.completedAt || t.createdAt);
      return date.getTime();
    }).filter(Boolean);

    if (dates.length === 0) return 0;

    const firstDate = Math.min(...dates);
    const lastDate = Math.max(...dates);
    const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

    return Math.round((completedTasks.length / daysDiff) * 10) / 10; // 1 décimale
  }

  /**
   * 🔥 CALCULER LA STREAK D'ACTIVITÉ
   */
  calculateActiveStreak(tasks) {
    const completedTasks = tasks
      .filter(t => t.status === 'completed' && t.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
        const dateB = b.completedAt.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
        return dateB - dateA;
      });

    if (completedTasks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Vérifier chaque jour en remontant
    for (let i = 0; i < 365; i++) { // Maximum 1 an
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasTaskThisDay = completedTasks.some(task => {
        const taskDate = task.completedAt.toDate ? 
          task.completedAt.toDate() : new Date(task.completedAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === checkDate.getTime();
      });

      if (hasTaskThisDay) {
        streak++;
      } else if (i > 0) { // Pas de tâche, mais on permet 1 jour de grâce pour aujourd'hui
        break;
      }
    }

    return streak;
  }

  /**
   * 📅 GROUPER LES TÂCHES PAR SEMAINE
   */
  groupTasksByWeek(tasks) {
    const weekly = {};
    
    tasks.forEach(task => {
      const date = task.completedAt?.toDate ? 
        task.completedAt.toDate() : new Date(task.completedAt);
      
      // Obtenir le lundi de la semaine
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weekly[weekKey]) {
        weekly[weekKey] = [];
      }
      weekly[weekKey].push(task);
    });

    return weekly;
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('🧹 Analytics listeners nettoyés');
  }
}

// ✅ EXPORT DE L'INSTANCE SINGLETON
const analyticsService = new AnalyticsService();
export default analyticsService;

console.log('✅ AnalyticsService créé avec toutes les méthodes requises');
