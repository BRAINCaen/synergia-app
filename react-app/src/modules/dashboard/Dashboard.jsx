// src/pages/Dashboard.jsx - FICHIER COMPLET AVEC GAMIFICATION
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../core/firebase";
import { doc, getDoc } from "firebase/firestore";
import taskService from "../services/taskService";
import gamificationService from "../services/gamificationService";
import WelcomeWidget from "../modules/dashboard/widgets/WelcomeWidget";

export default function Dashboard({ user, onLogout }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgression, setUserProgression] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Charger en parallèle toutes les données
      await Promise.all([
        loadUserProfile(),
        loadUserProgression(),
        loadRecentTasks(),
        loadTaskStats(),
        loadLeaderboard()
      ]);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const loadUserProgression = async () => {
    try {
      const progression = await gamificationService.getUserProgression(user.uid);
      setUserProgression(progression);
    } catch (error) {
      console.error("Erreur chargement progression:", error);
    }
  };

  const loadRecentTasks = async () => {
    try {
      const tasks = await taskService.getUserTasks(user.uid, { limit: 5 });
      setRecentTasks(tasks.slice(0, 5)); // Limiter à 5 tâches récentes
    } catch (error) {
      console.error("Erreur chargement tâches:", error);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await taskService.getTaskStats(user.uid);
      setTaskStats(stats);
    } catch (error) {
      console.error("Erreur chargement stats tâches:", error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaders = await gamificationService.getLeaderboard(5);
      setLeaderboard(leaders);
    } catch (error) {
      console.error("Erreur chargement leaderboard:", error);
    }
  };

  const handleQuickCompleteTask = async (taskId, taskData) => {
    try {
      const result = await taskService.completeTask(taskId);
      if (result.success) {
        // Recharger les données
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Erreur complétion tâche:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTaskPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-500/20 text-green-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'high': 'bg-orange-500/20 text-orange-400',
      'urgent': 'bg-red-500/20 text-red-400',
      'critical': 'bg-purple-500/20 text-purple-400'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'low': '🔵',
      'medium': '🟡',
      'high': '🟠',
      'urgent': '🔴',
      'critical': '🚨'
    };
    return icons[priority] || icons.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement du dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Modern */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Synergia</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs rounded-full font-medium">
                  v3.0 • Gamifié
                </span>
              </div>
            </div>
            
            {/* Navigation rapide */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/tasks"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span>🎯</span>
                <span>Mes Tâches</span>
              </Link>
              
              <Link 
                to="/leaderboard"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <span>🏆</span>
                <span>Classement</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div className="hidden md:block text-right">
                  <p className="text-white font-medium">
                    {userProfile?.displayName || user.displayName || user.email}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {userProfile?.role === 'admin' ? '👑 Admin' : 
                     userProfile?.role === 'manager' ? '⭐ Manager' : 
                     '👤 Membre'}
                  </p>
                </div>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => { 
                    auth.signOut(); 
                    onLogout(); 
                  }}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Welcome Widget */}
        <div className="mb-8">
          <WelcomeWidget user={user} userProfile={userProfile} />
        </div>

        {/* Progression XP Widget */}
        {userProgression && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between text-white mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Niveau {userProgression.level}</h3>
                  <p className="opacity-90 text-lg">{userProgression.xp} XP</p>
                  {userProgression.rank && (
                    <p className="text-sm opacity-75">🏆 Classement: #{userProgression.rank}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-2">🎮</div>
                  <div className="text-sm opacity-75">{userProgression.badges.length} badges</div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression vers niveau {userProgression.level + 1}</span>
                  <span>{userProgression.progressPercent}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${userProgression.progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {userProgression.xpInCurrentLevel} / {userProgression.xpForNextLevel} XP
                </div>
              </div>
              
              {/* Derniers badges */}
              {userProgression.badges.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm opacity-75">Derniers badges:</span>
                  <div className="flex space-x-2">
                    {userProgression.badges.slice(-3).map((badge, index) => (
                      <div 
                        key={badge.id}
                        className="bg-white/20 rounded px-2 py-1 text-xs flex items-center space-x-1"
                        title={badge.description}
                      >
                        <span>{badge.icon || '🏆'}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Tâches Totales</p>
                <p className="text-2xl font-bold text-blue-400">
                  {taskStats?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Terminées</p>
                <p className="text-2xl font-bold text-green-400">
                  {taskStats?.completed || 0}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">XP Total</p>
                <p className="text-2xl font-bold text-purple-400">
                  {userProgression?.totalXp || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Taux Succès</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {taskStats?.completionRate || 0}%
                </p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tâches Récentes */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="mr-3">🎯</span>
                Tâches Récentes
              </h3>
              <Link 
                to="/tasks"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Voir toutes →
              </Link>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${getTaskPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                          {task.description?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Créée le {new Date(task.createdAt).toLocaleDateString()}</span>
                          <span>+{task.xpReward || 40} XP</span>
                        </div>
                      </div>
                      
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleQuickCompleteTask(task.id, task)}
                          className="ml-4 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Terminer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Aucune tâche récente</h3>
                <p className="text-gray-500 mb-4">Commencez par créer votre première tâche !</p>
                <Link 
                  to="/tasks"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>➕</span>
                  <span>Créer une tâche</span>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar avec Leaderboard et Stats */}
          <div className="space-y-6">
            
            {/* Mini Leaderboard */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-3">🏆</span>
                Top Joueurs
              </h3>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div key={player.userId} className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-gray-300'}
                      `}>
                        {index + 1}
                      </div>
                      <img
                        src={player.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${player.email}`}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {player.displayName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Niv. {player.level} • {player.totalXp} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Pas encore de classement</p>
              )}
              
              <Link 
                to="/leaderboard"
                className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm"
              >
                Voir le classement complet →
              </Link>
            </div>

            {/* Actions Rapides */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-3">⚡</span>
                Actions Rapides
              </h3>
              
              <div className="space-y-3">
                <Link 
                  to="/tasks"
                  className="flex items-center space-x-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>🎯</span>
                  <span>Créer une tâche</span>
                </Link>
                
                <button 
                  onClick={async () => {
                    try {
                      await gamificationService.dailyLogin(user.uid);
                      await loadUserProgression();
                    } catch (error) {
                      console.error('Erreur bonus quotidien:', error);
                    }
                  }}
                  className="flex items-center space-x-3 w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <span>🎁</span>
                  <span>Bonus quotidien (+10 XP)</span>
                </button>
                
                <Link 
                  to="/profile"
                  className="flex items-center space-x-3 w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <span>👤</span>
                  <span>Modifier profil</span>
                </Link>
              </div>
            </div>

            {/* Progression Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-3">📊</span>
                Statistiques
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Connexions:</span>
                  <span className="text-white">{userProgression?.loginCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Série actuelle:</span>
                  <span className="text-white">{userProgression?.streakDays || 0} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aide fournie:</span>
                  <span className="text-white">{userProgression?.helpProvided || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projets créés:</span>
                  <span className="text-white">{userProgression?.projectsCreated || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              🎉 Synergia v3.0 - Gamification Active !
            </h3>
            <p className="text-gray-300 mb-4">
              Système de tâches gamifié opérationnel. Gagnez de l'XP, débloquez des badges et grimpez dans le classement !
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>✨ {userProgression?.badges.length || 0} badges débloqués</span>
              <span>•</span>
              <span>🎯 {taskStats?.completed || 0} tâches terminées</span>
              <span>•</span>
              <span>⭐ {userProgression?.totalXp || 0} XP total</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
