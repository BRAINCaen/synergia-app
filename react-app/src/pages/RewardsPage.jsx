// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES 100% FIREBASE - ZÉRO DONNÉES MOCK
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Filter, Star, Gift, Coins, Users, Target, 
  Plus, Edit2, Trash2, Settings, AlertCircle, Check, X, 
  ShoppingCart, Clock, User, Calendar, TrendingUp, Crown,
  Shield, Eye, EyeOff, Package, Zap, Heart
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { useRewards } from '../shared/hooks/useRewards.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, query, orderBy, onSnapshot, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firestore';
import { db } from '../core/firebase.js';

/**
 * 🎁 PAGE RÉCOMPENSES - 100% FIREBASE
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 🎯 UTILISER LE HOOK REWARDS (FIREBASE PUR)
  const {
    availableRewards,
    teamRewards,
    userRewardHistory,
    pendingRequests,
    currentUserXP,
    teamTotalXP,
    loading,
    requestReward,
    approveRequest,
    rejectRequest,
    canAffordReward,
    getRewardDetails,
    getCompleteStats,
    initializeRewards,
    initializeAdmin
  } = useRewards();

  // 📊 ÉTATS LOCAUX UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'individual', 'team'
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // États admin
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'individual',
    category: 'Mini-plaisirs',
    xpCost: 100,
    icon: '🎁',
    isAvailable: true,
    stock: -1,
    requirements: {}
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // 🚀 INITIALISATION
  useEffect(() => {
    if (user?.uid) {
      initializeRewards();
      
      if (userIsAdmin) {
        initializeAdmin();
      }
    }
  }, [user?.uid, userIsAdmin]);

  // ==========================================
  // 🎯 FILTRAGE DES RÉCOMPENSES
  // ==========================================

  const filteredRewards = React.useMemo(() => {
    let rewards = [];

    // Combiner récompenses individuelles et d'équipe selon le filtre
    if (filterType === 'all' || filterType === 'individual') {
      rewards = [...availableRewards];
    }
    if (filterType === 'all' || filterType === 'team') {
      rewards = [...rewards, ...teamRewards];
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      rewards = rewards.filter(cat => cat.category === filterCategory);
    }

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      rewards = rewards.map(category => ({
        ...category,
        rewards: category.rewards.filter(reward =>
          reward.name.toLowerCase().includes(search) ||
          reward.description.toLowerCase().includes(search)
        )
      })).filter(category => category.rewards.length > 0);
    }

    return rewards;
  }, [availableRewards, teamRewards, filterType, filterCategory, searchTerm]);

  // ==========================================
  // 🎁 GESTION DES DEMANDES
  // ==========================================

  const handleRequestReward = async (rewardId, type) => {
    try {
      const result = await requestReward(user.uid, rewardId, type);
      
      if (result.success) {
        showNotification('Demande envoyée avec succès ! En attente de validation admin.', 'success');
        setShowRequestModal(false);
        setSelectedReward(null);
      } else {
        showNotification(result.error || 'Erreur lors de la demande', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur demande:', error);
      showNotification('Erreur lors de la demande', 'error');
    }
  };

  // ==========================================
  // 🛡️ GESTION ADMIN
  // ==========================================

  const handleCreateReward = async () => {
    if (!rewardForm.name || !rewardForm.description || !rewardForm.xpCost) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'rewards'), {
        ...rewardForm,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        isActive: true,
        timesRedeemed: 0
      });

      showNotification('Récompense créée avec succès !', 'success');
      setShowCreateModal(false);
      resetRewardForm();
    } catch (error) {
      console.error('❌ Erreur création:', error);
      showNotification('Erreur lors de la création', 'error');
    }
  };

  const handleEditReward = async () => {
    if (!selectedReward?.id) return;

    try {
      await updateDoc(doc(db, 'rewards', selectedReward.id), rewardForm);

      showNotification('Récompense modifiée avec succès !', 'success');
      setShowEditModal(false);
      setSelectedReward(null);
      resetRewardForm();
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette récompense ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      showNotification('Récompense supprimée avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleValidateRequest = async (requestId, action) => {
    try {
      if (action === 'approve') {
        const result = await approveRequest(requestId);
        if (result.success) {
          showNotification('Demande approuvée !', 'success');
        } else {
          showNotification(result.error || 'Erreur lors de l\'approbation', 'error');
        }
      } else {
        const reason = window.prompt('Raison du rejet (optionnel):');
        const result = await rejectRequest(requestId, reason || 'Non spécifiée');
        
        if (result.success) {
          showNotification('Demande rejetée', 'success');
        } else {
          showNotification(result.error || 'Erreur lors du rejet', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      showNotification('Erreur lors de la validation', 'error');
    }
  };

  const resetRewardForm = () => {
    setRewardForm({
      name: '',
      description: '',
      type: 'individual',
      category: 'Mini-plaisirs',
      xpCost: 100,
      icon: '🎁',
      isAvailable: true,
      stock: -1,
      requirements: {}
    });
  };

  const openEditModal = (reward) => {
    setSelectedReward(reward);
    setRewardForm({
      name: reward.name || '',
      description: reward.description || '',
      type: reward.type || 'individual',
      category: reward.category || 'Mini-plaisirs',
      xpCost: reward.xpCost || 100,
      icon: reward.icon || '🎁',
      isAvailable: reward.isAvailable !== false,
      stock: reward.stock || -1,
      requirements: reward.requirements || {}
    });
    setShowEditModal(true);
  };

  // ==========================================
  // 🎨 NOTIFICATIONS
  // ==========================================

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ==========================================
  // 🎨 INTERFACE UTILISATEUR
  // ==========================================

  // Obtenir les catégories uniques pour le filtre
  const categories = React.useMemo(() => {
    const cats = new Set();
    [...availableRewards, ...teamRewards].forEach(cat => cats.add(cat.category));
    return ['all', ...Array.from(cats)];
  }, [availableRewards, teamRewards]);

  // Statistiques complètes
  const stats = getCompleteStats();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        {/* 🎨 NOTIFICATION */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
                notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📊 EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                Boutique de Récompenses
              </h1>
              <p className="text-gray-400 mt-2">
                Dépensez vos XP pour obtenir des avantages exclusifs
              </p>
            </div>

            {userIsAdmin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-5 h-5" />
                {showAdminPanel ? 'Masquer Admin' : 'Panneau Admin'}
              </button>
            )}
          </div>

          {/* 💰 STATISTIQUES XP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mes XP</p>
                  <p className="text-2xl font-bold text-white">{currentUserXP?.toLocaleString() || 0}</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">XP Équipe</p>
                  <p className="text-2xl font-bold text-white">{teamTotalXP?.toLocaleString() || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Récompenses obtenues</p>
                  <p className="text-2xl font-bold text-white">{userRewardHistory?.length || 0}</p>
                </div>
                <Gift className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En attente</p>
                  <p className="text-2xl font-bold text-white">{pendingRequests?.length || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 FILTRES */}
        <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="individual">Individuelles</option>
              <option value="team">Équipe</option>
            </select>

            {/* Catégorie */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🎁 LISTE DES RÉCOMPENSES */}
        {filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucune récompense disponible</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRewards.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">{category.icon}</span>
                  {category.category}
                  <span className="text-sm text-gray-400 ml-2">
                    ({category.rewards.length} récompense{category.rewards.length > 1 ? 's' : ''})
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.rewards.map((reward) => {
                    const canAfford = canAffordReward(reward.xpCost);
                    
                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 ${
                          canAfford 
                            ? 'border-green-500/50 hover:border-green-500' 
                            : 'border-gray-700/50 hover:border-gray-600'
                        } transition-all cursor-pointer`}
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowRequestModal(true);
                        }}
                      >
                        {/* Icône récompense */}
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-2">{reward.icon}</div>
                          <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-sm mb-4 min-h-[60px]">
                          {reward.description}
                        </p>

                        {/* Coût */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-400" />
                            <span className={`text-lg font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                              {reward.xpCost} XP
                            </span>
                          </div>
                          
                          {canAfford ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>

                        {/* Bouton */}
                        <button
                          className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                            canAfford
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!canAfford}
                        >
                          {canAfford ? 'Demander' : 'XP insuffisants'}
                        </button>

                        {/* Actions admin */}
                        {userIsAdmin && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(reward);
                              }}
                              className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReward(reward.id);
                              }}
                              className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🛡️ PANNEAU ADMIN */}
        {userIsAdmin && showAdminPanel && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-purple-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Panneau Administration
              </h2>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer une récompense
              </button>
            </div>

            {/* Demandes en attente */}
            <h3 className="text-xl font-bold text-white mb-4">
              Demandes en attente ({pendingRequests?.length || 0})
            </h3>

            {pendingRequests && pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{request.rewardName}</p>
                        <p className="text-gray-400 text-sm">
                          Demandé par: {request.userName || 'Utilisateur inconnu'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Coût: {request.xpCost} XP
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleValidateRequest(request.id, 'approve')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleValidateRequest(request.id, 'reject')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Aucune demande en attente</p>
            )}
          </div>
        )}

        {/* 🎁 MODAL DEMANDE DE RÉCOMPENSE */}
        <AnimatePresence>
          {showRequestModal && selectedReward && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-4xl">{selectedReward.icon}</span>
                  {selectedReward.name}
                </h3>

                <p className="text-gray-300 mb-4">{selectedReward.description}</p>

                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Coût:</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <Coins className="w-5 h-5" />
                      {selectedReward.xpCost} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Votre solde:</span>
                    <span className="text-white font-bold">{currentUserXP} XP</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedReward(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleRequestReward(selectedReward.id, selectedReward.type)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    disabled={!canAffordReward(selectedReward.xpCost)}
                  >
                    Confirmer la demande
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 📝 MODAL CRÉATION RÉCOMPENSE */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Créer une nouvelle récompense</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Type</label>
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="individual">Individuelle</option>
                        <option value="team">Équipe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Catégorie</label>
                      <input
                        type="text"
                        value={rewardForm.category}
                        onChange={(e) => setRewardForm({ ...rewardForm, category: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Coût XP *</label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({ ...rewardForm, xpCost: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Icône</label>
                      <input
                        type="text"
                        value={rewardForm.icon}
                        onChange={(e) => setRewardForm({ ...rewardForm, icon: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetRewardForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateReward}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Créer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 📝 MODAL ÉDITION RÉCOMPENSE */}
        <AnimatePresence>
          {showEditModal && selectedReward && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Modifier la récompense</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Coût XP</label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({ ...rewardForm, xpCost: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Icône</label>
                      <input
                        type="text"
                        value={rewardForm.icon}
                        onChange={(e) => setRewardForm({ ...rewardForm, icon: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedReward(null);
                      resetRewardForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditReward}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Enregistrer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default RewardsPage;
