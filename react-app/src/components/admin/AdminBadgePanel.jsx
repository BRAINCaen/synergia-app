// ==========================================
// 📁 react-app/src/components/admin/AdminBadgePanel.jsx
// PANEL D'ADMINISTRATION COMPLET DES BADGES
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
import { adminBadgeService, isAdmin } from '../../core/services/adminBadgeService.js';
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

  // Vérifier les permissions admin
  if (!isAdmin(user)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800 mb-2">Accès refusé</h3>
        <p className="text-red-600">Vous devez être administrateur pour accéder à cette section.</p>
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
    let filtered = allBadges;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (filterRole !== 'all') {
      filtered = filtered.filter(badge => badge.role === filterRole);
    }

    // Filtre par type
    if (filterType === 'custom') {
      filtered = filtered.filter(badge => badge.isCustom);
    } else if (filterType === 'system') {
      filtered = filtered.filter(badge => !badge.isCustom);
    }

    setFilteredBadges(filtered);
  };

  const handleBadgeCreated = (newBadge) => {
    setAllBadges(prev => [...prev, newBadge]);
    loadAllData(); // Recharger les stats
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    
    try {
      await adminBadgeService.deleteBadge(badgeId);
      setAllBadges(prev => prev.filter(b => b.id !== badgeId));
      console.log('✅ Badge supprimé:', badgeId);
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
    }
  };

  const awardBadgeToUser = async (userId, badgeId) => {
    try {
      await adminBadgeService.awardBadgeToUser(userId, badgeId, 'Attribution manuelle admin');
      loadAllData(); // Recharger les données
      console.log('✅ Badge attribué à l\'utilisateur');
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
    }
  };

  // Obtenir les rôles uniques
  const getUniqueRoles = () => {
    const roles = [...new Set(allBadges.map(badge => badge.role))];
    return ['all', ...roles];
  };

  // Composant carte de badge admin
  const AdminBadgeCard = ({ badge }) => {
    const getRarityColor = (xpReward) => {
      if (xpReward >= 200) return 'from-purple-500 to-pink-500 border-purple-300';
      if (xpReward >= 100) return 'from-blue-500 to-cyan-500 border-blue-300';
      if (xpReward >= 50) return 'from-green-500 to-emerald-500 border-green-300';
      return 'from-gray-500 to-slate-500 border-gray-300';
    };

    return (
      <motion.div
        layout
        className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className={`bg-gradient-to-br ${getRarityColor(badge.xpReward)} p-4 rounded-t-lg text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl">{badge.icon}</div>
            <div className="flex space-x-1">
              {badge.isCustom && (
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                  Custom
                </span>
              )}
              <span className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                +{badge.xpReward} XP
              </span>
            </div>
          </div>
          <h3 className="font-bold text-lg">{badge.name}</h3>
          <p className="text-white/90 text-sm">{badge.description}</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rôle :</span>
              <span className="font-medium">{badge.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Condition :</span>
              <span className="font-medium">{badge.condition || 'N/A'}</span>
            </div>
            {badge.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Créé :</span>
                <span className="font-medium">{new Date(badge.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setSelectedBadge(badge)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Détails</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUserModal(badge)}
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
              >
                <Award className="w-4 h-4" />
                <span>Attribuer</span>
              </button>
              
              {badge.isCustom && (
                <button
                  onClick={() => handleDeleteBadge(badge.id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Suppr.</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Modal d'attribution de badge
  const UserSelectionModal = ({ badge, onClose }) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    
    const handleAward = async () => {
      if (!selectedUserId) return;
      
      await awardBadgeToUser(selectedUserId, badge.id);
      onClose();
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-4">Attribuer le badge : {badge.name}</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un utilisateur :
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Choisir un utilisateur</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.displayName || user.email} ({user.badgeCount} badges)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAward}
              disabled={!selectedUserId}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
            >
              Attribuer
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Chargement du panel admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Panel d'Administration</h1>
              <p className="opacity-90">Gestion complète des badges et utilisateurs</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreator(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un Badge</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Badges</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalBadges || 0}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Badges Custom</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.customBadges || 0}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Moy. par User</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.averageBadgesPerUser || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'badges', label: '🏆 Gestion Badges', count: allBadges.length },
            { id: 'users', label: '👥 Utilisateurs', count: allUsers.length },
            { id: 'stats', label: '📊 Statistiques', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un badge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous les rôles</option>
                {getUniqueRoles().slice(1).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tous types</option>
                <option value="system">Système</option>
                <option value="custom">Personnalisés</option>
              </select>
            </div>
          </div>

          {/* Grille des badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredBadges.map(badge => (
                <AdminBadgeCard key={badge.id} badge={badge} />
              ))}
            </AnimatePresence>
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
              <p className="text-gray-500">Essayez avec des critères différents</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">Gestion des Utilisateurs</h3>
          <div className="space-y-4">
            {allUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{user.displayName || user.email}</h4>
                  <p className="text-sm text-gray-500">{user.badgeCount} badges • {user.role || 'Général'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {user.gamification?.totalXp || 0} XP
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir badges
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-4">Statistiques Détaillées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Badges par Rôle</h4>
                <div className="space-y-2">
                  {Object.entries(statistics.badgesByRole || {}).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-gray-600">{role}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Badges Récemment Créés</h4>
                <div className="space-y-2">
                  {(statistics.recentlyCreated || []).map(badge => (
                    <div key={badge.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                      <span className="text-lg">{badge.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(badge.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Graphiques supplémentaires */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-4">Tendances</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{statistics.totalBadgesAwarded || 0}</div>
                <div className="text-sm text-gray-600">Badges attribués</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{statistics.systemBadges || 0}</div>
                <div className="text-sm text-gray-600">Badges système</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{statistics.customBadges || 0}</div>
                <div className="text-sm text-gray-600">Badges custom</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreator && (
          <AdminBadgeCreator
            isOpen={showCreator}
            onClose={() => setShowCreator(false)}
            onBadgeCreated={handleBadgeCreated}
          />
        )}

        {showUserModal && (
          <UserSelectionModal
            badge={showUserModal}
            onClose={() => setShowUserModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBadgePanel;
