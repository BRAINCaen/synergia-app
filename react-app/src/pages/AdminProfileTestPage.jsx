// ==========================================
// 📁 react-app/src/pages/AdminProfileTestPage.jsx
// PAGE DE TEST PROFIL ADMIN - IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../shared/stores/authStore.js';
// 🛡️ IMPORTS CORRIGÉS - Nouveau service admin
import { isAdmin, checkAdminWithFirebase, diagnoseAdmin } from '../core/services/adminService.js';
import { adminBadgeService } from '../core/services/adminBadgeService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { xpValidationService } from '../core/services/xpValidationService.js';
import userService from '../core/services/userService.js';

/**
 * 🛡️ PAGE DE TEST PROFIL ADMIN
 */
const AdminProfileTestPage = () => {
  const { user } = useAuthStore();
  
  // États
  const [userProfile, setUserProfile] = useState(null);
  const [adminTests, setAdminTests] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Charger le profil utilisateur
      const profile = await userService.getUserProfile(user.uid).catch(() => null);
      setUserProfile(profile);
      
      // Lancer tous les tests
      const tests = await runAllAdminPermissionTests(user, profile);
      setAdminTests(tests);
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
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
      
      // Test 2: Fonction isAdmin() CORRIGÉE
      const isAdminResult = isAdmin(profile || authUser);
      tests.push({
        name: 'Fonction isAdmin() CORRIGÉE',
        status: isAdminResult ? 'success' : 'error',
        message: isAdminResult ? 'Accès admin confirmé' : 'Pas d\'accès admin',
        icon: Shield,
        details: { isAdmin: isAdminResult }
      });
      
      // Test 3: Diagnostic détaillé
      const diagnosis = diagnoseAdmin(profile || authUser);
      tests.push({
        name: 'Diagnostic Admin',
        status: diagnosis.finalResult ? 'success' : 'warning',
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
      
      // Test 5: Vérification Firebase complète
      try {
        const firebaseCheck = await checkAdminWithFirebase(authUser);
        tests.push({
          name: 'Vérification Firebase',
          status: firebaseCheck ? 'success' : 'error',
          message: firebaseCheck ? 'Admin confirmé par Firebase' : 'Pas admin selon Firebase',
          icon: Settings,
          details: { firebaseCheck }
        });
      } catch (error) {
        tests.push({
          name: 'Vérification Firebase',
          status: 'error',
          message: `Erreur: ${error.message}`,
          icon: Settings
        });
      }
      
      // Test 6: Permissions de validation des tâches
      try {
        const canValidateTasks = await taskValidationService.checkAdminPermissions(authUser.uid);
        tests.push({
          name: 'Validation de Tâches',
          status: canValidateTasks ? 'success' : 'error',
          message: canValidateTasks ? 'Peut valider les tâches' : 'Ne peut pas valider',
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
      
      // Test 7: Permissions de validation XP
      try {
        const canValidateXP = await xpValidationService.checkAdminPermissions(authUser.uid);
        tests.push({
          name: 'Validation XP',
          status: canValidateXP ? 'success' : 'error',
          message: canValidateXP ? 'Peut valider les XP' : 'Ne peut pas valider',
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
      
    } catch (error) {
      console.error('❌ Erreur lors des tests admin:', error);
      tests.push({
        name: 'Tests Admin',
        status: 'error',
        message: `Erreur générale: ${error.message}`,
        icon: AlertTriangle
      });
    }
    
    return tests;
  };

  // Calculer le statut global
  const successfulTests = adminTests.filter(test => test.status === 'success').length;
  const totalTests = adminTests.length;
  const isUserAdmin = successfulTests > totalTests / 2;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={16} />
            Retour au Dashboard
          </Link>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🛡️ Test Profil Administrateur
                </h1>
                <p className="text-gray-600">
                  Vérification complète des permissions et accès administrateur
                </p>
              </div>
            </div>
            
            {/* Statut utilisateur */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{user.email}</p>
                  <p className="text-sm text-blue-700">
                    Rôle actuel: {user.role || userProfile?.role || userProfile?.profile?.role || 'Non défini'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={runAdminTests}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Tests en cours...' : 'Refaire les tests'}
              </button>
            </div>

            {/* Statut global */}
            <div className={`mt-4 p-4 rounded-lg border ${
              isUserAdmin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-3">
                {isUserAdmin ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    isUserAdmin ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isUserAdmin ? '✅ Profil Administrateur Confirmé' : '❌ Pas d\'Accès Admin'}
                  </h3>
                  <p className={`text-sm ${
                    isUserAdmin ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isUserAdmin 
                      ? `${successfulTests}/${totalTests} tests réussis - Accès complet aux fonctions admin`
                      : `${successfulTests}/${totalTests} tests réussis - Accès limité`
                    }
                  </p>
                </div>
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
            { id: 'panel-admin', label: 'Panel Admin', icon: Settings }
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
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tests en cours...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminTests.map((test, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          test.status === 'success' ? 'border-green-200 bg-green-50' :
                          test.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                          'border-red-200 bg-red-50'
                        }`}
                      >
                        <test.icon className={`w-5 h-5 ${
                          test.status === 'success' ? 'text-green-600' :
                          test.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{test.name}</p>
                          <p className={`text-sm ${
                            test.status === 'success' ? 'text-green-600' :
                            test.status === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {test.message}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          test.status === 'success' ? 'bg-green-500' :
                          test.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Permissions */}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminTests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <test.icon className={`w-5 h-5 ${
                        test.status === 'success' ? 'text-green-600' :
                        test.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                        <p className={`text-sm ${
                          test.status === 'success' ? 'text-green-600' :
                          test.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {test.message}
                        </p>
                      </div>
                    </div>
                    
                    {test.details && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <pre>{JSON.stringify(test.details, null, 2)}</pre>
                      </div>
                    )}
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
              className="bg-white rounded-lg border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistiques des Tests
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{successfulTests}</p>
                  <p className="text-sm text-gray-600">Tests Réussis</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-red-50">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{totalTests - successfulTests}</p>
                  <p className="text-sm text-gray-600">Tests Échoués</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{Math.round((successfulTests / totalTests) * 100)}%</p>
                  <p className="text-sm text-gray-600">Taux de Réussite</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Panel Admin */}
          {activeTest === 'panel-admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border p-8 text-center"
            >
              {isUserAdmin ? (
                <div>
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎉 Accès Admin Confirmé !
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous pouvez maintenant accéder au panel d'administration complet.
                  </p>
                  <Link
                    to="/admin-test"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Accéder au Panel Admin Complet
                  </Link>
                </div>
              ) : (
                <div>
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Accès refusé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous devez être administrateur pour accéder à cette section.
                  </p>
                  <p className="text-sm text-gray-500">
                    Tests réussis: {successfulTests}/{totalTests} - Seuil requis: {Math.ceil(totalTests / 2)}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Actions en bas */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour au Dashboard
          </Link>
          
          <Link
            to="/admin-test"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Admin Complet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileTestPage;
