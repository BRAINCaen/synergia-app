// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// Page Analytics AUTONOME - Version finale avec imports corrigés
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users,
  Calendar,
  Star,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Zap,
  Trophy,
  Activity,
  CheckCircle2,
  AlertCircle,
  Gauge, // ✅ CORRECTION : Progress → Gauge
  PieChart,
  LineChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Rocket,
  Brain
} from 'lucide-react';

// IMPORTS BASIQUES UNIQUEMENT
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  
  // États locaux simplifiés
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, tasks, projects, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchProjects()]);
      
      // Calcul des analytics
      const analytics = calculateAnalytics();
      setAnalytics(analytics);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const getTimeRangeStart = () => {
      switch (timeRange) {
        case 'week':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'year':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    };

    const rangeStart = getTimeRangeStart();
    
    // Filtrer les tâches et projets dans la période
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.updatedAt);
      return taskDate >= rangeStart;
    });

    const filteredProjects = projects.filter(project => {
      const projectDate = new Date(project.createdAt || project.updatedAt);
      return projectDate >= rangeStart;
    });

    // Calculer les métriques
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const totalTasks = filteredTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const activeProjects = filteredProjects.filter(project => project.status === 'active').length;
    const completedProjects = filteredProjects.filter(project => project.status === 'completed').length;
    const totalProjects = filteredProjects.length;

    // Calculer XP total
    const totalXP = filteredTasks.reduce((sum, task) => sum + (task.xp || 0), 0);

    // Calculer tendances
    const midPoint = new Date(rangeStart.getTime() + (now.getTime() - rangeStart.getTime()) / 2);
    const firstHalfTasks = filteredTasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.updatedAt);
      return taskDate < midPoint;
    });
    const secondHalfTasks = filteredTasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.updatedAt);
      return taskDate >= midPoint;
    });

    const firstHalfCompleted = firstHalfTasks.filter(task => task.status === 'completed').length;
    const secondHalfCompleted = secondHalfTasks.filter(task => task.status === 'completed').length;
    const trend = secondHalfCompleted > firstHalfCompleted ? 'up' : 
                  secondHalfCompleted < firstHalfCompleted ? 'down' : 'stable';

    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalProjects,
      activeProjects,
      completedProjects,
      totalXP,
      trend,
      productivity: completionRate > 70 ? 'high' : completionRate > 40 ? 'medium' : 'low'
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const getMetricColor = (value, type) => {
    switch (type) {
      case 'completion':
        return value > 70 ? 'text-green-600' : value > 40 ? 'text-yellow-600' : 'text-red-600';
      case 'productivity':
        return value === 'high' ? 'text-green-600' : value === 'medium' ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-gray-400">Analyse des performances et statistiques</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filtre période */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">Cette année</option>
            </select>
            
            {/* Bouton actualiser */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
            { id: 'tasks', label: 'Tâches', icon: CheckCircle2 },
            { id: 'projects', label: 'Projets', icon: Target },
            { id: 'performance', label: 'Performance', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        {analytics && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Tâches */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  </div>
                  {getTrendIcon(analytics.trend)}
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Tâches terminées</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.completedTasks}/{analytics.totalTasks}
                  </p>
                  <p className={`text-sm ${getMetricColor(analytics.completionRate, 'completion')}`}>
                    {analytics.completionRate.toFixed(1)}% de réussite
                  </p>
                </div>
              </div>

              {/* Projets */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Projets actifs</p>
                  <p className="text-2xl font-bold text-white">{analytics.activeProjects}</p>
                  <p className="text-sm text-gray-400">
                    {analytics.completedProjects} terminés
                  </p>
                </div>
              </div>

              {/* XP */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">XP gagné</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalXP}</p>
                  <p className="text-sm text-yellow-400">
                    Période : {timeRange === 'week' ? '7 jours' : timeRange === 'month' ? '30 jours' : 'année'}
                  </p>
                </div>
              </div>

              {/* Productivité */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-green-400" />
                  </div>
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Productivité</p>
                  <p className={`text-2xl font-bold capitalize ${getMetricColor(analytics.productivity, 'productivity')}`}>
                    {analytics.productivity === 'high' ? 'Élevée' : 
                     analytics.productivity === 'medium' ? 'Moyenne' : 'Faible'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Basé sur le taux de réussite
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'overview' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Vue d'ensemble</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Taux de réussite global</span>
                    <span className={`font-bold ${getMetricColor(analytics.completionRate, 'completion')}`}>
                      {analytics.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tendance</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analytics.trend)}
                      <span className="text-white capitalize">{analytics.trend}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Période analysée</span>
                    <span className="text-white">
                      {timeRange === 'week' ? '7 derniers jours' : 
                       timeRange === 'month' ? '30 derniers jours' : 'Cette année'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Analyse des tâches</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{analytics.totalTasks}</div>
                    <div className="text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{analytics.completedTasks}</div>
                    <div className="text-gray-400">Terminées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{analytics.totalTasks - analytics.completedTasks}</div>
                    <div className="text-gray-400">En cours</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Analyse des projets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{analytics.totalProjects}</div>
                    <div className="text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{analytics.activeProjects}</div>
                    <div className="text-gray-400">Actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{analytics.completedProjects}</div>
                    <div className="text-gray-400">Terminés</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Productivité</span>
                    <span className={`font-bold capitalize ${getMetricColor(analytics.productivity, 'productivity')}`}>
                      {analytics.productivity === 'high' ? 'Élevée' : 
                       analytics.productivity === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">XP moyen par tâche</span>
                    <span className="text-white">
                      {analytics.completedTasks > 0 ? (analytics.totalXP / analytics.completedTasks).toFixed(1) : 0} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Évolution</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analytics.trend)}
                      <span className="text-white">
                        {analytics.trend === 'up' ? 'En amélioration' : 
                         analytics.trend === 'down' ? 'En baisse' : 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
