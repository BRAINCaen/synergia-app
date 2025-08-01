// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD FONCTIONNEL COMPLET - État qui marchait
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 📊 DASHBOARD PRINCIPAL - Version qui fonctionnait parfaitement
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { gamification, isLoading } = useUnifiedFirebaseData();
  
  // États locaux
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quickStats, setQuickStats] = useState({
    tasksToday: 0,
    xpToday: 0,
    teamRank: 0,
    completionRate: 0
  });
  
  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Calcul des statistiques utilisateur
  const userStats = {
    level: gamification?.level || 1,
    totalXP: gamification?.totalXp || 0,
    currentXP: gamification?.currentXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    badges: gamification?.badges?.length || 0,
    loginStreak: gamification?.loginStreak || 0
  };
  
  // Calcul du progrès vers le niveau suivant
  const xpForNextLevel = userStats.level * 100;
  const xpProgress = Math.round((userStats.currentXP / xpForNextLevel) * 100);
  
  // Navigation rapide
  const quickActions = [
    { name: 'Mes Tâches', href: '/tasks', icon: '✅', color: 'blue', count: 5 },
    { name: 'Projets', href: '/projects', icon: '📁', color: 'green', count: 3 },
    { name: 'Gamification', href: '/gamification', icon: '🎮', color: 'purple', count: userStats.badges },
    { name: 'Analytics', href: '/analytics', icon: '📊', color: 'orange', count: null },
    { name: 'Équipe', href: '/team', icon: '👥', color: 'indigo', count: 8 },
    { name: 'Badges', href: '/badges', icon: '🏆', color: 'yellow', count: userStats.badges }
  ];
  
  // Objectifs récents
  const recentObjectives = [
    {
      id: 1,
      title: 'Compléter 3 tâches aujourd\'hui',
      progress: 67,
      status: 'in_progress',
      reward: '50 XP + Badge Productif'
    },
    {
      id: 2,
      title: 'Gagner 100 XP cette semaine',
      progress: 85,
      status: 'almost_done',
      reward: '100 XP + Badge Hebdomadaire'
    },
    {
      id: 3,
      title: 'Maintenir une série de 7 jours',
      progress: 100,
      status: 'completed',
      reward: '200 XP + Badge Constance'
    }
  ];
  
  // Activité récente
  const recentActivity = [
    { type: 'task_completed', title: 'Tâche "Mise à jour documentation" terminée', time: '15 min', xp: '+25 XP' },
    { type: 'badge_earned', title: 'Badge "Innovateur" débloqué', time: '1h', xp: '+50 XP' },
    { type: 'level_up', title: 'Niveau 5 atteint !', time: '2h', xp: '+100 XP' },
    { type: 'task_assigned', title: 'Nouvelle tâche assignée', time: '3h', xp: '' }
  ];
  
  // Fonction pour obtenir la couleur selon le type d'activité
  const getActivityColor = (type) => {
    const colors = {
      task_completed: 'bg-green-100 text-green-800',
      badge_earned: 'bg-yellow-100 text-yellow-800',
      level_up: 'bg-purple-100 text-purple-800',
      task_assigned: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  
  // Fonction pour obtenir l'icône selon le type d'activité
  const getActivityIcon = (type) => {
    const icons = {
      task_completed: '✅',
      badge_earned: '🏆',
      level_up: '⭐',
      task_assigned: '📋'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👋 Bonjour, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} !
              </h1>
              <p className="text-gray-600 mt-1">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {currentTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                Niveau {userStats.level}
              </div>
              <div className="text-sm text-gray-500">
                {userStats.totalXP} XP total
              </div>
            </div>
          </div>
          
          {/* Barre de progression XP */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progression vers niveau {userStats.level + 1}</span>
              <span>{userStats.currentXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tâches complétées</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.tasksCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges obtenus</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.badges}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Série de connexion</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.loginStreak} jours</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">XP Total</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.totalXP}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation rapide */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🚀 Accès rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="relative group bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-all duration-200 hover:shadow-md"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <div className="text-sm font-medium text-gray-900">{action.name}</div>
                {action.count !== null && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {action.count}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Contenu principal - 2 colonnes */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Objectifs récents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">🎯 Objectifs en cours</h2>
                <Link 
                  to="/gamification" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tous →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentObjectives.map((objective) => (
                  <div 
                    key={objective.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{objective.title}</h3>
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${objective.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${objective.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                        ${objective.status === 'almost_done' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {objective.status === 'completed' ? '✅ Terminé' : ''}
                        {objective.status === 'in_progress' ? '🔄 En cours' : ''}
                        {objective.status === 'almost_done' ? '⚡ Presque fini' : ''}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{objective.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            objective.status === 'completed' ? 'bg-green-500' :
                            objective.progress >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${objective.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      🎁 Récompense : {objective.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Activité récente */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📈 Activité récente</h2>
              
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${getActivityColor(activity.type)}
                    `}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                        {activity.xp && (
                          <span className="text-xs font-medium text-green-600">
                            {activity.xp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link 
                  to="/analytics" 
                  className="text-center block text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir toute l'activité →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions rapides en bas */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-2">🎮 Prêt à gagner plus d'XP ?</h2>
              <p className="text-blue-100">
                Complétez vos objectifs quotidiens et débloquez de nouveaux badges !
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/tasks"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                ✅ Mes Tâches
              </Link>
              <Link
                to="/gamification"
                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🎯 Objectifs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
