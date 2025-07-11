// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// Page Analytics CORRIGÉE - Bug TypeError: n is not a function RÉSOLU
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
      
      // Calcul des analytics avec vérification de sécurité
      const analytics = calculateAnalytics();
      setAnalytics(analytics);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    try {
      // ✅ CORRECTION MAJEURE: Vérification de sécurité des tableaux
      const safeTasks = Array.isArray(tasks) ? tasks : [];
      const safeProjects = Array.isArray(projects) ? projects : [];

      console.log('🔍 Calcul analytics - Tasks:', safeTasks.length, 'Projects:', safeProjects.length);

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
      
      // ✅ FILTRAGE SÉCURISÉ - Vérification de l'existence des propriétés
      const filteredTasks = safeTasks.filter(task => {
        try {
          const taskDate = new Date(task.createdAt || task.updatedAt || now);
          return taskDate >= rangeStart;
        } catch (error) {
          console.warn('Tâche avec date invalide:', task);
          return true; // Inclure la tâche par défaut
        }
      });

      const filteredProjects = safeProjects.filter(project => {
        try {
          const projectDate = new Date(project.createdAt || project.updatedAt || now);
          return projectDate >= rangeStart;
        } catch (error) {
          console.warn('Projet avec date invalide:', project);
          return true; // Inclure le projet par défaut
        }
      });

      // ✅ CALCULS SÉCURISÉS - Vérification de l'existence des propriétés
      const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
      const totalTasks = filteredTasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const activeProjects = filteredProjects.filter(project => project.status === 'active').length;
      const completedProjects = filteredProjects.filter(project => project.status === 'completed').length;
      const totalProjects = filteredProjects.length;

      // ✅ CALCUL XP SÉCURISÉ - Gestion des valeurs null/undefined
      const totalXP = filteredTasks.reduce((sum, task) => {
        const xp = task.xp || task.xpReward || 0;
        return sum + (typeof xp === 'number' ? xp : 0);
      }, 0);

      // ✅ CALCUL DE TENDANCES SÉCURISÉ
      const midPoint = new Date(rangeStart.getTime() + (now.getTime() - rangeStart.getTime()) / 2);
      
      const firstHalfTasks = filteredTasks.filter(task => {
        try {
          const taskDate = new Date(task.createdAt || task.updatedAt || now);
          return taskDate < midPoint;
        } catch (error) {
          return false;
        }
      });
      
      const secondHalfTasks = filteredTasks.filter(task => {
        try {
          const taskDate = new Date(task.createdAt || task.updatedAt || now);
          return taskDate >= midPoint;
        } catch (error) {
          return false;
        }
      });

      const firstHalfCompleted = firstHalfTasks.filter(task => task.status === 'completed').length;
      const secondHalfCompleted = secondHalfTasks.filter(task => task.status === 'completed').length;
      
      let trend = 'stable';
      if (secondHalfCompleted > firstHalfCompleted) {
        trend = 'up';
      } else if (secondHalfCompleted < firstHalfCompleted) {
        trend = 'down';
      }

      const analyticsResult = {
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

      console.log('✅ Analytics calculés:', analyticsResult);
      return analyticsResult;

    } catch (error) {
      console.error('❌ Erreur dans calculateAnalytics:', error);
      // ✅ FALLBACK SÉCURISÉ - Retourner des valeurs par défaut
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalXP: 0,
        trend: 'stable',
        productivity: 'low'
      };
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAnalytics();
    } catch (error) {
      console.error('Erreur refresh:', error);
    } finally {
      setRefreshing(false);
    }
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
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // ✅ LOADING STATE AMÉLIORÉ
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des analytics...</p>
          <p className="text-gray-500 text-sm mt-2">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE - Si pas d'analytics ou erreur
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-white mb-2">Analytics indisponibles</h2>
          <p className="text-gray-400 mb-4">Impossible de calculer les métriques</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              📊 Analytics
            </h1>
            <p className="text-gray-400 mt-1">Tableau de bord des performances</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">Cette année</option>
            </select>
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tâches */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Tâches totales</h3>
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{analytics.totalTasks}</div>
            <p className="text-sm text-gray-400">
              {analytics.completedTasks} terminées ({analytics.completionRate}%)
            </p>
          </div>

          {/* Projets */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Projets actifs</h3>
              <Rocket className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{analytics.activeProjects}</div>
            <p className="text-sm text-gray-400">
              {analytics.totalProjects} au total
            </p>
          </div>

          {/* XP Total */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">XP total</h3>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{analytics.totalXP}</div>
            <p className="text-sm text-gray-400">
              Points d'expérience
            </p>
          </div>

          {/* Productivité */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Productivité</h3>
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1 capitalize">
              {analytics.productivity === 'high' ? 'Élevée' : 
               analytics.productivity === 'medium' ? 'Moyenne' : 'Faible'}
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(analytics.trend)}
              <span className="text-sm text-gray-400 capitalize">
                {analytics.trend === 'up' ? 'En amélioration' : 
                 analytics.trend === 'down' ? 'En baisse' : 'Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="flex items-center gap-4 mb-6">
          {['overview', 'tasks', 'projects', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Vue d\'ensemble' :
               tab === 'tasks' ? 'Tâches' :
               tab === 'projects' ? 'Projets' : 'Performance'}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Vue d'ensemble</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Taux de réussite global</span>
                <span className={`font-bold ${getMetricColor(analytics.completionRate, 'completion')}`}>
                  {analytics.completionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tendance</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(analytics.trend)}
                  <span className="text-white capitalize">
                    {analytics.trend === 'up' ? 'En amélioration' : 
                     analytics.trend === 'down' ? 'En baisse' : 'Stable'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Période analysée</span>
                <span className="text-white">
                  {timeRange === 'week' ? '7 derniers jours' : 
                   timeRange === 'month' ? '30 derniers jours' : 'Cette année'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Productivité</span>
                <span className={`font-bold capitalize ${getMetricColor(analytics.productivity, 'productivity')}`}>
                  {analytics.productivity === 'high' ? 'Élevée' : 
                   analytics.productivity === 'medium' ? 'Moyenne' : 'Faible'}
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
                  {analytics.completedTasks > 0 ? Math.round(analytics.totalXP / analytics.completedTasks) : 0} XP
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
    </div>
  );
};

export default AnalyticsPage;
