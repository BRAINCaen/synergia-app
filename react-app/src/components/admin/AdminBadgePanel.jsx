// ==========================================
// 📁 react-app/src/components/admin/AdminBadgePanel.jsx
// PANEL ADMIN BADGES AVEC LIEN VALIDATION TÂCHES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings,
  Eye,
  Award,
  Trash2,
  UserPlus,
  CheckSquare,
  Clock,
  ExternalLink
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import AdminBadgeCreator from './AdminBadgeCreator.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import BadgeAwardModal from './BadgeAwardModal.jsx';

/**
 * 🏆 PANEL D'ADMINISTRATION DES BADGES COMPLET
 */
const AdminBadgePanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [allBadges, setAllBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeTab, setActiveTab] = useState('badges');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // États modaux
  const [showCreator, setShowCreator] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showBadgeAward, setShowBadgeAward] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBadgeForAward, setSelectedBadgeForAward] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtrer les badges quand search/filter change
  useEffect(() => {
    filterBadges();
  }, [allBadges, searchTerm, filterType]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [badges, users, stats] = await Promise.all([
        adminBadgeService.getAllBadges(),
        adminBadgeService.getAllUsers(),
        adminBadgeService.getStatistics()
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

  // ✅ FONCTION CRÉER BADGE CORRIGÉE
  const handleCreateBadge = async (badgeData, imageFile) => {
    try {
      await adminBadgeService.createCustomBadge(badgeData, imageFile);
      setShowCreator(false);
      await loadAllData(); // Recharger les données
      alert('✅ Badge créé avec succès !');
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      alert('❌ Erreur lors de la création du badge');
    }
  };

  // ✅ FONCTION VOIR PROFIL CORRIGÉE
  const handleViewProfile = (user) => {
    console.log('👤 Ouverture profil utilisateur:', user.displayName || user.email);
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  // ✅ FONCTION ATTRIBUER BADGE CORRIGÉE
  const handleAwardBadge = (user, badge = null) => {
    console.log('🏆 Attribution badge à:', user.displayName || user.email);
    setSelectedUser(user);
    setSelectedBadgeForAward(badge);
    setShowBadgeAward(true);
  };

  // ✅ FONCTION ATTRIBUTION BADGE CONFIRMÉE
  const handleBadgeAwarded = async (userId, badgeId, reason) => {
    try {
      await adminBadgeService.awardBadgeToUser(userId, badgeId, reason);
      setShowBadgeAward(false);
      setSelectedUser(null);
      setSelectedBadgeForAward(null);
      await loadAllData(); // Recharger pour mettre à jour les stats
      alert('✅ Badge attribué avec succès !');
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('❌ Erreur lors de l\'attribution du badge');
    }
  };

  // ✅ FONCTION SUPPRESSION BADGE CORRIGÉE
  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      return;
    }
    
    try {
      await adminBadgeService.deleteBadge(badgeId);
      await loadAllData(); // Recharger les données
      alert('✅ Badge supprimé avec succès !');
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      alert('❌ Erreur lors de la suppression du badge');
    }
  };

  const tabs = [
    { id: 'badges', label: 'Badges', icon: Trophy, count: allBadges.length },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: allUsers.length },
    { id: 'validation', label: 'Validation Tâches', icon: CheckSquare },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

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
            Panel d'Administration
          </h2>
          <p className="text-gray-600 mt-1">
            Gestion complète des badges, utilisateurs et validations
          </p>
        </div>
        
        {/* BOUTON CRÉER BADGE CORRIGÉ */}
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer un Badge
        </button>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div>
        {/* Onglet Badges */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un badge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="achievement">Succès</option>
                  <option value="milestone">Étapes</option>
                  <option value="custom">Personnalisés</option>
                  <option value="special">Spéciaux</option>
                </select>
              </div>
            </div>

            {/* Liste des badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl">
                      {badge.icon || '🏆'}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{badge.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">
                        +{badge.xpReward || 50} XP
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        badge.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {badge.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
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
                    {/* BOUTON VOIR PROFIL CORRIGÉ */}
                    <button 
                      onClick={() => handleViewProfile(user)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Voir Profil
                    </button>
                    
                    {/* BOUTON ATTRIBUER BADGE CORRIGÉ */}
                    <button 
                      onClick={() => handleAwardBadge(user)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      Attribuer Badge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ NOUVEL ONGLET VALIDATION TÂCHES */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                🔍 Validation des Tâches
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Examinez et validez les tâches soumises par vos équipes. 
                Les tâches validées attribuent automatiquement les XP.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/admin/task-validation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <CheckSquare className="w-5 h-5" />
                  Ouvrir la Page de Validation
                  <ExternalLink className="w-4 h-4" />
                </Link>
                
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Clock className="w-5 h-5" />
                  Voir l'Historique
                </button>
              </div>
              
              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-orange-600">
                    {statistics.thisMonth?.awarded || 0}
                  </p>
                  <p className="text-sm text-orange-600">Tâches validées ce mois</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.totalAwarded || 0}
                  </p>
                  <p className="text-sm text-blue-600">Total validées</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((statistics.totalAwarded || 0) * 30)} 
                  </p>
                  <p className="text-sm text-green-600">XP distribués</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Statistiques */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Statistiques du système</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{statistics.totalBadges || 0}</p>
                <p className="text-sm text-blue-600">Badges créés</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{statistics.totalUsers || 0}</p>
                <p className="text-sm text-green-600">Utilisateurs</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{statistics.totalAwarded || 0}</p>
                <p className="text-sm text-purple-600">Badges attribués</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{statistics.thisMonth?.newBadges || 0}</p>
                <p className="text-sm text-orange-600">Ce mois</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Badges par catégorie</h4>
                <div className="space-y-3">
                  {Object.entries(statistics.badgesByType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Actions rapides</h4>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    Exporter les statistiques
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                    Générer un rapport
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                    Recalculer les Statistiques
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Paramètres */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paramètres d'administration</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Configuration des badges</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Attribution automatique</p>
                    <p className="text-sm text-gray-600">Attribuer automatiquement certains badges</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications push</p>
                    <p className="text-sm text-gray-600">Notifier les utilisateurs des nouveaux badges</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS CORRIGÉS */}
      
      {/* Modal Créateur de Badge */}
      <AnimatePresence>
        {showCreator && (
          <AdminBadgeCreator
            isOpen={showCreator}
            onClose={() => setShowCreator(false)}
            onBadgeCreated={handleCreateBadge}
          />
        )}
      </AnimatePresence>

      {/* Modal Profil Utilisateur */}
      <AnimatePresence>
        {showUserProfile && selectedUser && (
          <UserProfileModal
            isOpen={showUserProfile}
            user={selectedUser}
            onClose={() => {
              setShowUserProfile(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Attribution Badge */}
      <AnimatePresence>
        {showBadgeAward && selectedUser && (
          <BadgeAwardModal
            isOpen={showBadgeAward}
            user={selectedUser}
            preselectedBadge={selectedBadgeForAward}
            allBadges={allBadges}
            onClose={() => {
              setShowBadgeAward(false);
              setSelectedUser(null);
              setSelectedBadgeForAward(null);
            }}
            onBadgeAwarded={handleBadgeAwarded}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBadgePanel;
