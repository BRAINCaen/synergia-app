// ==========================================
// 📁 react-app/src/pages/AdminBadgesPage.jsx
// PAGE ADMINISTRATION DES BADGES - CORRECTION ACCOLADE FERMANTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy,
  Users,
  BarChart3,
  Plus,
  Search,
  Shield,
  Award,
  Star,
  Crown,
  Target,
  Medal,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Activity
} from 'lucide-react';

// Firebase
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Store
import { useAuthStore } from '../shared/stores/authStore.js';

// Types de badges
const BADGE_TYPES = {
  ROLE: { id: 'role', name: 'Rôle', color: 'bg-purple-500' },
  ACHIEVEMENT: { id: 'achievement', name: 'Accomplissement', color: 'bg-yellow-500' },
  SKILL: { id: 'skill', name: 'Compétence', color: 'bg-blue-500' },
  MILESTONE: { id: 'milestone', name: 'Étape', color: 'bg-green-500' },
  SPECIAL: { id: 'special', name: 'Spécial', color: 'bg-red-500' }
};

// Icônes disponibles
const BADGE_ICONS = [
  '🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🎯', '🚀', '💪',
  '🎨', '🔧', '📚', '💡', '🎓', '🏅', '🌟', '💯', '🔝', '✨'
];

/**
 * 🏆 PAGE ADMINISTRATION DES BADGES
 */
const AdminBadgesPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // États modaux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  
  // Formulaire
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    type: 'achievement',
    xpReward: 10,
    isActive: true
  });

  // Notification simple
  const showAlert = (message, type = 'info') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // Charger les données
  const loadData = async () => {
    console.log('🔄 Chargement des données...');
    setLoading(true);
    
    try {
      // Charger badges
      const badgesRef = collection(db, 'badges');
      const badgesSnapshot = await getDocs(query(badgesRef, orderBy('createdAt', 'desc')));
      
      const badgesList = [];
      badgesSnapshot.forEach((doc) => {
        badgesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setBadges(badgesList);
      console.log('✅ Badges chargés:', badgesList.length);
      
      // Charger utilisateurs
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const usersList = [];
      usersSnapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUsers(usersList);
      console.log('✅ Utilisateurs chargés:', usersList.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      showAlert('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadData();
  }, []);

  // Fonction pour créer/modifier un badge
  const handleSaveBadge = async () => {
    console.log('💾 Sauvegarde badge...');
    
    if (!badgeForm.name.trim()) {
      showAlert('Le nom du badge est requis', 'error');
      return;
    }
    
    try {
      const badgeData = {
        ...badgeForm,
        updatedAt: new Date(),
        updatedBy: user.uid,
        ...(editingBadge ? {} : { 
          createdAt: new Date(),
          createdBy: user.uid,
          earnedCount: 0
        })
      };
      
      if (editingBadge) {
        // Modification
        const badgeRef = doc(db, 'badges', editingBadge.id);
        await updateDoc(badgeRef, badgeData);
        showAlert('Badge modifié avec succès', 'success');
      } else {
        // Création
        await addDoc(collection(db, 'badges'), badgeData);
        showAlert('Badge créé avec succès', 'success');
      }
      
      // Réinitialiser
      setBadgeForm({
        name: '',
        description: '',
        icon: '🏆',
        type: 'achievement',
        xpReward: 10,
        isActive: true
      });
      
      setShowCreateModal(false);
      setEditingBadge(null);
      await loadData();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      showAlert('Erreur lors de la sauvegarde', 'error');
    }
  };

  // Fonction pour supprimer un badge
  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    
    console.log('🗑️ Suppression badge:', badgeId);
    
    try {
      await deleteDoc(doc(db, 'badges', badgeId));
      showAlert('Badge supprimé avec succès', 'success');
      await loadData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showAlert('Erreur lors de la suppression', 'error');
    }
  };

  // Fonction pour éditer un badge
  const handleEditBadge = (badge) => {
    console.log('✏️ Édition badge:', badge.name);
    setBadgeForm({
      name: badge.name || '',
      description: badge.description || '',
      icon: badge.icon || '🏆',
      type: badge.type || 'achievement',
      xpReward: badge.xpReward || 10,
      isActive: badge.isActive !== false
    });
    setEditingBadge(badge);
    setShowCreateModal(true);
  };

  // Fonction pour ouvrir la modal de création
  const handleCreateBadge = () => {
    console.log('➕ Création nouveau badge');
    setBadgeForm({
      name: '',
      description: '',
      icon: '🏆',
      type: 'achievement',
      xpReward: 10,
      isActive: true
    });
    setEditingBadge(null);
    setShowCreateModal(true);
  };

  // Fonction pour fermer la modal
  const handleCloseModal = () => {
    console.log('❌ Fermeture modal');
    setShowCreateModal(false);
    setEditingBadge(null);
  };

  // Filtrer les badges
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || badge.type === filterType;
    return matchesSearch && matchesType;
  });

  // Vérification admin simple
  const isAdmin = user?.email === 'alan.boehme61@gmail.com' || user?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès Refusé</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions administrateur nécessaires.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-600" />
                Administration des Badges
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log('🔄 Actualisation manuelle');
                  loadData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={handleCreateBadge}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Créer Badge
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{badges.length}</div>
            <div className="text-sm text-gray-600">Total Badges</div>
          </div>
          
          <div className="bg-white rounded-lg border p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Utilisateurs</div>
          </div>
          
          <div className="bg-white rounded-lg border p-6 text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">
              {badges.filter(b => b.isActive !== false).length}
            </div>
            <div className="text-sm text-gray-600">Badges Actifs</div>
          </div>
          
          <div className="bg-white rounded-lg border p-6 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(badges.reduce((sum, b) => sum + (b.xpReward || 0), 0) / (badges.length || 1))}
            </div>
            <div className="text-sm text-gray-600">XP Moyen</div>
          </div>
        </div>

        {/* Liste des badges */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Badges ({badges.length})
              </h2>
            </div>
            
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                {Object.values(BADGE_TYPES).map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste des badges */}
          <div className="p-6">
            {filteredBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBadges.map((badge) => (
                  <div key={badge.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{badge.icon}</div>
                          <div>
                            <h4 className="font-medium text-gray-900">{badge.name}</h4>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              BADGE_TYPES[badge.type?.toUpperCase()]?.color || 'bg-gray-500'
                            } text-white`}>
                              {BADGE_TYPES[badge.type?.toUpperCase()]?.name || badge.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBadge(badge)}
                            className="text-green-600 hover:text-green-700"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBadge(badge.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {badge.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {badge.xpReward} XP
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            badge.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-500">
                            {badge.isActive !== false ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'Aucun badge ne correspond à vos critères' 
                    : 'Aucun badge dans le système'}
                </p>
                {!searchTerm && filterType === 'all' && (
                  <button
                    onClick={handleCreateBadge}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Créer le premier badge
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création/édition */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBadge ? 'Modifier le Badge' : 'Créer un Badge'}
            </h3>
            
            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du badge
                </label>
                <input
                  type="text"
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Super Vendeur"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du badge..."
                />
              </div>

              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icône
                </label>
                <div className="grid grid-cols-10 gap-2 mb-2">
                  {BADGE_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setBadgeForm(prev => ({ ...prev, icon }))}
                      className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-50 ${
                        badgeForm.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={badgeForm.type}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(BADGE_TYPES).map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Récompense XP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Récompense XP
                </label>
                <input
                  type="number"
                  value={badgeForm.xpReward}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Statut actif */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={badgeForm.isActive}
                  onChange={(e) => setBadgeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Badge actif
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveBadge}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingBadge ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadgesPage;
