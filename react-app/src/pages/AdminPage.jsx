// ==========================================
// 📁 react-app/src/pages/AdminPage.jsx
// PAGE ADMIN PRINCIPALE - DASHBOARD ADMINISTRATEUR
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Activity,
  BarChart3,
  Settings,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  RefreshCw,
  Eye,
  Cog,
  Lock
} from 'lucide-react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import Layout from '../components/layout/Layout';

/**
 * 🛡️ PAGE ADMIN PRINCIPALE - DASHBOARD ADMINISTRATEUR
 */
const AdminPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTasks: 0,
    pendingValidations: 0,
    systemHealth: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      console.warn('🚫 Accès refusé - permissions admin requises');
      return;
    }
    
    loadAdminStats();
    setupRealtimeListeners();
  }, [user]);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      
      const [usersSnapshot, tasksSnapshot, pendingSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'tasks')),
        getDocs(query(collection(db, 'tasks'), where('status', '==', 'pending_validation')))
      ]);

      setStats({
        totalUsers: usersSnapshot.size,
        activeTasks: tasksSnapshot.size,
        pendingValidations: pendingSnapshot.size,
        systemHealth: 98
      });
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement stats admin:', error);
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    const pendingQuery = query(collection(db, 'tasks'), where('status', '==', 'pending_validation'));
    
    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        pendingValidations: snapshot.size
      }));
    });

    return () => unsubscribe();
  };

  // Cards de statistiques rapides - CHARTE GRAPHIQUE SYNERGIA
  const quickStats = [
    {
      label: 'Utilisateurs Actifs',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Tâches Actives',
      value: stats.activeTasks,
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'En Attente',
      value: stats.pendingValidations,
      icon: Clock,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      label: 'Santé Système',
      value: `${stats.systemHealth}%`,
      icon: Database,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  // Grille des actions admin - CHARTE GRAPHIQUE SYNERGIA
  const adminActions = [
    {
      title: 'Validation Tâches',
      description: 'Approuver les tâches en attente',
      icon: CheckCircle2,
      path: '/admin/task-validation',
      count: stats.pendingValidations
    },
    {
      title: 'Validation Objectifs',
      description: 'Validation des objectifs utilisateur',
      icon: Target,
      path: '/admin/objective-validation'
    },
    {
      title: 'Analytics Admin',
      description: 'Statistiques avancées',
      icon: BarChart3,
      path: '/admin/analytics'
    },
    {
      title: 'Permissions & Rôles',
      description: 'Gestion des droits utilisateur',
      icon: Shield,
      path: '/admin/role-permissions'
    },
    {
      title: 'Paramètres Système',
      description: 'Configuration globale',
      icon: Settings,
      path: '/admin/settings'
    },
    {
      title: 'Synchronisation',
      description: 'Gestion des données et sync Firebase',
      icon: RefreshCw,
      path: '/admin/sync'
    }
  ];

  // Protection d'accès
  if (!user || !isAdmin(user)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center max-w-md"
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Accès Refusé</h2>
            <p className="text-gray-400 mb-6">Vous n'avez pas les permissions administrateur requises.</p>
            <Link 
              to="/dashboard" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au Dashboard
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🛡️ Administration Synergia
                </h1>
                <p className="text-gray-400">
                  Panneau de contrôle administrateur
                </p>
              </div>
              
              <button
                onClick={loadAdminStats}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Statistiques Rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 text-white`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="w-6 h-6" />
                  <h3 className="text-sm font-medium opacity-90">{stat.label}</h3>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {loading ? '...' : stat.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Alerte Urgente si validations en attente */}
          {stats.pendingValidations > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4 mb-8"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-orange-300">
                    {stats.pendingValidations} validation(s) en attente
                  </h3>
                  <p className="text-sm text-orange-400/80">
                    Des tâches nécessitent votre validation pour débloquer les utilisateurs.
                  </p>
                </div>
                <Link
                  to="/admin/task-validation"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
                >
                  Traiter
                </Link>
              </div>
            </motion.div>
          )}

          {/* Grille des Actions Admin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Outils d'Administration
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminActions.map((action, index) => (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    to={action.path}
                    className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-600/20 rounded-lg">
                        <action.icon className="w-6 h-6 text-blue-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">
                            {action.title}
                          </h3>
                          {action.count > 0 && (
                            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/50">
                              {action.count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section Accès Rapide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Accès Rapide
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/analytics"
                className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-gray-300">Analytics</span>
              </Link>
              
              <Link
                to="/admin/role-permissions"
                className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <Lock className="w-6 h-6 text-red-400" />
                <span className="text-sm text-gray-300">Permissions</span>
              </Link>
              
              <Link
                to="/admin/settings"
                className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <Cog className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-300">Paramètres</span>
              </Link>
              
              <Link
                to="/dashboard"
                className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <Eye className="w-6 h-6 text-blue-400" />
                <span className="text-sm text-gray-300">Vue Utilisateur</span>
              </Link>
            </div>
          </motion.div>

          {/* Footer Admin */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>Synergia v3.5 - Interface Administrateur</p>
            <p>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
