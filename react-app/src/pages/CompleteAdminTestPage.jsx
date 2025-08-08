// ==========================================
// 📁 react-app/src/pages/CompleteAdminTestPage.jsx
// PAGE DE TEST ADMIN COMPLÈTE - TOUTES LES MÉTHODES CORRIGÉES
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
  const [adminStats, setAdminStats] = useState({
    badges: { totalBadges: 0, totalAwarded: 0 },
    users: { total: 0, active: 0 }
  });
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
      console.log('🧪 Exécution tests admin complets...');
      
      // 1. Vérifier le statut admin actuel
      const [fullProfile, adminStatus] = await Promise.all([
        userService.getUserProfile(user.uid).catch(() => null),
        adminSetupService.checkIfUserIsAdmin(user.uid).catch(() => ({ isAdmin: false }))
      ]);
      
      setUserProfile(fullProfile);
      setSetupStatus(adminStatus);
      
      // 2. Déterminer l'étape suivante
      if (adminStatus.isAdmin) {
        setCurrentStep('test');
        await runCompleteAdminTests();
      } else {
        setCurrentStep('setup');
      }
      
    } catch (error) {
      console.error('❌ Erreur initialisation admin:', error);
      setCurrentStep('setup');
    } finally {
      setLoading(false);
    }
  };

  const runCompleteAdminTests = async () => {
    try {
      setLoading(true);
      const tests = [];
      const profile = userProfile;
      const authUser = user;
      
      // Test 1: Vérification admin principale
      const adminResult = isAdmin(authUser);
      tests.push({
        name: 'Vérification Admin Principale',
        status: adminResult ? 'success' : 'error',
        message: adminResult ? 'Accès admin confirmé' : 'Pas d\'accès admin',
        icon: Shield,
        details: { isAdmin: adminResult }
      });
      
      // Test 2: Vérification Firebase
      try {
        const firebaseCheck = await checkAdminWithFirebase(authUser.uid);
        tests.push({
          name: 'Vérification Firebase',
          status: firebaseCheck ? 'success' : 'warning',
          message: firebaseCheck ? 'Admin Firebase confirmé' : 'Admin Firebase non confirmé',
          icon: Key,
          details: firebaseCheck
        });
      } catch (error) {
        tests.push({
          name: 'Vérification Firebase',
          status: 'error',
          message: `Erreur: ${error.message}`,
          icon: Key
        });
      }
      
      // Test 3: Diagnostic complet
      try {
        const diagnosis = diagnoseAdmin(authUser, profile);
        tests.push({
          name: 'Diagnostic Complet',
          status: diagnosis.isAdmin ? 'success' : 'warning',
          message: `${Object.values(diagnosis.checks).filter(Boolean).length}/6 vérifications réussies`,
          icon: Activity,
          details: diagnosis
        });
      } catch (error) {
        tests.push({
          name: 'Diagnostic Complet',
          status: 'error',
          message: `Erreur: ${error.message}`,
          icon: Activity
        });
      }
      
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
        const badgeStats = await adminBadgeService.getAdvancedStats();
        tests.push({
          name: 'Statistiques Admin',
          status: badgeStats ? 'success' : 'error',
          message: badgeStats ? `${badgeStats.totalBadges || 0} badges système` : 'Pas d\'accès stats',
          icon: BarChart3,
          details: badgeStats
        });
        
        // Mettre à jour les stats globales
        if (badgeStats) {
          setAdminStats(prev => ({
            ...prev,
            badges: badgeStats
          }));
        }
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
        
        // Mettre à jour les stats utilisateurs
        if (allUsers) {
          setAdminStats(prev => ({
            ...prev,
            users: {
              total: allUsers.length,
              active: allUsers.filter(u => u.isActive).length
            }
          }));
        }
      } catch (error) {
        tests.push({
          name: 'Gestion Utilisateurs',
          status: 'error',
          message: `Erreur: ${error.message}`,
          icon: Users
        });
      }

      setAdminTests(tests);
      console.log('✅ Tests admin terminés:', tests);
      
    } catch (error) {
      console.error('❌ Erreur lors des tests admin:', error);
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
  const isUserAdmin = successfulTests >= Math.ceil(totalTests * 0.6) && totalTests > 0;

  if (loading && currentStep === 'loading') {
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

              {/* Statut global */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 ${
                  isUserAdmin 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isUserAdmin ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      isUserAdmin ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {isUserAdmin ? '✅ Pas d\'Accès Administrateur' : '❌ Pas d\'Accès Administrateur'}
                    </h3>
                    <p className={`text-sm ${
                      isUserAdmin ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Tests réussis: {successfulTests}/{totalTests} (minimum requis: {Math.ceil(totalTests * 0.6)})
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Liste des tests */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails des Tests</h3>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {adminTests.map((test, index) => (
                    <motion.div
                      key={test.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        test.status === 'success' ? 'bg-green-500' :
                        test.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Statistiques Admin */}
            {isUserAdmin && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Statistiques Administrateur
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{adminStats.badges.totalBadges || 0}</div>
                    <div className="text-sm text-blue-700">Badges Système</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{adminStats.badges.totalAwarded || 0}</div>
                    <div className="text-sm text-green-700">Badges Attribués</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{adminStats.users.total || 0}</div>
                    <div className="text-sm text-purple-700">Utilisateurs</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{adminStats.users.active || 0}</div>
                    <div className="text-sm text-orange-700">Utilisateurs Actifs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-4 justify-center flex-wrap">
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
                <>
                  <Link
                    to="/admin/task-validation"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validation Tâches
                  </Link>
                  
                  <Link
                    to="/admin/badges"
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Gestion Badges
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteAdminTestPage;
