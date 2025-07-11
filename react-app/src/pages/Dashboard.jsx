// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD PRINCIPAL AVEC TEST ESCAPE PROGRESSION
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Trophy,
  Rocket,
  Star,
  ChevronRight,
  Play,
  Calendar,
  BarChart3,
  Target,
  Award,
  Clock
} from 'lucide-react';

// Import du composant test
const EscapeProgressionTest = () => {
  const navigate = useNavigate();

  const handleNavigateToEscape = () => {
    navigate('/escape-progression');
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Rocket size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">🚀 Nouvelle Page Escape Progression</h3>
            <p className="text-purple-100 mt-1">
              Page avec les 9 vrais rôles escape game créée !
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle size={16} />
                <span>9 Rôles Authentiques</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                <span>Système de Progression</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} />
                <span>Interface Interactive</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleNavigateToEscape}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 
                     rounded-lg px-6 py-3 font-medium transition-all duration-200
                     flex items-center gap-2 hover:scale-105"
        >
          <Play size={20} />
          Tester la Page
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <h4 className="font-medium mb-2">🎯 Fonctionnalités disponibles :</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>9 Rôles Escape Game</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Progression par Niveau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Simulation de Données</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Modal de Détail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Compétences & Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Interface Responsive</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-medium">URL directe :</span>
          <code className="bg-black/20 px-2 py-1 rounded text-xs">
            /escape-progression
          </code>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    teamMembers: 0
  });

  const userId = user?.uid || user?.id || 'user-demo';

  useEffect(() => {
    // Simuler le chargement des statistiques
    setStats({
      totalTasks: 127,
      completedTasks: 89,
      totalProjects: 8,
      teamMembers: 12
    });
  }, []);

  const quickActions = [
    {
      title: 'Créer une Tâche',
      description: 'Ajouter une nouvelle tâche',
      icon: Target,
      color: 'bg-blue-500',
      action: () => navigate('/tasks')
    },
    {
      title: 'Voir les Projets',
      description: 'Gérer vos projets',
      icon: BarChart3,
      color: 'bg-green-500',
      action: () => navigate('/projects')
    },
    {
      title: 'Analytics',
      description: 'Voir les statistiques',
      icon: TrendingUp,
      color: 'bg-purple-500',
      action: () => navigate('/analytics')
    },
    {
      title: 'Badges',
      description: 'Vos accomplissements',
      icon: Award,
      color: 'bg-yellow-500',
      action: () => navigate('/badges')
    }
  ];

  const recentActivities = [
    { text: 'Nouvelle tâche créée: "Optimiser interface"', time: 'il y a 2h', icon: Target },
    { text: 'Badge obtenu: "Producteur de contenu"', time: 'il y a 4h', icon: Trophy },
    { text: 'Projet complété: "Migration v3.5"', time: 'il y a 1 jour', icon: CheckCircle },
    { text: 'Équipe mise à jour', time: 'il y a 2 jours', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header du Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenue sur Synergia ! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de votre activité
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Nouveau Composant Test Escape Progression */}
      <EscapeProgressionTest />

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tâches Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Équipe</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.teamMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-1 bg-gray-100 rounded-full">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statut de l'application */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Statut Synergia v3.5
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">13</div>
            <div className="text-sm opacity-90">Pages créées</div>
          </div>
          <div>
            <div className="text-3xl font-bold">95%</div>
            <div className="text-sm opacity-90">Complétude</div>
          </div>
          <div>
            <div className="text-3xl font-bold">60+</div>
            <div className="text-sm opacity-90">Badges disponibles</div>
          </div>
          <div>
            <div className="text-3xl font-bold">100%</div>
            <div className="text-sm opacity-90">Services actifs</div>
          </div>
        </div>
      </div>

      {/* Debug info technique */}
      <div className="bg-gray-100 rounded-lg p-4">
        <details className="cursor-pointer">
          <summary className="font-medium text-gray-700 hover:text-gray-900">
            🔧 Informations techniques (cliquer pour développer)
          </summary>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p><strong>User ID:</strong> {userId}</p>
            <p><strong>URL actuelle:</strong> {window.location.href}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            <p><strong>AuthStore State:</strong> {JSON.stringify({
              isAuthenticated: !!user,
              hasUser: !!user,
              loading: false
            })}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Dashboard;
