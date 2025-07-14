// ==========================================
// 📁 react-app/src/core/services/analyticsService.js
// SERVICE ANALYTICS AVEC VRAIES DONNÉES FIREBASE
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
import { db } from '../firebase.js';

/**
 * 📊 SERVICE ANALYTICS AVEC VRAIES DONNÉES FIREBASE
 * Récupère et analyse les VRAIES données de ton application
 */
class AnalyticsService {
  constructor() {
    this.listeners = new Set();
    this.cache = new Map();
    console.log('📊 AnalyticsService initialisé avec données réelles Firebase');
  }

  /**
   * 📈 MÉTRIQUES GLOBALES RÉELLES DE L'UTILISATEUR
   */
  async getGlobalMetrics(userId) {
    try {
      console.log('📊 Récupération VRAIES métriques globales pour:', userId);

      // 🔥 RÉCUPÉRER VRAIES TÂCHES de la collection 'tasks'
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const userTasks = [];
      tasksSnapshot.forEach(doc => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 RÉCUPÉRER VRAIES TÂCHES créées par l'utilisateur
      const createdTasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId)
      );
      const createdTasksSnapshot = await getDocs(createdTasksQuery);
      const createdTasks = [];
      createdTasksSnapshot.forEach(doc => {
        createdTasks.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 RÉCUPÉRER VRAIES TÂCHES assignées à l'utilisateur
      const assignedTasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId)
      );
      const assignedTasksSnapshot = await getDocs(assignedTasksQuery);
      const assignedTasks = [];
      assignedTasksSnapshot.forEach(doc => {
        assignedTasks.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 COMBINER TOUTES LES TÂCHES DE L'UTILISATEUR (éviter doublons)
      const allUserTasksMap = new Map();
      [...userTasks, ...createdTasks, ...assignedTasks].forEach(task => {
        allUserTasksMap.set(task.id, task);
      });
      const allUserTasks = Array.from(allUserTasksMap.values());

      // 🔥 RÉCUPÉRER VRAIS PROJETS
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const userProjects = [];
      projectsSnapshot.forEach(doc => {
        userProjects.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 RÉCUPÉRER DONNÉES UTILISATEUR COMPLÈTES
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // 📊 CALCULER VRAIES MÉTRIQUES
      const metrics = {
        // Métriques des tâches RÉELLES
        totalTasks: allUserTasks.length,
        completedTasks: allUserTasks.filter(t => t.status === 'completed').length,
        pendingTasks: allUserTasks.filter(t => t.status === 'pending' || t.status === 'todo').length,
        inProgressTasks: allUserTasks.filter(t => t.status === 'in-progress' || t.status === 'inProgress').length,
        
        // Métriques des projets RÉELLES
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'active').length,
        completedProjects: userProjects.filter(p => p.status === 'completed').length,
        
        // XP RÉEL depuis les données utilisateur
        totalXP: userData.gamification?.totalXp || 
                userData.totalXP || 
                allUserTasks.filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + (t.xpReward || t.xp || 0), 0),
        
        // Niveau RÉEL
        level: userData.gamification?.level || userData.level || 1,
        
        // Badges RÉELS
        totalBadges: userData.gamification?.badges?.length || userData.badges?.length || 0,
        
        // Performance RÉELLE
        completionRate: allUserTasks.length > 0 ? 
          Math.round((allUserTasks.filter(t => t.status === 'completed').length / allUserTasks.length) * 100) : 0,
        
        // Productivité RÉELLE
        productivity: this.calculateRealProductivity(allUserTasks),
        
        // Tendance RÉELLE
        trend: this.calculateRealTrend(allUserTasks),

        // Métriques supplémentaires RÉELLES
        highPriorityTasks: allUserTasks.filter(t => t.priority === 'high').length,
        overdueTasks: this.calculateOverdueTasks(allUserTasks),
        tasksThisWeek: this.calculateTasksThisWeek(allUserTasks),
        averageTaskTime: this.calculateAverageTaskTime(allUserTasks)
      };

      console.log('✅ VRAIES métriques calculées:', {
        ...metrics,
        rawData: {
          tasksFound: allUserTasks.length,
          projectsFound: userProjects.length,
          userDataExists: !!userData.email
        }
      });

      // Mettre en cache
      this.cache.set(`metrics_${userId}`, metrics);
      
      return metrics;

    } catch (error) {
      console.error('❌ Erreur récupération vraies métriques:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * 🎯 CALCUL PRODUCTIVITÉ RÉELLE
   */
  calculateRealProductivity(tasks) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const completedThisWeek = tasks.filter(task => {
      if (task.status !== 'completed') return false;
      
      // Vérifier différents formats de date
      let completedDate = null;
      if (task.completedAt) {
        completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
      } else if (task.updatedAt && task.status === 'completed') {
        completedDate = task.updatedAt.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
      }
      
      return completedDate && completedDate >= weekAgo;
    }).length;

    if (completedThisWeek >= 10) return 'high';
    if (completedThisWeek >= 5) return 'medium';
    return 'low';
  }

  /**
   * 📊 CALCUL TENDANCE RÉELLE
   */
  calculateRealTrend(tasks) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const getCompletedInPeriod = (start, end) => {
      return tasks.filter(task => {
        if (task.status !== 'completed') return false;
        
        let completedDate = null;
        if (task.completedAt) {
          completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        } else if (task.updatedAt && task.status === 'completed') {
          completedDate = task.updatedAt.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
        }
        
        return completedDate && completedDate >= start && completedDate < end;
      }).length;
    };

    const thisWeek = getCompletedInPeriod(weekAgo, now);
    const lastWeek = getCompletedInPeriod(twoWeeksAgo, weekAgo);

    if (thisWeek > lastWeek) return 'up';
    if (thisWeek < lastWeek) return 'down';
    return 'stable';
  }

  /**
   * ⏰ CALCULER TÂCHES EN RETARD
   */
  calculateOverdueTasks(tasks) {
    const now = new Date();
    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      return dueDate < now;
    }).length;
  }

  /**
   * 📅 CALCULER TÂCHES DE CETTE SEMAINE
   */
  calculateTasksThisWeek(tasks) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      let createdDate = null;
      if (task.createdAt) {
        createdDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
      }
      return createdDate && createdDate >= weekAgo;
    }).length;
  }

  /**
   * ⏱️ CALCULER TEMPS MOYEN PAR TÂCHE
   */
  calculateAverageTaskTime(tasks) {
    const completedWithTime = tasks.filter(task => 
      task.status === 'completed' && task.timeSpent
    );
    
    if (completedWithTime.length === 0) return 0;
    
    const totalTime = completedWithTime.reduce((sum, task) => 
      sum + (task.timeSpent || 0), 0
    );
    
    return Math.round(totalTime / completedWithTime.length);
  }

  /**
   * 📈 PROGRESSION RÉELLE AU FIL DU TEMPS
   */
  async getProgressOverTime(userId, days = 30) {
    try {
      console.log('📈 Calcul VRAIE progression sur', days, 'jours pour:', userId);
      
      // Récupérer toutes les tâches de l'utilisateur
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      tasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Générer les données de progression réelles
      const progressData = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculer vraies métriques pour ce jour
        const tasksCompletedThisDay = tasks.filter(task => {
          if (task.status !== 'completed') return false;
          
          let completedDate = null;
          if (task.completedAt) {
            completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
          } else if (task.updatedAt && task.status === 'completed') {
            completedDate = task.updatedAt.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
          }
          
          if (!completedDate) return false;
          
          return completedDate.toISOString().split('T')[0] === dateStr;
        });

        const xpEarned = tasksCompletedThisDay.reduce((sum, task) => 
          sum + (task.xpReward || task.xp || 0), 0
        );

        progressData.push({
          date: dateStr,
          tasks: tasksCompletedThisDay.length,
          xp: xpEarned,
          completionRate: tasksCompletedThisDay.length > 0 ? 100 : 0
        });
      }
      
      console.log('✅ VRAIE progression calculée:', progressData.slice(-7)); // Log des 7 derniers jours
      return progressData;

    } catch (error) {
      console.error('❌ Erreur progression temps réelle:', error);
      return [];
    }
  }

  /**
   * 📁 PROGRESSION RÉELLE DES PROJETS
   */
  async getProjectsProgress(userId) {
    try {
      console.log('📁 Récupération VRAIE progression projets pour:', userId);
      
      // Récupérer vrais projets
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = [];
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() };
        
        // Récupérer les vraies tâches du projet
        const projectTasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectDoc.id)
        );
        const projectTasksSnapshot = await getDocs(projectTasksQuery);
        const projectTasks = [];
        projectTasksSnapshot.forEach(doc => {
          projectTasks.push({ id: doc.id, ...doc.data() });
        });

        // Calculer vraies métriques du projet
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        projects.push({
          id: projectData.id,
          name: projectData.name || projectData.title || 'Projet sans nom',
          progress,
          status: projectData.status || 'active',
          tasksCompleted: completedTasks,
          tasksTotal: totalTasks,
          team: projectData.members || projectData.team || [],
          dueDate: projectData.deadline || projectData.dueDate,
          createdAt: projectData.createdAt
        });
      }
      
      console.log('✅ VRAIE progression projets:', projects);
      return projects;

    } catch (error) {
      console.error('❌ Erreur progression projets réelle:', error);
      return [];
    }
  }

  /**
   * 📊 DISTRIBUTION RÉELLE DES TÂCHES
   */
  async getTasksDistribution(userId) {
    try {
      console.log('📊 Calcul VRAIE distribution tâches pour:', userId);
      
      // Récupérer toutes les tâches réelles de l'utilisateur
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      tasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Calculer distribution RÉELLE par statut
      const statusCounts = {
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress' || t.status === 'inProgress').length,
        pending: tasks.filter(t => t.status === 'pending' || t.status === 'todo').length
      };

      // Calculer distribution RÉELLE par priorité
      const priorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      };

      // Récupérer les projets pour distribution par projet
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectCounts = {};
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        const projectTasks = tasks.filter(t => t.projectId === projectDoc.id);
        if (projectTasks.length > 0) {
          projectCounts[projectData.name || 'Projet sans nom'] = projectTasks.length;
        }
      }

      const distribution = {
        byStatus: [
          { name: 'Terminées', value: statusCounts.completed, color: '#10b981' },
          { name: 'En cours', value: statusCounts.inProgress, color: '#3b82f6' },
          { name: 'En attente', value: statusCounts.pending, color: '#f59e0b' }
        ],
        byPriority: [
          { name: 'Haute', value: priorityCounts.high, color: '#ef4444' },
          { name: 'Moyenne', value: priorityCounts.medium, color: '#f59e0b' },
          { name: 'Basse', value: priorityCounts.low, color: '#10b981' }
        ],
        byProject: Object.entries(projectCounts).map(([name, count], index) => ({
          name,
          value: count,
          color: ['#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899'][index % 5]
        }))
      };

      console.log('✅ VRAIE distribution calculée:', distribution);
      return distribution;

    } catch (error) {
      console.error('❌ Erreur distribution tâches réelle:', error);
      return { byStatus: [], byPriority: [], byProject: [] };
    }
  }

  /**
   * 📈 ANALYTICS GLOBALES SIMPLIFIÉES RÉELLES
   */
  async getOverallAnalytics() {
    try {
      console.log('📊 Récupération analytics globales RÉELLES...');
      
      // Récupérer les métriques pour l'utilisateur connecté
      // (Note: dans un contexte réel, vous devriez avoir l'userId du contexte)
      const auth = getAuth ? getAuth() : null;
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ Pas d\'utilisateur connecté pour analytics globales');
        return this.getEmptyMetrics();
      }

      return await this.getGlobalMetrics(currentUser.uid);

    } catch (error) {
      console.error('❌ Erreur analytics globales:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * 📊 MÉTRIQUES VIDES PAR DÉFAUT
   */
  getEmptyMetrics() {
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalXP: 0,
      level: 1,
      totalBadges: 0,
      completionRate: 0,
      productivity: 'low',
      trend: 'stable',
      highPriorityTasks: 0,
      overdueTasks: 0,
      tasksThisWeek: 0,
      averageTaskTime: 0
    };
  }

  /**
   * 🔔 ABONNEMENT AUX MÉTRIQUES TEMPS RÉEL
   */
  subscribeToMetrics(userId, callback) {
    try {
      console.log('🔔 Abonnement métriques temps réel pour:', userId);
      
      // S'abonner aux changements de tâches
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      
      const unsubscribe = onSnapshot(tasksQuery, async (snapshot) => {
        console.log('🔄 Changement détecté dans les tâches, recalcul métriques...');
        try {
          const metrics = await this.getGlobalMetrics(userId);
          callback(metrics);
        } catch (error) {
          console.error('❌ Erreur callback métriques temps réel:', error);
        }
      });

      this.listeners.add(unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur abonnement métriques temps réel:', error);
      return () => {};
    }
  }

  /**
   * 🧹 NETTOYAGE DES LISTENERS
   */
  cleanup() {
    console.log('🧹 Nettoyage AnalyticsService...');
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    this.cache.clear();
  }
}

// Export instance unique
const analyticsService = new AnalyticsService();
export { analyticsService };
export default analyticsService;
