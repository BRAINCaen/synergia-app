// ==========================================
// 📁 react-app/src/pages/CompleteAdminTestPage.jsx
// PAGE DE TEST ADMIN COMPLÈTE - SANS PANEL ADMIN (ÉVITER DOUBLON)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  User,
  Key,
  BarChart3,
  Settings,
  Crown,
  Trophy,
  Zap,
  Users,
  Activity,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../shared/stores/authStore.js';
// 🛡️ IMPORTS CORRIGÉS - Nouveau service admin
import { isAdmin, checkAdminWithFirebase, diagnoseAdmin } from '../core/services/adminService.js';
import { adminBadgeService } from '../core/services/adminBadgeService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { xpValidationService } from '../core/services/xpValidationService.js';
import userService from '../core/services/userService.js';
import adminSetupService from '../core/services/adminSetupService.js';

// Composants admin
import AdminSetupComponent from '../components/admin/AdminSetupComponent.jsx';

/**
 * 🛡️ PAGE DE TEST ADMIN COMPLÈTE
 */
const CompleteAdminTestPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [currentStep, setCurrentStep] = useState('loading'); // loading, setup, test
  const [userProfile, setUserProfile] = useState(null);
  const [setupStatus, setSetupStatus] = useState(null);
  const [adminTests, setAdminTests] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState('profile');

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      initializeAdminCheck();
    }
  }, [user]);

  const initializeAdminCheck = async () => {
    setLoading(true);
    try {
      console.log('🔍 Vérification initiale admin pour:', user.uid);
      
      // 1. Vérifier le statut admin actuel
      const [fullProfile, adminStatus] = await Promise.all([
        userService.getUserProfile(user.uid).catch(() => null),
        adminSetupService.checkIfUserIsAdmin(user.uid)
      ]);
      
      setUserProfile(fullProfile);
      setSetupStatus(adminStatus);
      
      // 2. Déterminer l'étape selon le statut
      if (!adminStatus.isAdmin && !isAdmin(user)) {
        setCurrentStep('setup');
      } else {
        setCurrentStep('test');
        await runCompleteAdminTests();
      }
      
    } catch (error) {
      console.error('❌ Erreur initialisation admin:', error);
      setCurrentStep('test'); // Fallback vers les tests
      await runCompleteAdminTests();
    } finally {
      setLoading(false);
    }
  };

  const runCompleteAdminTests = async () => {
    setLoading(true);
    try {
      console.log('🧪 Exécution tests admin complets...');
      
      const authUser = user;
      const profile = userProfile;
      const tests = [];

      // Test 1: Vérification basique isAdmin
      const basicAdminCheck = isAdmin(authUser);
      tests.push({
        name: 'Fonction isAdmin()',
        status: basicAdminCheck ? 'success' : 'error',
        message: basicAdminCheck ? 'Accès admin confirmé' : 'Accès admin refusé',
        icon: Shield,
        details: { basicAdminCheck, email: authUser.email }
      });

      // Test 2: Vérification Firebase complète
      try {
        const firebaseCheck = await checkAdminWithFirebase(authUser.uid);
        tests.push({
          name: 'Vérification Firebase',
          status: firebaseCheck.isAdmin ? 'success' : 'error',
          message: firebaseCheck.isAdmin ? 'Admin confirmé par Firebase' : 'Pas admin dans Firebase',
          icon: Crown,
          details: firebaseCheck
        });
      } catch (error) {
        tests.push({
          name: 'Vérification Firebase',
          status: 'error',
          message: `Erreur: ${error.message}`,
          icon: Crown
        });
      }

      // Test 3: Diagnostic complet
      const diagnosis = await diagnoseAdmin(authUser, profile);
      tests.push({
        name: 'Diagnostic Complet',
        status: Object.values(diagnosis.checks).filter(Boolean).length >= 4 ? 'success' : 'warning',
        message: `${Object.values(diagnosis.checks).filter(Boolean).length}/6 vérifications réussies`,
        icon: Activity,
        details: diagnosis
      });
      
      // Test 4: Service adminBadgeService
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
      
      // Test 5: Permissions de validation des tâches
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
      
      // Test 6: Permissions de validation XP
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
      
      // Test 7: Accès aux statistiques admin
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
      
      // Test 8: Accès à la gestion des utilisateurs
      try {
        const allUsers = await adminBadgeService.getAllUsersWithBadges();
        tests.push({
          name: 'Gestion Utilisateurs',
          status: allUsers && allUsers.length > 0 ? 'success' : 'error',
          message: allUsers ? `${allUsers.length} utilisateurs accessibles` : 'Pas d\'accès utilisateurs',
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

      // Calculer statistiques
      const badgeStats = await adminBadgeService.getBadgeStatistics().catch(() => ({}));
      const userStats = await adminBadgeService.getAllUsersWithBadges().catch(() => []);
      
      setAdminStats({
        badges: {
          totalBadges: badgeStats.totalBadges || 0,
          totalAwarded: badgeStats.totalAwarded || 0
        },
        users: {
          total: userStats.length || 0,
          active: userStats.filter(u => u.lastSeen && 
            (new Date() - new Date(u.lastSeen)) < 7 * 24 * 60 * 60 * 1000).length || 0
        }
      });

      setAdminTests(tests);
      
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

        {/* Étape de configuration */}
        {currentStep === 'setup' && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Admin Requise</h2>
            <AdminSetupComponent onSetupComplete={() => {
              setCurrentStep('test');
              initializeAdminCheck();
            }} />
          </div>
        )}

        {/* Tests et résultats */}
        {currentStep === 'test' && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Résumé des Tests</h2>
                <button
                  onClick={() => runCompleteAdminTests()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
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
                { id: 'admin-access', label: 'Accès Admin', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTest(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTest === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="bg-white rounded-lg border p-6">
              {/* Profil & Tests */}
              {activeTest === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tests de Permissions</h3>
                  <div className="space-y-4">
                    {adminTests.map((test, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${
                          test.status === 'success' ? 'bg-green-100 text-green-600' :
                          test.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <test.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{test.name}</h4>
                          <p className="text-gray-600 text-sm">{test.message}</p>
                          {test.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">Détails techniques</summary>
                              <pre className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded overflow-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.status === 'success' ? 'bg-green-100 text-green-700' :
                          test.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {test.status === 'success' ? 'OK' : test.status === 'warning' ? 'Attention' : 'Erreur'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Permissions */}
              {activeTest === 'permissions' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminTests.slice(0, 4).map((test, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <test.icon className="w-4 h-4" />
                          {test.name}
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>{test.message}</p>
                          <p className="text-blue-600">► Détails techniques</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Statistiques */}
              {activeTest === 'statistics' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Statistiques Admin
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{adminStats.badges?.totalBadges || 0}</p>
                      <p className="text-sm text-gray-600">Total Badges</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{adminStats.users?.total || 0}</p>
                      <p className="text-sm text-gray-600">Utilisateurs</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{adminStats.users?.active || 0}</p>
                      <p className="text-sm text-gray-600">Actifs (7j)</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Accès Admin - NOUVEAU : Lien vers page dédiée */}
              {activeTest === 'admin-access' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {isUserAdmin ? (
                    <div className="text-center">
                      <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        🎉 Accès Admin Confirmé !
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Vous avez un accès complet aux fonctionnalités d'administration.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <Link
                          to="/admin/badges"
                          className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          <Trophy className="w-6 h-6 text-yellow-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">Gestion des Badges</p>
                            <p className="text-sm text-gray-600">Créer et attribuer des badges</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </Link>
                        
                        <Link
                          to="/admin/task-validation"
                          className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">Validation Tâches</p>
                            <p className="text-sm text-gray-600">Valider les tâches utilisateurs</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </Link>
                        
                        <Link
                          to="/admin/users"
                          className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Users className="w-6 h-6 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">Gestion Utilisateurs</p>
                            <p className="text-sm text-gray-600">Administrer les comptes</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </Link>
                        
                        <Link
                          to="/admin/analytics"
                          className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">Analytics Admin</p>
                            <p className="text-sm text-gray-600">Voir les statistiques</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Accès Admin Non Disponible
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Vous devez réussir plus de tests pour accéder aux fonctions d'administration.
                      </p>
                      <p className="text-sm text-gray-500">
                        Tests réussis: {successfulTests}/{totalTests} (minimum requis: {Math.ceil(totalTests * 0.7)})
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Actions en bas */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour au Dashboard
          </Link>
          
          {!isUserAdmin && (
            <Link
              to="/admin/profile-test"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configuration Admin
            </Link>
          )}
          
          {isUserAdmin && (
            <Link
              to="/admin/badges"
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Panel Admin Badges
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteAdminTestPage;
