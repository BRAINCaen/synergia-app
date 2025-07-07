// ==========================================
// 📁 react-app/src/components/admin/AdminBadgePanel.jsx
// PANEL ADMIN BADGES CORRIGÉ - FONCTIONS OPÉRATIONNELLES
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
  ExternalLink,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import AdminBadgeCreator from './AdminBadgeCreator.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import BadgeAwardModal from './BadgeAwardModal.jsx';

/**
 * 🏆 PANEL D'ADMINISTRATION DES BADGES COMPLET - VERSION CORRIGÉE
 */
const AdminBadgePanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [allBadges, setAllBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [statistics, setStatistics] = useState({
    totalBadges: 0,
    totalUsers: 0,
    totalAwarded: 0,
    thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
  });
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
      console.log('🔄 Chargement données admin...');
      
      const [badges, users, stats] = await Promise.all([
        adminBadgeService.getAllBadges(),
        adminBadgeService.getAllUsers(),
        adminBadgeService.getStatistics()
      ]);
      
      setAllBadges(badges || []);
      setAllUsers(users || []);
      setStatistics(stats || {
        totalBadges: 0,
        totalUsers: 0,
        totalAwarded: 0,
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      });
      
      console.log('✅ Données admin chargées:', {
        badges: (badges || []).length,
        users: (users || []).length,
        stats
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
      filtered = filtered.filter(badge => (badge.type || '') === filterType);
    }
    
    setFilteredBadges(filtered);
  };

  // ✅ FONCTION CRÉER BADGE CORRIGÉE
  const handleCreateBadge = async (badgeData, imageFile) => {
    try {
      console.log('🎨 Création badge:', badgeData);
      
      const newBadge = await adminBadgeService.createCustomBadge(badgeData, imageFile);
      
      console.log('✅ Badge créé:', newBadge);
      
      // Fermer le modal
      setShowCreator(false);
      
      // Recharger les données
      await loadAllData();
      
      alert('✅ Badge créé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      alert('❌ Erreur lors de la création du badge : ' + error.message);
    }
  };

  // ✅ FONCTION VOIR PROFIL CORRIGÉE
  const handleViewProfile = (userToView) => {
    console.log('👤 Ouverture profil utilisateur:', userToView?.displayName || userToView?.email);
    
    if (!userToView) {
      console.error('❌ Utilisateur manquant pour le profil');
      return;
    }
    
    setSelectedUser(userToView);
    setShowUserProfile(true);
  };

  // ✅ FONCTION ATTRIBUER BADGE CORRIGÉE
  const handleAwardBadge = (userForBadge, badgeToAward = null) => {
    console.log('🏆 Attribution badge à:', userForBadge?.displayName || userForBadge?.email);
    
    if (!userForBadge) {
      console.error('❌ Utilisateur manquant pour attribution badge');
      return;
    }
    
    setSelectedUser(userForBadge);
    setSelectedBadgeForAward(badgeToAward);
    setShowBadgeAward(true);
  };

  // ✅ FONCTION ATTRIBUTION BADGE CONFIRMÉE
  const handleBadgeAwarded = async (userId, badgeId, reason) => {
    try {
      console.log('🏆 Confirmation attribution badge:', { userId, badgeId, reason });
      
      const result = await adminBadgeService.awardBadgeToUser(userId, badgeId, reason);
      
      if (result.success) {
        // Fermer les modals
        setShowBadgeAward(false);
        setSelectedUser(null);
        setSelectedBadgeForAward(null);
        
        // Recharger pour mettre à jour les stats
        await loadAllData();
        
        alert('✅ Badge attribué avec succès !');
      } else {
        alert('⚠️ ' + (result.message || 'Erreur lors de l\'attribution'));
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('❌ Erreur lors de l\'attribution du badge : ' + error.message);
    }
  };

  // ✅ FONCTION SUPPRESSION BADGE CORRIGÉE
  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      return;
    }
    
    try {
      console.log('🗑️ Suppression badge:', badgeId);
      
      await adminBadgeService.deleteBadge(badgeId);
      
      // Recharger les données
      await loadAllData();
      
      alert('✅ Badge supprimé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      alert('❌ Erreur lors de la suppression du badge : ' + error.message);
    }
  };

  const tabs = [
    { id: 'badges', label: 'Badges', icon: Trophy, count: allBadges.length },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: allUsers.length },
    { id: 'validation', label: 'Validation Tâches', icon: CheckSquare },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      uncommon: 'from-green-400 to-green-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-600'
    };
    return colors[rarity] || colors.common;
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
            Panel d'Administration
          </h2>
          <p className="text-gray-600 mt-1">
            Gestion complète des badges, utilisateurs et validations
          </p>
        </div>
        
        {/* BOUTON CRÉER BADGE CORRIGÉ */}
        <button
          onClick={() => {
            console.log('🎨 Ouverture créateur de badge');
            setShowCreator(true);
          }}
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
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
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
      <div className="mt-6">
        
        {/* Onglet Badges */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="custom">Personnalisés</option>
                  <option value="automatic">Automatiques</option>
                  <option value="achievement">Succès</option>
                </select>
              </div>
            </div>

            {/* Liste des badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* En-tête du badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center text-white text-xl`}>
                        {badge.icon || '🏆'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{badge.rarity || 'Commun'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {badge.description || 'Aucune description'}
                  </p>

                  {/* Métadonnées */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>XP Récompense:</span>
                      <span className="font-medium">{badge.xpReward || 50} XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Catégorie:</span>
                      <span className="font-medium capitalize">{badge.category || 'Général'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut:</span>
                      <span className={`font-medium ${badge.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {badge.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message si aucun badge */}
            {filteredBadges.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Créez votre premier badge personnalisé'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreator(true)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer un badge
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Utilisateurs</h3>
                <p className="text-sm text-gray-500">Gérez les utilisateurs et attribuez des badges</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {allUsers.map((userItem) => (
                  <div key={userItem.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                        {(userItem.displayName || userItem.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {userItem.displayName || userItem.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(userItem.badges || []).length} badges • Level {userItem.level || 1}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* BOUTON VOIR PROFIL CORRIGÉ */}
                      <button
                        onClick={() => {
                          console.log('👤 Clic voir profil pour:', userItem);
                          handleViewProfile(userItem);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Voir le profil"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* BOUTON ATTRIBUER BADGE CORRIGÉ */}
                      <button
                        onClick={() => {
                          console.log('🏆 Clic attribuer badge pour:', userItem);
                          handleAwardBadge(userItem);
                        }}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Attribuer un badge"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message si aucun utilisateur */}
              {allUsers.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
                  <p className="text-gray-500">Les utilisateurs apparaîtront ici une fois qu'ils se connecteront</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Validation des Tâches */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Validation des Tâches</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Accédez à la page dédiée pour valider les tâches soumises par les utilisateurs
              </p>
              
              <Link
                to="/admin/task-validation"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir la validation des tâches
              </Link>
            </div>
          </div>
        )}

        {/* Onglet Statistiques */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Badges</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalBadges}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Badges Attribués</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalAwarded}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques ce mois */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ce mois-ci</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Nouveaux badges créés</p>
                  <p className="text-xl font-bold text-gray-900">{statistics.thisMonth?.newBadges || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Badges attribués</p>
                  <p className="text-xl font-bold text-gray-900">{statistics.thisMonth?.awarded || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nouveaux utilisateurs</p>
                  <p className="text-xl font-bold text-gray-900">{statistics.thisMonth?.newUsers || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Paramètres */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Paramètres des badges</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Badges automatiques</p>
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
            onClose={() => {
              console.log('❌ Fermeture créateur badge');
              setShowCreator(false);
            }}
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
              console.log('❌ Fermeture profil utilisateur');
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
            selectedBadge={selectedBadgeForAward}
            onClose={() => {
              console.log('❌ Fermeture attribution badge');
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
