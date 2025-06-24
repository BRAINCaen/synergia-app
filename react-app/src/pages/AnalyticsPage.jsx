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

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Charger les données des stores
      await Promise.all([
        loadUserTasks(user.uid),
        loadUserProjects(user.uid)
      ]);

      // Calculer les analytics
      const analyticsData = calculateAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
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
    const days = daysMap[timeRange];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Filtrer les données selon la plage
    const filteredTasks = tasks.filter(task => {
      const taskDate = task.createdAt?.seconds ? 
        new Date(task.createdAt.seconds * 1000) : 
        new Date(task.createdAt);
      return taskDate >= startDate;
    });

    const filteredProjects = projects.filter(project => {
      const projectDate = project.createdAt?.seconds ? 
        new Date(project.createdAt.seconds * 1000) : 
        new Date(project.createdAt);
      return projectDate >= startDate;
    });

    // Calculer vue d'ensemble
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
    const totalXP = user.totalXp || 0;
    const currentLevel = user.level || 1;

    // Calculer les tendances (comparaison avec période précédente)
    const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
    const previousTasks = tasks.filter(task => {
      const taskDate = task.createdAt?.seconds ? 
        new Date(task.createdAt.seconds * 1000) : 
        new Date(task.createdAt);
      return taskDate >= previousPeriodStart && taskDate < startDate;
    });

    const tasksGrowth = previousTasks.length > 0 ? 
      ((filteredTasks.length - previousTasks.length) / previousTasks.length) * 100 : 
      100;

    // Générer données pour graphiques
    const chartData = generateChartData(filteredTasks, filteredProjects, days);

    return {
      overview: {
        totalTasks: filteredTasks.length,
        completedTasks,
        totalProjects: filteredProjects.length,
        completedProjects,
        totalXP,
        currentLevel,
        streakDays: user.streakDays || 0,
        avgCompletionTime: calculateAvgCompletionTime(filteredTasks)
      },
      trends: {
        tasksGrowth: Math.round(tasksGrowth),
        projectsGrowth: Math.round(Math.random() * 40 - 20), // Simulation
        xpGrowth: Math.round(Math.random() * 30 + 10), // Simulation
        productivityScore: Math.round(calculateProductivityScore(filteredTasks))
      },
      charts: chartData
    };
  };

  const calculateAvgCompletionTime = (tasks) => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt && t.createdAt);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const created = task.createdAt?.seconds ? 
        new Date(task.createdAt.seconds * 1000) : 
        new Date(task.createdAt);
      const completed = task.completedAt?.seconds ? 
        new Date(task.completedAt.seconds * 1000) : 
        new Date(task.completedAt);
      return sum + (completed - created);
    }, 0);

    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // en jours
  };

  const calculateProductivityScore = (tasks) => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    if (total === 0) return 0;

    const completionRate = (completed / total) * 100;
    const onTimeBonus = 10; // Bonus pour respect délais
    const qualityBonus = 5; // Bonus qualité

    return Math.min(100, completionRate + onTimeBonus + qualityBonus);
  };

  const generateChartData = (tasks, projects, days) => {
    const now = new Date();
    
    // Activité quotidienne (7 derniers jours)
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayTasks = tasks.filter(task => {
        const taskDate = task.createdAt?.seconds ? 
          new Date(task.createdAt.seconds * 1000) : 
          new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      const created = dayTasks.length;

      return {
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        created,
        completed,
        productivity: created > 0 ? Math.round((completed / created) * 100) : 0
      };
    });

    // Distribution par priorité
    const tasksByPriority = [
      { name: 'Urgente', value: tasks.filter(t => t.priority === 'urgent').length, fill: '#ef4444' },
      { name: 'Haute', value: tasks.filter(t => t.priority === 'high').length, fill: '#f97316' },
      { name: 'Moyenne', value: tasks.filter(t => t.priority === 'medium').length, fill: '#eab308' },
      { name: 'Basse', value: tasks.filter(t => t.priority === 'low').length, fill: '#22c55e' }
    ];

    // Progression des projets
    const projectProgress = projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const total = projectTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        name: project.title.length > 15 ? 
          project.title.substring(0, 15) + '...' : 
          project.title,
        progress,
        total,
        completed
      };
    }).slice(0, 6); // Limiter à 6 projets

    // Distribution du temps (simulation)
    const timeDistribution = [
      { name: 'Développement', hours: Math.round(Math.random() * 30 + 20), fill: '#3b82f6' },
      { name: 'Meetings', hours: Math.round(Math.random() * 15 + 10), fill: '#8b5cf6' },
      { name: 'Documentation', hours: Math.round(Math.random() * 10 + 5), fill: '#06b6d4' },
      { name: 'Tests', hours: Math.round(Math.random() * 8 + 5), fill: '#84cc16' },
      { name: 'Autres', hours: Math.round(Math.random() * 5 + 2), fill: '#f59e0b' }
    ];

    // Productivité hebdomadaire
    const weeklyProductivity = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => {
        const taskDate = task.createdAt?.seconds ? 
          new Date(task.createdAt.seconds * 1000) : 
          new Date(task.createdAt);
        return taskDate >= weekStart && taskDate < weekEnd;
      });

      const completed = weekTasks.filter(t => t.status === 'completed').length;
      const created = weekTasks.length;

      return {
        week: `S${i + 1}`,
        created,
        completed,
        efficiency: created > 0 ? Math.round((completed / created) * 100) : 0
      };
    });

    // Tendances de completion (30 derniers jours)
    const completionTrends = Array.from({ length: Math.min(30, days) }, (_, i) => {
      const date = new Date(now.getTime() - (Math.min(30, days) - 1 - i) * 24 * 60 * 60 * 1000);
      const dayTasks = tasks.filter(task => {
        const completedDate = task.completedAt?.seconds ? 
          new Date(task.completedAt.seconds * 1000) : 
          task.completedAt ? new Date(task.completedAt) : null;
        return completedDate && completedDate.toDateString() === date.toDateString();
      });

      return {
        date: date.getDate(),
        completed: dayTasks.length,
        target: Math.round(Math.random() * 3 + 2) // Objectif simulé
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
            
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.charts.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Bar dataKey="created" name="Créées" fill="#3b82f6" />
                <Bar dataKey="completed" name="Terminées" fill="#10b981" />
                <Line 
                  type="monotone" 
                  dataKey="productivity" 
                  name="Productivité %" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
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
                  data={analytics.charts.tasksByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {analytics.charts.tasksByPriority.map((entry, index) => (
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
              <BarChart data={analytics.charts.projectProgress} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [`${value}%`, 'Progression']}
                />
                <Bar dataKey="progress" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Aucun projet créé</p>
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
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.charts.weeklyProductivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  name="Efficacité %" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution du temps */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Distribution du temps
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={analytics.charts.timeDistribution}>
                <RadialBar 
                  dataKey="hours" 
                  cornerRadius={10} 
                  fill={analytics.charts.timeDistribution[0]?.fill || '#3b82f6'} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [`${value}h`, 'Temps']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tendances de completion */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Tendances de completion (30 derniers jours)
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.charts.completionTrends}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="completed" 
                name="Complétées"
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                name="Objectif"
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorTarget)" 
              />
            </AreaChart>
          </ResponsiveContainer>
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
