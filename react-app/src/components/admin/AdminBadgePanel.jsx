// ==========================================
// 📁 react-app/src/components/admin/AdminBadgePanel.jsx
// PANEL D'ADMINISTRATION COMPLET DES BADGES - IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Trophy, 
  BarChart3, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Award,
  Crown,
  Zap,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';

import AdminBadgeCreator from './AdminBadgeCreator.jsx';
// 🛡️ IMPORT CORRIGÉ - Nouveau service admin
import { isAdmin } from '../../core/services/adminService.js';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ PANEL D'ADMINISTRATION DES BADGES
 */
const AdminBadgePanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [allBadges, setAllBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeTab, setActiveTab] = useState('badges');
  const [showCreator, setShowCreator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // 🛡️ VÉRIFICATION ADMIN CORRIGÉE
  if (!isAdmin(user)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800 mb-2">Accès refusé</h3>
        <p className="text-red-600">Vous devez être administrateur pour accéder à cette section.</p>
        <p className="text-sm text-red-500 mt-2">
          Email: {user?.email} | Rôle: {user?.role || 'Non défini'}
        </p>
      </div>
    );
  }

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtrer les badges
  useEffect(() => {
    filterBadges();
  }, [allBadges, searchTerm, filterRole, filterType]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [badges, users, stats] = await Promise.all([
        adminBadgeService.getAllBadges(),
        adminBadgeService.getAllUsersWithBadges(),
        adminBadgeService.getBadgeStatistics()
      ]);
      
      setAllBadges(badges);
      setAllUsers(users);
      setStatistics(stats);
      
      console.log('✅ Données admin chargées:', {
        badges: badges.length,
        users: users.length,
        stats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBadges = () => {
    let filtered = [...allBadges];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(badge => 
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(badge => badge.type === filterType);
    }
    
    setFilteredBadges(filtered);
  };

  const handleCreateBadge = async (badgeData, imageFile) => {
    try {
      await adminBadgeService.createCustomBadge(badgeData, imageFile);
      setShowCreator(false);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      return;
    }
    
    try {
      await adminBadgeService.deleteBadge(badgeId);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du panel admin...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Panel d'Administration des Badges
          </h2>
          <p className="text-gray-600 mt-1">
            Gestion complète des badges et récompenses
          </p>
        </div>
        
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer un Badge
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Total Badges</p>
              <p className="text-xl font-bold">{statistics.totalBadges || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Utilisateurs</p>
              <p className="text-xl font-bold">{statistics.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Badges Attribués</p>
              <p className="text-xl font-bold">{statistics.badgesAwarded || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Badges Personnalisés</p>
              <p className="text-xl font-bold">{statistics.customBadges || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="flex gap-2 bg-white p-1 rounded-lg border">
        {[
          { id: 'badges', label: 'Badges', icon: Trophy },
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
          { id: 'settings', label: 'Paramètres', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg border p-6">
        
        {/* Onglet Badges */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            
            {/* Filtres et recherche */}
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="achievement">Succès</option>
                <option value="milestone">Étape</option>
                <option value="special">Spécial</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            {/* Liste des badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {badge.imageUrl ? (
                        <img 
                          src={badge.imageUrl} 
                          alt={badge.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-600">{badge.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedBadge(badge)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{badge.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>XP: {badge.xpReward || 0}</span>
                    <span className={`px-2 py-1 rounded ${badge.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {badge.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun badge trouvé</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Gestion des Utilisateurs ({allUsers.length})
            </h3>
            
            <div className="space-y-3">
              {allUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.displayName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.displayName || user.email}</h4>
                      <p className="text-sm text-gray-600">
                        {user.badges?.length || 0} badges | {user.xp || 0} XP
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Voir Profil
                    </button>
                    <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                      Attribuer Badge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Statistiques */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Statistiques Détaillées</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Répartition des Badges</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Succès</span>
                    <span className="font-medium">{statistics.badgesByType?.achievement || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Étapes</span>
                    <span className="font-medium">{statistics.badgesByType?.milestone || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spéciaux</span>
                    <span className="font-medium">{statistics.badgesByType?.special || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personnalisés</span>
                    <span className="font-medium">{statistics.badgesByType?.custom || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Activité Récente</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Badges créés ce mois</span>
                    <span className="font-medium">{statistics.thisMonth?.created || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Badges attribués ce mois</span>
                    <span className="font-medium">{statistics.thisMonth?.awarded || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouveaux utilisateurs</span>
                    <span className="font-medium">{statistics.thisMonth?.newUsers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Paramètres */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres Admin</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Actions de Maintenance</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => loadAllData()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Actualiser les Données
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                    Exporter les Données
                  </button>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
                    Recalculer les Statistiques
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Créateur de Badge */}
      <AnimatePresence>
        {showCreator && (
          <AdminBadgeCreator
            onClose={() => setShowCreator(false)}
            onCreate={handleCreateBadge}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBadgePanel;
