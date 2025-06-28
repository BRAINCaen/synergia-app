// ==========================================
// 📁 react-app/src/pages/CompleteAdminTestPage.jsx
// PAGE COMPLÈTE DE TEST ET CONFIGURATION ADMIN
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  User, 
  Settings, 
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
  Clock,
  ArrowRight,
  Plus,
  Lightbulb
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { adminBadgeService, isAdmin } from '../core/services/adminBadgeService.js';
import { userService } from '../core/services/userService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { xpValidationService } from '../core/services/xpValidationService.js';
import adminSetupService from '../core/services/adminSetupService.js';
import AdminSetupComponent from '../components/admin/AdminSetupComponent.jsx';
import AdminBadgePanel from '../components/admin/AdminBadgePanel.jsx';
import AdminDashboardSection from '../components/admin/AdminDashboardSection.jsx';

/**
 * 🛡️ PAGE COMPLÈTE DE TEST ET CONFIGURATION ADMIN
 */
const CompleteAdminTestPage = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState('check'); // check, setup, test, admin-panel
  const [adminTests, setAdminTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [adminStats, setAdminStats] = useState({});
  const [setupStatus, setSetupStatus] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      runInitialCheck();
    }
  }, [user]);

  const runInitialCheck = async () => {
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
      
      // 2. Déterminer l'étape appropriée
      if (adminStatus.isAdmin) {
        setCurrentStep('test');
        // Lancer les tests complets
        const tests = await runAllAdminPermissionTests(user, fullProfile);
        setAdminTests(tests);
        
        // Charger les statistiques
        const stats = await loadAdminStatistics();
        setAdminStats(stats);
      } else {
        setCurrentStep('setup');
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification initiale:', error);
      setCurrentStep('setup');
    } finally {
      setLoading(false);
    }
  };

  const runAllAdminPermissionTests = async (authUser, profile) => {
    const tests = [];
    
    try {
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
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
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

  const handleSetupComplete = async () => {
    console.log('✅ Setup admin terminé, relancement des tests...');
    await runInitialCheck();
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

  const isUserAdmin = setupStatus?.isAdmin || isAdmin(userProfile || user);
  const successfulTests = adminTests.filter(t => t.status === 'success').length;
  const totalTests = adminTests.length;

  const steps = [
    { id: 'check', label: 'Vérification', icon: Eye, description: 'Vérification du statut admin' },
    { id: 'setup', label: 'Configuration', icon: Settings, description: 'Configuration des permissions' },
    { id: 'test', label: 'Tests', icon: Activity, description: 'Tests des fonctionnalités' },
    { id: 'admin-panel', label: 'Panel Admin', icon: Crown, description: 'Interface administrateur' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            Synergia v3.5 - Administration
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Vérification et configuration des permissions administrateur
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isUserAdmin 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {isUserAdmin ? (
              <>
                <Crown className="w-4 h-4" />
                Administrateur Confirmé
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Configuration Requise
              </>
            )}
          </div>
        </div>

        {/* Stepper de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vérification en cours...</h3>
            <p className="text-gray-600">Analyse des permissions et configurations</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* Étape 1: Configuration Admin */}
            {currentStep === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">Configuration Administrateur</h2>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900 mb-1">Information</h3>
                        <p className="text-blue-800 text-sm">
                          Vous n'avez pas encore les permissions administrateur. 
                          Utilisez les options ci-dessous pour configurer votre accès admin.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <AdminSetupComponent />
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={runInitialCheck}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Vérifier à Nouveau
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Tests des permissions */}
            {currentStep === 'test' && (
              <motion.div
                key="test"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Résumé des résultats */}
                <div className={`p-6 rounded-lg border ${isUserAdmin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {isUserAdmin ? (
                      <Crown className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h2 className={`text-2xl font-semibold ${isUserAdmin ? 'text-green-800' : 'text-red-800'}`}>
                        {isUserAdmin ? '✅ Tests Administrateur Réussis' : '❌ Problèmes Détectés'}
                      </h2>
                      <p className={`${isUserAdmin ? 'text-green-600' : 'text-red-600'}`}>
                        {isUserAdmin 
                          ? `${successfulTests}/${totalTests} tests réussis - Accès administrateur complet confirmé`
                          : `${successfulTests}/${totalTests} tests réussis - Certaines permissions manquent`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setCurrentStep('admin-panel')}
                      disabled={!isUserAdmin}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Crown className="w-4 h-4" />
                      Accéder au Panel Admin
                    </button>
                    <button
                      onClick={runInitialCheck}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Relancer les Tests
                    </button>
                  </div>
                </div>

                {/* Détails des tests */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations utilisateur */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profil Utilisateur
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Nom:</span>
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
                  </div>
                </div>

                {/* Statistiques admin */}
                {isUserAdmin && adminStats.badges && (
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Statistiques Administrateur
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  </div>
                )}
              </motion.div>
            )}

            {/* Étape 3: Panel Admin complet */}
            {currentStep === 'admin-panel' && isUserAdmin && (
              <motion.div
                key="admin-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <h2 className="text-2xl font-semibold text-gray-900">Panel Administrateur</h2>
                    </div>
                    <button
                      onClick={() => setCurrentStep('test')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Retour aux Tests
                    </button>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-900 mb-1">Accès Administrateur Confirmé</h3>
                        <p className="text-green-800 text-sm">
                          Vous avez accès à tous les outils d'administration de Synergia v3.5.
                          Utilisez les interfaces ci-dessous pour gérer l'application.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Admin */}
                <AdminDashboardSection />
                
                {/* Panel de gestion des badges */}
                <AdminBadgePanel />
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* Footer avec informations */}
        <div className="mt-12 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            À Propos de cette Page
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités</h4>
              <ul className="space-y-1">
                <li>• Vérification automatique des permissions admin</li>
                <li>• Configuration des droits administrateur</li>
                <li>• Tests complets des services admin</li>
                <li>• Accès aux interfaces d'administration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Services Testés</h4>
              <ul className="space-y-1">
                <li>• adminBadgeService - Gestion des badges</li>
                <li>• taskValidationService - Validation des tâches</li>
                <li>• xpValidationService - Validation XP</li>
                <li>• userService - Gestion utilisateurs</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompleteAdminTestPage;
