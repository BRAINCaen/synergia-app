// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION PAGE CORRIGÉE - SANS REDONDANCES
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Flame, 
  Crown, 
  Target, 
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Gift,
  Sparkles,
  Medal,
  Activity
} from 'lucide-react';

// Layout et stores
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';

/**
 * 🎮 PAGE GAMIFICATION FOCALISÉE
 * Concentrée sur la progression et les objectifs personnels
 */
const GamificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  
  // États
  const [activeTab, setActiveTab] = useState('overview');
  const [dailyGoals, setDailyGoals] = useState({
    tasksCompleted: 0,
    targetTasks: 5,
    xpEarned: 0,
    targetXP: 100
  });

  // Calcul des statistiques utilisateur
  const calculateUserStats = () => {
    if (!tasks || !user) return {
      level: 1,
      totalXP: 0,
      badgesEarned: 0,
      streakDays: 0,
      completedTasks: 0,
      weeklyProgress: 0
    };

    const userTasks = tasks.filter(task => task.assignedTo === user.uid);
    const completedTasks = userTasks.filter(task => task.status === 'completed');
    
    // Calcul XP basé sur les tâches
    const totalXP = completedTasks.length * 20; // 20 XP par tâche
    const level = Math.floor(totalXP / 100) + 1; // Niveau basé sur l'XP
    
    return {
      level,
      totalXP,
      badgesEarned: Math.floor(completedTasks.length / 3), // Badge tous les 3 tâches
      streakDays: 5, // Série simulée
      completedTasks: completedTasks.length,
      weeklyProgress: Math.min((completedTasks.length / 10) * 100, 100)
    };
  };

  const userStats = calculateUserStats();

  // Calcul des objectifs quotidiens
  useEffect(() => {
    if (tasks && user) {
      const today = new Date().toDateString();
      const todayTasks = tasks.filter(task => 
        task.assignedTo === user.uid && 
        new Date(task.createdAt).toDateString() === today &&
        task.status === 'completed'
      );
      
      setDailyGoals(prev => ({
        ...prev,
        tasksCompleted: todayTasks.length,
        xpEarned: todayTasks.length * 20
      }));
    }
  }, [tasks, user]);

  // Statistiques en en-tête
  const headerStats = [
    {
      label: "Niveau",
      value: userStats.level,
      icon: Crown,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "XP Total",
      value: userStats.totalXP,
      icon: Star,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Badges gagnés",
      value: userStats.badgesEarned,
      icon: Award,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Série actuelle",
      value: `${userStats.streakDays}j`,
      icon: Flame,
      color: "text-red-400",
      iconColor: "text-red-400"
    }
  ];

  // Onglets simplifiés (sans badges et classement)
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
    { id: 'progress', label: 'Progression', icon: TrendingUp },
    { id: 'goals', label: 'Objectifs', icon: Target },
    { id: 'activities', label: 'Activités', icon: Activity }
  ];

  // Activités récentes
  const recentActivities = [
    {
      id: 1,
      type: 'task',
      action: 'Tâche complétée',
      detail: 'Révision du code frontend',
      xp: '+20 XP',
      time: 'Il y a 2h'
    },
    {
      id: 2,
      type: 'badge',
      action: 'Badge débloqué',
      detail: 'Premier contributeur',
      xp: '+50 XP',
      time: 'Il y a 4h'
    },
    {
      id: 3,
      type: 'level',
      action: 'Niveau atteint',
      detail: 'Niveau 3 débloqué',
      xp: '+100 XP',
      time: 'Hier'
    },
    {
      id: 4,
      type: 'streak',
      action: 'Série maintenue',
      detail: '5 jours consécutifs',
      xp: '+25 XP',
      time: 'Hier'
    }
  ];

  // Objectifs disponibles
  const availableGoals = [
    {
      id: 1,
      title: 'Complétez 3 tâches aujourd\'hui',
      description: 'Terminez au moins 3 tâches avant la fin de la journée',
      progress: Math.min((dailyGoals.tasksCompleted / 3) * 100, 100),
      reward: '60 XP + Badge Productif',
      status: dailyGoals.tasksCompleted >= 3 ? 'completed' : 'active',
      icon: CheckCircle
    },
    {
      id: 2,
      title: 'Gagnez 100 XP cette semaine',
      description: 'Accumulez au moins 100 points d\'expérience',
      progress: Math.min((userStats.totalXP / 100) * 100, 100),
      reward: '200 XP + Badge Hebdomadaire',
      status: userStats.totalXP >= 100 ? 'completed' : 'active',
      icon: Star
    },
    {
      id: 3,
      title: 'Maintenez une série de 7 jours',
      description: 'Complétez au moins une tâche chaque jour pendant 7 jours',
      progress: Math.min((userStats.streakDays / 7) * 100, 100),
      reward: '300 XP + Badge Consistance',
      status: userStats.streakDays >= 7 ? 'completed' : 'active',
      icon: Flame
    }
  ];

  return (
    <PremiumLayout>
      <div className="space-y-8">
        {/* En-tête avec gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-purple-800/20 rounded-2xl p-8 border border-purple-500/30 overflow-hidden"
        >
          {/* Effets de fond */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative z-10">
            {/* Titre */}
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-2xl mr-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Gamification
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                  Suivez votre progression et atteignez vos objectifs
                </p>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Navigation des onglets */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ONGLET VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Progression du niveau */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Progression du niveau</h3>
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    Niveau {userStats.level}
                  </div>
                  <div className="text-gray-400">
                    {userStats.totalXP} / {userStats.level * 100} XP
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
                      style={{ 
                        width: `${((userStats.totalXP % 100) / 100) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    {100 - (userStats.totalXP % 100)} XP pour le niveau suivant
                  </div>
                </div>
              </div>

              {/* Objectifs quotidiens */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Objectifs quotidiens</h3>
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                
                <div className="space-y-4">
                  {/* Tâches complétées */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Tâches complétées</span>
                      <span className="text-white">{dailyGoals.tasksCompleted}/{dailyGoals.targetTasks}</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((dailyGoals.tasksCompleted / dailyGoals.targetTasks) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* XP gagnée */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">XP gagnée</span>
                      <span className="text-white">{dailyGoals.xpEarned}/{dailyGoals.targetXP}</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((dailyGoals.xpEarned / dailyGoals.targetXP) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Bonus de fin de journée */}
                {dailyGoals.tasksCompleted >= dailyGoals.targetTasks && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Objectif quotidien atteint ! +50 XP bonus</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions rapides */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-6">Actions rapides</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Voir mes badges */}
                    <button
                      onClick={() => navigate('/badges')}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg hover:from-purple-600/30 hover:to-pink-600/30 transition-all group"
                    >
                      <div className="flex items-center">
                        <Award className="w-6 h-6 text-purple-400 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-white">Mes Badges</div>
                          <div className="text-sm text-gray-400">{userStats.badgesEarned} débloqués</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* Voir le classement */}
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg hover:from-yellow-600/30 hover:to-orange-600/30 transition-all group"
                    >
                      <div className="flex items-center">
                        <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-white">Classement</div>
                          <div className="text-sm text-gray-400">Position #1</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* Voir les récompenses */}
                    <button
                      onClick={() => navigate('/rewards')}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg hover:from-green-600/30 hover:to-blue-600/30 transition-all group"
                    >
                      <div className="flex items-center">
                        <Gift className="w-6 h-6 text-green-400 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-white">Récompenses</div>
                          <div className="text-sm text-gray-400">2 disponibles</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET PROGRESSION */}
          {activeTab === 'progress' && (
            <div className="space-y-8">
              {/* Progression hebdomadaire */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Progression cette semaine</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {userStats.completedTasks}
                    </div>
                    <div className="text-gray-400">Tâches complétées</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {userStats.totalXP}
                    </div>
                    <div className="text-gray-400">XP gagnée</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {userStats.weeklyProgress.toFixed(0)}%
                    </div>
                    <div className="text-gray-400">Objectif hebdomadaire</div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${userStats.weeklyProgress}%` }}
                  />
                </div>
              </div>

              {/* Tendances */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Tendances de performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div>
                      <div className="text-lg font-semibold text-white">Productivité</div>
                      <div className="text-sm text-gray-400">+15% cette semaine</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div>
                      <div className="text-lg font-semibold text-white">Consistance</div>
                      <div className="text-sm text-gray-400">{userStats.streakDays} jours de suite</div>
                    </div>
                    <Flame className="w-8 h-8 text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET OBJECTIFS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {availableGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${
                        goal.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <goal.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{goal.title}</h4>
                        <p className="text-gray-400 text-sm">{goal.description}</p>
                      </div>
                    </div>
                    
                    {goal.status === 'completed' && (
                      <div className="flex items-center bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Terminé
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progression</span>
                      <span className="text-white">{goal.progress.toFixed(0)}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.status === 'completed' 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-blue-400 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Récompense: <span className="text-yellow-400">{goal.reward}</span>
                    </div>
                    
                    {goal.status === 'completed' && (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Réclamée
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ONGLET ACTIVITÉS */}
          {activeTab === 'activities' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Activités récentes</h3>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'task' ? 'bg-blue-400' :
                        activity.type === 'badge' ? 'bg-purple-400' :
                        activity.type === 'level' ? 'bg-yellow-400' :
                        activity.type === 'streak' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium text-sm">{activity.action}</div>
                        <div className="text-gray-400 text-xs">{activity.detail}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium text-sm">{activity.xp}</div>
                      <div className="text-gray-500 text-xs">{activity.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PremiumLayout>
  );
};

export default GamificationPage;
