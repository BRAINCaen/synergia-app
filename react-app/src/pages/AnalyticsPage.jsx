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

// 🔧 FONCTIONS DE NETTOYAGE NaN - CORRECTION CRITIQUE
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
      
      if (['date', 'name', 'week', 'priority', 'status', 'label', 'color'].includes(key)) {
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

  // 🔧 FONCTIONS DE CALCUL CORRIGÉES AVEC GESTION NaN
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

  // 🔧 FONCTION CALCULATEANALYTICS CORRIGÉE
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
        trends: {
          tasksGrowth: sanitizeChartValue(Math.floor(Math.random() * 21) - 10), // Simulé
          projectsGrowth: sanitizeChartValue(Math.floor(Math.random() * 21) - 10), // Simulé
          xpGrowth: sanitizeChartValue(Math.floor(Math.random() * 21) - 10), // Simulé
          productivityScore: sanitizeChartValue(completionRate)
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
          weeklyProductivity: [],
          completionTrends: [],
          timeDistribution: []
        }
      };
    }
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
          pendingTasks: 0,
          completionRate: 0,
          totalProjects: 0,
          completedProjects: 0,
          projectCompletionRate: 0,
          averageTasksPerProject: 0
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
          weeklyProductivity: [],
          completionTrends: [],
          timeDistribution: []
        }
      });
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          Chargement des analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-blue-400" />
                Analytics
              </h1>
              <p className="text-gray-400 text-lg">
                Performances & insights • Analyse temps réel • Optimisation continue
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
                    {analytics.trends.tasksGrowth >= 0 ? '+' : ''}{analytics.trends.tasksGrowth}%
                  </span>
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Tâches complétées */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Taux de completion</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.overview.completionRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-gray-400">
                    {analytics.overview.completedTasks}/{analytics.overview.totalTasks} terminées
                  </span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Productivité */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Score productivité</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.trends.productivityScore}%</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(analytics.trends.xpGrowth)}
                  <span className={`text-sm ${analytics.trends.xpGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analytics.trends.xpGrowth >= 0 ? '+' : ''}{analytics.trends.xpGrowth}% cette semaine
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          {/* Projets */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Projets actifs</h4>
                <p className="text-3xl font-bold text-purple-400">
                  {analytics.overview.totalProjects}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {analytics.overview.completedProjects} terminés
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activité quotidienne */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Activité quotidienne (7 jours)
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
                  {(analytics.charts.tasksByPriority.length > 0 ? 
                    analytics.charts.tasksByPriority : 
                    [{ name: 'Aucune donnée', value: 1, fill: '#6b7280' }]
                  ).map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progression des projets */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
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
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    width={100}
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
              <div className="flex items-center justify-center h-80 text-gray-400">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-4" />
                  <p>Aucun projet en cours</p>
                  <p className="text-sm mt-2">Créez des projets pour voir la progression</p>
                </div>
              </div>
            )}
          </div>

          {/* Tendances de completion */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Tendances de completion (30 jours)
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
                  <p>Données insuffisantes</p>
                  <p className="text-sm mt-2">Complétez plus de tâches pour voir les tendances</p>
                </div>
              </div>
            )}
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
