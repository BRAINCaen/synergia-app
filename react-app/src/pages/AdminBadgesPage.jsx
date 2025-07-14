// ==========================================
// 📁 react-app/src/pages/AdminBadgesPage.jsx
// PAGE ADMINISTRATION DES BADGES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Star, 
  Award, 
  Medal, 
  Crown, 
  Zap, 
  Target, 
  Eye,
  EyeOff,
  Upload,
  Image,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

// Firebase
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    max-width: 400px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// Types de badges
const BADGE_TYPES = {
  ROLE: { id: 'role', name: 'Rôle', icon: Crown, color: 'bg-purple-500' },
  ACHIEVEMENT: { id: 'achievement', name: 'Accomplissement', icon: Trophy, color: 'bg-yellow-500' },
  SKILL: { id: 'skill', name: 'Compétence', icon: Star, color: 'bg-blue-500' },
  MILESTONE: { id: 'milestone', name: 'Étape', icon: Target, color: 'bg-green-500' },
  SPECIAL: { id: 'special', name: 'Spécial', icon: Medal, color: 'bg-red-500' }
};

// Icônes disponibles pour les badges
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
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Formulaire de création/édition
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    type: 'achievement',
    xpReward: 10,
    rarity: 'common',
    requirements: [],
    isActive: true,
    conditions: {
      minXP: 0,
      minLevel: 0,
      requiredRoles: [],
      completedTasks: 0
    }
  });

  /**
   * 📊 CHARGER LES BADGES
   */
  const loadBadges = async () => {
    try {
      setLoading(true);
      
      const badgesRef = collection(db, 'badges');
      const badgesSnapshot = await getDocs(badgesRef);
      
      const badgesList = [];
      badgesSnapshot.forEach((doc) => {
        badgesList.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });
      
      // Trier par date de création
      badgesList.sort((a, b) => b.createdAt - a.createdAt);
      setBadges(badgesList);
      
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
      showNotification('Erreur lors du chargement des badges', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 💾 SAUVEGARDER UN BADGE
   */
  const saveBadge = async () => {
    try {
      if (!badgeForm.name.trim()) {
        showNotification('Le nom du badge est requis', 'error');
        return;
      }
      
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
        // Mise à jour
        const badgeRef = doc(db, 'badges', editingBadge.id);
        await updateDoc(badgeRef, badgeData);
        showNotification('Badge mis à jour avec succès', 'success');
      } else {
        // Création
        await addDoc(collection(db, 'badges'), badgeData);
        showNotification('Badge créé avec succès', 'success');
      }
      
      // Réinitialiser le formulaire
      setBadgeForm({
        name: '',
        description: '',
        icon: '🏆',
        type: 'achievement',
        xpReward: 10,
        rarity: 'common',
        requirements: [],
        isActive: true,
        conditions: {
          minXP: 0,
          minLevel: 0,
          requiredRoles: [],
          completedTasks: 0
        }
      });
      
      setShowCreateModal(false);
      setEditingBadge(null);
      await loadBadges();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde badge:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  /**
   * 🗑️ SUPPRIMER UN BADGE
   */
  const deleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'badges', badgeId));
      showNotification('Badge supprimé avec succès', 'success');
      await loadBadges();
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * ✏️ COMMENCER L'ÉDITION D'UN BADGE
   */
  const startEditBadge = (badge) => {
    setBadgeForm({
      ...badge,
      conditions: badge.conditions || {
        minXP: 0,
        minLevel: 0,
        requiredRoles: [],
        completedTasks: 0
      }
    });
    setEditingBadge(badge);
    setShowCreateModal(true);
  };

  // Charger les données au montage
  useEffect(() => {
    loadBadges();
  }, []);

  // Filtrer les badges
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || badge.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && badge.isActive) ||
                         (filterStatus === 'inactive' && !badge.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 📊 Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Gestion des Badges
                </h1>
                <p className="text-gray-400 mt-2">
                  Créer et gérer les badges de récompense
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Créer Badge</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{badges.length}</div>
                  <div className="text-sm text-gray-400">Total badges</div>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {badges.filter(b => b.isActive).length}
                  </div>
                  <div className="text-sm text-gray-400">Actifs</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {badges.reduce((sum, badge) => sum + (badge.earnedCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total attribués</div>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {Object.keys(BADGE_TYPES).length}
                  </div>
                  <div className="text-sm text-gray-400">Types</div>
                </div>
                <Medal className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Filtres */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un badge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            {/* Filtre par type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">Tous les types</option>
              {Object.values(BADGE_TYPES).map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            
            {/* Filtre par statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* 🏆 Liste des badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map(badge => {
            const badgeType = BADGE_TYPES[badge.type] || BADGE_TYPES.ACHIEVEMENT;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden ${
                  !badge.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* En-tête du badge */}
                <div className={`p-4 ${badgeType.color} bg-opacity-20 border-b border-gray-700`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{badge.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
                        <p className="text-gray-300 text-sm">{badgeType.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!badge.isActive && (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        badge.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                        badge.rarity === 'epic' ? 'bg-pink-500 text-white' :
                        badge.rarity === 'rare' ? 'bg-blue-500 text-white' :
                        badge.rarity === 'uncommon' ? 'bg-green-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu du badge */}
                <div className="p-4">
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {badge.description}
                  </p>
                  
                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{badge.xpReward}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{badge.earnedCount || 0}</div>
                      <div className="text-xs text-gray-500">Attribués</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBadge(badge);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir</span>
                    </button>
                    
                    <button
                      onClick={() => startEditBadge(badge)}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteBadge(badge.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Message si aucun badge */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun badge trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Créez votre premier badge pour commencer'
              }
            </p>
          </div>
        )}
      </div>

      {/* 🆕 Modal création/édition badge */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingBadge ? 'Modifier le badge' : 'Créer un nouveau badge'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBadge(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nom et description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nom du badge
                    </label>
                    <input
                      type="text"
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Nom du badge"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Type
                    </label>
                    <select
                      value={badgeForm.type}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {Object.values(BADGE_TYPES).map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Description du badge"
                  />
                </div>

                {/* Icône et récompenses */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Icône
                    </label>
                    <div className="grid grid-cols-5 gap-2 max-h-24 overflow-y-auto">
                      {BADGE_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setBadgeForm(prev => ({ ...prev, icon }))}
                          className={`p-2 rounded border text-xl ${
                            badgeForm.icon === icon
                              ? 'border-yellow-500 bg-yellow-500/20'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      XP Récompense
                    </label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Rareté
                    </label>
                    <select
                      value={badgeForm.rarity}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, rarity: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="common">Commun</option>
                      <option value="uncommon">Peu commun</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Épique</option>
                      <option value="legendary">Légendaire</option>
                    </select>
                  </div>
                </div>

                {/* Statut actif */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={badgeForm.isActive}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="isActive" className="text-gray-300 text-sm">
                    Badge actif
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={saveBadge}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBadge ? 'Mettre à jour' : 'Créer'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingBadge(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👁️ Modal détails badge */}
      <AnimatePresence>
        {showDetailsModal && selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Détails du badge
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                <h4 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h4>
                <p className="text-gray-300">{selectedBadge.description}</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-yellow-400">{selectedBadge.xpReward}</div>
                    <div className="text-xs text-gray-400">XP Récompense</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-400">{selectedBadge.earnedCount || 0}</div>
                    <div className="text-xs text-gray-400">Fois attribué</div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Type:</span>
                    <span className="text-white">{BADGE_TYPES[selectedBadge.type]?.name}</span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Rareté:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedBadge.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                      selectedBadge.rarity === 'epic' ? 'bg-pink-500 text-white' :
                      selectedBadge.rarity === 'rare' ? 'bg-blue-500 text-white' :
                      selectedBadge.rarity === 'uncommon' ? 'bg-green-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {selectedBadge.rarity}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Statut:</span>
                    <span className={`flex items-center space-x-1 ${
                      selectedBadge.isActive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedBadge.isActive ? <CheckCircle className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span>{selectedBadge.isActive ? 'Actif' : 'Inactif'}</span>
                    </span>
                  </div>
                </div>

                {selectedBadge.createdAt && (
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Créé le:</span>
                      <span className="text-white text-sm">
                        {selectedBadge.createdAt.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBadgesPage;
