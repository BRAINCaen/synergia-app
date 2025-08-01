// ==========================================
// 📁 react-app/src/core/services/projectAnalyticsService.js
// SERVICE ANALYTICS ET RAPPORTS PROJETS - NOUVEAU
// ==========================================

import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📊 SERVICE D'ANALYTICS ET RAPPORTS POUR PROJETS
 */
class ProjectAnalyticsService {
  constructor() {
    console.log('📊 ProjectAnalyticsService initialisé');
  }

  /**
   * 📈 RAPPORT COMPLET D'UN PROJET
   */
  async generateProjectReport(projectId) {
    try {
      console.log('📈 Génération rapport projet:', projectId);
      
      // Récupérer les données du projet
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Projet non trouvé');
      }
      
      const projectData = projectDoc.data();
      
      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      tasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      // Calculer les métriques avancées
      const report = {
        // Informations de base
        project: {
          id: projectId,
          title: projectData.title,
          description: projectData.description,
          status: projectData.status,
          phase: projectData.phase,
          priority: projectData.priority,
          createdAt: projectData.createdAt,
          startDate: projectData.startDate,
          dueDate: projectData.dueDate,
          owner: projectData.ownerId,
          teamSize: projectData.teamSize || 0
        },
        
        // Métriques des tâches
        taskMetrics: this.calculateTaskMetrics(tasks),
        
        // Métriques de l'équipe
        teamMetrics: this.calculateTeamMetrics(projectData.team || [], tasks),
        
        // Métriques des jalons
        milestoneMetrics: this.calculateMilestoneMetrics(projectData.milestones || []),
        
        // Timeline et progression
        timeline: this.calculateTimelineMetrics(projectData, tasks),
        
        // Performance et productivité
        performance: this.calculatePerformanceMetrics(projectData, tasks),
        
        // Prédictions et recommandations
        predictions: this.generatePredictions(projectData, tasks),
        
        // Métadonnées du rapport
        reportGenerated: new Date(),
        reportVersion: '1.0'
      };
      
      console.log('✅ Rapport projet généré avec succès');
      return report;
      
    } catch (error) {
      console.error('❌ Erreur génération rapport projet:', error);
      throw error;
    }
  }

  /**
   * 📊 CALCULER LES MÉTRIQUES DES TÂCHES
   */
  calculateTaskMetrics(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const validationPending = tasks.filter(t => t.status === 'validation_pending').length;
    
    // Tâches en retard
    const now = new Date();
    const overdue = tasks.filter(t => {
      const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : null;
      return dueDate && dueDate < now && t.status !== 'completed';
    }).length;
    
    // Répartition par priorité
    const priorityDistribution = {
      low: tasks.filter(t => t.priority === 'low').length,
      normal: tasks.filter(t => t.priority === 'normal').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length
    };
    
    // Répartition par difficulté
    const difficultyDistribution = {
      easy: tasks.filter(t => t.difficulty === 'easy').length,
      normal: tasks.filter(t => t.difficulty === 'normal').length,
      hard: tasks.filter(t => t.difficulty === 'hard').length,
      expert: tasks.filter(t => t.difficulty === 'expert').length
    };
    
    return {
      total,
      completed,
      inProgress,
      pending,
      validationPending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityDistribution,
      difficultyDistribution,
      averageXpPerTask: tasks.length > 0 ? 
        Math.round(tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0) / tasks.length) : 0,
      totalXpPotential: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0),
      earnedXp: tasks
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.xpReward || 0), 0)
    };
  }

  /**
   * 👥 CALCULER LES MÉTRIQUES D'ÉQUIPE
   */
  calculateTeamMetrics(team, tasks) {
    const totalMembers = team.length;
    const activeMembers = team.filter(m => m.isActive !== false).length;
    
    // Répartition des rôles
    const roleDistribution = {};
    team.forEach(member => {
      roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
    });
    
    // Productivité par membre
    const memberProductivity = team.map(member => {
      const memberTasks = tasks.filter(t => t.assignedTo === member.userId);
      const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
      
      return {
        userId: member.userId,
        displayName: member.displayName,
        role: member.role,
        tasksAssigned: memberTasks.length,
        tasksCompleted: completedTasks,
        completionRate: memberTasks.length > 0 ? 
          Math.round((completedTasks / memberTasks.length) * 100) : 0,
        xpEarned: memberTasks
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.xpReward || 0), 0)
      };
    });
    
    // Top performers
    const topPerformers = memberProductivity
      .sort((a, b) => b.xpEarned - a.xpEarned)
      .slice(0, 3);
    
    return {
      totalMembers,
      activeMembers,
      roleDistribution,
      memberProductivity,
      topPerformers,
      averageTasksPerMember: totalMembers > 0 ? 
        Math.round(tasks.length / totalMembers) : 0,
      averageCompletionRate: memberProductivity.length > 0 ?
        Math.round(memberProductivity.reduce((sum, m) => sum + m.completionRate, 0) / memberProductivity.length) : 0
    };
  }

  /**
   * 🎯 CALCULER LES MÉTRIQUES DES JALONS
   */
  calculateMilestoneMetrics(milestones) {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const active = milestones.filter(m => m.status === 'active').length;
    const upcoming = milestones.filter(m => m.status === 'upcoming').length;
    const delayed = milestones.filter(m => m.status === 'delayed').length;
    
    // Progression moyenne
    const averageProgress = total > 0 ? 
      Math.round(milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / total) : 0;
    
    // Prochaine échéance
    const upcomingMilestones = milestones
      .filter(m => m.status !== 'completed' && m.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    const nextDue = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;
    
    return {
      total,
      completed,
      active,
      upcoming,
      delayed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageProgress,
      nextDue: nextDue ? {
        title: nextDue.title,
        dueDate: nextDue.dueDate,
        daysUntil: Math.ceil((new Date(nextDue.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      } : null,
      totalXpPotential: milestones.reduce((sum, m) => sum + (m.xpReward || 0), 0),
      earnedXp: milestones
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + (m.xpReward || 0) + (m.bonusXpEarned || 0), 0)
    };
  }

  /**
   * ⏰ CALCULER LES MÉTRIQUES TIMELINE
   */
  calculateTimelineMetrics(projectData, tasks) {
    const now = new Date();
    const startDate = projectData.startDate?.toDate ? projectData.startDate.toDate() : null;
    const dueDate = projectData.dueDate?.toDate ? projectData.dueDate.toDate() : null;
    
    // Durée du projet
    const totalDuration = startDate && dueDate ? 
      Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24)) : null;
    
    const elapsedDuration = startDate ? 
      Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) : null;
    
    const remainingDuration = dueDate ? 
      Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;
    
    // Progression temporelle vs progression des tâches
    const timeProgress = totalDuration && elapsedDuration ? 
      Math.min(Math.round((elapsedDuration / totalDuration) * 100), 100) : 0;
    
    const taskProgress = projectData.progress || 0;
    
    // Statut du planning
    let scheduleStatus = 'on_track';
    if (timeProgress > taskProgress + 10) {
      scheduleStatus = 'behind_schedule';
    } else if (taskProgress > timeProgress + 10) {
      scheduleStatus = 'ahead_of_schedule';
    }
    
    return {
      startDate,
      dueDate,
      totalDuration,
      elapsedDuration,
      remainingDuration,
      timeProgress,
      taskProgress,
      scheduleStatus,
      isOverdue: dueDate && now > dueDate && taskProgress < 100,
      estimatedCompletion: this.estimateCompletionDate(projectData, tasks)
    };
  }

  /**
   * 🚀 CALCULER LES MÉTRIQUES DE PERFORMANCE
   */
  calculatePerformanceMetrics(projectData, tasks) {
    const team = projectData.team || [];
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    // Vélocité (tâches complétées par jour)
    const projectDays = this.getProjectActiveDays(projectData);
    const velocity = projectDays > 0 ? Math.round(completedTasks.length / projectDays * 10) / 10 : 0;
    
    // Temps moyen de complétion des tâches
    const avgCompletionTime = this.calculateAverageCompletionTime(completedTasks);
    
    // Score de qualité (basé sur les tâches rejetées vs acceptées)
    const acceptedTasks = completedTasks.filter(t => t.validationStatus === 'approved').length;
    const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
    const qualityScore = completedTasks.length > 0 ? 
      Math.round((acceptedTasks / completedTasks.length) * 100) : 100;
    
    // Efficacité de l'équipe
    const teamEfficiency = this.calculateTeamEfficiency(team, tasks);
    
    return {
      velocity,
      avgCompletionTime,
      qualityScore,
      teamEfficiency,
      productivityTrend: this.calculateProductivityTrend(tasks),
      burndownData: this.generateBurndownData(projectData, tasks)
    };
  }

  /**
   * 🔮 GÉNÉRER LES PRÉDICTIONS
   */
  generatePredictions(projectData, tasks) {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const remainingTasks = totalTasks - completedTasks;
    
    // Prédiction de date de fin
    const velocity = this.getProjectVelocity(projectData, tasks);
    const estimatedDaysToComplete = velocity > 0 ? Math.ceil(remainingTasks / velocity) : null;
    
    const now = new Date();
    const estimatedCompletionDate = estimatedDaysToComplete ? 
      new Date(now.getTime() + estimatedDaysToComplete * 24 * 60 * 60 * 1000) : null;
    
    // Prédiction du budget XP
    const avgXpPerTask = totalTasks > 0 ? 
      Math.round(tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0) / totalTasks) : 0;
    const estimatedTotalXp = avgXpPerTask * totalTasks;
    
    // Risques identifiés
    const risks = this.identifyProjectRisks(projectData, tasks);
    
    // Recommandations
    const recommendations = this.generateRecommendations(projectData, tasks, risks);
    
    return {
      estimatedCompletionDate,
      estimatedDaysToComplete,
      estimatedTotalXp,
      confidenceLevel: this.calculatePredictionConfidence(projectData, tasks),
      risks,
      recommendations,
      successProbability: this.calculateSuccessProbability(projectData, tasks)
    };
  }

  /**
   * 🚨 IDENTIFIER LES RISQUES DU PROJET
   */
  identifyProjectRisks(projectData, tasks) {
    const risks = [];
    const now = new Date();
    
    // Risque de retard
    const dueDate = projectData.dueDate?.toDate ? projectData.dueDate.toDate() : null;
    if (dueDate && now > dueDate && projectData.progress < 100) {
      risks.push({
        type: 'schedule_overrun',
        severity: 'high',
        description: 'Projet en retard par rapport à la date limite',
        impact: 'Retard de livraison'
      });
    }
    
    // Risque de surcharge d'équipe
    const team = projectData.team || [];
    const avgTasksPerMember = team.length > 0 ? tasks.length / team.length : 0;
    if (avgTasksPerMember > 10) {
      risks.push({
        type: 'team_overload',
        severity: 'medium',
        description: 'Charge de travail élevée par membre d\'équipe',
        impact: 'Risque de burnout et baisse de qualité'
      });
    }
    
    // Risque de qualité
    const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
    const rejectionRate = tasks.length > 0 ? rejectedTasks / tasks.length : 0;
    if (rejectionRate > 0.15) {
      risks.push({
        type: 'quality_issues',
        severity: 'medium',
        description: 'Taux de rejet des tâches élevé',
        impact: 'Retards et reprises de travail'
      });
    }
    
    // Risque de blocage des jalons
    const milestones = projectData.milestones || [];
    const delayedMilestones = milestones.filter(m => m.status === 'delayed').length;
    if (delayedMilestones > 0) {
      risks.push({
        type: 'milestone_delays',
        severity: 'high',
        description: `${delayedMilestones} jalon(s) en retard`,
        impact: 'Impact sur la timeline globale'
      });
    }
    
    return risks;
  }

  /**
   * 💡 GÉNÉRER LES RECOMMANDATIONS
   */
  generateRecommendations(projectData, tasks, risks) {
    const recommendations = [];
    
    // Recommandations basées sur les risques
    risks.forEach(risk => {
      switch (risk.type) {
        case 'schedule_overrun':
          recommendations.push({
            type: 'action',
            priority: 'high',
            title: 'Réévaluer la planification',
            description: 'Reprioritiser les tâches critiques et ajuster les échéances',
            action: 'reschedule_tasks'
          });
          break;
          
        case 'team_overload':
          recommendations.push({
            type: 'resource',
            priority: 'medium',
            title: 'Renforcer l\'équipe',
            description: 'Ajouter des membres ou redistribuer la charge',
            action: 'add_team_members'
          });
          break;
          
        case 'quality_issues':
          recommendations.push({
            type: 'process',
            priority: 'medium',
            title: 'Améliorer le contrôle qualité',
            description: 'Mettre en place des revues plus fréquentes',
            action: 'improve_qa_process'
          });
          break;
      }
    });
    
    // Recommandations générales
    const completionRate = projectData.progress || 0;
    if (completionRate > 75) {
      recommendations.push({
        type: 'milestone',
        priority: 'low',
        title: 'Préparer la finalisation',
        description: 'Planifier les tests finaux et la livraison',
        action: 'prepare_delivery'
      });
    }
    
    return recommendations;
  }

  /**
   * 📊 ANALYTICS COMPARATIFS MULTI-PROJETS
   */
  async generateMultiProjectAnalytics(userId, projectIds = []) {
    try {
      console.log('📊 Génération analytics multi-projets pour:', userId);
      
      // Récupérer tous les projets de l'utilisateur si pas d'IDs spécifiés
      let projects = [];
      if (projectIds.length === 0) {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('team', 'array-contains', { userId: userId })
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        // Récupérer les projets spécifiés
        for (const projectId of projectIds) {
          const projectDoc = await getDoc(doc(db, 'projects', projectId));
          if (projectDoc.exists()) {
            projects.push({ id: projectId, ...projectDoc.data() });
          }
        }
      }
      
      // Générer les analytics comparatifs
      const analytics = {
        summary: {
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          totalTeamMembers: this.getTotalUniqueMembers(projects),
          averageProjectDuration: this.calculateAverageProjectDuration(projects)
        },
        
        performance: {
          projectsByCompletionRate: this.groupProjectsByCompletion(projects),
          mostProductiveProjects: this.rankProjectsByProductivity(projects),
          projectTimelines: this.compareProjectTimelines(projects)
        },
        
        teamInsights: {
          mostActiveMembers: this.findMostActiveMembers(projects),
          roleDistribution: this.getOverallRoleDistribution(projects),
          collaborationMatrix: this.buildCollaborationMatrix(projects)
        },
        
        trends: {
          monthlyProgress: this.calculateMonthlyProgressTrends(projects),
          completionTrends: this.calculateCompletionTrends(projects),
          xpTrends: this.calculateXpTrends(projects)
        }
      };
      
      console.log('✅ Analytics multi-projets générés');
      return analytics;
      
    } catch (error) {
      console.error('❌ Erreur analytics multi-projets:', error);
      throw error;
    }
  }

  /**
   * 📈 EXPORTER LES DONNÉES EN FORMAT CSV
   */
  async exportProjectDataToCSV(projectId, includeTeam = true, includeTasks = true) {
    try {
      const report = await this.generateProjectReport(projectId);
      
      let csvData = [];
      
      // Header du projet
      csvData.push(['PROJET', report.project.title]);
      csvData.push(['Statut', report.project.status]);
      csvData.push(['Progression', `${report.taskMetrics.completionRate}%`]);
      csvData.push(['Tâches totales', report.taskMetrics.total]);
      csvData.push(['Tâches terminées', report.taskMetrics.completed]);
      csvData.push([]);
      
      // Données d'équipe
      if (includeTeam) {
        csvData.push(['ÉQUIPE']);
        csvData.push(['Nom', 'Rôle', 'Tâches assignées', 'Tâches terminées', 'Taux de completion', 'XP gagné']);
        
        report.teamMetrics.memberProductivity.forEach(member => {
          csvData.push([
            member.displayName,
            member.role,
            member.tasksAssigned,
            member.tasksCompleted,
            `${member.completionRate}%`,
            member.xpEarned
          ]);
        });
        csvData.push([]);
      }
      
      // Jalons
      if (report.milestoneMetrics.total > 0) {
        csvData.push(['JALONS']);
        csvData.push(['Total', 'Terminés', 'Actifs', 'À venir', 'En retard']);
        csvData.push([
          report.milestoneMetrics.total,
          report.milestoneMetrics.completed,
          report.milestoneMetrics.active,
          report.milestoneMetrics.upcoming,
          report.milestoneMetrics.delayed
        ]);
      }
      
      // Convertir en CSV string
      const csvString = csvData.map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
      
      return {
        filename: `projet_${report.project.title}_${new Date().toISOString().slice(0,10)}.csv`,
        data: csvString,
        mimeType: 'text/csv'
      };
      
    } catch (error) {
      console.error('❌ Erreur export CSV:', error);
      throw error;
    }
  }

  /**
   * 🎯 MÉTHODES UTILITAIRES
   */
  
  getProjectVelocity(projectData, tasks) {
    const activeDays = this.getProjectActiveDays(projectData);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    return activeDays > 0 ? completedTasks / activeDays : 0;
  }
  
  getProjectActiveDays(projectData) {
    const startDate = projectData.startDate?.toDate ? projectData.startDate.toDate() : null;
    if (!startDate) return 0;
    
    const now = new Date();
    return Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  }
  
  calculateAverageCompletionTime(completedTasks) {
    if (completedTasks.length === 0) return 0;
    
    const durations = completedTasks
      .filter(task => task.createdAt && task.completedAt)
      .map(task => {
        const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
        const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
        return (completed - created) / (1000 * 60 * 60 * 24); // en jours
      });
    
    if (durations.length === 0) return 0;
    
    return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length * 10) / 10;
  }
  
  calculateTeamEfficiency(team, tasks) {
    if (team.length === 0 || tasks.length === 0) return 0;
    
    const avgTasksPerMember = tasks.length / team.length;
    const avgCompletionRate = team.reduce((sum, member) => {
      const memberTasks = tasks.filter(t => t.assignedTo === member.userId);
      const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
      return sum + (memberTasks.length > 0 ? completedTasks / memberTasks.length : 0);
    }, 0) / team.length;
    
    return Math.round(avgCompletionRate * 100);
  }
  
  calculateProductivityTrend(tasks) {
    // Simplifiée : basée sur les dernières tâches complétées
    const recentTasks = tasks
      .filter(t => t.status === 'completed' && t.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
        const dateB = b.completedAt.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
        return dateB - dateA;
      })
      .slice(0, 10);
    
    if (recentTasks.length < 5) return 'insufficient_data';
    
    const firstHalf = recentTasks.slice(0, Math.floor(recentTasks.length / 2));
    const secondHalf = recentTasks.slice(Math.floor(recentTasks.length / 2));
    
    const firstHalfAvgXp = firstHalf.reduce((sum, t) => sum + (t.xpReward || 0), 0) / firstHalf.length;
    const secondHalfAvgXp = secondHalf.reduce((sum, t) => sum + (t.xpReward || 0), 0) / secondHalf.length;
    
    if (secondHalfAvgXp > firstHalfAvgXp * 1.1) return 'improving';
    if (secondHalfAvgXp < firstHalfAvgXp * 0.9) return 'declining';
    return 'stable';
  }
  
  generateBurndownData(projectData, tasks) {
    // Données simplifiées pour burndown chart
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return {
      planned: Array.from({length: 10}, (_, i) => totalTasks - (i * totalTasks / 9)),
      actual: Array.from({length: 10}, (_, i) => Math.max(0, totalTasks - (completedTasks * (i + 1) / 10)))
    };
  }
  
  calculatePredictionConfidence(projectData, tasks) {
    // Facteurs influençant la confiance
    let confidence = 50; // Base
    
    // Plus de données = plus de confiance
    if (tasks.length >= 20) confidence += 20;
    else if (tasks.length >= 10) confidence += 10;
    
    // Progression stable = plus de confiance
    const progress = projectData.progress || 0;
    if (progress > 25) confidence += 15;
    if (progress > 50) confidence += 10;
    
    // Équipe stable = plus de confiance
    const team = projectData.team || [];
    if (team.length >= 3) confidence += 10;
    
    return Math.min(confidence, 95); // Max 95%
  }
  
  calculateSuccessProbability(projectData, tasks) {
    let probability = 70; // Base optimiste
    
    // Facteurs négatifs
    const overdueTasks = tasks.filter(t => {
      const dueDate = t.dueDate?.toDate ? t.dueDate.toDate() : null;
      return dueDate && dueDate < new Date() && t.status !== 'completed';
    }).length;
    
    if (overdueTasks > 0) probability -= overdueTasks * 5;
    
    // Facteurs positifs
    const completionRate = projectData.progress || 0;
    if (completionRate > 75) probability += 15;
    else if (completionRate > 50) probability += 10;
    
    return Math.max(Math.min(probability, 95), 10); // Entre 10% et 95%
  }
  
  estimateCompletionDate(projectData, tasks) {
    const velocity = this.getProjectVelocity(projectData, tasks);
    if (velocity === 0) return null;
    
    const remainingTasks = tasks.filter(t => t.status !== 'completed').length;
    const daysToComplete = Math.ceil(remainingTasks / velocity);
    
    const now = new Date();
    return new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
  }

  /**
   * 🧹 MÉTHODES UTILITAIRES MULTI-PROJETS
   */
  
  getTotalUniqueMembers(projects) {
    const allMembers = new Set();
    projects.forEach(project => {
      const team = project.team || [];
      team.forEach(member => allMembers.add(member.userId));
    });
    return allMembers.size;
  }
  
  calculateAverageProjectDuration(projects) {
    const completedProjects = projects.filter(p => 
      p.status === 'completed' && p.startDate && p.completedAt
    );
    
    if (completedProjects.length === 0) return 0;
    
    const durations = completedProjects.map(project => {
      const start = project.startDate.toDate ? project.startDate.toDate() : new Date(project.startDate);
      const end = project.completedAt.toDate ? project.completedAt.toDate() : new Date(project.completedAt);
      return (end - start) / (1000 * 60 * 60 * 24);
    });
    
    return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
  }
  
  groupProjectsByCompletion(projects) {
    return {
      '0-25%': projects.filter(p => (p.progress || 0) < 25).length,
      '25-50%': projects.filter(p => (p.progress || 0) >= 25 && (p.progress || 0) < 50).length,
      '50-75%': projects.filter(p => (p.progress || 0) >= 50 && (p.progress || 0) < 75).length,
      '75-100%': projects.filter(p => (p.progress || 0) >= 75).length
    };
  }
  
  rankProjectsByProductivity(projects) {
    return projects
      .map(project => ({
        id: project.id,
        title: project.title,
        progress: project.progress || 0,
        teamSize: project.teamSize || 0,
        productivity: (project.progress || 0) / Math.max(project.teamSize || 1, 1)
      }))
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 5);
  }
}

// ✅ Export de l'instance singleton
const projectAnalyticsService = new ProjectAnalyticsService();

export { projectAnalyticsService };
export default projectAnalyticsService;
