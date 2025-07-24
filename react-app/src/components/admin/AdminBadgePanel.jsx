// ==========================================
// 📁 react-app/src/components/admin/AdminBadgePanel.jsx
// PANEL ADMIN BADGES - MÉTHODES CORRIGÉES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  Award,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Eye,
  BarChart3
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ PANEL ADMIN POUR LA GESTION DES BADGES
 */
const AdminBadgePanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [allBadges, setAllBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalBadges: 0,
    totalUsers: 0,
    totalAwarded: 0,
    thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
  });
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Charger les données au montage
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      console.log('📊 Chargement données admin badges...');
      
      // Charger seulement les méthodes qui existent
      const [badges, users] = await Promise.all([
        adminBadgeService.getAllBadges(),
        adminBadgeService.getAllUsers()
      ]);
      
      // ✅ Utiliser getAdvancedStats au lieu de getBadgeStatistics
      let badgeStats = null;
      try {
        badgeStats = await adminBadgeService.getAdvancedStats();
      } catch (error) {
        console.warn('⚠️ getAdvancedStats non disponible:', error.message);
        // Calculer des statistiques basiques manuellement
        badgeStats = {
          totalBadges: badges?.length || 0,
          totalUsers: users?.length || 0,
          totalAwarded: 0,
          thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
        };
        
        // Calculer le total des badges attribués
        users?.forEach(user => {
          const userBadges = user.badges || [];
          badgeStats.totalAwarded += userBadges.length;
        });
      }
      
      setAllBadges(badges || []);
      setAllUsers(users || []);
      setStatistics(badgeStats);
      
      console.log('✅ Données admin chargées:', {
        badges: (badges || []).length,
        users: (users || []).length,
        stats: badgeStats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
      // Initialiser avec des valeurs par défaut en cas d'erreur
      setAllBadges([]);
      setAllUsers([]);
      setStatistics({
        totalBadges: 0,
        totalUsers: 0,
        totalAwarded: 0,
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBadges = () => {
    let filtered = [...allBadges];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(badge => 
        (badge.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (badge.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(badge => 
        badge.category === filterType || badge.type === filterType
      );
    }
    
    return filtered;
  };

  const handleCreateBadge = async (badgeData, imageFile) => {
    try {
      console.log('🎖️ Création nouveau badge...');
      const result = await adminBadgeService.createCustomBadge(badgeData, imageFile);
      
      if (result.success) {
        // Recharger les données
        await loadAdminData();
        console.log('✅ Badge créé avec succès');
      } else {
        console.error('❌ Erreur création badge:', result.message);
      }
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
    }
  };

  const handleAwardBadge = async (userId, badgeId, reason) => {
    try {
      console.log('🏆 Attribution badge...');
      const result = await adminBadgeService.awardBadgeToUser(userId, badgeId, reason);
      
      if (result.success) {
        // Recharger les données
        await loadAdminData();
        console.log('✅ Badge attribué avec succès');
      } else {
        console.error('❌ Erreur attribution badge:', result.message);
      }
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du panel admin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Administration des Badges
          </h2>
          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalBadges}</div>
            <div className="text-sm text-blue-700">Badges Système</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statistics.totalAwarded}</div>
            <div className="text-sm text-green-700">Badges Attribués</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{statistics.totalUsers}</div>
            <div className="text-sm text-purple-700">Utilisateurs</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{statistics.thisMonth?.awarded || 0}</div>
            <div className="text-sm text-orange-700">Ce Mois</div>
          </div>
        </div>

        {/* Navigation onglets */}
        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'badges', label: 'Gestion Badges', icon: Trophy },
            { id: 'users', label: 'Utilisateurs', icon: Users },
            { id: 'stats', label: 'Statistiques', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Badges récents */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Badges Récents</h4>
              <div className="space-y-2">
                {allBadges.slice(0, 5).map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{badge.name}</div>
                      <div className="text-sm text-gray-600">{badge.category || 'Général'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilisateurs actifs */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Utilisateurs Actifs</h4>
              <div className="space-y-2">
                {allUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.displayName || user.email}</div>
                      <div className="text-sm text-gray-600">
                        {(user.badges || []).length} badges
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gestion des Badges</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nouveau Badge
            </button>
          </div>

          {/* Filtres et recherche */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="achievement">Accomplissement</option>
              <option value="progress">Progression</option>
              <option value="special">Spécial</option>
            </select>
          </div>

          {/* Liste des badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBadges().map(badge => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.category || 'Général'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-yellow-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {badge.xpReward || 0} XP
                  </span>
                  <button
                    onClick={() => handleAwardBadge('user-id', badge.id, 'Attribution manuelle')}
                    className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Attribuer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion des Utilisateurs</h3>
          
          <div className="space-y-4">
            {allUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{user.displayName || user.email}</h4>
                    <p className="text-sm text-gray-600">
                      {(user.badges || []).length} badges • {user.xp || 0} XP
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    Voir badges
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors">
                    Attribuer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Détaillées</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Répartition des Badges</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.totalBadges}</div>
              <p className="text-sm text-gray-600">badges disponibles dans le système</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Taux d'Attribution</h4>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {statistics.totalUsers > 0 ? Math.round((statistics.totalAwarded / statistics.totalUsers) * 100) / 100 : 0}
              </div>
              <p className="text-sm text-gray-600">badges par utilisateur en moyenne</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadgePanel;
