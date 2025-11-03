// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES HARMONISÉE AVEC LA CHARTE GRAPHIQUE SYNERGIA
// VERSION FONCTIONNELLE COMPLÈTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Star,
  Coins,
  Sparkles,
  ShoppingCart,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Filter,
  Search,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useRewards } from '../shared/hooks/useRewards.js';
import { XP_CATEGORIES } from '../features/rewards/index.js';

/**
 * 🎁 PAGE DES RÉCOMPENSES AVEC DESIGN SYNERGIA
 */
const RewardsPage = () => {
  // États et hooks
  const { user } = useAuthStore();
  const {
    currentUserXP,
    availableRewards,
    teamRewards,
    userRewardHistory,
    loading,
    requestReward
  } = useRewards();

  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Filtrer les récompenses
  const filteredRewards = (activeTab === 'individual' ? availableRewards : teamRewards)
    .filter(category => {
      if (categoryFilter !== 'all' && category.category !== categoryFilter) return false;
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return category.rewards.some(reward => 
        reward.name.toLowerCase().includes(searchLower) ||
        reward.description.toLowerCase().includes(searchLower)
      );
    });

  // Gérer la demande de récompense
  const handleRequestReward = async () => {
    if (!selectedReward || requesting) return;
    
    setRequesting(true);
    try {
      const result = await requestReward(selectedReward.id, activeTab);
      if (result.success) {
        alert('✅ Demande envoyée avec succès !');
        setShowRequestModal(false);
        setSelectedReward(null);
      } else {
        alert(`❌ ${result.error || 'Erreur lors de la demande'}`);
      }
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des récompenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-purple-500/20">
              <Gift className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Boutique des Récompenses
              </h1>
              <p className="text-gray-400 mt-1">
                Échangez vos XP contre des récompenses exclusives
              </p>
            </div>
          </div>

          {/* XP disponibles */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">XP Disponibles</p>
                <p className="text-2xl font-bold text-white">{currentUserXP.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'individual'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Star className="w-5 h-5 inline mr-2" />
            Récompenses Individuelles
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'team'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Crown className="w-5 h-5 inline mr-2" />
            Récompenses d'Équipe
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une récompense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">Toutes les catégories</option>
            {Object.entries(XP_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des récompenses */}
      <div className="max-w-7xl mx-auto">
        {filteredRewards.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucune récompense trouvée</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRewards.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                  <span className="text-gray-500">({category.rewards.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.rewards.map((reward) => {
                    const canAfford = currentUserXP >= reward.xpCost;
                    const alreadyRequested = userRewardHistory.some(
                      h => h.rewardId === reward.id && h.status === 'pending'
                    );

                    return (
                      <motion.div
                        key={reward.id}
                        whileHover={{ scale: 1.02 }}
                        className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all ${
                          canAfford
                            ? 'border-gray-700/50 hover:border-purple-500/50 cursor-pointer'
                            : 'border-gray-700/30 opacity-60'
                        }`}
                        onClick={() => canAfford && !alreadyRequested && setSelectedReward(reward)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-3xl">{reward.icon}</span>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold text-white">{reward.xpCost}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{reward.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{reward.description}</p>

                        {alreadyRequested ? (
                          <div className="flex items-center gap-2 text-sm text-orange-400">
                            <Clock className="w-4 h-4" />
                            En attente d'approbation
                          </div>
                        ) : canAfford ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReward(reward);
                              setShowRequestModal(true);
                            }}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                          >
                            <ShoppingCart className="w-4 h-4 inline mr-2" />
                            Demander
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-red-400">
                            <X className="w-4 h-4" />
                            XP insuffisants ({(reward.xpCost - currentUserXP).toLocaleString()} manquants)
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
      </div>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showRequestModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !requesting && setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{selectedReward.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedReward.name}</h3>
                  <p className="text-gray-400">{selectedReward.description}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Coût</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-white">{selectedReward.xpCost}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">XP restants après</span>
                  <span className="text-xl font-bold text-white">
                    {(currentUserXP - selectedReward.xpCost).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Votre demande sera envoyée aux administrateurs pour validation.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => !requesting && setShowRequestModal(false)}
                  disabled={requesting}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRequestReward}
                  disabled={requesting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                >
                  {requesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                      En cours...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 inline mr-2" />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardsPage;
