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
  Trophy,
  FileText,
  Zap,
  RefreshCw,
  Eye,
  UserCheck,
  Calendar,
  TrendingUp,
  Award,
  Cog
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

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
  }, [user]);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      
      // Simulation des statistiques admin
      // Dans une vraie app, ces données viendraient de Firebase
      setTimeout(() => {
        setStats({
          totalUsers: 127,
          activeTasks: 1543,
          pendingValidations: 23,
          systemHealth: 98
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erreur chargement stats admin:', error);
      setLoading(false);
    }
  };

  // Grille des actions admin disponibles
  const adminActions = [
    {
      title: 'Validation Tâches',
      description: 'Approuver les tâches en attente',
      icon: CheckCircle2,
      path: '/admin/task-validation',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: stats.pendingValidations
    },
    {
      title: 'Validation Objectifs',
      description: 'Validation des objectifs utilisateur',
      icon: Target,
      path: '/admin/objective-validation',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: null
    },
    {
      title: 'Gestion Utilisateurs',
      description: 'Administration des comptes',
      icon: Users,
      path: '/admin/users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: stats.totalUsers
    },
    {
      title: 'Gestion Badges',
      description: 'Configuration du système de badges',
      icon: Trophy,
      path: '/admin/badges',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      count: null
    },
    {
      title: 'Analytics Admin',
      description: 'Statistiques avancées',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      count: null
    },
    {
      title: 'Permissions & Rôles',
      description: 'Gestion des droits utilisateur',
      icon: Shield,
      path: '/admin/role-permissions',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      count: null
    },
    {
      title: 'Gestion Récompenses',
      description: 'Configuration des rewards',
      icon: Award,
      path: '/admin/rewards',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      count: null
    },
    {
      title: 'Paramètres Système',
      description: 'Configuration globale',
      icon: Settings,
      path: '/admin/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      count: null
    },
    {
      title: 'Test Complet',
      description: 'Suite de tests système',
      icon: Zap,
      path: '/admin/complete-test',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      count: null
    }
  ];

  // Cards de statistiques rapides
  const quickStats = [
    {
      label: 'Utilisateurs Actifs',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Tâches Actives',
      value: stats.activeTasks,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'En Attente',
      value: stats.pendingValidations,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Santé Système',
      value: `${stats.systemHealth}%`,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Protection d'accès
  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions administrateur requises.</p>
          <Link 
            to="/dashboard" 
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Administration Synergia
                </h1>
                <p className="text-gray-600">
                  Panneau de contrôle administrateur - Bienvenue {user?.displayName || user?.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={loadAdminStats}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </motion.div>

        {/* Statistiques Rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Alerte Urgente si validations en attente */}
        {stats.pendingValidations > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900">
                  {stats.pendingValidations} validation(s) en attente
                </h3>
                <p className="text-sm text-orange-700">
                  Des tâches nécessitent votre validation pour débloquer les utilisateurs.
                </p>
              </div>
              <Link
                to="/admin/task-validation"
                className="ml-auto bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Outils d'Administration
          </h2>
          
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
                  className="block bg-white rounded-lg border p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {action.title}
                        </h3>
                        {action.count !== null && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {action.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
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
          className="mt-12 bg-white rounded-lg border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Accès Rapide
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              to="/admin/complete-test"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-6 h-6 text-orange-600" />
              <span className="text-sm text-gray-700">Test Système</span>
            </Link>
            
            <Link
              to="/admin/analytics"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <span className="text-sm text-gray-700">Analytics</span>
            </Link>
            
            <Link
              to="/admin/users"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="w-6 h-6 text-purple-600" />
              <span className="text-sm text-gray-700">Utilisateurs</span>
            </Link>
            
            <Link
              to="/admin/settings"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Cog className="w-6 h-6 text-gray-600" />
              <span className="text-sm text-gray-700">Paramètres</span>
            </Link>
            
            <Link
              to="/dashboard"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-700">Vue Utilisateur</span>
            </Link>
            
            <Link
              to="/admin/badges"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trophy className="w-6 h-6 text-yellow-600" />
              <span className="text-sm text-gray-700">Badges</span>
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
  );
};

export default AdminPage;
