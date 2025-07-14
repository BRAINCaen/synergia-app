// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// NOUVELLE PAGE RÉCOMPENSES MODERNE BASÉE SUR XP
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Crown, 
  Star, 
  Users, 
  Clock, 
  Sparkles,
  Zap,
  Award,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock4,
  X,
  ArrowRight,
  Coins,
  Trophy,
  Heart,
  ShoppingBag,
  Calendar,
  Coffee,
  Gamepad2,
  MessageCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { useRewardsStore } from '../shared/stores/rewardsStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

/**
 * 🎁 NOUVELLE PAGE RÉCOMPENSES MODERNE
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();
  const {
    availableRewards,
    teamRewards,
    userRewardHistory,
    userXP,
    teamTotalXP,
    loading,
    error,
    loadAvailableRewards,
    loadTeamRewards,
    loadUserRewardHistory,
    requestReward,
    getRewardStats,
    getNextReward,
    canAffordReward,
    clearError
  } = useRewardsStore();

  // États locaux
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (user && userStats) {
      const currentUserXP = userStats.totalXp || 0;
      loadAvailableRewards(currentUserXP);
      loadTeamRewards(5000); // XP d'équipe simulé pour la démo
      loadUserRewardHistory(user.uid);
    }
  }, [user, userStats, loadAvailableRewards, loadTeamRewards, loadUserRewardHistory]);

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const currentUserXP = userStats?.totalXp || 0;
      await Promise.all([
        loadAvailableRewards(currentUserXP),
        loadTeamRewards(5000),
        loadUserRewardHistory(user.uid)
      ]);
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 🎁 DEMANDER UNE RÉCOMPENSE
   */
  const handleRequestReward = async (reward) => {
    try {
      await requestReward(user.uid, reward.id, activeTab === 'team' ? 'team' : 'individual');
      setShowRequestModal(false);
      setSelectedReward(null);
      
      // Message de succès
      alert('🎉 Demande de récompense envoyée ! Un admin va valider votre demande.');
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      alert('❌ Erreur lors de la demande. Réessayez plus tard.');
    }
  };

  // Obtenir les statistiques
  const rewardStats = getRewardStats();
  const nextReward = getNextReward();
  const currentUserXP = userStats?.totalXp || 0;

  // Icônes pour les catégories
  const getCategoryIcon = (icon) => {
    const iconMap = {
      '🥤': Coffee,
      '⏰': Clock,
      '🍱': ShoppingBag,
      '🍔': Coffee,
      '🧘': Heart,
      '🎉': Trophy,
      '📱': Gamepad2,
      '🗓️': Calendar,
      '🍽️': Gift,
      '🏅': Crown,
      '🍕': Coffee,
      '🎲': Gamepad2,
      '🏞️': Target,
      '😌': Heart,
      '🚀': Star,
      '🎁': Gift,
      '✨': Sparkles
    };
    return iconMap[icon] || Gift;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && availableRewards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Chargement des récompenses...</h2>
          <p className="text-gray-400 mt-2">Synchronisation avec Firebase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête avec statistiques */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                <Gift className="w-10 h-10 mr-4 text-purple-400" />
                Boutique des Récompenses
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Échangez vos XP contre des récompenses fantastiques !
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* XP disponibles */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">XP Disponibles</p>
                  <p className="text-3xl font-bold text-blue-400">{currentUserXP.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-1">Prêts à échanger</p>
                </div>
                <Coins className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            {/* Récompenses échangées */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Récompenses obtenues</p>
                  <p className="text-3xl font-bold text-green-400">{rewardStats.totalRedeemed}</p>
                  <p className="text-gray-500 text-xs mt-1">Approuvées</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            {/* En attente */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">En attente</p>
                  <p className="text-3xl font-bold text-yellow-400">{rewardStats.totalPending}</p>
                  <p className="text-gray-500 text-xs mt-1">Validation admin</p>
                </div>
                <Clock4 className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            {/* Prochaine récompense */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Prochaine récompense</p>
                  {nextReward ? (
                    <>
                      <p className="text-lg font-bold text-purple-400 truncate">{nextReward.name}</p>
                      <p className="text-gray-500 text-xs mt-1">+{nextReward.xpNeeded} XP requis</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-purple-400">Toutes débloquées !</p>
                      <p className="text-gray-500 text-xs mt-1">Félicitations</p>
                    </>
                  )}
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Onglets */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'individual'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Récompenses Individuelles</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'team'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Récompenses d'Équipe</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Mon Historique</span>
            </button>
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeTab === 'individual' && (
            <div className="space-y-8">
              {availableRewards.map((category, categoryIndex) => {
                const CategoryIcon = getCategoryIcon(category.icon);
                
                return (
                  <motion.div
                    key={categoryIndex}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mr-4`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{category.category}</h3>
                        <p className="text-gray-400">
                          {category.minXP}-{category.maxXP} XP • {category.rewards.length} récompenses
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.rewards.map((reward, rewardIndex) => {
                        const canAfford = canAffordReward(reward.xpCost);
                        
                        return (
                          <motion.div
                            key={rewardIndex}
                            className={`bg-gray-700/50 rounded-lg p-4 border transition-all hover:scale-[1.02] cursor-pointer ${
                              canAfford 
                                ? 'border-green-500/50 hover:border-green-400' 
                                : 'border-gray-600/50 hover:border-gray-500'
                            }`}
                            onClick={() => {
                              setSelectedReward(reward);
                              setShowRequestModal(true);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white text-sm">{reward.name}</h4>
                              <div className={`px-2 py-1 rounded text-xs font-bold ${
                                canAfford ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}>
                                {reward.xpCost} XP
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-3">{reward.description}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${
                                canAfford ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {canAfford ? '✅ Disponible' : '❌ XP insuffisants'}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">XP Collectifs de l'Équipe</h3>
                    <p className="text-gray-400">Effort combiné de toute l'équipe</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-400">{teamTotalXP.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">XP équipe</p>
                  </div>
                </div>
              </div>

              {teamRewards.map((category, categoryIndex) => {
                const CategoryIcon = getCategoryIcon(category.icon);
                
                return (
                  <motion.div
                    key={categoryIndex}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mr-4`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{category.category}</h3>
                        <p className="text-gray-400">
                          {category.minXP}-{category.maxXP} XP • {category.rewards.length} récompenses
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.rewards.map((reward, rewardIndex) => {
                        const canTeamAfford = teamTotalXP >= reward.xpCost;
                        
                        return (
                          <motion.div
                            key={rewardIndex}
                            className={`bg-gray-700/50 rounded-lg p-4 border transition-all hover:scale-[1.02] cursor-pointer ${
                              canTeamAfford 
                                ? 'border-blue-500/50 hover:border-blue-400' 
                                : 'border-gray-600/50 hover:border-gray-500'
                            }`}
                            onClick={() => {
                              setSelectedReward(reward);
                              setShowRequestModal(true);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white text-sm">{reward.name}</h4>
                              <div className={`px-2 py-1 rounded text-xs font-bold ${
                                canTeamAfford ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}>
                                {reward.xpCost} XP
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-3">{reward.description}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${
                                canTeamAfford ? 'text-blue-400' : 'text-red-400'
                              }`}>
                                {canTeamAfford ? '🎉 Équipe peut l\'obtenir' : '⏳ XP équipe insuffisants'}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {userRewardHistory.length === 0 ? (
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
                  variants={itemVariants}
                >
                  <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Aucune récompense encore</h3>
                  <p className="text-gray-400 mb-6">
                    Commencez à échanger vos XP contre des récompenses fantastiques !
                  </p>
                  <button
                    onClick={() => setActiveTab('individual')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Découvrir les récompenses</span>
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {userRewardHistory.map((historyItem, index) => {
                    const getStatusIcon = (status) => {
                      switch (status) {
                        case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
                        case 'pending': return <Clock4 className="w-5 h-5 text-yellow-400" />;
                        case 'rejected': return <X className="w-5 h-5 text-red-400" />;
                        default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
                      }
                    };

                    const getStatusText = (status) => {
                      switch (status) {
                        case 'approved': return 'Approuvée';
                        case 'pending': return 'En attente';
                        case 'rejected': return 'Rejetée';
                        default: return 'Inconnu';
                      }
                    };

                    const getStatusColor = (status) => {
                      switch (status) {
                        case 'approved': return 'border-green-500/50 bg-green-900/20';
                        case 'pending': return 'border-yellow-500/50 bg-yellow-900/20';
                        case 'rejected': return 'border-red-500/50 bg-red-900/20';
                        default: return 'border-gray-500/50 bg-gray-900/20';
                      }
                    };

                    return (
                      <motion.div
                        key={index}
                        className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 ${getStatusColor(historyItem.status)}`}
                        variants={itemVariants}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {getStatusIcon(historyItem.status)}
                            <div>
                              <h4 className="font-semibold text-white text-lg">
                                Récompense demandée
                              </h4>
                              <p className="text-gray-400 text-sm">
                                ID: {historyItem.rewardId}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                Demandée le {historyItem.requestedAt?.toDate ? 
                                  historyItem.requestedAt.toDate().toLocaleDateString() : 
                                  'Date inconnue'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              historyItem.status === 'approved' ? 'bg-green-600 text-white' :
                              historyItem.status === 'pending' ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {getStatusText(historyItem.status)}
                            </span>
                            {historyItem.status === 'rejected' && historyItem.rejectionReason && (
                              <p className="text-red-400 text-xs mt-2">
                                Raison: {historyItem.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Modal de demande de récompense */}
        {showRequestModal && selectedReward && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Confirmer la demande</h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedReward(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white text-lg mb-2">{selectedReward.name}</h4>
                <p className="text-gray-400 text-sm mb-4">{selectedReward.description}</p>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Coût:</span>
                    <span className="font-bold text-purple-400">{selectedReward.xpCost} XP</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Vos XP actuels:</span>
                    <span className="font-bold text-blue-400">{currentUserXP} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Après échange:</span>
                    <span className={`font-bold ${
                      currentUserXP - selectedReward.xpCost >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {currentUserXP - selectedReward.xpCost} XP
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {canAffordReward(selectedReward.xpCost) ? (
                  <button
                    onClick={() => handleRequestReward(selectedReward)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Gift className="w-5 h-5" />
                    <span>Demander cette récompense</span>
                  </button>
                ) : (
                  <div className="w-full bg-red-600/20 border border-red-500/50 text-red-400 py-3 rounded-lg font-semibold text-center">
                    ❌ XP insuffisants
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedReward(null);
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MessageCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Comment ça marche ?</p>
                    <p className="text-blue-300 text-xs mt-1">
                      Votre demande sera envoyée aux administrateurs pour validation. 
                      Vous serez notifié dès qu'elle sera traitée.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Message d'erreur */}
        {error && (
          <motion.div
            className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-2 text-red-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Conseil pour gagner plus d'XP */}
        {nextReward && (
          <motion.div
            className="fixed bottom-4 left-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-start space-x-2">
              <Target className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Prochaine récompense :</p>
                <p className="text-sm">{nextReward.name}</p>
                <p className="text-xs text-purple-200 mt-1">
                  Plus que {nextReward.xpNeeded} XP à gagner !
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
