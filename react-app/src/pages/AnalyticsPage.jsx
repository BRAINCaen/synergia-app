// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// CORRECTION IMPORTS LUCIDE-REACT - Progress → Gauge
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
  Gauge, // ✅ CORRECTION : Progress → Gauge (Progress n'existe pas dans lucide-react)
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
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeProjects = filteredProjects.filter(project => project.status === 'active').length;
    const completedProjects = filteredProjects.filter(project => project.status === 'completed').length;

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: filteredTasks.filter(task => task.status === 'pending').length,
        inProgress: filteredTasks.filter(task => task.status === 'in-progress').length,
        completionRate
      },
      projects: {
        total: filteredProjects.length,
        active: activeProjects,
        completed: completedProjects,
        planning: filteredProjects.filter(project => project.status === 'planning').length
      },
      productivity: {
        dailyAverage: Math.round(completedTasks / 7),
        weeklyTrend: completionRate > 70 ? 'up' : completionRate > 40 ? 'stable' : 'down',
        efficiency: completionRate
      }
    };
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Chargement des analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune donnée disponible</h2>
            <p className="text-gray-600 mb-6">Commencez par créer des tâches et des projets pour voir vos analytics.</p>
            <button
              onClick={refreshAnalytics}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header avec contrôles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Analyse de votre productivité et performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sélecteur de période */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="year">12 derniers mois</option>
              </select>
              
              <button
                onClick={refreshAnalytics}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                          transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex space-x-1 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'tasks', label: 'Tâches', icon: CheckCircle2 },
              { id: 'projects', label: 'Projets', icon: Target },
              { id: 'trends', label: 'Tendances', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Carte Tâches Complétées */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tâches Complétées</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.tasks.completed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* ✅ UTILISE Gauge AU LIEU DE Progress */}
                <Gauge className="w-4 h-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">
                  {analytics.tasks.completionRate}% de réussite
                </span>
              </div>
            </div>

            {/* Carte Projets Actifs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Projets Actifs</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.projects.active}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 text-sm font-medium">
                  {analytics.projects.total} au total
                </span>
              </div>
            </div>

            {/* Carte Productivité */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Moyenne Quotidienne</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.productivity.dailyAverage}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analytics.productivity.weeklyTrend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : analytics.productivity.weeklyTrend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-600" />
                )}
                <span className={`text-sm font-medium ${
                  analytics.productivity.weeklyTrend === 'up' ? 'text-green-600' :
                  analytics.productivity.weeklyTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Tendance {analytics.productivity.weeklyTrend === 'up' ? 'positive' : 
                           analytics.productivity.weeklyTrend === 'down' ? 'négative' : 'stable'}
                </span>
              </div>
            </div>

            {/* Carte Efficacité */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Efficacité</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.productivity.efficiency}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 text-sm font-medium">
                  Performance {analytics.productivity.efficiency > 80 ? 'excellente' : 
                             analytics.productivity.efficiency > 60 ? 'bonne' : 'à améliorer'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Autres onglets - versions simplifiées */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Détails des Tâches</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{analytics.tasks.completed}</p>
                <p className="text-green-700">Complétées</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{analytics.tasks.inProgress}</p>
                <p className="text-blue-700">En cours</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-600">{analytics.tasks.pending}</p>
                <p className="text-gray-700">En attente</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Détails des Projets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{analytics.projects.active}</p>
                <p className="text-blue-700">Actifs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{analytics.projects.completed}</p>
                <p className="text-green-700">Terminés</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Brain className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{analytics.projects.planning}</p>
                <p className="text-orange-700">En planification</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analyse des Tendances</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <Rocket className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Progression Positive</h3>
                  <p className="text-gray-600">Votre taux de completion de {analytics.productivity.efficiency}% montre une bonne productivité.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Objectifs Atteints</h3>
                  <p className="text-gray-600">Vous avez complété {analytics.tasks.completed} tâches sur la période sélectionnée.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AnalyticsPage;
