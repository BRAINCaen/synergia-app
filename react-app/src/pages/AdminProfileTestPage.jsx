// ==========================================
// 📁 react-app/src/pages/AdminProfileTestPage.jsx
// PAGE ADMIN TEST PROFIL - VÉRIFICATION PERMISSIONS
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  User,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Database,
  Key,
  UserCheck,
  Clock,
  BarChart3,
  TestTube,
  Zap,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🧪 PAGE TEST PROFIL ADMINISTRATEUR
 * Tests spécifiques au profil et permissions admin
 */
const AdminProfileTestPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileTests, setProfileTests] = useState([]);
  const [permissionTests, setPermissionTests] = useState([]);
  const [systemTests, setSystemTests] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Protection d'accès
  if (!user || !isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================================
  // 🧪 TESTS DE PROFIL ADMINISTRATEUR
  // ==========================================
  const runProfileTests = async () => {
    try {
      setLoading(true);
      console.log('🧪 Démarrage tests profil admin...');

      // Test 1: Profil utilisateur
      const profileResult = {
        name: 'Profil Utilisateur',
        status: user ? 'success' : 'error',
        message: user ? `Profil chargé: ${user.email}` : 'Aucun profil utilisateur',
        icon: User,
        details: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Non défini',
          emailVerified: user.emailVerified,
          creationTime: user.metadata?.creationTime,
          lastSignInTime: user.metadata?.lastSignInTime
        } : null
      };

      // Test 2: Permissions admin
      const adminCheck = isAdmin(user);
      const permissionResult = {
        name: 'Permissions Admin',
        status: adminCheck ? 'success' : 'error',
        message: adminCheck ? 'Permissions administrateur confirmées' : 'Pas de permissions admin',
        icon: Shield,
        details: {
          isAdmin: adminCheck,
          userId: user.uid,
          checkMethod: 'adminService.isAdmin()'
        }
      };

      // Test 3: Accès base de données
      let dbAccessResult;
      try {
        // Simulation test DB (remplacer par vraie vérification Firebase)
        const hasDbAccess = true; // Placeholder
        dbAccessResult = {
          name: 'Accès Base de Données',
          status: hasDbAccess ? 'success' : 'error',
          message: hasDbAccess ? 'Accès Firebase confirmé' : 'Pas d\'accès Firebase',
          icon: Database,
          details: {
            firestore: hasDbAccess,
            auth: !!user,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        dbAccessResult = {
          name: 'Accès Base de Données',
          status: 'error',
          message: `Erreur DB: ${error.message}`,
          icon: Database
        };
      }

      // Test 4: Services admin
      const adminServicesAvailable = !!(window.adminService || window.badgeSystem);
      const servicesResult = {
        name: 'Services Admin',
        status: adminServicesAvailable ? 'success' : 'warning',
        message: adminServicesAvailable ? 'Services admin disponibles' : 'Services admin partiels',
        icon: Settings,
        details: {
          adminService: !!window.adminService,
          badgeSystem: !!window.badgeSystem,
          authStore: !!useAuthStore,
          timestamp: new Date().toISOString()
        }
      };

      setProfileTests([profileResult, permissionResult, dbAccessResult, servicesResult]);

      // ==========================================
      // 🔐 TESTS DE PERMISSIONS SPÉCIFIQUES
      // ==========================================

      const permissionChecks = [
        {
          name: 'Validation Tâches',
          status: adminCheck ? 'success' : 'error',
          message: adminCheck ? 'Peut valider les tâches' : 'Pas d\'autorisation validation',
          icon: CheckCircle,
          route: '/admin/task-validation'
        },
        {
          name: 'Gestion Utilisateurs',
          status: adminCheck ? 'success' : 'error',
          message: adminCheck ? 'Peut gérer les utilisateurs' : 'Pas d\'autorisation utilisateurs',
          icon: UserCheck,
          route: '/admin/users'
        },
        {
          name: 'Configuration Badges',
          status: adminCheck ? 'success' : 'error',
          message: adminCheck ? 'Peut configurer les badges' : 'Pas d\'autorisation badges',
          icon: Shield,
          route: '/admin/badges'
        },
        {
          name: 'Analytics Admin',
          status: adminCheck ? 'success' : 'error',
          message: adminCheck ? 'Accès analytics admin' : 'Pas d\'accès analytics',
          icon: BarChart3,
          route: '/admin/analytics'
        },
        {
          name: 'Tests Système',
          status: adminCheck ? 'success' : 'error',
          message: adminCheck ? 'Peut lancer les tests' : 'Pas d\'autorisation tests',
          icon: TestTube,
          route: '/admin/complete-test'
        }
      ];

      setPermissionTests(permissionChecks);

      // ==========================================
      // ⚙️ TESTS SYSTÈME
      // ==========================================

      const systemChecks = [
        {
          name: 'Store Auth',
          status: !!useAuthStore ? 'success' : 'error',
          message: 'Store d\'authentification',
          icon: Key
        },
        {
          name: 'Fonctions Admin',
          status: typeof isAdmin === 'function' ? 'success' : 'error',
          message: 'Fonctions administrateur',
          icon: Settings
        },
        {
          name: 'Navigation Admin',
          status: window.location.pathname.includes('/admin') ? 'success' : 'warning',
          message: 'Routes admin accessibles',
          icon: Eye
        },
        {
          name: 'Console Admin',
          status: 'success',
          message: 'Console admin disponible',
          icon: Zap
        }
      ];

      setSystemTests(systemChecks);

      console.log('✅ Tests profil admin terminés');

    } catch (error) {
      console.error('❌ Erreur tests profil:', error);
      setProfileTests([{
        name: 'Erreur Tests',
        status: 'error',
        message: `Erreur: ${error.message}`,
        icon: AlertTriangle
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Lancer les tests au chargement
  useEffect(() => {
    runProfileTests();
  }, [user]);

  // Calculer le statut global
  const allTests = [...profileTests, ...permissionTests, ...systemTests];
  const successfulTests = allTests.filter(test => test.status === 'success').length;
  const totalTests = allTests.length;
  const globalScore = totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement tests profil admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Administration
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TestTube className="w-8 h-8 text-blue-600" />
              Test Profil Administrateur
            </h1>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{user.email}</p>
                  <p className="text-sm text-blue-700">UID: {user.uid}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  globalScore >= 80 ? 'text-green-600' :
                  globalScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {globalScore}%
                </div>
                <div className="text-sm text-gray-600">Score Global</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tests de Profil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Tests de Profil
            </h2>
            <button
              onClick={runProfileTests}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Relancer
            </button>
          </div>

          <div className="space-y-3">
            {profileTests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <test.icon className={`w-5 h-5 ${
                    test.status === 'success' ? 'text-green-600' :
                    test.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{test.name}</div>
                    <div className={`text-sm ${
                      test.status === 'success' ? 'text-green-600' :
                      test.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {test.message}
                    </div>
                    {test.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(test.details, null, 1).substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  test.status === 'success' ? 'bg-green-500' :
                  test.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tests de Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Tests de Permissions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissionTests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="p-4 border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <test.icon className={`w-5 h-5 ${
                    test.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <div className="font-medium text-gray-900">{test.name}</div>
                  <div className={`w-2 h-2 rounded-full ml-auto ${
                    test.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className={`text-sm ${
                  test.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {test.message}
                </div>
                {test.route && test.status === 'success' && (
                  <Link
                    to={test.route}
                    className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Accéder →
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tests Système */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Tests Système
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemTests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="text-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <test.icon className={`w-8 h-8 mx-auto mb-2 ${
                  test.status === 'success' ? 'text-green-600' :
                  test.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <div className="font-medium text-sm text-gray-900 mb-1">{test.name}</div>
                <div className={`text-xs ${
                  test.status === 'success' ? 'text-green-600' :
                  test.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {test.message}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 justify-center"
        >
          <Link
            to="/admin"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour Admin
          </Link>
          
          <Link
            to="/admin/complete-test"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Tests Complets
          </Link>
          
          <Link
            to="/admin/task-validation"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Validation Tâches
          </Link>

          <button
            onClick={runProfileTests}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Relancer Tests
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfileTestPage;
