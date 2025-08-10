// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// BOUTIQUE DES RÉCOMPENSES AVEC SYNCHRONISATION XP UNIFIÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Star, Zap, Crown, Award, ShoppingBag, 
  Coffee, Gamepad2, Palette, Clock, CheckCircle,
  Lock, Unlock, Filter, Search, Tag, Trophy,
  Target, Calendar, Users, Coins, RefreshCw,
  ShoppingCart // ✅ AJOUT DE L'IMPORT MANQUANT
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
        id: 'perfectionist',
        name: 'Perfectionniste',
        description: '100% de tâches complétées pendant 1 semaine',
        icon: '🎯',
        cost: 200,
        category: 'badges',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      }
    ],
    rewards: [
      {
        id: 'coffee_break',
        name: 'Pause café premium',
        description: 'Un bon café et une viennoiserie',
        icon: '☕',
        cost: 150,
        category: 'mini-pleasures',
        unlocked: true
      },
      {
        id: 'lunch_voucher',
        name: 'Bon restaurant',
        description: 'Déjeuner dans un restaurant de votre choix',
        icon: '🍽️',
        cost: 500,
        category: 'food',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'movie_tickets',
        name: '2 places de cinéma',
        description: 'Sortie cinéma avec popcorn inclus',
        icon: '🎬',
        cost: 800,
        category: 'entertainment',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'spa_day',
        name: 'Journée spa',
        description: 'Détente complète dans un spa',
        icon: '🧘',
        cost: 2000,
        category: 'wellness',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'tech_gadget',
        name: 'Gadget tech',
        description: 'Accessoire high-tech de votre choix',
        icon: '📱',
        cost: 3500,
        category: 'premium',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      }
    ]
  };

  // Combiner tous les items
  const allRewards = [...rewardsData.badges, ...rewardsData.rewards];

  // Filtrer et trier les récompenses
  const filteredRewards = allRewards
    .filter(reward => {
      const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
      const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.cost - b.cost;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'unlocked':
          return b.unlocked - a.unlocked;
        default:
          return 0;
      }
    });

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Toutes', icon: '🎁' },
    { id: 'badges', name: 'Badges', icon: '🏆' },
    { id: 'mini-pleasures', name: 'Mini-plaisirs', icon: '☕' },
    { id: 'food', name: 'Restauration', icon: '🍽️' },
    { id: 'entertainment', name: 'Loisirs', icon: '🎬' },
    { id: 'wellness', name: 'Bien-être', icon: '🧘' },
    { id: 'premium', name: 'Premium', icon: '👑' }
  ];

  // Gestion de l'achat de récompense
  const handlePurchaseReward = async (reward) => {
    if (totalXp < reward.cost) {
      alert('Pas assez d\'XP pour cette récompense !');
      return;
    }

    try {
      // Simulation d'achat (à remplacer par la vraie logique)
      console.log('🎁 Achat de récompense:', reward);
      
      // Déduire les XP (simulation)
      // await addXP(-reward.cost);
      
      alert(`🎉 Félicitations ! Vous venez d'obtenir "${reward.name}" !`);
      setShowPurchaseModal(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('❌ Erreur achat récompense:', error);
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
    }
  };

  // Si les données ne sont pas encore prêtes
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de la boutique...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation: {syncStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* 🎨 HEADER DE LA BOUTIQUE */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Boutique des Récompenses</h1>
          </div>
          
          <p className="text-gray-400 text-lg mb-6">
            Échangez vos XP contre des récompenses fantastiques !
          </p>

          {/* 💰 SOLDE XP ET NIVEAU */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">Niveau {level}</span>
              </div>
            </div>
          </div>

          {/* 🔄 BOUTON DE SYNCHRONISATION */}
          <button
            onClick={forceSync}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Synchroniser
          </button>
        </motion.div>

        {/* 🔍 FILTRES ET RECHERCHE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          {/* Barre de recherche */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
            >
              <option value="price">Prix croissant</option>
              <option value="name">Nom A-Z</option>
              <option value="unlocked">Disponibles d'abord</option>
            </select>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer group transition-all ${
                reward.unlocked 
                  ? totalXp >= reward.cost
                    ? 'border-green-500/50 hover:border-green-400 hover:scale-105'
                    : 'border-gray-600/50 hover:border-gray-500'
                  : 'border-red-500/50 opacity-75'
              }`}
              onClick={() => {
                if (reward.unlocked) {
                  setSelectedReward(reward);
                  setShowPurchaseModal(true);
                }
              }}
            >
              {/* Statut de déverrouillage */}
              <div className="absolute top-3 right-3">
                {reward.unlocked ? (
                  totalXp >= reward.cost ? (
                    <Unlock className="w-5 h-5 text-green-400" />
                  ) : (
                    <Coins className="w-5 h-5 text-yellow-400" />
                  )
                ) : (
                  <Lock className="w-5 h-5 text-red-400" />
                )}
              </div>

              {/* Icône et nom */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{reward.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{reward.name}</h3>
                <p className="text-gray-400 text-sm">{reward.description}</p>
              </div>

              {/* Prix et action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-bold">{reward.cost} XP</span>
                </div>
                
                <div>
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
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Statistiques
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {filteredRewards.filter(r => r.unlocked && totalXp >= r.cost).length}
              </div>
              <div className="text-gray-400 text-sm">Récompenses accessibles</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {filteredRewards.filter(r => !r.unlocked).length}
              </div>
              <div className="text-gray-400 text-sm">À débloquer</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {Math.min(...filteredRewards.filter(r => r.unlocked && totalXp < r.cost).map(r => r.cost - totalXp)) || 0}
              </div>
              <div className="text-gray-400 text-sm">XP pour la prochaine</div>
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
