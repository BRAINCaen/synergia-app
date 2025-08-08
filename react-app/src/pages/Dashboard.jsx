// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC BOUTON DE NETTOYAGE DÉMO POUR ADMIN
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import DemoCleanerButton from '../components/admin/DemoCleanerButton.jsx';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalProjects: 0
  });

  // Données simulées pour la démonstration
  useEffect(() => {
    // Simuler le chargement des statistiques
    setTimeout(() => {
      setStats({
        totalTasks: 12,
        completedTasks: 8,
        pendingTasks: 4,
        totalProjects: 3
      });
    }, 1000);
  }, []);

  const quickActions = [
    { 
      title: 'Créer une tâche', 
      icon: '✅', 
      action: () => window.location.href = '/tasks',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Nouveau projet', 
      icon: '📁', 
      action: () => window.location.href = '/projects',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'Voir les badges', 
      icon: '🏆', 
      action: () => window.location.href = '/badges',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      title: 'Analytics', 
      icon: '📊', 
      action: () => window.location.href = '/analytics',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header avec salutation */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} 👋
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre activité sur Synergia
          </p>
        </div>

        {/* Section Admin - Nettoyage des données démo */}
        {isAdmin(user) && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🛡️</span> Administration
              </h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-yellow-800 mb-2">
                  🧹 Nettoyage des données de démonstration
                </h3>
                <p className="text-yellow-700 text-sm mb-3">
                  Des tâches de démonstration ont été détectées dans votre système (tâches assignées à 28 personnes, etc.). 
                  Utilisez l'outil de nettoyage pour supprimer ces données factices.
                </p>
                
                <DemoCleanerButton className="mb-2" />
              </div>

              {/* Liens admin rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => window.location.href = '/admin/task-validation'}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-1">🛡️</div>
                  <div className="text-sm font-medium">Validation</div>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin/users'}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-sm font-medium">Utilisateurs</div>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin/analytics'}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-1">📈</div>
                  <div className="text-sm font-medium">Analytics</div>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin/settings'}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-1">⚙️</div>
                  <div className="text-sm font-medium">Paramètres</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des tâches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tâches terminées</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-green-600 text-xl">🎉</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="text-orange-600 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-purple-600 text-xl">📁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🚀 Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg transition-colors text-center`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-medium">{action.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tâches récentes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Tâches récentes</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-green-500">✅</span>
                <div className="flex-1">
                  <p className="font-medium">Finaliser le rapport mensuel</p>
                  <p className="text-sm text-gray-600">Terminée il y a 2 heures</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-500">🔄</span>
                <div className="flex-1">
                  <p className="font-medium">Révision du code frontend</p>
                  <p className="text-sm text-gray-600">En cours</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-orange-500">⏳</span>
                <div className="flex-1">
                  <p className="font-medium">Planifier la réunion équipe</p>
                  <p className="text-sm text-gray-600">À faire</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.href = '/tasks'}
              className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir toutes les tâches →
            </button>
          </div>

          {/* Gamification */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">🎮 Progression</h2>
            
            {/* Niveau actuel */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Niveau 3 - Compétent</span>
                <span className="text-sm text-gray-600">250 / 500 XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-1/2"></div>
              </div>
            </div>

            {/* Badges récents */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">🏆 Badges récents</h3>
              <div className="flex gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg text-center">
                  <div className="text-2xl">🎯</div>
                  <div className="text-xs">Productif</div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg text-center">
                  <div className="text-2xl">🤝</div>
                  <div className="text-xs">Collaboratif</div>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-center">
                  <div className="text-2xl">🚀</div>
                  <div className="text-xs">Innovant</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/gamification'}
              className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Voir ma progression →
            </button>
          </div>
        </div>

        {/* Liens rapides en bas */}
        <div className="mt-8 text-center">
          <div className="inline-flex gap-4 text-sm text-gray-600">
            <button 
              onClick={() => window.location.href = '/team'}
              className="hover:text-blue-600"
            >
              👥 Mon équipe
            </button>
            <button 
              onClick={() => window.location.href = '/analytics'}
              className="hover:text-blue-600"
            >
              📊 Analytics
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="hover:text-blue-600"
            >
              👤 Mon profil
            </button>
            <button 
              onClick={() => window.location.href = '/settings'}
              className="hover:text-blue-600"
            >
              ⚙️ Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
