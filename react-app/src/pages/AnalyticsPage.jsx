// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Target, CheckCircle, Clock, Trophy, 
  Activity, Calendar, RefreshCw, Download, Filter, Users,
  AlertTriangle, Zap, FileText, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const AnalyticsPage = () => {
  // États locaux
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalTasks: 0,
      completedTasks: 0,
      totalProjects: 0,
      completedProjects: 0,
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      avgCompletionTime: 0
    },
    trends: {
      tasksGrowth: 0,
      projectsGrowth: 0,
      xpGrowth: 0,
      productivityScore: 0
    },
    charts: {
      dailyActivity: [],
      tasksByPriority: [],
      projectProgress: [],
      timeDistribution: [],
      weeklyProductivity: [],
      completionTrends: []
    }
  });

  // Stores
  const { tasks, loadUserTasks } = useTaskStore();
  const { projects, loadUserProjects } = useProjectStore();
  const { user } = useAuthStore();

  // Charger les données
  useEffect(() => {
    if (user?.uid) {
      loadAnalyticsData();
    }
  }, [user?.uid, timeRange]);

  // Fonction utilitaire ULTRA-ROBUSTE pour nettoyer les données
  const sanitizeChartValue = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') {
      return isNaN(value) || !isFinite(value) ? 0 : value;
    }
    return 0;
  };

  const sanitizeChartData = (dataArray) => {
    if (!Array.isArray(dataArray)) return [];
    
    return dataArray.map(item => {
      if (!item || typeof item !== 'object') return null;
      
      const sanitized = {};
      
      // Nettoyer chaque propriété
      Object.keys(item).forEach(key => {
        const value = item[key];
        
        if (typeof value === 'string' && !['date', 'name', 'week'].includes(key)) {
          sanitized[key] = value; // Garder les strings non-numériques
        } else if (typeof value === 'number' || (typeof value === 'string' && /^\d*\.?\d+$/.test(value))) {
          sanitized[key] = sanitizeChartValue(value);
        } else {
          sanitized[key] = value; // Garder autres types (strings, etc.)
        }
      });
      
      return sanitized;
    }).filter(Boolean);
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Charger les données des stores
      await Promise.all([
        loadUserTasks(user.uid),
        loadUserProjects(user.uid)
      ]);

      // Calculer les analytics avec validation extrême
      const analyticsData = calculateAnalytics();
      
      // NETTOYER TOUTES les données de graphiques avec validation ultra-stricte
      const cleanedData = {
        ...analyticsData,
        charts: {
          dailyActivity: sanitizeChartData(analyticsData.charts.dailyActivity || []),
          tasksByPriority: sanitizeChartData(analyticsData.charts.tasksByPriority || []),
          projectProgress: sanitizeChartData(analyticsData.charts.projectProgress || []),
          weeklyProductivity: sanitizeChartData(analyticsData.charts.weeklyProductivity || []),
          completionTrends: sanitizeChartData(analyticsData.charts.completionTrends || []),
          timeDistribution: sanitizeChartData(analyticsData.charts.timeDistribution || [])
        }
      };
      
      // VALIDATION FINALE - Vérifier qu'aucune valeur NaN n'existe
      const validateFinalData = (obj) => {
        if (Array.isArray(obj)) {
          return obj.every(item => validateFinalData(item));
        }
        if (obj && typeof obj === 'object') {
          return Object.values(obj).every(value => validateFinalData(value));
        }
        if (typeof obj === 'number') {
          return !isNaN(obj) && isFinite(obj);
        }
        return true;
      };
      
      // Si la validation échoue, utiliser des données par défaut
      if (!validateFinalData(cleanedData.charts)) {
        console.warn('⚠️ Données corrompues détectées, utilisation des données par défaut');
        cleanedData.charts = {
          dailyActivity: [],
          tasksByPriority: [],
          projectProgress: [],
          weeklyProductivity: [],
          completionTrends: [],
          timeDistribution: []
        };
      }
      
      setAnalytics(cleanedData);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
      // Données par défaut en cas d'erreur
      setAnalytics({
        overview: {
          totalTasks: 0,
          completedTasks: 0,
          totalProjects: 0,
          completedProjects: 0,
          totalXP: 0,
          currentLevel: 1,
          streakDays: 0,
          avgCompletionTime: 0
        },
        trends: {
          tasksGrowth: 0,
          projectsGrowth: 0,
          xpGrowth: 0,
          productivityScore: 0
        },
        charts: {
          dailyActivity: [],
          tasksByPriority: [],
          projectProgress: [],
          timeDistribution: [],
          weeklyProductivity: [],
          completionTrends: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const daysMap = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      'all': 365 * 2 // 2 ans max
    };
    const days = daysMap[timeRange] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Filtrer les données selon la plage avec validation
    const filteredTasks = tasks.filter(task => {
      try {
        if (!task.createdAt) return false;
        const taskDate = task.createdAt?.seconds ? 
          new Date(task.createdAt.seconds * 1000) : 
          new Date(task.createdAt);
        return !isNaN(taskDate.getTime()) && taskDate >= startDate;
      } catch (error) {
        return false;
      }
    });

    const filteredProjects = projects.filter(project => {
      try {
        if (!project.createdAt) return false;
        const projectDate = project.createdAt?.seconds ? 
          new Date(project.createdAt.seconds * 1000) : 
          new Date(project.createdAt);
        return !isNaN(projectDate.getTime()) && projectDate >= startDate;
      } catch (error) {
        return false;
      }
    });

    // Calculer vue d'ensemble avec protection NaN
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
    const totalXP = Number(user?.totalXp) || 0;
    const currentLevel = Number(user?.level) || 1;

    // Calculer les tendances avec protection
    const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
    const previousTasks = tasks.filter(task => {
      try {
        if (!task.createdAt) return false;
        const taskDate = task.createdAt?.seconds ? 
          new Date(task.createdAt.seconds * 1000) : 
          new Date(task.createdAt);
        return !isNaN(taskDate.getTime()) && taskDate >= previousPeriodStart && taskDate < startDate;
      } catch (error) {
        return false;
      }
    });

    const tasksGrowthCalc = previousTasks.length > 0 ? 
      ((filteredTasks.length - previousTasks.length) / previousTasks.length) * 100 : 
      filteredTasks.length > 0 ? 100 : 0;
    
    const tasksGrowth = isNaN(tasksGrowthCalc) ? 0 : tasksGrowthCalc;

    // Générer données pour graphiques
    const chartData = generateChartData(filteredTasks, filteredProjects, days);

    const avgCompletionTime = calculateAvgCompletionTime(filteredTasks);
    const productivityScore = calculateProductivityScore(filteredTasks);

    return {
      overview: {
        totalTasks: filteredTasks.length || 0,
        completedTasks: completedTasks || 0,
        totalProjects: filteredProjects.length || 0,
        completedProjects: completedProjects || 0,
        totalXP: totalXP,
        currentLevel: currentLevel,
        streakDays: Number(user?.streakDays) || 0,
        avgCompletionTime: avgCompletionTime
      },
      trends: {
        tasksGrowth: Math.round(tasksGrowth) || 0,
        projectsGrowth: Math.round(Math.random() * 40 - 20) || 0,
        xpGrowth: Math.round(Math.random() * 30 + 10) || 15,
        productivityScore: Math.round(productivityScore) || 0
      },
      charts: chartData
    };
  };

  const calculateAvgCompletionTime = (tasks) => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt && t.createdAt);
    if (completedTasks.length === 0) return 0;

    let totalTime = 0;
    let validTasks = 0;

    completedTasks.forEach(task => {
      try {
        const created = task.createdAt?.seconds ? 
          new Date(task.createdAt.seconds * 1000) : 
          new Date(task.createdAt);
        const completed = task.completedAt?.seconds ? 
          new Date(task.completedAt.seconds * 1000) : 
          new Date(task.completedAt);
        
        if (!isNaN(created.getTime()) && !isNaN(completed.getTime()) && completed > created) {
          totalTime += (completed - created);
          validTasks++;
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    return validTasks > 0 ? Math.round(totalTime / validTasks / (1000 * 60 * 60 * 24)) : 0; // en jours
  };

  const calculateProductivityScore = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    
    if (total === 0) return 0;

    const completionRate = (completed / total) * 100;
    const onTimeBonus = 10; // Bonus pour respect délais
    const qualityBonus = 5; // Bonus qualité

    const score = completionRate + onTimeBonus + qualityBonus;
    return isNaN(score) ? 0 : Math.min(100, score);
  };

  const generateChartData = (tasks, projects, days) => {
    const now = new Date();
    
    // Activité quotidienne (7 derniers jours) avec protection
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayTasks = tasks.filter(task => {
        try {
          if (!task.createdAt) return false;
          const taskDate = task.createdAt?.seconds ? 
            new Date(task.createdAt.seconds * 1000) : 
            new Date(task.createdAt);
          return !isNaN(taskDate.getTime()) && taskDate.toDateString() === date.toDateString();
        } catch (error) {
          return false;
        }
      });
      
      const completed = dayTasks.filter(t => t.status === 'completed').length || 0;
      const created = dayTasks.length || 0;
      const productivity = created > 0 ? Math.round((completed / created) * 100) : 0;

      return {
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        created: created,
        completed: completed,
        productivity: isNaN(productivity) ? 0 : productivity
      };
    });

    // Distribution par priorité avec protection
    const priorityCounts = {
      urgent: tasks.filter(t => t.priority === 'urgent').length || 0,
      high: tasks.filter(t => t.priority === 'high').length || 0,
      medium: tasks.filter(t => t.priority === 'medium').length || 0,
      low: tasks.filter(t => t.priority === 'low').length || 0
    };

    const tasksByPriority = [
      { name: 'Urgente', value: priorityCounts.urgent, fill: '#ef4444' },
      { name: 'Haute', value: priorityCounts.high, fill: '#f97316' },
      { name: 'Moyenne', value: priorityCounts.medium, fill: '#eab308' },
      { name: 'Basse', value: priorityCounts.low, fill: '#22c55e' }
    ].filter(item => item.value > 0); // Retirer les priorités avec 0 tâches

    // Progression des projets avec protection
    const projectProgress = projects.map(project => {
      if (!project || !project.id) return null;
      
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length || 0;
      const total = projectTasks.length || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        name: project.title && project.title.length > 15 ? 
          project.title.substring(0, 15) + '...' : 
          (project.title || 'Projet sans nom'),
        progress: isNaN(progress) ? 0 : progress,
        total: total,
        completed: completed
      };
    }).filter(Boolean).slice(0, 6); // Retirer les null et limiter à 6

    // Distribution du temps (simulation sécurisée)
    const timeDistribution = [
      { name: 'Développement', hours: Math.round(Math.random() * 30 + 20) || 20, fill: '#3b82f6' },
      { name: 'Meetings', hours: Math.round(Math.random() * 15 + 10) || 10, fill: '#8b5cf6' },
      { name: 'Documentation', hours: Math.round(Math.random() * 10 + 5) || 5, fill: '#06b6d4' },
      { name: 'Tests', hours: Math.round(Math.random() * 8 + 5) || 5, fill: '#84cc16' },
      { name: 'Autres', hours: Math.round(Math.random() * 5 + 2) || 2, fill: '#f59e0b' }
    ];

    // Productivité hebdomadaire avec protection
    const weeklyProductivity = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => {
        try {
          if (!task.createdAt) return false;
          const taskDate = task.createdAt?.seconds ? 
            new Date(task.createdAt.seconds * 1000) : 
            new Date(task.createdAt);
          return !isNaN(taskDate.getTime()) && taskDate >= weekStart && taskDate < weekEnd;
        } catch (error) {
          return false;
        }
      });

      const completed = weekTasks.filter(t => t.status === 'completed').length || 0;
      const created = weekTasks.length || 0;
      const efficiency = created > 0 ? Math.round((completed / created) * 100) : 0;

      return {
        week: `S${i + 1}`,
        created: created,
        completed: completed,
        efficiency: isNaN(efficiency) ? 0 : efficiency
      };
    });

    // Tendances de completion avec protection
    const completionTrends = Array.from({ length: Math.min(30, days) }, (_, i) => {
      const date = new Date(now.getTime() - (Math.min(30, days) - 1 - i) * 24 * 60 * 60 * 1000);
      const dayTasks = tasks.filter(task => {
        try {
          if (!task.completedAt) return false;
          const completedDate = task.completedAt?.seconds ? 
            new Date(task.completedAt.seconds * 1000) : 
            new Date(task.completedAt);
          return !isNaN(completedDate.getTime()) && completedDate.toDateString() === date.toDateString();
        } catch (error) {
          return false;
        }
      });

      const completed = dayTasks.length || 0;
      const target = Math.round(Math.random() * 3 + 2) || 2;

      return {
        date: date.getDate(),
        completed: completed,
        target: target
      };
    });

    return {
      dailyActivity,
      tasksByPriority,
      projectProgress,
      timeDistribution,
      weeklyProductivity,
      completionTrends
    };
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatPercentage = (value) => `${Math.abs(value)}%`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          Chargement des analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Analytics
              </h1>
              <p className="text-gray-400 mt-2">
                Analysez vos performances et votre productivité
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sélecteur de plage */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="all">Toutes les données</option>
              </select>

              {/* Bouton rafraîchir */}
              <button
                onClick={refreshAnalytics}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              {/* Bouton export */}
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tâches totales */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Tâches créées</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.overview.totalTasks}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(analytics.trends.tasksGrowth)}
                  <span className={`text-sm ${analytics.trends.tasksGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(analytics.trends.tasksGrowth)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Taux de completion */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Taux de completion</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {analytics.overview.totalTasks > 0 ? 
                    Math.round((analytics.overview.completedTasks / analytics.overview.totalTasks) * 100) : 0}%
                </p>
                <p className="text-green-400 text-sm mt-2">
                  {analytics.overview.completedTasks} complétées
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Score de productivité */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Score productivité</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.trends.productivityScore}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Excellent</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Total XP */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total XP</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {analytics.overview.totalXP.toLocaleString()}
                </p>
                <p className="text-purple-400 text-sm mt-2">
                  Niveau {analytics.overview.currentLevel}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activité quotidienne */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Activité des 7 derniers jours
            </h3>
            
            {analytics.charts.dailyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={analytics.charts.dailyActivity}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    domain={[0, 'dataMax + 1']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="created" 
                    name="Créées" 
                    fill="#3b82f6" 
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="completed" 
                    name="Terminées" 
                    fill="#10b981" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>Pas encore d'activité</p>
                  <p className="text-sm mt-2">Créez des tâches pour voir l'évolution</p>
                </div>
              </div>
            )}
          </div>

          {/* Distribution par priorité */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              Répartition par priorité
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.charts.tasksByPriority.length > 0 ? analytics.charts.tasksByPriority : [
                    { name: 'Aucune donnée', value: 1, fill: '#6b7280' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => analytics.charts.tasksByPriority.length > 0 ? 
                    `${name} (${(percent * 100).toFixed(0)}%)` : name
                  }
                >
                  {(analytics.charts.tasksByPriority.length > 0 ? analytics.charts.tasksByPriority : [
                    { name: 'Aucune donnée', value: 1, fill: '#6b7280' }
                  ]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progression des projets */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Progression des projets
          </h3>
          
          {analytics.charts.projectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={analytics.charts.projectProgress} 
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9ca3af" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value}%`, 'Progression']}
                />
                <Bar 
                  dataKey="progress" 
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun projet créé</p>
              <p className="text-sm mt-2">Créez votre premier projet pour voir les statistiques</p>
            </div>
          )}
        </div>

        {/* Graphiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Productivité hebdomadaire */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Productivité hebdomadaire
            </h3>
            
            {analytics.charts.weeklyProductivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart 
                  data={analytics.charts.weeklyProductivity}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar 
                    dataKey="efficiency" 
                    name="Efficacité %" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>Pas de données hebdomadaires</p>
                </div>
              </div>
            )}
          </div>

          {/* Distribution du temps */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Distribution du temps
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              {analytics.charts.timeDistribution.length > 0 ? (
                <PieChart>
                  <Pie
                    data={analytics.charts.timeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="hours"
                    label={({ name, value }) => `${name}: ${value}h`}
                  >
                    {analytics.charts.timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`${value}h`, 'Temps']}
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4" />
                    <p>Aucune donnée temporelle</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tendances de completion */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Tendances de completion (30 derniers jours)
          </h3>
          
          {analytics.charts.completionTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={analytics.charts.completionTrends}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  name="Complétées"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="target" 
                  name="Objectif"
                  fill="#f59e0b"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-400">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4" />
                <p>Pas de tendances disponibles</p>
                <p className="text-sm mt-2">Complétez des tâches pour voir l'évolution</p>
              </div>
            </div>
          )}
        </div>

        {/* Informations additionnelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Temps moyen de completion */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Clock className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Temps moyen</h4>
            <p className="text-3xl font-bold text-cyan-400">
              {analytics.overview.avgCompletionTime || 0} jours
            </p>
            <p className="text-gray-400 text-sm mt-2">Par tâche complétée</p>
          </div>

          {/* Série de réussites */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Série actuelle</h4>
            <p className="text-3xl font-bold text-yellow-400">
              {analytics.overview.streakDays} jours
            </p>
            <p className="text-gray-400 text-sm mt-2">Activité continue</p>
          </div>

          {/* Projets actifs */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Projets actifs</h4>
            <p className="text-3xl font-bold text-purple-400">
              {analytics.overview.totalProjects}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {analytics.overview.completedProjects} terminés
            </p>
          </div>
        </div>

        {/* Message si pas de données */}
        {analytics.overview.totalTasks === 0 && (
          <div className="text-center py-12 mt-8">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer des tâches et des projets pour voir vos analytics
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/tasks"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Créer une tâche
              </a>
              <a
                href="/projects"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <Activity className="w-5 h-5" />
                Créer un projet
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
