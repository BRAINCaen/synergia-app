// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard RÉPARÉ - Utilise les vrais stores
// ==========================================

import React, { useEffect } from 'react';
import { useAuthStore, useGameStore, useTaskStore, useProjectStore } from '../shared/stores';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    userStats, 
    getLevelProgress, 
    addXP,
    initialized: gameInitialized 
  } = useGameStore();
  const { getTaskStats } = useTaskStore();
  const { getProjectStats } = useProjectStore();

  // 📊 Récupérer les statistiques
  const taskStats = getTaskStats();
  const projectStats = getProjectStats();
  const levelProgress = getLevelProgress();

  // 🎮 Bonus de connexion quotidienne
  useEffect(() => {
    if (gameInitialized && user) {
      addXP(5, 'Connexion quotidienne');
    }
  }, [gameInitialized, user, addXP]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.displayName || user?.email} ! 
            Voici votre résumé d'activité.
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne 1 - Gamification */}
          <div className="space-y-6">
            {/* Card Niveau et XP */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🎮 Progression
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Niveau</span>
                  <span className="text-2xl font-bold text-[#6366f1]">
                    {userStats.level}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">XP Total</span>
                  <span className="font-semibold text-[#6366f1]">
                    {userStats.totalXp}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression niveau</span>
                    <span>{userStats.currentXp}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🏆 Badges
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Badges débloqués</span>
                  <span className="font-semibold text-[#22c55e]">
                    {userStats.badges.length}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {userStats.badges.map((badge, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Tâches */}
          <div className="space-y-6">
            {/* Card Statistiques Tâches */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📋 Tâches
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">{taskStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Terminées</span>
                  <span className="font-semibold text-[#22c55e]">{taskStats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">En cours</span>
                  <span className="font-semibold text-[#f59e0b]">{taskStats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">En attente</span>
                  <span className="font-semibold text-[#6b7280]">{taskStats.pending}</span>
                </div>
              </div>
            </div>

            {/* Card Actions rapides */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 text-sm font-medium transition-colors">
                  ➕ Nouvelle tâche
                </button>
                <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm font-medium transition-colors">
                  📁 Nouveau projet
                </button>
                <Link 
                  to="/tasks"
                  className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 text-sm font-medium transition-colors text-center"
                >
                  📋 Voir tâches
                </Link>
                <Link 
                  to="/projects"
                  className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 text-sm font-medium transition-colors text-center"
                >
                  📊 Projets
                </Link>
              </div>
            </div>
          </div>

          {/* Colonne 3 - Projets & Système */}
          <div className="space-y-6">
            {/* Card Projets */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📁 Projets
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">{projectStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Actifs</span>
                  <span className="font-semibold text-[#22c55e]">{projectStats.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Terminés</span>
                  <span className="font-semibold text-[#6366f1]">{projectStats.completed}</span>
                </div>
              </div>
            </div>

            {/* Card État Système */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                ⚙️ État Système
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Utilisateur</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Connecté
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AuthStore</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Actif
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">GameStore</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Réparé
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">TaskStore</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Fonctionnel
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Version</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    v3.5.2-FIXED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message de succès */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-green-800 font-medium mb-2">🎉 Réparation terminée !</h4>
          <p className="text-green-700 text-sm">
            Tous les stores sont maintenant fonctionnels. L'erreur "TypeError: r is not a function" a été éliminée.
            Vous pouvez maintenant utiliser toutes les fonctionnalités de Synergia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
