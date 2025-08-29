// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// VRAIE PAGE ANALYTICS SYNERGIA AVEC FIREBASE ET DESIGN AUTHENTIQUE
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Eye,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  LineChart,
  Star,
  Flame,
  Trophy,
  BookOpen,
  Briefcase
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT SYNERGIA AUTHENTIQUE
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📈 COMPOSANT GRAPHIQUE SIMPLE
const SimpleChart = ({ data, color = '#8B5CF6', height = 60 }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <div className="flex items-end justify-between h-16 gap-1">
      {data.map((value, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-sm min-h-1"
          style={{
            height: `${((value - minValue) / range) * 100}%`,
            minHeight: '4px'
          }}
          initial={{ height: 0 }}
          animate={{ height: `${((value - minValue) / range) * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      ))}
    </div>
  );
};

// 📊 COMPOSANT GRAPHIQUE CIRCULAIRE
const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color = '#8B5CF6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(75, 85, 99, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS ANALYTICS
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalTasks: 0,
      completedTasks: 0,
      activeProjects: 0,
      teamMembers: 0,
      productivity: 0
    },
    performance: {
      weeklyXp: 0,
      monthlyXp: 0,
      totalXp: 0,
      level: 1,
      completionRate: 0,
      streak: 0
    },
    trends: {
      xpHistory: [],
      tasksHistory: [],
      projectsProgress: []
    }
  });

  // 📊 CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [ANALYTICS] Chargement des données depuis Firebase...');
    setLoading(true);

    // 1. Charger le profil utilisateur
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', user.uid)
    );
    
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUserProfile(userData);
        console.log('👤 [ANALYTICS] Profil utilisateur chargé:', userData.displayName);
      }
    });

    // 2. Charger les tâches
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      }));
      setTasks(tasksData);
      console.log('📋 [ANALYTICS] Tâches chargées:', tasksData.length);
    });

    // 3. Charger les projets
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      setProjects(projectsData);
      console.log('📁 [ANALYTICS] Projets chargés:', projectsData.length);
    });

    // 4. Charger la liste des utilisateurs
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      console.log('👥 [ANALYTICS] Utilisateurs chargés:', usersData.length);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTasks();
      unsubscribeProjects();
      unsubscribeUsers();
    };
  }, [user?.uid]);

  // 📊 CALCUL DES ANALYTICS EN TEMPS RÉEL
  const calculateAnalytics = useCallback(() => {
    if (!tasks.length && !projects.length) return;

    try {
      console.log('🔄 [ANALYTICS] Calcul des statistiques...');

      // Filtre par période
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Tâches de l'utilisateur dans la période
      const userTasks = tasks.filter(task => 
        task.assignedTo === user.uid || task.createdBy === user.uid
      );
      
      const periodTasks = userTasks.filter(task => 
        task.createdAt && task.createdAt >= startDate
      );

      const completedTasks = periodTasks.filter(task => task.status === 'completed');
      const totalTasks = periodTasks.length;

      // Projets actifs
      const activeProjects = projects.filter(project => 
        project.status === 'active' && 
        (project.members?.includes(user.uid) || project.createdBy === user.uid)
      ).length;

      // Calculs XP depuis le profil utilisateur
      const gamificationData = userProfile?.gamification || {};
      const weeklyXp = gamificationData.weeklyXp || 0;
      const monthlyXp = gamificationData.monthlyXp || 0;
      const totalXp = gamificationData.totalXp || 0;
      const level = gamificationData.level || 1;
      const streak = gamificationData.loginStreak || 1;

      // Taux de completion
      const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

      // Score de productivité
      const productivity = Math.min(100, Math.round(
        (completionRate * 0.4) + 
        (Math.min(level * 10, 50) * 0.3) + 
        (Math.min(streak * 5, 50) * 0.3)
      ));

      // Historique XP (7 derniers jours)
      const xpHistory = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayTasks = completedTasks.filter(task => {
          if (!task.updatedAt) return false;
          return task.updatedAt.toDateString() === date.toDateString();
        });
        
        const dayXp = dayTasks.reduce((total, task) => total + (task.xpReward || 15), 0);
        
        xpHistory.push({
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          xp: dayXp,
          tasks: dayTasks.length
        });
      }

      // Progression des projets
      const projectsProgress = projects
        .filter(project => project.members?.includes(user.uid) || project.createdBy === user.uid)
        .slice(0, 4)
        .map(project => {
          const projectTasks = tasks.filter(task => task.projectId === project.id);
          const projectCompleted = projectTasks.filter(task => task.status === 'completed');
          const progress = projectTasks.length > 0 ? 
            Math.round((projectCompleted.length / projectTasks.length) * 100) : 0;
          
          return {
            name: project.title || 'Projet sans nom',
            progress,
            tasks: projectTasks.length,
            icon: project.icon || '📁',
            status: project.status || 'active'
          };
        });

      setAnalyticsData({
        overview: {
          totalTasks,
          completedTasks: completedTasks.length,
          activeProjects,
          teamMembers: users.length,
          productivity
        },
        performance: {
          weeklyXp,
          monthlyXp,
          totalXp,
          level,
          completionRate,
          streak
        },
        trends: {
          xpHistory,
          tasksHistory: xpHistory.map(day => ({
            day: day.day,
            completed: day.tasks
          })),
          projectsProgress
        }
      });

      console.log('✅ [ANALYTICS] Statistiques calculées avec succès');

    } catch (error) {
      console.error('❌ [ANALYTICS] Erreur calcul statistiques:', error);
    }
  }, [tasks, projects, users, userProfile, user?.uid, timeRange]);

  // Recalculer quand les données changent
  useEffect(() => {
    if (user?.uid && !loading) {
      calculateAnalytics();
    }
  }, [user?.uid, loading, calculateAnalytics]);

  // 🔄 ACTUALISER LES DONNÉES
  const refreshData = () => {
    calculateAnalytics();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chargement des analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 📊 HEADER AVEC TITRE ET CONTRÔLES */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre principal */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Analytics & Performances
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Analysez vos performances et suivez vos progrès
                  </p>
                </div>
              </div>

              {/* Contrôles du header */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
                  {['7', '30', 'Année'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range === 'Année' ? '365' : range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        timeRange === (range === 'Année' ? '365' : range)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      {range} jour{range !== '7' && range !== 'Année' ? 's' : range === 'Année' ? '' : ''}
                    </button>
                  ))}
                </div>

                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {analyticsData.overview.completedTasks}/{analyticsData.overview.totalTasks}
                </div>
                <div className="text-gray-400 text-sm font-medium">Tâches complétées</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${analyticsData.performance.completionRate}%` }}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {analyticsData.overview.productivity}%
                </div>
                <div className="text-gray-400 text-sm font-medium">Score productivité</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${analyticsData.overview.productivity}%` }}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {analyticsData.performance.weeklyXp.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm font-medium">XP cette semaine</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (analyticsData.performance.weeklyXp / 200) * 100)}%` }}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Briefcase className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {analyticsData.overview.activeProjects}
                </div>
                <div className="text-gray-400 text-sm font-medium">Projets actifs</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 📈 CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNE GAUCHE - Graphiques principaux */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Évolution de l'XP */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <LineChart className="h-6 w-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Évolution de l'XP</h3>
                  </div>
                  <div className="text-sm text-gray-400">
                    {timeRange} derniers jours
                  </div>
                </div>

                <div className="mb-6">
                  <SimpleChart 
                    data={analyticsData.trends.xpHistory.map(day => day.xp)} 
                    color="#8B5CF6" 
                  />
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400">
                  {analyticsData.trends.xpHistory.map((day, index) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium">{day.day}</div>
                      <div className="text-blue-400">{day.xp}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Performance des Tâches */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-6 w-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Performance des Tâches</h3>
                </div>

                <div className="space-y-4">
                  {analyticsData.trends.tasksHistory.map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-sm text-gray-400 font-medium">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-300">{day.completed} tâche(s)</span>
                          <span className="text-green-400">{day.completed > 0 ? '✓' : '○'}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (day.completed / 5) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* COLONNE DROITE - Profil et projets */}
            <div className="space-y-8">
              
              {/* Profil utilisateur */}
              <motion.div
                className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mon Profil</h3>
                    <p className="text-blue-100 text-sm">
                      {userProfile?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {analyticsData.performance.level}
                    </div>
                    <div className="text-blue-100 text-sm">Niveau actuel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {analyticsData.performance.totalXp.toLocaleString()}
                    </div>
                    <div className="text-blue-100 text-sm">XP Total</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold mb-1">
                    {analyticsData.performance.streak} jour{analyticsData.performance.streak > 1 ? 's' : ''}
                  </div>
                  <div className="text-blue-100 text-sm flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4" />
                    Série de connexions
                  </div>
                </div>
              </motion.div>

              {/* Projets en cours */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Projets en Cours</h3>
                </div>

                <div className="space-y-4">
                  {analyticsData.trends.projectsProgress.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-gray-400 text-sm">Aucun projet actif</p>
                    </div>
                  ) : (
                    analyticsData.trends.projectsProgress.map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{project.icon}</span>
                            <span className="text-white font-medium text-sm">
                              {project.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-white">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{project.tasks} tâche{project.tasks > 1 ? 's' : ''}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-gray-900/30 text-gray-400'
                          }`}>
                            {project.status === 'active' ? '🚀 Actif' : '⏸️ Pause'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {analyticsData.overview.activeProjects > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="text-center text-xs text-gray-400">
                      {analyticsData.overview.activeProjects} projet{analyticsData.overview.activeProjects > 1 ? 's' : ''} actif{analyticsData.overview.activeProjects > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* SECTION INSIGHTS */}
          <motion.div
            className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Insights & Recommandations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Performance Excellente</span>
                </div>
                <p className="text-sm text-gray-300">
                  {analyticsData.performance.completionRate >= 80 
                    ? `Félicitations ! Votre taux de complétion de ${analyticsData.performance.completionRate}% est excellent.`
                    : analyticsData.performance.completionRate >= 60
                    ? `Bon travail ! Continuez sur cette lancée pour améliorer votre productivité.`
                    : `Vous pouvez améliorer votre productivité en organisant mieux vos tâches.`
                  }
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Objectifs</span>
                </div>
                <p className="text-sm text-gray-300">
                  {analyticsData.overview.activeProjects > 0
                    ? `Vous gérez ${analyticsData.overview.activeProjects} projet${analyticsData.overview.activeProjects > 1 ? 's' : ''} actif${analyticsData.overview.activeProjects > 1 ? 's' : ''}.`
                    : 'Commencez par créer votre premier projet pour organiser votre travail.'
                  }
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Prochain Niveau</span>
                </div>
                <p className="text-sm text-gray-300">
                  Encore {Math.max(0, (analyticsData.performance.level * 100) - analyticsData.performance.totalXp)} XP pour le niveau {analyticsData.performance.level + 1} !
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
