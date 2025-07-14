// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC BOUTONS FONCTIONNELS - CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Target, 
  Users, 
  Trophy, 
  Clock, 
  Calendar,
  CheckCircle2,
  Rocket,
  Star,
  Brain,
  TrendingUp,
  Bell,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Award,
  FolderOpen,
  CheckSquare,
  Gamepad2,
  ArrowRight
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🏠 DASHBOARD AVEC NAVIGATION FONCTIONNELLE
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalXP: 0,
    currentStreak: 0,
    teamRanking: 0,
    weeklyProgress: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement des données Firebase
  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les tâches utilisateur
      const userTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const userTasksSnapshot = await getDocs(userTasksQuery);
      const userTasks = [];
      userTasksSnapshot.forEach(doc => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      // Calculer les stats
      const completedTasks = userTasks.filter(task => task.status === 'completed').length;
      const totalXP = userTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
      
      setStats({
        tasksCompleted: completedTasks,
        totalXP: totalXP,
        currentStreak: 7, // Calculé dynamiquement plus tard
        teamRanking: 3,
        weeklyProgress: Math.round((completedTasks / Math.max(userTasks.length, 1)) * 100)
      });

      // Tâches récentes
      setUpcomingTasks(userTasks.slice(0, 5));
      
      // Activité récente (simulée pour l'instant)
      setRecentActivity([
        { id: 1, type: 'task_completed', message: 'Tâche "Révision code" complétée', time: 'Il y a 2h', xp: '+50 XP' },
        { id: 2, type: 'badge_earned', message: 'Badge "Productif" débloqué', time: 'Il y a 4h', xp: '+100 XP' },
        { id: 3, type: 'level_up', message: 'Niveau 12 atteint !', time: 'Hier', xp: '+250 XP' }
      ]);

    } catch (error) {
      console.error('❌ Erreur chargement Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 HANDLERS DE NAVIGATION - BOUTONS FONCTIONNELS
  const handleCreateTask = () => {
    navigate('/tasks');
  };

  const handleViewNotifications = () => {
    // Pour l'instant, simuler les notifications
    alert('🔔 Vous avez 3 nouvelles notifications !\n- Tâche validée par admin\n- Nouveau badge disponible\n- Rappel: Réunion équipe demain');
  };

  const handleViewAllTasks = () => {
    navigate('/tasks');
  };

  const handleViewProjects = () => {
    navigate('/projects');
  };

  const handleViewTeam = () => {
    navigate('/team');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const handleViewGamification = () => {
    navigate('/gamification');
  };

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Tâches complétées",
      value: stats.tasksCompleted,
      icon: CheckCircle2,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "XP Total",
      value: stats.totalXP,
      icon: Star,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "Série actuelle",
      value: `${stats.currentStreak} j`,
      icon: Zap,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Rang équipe",
      value: `#${stats.teamRanking}`,
      icon: Trophy,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    }
  ];

  // Actions du header - AVEC HANDLERS FONCTIONNELS
  const headerActions = (
    <>
      <PremiumButton 
        variant="outline" 
        size="md"
        icon={Bell}
        onClick={handleViewNotifications}
      >
        Notifications
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
        onClick={handleCreateTask}
      >
        Nouvelle tâche
      </PremiumButton>
    </>
  );

  if (loading) {
    return (
      <PremiumLayout
        title="Dashboard"
        subtitle="Chargement de vos données..."
        icon={Home}
      >
        <PremiumCard className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de vos données depuis Firebase...</p>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Dashboard"
      subtitle={`Bienvenue ${user?.displayName || user?.email || 'Utilisateur'} ! Voici votre vue d'ensemble`}
      icon={Home}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 📊 Section métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Productivité"
          value="Élevée"
          icon={Brain}
          color="purple"
          trend="↗️ +15% cette semaine"
        />
        <StatCard
          title="Temps moyen"
          value="2.3h"
          icon={Clock}
          color="blue"
          trend="⏱️ Par tâche"
        />
        <StatCard
          title="Projets actifs"
          value="8"
          icon={Rocket}
          color="green"
          trend="🚀 3 nouveaux ce mois"
        />
        <StatCard
          title="Niveau"
          value="12"
          icon={Award}
          color="yellow"
          trend="🏆 Prochaine étape: 1,250 XP"
        />
      </div>

      {/* 📈 Section principale - 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne principale - Progression et activité */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progression de la semaine */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Progression de la semaine</h3>
              <span className="text-sm text-gray-400">{stats.weeklyProgress}% complété</span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Objectif hebdomadaire</span>
                <span className="text-white">{stats.tasksCompleted}/15 tâches</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.weeklyProgress, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mt-4">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-400 mb-1">{day}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    index < 5 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {index < 5 ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Actions rapides - AVEC NAVIGATION */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <button
                onClick={handleViewAllTasks}
                className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-300 hover:scale-105 group"
              >
                <CheckSquare className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Mes Tâches</span>
                <span className="text-gray-400 text-xs">Gérer</span>
              </button>
              
              <button
                onClick={handleViewProjects}
                className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-300 hover:scale-105 group"
              >
                <FolderOpen className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Projets</span>
                <span className="text-gray-400 text-xs">Suivre</span>
              </button>
              
              <button
                onClick={handleViewTeam}
                className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-300 hover:scale-105 group"
              >
                <Users className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Équipe</span>
                <span className="text-gray-400 text-xs">Collaborer</span>
              </button>
              
              <button
                onClick={handleViewGamification}
                className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-300 hover:scale-105 group"
              >
                <Gamepad2 className="w-8 h-8 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Gamification</span>
                <span className="text-gray-400 text-xs">S'amuser</span>
              </button>
            </div>
          </PremiumCard>

          {/* Activité récente */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Activité récente</h3>
              <button
                onClick={handleViewAnalytics}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 group"
              >
                Voir plus 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'task_completed' ? 'bg-green-400' :
                      activity.type === 'badge_earned' ? 'bg-yellow-400' :
                      'bg-purple-400'
                    }`}></div>
                    <div>
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm font-medium">{activity.xp}</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>

        {/* Sidebar droite */}
        <div className="space-y-6">
          
          {/* Prochaines tâches */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Prochaines tâches</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? upcomingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-3 bg-gray-700/30 rounded-lg">
                  <h4 className="text-white text-sm font-medium">{task.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {task.dueDate ? new Date(task.dueDate.toDate()).toLocaleDateString() : 'Pas de date limite'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority === 'high' ? 'Urgent' : 
                       task.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                    <span className="text-blue-400 text-xs">+{task.xpReward || 50} XP</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucune tâche en attente</p>
                  <button
                    onClick={handleCreateTask}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    Créer une nouvelle tâche
                  </button>
                </div>
              )}
            </div>
            
            {upcomingTasks.length > 3 && (
              <button
                onClick={handleViewAllTasks}
                className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 group"
              >
                Voir toutes les tâches 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </PremiumCard>

          {/* Objectifs de la semaine */}
          <PremiumCard>
            <h3 className="text-lg font-bold text-white mb-4">Objectifs de la semaine</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Terminer 15 tâches</span>
                <span className="text-green-400 text-sm">{stats.tasksCompleted}/15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Gagner 1000 XP</span>
                <span className="text-yellow-400 text-sm">{stats.totalXP}/1000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">5 jours consécutifs</span>
                <span className="text-purple-400 text-sm">5/5 ✓</span>
              </div>
            </div>
            
            <button
              onClick={handleViewGamification}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
            >
              Voir tous les objectifs
            </button>
          </PremiumCard>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default Dashboard;
