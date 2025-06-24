// src/pages/Dashboard.jsx
// Dashboard principal sans la section d'invitation (connexion Google automatique)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameStore } from '../shared/stores/gameStore';
import { useRealTimeUser } from '../shared/hooks/useRealTimeUser';
import { 
  FaTasks, 
  FaProjectDiagram, 
  FaTrophy, 
  FaChartLine, 
  FaPlus,
  FaFire,
  FaStar,
  FaUsers,
  FaCalendar,
  FaCog
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();
  const { userData } = useRealTimeUser();
  
  // États locaux
  const [isConnected, setIsConnected] = useState(true);

  // Données dérivées pour l'affichage
  const userLevel = userStats?.level || 1;
  const userXP = userStats?.totalXp || 0;
  const tasksCompleted = userStats?.tasksCompleted || 0;
  const loginStreak = userStats?.loginStreak || 0;

  // Statistiques rapides pour le dashboard
  const quickStats = {
    activeTasks: 3, // Serait récupéré d'un service
    activeProjects: 2,
    teamMembers: 8
  };

  // Activité récente (simulée pour l'instant)
  const recentActivity = [
    {
      id: 1,
      icon: '✅',
      message: 'Tâche "Révision documentation" complétée',
      time: new Date(Date.now() - 2 * 60 * 1000),
      xp: 20
    },
    {
      id: 2,
      icon: '🚀',
      message: 'Nouveau projet "Migration API" créé',
      time: new Date(Date.now() - 15 * 60 * 1000),
      xp: 25
    },
    {
      id: 3,
      icon: '🏆',
      message: 'Badge "Productivité" débloqué',
      time: new Date(Date.now() - 30 * 60 * 1000),
      xp: 50
    },
    {
      id: 4,
      icon: '📊',
      message: 'Niveau 5 atteint !',
      time: new Date(Date.now() - 60 * 60 * 1000),
      xp: 0
    }
  ];

  // Calculer le pourcentage de progression du niveau
  const levelProgress = userStats?.levelProgress?.percentage || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec salutation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                👋 Bonjour, {userData?.profile?.displayName || user?.displayName || 'Utilisateur'} !
              </h1>
              <p className="text-gray-400 mt-1">
                Voici un aperçu de votre activité aujourd'hui
              </p>
            </div>
            
            {/* Badge niveau */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-6 py-3">
              <div className="flex items-center gap-3">
                <FaTrophy className="text-yellow-300 text-xl" />
                <div>
                  <p className="text-sm text-gray-200">Niveau</p>
                  <p className="text-xl font-bold text-white">{userLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-200">XP</p>
                  <p className="text-xl font-bold text-white">{userXP.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de progression niveau */}
          {levelProgress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Progression niveau {userLevel}</span>
                <span>{levelProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <Link to="/tasks" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tâches Actives</p>
                  <p className="text-2xl font-bold text-white">{quickStats.activeTasks}</p>
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
                  <p className="text-gray-400 text-sm">Tâches Complétées</p>
                  <p className="text-2xl font-bold text-white">{tasksCompleted}</p>
                </div>
                <FaTrophy className="text-yellow-500 text-2xl group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </Link>

          <Link to="/analytics" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Série de connexions</p>
                  <p className="text-2xl font-bold text-white">{loginStreak}</p>
                </div>
                <FaFire className="text-orange-500 text-2xl group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Section Actions Rapides - SANS invitation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Actions Rapides */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaPlus className="mr-2 text-green-500" />
              Actions Rapides
            </h2>
            <div className="space-y-3">
              <Link 
                to="/tasks?action=create" 
                className="flex items-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors group"
              >
                <FaTasks className="mr-3 group-hover:scale-110 transition-transform" />
                <span>Créer une nouvelle tâche</span>
              </Link>
              <Link 
                to="/projects?action=create" 
                className="flex items-center p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors group"
              >
                <FaProjectDiagram className="mr-3 group-hover:scale-110 transition-transform" />
                <span>Démarrer un nouveau projet</span>
              </Link>
              <Link 
                to="/users" 
                className="flex items-center p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors group"
              >
                <FaUsers className="mr-3 group-hover:scale-110 transition-transform" />
                <span>Voir l'équipe</span>
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
                    <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      +{activity.xp} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section bottom avec informations supplémentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Objectifs du jour */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <FaStar className="mr-2 text-yellow-500" />
              Objectifs du jour
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${tasksCompleted >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <span className={`text-sm ${tasksCompleted >= 1 ? 'text-green-400' : 'text-gray-300'}`}>
                  Compléter 1 tâche {tasksCompleted >= 1 && '✓'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${userXP >= 50 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <span className={`text-sm ${userXP >= 50 ? 'text-green-400' : 'text-gray-300'}`}>
                  Gagner 50 XP {userXP >= 50 && '✓'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${loginStreak >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <span className={`text-sm ${loginStreak >= 3 ? 'text-green-400' : 'text-gray-300'}`}>
                  Maintenir série de 3j {loginStreak >= 3 && '✓'}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques équipe */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-500" />
              Équipe
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Membres connectés</span>
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
              <Link 
                to="/users" 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors inline-flex items-center"
              >
                Voir tous les membres →
              </Link>
            </div>
          </div>

          {/* Accès rapide */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <FaCog className="mr-2 text-gray-500" />
              Accès rapide
            </h3>
            <div className="space-y-3">
              <Link 
                to="/profile" 
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="mr-2">👤</span>
                Mon profil
              </Link>
              <Link 
                to="/analytics" 
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="mr-2">📊</span>
                Mes statistiques
              </Link>
              <Link 
                to="/leaderboard" 
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="mr-2">🏆</span>
                Classement
              </Link>
              <Link 
                to="/users" 
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="mr-2">👥</span>
                Gestion utilisateurs
              </Link>
            </div>
          </div>
        </div>

        {/* Status de connexion */}
        {isConnected && (
          <div className="mt-6 bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <div className="flex items-center text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm">Synchronisation active avec Firebase</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
