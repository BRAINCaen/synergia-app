// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD SIMPLE ET FONCTIONNEL - SANS DOUBLE LAYOUT
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

// Imports Firebase
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores uniquement
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎯 COMPOSANTS DASHBOARD INTERNES
 */

// Composant StatCard simple
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <p className="text-green-400 text-sm mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{trend}%
          </p>
        )}
      </div>
      {Icon && <Icon className={`w-8 h-8 ${color}`} />}
    </div>
  </div>
);

// Composant Card simple
const DashboardCard = ({ title, children, icon: Icon }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon className="w-5 h-5 text-blue-400" />}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

/**
 * 🏠 COMPOSANT PRINCIPAL DASHBOARD
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    totalXP: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Chargement des données
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        console.log('🔄 Chargement Dashboard pour:', user.uid);

        // Simuler des données pour l'instant
        setTimeout(() => {
          setStats({
            totalTasks: 24,
            completedTasks: 18,
            activeProjects: 3,
            totalXP: 1250
          });

          setRecentActivities([
            { id: 1, type: 'task', message: 'Tâche "Setup Firebase" terminée', time: '2h', color: 'green' },
            { id: 2, type: 'project', message: 'Nouveau projet "Website Redesign" créé', time: '1j', color: 'blue' },
            { id: 3, type: 'badge', message: 'Badge "First Sprint" débloqué', time: '3j', color: 'yellow' },
            { id: 4, type: 'team', message: 'Nouveau membre ajouté à l\'équipe', time: '5j', color: 'purple' }
          ]);

          setLoading(false);
          console.log('✅ Dashboard chargé avec succès');
        }, 1000);

      } catch (error) {
        console.error('❌ Erreur chargement dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                <div>
                  <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-700 rounded-lg"></div>
              <div className="h-64 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-1 text-lg">
                Bienvenue, {user?.displayName || user?.email?.split('@')[0]} !
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Aujourd'hui
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tâches totales"
            value={stats.totalTasks}
            icon={Target}
            color="text-blue-400"
            trend={12}
          />
          <StatCard
            title="Terminées"
            value={stats.completedTasks}
            icon={CheckCircle}
            color="text-green-400"
            trend={8}
          />
          <StatCard
            title="Projets actifs"
            value={stats.activeProjects}
            icon={BarChart3}
            color="text-purple-400"
            trend={25}
          />
          <StatCard
            title="XP Total"
            value={stats.totalXP}
            icon={Star}
            color="text-yellow-400"
            trend={15}
          />
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progression */}
            <DashboardCard title="Progression Générale" icon={TrendingUp}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Taux de completion</span>
                  <span className="text-white font-semibold">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
                    <div className="text-xs text-gray-400">Terminées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.totalTasks - stats.completedTasks}</div>
                    <div className="text-xs text-gray-400">En cours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.activeProjects}</div>
                    <div className="text-xs text-gray-400">Projets</div>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Projets récents */}
            <DashboardCard title="Projets Récents" icon={BarChart3}>
              <div className="space-y-3">
                {['Refonte Site Web', 'App Mobile V2', 'Dashboard Analytics'].map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{project}</div>
                        <div className="text-gray-400 text-sm">Mise à jour il y a {index + 1}j</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{85 - index * 10}%</div>
                      <div className="text-xs text-gray-400">progression</div>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activité récente */}
            <DashboardCard title="Activité Récente" icon={Activity}>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full bg-${activity.color}-400`}></div>
                    <span className="text-gray-300 flex-1">{activity.message}</span>
                    <span className="text-gray-500">il y a {activity.time}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Performance */}
            <DashboardCard title="Performance" icon={Trophy}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cette semaine</span>
                  <span className="text-green-400 font-semibold">+12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ce mois</span>
                  <span className="text-blue-400 font-semibold">+8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Objectif annuel</span>
                  <span className="text-purple-400 font-semibold">65%</span>
                </div>
              </div>
            </DashboardCard>

            {/* Actions rapides */}
            <DashboardCard title="Actions Rapides" icon={Zap}>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white flex items-center gap-3">
                  <Plus className="w-4 h-4" />
                  Créer une tâche
                </button>
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  Nouveau projet
                </button>
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  Inviter équipe
                </button>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
