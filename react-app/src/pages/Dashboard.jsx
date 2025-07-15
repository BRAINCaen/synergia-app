// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD AVEC IMPORTS CORRIGÉS - TypeError: l is not a function RÉSOLU
// ==========================================

import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';

// Layouts et stores
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

// Services
import { analyticsService } from '../core/services/analyticsService.js';
import { projectService } from '../core/services/projectService.js';

/**
 * 🎯 COMPOSANTS DASHBOARD LOCAUX SÉCURISÉS
 * Pour éviter les erreurs d'imports/exports circulaires
 */

// ✅ Composant Leaderboard local simplifié
const DashboardLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealTopPerformers = async () => {
      try {
        setLoading(true);
        
        // 🔥 CHARGER LES VRAIS TOP PERFORMERS DEPUIS FIREBASE
        const topPerformersData = await analyticsService.getTopPerformers(5);
        
        console.log('🏆 Chargement VRAIS top performers depuis Firebase...');
        console.log('✅ VRAIS top performers chargés:', topPerformersData.length);
        
        setTopUsers(topPerformersData || []);
      } catch (error) {
        console.error('❌ Erreur chargement top performers:', error);
        setTopUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealTopPerformers();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Top Performers</h3>
      </div>
      
      <div className="space-y-3">
        {topUsers.map((user, index) => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xs">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white text-sm">{user.name}</div>
              <div className="text-xs text-gray-400">Niveau {user.level}</div>
            </div>
            <div className="text-yellow-400 font-medium text-sm">{user.xp} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Composant Badges local simplifié
const DashboardBadges = () => {
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockBadges = [
      { id: '1', name: 'Premier pas', icon: '🏆', unlocked: true },
      { id: '2', name: 'Productif', icon: '⚡', unlocked: true },
      { id: '3', name: 'Collaborateur', icon: '🤝', unlocked: false }
    ];
    
    setTimeout(() => {
      setRecentBadges(mockBadges);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Medal className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Badges Récents</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {recentBadges.map(badge => (
          <div
            key={badge.id}
            className={`p-2 rounded-lg text-center ${
              badge.unlocked 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}
          >
            <div className="text-lg mb-1">{badge.icon}</div>
            <div className={`text-xs font-medium ${
              badge.unlocked ? 'text-yellow-400' : 'text-gray-500'
            }`}>
              {badge.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Composant Stats Card
const StatCard = ({ title, value, icon, color = 'blue', trend = null }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`flex items-center text-xs ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
      <div className={`text-${color}-400`}>
        {icon}
      </div>
    </div>
  </div>
);

/**
 * 🏠 COMPOSANT PRINCIPAL DASHBOARD
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Charger les analytics
        const analyticsData = await analyticsService.getGlobalMetrics(user.uid);
        setAnalytics(analyticsData);

        // Charger les projets
        const projectsData = await projectService.getUserProjects(user.uid);
        setProjects(projectsData);

      } catch (error) {
        console.error('❌ Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid]);

  if (loading) {
    return (
      <PremiumLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Home className="w-8 h-8 text-blue-400" />
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Bienvenue, {user?.displayName || user?.email?.split('@')[0]} !
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Tâches totales"
            value={analytics?.totalTasks || 0}
            icon={<Target className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Tâches terminées"
            value={analytics?.completedTasks || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            trend={15}
          />
          <StatCard
            title="Projets actifs"
            value={projects.length || 0}
            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="XP Total"
            value={analytics?.totalXp || 0}
            icon={<Zap className="w-6 h-6" />}
            color="yellow"
            trend={8}
          />
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projets récents */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Projets Récents</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun projet pour le moment</p>
                  <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                    Créer un projet
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 5).map(project => (
                    <div key={project.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{project.title}</div>
                        <div className="text-sm text-gray-400">{project.status}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{project.progress || 0}%</div>
                        <div className="text-xs text-gray-400">progression</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <DashboardLeaderboard />
            
            {/* Badges */}
            <DashboardBadges />
            
            {/* Activité récente */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Activité Récente</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">Tâche terminée</span>
                  <span className="text-gray-500 ml-auto">il y a 2h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-gray-300">Nouveau projet créé</span>
                  <span className="text-gray-500 ml-auto">il y a 1j</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-300">Badge débloqué</span>
                  <span className="text-gray-500 ml-auto">il y a 3j</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default Dashboard;
