// Fonction utilitaire pour nettoyer les données des graphiques - À ajouter en haut du fichier AnalyticsPage.jsx

// FONCTION DE NETTOYAGE DES DONNÉES - Ajouter cette fonction après les imports
const sanitizeChartValue = (value) => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return 0;
  }
  return Number(value) || 0;
};

const sanitizeChartData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    if (!item || typeof item !== 'object') return null;
    
    const sanitized = {};
    Object.entries(item).forEach(([key, value]) => {
      if (['date', 'name', 'week', 'priority', 'status', 'label', 'color'].includes(key)) {
        sanitized[key] = value; // Garder les strings/labels tels quels
      } else if (typeof value === 'number' || (typeof value === 'string' && /^\d*\.?\d+$/.test(value))) {
        sanitized[key] = sanitizeChartValue(value);
      } else {
        sanitized[key] = value; // Garder autres types (strings, etc.)
      }
    });
    
    return sanitized;
  }).filter(Boolean);
};

// MODIFICATION DE LA FONCTION calculateAnalytics - Remplacer la fonction existante
const calculateAnalytics = () => {
  try {
    console.log('📊 Calcul analytics avec nettoyage NaN...');
    
    // Données de base avec valeurs par défaut sécurisées
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(task => task.status === 'completed')?.length || 0;
    const totalProjects = projects?.length || 0;
    const completedProjects = projects?.filter(project => project.status === 'completed')?.length || 0;
    
    // Calculs sécurisés avec vérification NaN
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    // Données de graphiques avec nettoyage
    const dailyActivity = tasks?.length > 0 ? 
      sanitizeChartData(calculateDailyActivity(tasks)) : [];
    
    const tasksByPriority = tasks?.length > 0 ? 
      sanitizeChartData(calculateTasksByPriority(tasks)) : [];
    
    const projectProgress = projects?.length > 0 ? 
      sanitizeChartData(calculateProjectProgress(projects, tasks)) : [];
    
    const weeklyProductivity = tasks?.length > 0 ? 
      sanitizeChartData(calculateWeeklyProductivity(tasks)) : [];
    
    const completionTrends = tasks?.length > 0 ? 
      sanitizeChartData(calculateCompletionTrends(tasks)) : [];
    
    const timeDistribution = tasks?.length > 0 ? 
      sanitizeChartData(calculateTimeDistribution(tasks)) : [];

    const result = {
      overview: {
        totalTasks: sanitizeChartValue(totalTasks),
        completedTasks: sanitizeChartValue(completedTasks),
        pendingTasks: sanitizeChartValue(totalTasks - completedTasks),
        completionRate: sanitizeChartValue(completionRate),
        totalProjects: sanitizeChartValue(totalProjects),
        completedProjects: sanitizeChartValue(completedProjects),
        projectCompletionRate: sanitizeChartValue(projectCompletionRate),
        averageTasksPerProject: totalProjects > 0 ? sanitizeChartValue(totalTasks / totalProjects) : 0
      },
      charts: {
        dailyActivity,
        tasksByPriority,
        projectProgress,
        weeklyProductivity,
        completionTrends,
        timeDistribution
      }
    };

    console.log('✅ Analytics calculés et nettoyés:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Erreur calcul analytics:', error);
    
    // Retourner des données par défaut en cas d'erreur
    return {
      overview: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        totalProjects: 0,
        completedProjects: 0,
        projectCompletionRate: 0,
        averageTasksPerProject: 0
      },
      charts: {
        dailyActivity: [],
        tasksByPriority: [],
        projectProgress: [],
        weeklyProductivity: [],
        completionTrends: [],
        timeDistribution: []
      }
    };
  }
};

// MODIFICATION DE calculateDailyActivity - Remplacer la fonction existante
const calculateDailyActivity = (tasks) => {
  try {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        const taskDate = task.createdAt?.toDate ? 
          task.createdAt.toDate().toISOString().split('T')[0] :
          task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : null;
        return taskDate === dateStr;
      });
      
      const completedToday = tasks.filter(task => {
        const completedDate = task.completedAt?.toDate ? 
          task.completedAt.toDate().toISOString().split('T')[0] :
          task.completedAt ? new Date(task.completedAt).toISOString().split('T')[0] : null;
        return completedDate === dateStr;
      });
      
      last7Days.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        created: sanitizeChartValue(dayTasks.length),
        completed: sanitizeChartValue(completedToday.length)
      });
    }
    
    return last7Days;
  } catch (error) {
    console.error('Erreur calculateDailyActivity:', error);
    return [];
  }
};

// MODIFICATION DE calculateTasksByPriority - Remplacer la fonction existante
const calculateTasksByPriority = (tasks) => {
  try {
    const priorities = {
      'high': { name: 'Haute', value: 0, fill: '#ef4444' },
      'medium': { name: 'Moyenne', value: 0, fill: '#f59e0b' },
      'low': { name: 'Basse', value: 0, fill: '#10b981' }
    };
    
    tasks.forEach(task => {
      const priority = task.priority || 'low';
      if (priorities[priority]) {
        priorities[priority].value += 1;
      }
    });
    
    return Object.values(priorities).map(p => ({
      ...p,
      value: sanitizeChartValue(p.value)
    })).filter(p => p.value > 0);
  } catch (error) {
    console.error('Erreur calculateTasksByPriority:', error);
    return [];
  }
};

// MODIFICATION DE calculateProjectProgress - Remplacer la fonction existante
const calculateProjectProgress = (projects, tasks) => {
  try {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'completed');
      const progress = projectTasks.length > 0 ? 
        sanitizeChartValue((completedTasks.length / projectTasks.length) * 100) : 0;
      
      return {
        name: project.name?.substring(0, 15) + (project.name?.length > 15 ? '...' : '') || 'Projet',
        progress: progress,
        total: sanitizeChartValue(projectTasks.length),
        completed: sanitizeChartValue(completedTasks.length)
      };
    });
  } catch (error) {
    console.error('Erreur calculateProjectProgress:', error);
    return [];
  }
};

// MODIFICATION DE calculateWeeklyProductivity - Remplacer la fonction existante
const calculateWeeklyProductivity = (tasks) => {
  try {
    const weeks = {};
    
    tasks.forEach(task => {
      const completedDate = task.completedAt?.toDate ? 
        task.completedAt.toDate() : 
        task.completedAt ? new Date(task.completedAt) : null;
      
      if (completedDate && task.status === 'completed') {
        const weekStart = new Date(completedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = {
            week: weekStart.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
            completed: 0
          };
        }
        weeks[weekKey].completed += 1;
      }
    });
    
    return Object.values(weeks).map(w => ({
      ...w,
      completed: sanitizeChartValue(w.completed)
    }));
  } catch (error) {
    console.error('Erreur calculateWeeklyProductivity:', error);
    return [];
  }
};

// MODIFICATION DE calculateCompletionTrends - Remplacer la fonction existante
const calculateCompletionTrends = (tasks) => {
  try {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const completedToday = tasks.filter(task => {
        const completedDate = task.completedAt?.toDate ? 
          task.completedAt.toDate().toISOString().split('T')[0] :
          task.completedAt ? new Date(task.completedAt).toISOString().split('T')[0] : null;
        return completedDate === dateStr && task.status === 'completed';
      });
      
      last30Days.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        completed: sanitizeChartValue(completedToday.length),
        target: sanitizeChartValue(3) // Objectif quotidien
      });
    }
    
    return last30Days;
  } catch (error) {
    console.error('Erreur calculateCompletionTrends:', error);
    return [];
  }
};

// MODIFICATION DE calculateTimeDistribution - Remplacer la fonction existante
const calculateTimeDistribution = (tasks) => {
  try {
    const distribution = {
      'morning': { name: 'Matin', value: 0, fill: '#3b82f6' },
      'afternoon': { name: 'Après-midi', value: 0, fill: '#f59e0b' },
      'evening': { name: 'Soir', value: 0, fill: '#8b5cf6' }
    };
    
    tasks.forEach(task => {
      const createdDate = task.createdAt?.toDate ? 
        task.createdAt.toDate() : 
        task.createdAt ? new Date(task.createdAt) : null;
      
      if (createdDate) {
        const hour = createdDate.getHours();
        if (hour < 12) {
          distribution.morning.value += 1;
        } else if (hour < 18) {
          distribution.afternoon.value += 1;
        } else {
          distribution.evening.value += 1;
        }
      }
    });
    
    return Object.values(distribution).map(d => ({
      ...d,
      value: sanitizeChartValue(d.value)
    })).filter(d => d.value > 0);
  } catch (error) {
    console.error('Erreur calculateTimeDistribution:', error);
    return [];
  }
};
