// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES HARMONISÉE AVEC LA CHARTE GRAPHIQUE SYNERGIA
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
import { useAuth } from '../shared/stores/authStore.js';
import { useRewards } from '../shared/hooks/useRewards.js';
import { XP_CATEGORIES } from '../features/rewards/index.js';

/**
 * 🎁 PAGE DES RÉCOMPENSES AVEC DESIGN SYNERGIA
 */
const RewardsPage = () => {
  // États et hooks
  const { user } = useAuth();
  const {
    currentUserXP,
    availableRewards,
    teamRewards,
    userRewardHistory,
    loading,
    requestRewardSafely
  } = useRewards();

  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Filtrer les récompenses
  const filteredRewards = (activeTab === 'individual' ? availableRewards : teamRewards).filter(reward => {
    const matchesSearch = !searchTerm || 
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || reward.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Vérifier si l'utilisateur peut s'offrir une récompense
  const canAfford = (xpCost) => currentUserXP >= xpCost;

  // Demander une récompense
  const handleRequestReward = async (rewardId) => {
    const result = await requestRewardSafely(rewardId, activeTab);
    if (result.success) {
      setShowRequestModal(false);
      setSelectedReward(null);
    }
  };

  // Obtenir la couleur selon la catégorie XP
  const getCategoryColor = (xpCost) => {
    if (xpCost < 100) return 'from-green-500 to-emerald-500';
    if (xpCost < 200) return 'from-blue-500 to-cyan-500';
    if (xpCost < 400) return 'from-purple-500 to-pink-500';
    if (xpCost < 700) return 'from-pink-500 to-rose-500';
    if (xpCost < 1000) return 'from-orange-500 to-red-500';
    if (xpCost < 1500) return 'from-yellow-500 to-orange-500';
    if (xpCost < 2500) return 'from-red-500 to-purple-500';
    if (xpCost < 4000) return 'from-indigo-500 to-purple-500';
    if (xpCost < 6000) return 'from-violet-500 to-fuchsia-500';
    return 'from-amber-500 to-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* En-tête avec gradient Synergia */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎁 Boutique des Récompenses
            </h1>
            <p className="text-gray-400 text-lg mt-2">
              Échangez vos XP contre des récompenses individuelles ou contribuez à la cagnotte équipe !
            </p>
          </div>
          
          {/* Solde XP - Card avec glass morphism */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mes XP disponibles</p>
                <p className="text-3xl font-bold text-white">{currentUserXP.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Onglets - Style Synergia */}
        <div className="flex space-x-2 bg-gray-800/30 backdrop-blur-sm p-1 rounded-xl border border-gray-700/50">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'individual'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Récompenses Individuelles</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Cagnotte Équipe</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Barre de recherche et filtres - Glass morphism */}
      <motion.div
        className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Recherche */}
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

          {/* Filtre par catégorie */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-700/50 text-white pl-12 pr-8 py-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Toutes catégories</option>
              {Object.entries(XP_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grille de récompenses - Cards avec glass morphism */}
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
          <p className="text-gray-400">
            Essayez de modifier vos filtres ou gagnez plus d'XP pour débloquer de nouvelles récompenses !
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => {
              const affordable = canAfford(reward.xpCost);
              const gradientColor = getCategoryColor(reward.xpCost);

              return (
                <motion.div
                  key={reward.id}
                  className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 ${
                    affordable 
                      ? 'border-purple-500/50 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20' 
                      : 'border-gray-700/50 opacity-60'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* Badge de catégorie avec gradient */}
                  <div className={`h-2 bg-gradient-to-r ${gradientColor}`}></div>

                  <div className="p-6">
                    {/* Icône et titre */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${gradientColor} rounded-lg flex items-center justify-center`}>
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                          <p className="text-sm text-gray-400">{reward.category}</p>
                        </div>
                      </div>
                      
                      {reward.isPopular && (
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Populaire
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {reward.description}
                    </p>

                    {/* Prix et action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className={`w-5 h-5 ${affordable ? 'text-green-400' : 'text-gray-500'}`} />
                        <span className={`text-xl font-bold ${affordable ? 'text-green-400' : 'text-gray-500'}`}>
                          {reward.xpCost.toLocaleString()} XP
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowRequestModal(true);
                        }}
                        disabled={!affordable}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          affordable
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/50'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {affordable ? (
                          <span className="flex items-center space-x-1">
                            <ShoppingCart className="w-4 h-4" />
                            <span>Demander</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <X className="w-4 h-4" />
                            <span>XP insuffisants</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de confirmation - Glass morphism */}
      <AnimatePresence>
        {showRequestModal && selectedReward && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête du modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 bg-gradient-to-r ${getCategoryColor(selectedReward.xpCost)} rounded-xl flex items-center justify-center`}>
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedReward.name}</h3>
                    <p className="text-gray-400">{selectedReward.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6">
                {selectedReward.description}
              </p>

              {/* Informations */}
              <div className="bg-gray-700/50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Coût</span>
                  <span className="text-green-400 font-bold flex items-center">
                    <Coins className="w-4 h-4 mr-1" />
                    {selectedReward.xpCost.toLocaleString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">XP restants après</span>
                  <span className="text-blue-400 font-bold">
                    {(currentUserXP - selectedReward.xpCost).toLocaleString()} XP
                  </span>
                </div>
              </div>

              {/* Avertissement */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">Demande en attente de validation</p>
                  <p className="text-yellow-200/80">
                    Votre demande sera examinée par un administrateur. Les XP seront déduits uniquement après validation.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRequestReward(selectedReward.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-green-500/50"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>Confirmer la demande</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section historique des demandes - Glass morphism */}
      {userRewardHistory.length > 0 && (
        <motion.div
          className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-purple-400" />
            Mes demandes en cours
          </h2>
          
          <div className="space-y-3">
            {userRewardHistory.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(request.xpCost)} rounded-lg flex items-center justify-center`}>
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{request.rewardName}</h4>
                    <p className="text-sm text-gray-400">{request.xpCost.toLocaleString()} XP</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {request.status === 'pending' ? '⏳ En attente' :
                     request.status === 'approved' ? '✅ Approuvée' :
                     '❌ Refusée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RewardsPage;
