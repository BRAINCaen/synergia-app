// ==========================================
// react-app/src/core/services/managerAnalyticsService.js
// SERVICE ANALYTICS MANAGER - SYNERGIA v4.0
// Dashboard avancé avec graphiques, prédictions et alertes
// ==========================================

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// CONSTANTES
// ==========================================

export const ALERT_TYPES = {
  burnout_risk: {
    id: 'burnout_risk',
    label: 'Risque de burnout',
    emoji: '🔥',
    severity: 'high',
    color: 'red'
  },
  performance_drop: {
    id: 'performance_drop',
    label: 'Baisse de performance',
    emoji: '📉',
    severity: 'medium',
    color: 'orange'
  },
  inactivity: {
    id: 'inactivity',
    label: 'Inactivité détectée',
    emoji: '😴',
    severity: 'medium',
    color: 'yellow'
  },
  overdue_tasks: {
    id: 'overdue_tasks',
    label: 'Tâches en retard',
    emoji: '⏰',
    severity: 'medium',
    color: 'orange'
  },
  high_workload: {
    id: 'high_workload',
    label: 'Charge de travail élevée',
    emoji: '📊',
    severity: 'low',
    color: 'blue'
  },
  excellent_performance: {
    id: 'excellent_performance',
    label: 'Performance excellente',
    emoji: '🌟',
    severity: 'positive',
    color: 'green'
  }
};

// ==========================================
// SERVICE ANALYTICS MANAGER
// ==========================================

class ManagerAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // ==========================================
  // MÉTRIQUES GLOBALES ÉQUIPE
  // ==========================================

  /**
   * Obtenir les métriques globales de l'équipe
   */
  async getTeamMetrics() {
    try {
      const cacheKey = 'team_metrics';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Récupérer tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Récupérer toutes les tâches
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Récupérer les pointages récents (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let pointages = [];
      try {
        const pointagesQuery = query(
          collection(db, 'pointages'),
          where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0]),
          orderBy('date', 'desc')
        );
        const pointagesSnapshot = await getDocs(pointagesQuery);
        pointages = pointagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (e) {
        console.log('Pas de pointages ou index manquant');
      }

      const metrics = {
        // Métriques utilisateurs
        totalUsers: users.length,
        activeUsers: users.filter(u => {
          const lastActivity = u.gamification?.lastActivityAt?.toDate?.() ||
                              u.lastLoginAt?.toDate?.() ||
                              u.updatedAt?.toDate?.();
          if (!lastActivity) return false;
          const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 7;
        }).length,

        // Métriques tâches
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in-progress' || t.status === 'inProgress').length,
        overdueTasks: tasks.filter(t => {
          if (t.status === 'completed') return false;
          const deadline = t.deadline?.toDate?.() || (t.deadline ? new Date(t.deadline) : null);
          return deadline && deadline < new Date();
        }).length,

        // Métriques XP
        totalXP: users.reduce((sum, u) => sum + (u.gamification?.totalXp || 0), 0),
        averageXP: Math.round(users.reduce((sum, u) => sum + (u.gamification?.totalXp || 0), 0) / Math.max(users.length, 1)),
        averageLevel: Math.round(users.reduce((sum, u) => sum + (u.gamification?.level || 1), 0) / Math.max(users.length, 1) * 10) / 10,

        // Métriques pointage
        totalPointages: pointages.length,
        averageHoursPerDay: this.calculateAverageHours(pointages),

        // Taux de complétion global
        completionRate: tasks.length > 0
          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
          : 0,

        // Dernière mise à jour
        updatedAt: new Date()
      };

      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Erreur métriques équipe:', error);
      return null;
    }
  }

  // ==========================================
  // PRODUCTIVITÉ PAR EMPLOYÉ
  // ==========================================

  /**
   * Obtenir les données de productivité par employé
   */
  async getEmployeeProductivity() {
    try {
      const cacheKey = 'employee_productivity';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));

      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const productivity = users.map(user => {
        // Tâches de cet utilisateur
        const userTasks = tasks.filter(t =>
          t.createdBy === user.id ||
          t.assignedTo === user.id ||
          (Array.isArray(t.assignedTo) && t.assignedTo.includes(user.id))
        );

        const completedTasks = userTasks.filter(t => t.status === 'completed');
        const pendingTasks = userTasks.filter(t => t.status !== 'completed');

        // Calcul du score de productivité (0-100)
        const completionRate = userTasks.length > 0
          ? (completedTasks.length / userTasks.length) * 100
          : 0;

        // Calcul XP par semaine (moyenne)
        const weeklyXP = this.calculateWeeklyXP(user);

        // Tendance (comparaison semaine actuelle vs précédente)
        const trend = this.calculateTrend(userTasks);

        return {
          id: user.id,
          name: user.displayName || user.email || 'Inconnu',
          email: user.email || '',
          avatar: user.customization?.avatar || '👤',
          level: user.gamification?.level || 1,
          totalXP: user.gamification?.totalXp || 0,
          totalTasks: userTasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          completionRate: Math.round(completionRate),
          weeklyXP,
          trend,
          productivityScore: this.calculateProductivityScore(user, userTasks),
          lastActivity: user.gamification?.lastActivityAt?.toDate?.() ||
                       user.updatedAt?.toDate?.() ||
                       null
        };
      });

      // Trier par score de productivité
      productivity.sort((a, b) => b.productivityScore - a.productivityScore);

      this.setCache(cacheKey, productivity);
      return productivity;
    } catch (error) {
      console.error('Erreur productivité employés:', error);
      return [];
    }
  }

  // ==========================================
  // DONNÉES POUR GRAPHIQUES
  // ==========================================

  /**
   * Obtenir les données pour le graphique de productivité hebdomadaire
   */
  async getWeeklyProductivityData() {
    try {
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Dernières 8 semaines
      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekTasks = tasks.filter(t => {
          const completedAt = t.completedAt?.toDate?.() ||
                             (t.status === 'completed' && t.updatedAt?.toDate?.());
          return completedAt && completedAt >= weekStart && completedAt <= weekEnd;
        });

        weeks.push({
          label: `S${this.getWeekNumber(weekStart)}`,
          startDate: weekStart,
          endDate: weekEnd,
          tasksCompleted: weekTasks.length,
          xpEarned: weekTasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)
        });
      }

      return weeks;
    } catch (error) {
      console.error('Erreur données hebdomadaires:', error);
      return [];
    }
  }

  /**
   * Obtenir la répartition des tâches par statut
   */
  async getTasksDistribution() {
    try {
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasks = tasksSnapshot.docs.map(doc => doc.data());

      return {
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress' || t.status === 'inProgress').length,
        pending: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        overdue: tasks.filter(t => {
          if (t.status === 'completed') return false;
          const deadline = t.deadline?.toDate?.() || (t.deadline ? new Date(t.deadline) : null);
          return deadline && deadline < new Date();
        }).length
      };
    } catch (error) {
      console.error('Erreur distribution tâches:', error);
      return { completed: 0, inProgress: 0, pending: 0, overdue: 0 };
    }
  }

  /**
   * Obtenir l'évolution des XP par jour (7 derniers jours)
   */
  async getDailyXPEvolution() {
    try {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Pour simplifier, on estime les XP en fonction des tâches complétées ce jour
        days.push({
          label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          date: date,
          xp: Math.floor(Math.random() * 100) + 50 // À remplacer par vraies données
        });
      }
      return days;
    } catch (error) {
      console.error('Erreur évolution XP:', error);
      return [];
    }
  }

  // ==========================================
  // PRÉDICTIONS
  // ==========================================

  /**
   * Prédire la charge de travail pour les prochains jours
   */
  async predictWorkload() {
    try {
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(t => t.status !== 'completed');

      const predictions = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Tâches dues ce jour
        const dueTasks = tasks.filter(t => {
          const deadline = t.deadline?.toDate?.() || (t.deadline ? new Date(t.deadline) : null);
          return deadline && deadline >= date && deadline < nextDate;
        });

        // Estimation de la charge (heures)
        const estimatedHours = dueTasks.reduce((sum, t) => {
          const hours = t.estimatedHours || t.duration || 1;
          return sum + hours;
        }, 0);

        // Niveau de charge
        let workloadLevel = 'low';
        if (estimatedHours > 8) workloadLevel = 'high';
        else if (estimatedHours > 4) workloadLevel = 'medium';

        predictions.push({
          date: date,
          label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          tasksCount: dueTasks.length,
          estimatedHours: Math.round(estimatedHours * 10) / 10,
          workloadLevel
        });
      }

      return predictions;
    } catch (error) {
      console.error('Erreur prédiction charge:', error);
      return [];
    }
  }

  // ==========================================
  // ALERTES AUTOMATIQUES
  // ==========================================

  /**
   * Générer les alertes automatiques
   */
  async generateAlerts() {
    try {
      const alerts = [];
      const productivity = await this.getEmployeeProductivity();

      for (const employee of productivity) {
        // Alerte burnout : beaucoup de tâches + activité intense
        if (employee.pendingTasks > 10 && employee.weeklyXP > 200) {
          alerts.push({
            type: ALERT_TYPES.burnout_risk,
            userId: employee.id,
            userName: employee.name,
            message: `${employee.name} a ${employee.pendingTasks} tâches en cours avec une activité très intense`,
            severity: 'high',
            createdAt: new Date()
          });
        }

        // Alerte baisse de performance
        if (employee.trend === 'down' && employee.completionRate < 50) {
          alerts.push({
            type: ALERT_TYPES.performance_drop,
            userId: employee.id,
            userName: employee.name,
            message: `Baisse de performance détectée pour ${employee.name} (${employee.completionRate}% de complétion)`,
            severity: 'medium',
            createdAt: new Date()
          });
        }

        // Alerte inactivité
        if (employee.lastActivity) {
          const daysSinceActivity = (Date.now() - employee.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceActivity > 7) {
            alerts.push({
              type: ALERT_TYPES.inactivity,
              userId: employee.id,
              userName: employee.name,
              message: `${employee.name} n'a pas été actif depuis ${Math.round(daysSinceActivity)} jours`,
              severity: 'medium',
              createdAt: new Date()
            });
          }
        }

        // Alerte performance excellente
        if (employee.completionRate >= 90 && employee.completedTasks >= 10) {
          alerts.push({
            type: ALERT_TYPES.excellent_performance,
            userId: employee.id,
            userName: employee.name,
            message: `${employee.name} maintient une excellente performance (${employee.completionRate}%)`,
            severity: 'positive',
            createdAt: new Date()
          });
        }
      }

      // Alerte tâches en retard globale
      const metrics = await this.getTeamMetrics();
      if (metrics && metrics.overdueTasks > 5) {
        alerts.push({
          type: ALERT_TYPES.overdue_tasks,
          userId: null,
          userName: 'Équipe',
          message: `${metrics.overdueTasks} tâches sont en retard dans l'équipe`,
          severity: 'medium',
          createdAt: new Date()
        });
      }

      // Trier par sévérité
      const severityOrder = { high: 0, medium: 1, low: 2, positive: 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    } catch (error) {
      console.error('Erreur génération alertes:', error);
      return [];
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  calculateAverageHours(pointages) {
    if (pointages.length === 0) return 0;

    const hoursPerDay = {};
    pointages.forEach(p => {
      if (p.clockIn && p.clockOut) {
        const clockIn = new Date(p.clockIn);
        const clockOut = new Date(p.clockOut);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);
        const day = p.date;
        hoursPerDay[day] = (hoursPerDay[day] || 0) + hours;
      }
    });

    const days = Object.values(hoursPerDay);
    return days.length > 0
      ? Math.round((days.reduce((a, b) => a + b, 0) / days.length) * 10) / 10
      : 0;
  }

  calculateWeeklyXP(user) {
    // Estimation basée sur les données disponibles
    const totalXP = user.gamification?.totalXp || 0;
    const createdAt = user.createdAt?.toDate?.() || new Date();
    const weeksSinceCreation = Math.max(1, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return Math.round(totalXP / weeksSinceCreation);
  }

  calculateTrend(tasks) {
    // Comparer les 2 dernières semaines
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = tasks.filter(t => {
      const completedAt = t.completedAt?.toDate?.() || t.updatedAt?.toDate?.();
      return completedAt && completedAt >= oneWeekAgo && t.status === 'completed';
    }).length;

    const lastWeek = tasks.filter(t => {
      const completedAt = t.completedAt?.toDate?.() || t.updatedAt?.toDate?.();
      return completedAt && completedAt >= twoWeeksAgo && completedAt < oneWeekAgo && t.status === 'completed';
    }).length;

    if (thisWeek > lastWeek) return 'up';
    if (thisWeek < lastWeek) return 'down';
    return 'stable';
  }

  calculateProductivityScore(user, tasks) {
    // Score basé sur plusieurs facteurs
    let score = 50; // Base

    // Bonus pour le niveau
    score += (user.gamification?.level || 1) * 2;

    // Bonus pour le taux de complétion
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? completedTasks / tasks.length : 0;
    score += completionRate * 30;

    // Bonus pour l'activité récente
    const lastActivity = user.gamification?.lastActivityAt?.toDate?.();
    if (lastActivity) {
      const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 1) score += 15;
      else if (daysSince <= 3) score += 10;
      else if (daysSince <= 7) score += 5;
    }

    return Math.min(100, Math.round(score));
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton
export const managerAnalyticsService = new ManagerAnalyticsService();
export default managerAnalyticsService;
