// react-app/src/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import analyticsService from '../../core/services/analyticsService';
import { useAuth } from '../../shared/hooks/useAuth';
import MetricCard from './MetricCard';
import ProgressChart from './ProgressChart';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    metrics: null,
    progressData: [],
    velocityData: [],
    projectsProgress: [],
    tasksDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      console.log('⚠️ Pas d\'utilisateur connecté');
      return;
    }

    console.log('🚀 Chargement analytics pour:', user.uid);
    loadAnalyticsData();

    // S'abonner aux changements temps réel
    const unsubscribe = analyticsService.subscribeToMetrics(user.uid, (newMetrics) => {
      console.log('🔄 Nouvelles métriques reçues:', newMetrics);
      setData(prev => ({ ...prev, metrics: newMetrics }));
    });

    return () => {
      console.log('🧹 Nettoyage analytics');
      unsubscribe();
    };
  }, [user?.uid, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Chargement données analytics...');

      const [
        metrics,
        progressOverTime,
        velocity,
        projects,
        distribution
      ] = await Promise.all([
        analyticsService.getGlobalMetrics(user.uid),
        analyticsService.getProgressOverTime(user.uid, timeRange),
        analyticsService.getVelocityData(user.uid),
        analyticsService.getProjectsProgress(user.uid),
        analyticsService.getTasksDistribution(user.uid)
      ]);

      console.log('✅ Données chargées:', { metrics, progressOverTime, velocity, projects, distribution });

      setData({
        metrics,
        progressData: progressOverTime,
        velocityData: velocity,
        projectsProgress: projects,
        tasksDistribution: distribution
      });
    } catch (err) {
      console.error('❌ Erreur chargement analytics:', err);
      setError('Erreur lors du chargement des données analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      console.log('📊 Export analytics démarré...');
      const exportData = await analyticsService.exportAnalytics(user.uid);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synergia-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('✅ Export terminé');
    } catch (err) {
      console.error('❌ Erreur export:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { metrics, progressData, velocityData, projectsProgress, tasksDistribution } = data;

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400">Aucune donnée analytics disponible</p>
          <p className="text-gray-500 text-sm mt-2">Créez quelques tâches pour voir vos statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec contrôles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Vue d'ensemble temps réel de votre productivité
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="timeRange" className="text-sm text-gray-300">
                Période :
              </label>
              <select 
                id="timeRange"
                value={timeRange} 
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>7 jours</option>
                <option value={30}>30 jours</option>
                <option value={90}>3 mois</option>
              </select>
            </div>
            <button 
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon="🎯"
            value={metrics.totalProjects}
            label="Projets Total"
            color="from-blue-500 to-purple-600"
            trend={metrics.activeProjects > 0 ? 5 : 0}
          />
          <MetricCard
            icon="⚡"
            value={metrics.activeProjects}
            label="Projets Actifs"
            color="from-green-500 to-teal-600"
          />
          <MetricCard
            icon="✅"
            value={`${metrics.completedTasks}/${metrics.totalTasks}`}
            label="Tâches Complétées"
            color="from-emerald-500 to-green-600"
            trend={12}
          />
          <MetricCard
            icon="⏰"
            value={metrics.overdueTasks}
            label="Tâches En Retard"
            color="from-red-500 to-pink-600"
            trend={metrics.overdueTasks > 0 ? -3 : 3}
          />
          <MetricCard
            icon="👥"
            value={metrics.teamMembers}
            label="Membres Équipe"
            color="from-cyan-500 to-blue-600"
          />
          <MetricCard
            icon="📈"
            value={`${metrics.avgCompletion}%`}
            label="Completion Moyenne"
            color="from-yellow-500 to-orange-600"
            trend={8}
          />
          <MetricCard
            icon="🔥"
            value={metrics.productivity}
            label="Complétées Aujourd'hui"
            color="from-pink-500 to-rose-600"
          />
          <MetricCard
            icon="⚡"
            value={`${metrics.velocity}`}
            label="Vélocité (7j)"
            color="from-indigo-500 to-purple-600"
          />
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progression dans le temps */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                📈 Progression des Tâches
              </h3>
              <p className="text-gray-400 text-sm">
                Évolution sur {timeRange} derniers jours
              </p>
            </div>
            <ProgressChart data={progressData} height={300} />
          </div>

          {/* Vélocité par équipe */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                ⚡ Vélocité par Équipe
              </h3>
              <p className="text-gray-400 text-sm">
                Comparaison hebdomadaire
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="team" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar 
                  dataKey="thisWeek" 
                  fill="#3b82f6" 
                  name="Cette semaine"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="lastWeek" 
                  fill="#6366f1" 
                  name="Semaine dernière"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution des tâches */}
        {tasksDistribution.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                📊 Répartition des Tâches
              </h3>
              <p className="text-gray-400 text-sm">
                État actuel de toutes vos tâches
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Progression des projets */}
        {projectsProgress.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                🎯 Progression des Projets
              </h3>
              <p className="text-gray-400 text-sm">
                {projectsProgress.length} projets en cours
              </p>
            </div>
            <div className="space-y-4">
              {projectsProgress.map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{project.name}</h4>
                      <span className="text-sm text-gray-400">{project.tasks}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${project.completion}%`,
                            backgroundColor: project.completion >= 80 ? '#10b981' : 
                                           project.completion >= 60 ? '#f59e0b' : 
                                           project.completion >= 40 ? '#3b82f6' : '#ef4444'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white min-w-[3rem]">
                        {project.completion}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleExport}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            📊 Exporter Rapport
          </button>
          <button 
            onClick={loadAnalyticsData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🔄 Actualiser Données
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
