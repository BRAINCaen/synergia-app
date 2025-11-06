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

  // Vérification des permissions admin
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
      
      // Charger les vraies statistiques depuis Firebase
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

  // Cards de statistiques rapides - DESIGN EXACT SYNERGIA
  const quickStats = [
    {
      label: 'Utilisateurs Actifs',
      value: stats.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Tâches Actives',
      value: stats.activeTasks,
      icon: Activity,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'En Attente',
      value: stats.pendingValidations,
      icon: Clock,
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      label: 'Santé Système',
      value: `${stats.systemHealth}%`,
      icon: Database,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  // Grille des actions admin - DESIGN EXACT SYNERGIA
  const adminActions = [
    {
      title: 'Validation Tâches',
      description: 'Approuver les tâches en attente',
      icon: CheckCircle2,
      path: '/admin/task-validation',
      bgColor: 'bg-green-500'
    },
    {
      title: 'Validation Objectifs',
      description: 'Validation des objectifs utilisateur',
      icon: Target,
      path: '/admin/objective-validation',
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Analytics Admin',
      description: 'Statistiques avancées',
      icon: BarChart3,
      path: '/admin/analytics',
      bgColor: 'bg-pink-500'
    },
    {
      title: 'Permissions & Rôles',
      description: 'Gestion des droits utilisateur',
      icon: Shield,
      path: '/admin/role-permissions',
      bgColor: 'bg-orange-500'
    },
    {
      title: 'Paramètres Système',
      description: 'Configuration globale',
      icon: Settings,
      path: '/admin/settings',
      bgColor: 'bg-gray-500'
    },
    {
      title: 'Synchronisation',
      description: 'Gestion des données et sync Firebase',
      icon: RefreshCw,
      path: '/admin/sync',
      bgColor: 'bg-cyan-500'
    }
  ];

  // Actions rapides - DESIGN EXACT SYNERGIA
  const quickActions = [
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'text-purple-600'
    },
    {
      label: 'Permissions',
      icon: Lock,
      path: '/admin/role-permissions',
      color: 'text-red-600'
    },
    {
      label: 'Paramètres',
      icon: Cog,
      path: '/admin/settings',
      color: 'text-gray-600'
    },
    {
      label: 'Vue Utilisateur',
      icon: Eye,
      path: '/dashboard',
      color: 'text-blue-600'
    }
  ];

  // Protection d'accès
  if (!user || !isAdmin(user)) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md border"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas les permissions administrateur requises.</p>
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
      <div className="min-h-screen bg-white p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header - DESIGN EXACT */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Administration Synergia
              </h1>
              <p className="text-gray-600 text-sm">
                Panneau de contrôle administrateur
              </p>
            </div>
            
            <button
              onClick={loadAdminStats}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </motion.div>

          {/* Statistiques Rapides - DESIGN EXACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-center"
              >
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">{stat.label}</p>
                  <div className="flex items-center justify-center">
                    <div className={`${stat.bgColor} rounded-xl p-4 inline-block`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Outils d'Administration - DESIGN EXACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Outils d'Administration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActions.map((action, index) => (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    to={action.path}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className={`${action.bgColor} rounded-xl p-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Accès Rapide - DESIGN EXACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Accès Rapide
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <action.icon className={`w-8 h-8 ${action.color}`} />
                  <span className="text-sm text-gray-700 font-medium text-center">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Footer Admin */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center text-xs text-gray-500"
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
