import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  startAfter,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameStore } from '../shared/stores/gameStore';

// Icônes
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Zap,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    tasks: {
      total: 0,
      completed: 0,
      inProgress: 0,
      overdue: 0,
      completionRate: 0,
      avgCompletionTime: 0
    },
    projects: {
      total: 0,
      active: 0,
      completed: 0,
      averageProgress: 0
    },
    gamification: {
      totalXP: 0,
      level: 1,
      badges: 0,
      streak: 0
    },
    productivity: {
      tasksPerDay: 0,
      peakDay: '',
      thisWeek: 0,
      lastWeek: 0
    }
  });

  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days, all
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState({
    dailyTasks: [],
    priorityDistribution: [],
    projectProgress: []
  });

  const { user } = useAuthStore();
  const { userStats } = useGameStore();

  // Calculer les dates de plage
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate = new Date(2020, 0, 1); // Date très ancienne pour "all"
    }
    
    return { startDate, endDate: now };
  };

  // Charger les analytics depuis Firebase
  const loadAnalytics = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      // 1. Analyser les tâches
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const allTasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      }));

      // Filtrer par plage de dates
      const filteredTasks = allTasks.filter(task => 
        task.createdAt && task.createdAt >= startDate && task.createdAt <= endDate
      );

      // Calculer métriques tâches
      const completedTasks = filteredTasks.filter(task => task.status === 'completed');
      const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
      const overdueTasks = filteredTasks.filter(task => 
        task.dueDate && task.dueDate < new Date() && task.status !== 'completed'
      );

      const completionRate = filteredTasks.length > 0 
        ? Math.round((completedTasks.length / filteredTasks.length) * 100)
        : 0;

      // Calculer temps moyen de completion
      const completionTimes = completedTasks
        .filter(task => task.createdAt && task.completedAt)
        .map(task => {
          const diff = task.completedAt.getTime() - task.createdAt.getTime();
          return Math.round(diff / (1000 * 60 * 60 * 24)); // en jours
        });

      const avgCompletionTime = completionTimes.length > 0
        ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length)
        : 0;

      // 2. Analyser les projets
      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', user.uid)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const allProjects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      const filteredProjects = allProjects.filter(project => 
        project.createdAt && project.createdAt >= startDate && project.createdAt <= endDate
      );

      const activeProjects = filteredProjects.filter(p => p.status === 'active');
      const completedProjects = filteredProjects.filter(p => p.status === 'completed');

      // 3. Calculer productivité
      const dailyTaskCounts = {};
      filteredTasks.forEach(task => {
        const date = task.createdAt.toDateString();
        dailyTaskCounts[date] = (dailyTaskCounts[date] || 0) + 1;
      });

      const taskCounts = Object.values(dailyTaskCounts);
      const avgTasksPerDay = taskCounts.length > 0
        ? Math.round(taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length)
        : 0;

      const peakDay = Object.keys(dailyTaskCounts).reduce((peak, date) => 
        dailyTaskCounts[date] > (dailyTaskCounts[peak] || 0) ? date : peak, ''
      );

      // Calculer données graphiques
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
      }).reverse();

      const dailyTasksData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        created: allTasks.filter(task => 
          task.createdAt && task.createdAt.toDateString() === date
        ).length,
        completed: allTasks.filter(task => 
          task.completedAt && task.completedAt.toDateString() === date
        ).length
      }));

      // Distribution priorités
      const priorityCounts = { high: 0, medium: 0, low: 0 };
      filteredTasks.forEach(task => {
        if (task.priority) priorityCounts[task.priority]++;
      });

      const priorityData = [
        { name: 'Haute', value: priorityCounts.high, color: '#ef4444' },
        { name: 'Moyenne', value: priorityCounts.medium, color: '#f59e0b' },
        { name: 'Basse', value: priorityCounts.low, color: '#10b981' }
      ];

      // Mettre à jour l'état
      setAnalytics({
        tasks: {
          total: filteredTasks.length,
          completed: completedTasks.length,
          inProgress: inProgressTasks.length,
          overdue: overdueTasks.length,
          completionRate,
          avgCompletionTime
        },
        projects: {
          total: filteredProjects.length,
          active: activeProjects.length,
          completed: completedProjects.length,
          averageProgress: 0 // À calculer si nécessaire
        },
        gamification: {
          totalXP: userStats?.totalXp || 0,
          level: userStats?.level || 1,
          badges: userStats?.badges?.length || 0,
          streak: userStats?.loginStreak || 0
        },
        productivity: {
          tasksPerDay: avgTasksPerDay,
          peakDay: peakDay ? new Date(peakDay).toLocaleDateString('fr-FR') : 'N/A',
          thisWeek: 0, // À calculer
          lastWeek: 0  // À calculer
        }
      });

      setChartData({
        dailyTasks: dailyTasksData,
        priorityDistribution: priorityData,
        projectProgress: [] // À développer
      });

    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  // Charger les données au montage et changement de plage
  useEffect(() => {
    loadAnalytics();
  }, [user?.uid, timeRange]);

  // Fonction utilitaire pour formater les pourcentages
  const formatPercentage = (value) => `${Math.round(value)}%`;

  // Fonction utilitaire pour formater les durées
  const formatDuration = (days) => {
    if (days === 0) return 'N/A';
    if (days === 1) return '1 jour';
    return `${days} jours`;
  };

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
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-400" />
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
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
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
                <p className="text-3xl font-bold text-white mt-1">{analytics.tasks.total}</p>
                <p className="text-green-400 text-sm mt-1">
                  {analytics.tasks.completed} complétées
                </p>
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
                <p className="text-3xl font-bold text-white mt-1">{analytics.tasks.completionRate}%</p>
                <p className="text-gray-400 text-sm mt-1">
                  {analytics.tasks.avgCompletionTime > 0 && `Moy: ${formatDuration(analytics.tasks.avgCompletionTime)}`}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* XP Total */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total XP</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.gamification.totalXP.toLocaleString()}</p>
                <p className="text-yellow-400 text-sm mt-1">
                  Niveau {analytics.gamification.level}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Projets actifs */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Projets</p>
                <p className="text-3xl font-bold text-white mt-1">{analytics.projects.total}</p>
                <p className="text-purple-400 text-sm mt-1">
                  {analytics.projects.active} actifs
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et métriques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activité quotidienne */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Activité des 7 derniers jours
            </h3>
            
            {chartData.dailyTasks.length > 0 ? (
              <div className="space-y-4">
                {chartData.dailyTasks.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-400 w-16">{day.date}</div>
                    <div className="flex-1 mx-4">
                      <div className="flex gap-1">
                        <div 
                          className="bg-blue-500 h-6 rounded-sm flex items-center justify-center text-xs text-white"
                          style={{ width: `${Math.max((day.created / 10) * 100, 10)}%` }}
                        >
                          {day.created > 0 && day.created}
                        </div>
                        <div 
                          className="bg-green-500 h-6 rounded-sm flex items-center justify-center text-xs text-white"
                          style={{ width: `${Math.max((day.completed / 10) * 100, 10)}%` }}
                        >
                          {day.completed > 0 && day.completed}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-white w-20 text-right">
                      {day.created}/{day.completed}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-400">Créées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-400">Complétées</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune donnée d'activité disponible</p>
              </div>
            )}
          </div>

          {/* Distribution des priorités */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-400" />
              Distribution des priorités
            </h3>
            
            {chartData.priorityDistribution.some(item => item.value > 0) ? (
              <div className="space-y-4">
                {chartData.priorityDistribution.map((priority, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      ></div>
                      <span className="text-white">{priority.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${analytics.tasks.total > 0 ? (priority.value / analytics.tasks.total) * 100 : 0}%`,
                            backgroundColor: priority.color 
                          }}
                        ></div>
                      </div>
                      <span className="text-white w-8 text-right">{priority.value}</span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-center text-gray-400 text-sm">
                    Total: {analytics.tasks.total} tâches analysées
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune donnée de priorité disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productivité */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Productivité
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tâches par jour</span>
                <span className="text-white font-medium">{analytics.productivity.tasksPerDay}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Jour le plus productif</span>
                <span className="text-white font-medium">{analytics.productivity.peakDay}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">En retard</span>
                <span className="text-red-400 font-medium">{analytics.tasks.overdue}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">En cours</span>
                <span className="text-yellow-400 font-medium">{analytics.tasks.inProgress}</span>
              </div>
            </div>
          </div>

          {/* Gamification */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Gamification
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Niveau actuel</span>
                <span className="text-yellow-400 font-medium">{analytics.gamification.level}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total XP</span>
                <span className="text-white font-medium">{analytics.gamification.totalXP.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Badges obtenus</span>
                <span className="text-purple-400 font-medium">{analytics.gamification.badges}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Série de connexions</span>
                <span className="text-green-400 font-medium">{analytics.gamification.streak} jours</span>
              </div>
            </div>
          </div>

          {/* Résumé projets */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Projets
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total projets</span>
                <span className="text-white font-medium">{analytics.projects.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Projets actifs</span>
                <span className="text-blue-400 font-medium">{analytics.projects.active}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Projets terminés</span>
                <span className="text-green-400 font-medium">{analytics.projects.completed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Taux de completion</span>
                <span className="text-white font-medium">
                  {analytics.projects.total > 0 
                    ? Math.round((analytics.projects.completed / analytics.projects.total) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message si pas de données */}
        {analytics.tasks.total === 0 && analytics.projects.total === 0 && (
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
