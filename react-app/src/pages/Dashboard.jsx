// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard principal Synergia CORRIGÉ - Sans erreurs calculations
// ==========================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameService } from '../shared/hooks/useGameService';
import teamService from '../core/services/teamService';

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

  // ✅ Chargement des données équipe
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const stats = await teamService.getTeamStats();
        setTeamStats(stats);
        
        // Générer activité récente
        setRecentActivity([
          {
            id: 1,
            type: 'task_completed',
            message: 'Tâche complétée',
            time: new Date().toISOString(),
            xp: 40
          },
          {
            id: 2,
            type: 'daily_login',
            message: 'Connexion quotidienne',
            time: new Date().toISOString(),
            xp: 10
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
              Bienvenue dans Synergia ! 🚀
            </h1>
            <p className="text-blue-100">
              Votre plateforme collaborative avec gamification
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Connecté en tant que: {user?.email || 'Utilisateur'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Niveau {userLevel}</div>
            <div className="text-blue-200">{userXP.toLocaleString()} XP</div>
            {totalBadges > 0 && (
              <div className="text-yellow-300 text-sm">🏆 {totalBadges} badges</div>
            )}
          </div>
        </div>
        
        {/* Barre de progression niveau */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-blue-200 mb-1">
            <span>Progression vers niveau {userLevel + 1}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Statut de connexion */}
      {!isConnected && (
        <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-orange-400 font-semibold">Mode Développement</h3>
              <p className="text-orange-300 text-sm">
                Application en cours de développement - Certaines données sont simulées
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">{userLevel}</div>
              <div className="text-gray-400 text-sm">Niveau Actuel</div>
            </div>
            <div className="text-blue-500 text-2xl">📈</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">{userXP.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Points XP</div>
            </div>
            <div className="text-green-500 text-2xl">⭐</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">{tasksCompleted}</div>
              <div className="text-gray-400 text-sm">Tâches Complétées</div>
            </div>
            <div className="text-purple-500 text-2xl">✅</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-400">{totalBadges}</div>
              <div className="text-gray-400 text-sm">Badges Débloqués</div>
            </div>
            <div className="text-yellow-500 text-2xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Statistiques équipe */}
      {teamStats && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">👥 Aperçu Équipe</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{teamStats.totalMembers}</div>
              <div className="text-gray-400 text-sm">Membres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{teamStats.activeMembers}</div>
              <div className="text-gray-400 text-sm">Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{teamStats.totalTasks}</div>
              <div className="text-gray-400 text-sm">Tâches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{teamStats.completionRate}%</div>
              <div className="text-gray-400 text-sm">Réussite</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎯 Actions Rapides</h3>
          <div className="space-y-3">
            <Link 
              to="/tasks"
              className="block bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>📝 Gérer mes Tâches</span>
                <span>→</span>
              </div>
            </Link>
            
            <Link 
              to="/projects"
              className="block bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>📋 Mes Projets</span>
                <span>→</span>
              </div>
            </Link>
            
            <Link 
              to="/leaderboard"
              className="block bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>🏆 Classement</span>
                <span>→</span>
              </div>
            </Link>
            
            <Link 
              to="/team"
              className="block bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>👥 Dashboard Équipe</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Activité Récente</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="text-white text-sm">{activity.message}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(activity.time).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-green-400 font-medium">+{activity.xp} XP</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                Aucune activité récente
              </div>
            )}
            
            <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 Complétez des tâches pour gagner de l'XP et monter de niveau !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section gamification */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">🎮 Progression Gamification</h3>
            <p className="text-purple-100">
              Continuez à compléter des tâches et à collaborer pour débloquer de nouveaux badges !
            </p>
          </div>
          <div className="text-right">
            <Link 
              to="/profile"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Voir Profil →
            </Link>
          </div>
        </div>
        
        {gameData?.badges && gameData.badges.length > 0 && (
          <div className="mt-4 flex gap-2">
            {gameData.badges.slice(0, 5).map((badge, index) => (
              <div key={index} className="bg-white/20 rounded-full p-2 text-xl">
                🏆
              </div>
            ))}
            {gameData.badges.length > 5 && (
              <div className="bg-white/20 rounded-full p-2 text-sm">
                +{gameData.badges.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
