// ==========================================
// 📁 react-app/src/pages/AdminAnalyticsPage.jsx
// PAGE ANALYTICS ADMINISTRATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Trophy, 
  Star, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Award,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

// Firebase
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    max-width: 400px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

/**
 * 📊 PAGE ANALYTICS ADMINISTRATION
 */
const AdminAnalyticsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [analytics, setAnalytics] = useState({
    users: {
      total: 0,
      active: 0,
      newThisWeek: 0,
      newThisMonth: 0,
      retention: 0
    },
    tasks: {
      total: 0,
      completed: 0,
      pending: 0,
      completionRate: 0
    },
    badges: {
      total: 0,
      awarded: 0,
      popular: []
    },
    roles: {
      distribution: {},
      mostActive: [],
      performance: {}
    },
    activity: {
      dailyActive: [],
      weeklyTrends: [],
      peakHours: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('users');

  /**
   * 📊 CHARGER LES ANALYTICS
   */
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Chargement des analytics...');
      
      // Calculer les dates
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // 👥 ANALYTICS UTILISATEURS
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let totalUsers = 0;
      let activeUsers = 0;
      let newThisWeek = 0;
      let newThisMonth = 0;
      const roleDistribution = {};
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const createdAt = userData.createdAt?.toDate?.() || new Date();
        
        totalUsers++;
        
        if (userData.status === 'active' || !userData.status) {
          activeUsers++;
        }
        
        if (createdAt >= oneWeekAgo) {
          newThisWeek++;
        }
        
        if (createdAt >= oneMonthAgo) {
          newThisMonth++;
        }
        
        // Distribution des rôles Synergia
        const userRoles = userData.synergiaRoles || [];
        userRoles.forEach(role => {
          if (!roleDistribution[role.roleId]) {
            roleDistribution[role.roleId] = 0;
          }
          roleDistribution[role.roleId]++;
        });
      });
      
      // 📋 ANALYTICS TÂCHES
      const tasksRef = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      let totalTasks = 0;
      let completedTasks = 0;
      let pendingTasks = 0;
      
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        totalTasks++;
        
        if (taskData.status === 'completed') {
          completedTasks++;
        } else {
          pendingTasks++;
        }
      });
      
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // 🏆 ANALYTICS BADGES
      const badgesRef = collection(db, 'badges');
      const badgesSnapshot = await getDocs(badgesRef);
      
      let totalBadges = 0;
      let totalAwarded = 0;
      const badgePopularity = [];
      
      badgesSnapshot.forEach(doc => {
        const badgeData = doc.data();
        totalBadges++;
        
        const earnedCount = badgeData.earnedCount || 0;
        totalAwarded += earnedCount;
        
        if (earnedCount > 0) {
          badgePopularity.push({
            id: doc.id,
            name: badgeData.name,
            icon: badgeData.icon,
            earnedCount
          });
        }
      });
      
      // Trier les badges par popularité
      badgePopularity.sort((a, b) => b.earnedCount - a.earnedCount);
      
      // Calculer la rétention (simulation)
      const retention = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
      
      // Mettre à jour les analytics
      setAnalytics({
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisWeek,
          newThisMonth,
          retention: Math.round(retention)
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          completionRate: Math.round(completionRate)
        },
        badges: {
          total: totalBadges,
          awarded: totalAwarded,
          popular: badgePopularity.slice(0, 5)
        },
        roles: {
          distribution: roleDistribution,
          mostActive: Object.entries(roleDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([roleId, count]) => ({ roleId, count })),
          performance: {}
        },
        activity: {
          dailyActive: generateMockDailyData(),
          weeklyTrends: generateMockWeeklyData(),
          peakHours: generateMockHourlyData()
        }
      });
      
      console.log('✅ Analytics chargés avec succès');
      
    } catch (error) {
      console.error('❌ Erreur chargement analytics:', error);
      showNotification('Erreur lors du chargement des analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📈 GÉNÉRER DES DONNÉES SIMULÉES POUR LES GRAPHIQUES
   */
  const generateMockDailyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        users: Math.floor(Math.random() * 50) + 10,
        tasks: Math.floor(Math.random() * 30) + 5
      });
    }
    return data;
  };

  const generateMockWeeklyData = () => {
    const data = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      data.push({
        week: `S${4-i}`,
        engagement: Math.floor(Math.random() * 40) + 60,
        completion: Math.floor(Math.random() * 30) + 70
      });
    }
    return data;
  };

  const generateMockHourlyData = () => {
    const hours = ['9h', '12h', '15h', '18h', '21h'];
    return hours.map(hour => ({
      hour,
      activity: Math.floor(Math.random() * 50) + 20
    }));
  };

  /**
   * 📊 EXPORTER LES DONNÉES
   */
  const exportData = () => {
    const dataToExport = {
      generated: new Date().toISOString(),
      analytics,
      summary: {
        totalUsers: analytics.users.total,
        activeUsers: analytics.users.active,
        completionRate: analytics.tasks.completionRate,
        badgesAwarded: analytics.badges.awarded
      }
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `synergia-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Données exportées avec succès', 'success');
  };

  // Charger les données au montage
  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 📊 Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-10 h-10 text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Analytics Administration
                </h1>
                <p className="text-gray-400 mt-2">
                  Tableau de bord et métriques de performance
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
                <option value="year">12 derniers mois</option>
              </select>
              
              <button 
                onClick={loadAnalytics}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
              
              <button 
                onClick={exportData}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📈 Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Utilisateurs totaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Utilisateurs totaux</p>
                <p className="text-3xl font-bold text-white">{analytics.users.total}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analytics.users.newThisWeek} cette semaine
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-400" />
            </div>
          </motion.div>

          {/* Taux de completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Taux de completion</p>
                <p className="text-3xl font-bold text-white">{analytics.tasks.completionRate}%</p>
                <p className="text-blue-400 text-sm flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {analytics.tasks.completed} tâches terminées
                </p>
              </div>
              <Target className="w-12 h-12 text-green-400" />
            </div>
          </motion.div>

          {/* Badges attribués */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Badges attribués</p>
                <p className="text-3xl font-bold text-white">{analytics.badges.awarded}</p>
                <p className="text-yellow-400 text-sm flex items-center mt-1">
                  <Trophy className="w-3 h-3 mr-1" />
                  {analytics.badges.total} badges disponibles
                </p>
              </div>
              <Award className="w-12 h-12 text-yellow-400" />
            </div>
          </motion.div>

          {/* Rétention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rétention</p>
                <p className="text-3xl font-bold text-white">{analytics.users.retention}%</p>
                <p className="text-purple-400 text-sm flex items-center mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {analytics.users.active} utilisateurs actifs
                </p>
              </div>
              <Star className="w-12 h-12 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {/* 📊 Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activité quotidienne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Activité quotidienne</h3>
              <LineChart className="w-5 h-5 text-blue-400" />
            </div>
            
            <div className="space-y-4">
              {analytics.activity.dailyActive.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm w-12">{day.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.users / 60) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white text-sm w-8 text-right">{day.users}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Distribution des rôles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Rôles les plus actifs</h3>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            
            <div className="space-y-4">
              {analytics.roles.mostActive.map((role, index) => (
                <div key={role.roleId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-300 text-sm capitalize">{role.roleId}</span>
                  </div>
                  <span className="text-white font-medium">{role.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 🏆 Badges populaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Badges les plus attribués</h3>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analytics.badges.popular.map((badge, index) => (
              <div key={badge.id} className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="text-white font-medium text-sm mb-1">{badge.name}</h4>
                <p className="text-yellow-400 text-lg font-bold">{badge.earnedCount}</p>
                <p className="text-gray-400 text-xs">attribués</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 📈 Tendances d'engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Heures de pointe</h3>
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {analytics.activity.peakHours.map((hour, index) => (
              <div key={hour.hour} className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div 
                    className="bg-green-500 rounded-lg mx-auto transition-all duration-500"
                    style={{ 
                      height: `${(hour.activity / 70) * 80}px`,
                      width: '20px'
                    }}
                  ></div>
                </div>
                <span className="text-gray-300 text-sm">{hour.hour}</span>
                <p className="text-white text-xs">{hour.activity}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
