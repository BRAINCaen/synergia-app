// ==========================================
// 📁 react-app/src/components/admin/AdminRewardsManagement.jsx
// COMPOSANT COMPLET DE GESTION DES RÉCOMPENSES ADMIN
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Gift,
  Trophy,
  Star,
  Crown,
  Zap,
  Package,
  Eye,
  EyeOff,
  Check,
  X,
  Clock,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { rewardsService } from '../../core/services/rewardsService.js';

/**
 * 🎁 COMPOSANT DE GESTION DES RÉCOMPENSES ADMIN
 */
const AdminRewardsManagement = ({ user }) => {
  // États
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rewards');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  // Charger toutes les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [rewardsData, redemptionsData, statsData] = await Promise.all([
        rewardsService.getAllRewards(true),
        rewardsService.getRedemptionRequests('all'),
        rewardsService.getRewardsStats()
      ]);

      setRewards(rewardsData);
      setRedemptions(redemptionsData);
      setStats(statsData);

    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les récompenses
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = !searchTerm || 
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || reward.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Filtrer les demandes d'échange
  const filteredRedemptions = redemptions.filter(redemption => {
    if (activeTab === 'pending') return redemption.status === 'pending';
    if (activeTab === 'processed') return redemption.status !== 'pending';
    return true;
  });

  // Icônes pour les types de récompenses
  const getTypeIcon = (type) => {
    const icons = {
      badge: Trophy,
      xp: Zap,
      virtual_item: Gift,
      privilege: Crown,
      physical: Package
    };
    return icons[type] || Gift;
  };

  // Couleurs pour les types
  const getTypeColor = (type) => {
    const colors = {
      badge: 'bg-yellow-100 text-yellow-700',
      xp: 'bg-blue-100 text-blue-700',
      virtual_item: 'bg-purple-100 text-purple-700',
      privilege: 'bg-red-100 text-red-700',
      physical: 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Statistiques rapides
  const quickStats = [
    {
      label: 'Récompenses Actives',
      value: stats.activeRewards || 0,
      icon: Gift,
      color: 'text-blue-600'
    },
    {
      label: 'En Attente',
      value: stats.pendingRedemptions || 0,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      label: 'Échanges Total',
      value: stats.totalRedemptions || 0,
      icon: Trophy,
      color: 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gestion des Récompenses</h3>
            <p className="text-gray-600">Créer et gérer les récompenses du système</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Récompense
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'rewards', label: 'Récompenses', count: rewards.length },
              { id: 'pending', label: 'En Attente', count: stats.pendingRedemptions },
              { id: 'processed', label: 'Traitées', count: (stats.totalRedemptions || 0) - (stats.pendingRedemptions || 0) }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'rewards' && (
            <RewardsTab
              rewards={filteredRewards}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onEdit={setEditingReward}
              onReload={loadData}
              user={user}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}

          {(activeTab === 'pending' || activeTab === 'processed') && (
            <RedemptionsTab
              redemptions={filteredRedemptions}
              onReload={loadData}
              user={user}
              getTypeIcon={getTypeIcon}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateRewardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
          user={user}
        />
      )}

      {editingReward && (
        <EditRewardModal
          reward={editingReward}
          onClose={() => setEditingReward(null)}
          onSuccess={() => {
            setEditingReward(null);
            loadData();
          }}
          user={user}
        />
      )}
    </div>
  );
};

/**
 * 🎁 ONGLET DES RÉCOMPENSES
 */
const RewardsTab = ({ 
  rewards, 
  searchTerm, 
  setSearchTerm, 
  typeFilter, 
  setTypeFilter, 
  onEdit, 
  onReload, 
  user,
  getTypeIcon,
  getTypeColor 
}) => {
  const rewardTypes = rewardsService.getRewardTypes();

  // Supprimer une récompense
  const handleDelete = async (rewardId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette récompense ?')) return;

    try {
      await rewardsService.deleteReward(user.uid, rewardId);
      alert('Récompense supprimée avec succès');
      onReload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // Activer/désactiver une récompense
  const toggleActive = async (reward) => {
    try {
      await rewardsService.updateReward(user.uid, reward.id, {
        isActive: !reward.isActive
      });
      onReload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une récompense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les types</option>
          {rewardTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {/* Liste des récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const TypeIcon = getTypeIcon(reward.type);
          
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{reward.icon}</span>
                  <TypeIcon className="w-4 h-4 text-gray-500" />
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(reward)}
                    className={`p-1.5 rounded-full transition-colors ${
                      reward.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {reward.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => onEdit(reward)}
                    className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-1">{reward.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(reward.type)}`}>
                  {rewardTypes.find(t => t.id === reward.type)?.name || reward.type}
                </span>
                
                <div className="text-sm font-medium text-gray-900">
                  {reward.cost} pts
                </div>
              </div>

              {reward.timesRedeemed > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Échangé {reward.timesRedeemed} fois
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune récompense trouvée</p>
        </div>
      )}
    </div>
  );
};

/**
 * 🎁 ONGLET DES DEMANDES D'ÉCHANGE
 */
const RedemptionsTab = ({ redemptions, onReload, user, getTypeIcon }) => {
  
  // Traiter une demande d'échange
  const handleProcess = async (redemptionId, action, notes = '') => {
    try {
      await rewardsService.processRedemption(user.uid, redemptionId, action, notes);
      alert(`Demande ${action === 'approved' ? 'approuvée' : action === 'rejected' ? 'rejetée' : 'marquée comme livrée'} avec succès`);
      onReload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      delivered: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      delivered: 'Livré',
      rejected: 'Rejeté'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      {redemptions.map((redemption) => {
        const TypeIcon = getTypeIcon(redemption.type);
        
        return (
          <motion.div
            key={redemption.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <TypeIcon className="w-5 h-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">{redemption.rewardName}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                    {getStatusLabel(redemption.status)}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Utilisateur: {redemption.userId}</p>
                  <p>Coût: {redemption.cost} points</p>
                  <p>Demandé le: {redemption.requestedAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}</p>
                </div>

                {redemption.adminNotes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong>Notes admin:</strong> {redemption.adminNotes}
                  </div>
                )}
              </div>

              {redemption.status === 'pending' && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleProcess(redemption.id, 'approved')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approuver
                  </button>
                  
                  <button
                    onClick={() => {
                      const notes = prompt('Raison du rejet (optionnel):');
                      if (notes !== null) {
                        handleProcess(redemption.id, 'rejected', notes);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              )}

              {redemption.status === 'approved' && (
                <button
                  onClick={() => handleProcess(redemption.id, 'delivered')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Marquer Livré
                </button>
              )}
            </div>
          </motion.div>
        );
      })}

      {redemptions.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune demande d'échange</p>
        </div>
      )}
    </div>
  );
};

/**
 * 🎁 MODAL DE CRÉATION DE RÉCOMPENSE
 */
const CreateRewardModal = ({ onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'virtual_item',
    value: '',
    cost: '',
    icon: '🎁'
  });
  const [loading, setLoading] = useState(false);

  const rewardTypes = rewardsService.getRewardTypes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await rewardsService.createReward(user.uid, formData);
      alert('Récompense créée avec succès');
      onSuccess();
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold mb-4">Créer une Récompense</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la récompense
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rewardTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût (points)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône (emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🎁"
              />
            </div>

            {formData.type === 'xp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus XP
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/**
 * ✏️ MODAL D'ÉDITION DE RÉCOMPENSE
 */
const EditRewardModal = ({ reward, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    name: reward.name || '',
    description: reward.description || '',
    type: reward.type || 'virtual_item',
    value: reward.value || '',
    cost: reward.cost || '',
    icon: reward.icon || '🎁',
    isActive: reward.isActive ?? true,
    isAvailable: reward.isAvailable ?? true
  });
  const [loading, setLoading] = useState(false);

  const rewardTypes = rewardsService.getRewardTypes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await rewardsService.updateReward(user.uid, reward.id, formData);
      alert('Récompense mise à jour avec succès');
      onSuccess();
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold mb-4">Modifier la Récompense</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la récompense
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rewardTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût (points)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône (emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🎁"
              />
            </div>

            {formData.type === 'xp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus XP
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Récompense active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Disponible à l'échange</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Mise à jour...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminRewardsManagement;
