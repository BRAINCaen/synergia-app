// ==========================================
// 📁 react-app/src/components/admin/AdminDashboardSection.jsx
// SECTION ADMIN DANS LE DASHBOARD PRINCIPAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy,
  AlertTriangle,
  Eye,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { taskValidationService } from '../../core/services/taskValidationService.js';
import { adminBadgeService, isAdmin } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import AdminValidationPanel from './AdminValidationPanel.jsx';
import AdminBadgePanel from './AdminBadgePanel.jsx';

/**
 * 🛡️ SECTION ADMIN DANS LE DASHBOARD
 */
const AdminDashboardSection = () => {
  const { user } = useAuthStore();
  const [activePanel, setActivePanel] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Vérifier les permissions admin
  if (!isAdmin(user)) {
    return null; // Ne rien afficher si pas admin
  }

  // Charger les statistiques au montage
  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const [validationStats, badgeStats] = await Promise.all([
        taskValidationService.getValidationStats(),
        adminBadgeService.getBadgeStatistics()
      ]);
      
      setStats({
        validation: validationStats,
        badges: badgeStats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement stats admin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vue d'ensemble des statistiques
  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Administration</h2>
            <p className="opacity-90">Gestion centralisée de Synergia</p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Validations en attente</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.validation?.pending || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tâches validées</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.validation?.approved || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total badges</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.badges?.totalBadges || 0}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">XP attribués</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.validation?.totalXpAwarded || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActivePanel('validation')}
          className="bg-white rounded-lg p-6 border hover:border-orange-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-orange-500" />
            {stats.validation?.pending > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.validation.pending}
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            Valider les tâches
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Examiner et valider les soumissions d'équipe
          </p>
        </button>

        <button
          onClick={() => setActivePanel('badges')}
          className="bg-white rounded-lg p-6 border hover:border-purple-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <Trophy className="w-8 h-8 text-purple-500" />
            <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
              {stats.badges?.customBadges || 0} custom
            </span>
          </div>
          <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
            Gérer les badges
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Créer et attribuer des badges personnalisés
          </p>
        </button>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {stats.badges?.totalUsers || 0}
            </span>
          </div>
          <h3 className="font-bold text-gray-900">
            Utilisateurs actifs
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Membres de l'équipe Synergia
          </p>
        </div>
      </div>

      {/* Alertes importantes */}
      {stats.validation?.pending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">
                {stats.validation.pending} tâche(s) en attente de validation
              </h4>
              <p className="text-orange-700 text-sm mt-1">
                Des membres de l'équipe attendent la validation de leur travail pour recevoir leurs XP.
              </p>
              <button
                onClick={() => setActivePanel('validation')}
                className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Voir les validations →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Navigation des panels
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'validation':
        return <AdminValidationPanel />;
      case 'badges':
        return <AdminBadgePanel />;
      default:
        return <OverviewPanel />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-500">Chargement admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation si pas dans l'overview */}
      {activePanel !== 'overview' && (
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActivePanel('overview')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>← Retour administration</span>
          </button>
          
          <div className="flex space-x-2">
            <span className="text-gray-400">|</span>
            <span className="text-gray-700 font-medium">
              {activePanel === 'validation' ? 'Validation des tâches' : 
               activePanel === 'badges' ? 'Gestion des badges' : 'Administration'}
            </span>
          </div>
        </div>
      )}

      {/* Contenu du panel actif */}
      <motion.div
        key={activePanel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderActivePanel()}
      </motion.div>
    </div>
  );
};

export default AdminDashboardSection;
