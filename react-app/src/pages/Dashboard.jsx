// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD PREMIUM RESTAURÉ - DESIGN MODERNE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Target, 
  Trophy, 
  TrendingUp, 
  Zap,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Plus,
  Activity,
  Award,
  Flame,
  Calendar,
  Mail,
  Bell
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎨 DASHBOARD PREMIUM - DESIGN MODERNE RESTAURÉ
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { gamification, isLoading } = useUnifiedFirebaseData();
  
  // États locaux
  const [currentTime, setCurrentTime] = useState(new Date());

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
    loginStreak: gamification?.loginStreak || 1
  };

  // Calcul du progrès vers le niveau suivant
  const xpForNextLevel = userStats.level * 100;
  const xpProgress = Math.round((userStats.currentXP / xpForNextLevel) * 100);

  // Données pour les métriques principales
  const mainMetrics = [
    {
      title: 'Niveau Actuel',
      value: userStats.level,
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      change: '+1 niveau',
      trend: 'up'
    },
    {
      title: 'XP Total',
      value: userStats.totalXP,
      icon: Zap,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+25 XP',
      trend: 'up'
    },
    {
      title: 'Tâches Terminées',
      value: userStats.tasksCompleted,
      icon: CheckCircle,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: '+3 tâches',
      trend: 'up'
    },
    {
      title: 'Badges Obtenus',
      value: userStats.badges,
      icon: Award,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: '+1 badge',
      trend: 'up'
    }
  ];

  // Navigation rapide
  const quickActions = [
    { 
      name: 'Mes Tâches', 
      href: '/tasks', 
      icon: CheckCircle, 
      color: 'from-blue-500 to-blue-600',
      description: 'Gérer mes tâches',
      count: 5 
    },
    { 
      name: 'Projets', 
      href: '/projects', 
      icon: Target, 
      color: 'from-green-500 to-green-600',
      description: 'Suivre mes projets',
      count: 3 
    },
    { 
      name: 'Gamification', 
      href: '/gamification', 
      icon: Trophy, 
      color: 'from-purple-500 to-purple-600',
      description: 'Voir ma progression',
      count: userStats.badges 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3, 
      color: 'from-orange-500 to-orange-600',
      description: 'Analyser mes performances',
      count: null 
    },
    { 
      name: 'Équipe', 
      href: '/team', 
      icon: Users, 
      color: 'from-indigo-500 to-indigo-600',
      description: 'Collaborer avec l\'équipe',
      count: 8 
    },
    { 
      name: 'Badges', 
      href: '/badges', 
      icon: Award, 
      color: 'from-yellow-500 to-yellow-600',
      description: 'Collection de badges',
      count: userStats.badges 
    }
  ];

  // Objectifs récents
  const recentObjectives = [
    {
      id: 1,
      title: 'Compléter 3 tâches aujourd\'hui',
      progress: 67,
      status: 'in_progress',
      reward: '50 XP + Badge Productif',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Gagner 100 XP cette semaine',
      progress: 85,
      status: 'almost_done',
      reward: '100 XP + Badge Hebdomadaire',
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      title: 'Maintenir une série de 7 jours',
      progress: 100,
      status: 'completed',
      reward: '200 XP + Badge Constance',
      icon: Flame,
      color: 'text-green-600'
    }
  ];

  // Activité récente
  const recentActivity = [
    { 
      type: 'task_completed', 
      title: 'Tâche "Mise à jour documentation" terminée', 
      time: '15 min', 
      xp: '+25 XP',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      type: 'badge_earned', 
      title: 'Badge "Innovateur" débloqué', 
      time: '1h', 
      xp: '+50 XP',
      icon: Award,
      color: 'text-yellow-600'
    },
    { 
      type: 'level_up', 
      title: 'Niveau 5 atteint !', 
      time: '2h', 
      xp: '+100 XP',
      icon: Trophy,
      color: 'text-purple-600'
    },
    { 
      type: 'task_assigned', 
      title: 'Nouvelle tâche assignée', 
      time: '3h', 
      xp: '',
      icon: Mail,
      color: 'text-blue-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <h2 className="text-white text-lg font-semibold">
            🔄 Chargement du dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Dashboard Premium */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                👋 Salut, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} !
              </h1>
              <p className="text-gray-400 text-lg mt-2">
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
            
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Niveau {userStats.level}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {userStats.totalXP} XP total
              </div>
            </div>
          </div>
          
          {/* Barre de progression XP Premium */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
              <span>Progression vers niveau {userStats.level + 1}</span>
              <span>{userStats.currentXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full relative"
                style={{ width: `${xpProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${metric.bgColor} rounded-lg`}>
                    <IconComponent className={`w-6 h-6 ${metric.textColor}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.change}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                  <p className="text-gray-400 text-sm">{metric.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Navigation rapide Premium */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-blue-400" />
            🚀 Accès Rapide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group relative bg-gray-700/30 hover:bg-gray-700/50 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-600/30 hover:border-gray-500/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 bg-gradient-to-r ${action.color} rounded-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                    {action.count !== null && (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {action.count}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              );
            })}
          </div>
        </motion.div>
        
        {/* Contenu principal - 2 colonnes */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Objectifs récents */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Target className="w-6 h-6 mr-2 text-purple-400" />
                  🎯 Objectifs en Cours
                </h2>
                <Link 
                  to="/gamification" 
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                >
                  Voir tous <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentObjectives.map((objective, index) => {
                  const IconComponent = objective.icon;
                  return (
                    <motion.div 
                      key={objective.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-5 h-5 ${objective.color}`} />
                          <h3 className="font-medium text-white">{objective.title}</h3>
                        </div>
                        <span className={`
                          px-3 py-1 text-xs rounded-full font-medium
                          ${objective.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          ${objective.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                          ${objective.status === 'almost_done' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {objective.status === 'completed' ? '✅ Terminé' : ''}
                          {objective.status === 'in_progress' ? '🔄 En cours' : ''}
                          {objective.status === 'almost_done' ? '⚡ Presque fini' : ''}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>Progression</span>
                          <span>{objective.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <motion.div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              objective.status === 'completed' ? 'bg-green-500' :
                              objective.progress >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${objective.progress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${objective.progress}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        🎁 Récompense : {objective.reward}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
          
          {/* Activité récente */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-400" />
                📈 Activité Récente
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/40 transition-all"
                    >
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        ${activity.color === 'text-green-600' ? 'bg-green-100' : ''}
                        ${activity.color === 'text-yellow-600' ? 'bg-yellow-100' : ''}
                        ${activity.color === 'text-purple-600' ? 'bg-purple-100' : ''}
                        ${activity.color === 'text-blue-600' ? 'bg-blue-100' : ''}
                      `}>
                        <IconComponent className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {activity.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">Il y a {activity.time}</p>
                          {activity.xp && (
                            <span className="text-xs font-medium text-green-400">
                              {activity.xp}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <Link 
                  to="/analytics" 
                  className="text-center block text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Voir toute l'activité →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Call to Action Premium */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                🎮 Prêt à gagner plus d'XP ?
              </h2>
              <p className="text-blue-100 text-lg">
                Complétez vos objectifs quotidiens et débloquez de nouveaux badges !
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/tasks"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Mes Tâches</span>
              </Link>
              <Link
                to="/gamification"
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>Objectifs</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
