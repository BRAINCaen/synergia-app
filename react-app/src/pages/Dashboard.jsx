// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard AMÉLIORÉ avec synchronisation des données
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Trophy, 
  Star,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useSynchronizedUser, useGamificationSync } from '../shared/hooks/useSynchronizedUser.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import DataHealthMonitor from '../components/admin/DataHealthMonitor.jsx';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    userData,
    xpProgress, 
    badges, 
    stats, 
    profile,
    loading, 
    syncStatus,
    isHealthy,
    isDataReady 
  } = useSynchronizedUser();

  const [showHealthMonitor, setShowHealthMonitor] = useState(false);
  const [quickStats, setQuickStats] = useState({
    recentTasks: [],
    upcomingDeadlines: [],
    weeklyProgress: 0
  });

  // Afficher le moniteur de santé automatiquement si problème détecté
  useEffect(() => {
    if (syncStatus === 'error' || !isHealthy) {
      setShowHealthMonitor(true);
    }
  }, [syncStatus, isHealthy]);

  // 📊 WIDGETS DU DASHBOARD
  const dashboardWidgets = [
    {
      title: 'XP Total',
      value: stats.totalXp || 0,
      icon: Star,
      color: 'blue',
      trend: '+12%',
      description: `Niveau ${stats.level || 1}`,
      link: '/gamification'
    },
    {
      title: 'Tâches Terminées',
      value: stats.tasksCompleted || 0,
      icon: CheckSquare,
      color: 'green',
      trend: '+8%',
      description: `${stats.completionRate || 0}% de réussite`,
      link: '/tasks'
    },
    {
      title: 'Projets Actifs',
      value: stats.projectsCreated || 0,
      icon: Target,
      color: 'purple',
      trend: '+3%',
      description: `${stats.projectsCompleted || 0} terminés`,
      link: '/projects'
    },
    {
      title: 'Badges Obtenus',
      value: badges.count || 0,
      icon: Award,
      color: 'yellow',
      trend: badges.hasNewBadges ? 'NOUVEAU!' : '+2%',
      description: 'Achievements débloqués',
      link: '/badges'
    }
  ];

  // 🎯 PROGRESSION XP VISUELLE
  const renderXPProgress = () => {
    if (!isDataReady) {
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Niveau {xpProgress.level}</span>
          <span className="text-gray-600">{xpProgress.currentXP}/100 XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress.progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">
          {xpProgress.xpToNext} XP pour le niveau {xpProgress.level + 1}
        </p>
      </div>
    );
  };

  // 🏆 BADGES RÉCENTS
  const renderRecentBadges = () => {
    if (!isDataReady || badges.count === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Aucun badge encore</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {badges.recent.map((badge, index) => (
          <div key={index} className="text-center p-2 bg-yellow-50 rounded-lg">
            <Award className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
            <p className="text-xs text-gray-700 capitalize">
              {badge.type?.replace('_', ' ') || 'Badge'}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // 📈 STATUT DE SYNCHRONISATION
  const renderSyncStatus = () => {
    const statusConfig = {
      synchronized: { color: 'green', text: 'Synchronisé', icon: CheckSquare },
      syncing: { color: 'yellow', text: 'Synchronisation...', icon: RefreshCw },
      error: { color: 'red', text: 'Erreur de sync', icon: AlertCircle }
    };

    const config = statusConfig[syncStatus] || statusConfig.error;
    const Icon = config.icon;

    return (
      <div className={`flex items-center space-x-2 text-sm text-${config.color}-600`}>
        <Icon className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        <span>{config.text}</span>
      </div>
    );
  };

  if (loading && !isDataReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Chargement du Dashboard</h2>
          <p className="text-gray-500 mt-2">Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE AVEC INFORMATIONS UTILISATEUR */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {profile.displayName} ! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Niveau {stats.level} • {profile.department}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {renderSyncStatus()}
              
              {(!isHealthy || syncStatus === 'error') && (
                <button
                  onClick={() => setShowHealthMonitor(!showHealthMonitor)}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Diagnostic</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MONITEUR DE SANTÉ (SI AFFICHÉ) */}
        {showHealthMonitor && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Diagnostic des Données</h2>
                <button
                  onClick={() => setShowHealthMonitor(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <DataHealthMonitor />
            </div>
          </div>
        )}

        {/* WIDGETS PRINCIPAUX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardWidgets.map((widget, index) => {
            const Icon = widget.icon;
            return (
              <Link
                key={index}
                to={widget.link}
                className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{widget.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {widget.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{widget.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${widget.color}-100`}>
                    <Icon className={`w-6 h-6 text-${widget.color}-600`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    widget.trend.includes('NOUVEAU') ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {widget.trend}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* SECTION PROGRESSION ET BADGES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* PROGRESSION XP */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Progression XP</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            {renderXPProgress()}
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{stats.tasksCompleted}</p>
                <p className="text-xs text-gray-600">Tâches terminées</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{stats.loginStreak}</p>
                <p className="text-xs text-gray-600">Jours consécutifs</p>
              </div>
            </div>
          </div>

          {/* BADGES RÉCENTS */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Badges Récents</h3>
              <Link to="/badges" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir tous →
              </Link>
            </div>
            {renderRecentBadges()}
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total badges</span>
                <span className="font-medium text-gray-900">{badges.count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* CRÉER UNE TÂCHE */}
          <Link 
            to="/tasks"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Nouvelle Tâche</h3>
                <p className="text-green-100 text-sm mt-1">
                  Créer et organiser vos tâches
                </p>
              </div>
              <CheckSquare className="w-8 h-8" />
            </div>
          </Link>

          {/* VOIR LES PROJETS */}
          <Link 
            to="/projects"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Mes Projets</h3>
                <p className="text-purple-100 text-sm mt-1">
                  Gérer vos projets en cours
                </p>
              </div>
              <Target className="w-8 h-8" />
            </div>
          </Link>

          {/* CLASSEMENT */}
          <Link 
            to="/users"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Classement</h3>
                <p className="text-yellow-100 text-sm mt-1">
                  Voir le leaderboard équipe
                </p>
              </div>
              <Trophy className="w-8 h-8" />
            </div>
          </Link>
        </div>

        {/* STATISTIQUES RAPIDES */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Aperçu de la Semaine</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-lg font-bold text-gray-900">{stats.completionRate}%</p>
              <p className="text-sm text-gray-600">Taux de réussite</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-bold text-gray-900">{stats.tasksCreated}</p>
              <p className="text-sm text-gray-600">Tâches créées</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-lg font-bold text-gray-900">{stats.loginStreak}</p>
              <p className="text-sm text-gray-600">Streak actuel</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-lg font-bold text-gray-900">{stats.projectsCreated}</p>
              <p className="text-sm text-gray-600">Projets</p>
            </div>
          </div>
        </div>

        {/* FOOTER DU DASHBOARD */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Dernière synchronisation : {new Date().toLocaleTimeString()} • 
            {isDataReady ? ' Données à jour' : ' Chargement en cours...'}
          </p>
          
          {!isHealthy && (
            <div className="mt-2">
              <button
                onClick={() => setShowHealthMonitor(true)}
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
              >
                ⚠️ Vérifier l'état des données
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
