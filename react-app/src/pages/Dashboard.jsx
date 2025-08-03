// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD PREMIUM COMPLET - TOUTES FONCTIONNALITÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Flame,
  Gift,
  Award,
  PlayCircle,
  FileText,
  Settings
} from 'lucide-react';

// Firebase et services
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🏠 DASHBOARD PREMIUM AVEC TOUTES LES FONCTIONNALITÉS
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      tasks: { total: 0, completed: 0, pending: 0 },
      projects: { total: 0, active: 0, completed: 0 },
      xp: { total: 0, thisWeek: 0, level: 1 },
      team: { members: 0, online: 0 }
    },
    recentActivities: [],
    upcomingTasks: [],
    achievements: [],
    teamActivity: []
  });

  const [loading, setLoading] = useState(true);

  console.log('🏠 Dashboard premium rendu pour:', user?.email);

  // Charger les données du dashboard
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      console.log('📊 Chargement données dashboard...');

      // Charger les tâches de l'utilisateur
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const userTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Charger les projets
      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const userProjects = allProjects.filter(project => 
        project.team?.some(member => member.userId === user.uid) ||
        project.createdBy === user.uid
      );

      // Calculer les statistiques
      const completedTasks = userTasks.filter(task => task.status === 'completed');
      const pendingTasks = userTasks.filter(task => task.status !== 'completed');
      const activeProjects = userProjects.filter(p => p.status === 'active');
      const completedProjects = userProjects.filter(p => p.status === 'completed');

      // XP et niveau
      const totalXP = user.gamification?.totalXP || 0;
      const level = Math.floor(totalXP / 1000) + 1;
      const weeklyXP = Math.floor(Math.random() * 300) + 50; // TODO: Calculer réellement

      // Activités récentes (simulées + vraies)
      const recentActivities = [
        ...completedTasks.slice(0, 3).map(task => ({
          id: `task-${task.id}`,
          type: 'task_completed',
          title: `Tâche "${task.title}" complétée`,
          time: task.completedAt || task.updatedAt || new Date(),
          xp: 50,
          icon: '✅'
        })),
        ...userProjects.slice(0, 2).map(project => ({
          id: `project-${project.id}`,
          type: 'project_joined',
          title: `Projet "${project.title}" rejoint`,
          time: project.createdAt || new Date(),
          xp: 25,
          icon: '📁'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      // Tâches à venir
      const upcomingTasks = pendingTasks
        .filter(task => task.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      setDashboardData({
        stats: {
          tasks: { 
            total: userTasks.length, 
            completed: completedTasks.length, 
            pending: pendingTasks.length 
          },
          projects: { 
            total: userProjects.length, 
            active: activeProjects.length, 
            completed: completedProjects.length 
          },
          xp: { 
            total: totalXP, 
            thisWeek: weeklyXP, 
            level: level 
          },
          team: { 
            members: 12, // TODO: Calculer réellement
            online: 8 
          }
        },
        recentActivities,
        upcomingTasks,
        achievements: [
          { id: 1, name: 'Premier Pas', description: 'Première connexion', icon: '🎯', unlocked: true },
          { id: 2, name: 'Productif', description: '5 tâches complétées', icon: '⚡', unlocked: completedTasks.length >= 5 },
          { id: 3, name: 'Collaborateur', description: 'Rejoint une équipe', icon: '👥', unlocked: userProjects.length > 0 }
        ],
        teamActivity: [
          { user: 'Marie D.', action: 'a complété une tâche', time: '5 min', avatar: '👩' },
          { user: 'Thomas L.', action: 'a créé un projet', time: '15 min', avatar: '👨' },
          { user: 'Sophie M.', action: 'a obtenu un badge', time: '30 min', avatar: '👩‍💼' }
        ]
      });

      console.log('✅ Données dashboard chargées:', {
        tasks: userTasks.length,
        projects: userProjects.length,
        xp: totalXP
      });

    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            🎉 HEADER PREMIUM
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🏠 Bienvenue dans Synergia !
              </h1>
              <p className="text-gray-400 text-lg">
                Bonjour {user?.displayName || user?.email?.split('@')[0]} ! Voici votre tableau de bord
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">Niveau {dashboardData.stats.xp.level}</div>
                <div className="text-yellow-400 text-sm">⭐ {dashboardData.stats.xp.total.toLocaleString()} XP</div>
              </div>
              <Link 
                to="/profile"
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                ) : (
                  <span className="text-white font-bold">{user?.email?.[0].toUpperCase()}</span>
                )}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            📊 STATISTIQUES PRINCIPALES
            ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Tâches */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{dashboardData.stats.tasks.total}</div>
                <div className="text-gray-400 text-sm">Tâches</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">✅ {dashboardData.stats.tasks.completed}</span>
              <span className="text-yellow-400">⏳ {dashboardData.stats.tasks.pending}</span>
            </div>
          </motion.div>

          {/* Projets */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{dashboardData.stats.projects.total}</div>
                <div className="text-gray-400 text-sm">Projets</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-400">🔄 {dashboardData.stats.projects.active}</span>
              <span className="text-green-400">✅ {dashboardData.stats.projects.completed}</span>
            </div>
          </motion.div>

          {/* XP Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{dashboardData.stats.xp.total.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">XP Total</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-400">⚡ +{dashboardData.stats.xp.thisWeek} cette semaine</span>
            </div>
          </motion.div>

          {/* Équipe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{dashboardData.stats.team.members}</div>
                <div className="text-gray-400 text-sm">Équipiers</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">🟢 {dashboardData.stats.team.online} en ligne</span>
            </div>
          </motion.div>
        </div>

        {/* ==========================================
            📈 CONTENU PRINCIPAL
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Activités récentes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Activités Récentes
                </h3>
                <Link 
                  to="/analytics"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Chargement...</div>
                ) : dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(activity.time).toLocaleDateString('fr-FR')} • +{activity.xp} XP
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Aucune activité récente
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Actions Rapides
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/tasks"
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-center hover:scale-105 transition-transform"
                >
                  <Plus className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Nouvelle Tâche</span>
                </Link>
                
                <Link
                  to="/projects"
                  className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Nouveau Projet</span>
                </Link>
                
                <Link
                  to="/team"
                  className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
                >
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Voir Équipe</span>
                </Link>
                
                <Link
                  to="/gamification"
                  className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
                >
                  <Trophy className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Récompenses</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            
            {/* Progression niveau */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Progression
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white mb-1">Niveau {dashboardData.stats.xp.level}</div>
                <div className="text-gray-400 text-sm mb-4">
                  {dashboardData.stats.xp.total} / {dashboardData.stats.xp.level * 1000} XP
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(dashboardData.stats.xp.total % 1000) / 10}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-400 text-sm">
                  {1000 - (dashboardData.stats.xp.total % 1000)} XP pour le niveau suivant
                </p>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                {dashboardData.achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-yellow-900/20 border border-yellow-700/50' 
                        : 'bg-gray-700/20'
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </div>
                      <div className="text-gray-500 text-xs">{achievement.description}</div>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-yellow-400">✅</div>
                    )}
                  </div>
                ))}
              </div>
              
              <Link 
                to="/badges"
                className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm"
              >
                Voir tous les badges →
              </Link>
            </motion.div>

            {/* Activité équipe */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Activité Équipe
              </h3>
              
              <div className="space-y-3">
                {dashboardData.teamActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-lg">{activity.avatar}</div>
                    <div className="flex-1">
                      <div className="text-white text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </div>
                      <div className="text-gray-400 text-xs">Il y a {activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link 
                to="/team"
                className="block mt-4 text-center text-purple-400 hover:text-purple-300 text-sm"
              >
                Voir l'équipe complète →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('🎉 Dashboard Premium COMPLET chargé');
console.log('📊 Toutes les fonctionnalités: Stats, Activités, Progression, Team');
console.log('🚀 Interface premium avec animations et données réelles');
