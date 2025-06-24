// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard principal Synergia CORRIGÉ - Affichage complet
// ==========================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameService } from '../shared/hooks/useGameService';
import teamService from '../core/services/teamService';

// Icons
import { FaTasks, FaProjectDiagram, FaTrophy, FaChartLine, FaUsers, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    gameData, 
    derivedStats,
    isLoading, 
    error, 
    isConnected,
    addXP,
    completeTask
  } = useGameService(user?.uid || 'demo-user');

  const [teamStats, setTeamStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    teamMembers: 1
  });

  // ✅ Chargement des données équipe et statistiques
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const stats = await teamService.getTeamStats();
        setTeamStats(stats);
        
        // Simuler des stats rapides (à remplacer par vraies données)
        setQuickStats({
          totalTasks: 24,
          completedTasks: 18,
          activeProjects: 5,
          teamMembers: 3
        });
        
        // Générer activité récente
        setRecentActivity([
          {
            id: 1,
            type: 'task_completed',
            message: 'Tâche "Développement dashboard" complétée',
            time: new Date().toISOString(),
            xp: 40,
            icon: '✅'
          },
          {
            id: 2,
            type: 'project_created',
            message: 'Nouveau projet "Synergia v3.4" créé',
            time: new Date(Date.now() - 3600000).toISOString(),
            xp: 0,
            icon: '📁'
          },
          {
            id: 3,
            type: 'daily_login',
            message: 'Connexion quotidienne',
            time: new Date(Date.now() - 7200000).toISOString(),
            xp: 10,
            icon: '🎯'
          }
        ]);
      } catch (error) {
        console.error('❌ Erreur chargement dashboard:', error);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-white">Chargement de votre dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
        <h2 className="text-red-400 text-xl font-semibold mb-2">❌ Erreur</h2>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  // ✅ Données sécurisées avec fallback
  const userLevel = derivedStats?.currentLevel || gameData?.level || 1;
  const userXP = derivedStats?.currentXP || gameData?.xp || 0;
  const tasksCompleted = derivedStats?.tasksCompleted || gameData?.tasksCompleted || 0;
  const progressPercentage = derivedStats?.progressPercentage || 0;
  const totalBadges = derivedStats?.totalBadges || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue dans Synergia ! 👋
            </h1>
            <p className="text-blue-100">
              {user?.displayName || 'Utilisateur'} • Niveau {userLevel} • {userXP} XP
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{tasksCompleted}</div>
            <div className="text-blue-200">Tâches complétées</div>
          </div>
        </div>
        
        {/* Barre de progression XP */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-blue-200 mb-1">
            <span>Progression vers niveau {userLevel + 1}</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-blue-700/30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/tasks" className="group">
          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tâches</p>
                <p className="text-2xl font-bold text-white">
                  {quickStats.completedTasks}/{quickStats.totalTasks}
                </p>
              </div>
              <FaTasks className="text-blue-500 text-2xl group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </Link>

        <Link to="/projects" className="group">
          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projets Actifs</p>
                <p className="text-2xl font-bold text-white">{quickStats.activeProjects}</p>
              </div>
              <FaProjectDiagram className="text-green-500 text-2xl group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </Link>

        <Link to="/leaderboard" className="group">
          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Niveau</p>
                <p className="text-2xl font-bold text-white">{userLevel}</p>
              </div>
              <FaTrophy className="text-yellow-500 text-2xl group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </Link>

        <Link to="/analytics" className="group">
          <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">XP Total</p>
                <p className="text-2xl font-bold text-white">{userXP}</p>
              </div>
              <FaChartLine className="text-purple-500 text-2xl group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Section Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Actions Rapides */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaPlus className="mr-2 text-green-500" />
            Actions Rapides
          </h2>
          <div className="space-y-3">
            <Link 
              to="/tasks?action=create" 
              className="flex items-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <FaTasks className="mr-3" />
              <span>Créer une nouvelle tâche</span>
            </Link>
            <Link 
              to="/projects?action=create" 
              className="flex items-center p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
            >
              <FaProjectDiagram className="mr-3" />
              <span>Démarrer un nouveau projet</span>
            </Link>
            <Link 
              to="/team" 
              className="flex items-center p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              <FaUsers className="mr-3" />
              <span>Inviter des membres</span>
            </Link>
          </div>
        </div>

        {/* Activité Récente */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Activité Récente</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-2xl mr-3">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(activity.time).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {activity.xp > 0 && (
                  <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                    +{activity.xp} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Progression et Badges */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Progression & Réalisations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Badges */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Badges</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Badge Premier Pas */}
              <div className="bg-yellow-600 rounded-lg p-3 text-center">
                <div className="text-2xl">🏆</div>
                <div className="text-xs text-white">Premier Pas</div>
              </div>
              
              {/* Badge Productif */}
              <div className="bg-blue-600 rounded-lg p-3 text-center">
                <div className="text-2xl">⚡</div>
                <div className="text-xs text-white">Productif</div>
              </div>
              
              {/* Badge à débloquer */}
              <div className="bg-gray-600 rounded-lg p-3 text-center opacity-50">
                <div className="text-2xl">🎯</div>
                <div className="text-xs text-gray-300">À débloquer</div>
              </div>
            </div>
          </div>

          {/* Objectifs du jour */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Objectifs du jour</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Se connecter ✅</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Compléter 3 tâches</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Créer un projet</span>
              </div>
            </div>
          </div>

          {/* Statistiques équipe */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Équipe</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Membres actifs</span>
                <span className="text-sm text-white">{quickStats.teamMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Tâches partagées</span>
                <span className="text-sm text-white">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Projets collaboratifs</span>
                <span className="text-sm text-white">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status de connexion */}
      {isConnected && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm">Synchronisation active avec Firebase</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
