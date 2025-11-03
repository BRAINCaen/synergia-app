// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// PAGE ADMIN RÉCOMPENSES AVEC ÉDITION/SUPPRESSION FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Star,
  Coins,
  Check,
  X,
  AlertCircle,
  Save,
  Package,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { rewardsService } from '../core/services/rewardsService.js';
/**
 * 🛡️ PAGE ADMIN GESTION DES RÉCOMPENSES
 */
const AdminRewardsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [stats, setStats] = useState({});

  // Charger les données
  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const [rewardsData, statsData] = await Promise.all([
        rewardsService.getAllRewards(true),
        rewardsService.getRewardsStats()
      ]);
      
      setRewards(rewardsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Erreur chargement récompenses:', error);
      alert('Erreur lors du chargement des récompenses');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les récompenses
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = !searchTerm || 
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || reward.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Supprimer une récompense
  const handleDelete = async (rewardId, rewardName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${rewardName}" ?`)) {
      return;
    }

    try {
      await rewardsService.deleteReward(user.uid, rewardId);
      alert('Récompense supprimée avec succès !');
      loadRewards();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Basculer l'état actif/inactif
  const toggleActive = async (rewardId, currentState) => {
    try {
      await rewardsService.updateReward(user.uid, rewardId, {
        isActive: !currentState
      });
      loadRewards();
    } catch (error) {
      console.error('❌ Erreur activation:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      
      {/* En-tête avec gradient Synergia */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🛡️ Gestion des Récompenses
            </h1>
            <p className="text-gray-400 text-lg mt-2">
              Créez, modifiez et gérez les récompenses disponibles
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-green-500/50 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Créer une récompense</span>
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total récompenses</p>
                <p className="text-2xl font-bold text-white">{stats.totalRewards || 0}</p>
              </div>
              <Package className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actives</p>
                <p className="text-2xl font-bold text-green-400">{stats.activeRewards || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Échanges totaux</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalRedemptions || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingRedemptions || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
        className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une récompense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-700/50 text-white pl-12 pr-8 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Tous les types</option>
              <option value="badge">Badges</option>
              <option value="xp">XP Bonus</option>
              <option value="virtual_item">Objets virtuels</option>
              <option value="privilege">Privilèges</option>
              <option value="physical">Récompenses physiques</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grille des récompenses */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <Gift className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      ) : filteredRewards.length === 0 ? (
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune récompense trouvée</h3>
          <p className="text-gray-400">Créez votre première récompense pour commencer !</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 ${
                  reward.isActive 
                    ? 'border-purple-500/50 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20' 
                    : 'border-gray-700/50 opacity-60'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Barre de statut */}
                <div className={`h-2 ${
                  reward.isActive 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}></div>

                <div className="p-6">
                  {/* En-tête avec actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                        <span className="text-xs text-gray-400">
                          {reward.type === 'badge' ? '🏅 Badge' :
                           reward.type === 'xp' ? '⚡ XP Bonus' :
                           reward.type === 'virtual_item' ? '🎁 Virtuel' :
                           reward.type === 'privilege' ? '👑 Privilège' :
                           '📦 Physique'}
                        </span>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleActive(reward.id, reward.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          reward.isActive 
                            ? 'text-green-400 hover:bg-green-500/10' 
                            : 'text-gray-500 hover:bg-gray-700/50'
                        }`}
                        title={reward.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {reward.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => setEditingReward(reward)}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(reward.id, reward.name)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {reward.description || 'Aucune description'}
                  </p>

                  {/* Informations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Coût</span>
                      <span className="text-green-400 font-bold flex items-center">
                        <Coins className="w-4 h-4 mr-1" />
                        {reward.cost} pts
                      </span>
                    </div>

                    {reward.timesRedeemed > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Échangé</span>
                        <span className="text-blue-400 font-medium">
                          {reward.timesRedeemed} fois
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de création */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRewardModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadRewards();
            }}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Modal d'édition */}
      <AnimatePresence>
        {editingReward && (
          <EditRewardModal
            reward={editingReward}
            onClose={() => setEditingReward(null)}
            onSuccess={() => {
              setEditingReward(null);
              loadRewards();
            }}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🎨 MODAL DE CRÉATION DE RÉCOMPENSE
 */
const CreateRewardModal = ({ onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'physical',
    cost: 50,
    icon: '🎁',
    value: null
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);
      await rewardsService.createReward(user.uid, formData);
      alert('Récompense créée avec succès !');
      onSuccess();
    } catch (error) {
      console.error('❌ Erreur création:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Créer une récompense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la récompense *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              placeholder="Ex: Pizza du midi"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              placeholder="Décrivez la récompense..."
              rows="3"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type de récompense *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
            >
              <option value="physical">📦 Récompense physique</option>
              <option value="badge">🏅 Badge</option>
              <option value="xp">⚡ Bonus XP</option>
              <option value="virtual_item">🎁 Objet virtuel</option>
              <option value="privilege">👑 Privilège</option>
            </select>
          </div>

          {/* Coût */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coût en points *
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              min="1"
              required
            />
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icône (emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              placeholder="🎁"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Création...' : (
                <span className="flex items-center justify-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Créer</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/**
 * ✏️ MODAL D'ÉDITION DE RÉCOMPENSE
 */
const EditRewardModal = ({ reward, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    name: reward.name,
    description: reward.description || '',
    type: reward.type,
    cost: reward.cost,
    icon: reward.icon || '🎁',
    value: reward.value || null,
    isActive: reward.isActive
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);
      await rewardsService.updateReward(user.uid, reward.id, formData);
      alert('Récompense modifiée avec succès !');
      onSuccess();
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Modifier la récompense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la récompense *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              rows="3"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type de récompense *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
            >
              <option value="physical">📦 Récompense physique</option>
              <option value="badge">🏅 Badge</option>
              <option value="xp">⚡ Bonus XP</option>
              <option value="virtual_item">🎁 Objet virtuel</option>
              <option value="privilege">👑 Privilège</option>
            </select>
          </div>

          {/* Coût */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coût en points *
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
              min="1"
              required
            />
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icône (emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Statut actif */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-gray-300 font-medium">
              Récompense active
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : (
                <span className="flex items-center justify-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminRewardsPage;
