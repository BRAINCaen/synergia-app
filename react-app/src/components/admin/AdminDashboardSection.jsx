// ==========================================
// 📁 react-app/src/components/admin/AdminDashboardSection.jsx
// SECTION ADMIN DANS LE DASHBOARD PRINCIPAL - IMPORTS CORRIGÉS
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
// 🛡️ IMPORTS CORRIGÉS - Nouveau service admin
import { isAdmin } from '../../core/services/adminService.js';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
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

  // 🛡️ VÉRIFICATION ADMIN CORRIGÉE
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
      <h3 className="text-lg font-semibold text-gray-900">Vue d'ensemble Admin</h3>
      
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-xl font-bold">{stats.validation?.pending || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Approuvées</p>
              <p className="text-xl font-bold">{stats.validation?.approved || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Badges</p>
              <p className="text-xl font-bold">{stats.badges?.totalBadges || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Utilisateurs</p>
              <p className="text-xl font-bold">{stats.badges?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">Actions Rapides</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setActivePanel('validation')}
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Validations</span>
          </button>
          
          <button
            onClick={() => setActivePanel('badges')}
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="text-sm">Badges</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/admin-test'}
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Panel Complet</span>
          </button>
          
          <button
            onClick={loadAdminStats}
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Actualiser</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Chargement admin...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Section Administrateur</h2>
            <p className="text-sm text-gray-600">Outils de gestion et supervision</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActivePanel('overview')}
            className={`px-3 py-1 text-sm rounded ${
              activePanel === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActivePanel('validation')}
            className={`px-3 py-1 text-sm rounded ${
              activePanel === 'validation' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Validations
          </button>
          <button
            onClick={() => setActivePanel('badges')}
            className={`px-3 py-1 text-sm rounded ${
              activePanel === 'badges' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Badges
          </button>
        </div>
      </div>

      {/* Contenu des panneaux */}
      <div>
        {activePanel === 'overview' && <OverviewPanel />}
        {activePanel === 'validation' && <AdminValidationPanel />}
        {activePanel === 'badges' && <AdminBadgePanel />}
      </div>
    </motion.div>
  );
};

export default AdminDashboardSection;
