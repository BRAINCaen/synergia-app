// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// ANALYTICS PAGE FIREBASE PUR - CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';
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
  Gauge,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Rocket,
  Brain,
  Award
} from 'lucide-react';

/**
 * 📊 ANALYTICS PAGE FIREBASE PUR
 * Tableaux de bord et métriques avec données réelles Firebase
 */
const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  
  // ✅ DONNÉES FIREBASE RÉELLES
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ ANALYTICS RÉELLES CALCULÉES
  const [realAnalytics, setRealAnalytics] = useState({
    overview: {
      totalTasks: 0,
      completedTasks: 0,
      totalProjects: 0,
      totalXp: 0,
      completionRate: 0,
      productivity: 'medium'
    },
    performance: {
      tasksThisWeek: 0,
      tasksLastWeek: 0,
      xpThisWeek: 0,
      xpLastWeek: 0,
      trend: 'up'
    },
    productivity: {
      dailyAverage: 0,
      peakDay: 'Lundi',
      bestHour: '10h',
      focusTime: 0
    },
    goals: {
      weeklyTarget: 10,
      achieved: 0,
      remaining: 0,
      onTrack: true
    }
  });

  const [chartData, setChartData] = useState({
    weeklyProgress: [],
    tasksByStatus: [],
    projectsProgress: [],
    xpHistory: []
  });

  useEffect(() => {
    if (user?.uid) {
      loadRealAnalytics();
    }
  }, [user?.uid, timeRange]);

  /**
   * 📊 CHARGER TOUTES LES VRAIES ANALYTICS FIREBASE
   */
  const loadRealAnalytics = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement analytics Firebase pour:', user.uid);
      
      // Paralléliser toutes les requêtes
      const [
        userTasksSnapshot,
        userProjectsSnapshot,
        userActivitySnapshot
      ] = await Promise.all([
        // Tâches utilisateur
        getDocs(query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )),
        // Projets utilisateur
        getDocs(query(
          collection(db, 'projects'),
          where('createdBy', '==', user.uid),
          orderBy('createdAt', 'desc')
        )),
        // Activité utilisateur
        getDocs(query(
          collection(db, 'userActivity'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        ))
      ]);

      // 🔥 TRAITER LES TÂCHES
      const userTasks = [];
      userTasksSnapshot.forEach(doc => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 TRAITER LES PROJETS
      const userProjects = [];
      userProjectsSnapshot.forEach(doc => {
        userProjects.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 TRAITER L'ACTIVITÉ
      const userActivity = [];
      userActivitySnapshot.forEach(doc => {
        const activity = doc.data();
        userActivity.push({
          id: doc.id,
          ...activity,
          timestamp: activity.timestamp?.toDate() || new Date()
        });
      });

      // 📊 CALCULER MÉTRIQUES GLOBALES
      const completedTasks = userTasks.filter(task => task.status === 'completed');
      const totalXp = completedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
      const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;

      // 📅 CALCULER PERFORMANCE HEBDOMADAIRE
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const tasksThisWeek = userTasks.filter(task => 
        task.updatedAt && task.updatedAt.toDate() > oneWeekAgo && task.status === 'completed'
      ).length;

      const tasksLastWeek = userTasks.filter(task => 
        task.updatedAt && 
        task.updatedAt.toDate() > twoWeeksAgo && 
        task.updatedAt.toDate() <= oneWeekAgo &&
        task.status === 'completed'
      ).length;

      const xpThisWeek = userTasks
        .filter(task => task.updatedAt && task.updatedAt.toDate() > oneWeekAgo && task.status === 'completed')
        .reduce((sum, task) => sum + (task.xpReward || 0), 0);

      const xpLastWeek = userTasks
        .filter(task => 
          task.updatedAt && 
          task.updatedAt.toDate() > twoWeeksAgo && 
          task.updatedAt.toDate() <= oneWeekAgo &&
          task.status === 'completed'
        )
        .reduce((sum, task) => sum + (task.xpReward || 0), 0);

      // 📈 GÉNÉRER DONNÉES DE GRAPHIQUES
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayTasks = userTasks.filter(task => {
          if (!task.updatedAt || task.status !== 'completed') return false;
          const taskDate = task.updatedAt.toDate();
          return taskDate.toDateString() === date.toDateString();
        });
        
        last7Days.push({
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          tasks: dayTasks.length,
          xp: dayTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
          date: date.toISOString().split('T')[0]
        });
      }

      // 📊 DISTRIBUTION TÂCHES PAR STATUT
      const tasksByStatus = [
        { name: 'Terminées', value: userTasks.filter(t => t.status === 'completed').length, color: '#10b981' },
        { name: 'En cours', value: userTasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
        { name: 'À faire', value: userTasks.filter(t => t.status === 'todo').length, color: '#f59e0b' }
      ];

      // 🎯 CALCULER OBJECTIFS
      const weeklyTarget = 10; // Objectif par défaut
      const achieved = tasksThisWeek;
      const remaining = Math.max(0, weeklyTarget - achieved);
      const onTrack = achieved >= (weeklyTarget * 0.7); // 70% = on track

      // ✅ METTRE À JOUR LES ANALYTICS
      setRealAnalytics({
        overview: {
          totalTasks: userTasks.length,
          completedTasks: completedTasks.length,
          totalProjects: userProjects.length,
          totalXp: gamification?.totalXp || totalXp,
          completionRate,
          productivity: completionRate >= 80 ? 'high' : completionRate >= 60 ? 'medium' : 'low'
        },
        performance: {
          tasksThisWeek,
          tasksLastWeek,
          xpThisWeek,
          xpLastWeek,
          trend: tasksThisWeek >= tasksLastWeek ? 'up' : 'down'
        },
        productivity: {
          dailyAverage: Math.round((completedTasks.length / 30) * 10) / 10,
          peakDay: getPeakDay(userTasks),
          bestHour: getBestHour(userTasks),
          focusTime: calculateFocusTime(userActivity)
        },
        goals: {
          weeklyTarget,
          achieved,
          remaining,
          onTrack
        }
      });

      setChartData({
        weeklyProgress: last7Days,
        tasksByStatus,
        projectsProgress: userProjects.map(p => ({
          name: p.title,
          progress: Math.round(Math.random() * 100), // TODO: calcul réel depuis tâches
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        })),
        xpHistory: last7Days.map(day => ({
          day: day.day,
          xp: day.xp
        }))
      });

      console.log('✅ Analytics Firebase chargées:', {
        tasks: userTasks.length,
        projects: userProjects.length,
        analytics: realAnalytics
      });

    } catch (error) {
      console.error('❌ Erreur chargement analytics Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📈 FONCTIONS UTILITAIRES
   */
  const getPeakDay = (tasks) => {
    const dayCount = {};
    tasks.filter(t => t.status === 'completed').forEach(task => {
      if (task.updatedAt) {
        const day = task.updatedAt.toDate().toLocaleDateString('fr-FR', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      }
    });
    return Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 'Lundi');
  };

  const getBestHour = (tasks) => {
    const hourCount = {};
    tasks.filter(t => t.status === 'completed').forEach(task => {
      if (task.updatedAt) {
        const hour = task.updatedAt.toDate().getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      }
    });
    const bestHour = Object.keys(hourCount).reduce((a, b) => hourCount[a] > hourCount[b] ? a : b, '10');
    return `${bestHour}h`;
  };

  const calculateFocusTime = (activity) => {
    // Estimation basée sur l'activité
    return Math.round((activity.length / 10) * 100) / 100;
  };

  /**
   * 📊 EXPORTER LES DONNÉES
   */
  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: user.email,
      analytics: realAnalytics,
      chartData,
      gamification: {
        level: gamification?.level || 1,
        totalXp: gamification?.totalXp || 0,
        badges: gamification?.badges?.length || 0
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `synergia-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-lg text-gray-600 mt-1">
                  Votre tableau de bord de performance
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
              </select>
              
              <button
                onClick={loadRealAnalytics}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
              
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* MÉTRIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tâches */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tâches</p>
                <p className="text-3xl font-bold text-gray-900">{realAnalytics.overview.totalTasks}</p>
                <p className="text-sm text-gray-500">{realAnalytics.overview.completedTasks} terminées</p>
              </div>
              <CheckSquare className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          {/* Taux de Completion */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Completion</p>
                <p className="text-3xl font-bold text-green-600">{realAnalytics.overview.completionRate}%</p>
                <div className="flex items-center mt-1">
                  {realAnalytics.performance.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${realAnalytics.performance.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    Tendance {realAnalytics.performance.trend === 'up' ? 'positive' : 'négative'}
                  </span>
                </div>
              </div>
              <Target className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* XP Total */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">XP Total</p>
                <p className="text-3xl font-bold text-purple-600">{realAnalytics.overview.totalXp}</p>
                <p className="text-sm text-gray-500">+{realAnalytics.performance.xpThisWeek} cette semaine</p>
              </div>
              <Star className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          {/* Projets */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets</p>
                <p className="text-3xl font-bold text-orange-600">{realAnalytics.overview.totalProjects}</p>
                <p className="text-sm text-gray-500">Créés</p>
              </div>
              <Rocket className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* SECTION GAMIFICATION */}
        {gamification && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Progression Gamification</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm opacity-90">Niveau</p>
                    <p className="text-2xl font-bold">{gamification.level || 1}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">XP</p>
                    <p className="text-2xl font-bold">{gamification.totalXp || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Badges</p>
                    <p className="text-2xl font-bold">{gamification.badges?.length || 0}</p>
                  </div>
                </div>
              </div>
              <Trophy className="h-16 w-16 opacity-80" />
            </div>
          </div>
        )}

        {/* GRAPHIQUES ET DÉTAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progression Hebdomadaire */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-blue-500" />
              Progression (7 jours)
            </h3>
            <div className="space-y-3">
              {chartData.weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (day.tasks / Math.max(1, Math.max(...chartData.weeklyProgress.map(d => d.tasks)))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{day.tasks}</span>
                    <span className="text-xs text-purple-600 ml-2">+{day.xp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition des Tâches */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-green-500" />
              Répartition des Tâches
            </h3>
            <div className="space-y-4">
              {chartData.tasksByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{status.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INSIGHTS ET RECOMMANDATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Productivité */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-500" />
              Insights Productivité
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Moyenne quotidienne</span>
                <span className="font-medium">{realAnalytics.productivity.dailyAverage} tâches/jour</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jour le plus productif</span>
                <span className="font-medium">{realAnalytics.productivity.peakDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Heure optimale</span>
                <span className="font-medium">{realAnalytics.productivity.bestHour}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Temps de focus</span>
                <span className="font-medium">{realAnalytics.productivity.focusTime}h/jour</span>
              </div>
            </div>
          </div>

          {/* Objectifs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-500" />
              Objectifs Hebdomadaires
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Objectif</span>
                <span className="font-medium">{realAnalytics.goals.weeklyTarget} tâches</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accompli</span>
                <span className="font-medium text-green-600">{realAnalytics.goals.achieved} tâches</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Restant</span>
                <span className="font-medium text-orange-600">{realAnalytics.goals.remaining} tâches</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{Math.round((realAnalytics.goals.achieved / realAnalytics.goals.weeklyTarget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      realAnalytics.goals.onTrack ? 'bg-green-600' : 'bg-orange-600'
                    }`}
                    style={{ width: `${Math.min(100, (realAnalytics.goals.achieved / realAnalytics.goals.weeklyTarget) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {realAnalytics.goals.onTrack ? '✅ Objectif en bonne voie' : '⚠️ Effort supplémentaire nécessaire'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
