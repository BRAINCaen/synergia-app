import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées pour les graphiques
      const mockData = {
        productivity: {
          daily: [
            { day: 'Lun', tasks: 8, xp: 180, hours: 7.5 },
            { day: 'Mar', tasks: 12, xp: 240, hours: 8.2 },
            { day: 'Mer', tasks: 6, xp: 120, hours: 6.8 },
            { day: 'Jeu', tasks: 15, xp: 320, hours: 9.1 },
            { day: 'Ven', tasks: 10, xp: 200, hours: 7.9 },
            { day: 'Sam', tasks: 4, xp: 80, hours: 4.2 },
            { day: 'Dim', tasks: 2, xp: 40, hours: 2.1 }
          ],
          monthly: [
            { month: 'Jan', tasks: 156, xp: 3120, projects: 4 },
            { month: 'Fév', tasks: 142, xp: 2840, projects: 3 },
            { month: 'Mar', tasks: 189, xp: 3780, projects: 5 },
            { month: 'Avr', tasks: 167, xp: 3340, projects: 4 },
            { month: 'Mai', tasks: 201, xp: 4020, projects: 6 },
            { month: 'Juin', tasks: 178, xp: 3560, projects: 5 }
          ]
        },
        projects: [
          { name: 'Synergia v4.0', completion: 65, xp: 1200, status: 'active' },
          { name: 'Formation Équipe', completion: 30, xp: 450, status: 'active' },
          { name: 'Migration DB', completion: 100, xp: 2000, status: 'completed' },
          { name: 'Refonte UI/UX', completion: 5, xp: 80, status: 'planning' }
        ],
        team: {
          totalMembers: 8,
          activeToday: 6,
          avgProductivity: 87,
          topPerformers: [
            { name: 'Alice', xp: 2340, level: 6, avatar: '👩‍💼' },
            { name: 'Bob', xp: 2120, level: 5, avatar: '👨‍💻' },
            { name: 'Claire', xp: 1980, level: 5, avatar: '👩‍🎨' }
          ]
        },
        insights: [
          {
            type: 'success',
            title: 'Productivité excellente',
            description: 'Votre productivité a augmenté de 23% cette semaine',
            icon: '📈'
          },
          {
            type: 'warning',
            title: 'Projet en retard',
            description: 'Formation Équipe nécessite une attention particulière',
            icon: '⚠️'
          },
          {
            type: 'info',
            title: 'Nouveau badge disponible',
            description: 'Vous êtes proche du badge "Expert Collaborateur"',
            icon: '🏆'
          }
        ]
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  // Composant graphique simple (ASCII-style)
  const SimpleBarChart = ({ data, dataKey, title, color = 'blue' }) => {
    const maxValue = Math.max(...data.map(item => item[dataKey]));
    
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">{title}</h3>
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = (item[dataKey] / maxValue) * 100;
            return (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm w-8">{item.day || item.month}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                  <div
                    className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-6 rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {item[dataKey]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec contrôles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Analytics & Métriques</h1>
            <p className="text-gray-400">Analyse de performance et insights de productivité</p>
          </div>
          <div className="flex items-center space-x-2">
            {[
              { key: '7d', label: '7 jours' },
              { key: '30d', label: '30 jours' },
              { key: '3m', label: '3 mois' },
              { key: '1y', label: '1 an' }
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">XP Total</h3>
                <p className="text-3xl font-bold">2,340</p>
                <p className="text-sm opacity-75">+12% vs semaine dernière</p>
              </div>
              <span className="text-4xl">💎</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Tâches Terminées</h3>
                <p className="text-3xl font-bold">57</p>
                <p className="text-sm opacity-75">+8 depuis hier</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Niveau Actuel</h3>
                <p className="text-3xl font-bold">6</p>
                <p className="text-sm opacity-75">340 XP pour niveau 7</p>
              </div>
              <span className="text-4xl">⭐</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Projets Actifs</h3>
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm opacity-75">1 terminé ce mois</p>
              </div>
              <span className="text-4xl">📁</span>
            </div>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleBarChart
            data={analyticsData.productivity.daily}
            dataKey="tasks"
            title="📋 Tâches Complétées (7 derniers jours)"
            color="blue"
          />
          <SimpleBarChart
            data={analyticsData.productivity.daily}
            dataKey="xp"
            title="💎 XP Gagnés par Jour"
            color="purple"
          />
        </div>

        {/* Performance des projets */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">📊 Performance des Projets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.projects.map((project, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'completed' ? 'Terminé' :
                     project.status === 'active' ? 'Actif' : 'Planning'}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progression</span>
                    <span>{project.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${project.completion}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">XP Gagné</span>
                  <span className="text-white font-medium">{project.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights et Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">💡 Insights Intelligents</h2>
            <div className="space-y-4">
              {analyticsData.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'bg-green-900/20 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                  'bg-blue-900/20 border-blue-500'
                }`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                      <p className="text-gray-400 text-sm">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">🏆 Top Performers</h2>
            <div className="space-y-4">
              {analyticsData.team.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white text-lg">
                    {performer.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">{performer.name}</h3>
                      <span className="text-yellow-400 text-sm">Niveau {performer.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{performer.xp} XP</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">👥 Statistiques Équipe</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Membres total</span>
                  <p className="text-white font-bold">{analyticsData.team.totalMembers}</p>
                </div>
                <div>
                  <span className="text-gray-400">Actifs aujourd'hui</span>
                  <p className="text-white font-bold">{analyticsData.team.activeToday}</p>
                </div>
                <div>
                  <span className="text-gray-400">Productivité moy.</span>
                  <p className="text-white font-bold">{analyticsData.team.avgProductivity}%</p>
                </div>
                <div>
                  <span className="text-gray-400">XP Équipe</span>
                  <p className="text-white font-bold">12,450</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note développement */}
        <div className="mt-8 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🔧</span>
            <h2 className="text-xl font-semibold text-white">Analytics en Développement</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Cette page utilise des données simulées pour démonstration. 
            Le système Firebase et de gamification collecte déjà vos vraies données !
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-2xl block mb-1">📈</span>
              <span className="text-white text-sm">Graphiques Temps Réel</span>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-2xl block mb-1">🤖</span>
              <span className="text-white text-sm">IA Prédictive</span>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-2xl block mb-1">📊</span>
              <span className="text-white text-sm">Export Rapports</span>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-2xl block mb-1">🎯</span>
              <span className="text-white text-sm">Objectifs Personnalisés</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
