// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD FIREBASE PUR - ZÉRO DONNÉES MOCK
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { 
  BarChart3, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap,
  Star,
  Trophy,
  Flame
} from 'lucide-react';

/**
 * 🏠 DASHBOARD FIREBASE PUR
 * Toutes les données proviennent exclusivement de Firebase
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // ✅ DONNÉES FIREBASE RÉELLES UNIQUEMENT
  const { 
    gamification,
    userStats,
    loading: dataLoading,
    error: dataError 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ STATISTIQUES RÉELLES CALCULÉES DEPUIS FIREBASE
  const [realStats, setRealStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    teamMembers: 0,
    completionRate: 0,
    weeklyProgress: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadRealDashboardData();
    }
  }, [user?.uid]);

  /**
   * 📊 CHARGER TOUTES LES VRAIES DONNÉES DASHBOARD
   */
  const loadRealDashboardData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement données Dashboard Firebase pour:', user.uid);
      
      // Paralléliser toutes les requêtes Firebase
      const [
        userTasksSnapshot,
        allTasksSnapshot,
        userProjectsSnapshot,
        allUsersSnapshot,
        userStatsDoc
      ] = await Promise.all([
        // Tâches de l'utilisateur (créées + assignées)
        getDocs(query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        )),
        // Toutes les tâches pour calculs globaux
        getDocs(query(
          collection(db, 'tasks'),
          where('createdBy', '==', user.uid)
        )),
        // Projets de l'utilisateur
        getDocs(query(
          collection(db, 'projects'),
          where('createdBy', '==', user.uid)
        )),
        // Nombre total d'utilisateurs
        getDocs(collection(db, 'users')),
        // Stats détaillées utilisateur
        getDoc(doc(db, 'userStats', user.uid))
      ]);

      // 🔥 CALCULER LES VRAIES STATISTIQUES
      const userTasks = [];
      userTasksSnapshot.forEach(doc => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      const allTasks = [];
      allTasksSnapshot.forEach(doc => {
        allTasks.push({ id: doc.id, ...doc.data() });
      });

      const userProjects = [];
      userProjectsSnapshot.forEach(doc => {
        userProjects.push({ id: doc.id, ...doc.data() });
      });

      const totalUsers = allUsersSnapshot.size;
      const completedTasks = userTasks.filter(task => task.status === 'completed').length;
      const totalTasks = userTasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // 📈 CALCULER PROGRESSION HEBDOMADAIRE RÉELLE
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyCompletedTasks = userTasks.filter(task => 
        task.status === 'completed' && 
        task.updatedAt && 
        task.updatedAt.toDate() > oneWeekAgo
      ).length;
      
      const weeklyProgress = Math.min(100, (weeklyCompletedTasks / Math.max(1, totalTasks)) * 100);

      // ✅ METTRE À JOUR LES STATS RÉELLES
      setRealStats({
        totalTasks,
        completedTasks,
        totalProjects: userProjects.length,
        teamMembers: totalUsers,
        completionRate,
        weeklyProgress: Math.round(weeklyProgress)
      });

      // 📊 GÉNÉRER ACTIVITÉ RÉCENTE RÉELLE
      const sortedTasks = userTasks
        .filter(task => task.updatedAt)
        .sort((a, b) => b.updatedAt.toDate() - a.updatedAt.toDate())
        .slice(0, 5);

      const realRecentActivity = sortedTasks.map(task => ({
        id: task.id,
        type: task.status === 'completed' ? 'task_completed' : 'task_updated',
        title: task.title,
        description: `Tâche ${task.status === 'completed' ? 'terminée' : 'mise à jour'}`,
        time: task.updatedAt.toDate().toLocaleString(),
        xp: task.xpReward || 0
      }));

      setRecentActivity(realRecentActivity);

      // 📈 GÉNÉRER DONNÉES DE PERFORMANCE RÉELLES
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayTasks = userTasks.filter(task => {
          if (!task.updatedAt) return false;
          const taskDate = task.updatedAt.toDate();
          return taskDate.toDateString() === date.toDateString() && task.status === 'completed';
        });
        
        last7Days.push({
          name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          tasks: dayTasks.length,
          xp: dayTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)
        });
      }

      setPerformanceData(last7Days);

      console.log('✅ Données Dashboard Firebase chargées:', {
        stats: realStats,
        activity: realRecentActivity.length,
        performance: last7Days.length
      });

    } catch (error) {
      console.error('❌ Erreur chargement Dashboard Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">❌ Erreur de chargement des données</p>
          <button 
            onClick={loadRealDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN-TÊTE AVEC VRAIES DONNÉES UTILISATEUR */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {user?.displayName || user?.email?.split('@')[0]} ! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Voici votre activité en temps réel
          </p>
        </div>

        {/* CARTES STATISTIQUES RÉELLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tâches */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tâches</p>
                <p className="text-3xl font-bold text-gray-900">{realStats.totalTasks}</p>
              </div>
              <CheckSquare className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          {/* Tâches Terminées */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-3xl font-bold text-gray-900">{realStats.completedTasks}</p>
                <p className="text-sm text-green-600">+{realStats.completionRate}% de réussite</p>
              </div>
              <Target className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* Projets */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets</p>
                <p className="text-3xl font-bold text-gray-900">{realStats.totalProjects}</p>
              </div>
              <FolderOpen className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          {/* Équipe */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Membres</p>
                <p className="text-3xl font-bold text-gray-900">{realStats.teamMembers}</p>
              </div>
              <Users className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* SECTION GAMIFICATION RÉELLE */}
        {gamification && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Niveau & XP */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Niveau & XP</h3>
                <Star className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">Niveau {gamification.level || 1}</p>
                <p className="text-sm opacity-90">{gamification.totalXp || 0} XP au total</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${((gamification.totalXp || 0) % 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Badges</h3>
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{gamification.badges?.length || 0}</p>
                <p className="text-sm opacity-90">Badges débloqués</p>
              </div>
            </div>

            {/* Progression */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Progression</h3>
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{realStats.weeklyProgress}%</p>
                <p className="text-sm opacity-90">Cette semaine</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION ACTIVITÉ & PERFORMANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activité Récente RÉELLE */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Activité Récente
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'task_completed' ? (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                    {activity.xp > 0 && (
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          +{activity.xp} XP
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </div>

          {/* Performance 7 Jours RÉELLE */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Performance (7 jours)
            </h3>
            <div className="space-y-2">
              {performanceData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (day.tasks / Math.max(1, Math.max(...performanceData.map(d => d.tasks)))) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{day.tasks}</span>
                    <span className="text-xs text-yellow-600">+{day.xp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
