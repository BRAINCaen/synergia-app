// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// Page Analytics avec design premium sombre - Style Leaderboard
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
  Progress,
  PieChart,
  LineChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Rocket,
  Brain,
  Gauge
} from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { level, totalXp, badges } = useGameStore();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, productivity, projects, gamification

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
    const filteredTasks = tasks.filter(task => new Date(task.createdAt) >= rangeStart);
    const filteredProjects = projects.filter(project => new Date(project.createdAt) >= rangeStart);

    // Métriques de base
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
    const overdueTasks = filteredTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    );

    const activeProjects = filteredProjects.filter(p => p.status === 'active');
    const completedProjects = filteredProjects.filter(p => p.status === 'completed');

    // Calculs de tendances (comparaison avec période précédente)
    const prevRangeStart = new Date(rangeStart.getTime() - (now.getTime() - rangeStart.getTime()));
    const prevTasks = tasks.filter(task => {
      const date = new Date(task.createdAt);
      return date >= prevRangeStart && date < rangeStart;
    });
    const prevCompletedTasks = prevTasks.filter(t => t.status === 'completed');

    const getTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 'up' : 'stable';
      const change = ((current - previous) / previous) * 100;
      if (change > 5) return 'up';
      if (change < -5) return 'down';
      return 'stable';
    };

    // Productivité par jour
    const getDailyProductivity = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.completedAt || task.createdAt);
          return taskDate.toDateString() === date.toDateString() && task.status === 'completed';
        });
        
        days.push({
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          tasks: dayTasks.length,
          xp: dayTasks.length * 25 // XP estimé
        });
      }
      return days;
    };

    // Distribution des priorités
    const getPriorityDistribution = () => {
      const high = filteredTasks.filter(t => t.priority === 'high').length;
      const medium = filteredTasks.filter(t => t.priority === 'medium').length;
      const low = filteredTasks.filter(t => t.priority === 'low').length;
      
      return [
        { name: 'Haute', value: high, color: '#ef4444' },
        { name: 'Moyenne', value: medium, color: '#f59e0b' },
        { name: 'Basse', value: low, color: '#10b981' }
      ];
    };

    // Temps moyen de complétion (estimation)
    const getAvgCompletionTime = () => {
      const completedWithDates = completedTasks.filter(t => t.createdAt && t.completedAt);
      if (completedWithDates.length === 0) return 0;
      
      const totalTime = completedWithDates.reduce((acc, task) => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.completedAt);
        return acc + (completed - created);
      }, 0);
      
      return Math.round(totalTime / completedWithDates.length / (1000 * 60 * 60 * 24)); // en jours
    };

    return {
      overview: {
        totalTasks: filteredTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: filteredTasks.length > 0 ? 
          Math.round((completedTasks.length / filteredTasks.length) * 100) : 0,
        
        totalProjects: filteredProjects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        
        avgCompletionTime: getAvgCompletionTime(),
        
        // Tendances
        tasksCompletedTrend: getTrend(completedTasks.length, prevCompletedTasks.length),
        tasksCompletedChange: prevCompletedTasks.length > 0 ? 
          Math.round(((completedTasks.length - prevCompletedTasks.length) / prevCompletedTasks.length) * 100) : 0
      },
      charts: {
        dailyProductivity: getDailyProductivity(),
        priorityDistribution: getPriorityDistribution()
      },
      gamification: {
        level,
        totalXp,
        badges: badges || [],
        streak: 1, // À implémenter avec le système de streak
        weeklyXp: completedTasks.length * 25 // XP de la semaine
      }
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'productivity', label: 'Productivité', icon: TrendingUp },
    { id: 'projects', label: 'Projets', icon: Target },
    { id: 'gamification', label: 'Gamification', icon: Trophy }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, change, subtitle }) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:bg-gray-750 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-${color}-500/20`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' && <ArrowUp className="w-4 h-4" />}
            {trend === 'down' && <ArrowDown className="w-4 h-4" />}
            {trend === 'stable' && <Minus className="w-4 h-4" />}
            {change !== undefined && `${Math.abs(change)}%`}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === 'string' ? value : value.toLocaleString()}
      </div>
    </div>
  );

  const SimpleChart = ({ title, data, type = 'bar' }) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        {type === 'bar' && <BarChart className="w-5 h-5 text-blue-400" />}
        {type === 'pie' && <PieChart className="w-5 h-5 text-purple-400" />}
        {type === 'line' && <LineChart className="w-5 h-5 text-green-400" />}
        {title}
      </h3>
      
      {type === 'bar' && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-12 text-gray-400 text-sm">{item.day}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{item.tasks} tâches</span>
                  <span className="text-xs text-gray-400">{item.xp} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((item.tasks / Math.max(...data.map(d => d.tasks)) * 100), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {type === 'pie' && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <div className="text-white font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          Chargement des analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête Premium */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-orange-900/20 to-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-orange-400" />
                Analytics
              </h1>
              <p className="text-gray-400 text-lg">
                Intelligence performance • Insights avancés • Optimisation continue
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="year">12 derniers mois</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/25">
                <Download className="w-5 h-5" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation des onglets */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-2 mb-8">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-8">
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && analytics && (
            <>
              {/* KPIs principaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Tâches terminées"
                  value={analytics.overview.completedTasks}
                  icon={CheckCircle2}
                  color="green"
                  trend={analytics.overview.tasksCompletedTrend}
                  change={analytics.overview.tasksCompletedChange}
                  subtitle={`Sur ${analytics.overview.totalTasks} tâches`}
                />
                
                <StatCard
                  title="Taux de complétion"
                  value={`${analytics.overview.completionRate}%`}
                  icon={Target}
                  color="blue"
                  subtitle="Performance globale"
                />
                
                <StatCard
                  title="Projets actifs"
                  value={analytics.overview.activeProjects}
                  icon={Rocket}
                  color="purple"
                  subtitle={`${analytics.overview.totalProjects} au total`}
                />
                
                <StatCard
                  title="Temps moyen"
                  value={`${analytics.overview.avgCompletionTime}j`}
                  icon={Clock}
                  color="yellow"
                  subtitle="Par tâche"
                />
              </div>

              {/* Métriques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="En cours"
                  value={analytics.overview.inProgressTasks}
                  icon={Activity}
                  color="blue"
                />
                
                <StatCard
                  title="En retard"
                  value={analytics.overview.overdueTasks}
                  icon={AlertCircle}
                  color="red"
                />
                
                <StatCard
                  title="Projets terminés"
                  value={analytics.overview.completedProjects}
                  icon={Trophy}
                  color="green"
                />
              </div>
            </>
          )}

          {/* Productivité */}
          {activeTab === 'productivity' && analytics && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SimpleChart
                  title="Productivité des 7 derniers jours"
                  data={analytics.charts.dailyProductivity}
                  type="bar"
                />
                
                <SimpleChart
                  title="Répartition par priorité"
                  data={analytics.charts.priorityDistribution}
                  type="pie"
                />
              </div>

              {/* Insights productivité */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  Insights Productivité
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <h4 className="font-semibold text-white">Performance</h4>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Votre taux de complétion de {analytics.overview.completionRate}% est 
                      {analytics.overview.completionRate >= 80 ? ' excellent !' : 
                       analytics.overview.completionRate >= 60 ? ' satisfaisant.' : ' à améliorer.'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-white">Efficacité</h4>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Temps moyen de {analytics.overview.avgCompletionTime} jours par tâche.
                      {analytics.overview.avgCompletionTime <= 2 ? ' Très efficace !' : 
                       analytics.overview.avgCompletionTime <= 5 ? ' Bien géré.' : ' Optimisable.'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Target className="w-5 h-5 text-orange-400" />
                      </div>
                      <h4 className="font-semibold text-white">Focus</h4>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {analytics.overview.overdueTasks === 0 
                        ? 'Aucune tâche en retard ! Excellent suivi.'
                        : `${analytics.overview.overdueTasks} tâche(s) en retard. Priorisez !`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Projets */}
          {activeTab === 'projects' && analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Projets actifs"
                  value={analytics.overview.activeProjects}
                  icon={Rocket}
                  color="green"
                />
                
                <StatCard
                  title="Projets terminés"
                  value={analytics.overview.completedProjects}
                  icon={CheckCircle2}
                  color="blue"
                />
                
                <StatCard
                  title="Taux de réussite"
                  value={analytics.overview.totalProjects > 0 ? 
                    `${Math.round((analytics.overview.completedProjects / analytics.overview.totalProjects) * 100)}%` : '0%'}
                  icon={Trophy}
                  color="yellow"
                />
              </div>

              {/* État des projets */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Gauge className="w-6 h-6 text-blue-400" />
                  État des Projets
                </h3>
                
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id);
                    const completedTasks = projectTasks.filter(t => t.status === 'completed');
                    const progress = projectTasks.length > 0 ? 
                      Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
                    
                    return (
                      <div key={project.id} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-white truncate">{project.name}</h4>
                          <span className="text-sm text-gray-400">
                            {completedTasks.length}/{projectTasks.length} tâches
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-white min-w-0">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Gamification */}
          {activeTab === 'gamification' && analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Niveau actuel"
                  value={analytics.gamification.level}
                  icon={Trophy}
                  color="yellow"
                  subtitle="XP gagné cette semaine"
                />
                
                <StatCard
                  title="XP Total"
                  value={analytics.gamification.totalXp}
                  icon={Zap}
                  color="blue"
                />
                
                <StatCard
                  title="Badges"
                  value={analytics.gamification.badges.length}
                  icon={Star}
                  color="purple"
                  subtitle="Débloqués"
                />
                
                <StatCard
                  title="Série actuelle"
                  value={`${analytics.gamification.streak} jour${analytics.gamification.streak > 1 ? 's' : ''}`}
                  icon={Target}
                  color="orange"
                />
              </div>

              {/* Progression XP */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-400" />
                  Progression XP
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Progression niveau {analytics.gamification.level}</span>
                    <span className="text-white font-medium">
                      {analytics.gamification.totalXp % 500}/500 XP
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${((analytics.gamification.totalXp % 500) / 500) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      {500 - (analytics.gamification.totalXp % 500)} XP pour atteindre le niveau {analytics.gamification.level + 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges récents */}
              {analytics.gamification.badges.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-purple-400" />
                    Badges Débloqués
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.gamification.badges.slice(0, 6).map((badge, index) => (
                      <div key={index} className="bg-gray-700/50 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                        <h4 className="font-medium text-white text-sm">{badge.name || `Badge ${index + 1}`}</h4>
                        <p className="text-gray-400 text-xs mt-1">{badge.description || 'Badge débloqué'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
