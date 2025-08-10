// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// BOUTIQUE DES RÉCOMPENSES AVEC ACHAT FONCTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Star, Zap, Crown, Award, ShoppingBag, 
  Coffee, Gamepad2, Palette, Clock, CheckCircle,
  Lock, Unlock, Filter, Search, Tag, Trophy,
  Target, Calendar, Users, Coins, RefreshCw, X,
  ShoppingCart
} from 'lucide-react';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { rewardsPurchaseService } from '../core/services/rewardsPurchaseService.js';

/**
 * 🎉 NOTIFICATION DE SUCCÈS D'ACHAT
 */
const PurchaseSuccessNotification = ({ purchaseSuccess, onClose }) => {
  if (!purchaseSuccess) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-xl z-50 max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{purchaseSuccess.reward.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">Achat réussi ! 🎉</h4>
          <p className="text-sm opacity-90 mb-2">{purchaseSuccess.reward.name}</p>
          <div className="text-xs opacity-75">
            <div>XP avant: {purchaseSuccess.previousXp.toLocaleString()}</div>
            <div>XP après: {purchaseSuccess.newXp.toLocaleString()}</div>
            <div>Coût: -{purchaseSuccess.reward.cost} XP</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * 🎁 BOUTIQUE DES RÉCOMPENSES AVEC SYNCHRONISATION XP GARANTIE
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES XP UNIFIÉES
  const {
    gamificationData,
    level,
    totalXp,
    badges,
    loading,
    isReady,
    syncStatus,
    lastUpdate,
    addXP,
    forceSync
  } = useUnifiedXP();

  // États locaux
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  // 🎁 RÉCOMPENSES DISPONIBLES (DYNAMIQUES BASÉES SUR LE NIVEAU ET XP)
  const rewardsData = {
    badges: [
      {
        id: 'early_bird',
        name: 'Lève-tôt',
        description: 'Connexion avant 8h pendant 7 jours',
        icon: '🌅',
        cost: 100,
        category: 'badges',
        unlocked: badges.some(b => b.id === 'early_bird' || b === 'early_bird'),
        requirement: 'Niveau 2'
      },
      {
        id: 'night_owl',
        name: 'Couche-tard',
        description: 'Travail productif après 22h',
        icon: '🦉',
        cost: 150,
        category: 'badges',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'task_master',
        name: 'Maître des tâches',
        description: '100 tâches complétées',
        icon: '✅',
        cost: 300,
        category: 'badges',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      }
    ],
    themes: [
      {
        id: 'dark_purple',
        name: 'Thème Violet Foncé',
        description: 'Interface élégante aux tons violets',
        icon: '🟣',
        cost: 200,
        category: 'themes',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'ocean_blue',
        name: 'Thème Océan',
        description: 'Ambiance marine apaisante',
        icon: '🌊',
        cost: 250,
        category: 'themes',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'sunset_orange',
        name: 'Thème Coucher de Soleil',
        description: 'Chaleur des couleurs automnales',
        icon: '🌅',
        cost: 350,
        category: 'themes',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      }
    ],
    avatars: [
      {
        id: 'robot_avatar',
        name: 'Avatar Robot',
        description: 'Avatar futuriste personnalisable',
        icon: '🤖',
        cost: 180,
        category: 'avatars',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'wizard_avatar',
        name: 'Avatar Sorcier',
        description: 'Avatar magique avec effets spéciaux',
        icon: '🧙‍♂️',
        cost: 320,
        category: 'avatars',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      },
      {
        id: 'crown_avatar',
        name: 'Avatar Royal',
        description: 'Avatar prestigieux avec couronne',
        icon: '👑',
        cost: 500,
        category: 'avatars',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      }
    ],
    boosters: [
      {
        id: 'xp_boost_24h',
        name: 'Boost XP 24h',
        description: 'Double XP pendant 24 heures',
        icon: '🚀',
        cost: 300,
        category: 'boosters',
        unlocked: true,
        requirement: 'Toujours disponible',
        duration: '24h'
      },
      {
        id: 'task_boost',
        name: 'Boost Tâches',
        description: '+50% XP sur les tâches (7 jours)',
        icon: '⚡',
        cost: 500,
        category: 'boosters',
        unlocked: level >= 3,
        requirement: 'Niveau 3',
        duration: '7 jours'
      }
    ]
  };

  // Combiner toutes les récompenses
  const allRewards = [
    ...rewardsData.badges,
    ...rewardsData.themes,
    ...rewardsData.avatars,
    ...rewardsData.boosters
  ];

  // Filtrer et trier les récompenses
  const filteredRewards = allRewards
    .filter(reward => {
      if (selectedCategory !== 'all' && reward.category !== selectedCategory) return false;
      if (searchTerm && !reward.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.cost - b.cost;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  /**
   * 🛒 ACHAT DE RÉCOMPENSE AVEC DÉDUCTION XP GARANTIE
   */
  const handlePurchaseReward = async (reward) => {
    if (purchasing || !user?.uid) {
      return;
    }

    try {
      setPurchasing(true);
      console.log('🛒 [REWARDS-PAGE] Début achat:', reward.name);

      // Vérifications préalables
      if (totalXp < reward.cost) {
        throw new Error(`Vous n'avez pas assez d'XP! Il vous manque ${reward.cost - totalXp} XP.`);
      }

      if (!reward.unlocked) {
        throw new Error(`Cette récompense nécessite: ${reward.requirement}`);
      }

      // Acheter via le service sécurisé
      const result = await rewardsPurchaseService.purchaseReward(user.uid, reward);

      if (result.success) {
        // Succès !
        setPurchaseSuccess({
          reward: result.reward,
          previousXp: result.previousXp,
          newXp: result.newXp,
          message: result.message
        });

        // Fermer le modal d'achat
        setShowPurchaseModal(false);

        // Forcer la synchronisation pour mettre à jour l'interface
        setTimeout(() => {
          if (forceSync) {
            forceSync();
          }
        }, 500);

        console.log('✅ [REWARDS-PAGE] Achat réussi:', result);

        // Auto-clear le message de succès après 5 secondes
        setTimeout(() => {
          setPurchaseSuccess(null);
        }, 5000);

      } else {
        throw new Error('Achat échoué');
      }

    } catch (error) {
      console.error('❌ [REWARDS-PAGE] Erreur achat:', error);
      alert(`❌ Erreur lors de l'achat: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  // Écouter les achats de récompenses
  useEffect(() => {
    const handleRewardPurchased = (event) => {
      const { userId, reward, newXp } = event.detail;
      
      if (userId === user?.uid) {
        console.log('🔄 [REWARDS-PAGE] Achat détecté, mise à jour interface');
        
        // Forcer la synchronisation XP
        if (forceSync) {
          forceSync();
        }
      }
    };

    window.addEventListener('rewardPurchased', handleRewardPurchased);

    return () => {
      window.removeEventListener('rewardPurchased', handleRewardPurchased);
    };
  }, [user?.uid, forceSync]);

  // ⏳ CHARGEMENT
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl animate-pulse flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Chargement de la boutique...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation: {syncStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative">
      
      {/* Notification de succès */}
      <AnimatePresence>
        <PurchaseSuccessNotification 
          purchaseSuccess={purchaseSuccess}
          onClose={() => setPurchaseSuccess(null)}
        />
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* 🎁 EN-TÊTE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-400" />
                Boutique des Récompenses
              </h1>
              <p className="text-gray-400">
                Échangez vos XP contre des récompenses fantastiques !
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Dernière synchronisation: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'En cours...'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Solde XP */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-4 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">XP Disponibles</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</p>
                <p className="text-orange-100 text-sm">Niveau {level}</p>
              </div>
              
              <button
                onClick={forceSync}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="price">Trier par prix</option>
              <option value="name">Trier par nom</option>
              <option value="category">Trier par catégorie</option>
            </select>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', name: 'Toutes', icon: '🎁' },
              { id: 'badges', name: 'Badges', icon: '🏆' },
              { id: 'themes', name: 'Thèmes', icon: '🎨' },
              { id: 'avatars', name: 'Avatars', icon: '👤' },
              { id: 'boosters', name: 'Boosters', icon: '⚡' }
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 📊 STATISTIQUES RAPIDES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* XP Disponibles */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">XP Disponibles</h4>
              <p className="text-gray-400 text-sm">
                {totalXp.toLocaleString()} XP
              </p>
              <p className="text-purple-400 text-xs mt-1">
                Peut acheter {allRewards.filter(r => r.unlocked && totalXp >= r.cost).length} articles
              </p>
            </div>
            
            {/* Niveau actuel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">Niveau Actuel</h4>
              <p className="text-gray-400 text-sm">
                Niveau {level}
              </p>
              <p className="text-blue-400 text-xs mt-1">
                {allRewards.filter(r => r.unlocked).length} récompenses débloquées
              </p>
            </div>
            
            {/* Prochaine récompense */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">Prochain Objectif</h4>
              <p className="text-gray-400 text-sm">
                Niveau {level + 1}
              </p>
              <p className="text-orange-400 text-xs mt-1">
                Pour débloquer plus de récompenses
              </p>
            </div>
          </div>
        </motion.div>

        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  !reward.unlocked ? 'opacity-60' : ''
                }`}
                onClick={() => {
                  setSelectedReward(reward);
                  setShowPurchaseModal(true);
                }}
              >
                {/* Badge catégorie */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    reward.category === 'badges' ? 'bg-yellow-500 text-yellow-900' :
                    reward.category === 'themes' ? 'bg-purple-500 text-white' :
                    reward.category === 'avatars' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {reward.category}
                  </span>
                </div>

                {/* Icône de verrouillage */}
                {!reward.unlocked && (
                  <div className="absolute top-3 left-3 z-10">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                <div className="p-6">
                  {/* Icône principale */}
                  <div className="text-6xl mb-4 text-center">
                    {reward.icon}
                  </div>

                  {/* Nom et description */}
                  <h3 className="text-xl font-bold text-white mb-2 text-center">
                    {reward.name}
                  </h3>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    {reward.description}
                  </p>

                  {/* Durée (pour les boosters) */}
                  {reward.duration && (
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm font-medium">
                        {reward.duration}
                      </span>
                    </div>
                  )}

                  {/* Prix et statut */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{reward.cost} XP</span>
                    </div>
                    
                    {reward.unlocked ? (
                      totalXp >= reward.cost ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <span className="text-red-400 text-sm">
                          -{(reward.cost - totalXp).toLocaleString()} XP
                        </span>
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message si aucune récompense */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune récompense trouvée
              </h3>
              <p className="text-gray-400">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </motion.div>

        {/* 🛒 MODAL D'ACHAT */}
        <AnimatePresence>
          {showPurchaseModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPurchaseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl p-6 max-w-md w-full border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedReward.name}</h3>
                  <p className="text-gray-400">{selectedReward.description}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Prix:</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{selectedReward.cost} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Vos XP:</span>
                    <span className="text-white font-bold">{totalXp.toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Après achat:</span>
                    <span className={`font-bold ${totalXp - selectedReward.cost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(totalXp - selectedReward.cost).toLocaleString()} XP
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handlePurchaseReward(selectedReward)}
                    disabled={totalXp < selectedReward.cost || purchasing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Achat...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Acheter
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RewardsPage;
