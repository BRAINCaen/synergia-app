// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD PREMIUM COMPLET - Version finale avec toutes les fonctionnalités
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Users, 
  Trophy, 
  Target, 
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Medal,
  Activity,
  BookOpen,
  Award,
  Timer,
  Heart,
  Briefcase,
  FileText,
  MessageCircle,
  Settings,
  Bell,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

// Imports Firebase et Services
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useGamificationStore } from '../shared/stores/gamificationStore.js';
import { taskService } from '../core/services/taskService.js';
import { analyticsService } from '../core/services/analyticsService.js';

/**
 * 🎨 COMPOSANTS PREMIUM DASHBOARD
 */

// StatCard Premium avec animations
const PremiumStatCard = ({ title, value, icon: Icon, gradient, trend, description, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{trend}%
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      {description && (
        <p className="text-gray-500 text-xs mt-2">{description}</p>
      )}
    </div>
  </motion.div>
);

// Card Premium générique
const PremiumCard = ({ title, children, icon: Icon, headerAction, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {headerAction}
    </div>
    {children}
  </motion.div>
);

// Composant Task Quick Preview
const TaskQuickPreview = ({ tasks }) => (
  <div className="space-y-3">
    {tasks.slice(0, 5).map((task, index) => (
      <motion.div
        key={task.id || index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors group cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            task.status === 'completed' ? 'bg-green-400' :
            task.status === 'in_progress' ? 'bg-blue-400' :
            task.priority === 'high' ? 'bg-red-400' : 'bg-yellow-400'
          }`} />
          <div>
            <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
              {task.title}
            </p>
            <p className="text-gray-400 text-xs">
              {task.project} • {task.priority} • {task.estimatedHours}h
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {task.xpReward && (
            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
              +{task.xpReward} XP
            </span>
          )}
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </motion.div>
    ))}
  </div>
);

// Composant Activité récente
const RecentActivity = ({ activities }) => (
  <div className="space-y-4">
    {activities.slice(0, 6).map((activity, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-start space-x-3 p-3 hover:bg-gray-700/20 rounded-lg transition-colors"
      >
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${activity.gradient} flex items-center justify-center flex-shrink-0`}>
          <activity.icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm">{activity.description}</p>
          <p className="text-gray-400 text-xs mt-1">{activity.timestamp}</p>
        </div>
        {activity.reward && (
          <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
            +{activity.reward} XP
          </span>
        )}
      </motion.div>
    ))}
  </div>
);

/**
 * 🏠 DASHBOARD PRINCIPAL PREMIUM
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, loading: tasksLoading } = useTaskStore();
  const { stats: gamificationStats } = useGamificationStore();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0,
    completedProjects: 0,
    totalTeamMembers: 8,
    activeTeamMembers: 6,
    weeklyXP: 0,
    totalXP: 0,
    currentLevel: 1,
    badgesEarned: 0,
    currentStreak: 0,
    weeklyGoal: 100,
    monthlyGoal: 400
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Charger les tâches récentes
        const userTasks = await taskService.getUserTasks(user.uid);
        setRecentTasks(userTasks || []);

        // Calculer les statistiques
        const completedTasks = userTasks?.filter(t => t.status === 'completed').length || 0;
        const inProgressTasks = userTasks?.filter(t => t.status === 'in_progress').length || 0;
        
        // Charger les données analytics
        const analyticsData = await analyticsService.getUserAnalytics(user.uid);
        
        setStats({
          totalTasks: userTasks?.length || 0,
          completedTasks,
          inProgressTasks,
          totalProjects: analyticsData?.projects?.total || 0,
          completedProjects: analyticsData?.projects?.completed || 0,
          totalTeamMembers: 8,
          activeTeamMembers: 6,
          weeklyXP: gamificationStats?.weeklyXP || 0,
          totalXP: gamificationStats?.totalXP || 0,
          currentLevel: gamificationStats?.level || 1,
          badgesEarned: gamificationStats?.badges?.length || 0,
          currentStreak: gamificationStats?.streak || 0,
          weeklyGoal: 100,
          monthlyGoal: 400
        });

        // Générer les activités récentes
        const activities = [
          {
            description: `Tâche "${userTasks?.[0]?.title || 'Nouvelle tâche'}" complétée`,
            timestamp: "Il y a 2 heures",
            icon: CheckCircle,
            gradient: "from-green-500 to-emerald-500",
            reward: userTasks?.[0]?.xpReward || 50
          },
          {
            description: "Badge 'Collaborateur du mois' débloqué",
            timestamp: "Il y a 1 jour",
            icon: Award,
            gradient: "from-yellow-500 to-orange-500",
            reward: 100
          },
          {
            description: "Niveau 2 atteint dans le système de gamification",
            timestamp: "Il y a 3 jours",
            icon: Star,
            gradient: "from-purple-500 to-pink-500",
            reward: 200
          },
          {
            description: "Participation au projet 'Innovation 2025'",
            timestamp: "Il y a 1 semaine",
            icon: Briefcase,
            gradient: "from-blue-500 to-cyan-500",
            reward: 75
          },
          {
            description: "Commentaire laissé sur le rapport mensuel",
            timestamp: "Il y a 1 semaine",
            icon: MessageCircle,
            gradient: "from-indigo-500 to-purple-500",
            reward: 25
          }
        ];

        setRecentActivities(activities);

        setTimeout(() => {
          setLoading(false);
          console.log('✅ Dashboard premium chargé avec succès');
        }, 800);

      } catch (error) {
        console.error('❌ Erreur chargement dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid, gamificationStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-xl"></div>
                <div>
                  <div className="h-10 bg-gray-700 rounded w-64 mb-3"></div>
                  <div className="h-5 bg-gray-700 rounded w-48"></div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="w-32 h-10 bg-gray-700 rounded-lg"></div>
                <div className="w-32 h-10 bg-gray-700 rounded-lg"></div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-700 rounded-xl"></div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-700 rounded-xl"></div>
              <div className="h-96 bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const weeklyProgress = Math.round((stats.weeklyXP / stats.weeklyGoal) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl"
            >
              <Home className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 mt-2 text-xl"
              >
                Bienvenue, {user?.displayName || user?.email?.split('@')[0]} ! 
                <span className="ml-2 text-blue-400">Niveau {stats.currentLevel}</span>
              </motion.p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle tâche</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-700/50 transition-all"
            >
              <Search className="w-5 h-5" />
              <span>Rechercher</span>
            </motion.button>
          </div>
        </motion.div>

        {/* STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumStatCard
            title="Tâches Complétées"
            value={stats.completedTasks}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-500"
            trend={12}
            description={`${completionRate}% de réussite`}
          />
          
          <PremiumStatCard
            title="En Cours"
            value={stats.inProgressTasks}
            icon={Clock}
            gradient="from-blue-500 to-cyan-500"
            description="Tâches actives"
          />
          
          <PremiumStatCard
            title="Points XP"
            value={stats.totalXP}
            icon={Star}
            gradient="from-purple-500 to-pink-500"
            trend={8}
            description={`+${stats.weeklyXP} cette semaine`}
          />
          
          <PremiumStatCard
            title="Badges Gagnés"
            value={stats.badgesEarned}
            icon={Award}
            gradient="from-yellow-500 to-orange-500"
            description="Accomplissements"
          />
        </div>

        {/* PROGRESS BARS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Objectif Hebdomadaire</h3>
              <span className="text-blue-400 font-bold">{weeklyProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              />
            </div>
            <p className="text-gray-400 text-sm">{stats.weeklyXP} / {stats.weeklyGoal} XP</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Streak Actuel</h3>
              <span className="text-orange-400 font-bold">{stats.currentStreak} jours</span>
            </div>
            <div className="flex items-center space-x-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < stats.currentStreak
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">Continue pour débloquer des bonus !</p>
          </motion.div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TÂCHES RÉCENTES */}
          <div className="lg:col-span-2">
            <PremiumCard
              title="Mes Tâches Récentes"
              icon={FileText}
              headerAction={
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-1"
                >
                  <span>Voir tout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              }
            >
              {recentTasks.length > 0 ? (
                <TaskQuickPreview tasks={recentTasks} />
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <FileText className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <p className="text-gray-400 mb-4">Aucune tâche récente</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Créer ma première tâche
                  </motion.button>
                </div>
              )}
            </PremiumCard>
          </div>

          {/* ACTIVITÉ RÉCENTE */}
          <PremiumCard
            title="Activité Récente"
            icon={Activity}
            headerAction={
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>
            }
          >
            <RecentActivity activities={recentActivities} />
          </PremiumCard>
        </div>

        {/* ACTIONS RAPIDES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl text-white text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Créer un Projet</h3>
            <p className="text-green-100">Lancez votre prochain projet collaboratif</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-xl text-white text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Inviter l'Équipe</h3>
            <p className="text-blue-100">Ajoutez des collaborateurs à vos projets</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics Pro</h3>
            <p className="text-purple-100">Analysez vos performances en détail</p>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
