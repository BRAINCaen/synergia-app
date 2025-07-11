// ==========================================
// 📁 react-app/src/pages/AdminProfileTestPage.jsx
// PAGE TEST PROFIL ADMIN - Dans le bon dossier
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
import { isAdmin } from '../core/services/adminService.js';

const AdminProfileTestPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [adminTests, setAdminTests] = useState([]);

  useEffect(() => {
    if (user) {
      runAdminTests();
    }
  }, [user]);

  const runAdminTests = async () => {
    setLoading(true);
    
    const tests = [
      {
        name: 'Authentification Firebase',
        status: user?.uid ? 'success' : 'error',
        message: user?.uid ? `Utilisateur connecté: ${user.email}` : 'Non authentifié',
        icon: Key
      },
      {
        name: 'Vérification Admin',
        status: isAdmin(user) ? 'success' : 'error',
        message: isAdmin(user) ? 'Permissions administrateur confirmées' : 'Pas d\'accès admin',
        icon: Shield
      },
      {
        name: 'Email autorisé',
        status: user?.email === 'alan.boehme61@gmail.com' ? 'success' : 'warning',
        message: `Email actuel: ${user?.email}`,
        icon: User
      },
      {
        name: 'Profil utilisateur',
        status: user?.displayName || user?.email ? 'success' : 'warning',
        message: user?.displayName ? `Nom: ${user.displayName}` : 'Nom non défini',
        icon: User
      },
      {
        name: 'Fonctions admin disponibles',
        status: isAdmin(user) ? 'success' : 'error',
        message: isAdmin(user) ? 'Accès aux fonctions administrateur' : 'Fonctions limitées',
        icon: Settings
      },
      {
        name: 'Interface admin',
        status: 'success',
        message: 'Pages administrateur chargées',
        icon: BarChart3
      }
    ];

    setAdminTests(tests);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <RefreshCw className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const successfulTests = adminTests.filter(test => test.status === 'success').length;
  const totalTests = adminTests.length;
  const isUserAdmin = successfulTests >= Math.ceil(totalTests * 0.7); // 70% de réussite requis

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
            
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{user?.email}</div>
                <div className="text-sm text-blue-700">Utilisateur connecté</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {successfulTests}/{totalTests}
                </div>
                <div className="text-sm text-green-700">Tests réussis</div>
              </div>
              <div className={`border rounded-lg p-4 text-center ${
                isUserAdmin 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <Crown className={`w-8 h-8 mx-auto mb-2 ${
                  isUserAdmin ? 'text-green-600' : 'text-red-600'
                }`} />
                <div className={`text-2xl font-bold ${
                  isUserAdmin ? 'text-green-900' : 'text-red-900'
                }`}>
                  {isUserAdmin ? 'ADMIN' : 'BLOQUÉ'}
                </div>
                <div className={`text-sm ${
                  isUserAdmin ? 'text-green-700' : 'text-red-700'
                }`}>
                  Statut
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tests détaillés */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-6 h-6 text-purple-600 mr-2" />
            Tests de Permissions
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Tests en cours...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminTests.map((test, index) => {
                const TestIcon = test.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-center gap-4">
                      <TestIcon className="w-6 h-6 text-gray-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600">{test.message}</p>
                      </div>
                      {getStatusIcon(test.status)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Résultat final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          {isUserAdmin ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <Crown className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Accès Admin Confirmé !
              </h3>
              <p className="text-green-700 mb-6">
                Vous pouvez maintenant accéder au panel d'administration complet.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/admin/task-validation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Validation Tâches
                </Link>
                <Link
                  to="/admin/complete-test"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Test Complet
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Accès Admin Refusé
              </h3>
              <p className="text-red-700 mb-4">
                Vous devez réussir au moins {Math.ceil(totalTests * 0.7)} tests sur {totalTests} pour obtenir l'accès administrateur.
              </p>
              <p className="text-sm text-red-600">
                Tests réussis: {successfulTests}/{totalTests} 
                ({Math.round((successfulTests/totalTests) * 100)}%)
              </p>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour au Dashboard
          </Link>
          
          <button
            onClick={runAdminTests}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Relancer Tests
          </button>
          
          <Link
            to="/admin/complete-test"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Complet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileTestPage;
