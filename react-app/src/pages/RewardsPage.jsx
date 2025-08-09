// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// BOUTIQUE DES RÉCOMPENSES AVEC SYNCHRONISATION XP UNIFIÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Star, Zap, Crown, Award, ShoppingBag, 
  Coffee, Gamepad2, Palette, Clock, CheckCircle,  // ← Clock ajouté ici
  Lock, Unlock, Filter, Search, Tag 
} from 'lucide-react';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';

/**
 * 🎁 BOUTIQUE DES RÉCOMPENSES AVEC SYNCHRONISATION XP GARANTIE
 */
const RewardsPage = () => {
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
        id: 'task_master',
        name: 'Maître des Tâches',
        description: 'Complétez 50 tâches',
        icon: '🎯',
        cost: 200,
        category: 'badges',
        unlocked: (gamificationData?.tasksCompleted || 0) >= 50,
        requirement: 'Niveau 3'
      },
      {
        id: 'streak_champion',
        name: 'Champion des Séries',
        description: 'Série de 30 jours',
        icon: '🔥',
        cost: 500,
        category: 'badges',
        unlocked: badges.some(b => b.id === 'streak_champion' || b === 'streak_champion'),
        requirement: 'Niveau 5'
      }
    ],
    themes: [
      {
        id: 'dark_mode',
        name: 'Thème Sombre Premium',
        description: 'Interface élégante avec animations',
        icon: '🌙',
        cost: 150,
        category: 'themes',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'neon_theme',
        name: 'Thème Néon',
        description: 'Style cyberpunk avec effets lumineux',
        icon: '⚡',
        cost: 300,
        category: 'themes',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      }
    ],
    avatars: [
      {
        id: 'crown_avatar',
        name: 'Avatar Couronné',
        description: 'Montrez votre statut de leader',
        icon: '👑',
        cost: 250,
        category: 'avatars',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'robot_avatar',
        name: 'Avatar Robot',
        description: 'Style futuriste et technologique',
        icon: '🤖',
        cost: 400,
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

  // 🛒 ACHAT DE RÉCOMPENSE
  const handlePurchaseReward = async (reward) => {
    try {
      if (totalXp < reward.cost) {
        alert(`Vous n'avez pas assez d'XP! Il vous manque ${reward.cost - totalXp} XP.`);
        return;
      }

      if (!reward.unlocked) {
        alert(`Cette récompense nécessite: ${reward.requirement}`);
        return;
      }

      // Déduire les XP (simulation - en vrai il faudrait une API)
      await addXP(-reward.cost, 'reward_purchase', {
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost
      });

      // Animation de succès
      setShowPurchaseModal(false);
      alert(`🎉 ${reward.name} acheté avec succès!`);
      
    } catch (error) {
      console.error('❌ Erreur achat récompense:', error);
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
                Actualiser
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🔍 FILTRES ET RECHERCHE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Toutes catégories</option>
              <option value="badges">Badges</option>
              <option value="themes">Thèmes</option>
              <option value="avatars">Avatars</option>
              <option value="boosters">Boosters</option>
            </select>
            
            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="price">Prix (croissant)</option>
              <option value="name">Nom (A-Z)</option>
              <option value="category">Catégorie</option>
            </select>
            
            {/* Compteur */}
            <div className="flex items-center justify-center bg-white/5 rounded-lg p-2">
              <span className="text-gray-300 text-sm">
                {filteredRewards.length} récompense{filteredRewards.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 🏪 GRILLE DES RÉCOMPENSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                reward.unlocked
                  ? 'bg-white/10 border-white/20 hover:bg-white/15'
                  : 'bg-gray-800/50 border-gray-700/50 opacity-75'
              }`}
              onClick={() => reward.unlocked && setSelectedReward(reward)}
            >
              {/* Badge de catégorie */}
              <div className="absolute top-3 right-3 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReward(reward);
                          setShowPurchaseModal(true);
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Acheter
                      </button>
                    ) : (
                      <span className="text-red-400 text-sm font-medium">
                        Pas assez d'XP
                      </span>
                    )
                  ) : (
                    <div className="text-right">
                      <span className="text-gray-500 text-sm block">Verrouillé</span>
                      <span className="text-gray-600 text-xs">{reward.requirement}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bordure brillante pour les articles achetables */}
              {reward.unlocked && totalXp >= reward.cost && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 pointer-events-none rounded-xl"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 📊 STATISTIQUES DE LA BOUTIQUE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Progression et Objectifs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Récompenses débloquées */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {allRewards.filter(r => r.unlocked).length}
                </span>
              </div>
              <h4 className="text-white font-medium mb-1">Récompenses Débloquées</h4>
              <p className="text-gray-400 text-sm">
                sur {allRewards.length} total
              </p>
              <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  style={{ width: `${(allRewards.filter(r => r.unlocked).length / allRewards.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* XP dépensés */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
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
            
            {/* Prochaine récompense */}
            <div className="text-center">
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
                    disabled={totalXp < selectedReward.cost}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Acheter
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
