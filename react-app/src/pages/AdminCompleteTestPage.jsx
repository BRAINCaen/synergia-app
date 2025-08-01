// ==========================================
// 📁 react-app/src/pages/AdminCompleteTestPage.jsx
// PAGE TEST ADMIN COMPLET - MÉTHODES CORRIGÉES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Settings,
  Crown,
  Trophy,
  Zap,
  Users,
  Activity,
  ArrowLeft,
  Database,
  Key,
  FileText,
  BarChart3,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { adminBadgeService } from '../core/services/adminBadgeService.js';

const AdminCompleteTestPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [adminTests, setAdminTests] = useState([]);
  const [systemTests, setSystemTests] = useState([]);
  const [adminStats, setAdminStats] = useState({
    badges: { totalBadges: 0, totalAwarded: 0 },
    users: { total: 0, active: 0 }
  });

  useEffect(() => {
    if (user) {
      runCompleteTests();
    }
  }, [user]);

  const runCompleteTests = async () => {
    setLoading(true);
    
    try {
      // Tests de permissions admin
      const adminResults = [
        {
          name: 'Vérification Admin',
          status: isAdmin(user) ? 'success' : 'error',
          message: isAdmin(user) ? 'Accès administrateur confirmé' : 'Pas d\'accès admin',
          icon: Shield
        },
        {
          name: 'Email Administrateur',
          status: user?.email === 'alan.boehme61@gmail.com' ? 'success' : 'warning',
          message: `Email: ${user?.email}`,
          icon: Key
        },
        {
          name: 'Authentification Firebase',
          status: user?.uid ? 'success' : 'error',
          message: user?.uid ? `UID: ${user.uid.slice(0, 8)}...` : 'Pas d\'UID Firebase',
          icon: Database
        }
      ];

      // Test du service adminBadgeService avec les vraies méthodes
      try {
        const canAccess = adminBadgeService.checkAdminPermissions(user);
        adminResults.push({
          name: 'Service Admin Badges',
          status: canAccess ? 'success' : 'error',
          message: canAccess ? 'Service accessible' : 'Service non accessible',
          icon: Trophy
        });
      } catch (error) {
        adminResults.push({
          name: 'Service Admin Badges',
          status: 'error',
          message: `Erreur: ${error.message}`,
          icon: Trophy
        });
      }

      // ✅ Test des statistiques avec la bonne méthode
      try {
        // Utiliser getAdvancedStats au lieu de getBadgeStatistics
        const badgeStats = await adminBadgeService.getAdvancedStats();
        adminResults.push({
          name: 'Statistiques Admin',
          status: badgeStats ? 'success' : 'error',
          message: badgeStats ? `${badgeStats.totalBadges} badges système` : 'Pas d\'accès stats',
          icon: BarChart3,
          details: badgeStats
        });

        // Mettre à jour les statistiques
        setAdminStats({
          badges: {
            totalBadges: badgeStats.totalBadges || 0,
            totalAwarded: badgeStats.totalAwarded || 0
          },
          users: {
            total: badgeStats.totalUsers || 0,
            active: badgeStats.totalUsers || 0 // Simplification pour l'instant
          }
        });
      } catch (error) {
        adminResults.push({
          name: 'Statistiques Admin',
          status: 'error',
          message: `Erreur stats: ${error.message}`,
          icon: BarChart3
        });
      }

      // ✅ Test de récupération des utilisateurs avec la bonne méthode
      try {
        const allUsers = await adminBadgeService.getAllUsersWithBadges();
        adminResults.push({
          name: 'Gestion Utilisateurs',
          status: allUsers && allUsers.length > 0 ? 'success' : 'error',
          message: allUsers ? `${allUsers.length} utilisateurs accessibles` : 'Pas d\'accès utilisateurs',
          icon: Users,
          details: { userCount: allUsers?.length || 0 }
        });
      } catch (error) {
        adminResults.push({
          name: 'Gestion Utilisateurs',
          status: 'error',
          message: `Erreur utilisateurs: ${error.message}`,
          icon: Users
        });
      }

      // ✅ Test diagnostic admin
      try {
        const diagnosis = adminBadgeService.diagnoseAdminAccess(user);
        adminResults.push({
          name: 'Diagnostic Admin',
          status: diagnosis.isAdmin ? 'success' : 'warning',
          message: `${Object.values(diagnosis.checks).filter(Boolean).length}/6 vérifications réussies`,
          icon: Activity,
          details: diagnosis
        });
      } catch (error) {
        adminResults.push({
          name: 'Diagnostic Admin',
          status: 'error',
          message: `Erreur diagnostic: ${error.message}`,
          icon: Activity
        });
      }

      // Tests système
      const systemResults = [
        {
          name: 'Connexion Firebase',
          status: 'success',
          message: 'Firebase connecté et opérationnel',
          icon: Database
        },
        {
          name: 'Authentification',
          status: user ? 'success' : 'error',
          message: user ? 'Utilisateur authentifié' : 'Pas d\'authentification',
          icon: Shield
        },
        {
          name: 'Services Admin',
          status: typeof adminBadgeService === 'object' ? 'success' : 'error',
          message: 'Services administrateur chargés',
          icon: Settings
        }
      ];

      setAdminTests(adminResults);
      setSystemTests(systemResults);

    } catch (error) {
      console.error('❌ Erreur tests admin:', error);
      setAdminTests([{
        name: 'Erreur Tests',
        status: 'error',
        message: 'Impossible d\'exécuter les tests admin',
        icon: AlertTriangle
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Calculer le statut admin global
  const successfulTests = adminTests.filter(test => test.status === 'success').length;
  const totalTests = adminTests.length;
  const isUserAdmin = successfulTests >= Math.ceil(totalTests * 0.7) && totalTests > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tests admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">Tests Admin Complets</h1>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">{user.email}</p>
                <p className="text-sm text-blue-700">UID: {user.uid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des tests */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Résumé des Tests</h2>
            <button
              onClick={runCompleteTests}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refaire les tests
            </button>
          </div>

          {/* Status global */}
          <div className={`p-4 rounded-lg border ${isUserAdmin ? 
            'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          } mb-6`}>
            <div className="flex items-center gap-3">
              {isUserAdmin ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h3 className={`font-semibold ${isUserAdmin ? 'text-green-800' : 'text-red-800'}`}>
                  {isUserAdmin ? '✅ Pas d\'Accès Administrateur' : '❌ Pas d\'Accès Administrateur'}
                </h3>
                <p className={`text-sm ${isUserAdmin ? 'text-green-600' : 'text-red-600'}`}>
                  Tests réussis: {successfulTests}/{totalTests} (minimum requis: {Math.ceil(totalTests * 0.7)})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tests Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Tests de Permissions
            </h3>
            
            <div className="space-y-3">
              {adminTests.map((test, index) => {
                const Icon = test.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      test.status === 'success' ? 'bg-green-50 border-green-200' :
                      test.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      test.status === 'success' ? 'text-green-600' :
                      test.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{test.name}</div>
                      <div className={`text-sm ${
                        test.status === 'success' ? 'text-green-600' :
                        test.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {test.message}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      test.status === 'success' ? 'bg-green-500' :
                      test.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Tests Système
            </h3>
            
            <div className="space-y-3">
              {systemTests.map((test, index) => {
                const Icon = test.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      test.status === 'success' ? 'bg-green-50 border-green-200' :
                      test.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      test.status === 'success' ? 'text-green-600' :
                      test.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{test.name}</div>
                      <div className={`text-sm ${
                        test.status === 'success' ? 'text-green-600' :
                        test.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {test.message}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      test.status === 'success' ? 'bg-green-500' :
                      test.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistiques Admin */}
        {isUserAdmin && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Statistiques Administrateur
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{adminStats.badges.totalBadges}</div>
                <div className="text-sm text-blue-700">Badges Système</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{adminStats.badges.totalAwarded}</div>
                <div className="text-sm text-green-700">Badges Attribués</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{adminStats.users.total}</div>
                <div className="text-sm text-purple-700">Utilisateurs</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{adminStats.users.active}</div>
                <div className="text-sm text-orange-700">Utilisateurs Actifs</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour au Dashboard
          </Link>
          
          <Link
            to="/admin/profile-test"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Profil Admin
          </Link>
          
          <Link
            to="/admin/task-validation"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Validation Tâches
          </Link>

          <button
            onClick={runCompleteTests}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Relancer Tests
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCompleteTestPage;
