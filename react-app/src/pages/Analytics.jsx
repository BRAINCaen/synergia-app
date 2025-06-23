// react-app/src/pages/Analytics.jsx
// VERSION CORRIGÉE - Imports fixes pour build Netlify
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const Analytics = () => {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  const { stats } = useGameStore();
  
  const [timeFilter, setTimeFilter] = useState('7days');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calcul des analytics en temps réel
  useEffect(() => {
    const calculateAnalytics = () => {
      try {
        const now = new Date();
        const filterDays = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 365;
        const startDate = new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000);

        // Filtrer les tâches par période
        const filteredTasks = tasks.filter(task => {
          const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
          return taskDate >= startDate;
        });

        const completedTasks = filteredTasks.filter(task => task.completed);
        const pendingTasks = filteredTasks.filter(task => !task.completed);
        
        // Métriques principales
        const metrics = {
          totalTasks: filteredTasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          completionRate: filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0,
          totalXP: stats.totalXP || 0,
          currentLevel: stats.level || 1,
          weeklyXP: 0 // À calculer selon vos besoins
        };

        // Distribution par priorité
        const priorityDistribution = {
          low: filteredTasks.filter(t => t.priority === 'low').length,
          medium: filteredTasks.filter(t => t.priority === 'medium').length,
          high: filteredTasks.filter(t => t.priority === 'high').length,
          urgent: filteredTasks.filter(t => t.priority === 'urgent').length
        };

        // Progression par jour (7 derniers jours)
        const dailyProgress = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayTasks = completedTasks.filter(task => {
            const taskDate = new Date(task.completedAt);
            return taskDate.toDateString() === date.toDateString();
          });
          
          dailyProgress.push({
            date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            completed: dayTasks.length,
            xp: dayTasks.reduce((sum, task) => sum + (task.xpEarned || 20), 0)
          });
        }

        setAnalytics({
          metrics,
          priorityDistribution,
          dailyProgress
        });
      } catch (error) {
        console.error('❌ Erreur calcul analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
  }, [tasks, timeFilter, stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Calcul des analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400">Aucune donnée analytics disponible</p>
        </div>
      </div>
    );
  }

  const { metrics, priorityDistribution, dailyProgress } = analytics;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📈 Analytics Dashboard
            </h1>
            <p className="text-gray-400">
              Analyses et métriques de votre productivité
            </p>
          </div>
          
          {/* Filtre temporel */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { value: '7days', label: '7 jours' },
              { value: '30days', label: '30 jours' },
              { value: '1year', label: '1 an' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFilter(option.value)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  timeFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tâches Total</h3>
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {metrics.totalTasks}
            </div>
            <p className="text-gray-400 text-sm">
              {metrics.completedTasks} complétées
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Taux Complétion</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {metrics.completionRate}%
            </div>
            <p className="text-gray-400 text-sm">
              {metrics.pendingTasks} en attente
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">XP Total</h3>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {metrics.totalXP}
            </div>
            <p className="text-gray-400 text-sm">
              Niveau {metrics.currentLevel}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Productivité</h3>
              <span className="text-2xl">🚀</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {Math.round(metrics.completedTasks / Math.max(1, timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 365))}
            </div>
            <p className="text-gray-400 text-sm">
              tâches/jour moyenne
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Progression quotidienne */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">
              📊 Progression Quotidienne
            </h3>
            <div className="space-y-4">
              {dailyProgress.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 w-12">{day.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (day.completed / Math.max(1, Math.max(...dailyProgress.map(d => d.completed)))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white font-medium w-8 text-right">
                    {day.completed}
                  </span>
                  <span className="text-purple-400 text-sm ml-2 w-12 text-right">
                    +{day.xp}XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution priorités */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">
              🎯 Distribution par Priorité
            </h3>
            <div className="space-y-4">
              {[
                { key: 'urgent', label: 'Urgent', color: 'bg-red-500', count: priorityDistribution.urgent },
                { key: 'high', label: 'Haute', color: 'bg-orange-500', count: priorityDistribution.high },
                { key: 'medium', label: 'Moyenne', color: 'bg-yellow-500', count: priorityDistribution.medium },
                { key: 'low', label: 'Basse', color: 'bg-green-500', count: priorityDistribution.low }
              ].map((priority) => (
                <div key={priority.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${priority.color}`}></div>
                    <span className="text-gray-300">{priority.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-700 rounded-full h-2 w-24">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${priority.color}`}
                        style={{ width: `${Math.min(100, (priority.count / Math.max(1, metrics.totalTasks)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-8 text-right">
                      {priority.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            ⚡ Actions Rapides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-900/30 border border-blue-700 rounded-lg hover:bg-blue-900/50 transition-colors">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="text-blue-400 font-medium">Export Données</p>
                <p className="text-gray-400 text-sm">Télécharger en CSV</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-purple-900/30 border border-purple-700 rounded-lg hover:bg-purple-900/50 transition-colors">
              <span className="text-2xl">📈</span>
              <div className="text-left">
                <p className="text-purple-400 font-medium">Rapport Détaillé</p>
                <p className="text-gray-400 text-sm">Analyse complète</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-green-900/30 border border-green-700 rounded-lg hover:bg-green-900/50 transition-colors">
              <span className="text-2xl">🎯</span>
              <div className="text-left">
                <p className="text-green-400 font-medium">Objectifs</p>
                <p className="text-gray-400 text-sm">Définir cibles</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer analytics */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Données mises à jour en temps réel • Utilisateur: {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
