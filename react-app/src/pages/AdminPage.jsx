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
  Lock,
  TrendingUp
} from 'lucide-react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../shared/config/firebase';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import Layout from '../shared/components/Layout';

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
        systemHealth: 98 // Calculé dynamiquement si besoin
      });
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement stats admin:', error);
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    // Écoute en temps réel des validations en attente
    const pendingQuery = query(collection(db, 'tasks'), where('status', '==', 'pending_validation'));
    
    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        pendingValidations: snapshot.size
      }));
    });

    return () => unsubscribe();
  };

  // Grille des actions admin disponibles - UNIQUEMENT LES VRAIES PAGES
  const adminActions = [
    {
      title: 'Validation Tâches',
      description: 'Approuver les tâches en attente',
      icon: CheckCircle2,
      path: '/admin/task-validation',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      count: stats.pendingValidations
    },
    {
      title: 'Validation Objectifs',
      description: 'Validation des objectifs utilisateur',
      icon: Target,
      path: '/admin/objective-validation',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      count: null
    },
    {
      title: 'Analytics Admin',
      description: 'Statistiques avancées',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      count: null
    },
    {
      title: 'Permissions & Rôles',
      description: 'Gestion des droits utilisateur',
      icon: Shield,
      path: '/admin/role-permissions',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      count: null
    },
    {
      title: 'Paramètres Système',
      description: 'Configuration globale',
      icon: Settings,
      path: '/admin/settings',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      count: null
    },
    {
      title: 'Synchronisation',
      description: 'Gestion des données et sync Firebase',
      icon: RefreshCw,
      path: '/admin/sync',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      count: null
    }
  ];

  // Cards de statistiques rapides
  const quickStats = [
    {
      label: 'Utilisateurs Actifs',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Tâches Actives',
      value: stats.activeTasks,
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'En Attente',
      value: stats.pendingValidations,
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      label: 'Santé Système',
      value: `${stats.systemHealth}%`,
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  // Protection d'accès
  if (!user || !isAdmin(user)) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/40 backdrop-blur-xl border border-red-500/20 p-8 rounded-2xl text-center max-w-md"
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Accès Refusé</h2>
            <p className="text-gray-400 mb-6">Vous n'avez pas les permissions administrateur requises.</p>
            <Link 
              to="/dashboard" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Administration Synergia
                  </h1>
                  <p className="text-gray-400">
                    Panneau de contrôle administrateur
                  </p>
                </div>
              </div>
              
              <button
                onClick={loadAdminStats}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </motion.div>

          {/* Statistiques Rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`bg-gray-800/40 backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Alerte Urgente si validations en attente */}
          {stats.pendingValidations > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-4 mb-8"
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
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors whitespace-nowrap"
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
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Outils d'Administration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminActions.map((action, index) => (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    to={action.path}
                    className={`block bg-gray-800/40 backdrop-blur-xl border ${action.borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-200`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${action.bgColor}`}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">
                            {action.title}
                          </h3>
                          {action.count !== null && action.count > 0 && (
                            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/20">
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
            className="mt-8 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Accès Rapide
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/analytics"
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-700/30 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-gray-300">Analytics</span>
              </Link>
              
              <Link
                to="/admin/role-permissions"
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-700/30 transition-colors"
              >
                <Lock className="w-6 h-6 text-red-400" />
                <span className="text-sm text-gray-300">Permissions</span>
              </Link>
              
              <Link
                to="/admin/settings"
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-700/30 transition-colors"
              >
                <Cog className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-300">Paramètres</span>
              </Link>
              
              <Link
                to="/dashboard"
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-700/30 transition-colors"
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
