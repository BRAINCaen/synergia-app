// ==========================================
// 📁 react-app/src/pages/AdminProfileTestPage.jsx
// PAGE DE TEST POUR VÉRIFIER LE PROFIL ADMIN
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  User, 
  Settings, 
  Database,
  Key,
  Activity,
  AlertTriangle,
  Crown,
  Eye,
  Zap,
  Trophy,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  FileText,
  Clock
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { adminBadgeService, isAdmin } from '../core/services/adminBadgeService.js';
import { userService } from '../core/services/userService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { xpValidationService } from '../core/services/xpValidationService.js';
import AdminBadgePanel from '../components/admin/AdminBadgePanel.jsx';
import AdminDashboardSection from '../components/admin/AdminDashboardSection.jsx';

/**
 * 🛡️ PAGE DE TEST PROFIL ADMIN COMPLET
 */
const AdminProfileTestPage = () => {
  const { user } = useAuthStore();
  const [adminTests, setAdminTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [adminStats, setAdminStats] = useState({});
  const [activeTest, setActiveTest] = useState('profile');

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      runAdminTests();
    }
  }, [user]);

  const runAdminTests = async () => {
    setLoading(true);
    
    try {
      console.log('🧪 Démarrage des tests admin pour:', user.uid);
      
      // 1. Récupérer le profil utilisateur complet
      const fullProfile = await userService.getUserProfile(user.uid);
      setUserProfile(fullProfile);
      
      // 2. Tests de permissions admin
      const tests = await runAllAdminPermissionTests(user, fullProfile);
      setAdminTests(tests);
      
      // 3. Statistiques admin si admin confirmé
      if (isAdmin(fullProfile || user)) {
        const stats = await loadAdminStatistics();
        setAdminStats(stats);
      }
      
    } catch (error) {
      console.error('❌ Erreur tests admin:', error);
      setAdminTests([{
        name: 'Erreur de test',
        status: 'error',
        message: error.message,
        icon: AlertTriangle
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runAllAdminPermissionTests = async (authUser, profile) => {
    const tests = [];
    
    // Test 1: Vérification du rôle utilisateur
    tests.push({
      name: 'Rôle Utilisateur',
      status: (profile?.profile?.role === 'admin' || profile?.role === 'admin') ? 'success' : 'error',
      message: `Rôle actuel: ${profile?.profile?.role || profile?.role || 'Non défini'}`,
      icon: User,
      details: profile
    });
    
    // Test 2: Fonction isAdmin()
    tests.push({
      name: 'Fonction isAdmin()',
      status: isAdmin(profile || authUser) ? 'success' : 'error',
      message: isAdmin(profile || authUser) ? 'Accès admin confirmé' : 'Pas d\'accès admin',
      icon: Shield,
      details: { isAdmin: isAdmin(profile || authUser) }
    });
    
    // Test 3: Service adminBadgeService
    try {
      const canAccessBadges = adminBadgeService.checkAdminPermissions(profile || authUser);
      tests.push({
        name: 'Service Admin Badges',
        status: canAccessBadges ? 'success' : 'error',
        message: canAccessBadges ? 'Service accessible' : 'Service non accessible',
        icon: Trophy,
        details: { canAccessBadges }
      });
    } catch (error) {
      tests.push({
        name: 'Service Admin Badges',
        status: 'error',
        message: `Erreur: ${error.message}`,
        icon: Trophy
      });
    }
    
    // Test 4: Permissions de validation des tâches
    try {
      const canValidateTasks = await taskValidationService.checkAdminPermissions(authUser.uid);
      tests.push({
        name: 'Validation de Tâches',
        status: canValidateTasks ? 'success' : 'error',
        message: canValidateTasks ? 'Peut valider les tâches' : 'Cannot validate tasks',
        icon: CheckCircle,
        details: { canValidateTasks }
      });
    } catch (error) {
      tests.push({
        name: 'Validation de Tâches',
        status: 'error',
        message: `Erreur: ${error.message}`,
        icon: CheckCircle
      });
    }
    
    // Test 5: Permissions de validation XP
    try {
      const canValidateXP = await xpValidationService.checkAdminPermissions(authUser.uid);
      tests.push({
        name: 'Validation XP',
        status: canValidateXP ? 'success' : 'error',
        message: canValidateXP ? 'Peut valider les XP' : 'Cannot validate XP',
        icon: Zap,
        details: { canValidateXP }
      });
    } catch (error) {
      tests.push({
        name: 'Validation XP',
        status: 'error',
        message: `Erreur: ${error.message}`,
        icon: Zap
      });
    }
    
    // Test 6: Accès aux statistiques admin
    try {
      const badgeStats = await adminBadgeService.getBadgeStatistics();
      tests.push({
        name: 'Statistiques Admin',
        status: badgeStats ? 'success' : 'error',
        message: badgeStats ? `${badgeStats.totalBadges} badges système` : 'Pas d\'accès stats',
        icon: BarChart3,
        details: badgeStats
      });
    } catch (error) {
      tests.push({
        name: 'Statistiques Admin',
        status: 'error',
        message: `Erreur: ${error.message}`,
        icon: BarChart3
      });
    }
    
    // Test 7: Accès à la gestion des utilisateurs
    try {
      const allUsers = await adminBadgeService.getAllUsersWithBadges();
      tests.push({
        name: 'Gestion Utilisateurs',
        status: allUsers && allUsers.length > 0 ? 'success' : 'warning',
        message: allUsers ? `${allUsers.length} utilisateurs accessibles` : 'Aucun utilisateur trouvé',
        icon: Users,
        details: { userCount: allUsers?.length || 0 }
      });
    } catch (error) {
      tests.push({
        name: 'Gestion Utilisateurs',
        status: 'error',
        message: `Erreur: ${error.message}`,
        icon: Users
      });
    }
    
    return tests;
  };

  const loadAdminStatistics = async () => {
    try {
      const [badgeStats, validationStats] = await Promise.all([
        adminBadgeService.getBadgeStatistics().catch(() => ({})),
        taskValidationService.getValidationStats().catch(() => ({}))
      ]);
      
      return {
        badges: badgeStats,
        validation: validationStats,
        loadedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur chargement stats admin:', error);
      return {};
    }
  };

  const getTestStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTestStatusColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const isUserAdmin = isAdmin(userProfile || user);
  const successfulTests = adminTests.filter(t => t.status === 'success').length;
  const totalTests = adminTests.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Test Profil Administrateur
              </h1>
              <p className="text-gray-600 mt-2">
                Vérification complète des permissions et accès administrateur
              </p>
            </div>
            <button
              onClick={runAdminTests}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refaire les tests
            </button>
          </div>

          {/* Status global */}
          <div className={`p-4 rounded-lg border ${isUserAdmin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {isUserAdmin ? (
                <Crown className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h3 className={`font-semibold ${isUserAdmin ? 'text-green-800' : 'text-red-800'}`}>
                  {isUserAdmin ? '✅ Profil Administrateur Confirmé' : '❌ Pas d\'Accès Administrateur'}
                </h3>
                <p className={`text-sm ${isUserAdmin ? 'text-green-600' : 'text-red-600'}`}>
                  {isUserAdmin 
                    ? `${successfulTests}/${totalTests} tests réussis - Accès complet aux fonctions admin`
                    : `${successfulTests}/${totalTests} tests réussis - Accès limité`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border">
          {[
            { id: 'profile', label: 'Profil & Tests', icon: User },
            { id: 'permissions', label: 'Permissions', icon: Key },
            { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
            { id: 'admin-panel', label: 'Panel Admin', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTest(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTest === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu basé sur l'onglet actif */}
        <div className="space-y-6">
          
          {/* Profil & Tests */}
          {activeTest === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Informations utilisateur */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations Utilisateur
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nom d'affichage:</span>
                    <p className="font-medium">{user?.displayName || 'Non défini'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">UID Firebase:</span>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">{user?.uid}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Rôle (authStore):</span>
                    <p className="font-medium">{user?.role || 'Non défini'}</p>
                  </div>
                  {userProfile && (
                    <div>
                      <span className="text-sm text-gray-500">Rôle (Firestore):</span>
                      <p className="font-medium">{userProfile.profile?.role || userProfile.role || 'Non défini'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Résultats des tests */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Résultats des Tests
                </h3>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                    <p className="text-gray-500">Tests en cours...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminTests.map((test, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getTestStatusColor(test.status)}`}
                      >
                        <div className="flex items-center gap-3">
                          {getTestStatusIcon(test.status)}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{test.name}</h4>
                            <p className="text-sm text-gray-600">{test.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Permissions détaillées */}
          {activeTest === 'permissions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Détail des Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminTests.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getTestStatusColor(test.status)}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <test.icon className="w-6 h-6" />
                      <h4 className="font-medium">{test.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                    {test.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600">Détails techniques</summary>
                        <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Statistiques admin */}
          {activeTest === 'statistics' && isUserAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiques Administrateur
                </h3>
                
                {adminStats.badges && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Total Badges</h4>
                      <p className="text-2xl font-bold text-blue-600">{adminStats.badges.totalBadges}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">Badges Attribués</h4>
                      <p className="text-2xl font-bold text-green-600">{adminStats.badges.totalBadgesAwarded}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900">Utilisateurs</h4>
                      <p className="text-2xl font-bold text-purple-600">{adminStats.badges.totalUsers}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900">Moy. Badges/User</h4>
                      <p className="text-2xl font-bold text-orange-600">{adminStats.badges.averageBadgesPerUser}</p>
                    </div>
                  </div>
                )}

                {adminStats.validation && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Statistiques de Validation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h5 className="font-medium text-yellow-900">En Attente</h5>
                        <p className="text-xl font-bold text-yellow-600">{adminStats.validation.pending || 0}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-900">Approuvées</h5>
                        <p className="text-xl font-bold text-green-600">{adminStats.validation.approved || 0}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-medium text-red-900">Rejetées</h5>
                        <p className="text-xl font-bold text-red-600">{adminStats.validation.rejected || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Panel admin complet */}
          {activeTest === 'admin-panel' && isUserAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <AdminDashboardSection />
              <AdminBadgePanel />
            </motion.div>
          )}

        </div>

        {/* Actions rapides */}
        {isUserAdmin && (
          <div className="mt-8 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Actions Administrateur
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Eye className="w-4 h-4" />
                Voir Utilisateurs
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Trophy className="w-4 h-4" />
                Gérer Badges
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <CheckCircle className="w-4 h-4" />
                Validations
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <Download className="w-4 h-4" />
                Export Données
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProfileTestPage;
