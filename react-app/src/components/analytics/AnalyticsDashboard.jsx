// ==========================================
// 📁 react-app/src/components/analytics/AnalyticsDashboard.jsx
// Dashboard Analytics CORRIGÉ - Version fonctionnelle
// ==========================================

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

// ✅ IMPORTS CORRIGÉS
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
      setLoading(false);
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
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
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

  // Couleurs pour les graphiques
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header avec contrôles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">📊 Analytics</h1>
            <p className="text-gray-400 mt-1">Tableau de bord des performances</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500"
            >
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
            </select>
            
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📤 Exporter
            </button>
            
            <button 
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tâches totales"
            value={metrics.totalTasks}
            icon="📋"
            color="blue"
            subtitle={`${metrics.completedTasks} terminées`}
          />
          <MetricCard
            title="Projets actifs"
            value={metrics.activeProjects}
            icon="🚀"
            color="green"
            subtitle={`${metrics.totalProjects} au total`}
          />
          <MetricCard
            title="XP total"
            value={metrics.totalXP}
            icon="⭐"
            color="purple"
            subtitle={`${metrics.potentialXP} possible`}
          />
          <MetricCard
            title="Taux de completion"
            value={`${metrics.completionRate}%`}
            icon="🎯"
            color="orange"
            subtitle={`Streak: ${metrics.streak} jours`}
          />
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Progression dans le temps */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📈 Progression temporelle</h3>
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Aucune donnée de progression
              </div>
            )}
          </div>

          {/* Distribution des tâches */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🍰 Distribution par statut</h3>
            {tasksDistribution.byStatus && tasksDistribution.byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tasksDistribution.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksDistribution.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Aucune donnée de distribution
              </div>
            )}
          </div>
        </div>

        {/* Vélocité et projets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Vélocité hebdomadaire */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">⚡ Vélocité hebdomadaire</h3>
            {velocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={velocityData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="tasksCompleted" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Aucune donnée de vélocité
              </div>
            )}
          </div>

          {/* Progression des projets */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Progression des projets</h3>
            {projectsProgress.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {projectsProgress.slice(0, 5).map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{project.title}</h4>
                      <p className="text-xs text-gray-400">
                        {project.tasksCompleted}/{project.tasksTotal} tâches • {project.xpEarned} XP
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
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
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Aucun projet disponible
              </div>
            )}
          </div>
        </div>

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
