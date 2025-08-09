// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// CORRECTION IMPORT CLOCK - LIGNE PAR LIGNE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Crown, 
  Zap, 
  Trophy,
  Award,
  RefreshCw,
  ShoppingCart,
  Check,
  Lock,
  ArrowRight,
  Coins,
  Target,
  Sparkles,
  ChevronDown,
  Filter,
  Search,
  Clock  // ✅ AJOUT DE L'IMPORT MANQUANT
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
        icon: '📋',
        cost: 200,
        category: 'badges',
        unlocked: badges.some(b => b.id === 'task_master' || b === 'task_master'),
        requirement: 'Niveau 5'
      },
      {
        id: 'team_player',
        name: 'Esprit d\'Équipe',
        description: 'Aidez 10 collègues',
        icon: '🤝',
        cost: 150,
        category: 'badges',
        unlocked: badges.some(b => b.id === 'team_player' || b === 'team_player'),
        requirement: 'Niveau 3'
      }
    ],
    boosters: [
      {
        id: 'xp_double',
        name: 'XP Double',
        description: 'Doublez vos gains XP pendant 1 heure',
        icon: '⚡',
        cost: 300,
        category: 'boosters',
        duration: '1 heure',
        unlocked: level >= 3
      },
      {
        id: 'productivity_boost',
        name: 'Boost Productivité',
        description: 'Augmente l\'efficacité de 25% pendant 2 heures',
        icon: '🚀',
        cost: 500,
        category: 'boosters',
        duration: '2 heures',
        unlocked: level >= 5
      }
    ],
    cosmetics: [
      {
        id: 'golden_avatar',
        name: 'Avatar Doré',
        description: 'Avatar avec bordure dorée',
        icon: '👑',
        cost: 800,
        category: 'cosmetics',
        unlocked: level >= 10
      },
      {
        id: 'custom_theme',
        name: 'Thème Personnalisé',
        description: 'Accès aux thèmes premium',
        icon: '🎨',
        cost: 1000,
        category: 'cosmetics',
        unlocked: level >= 15
      }
    ],
    special: [
      {
        id: 'mentor_session',
        name: 'Session Mentoring',
        description: 'Séance de mentoring d\'1h avec un expert',
        icon: '🎓',
        cost: 1500,
        category: 'special',
        unlocked: level >= 20
      }
    ]
  };

  // 📊 CATÉGORIES
  const categories = [
    { id: 'all', name: 'Toutes', icon: Gift, count: null },
    { id: 'badges', name: 'Badges', icon: Award, count: rewardsData.badges.length },
    { id: 'boosters', name: 'Boosters', icon: Zap, count: rewardsData.boosters.length },
    { id: 'cosmetics', name: 'Cosmétiques', icon: Crown, count: rewardsData.cosmetics.length },
    { id: 'special', name: 'Spécial', icon: Star, count: rewardsData.special.length }
  ];

  // Toutes les récompenses
  const allRewards = Object.values(rewardsData).flat();
  
  // Filtrer les récompenses
  const filteredRewards = allRewards.filter(reward => {
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Trier les récompenses
  const sortedRewards = [...filteredRewards].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.cost - b.cost;
      case 'price_desc':
        return b.cost - a.cost;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return a.cost - b.cost;
    }
  });

  // 🛒 ACHAT DE RÉCOMPENSE
  const handlePurchase = async (reward) => {
    if (totalXp < reward.cost) {
      alert('❌ Pas assez d\'XP pour cet achat !');
      return;
    }

    try {
      // Déduire les XP
      await addXP(-reward.cost, `Achat de ${reward.name}`);
      
      // Ajouter la récompense selon son type
      if (reward.category === 'badges') {
        // Logique d'ajout de badge
        console.log('🏆 Badge débloqué:', reward.name);
      } else if (reward.category === 'boosters') {
        // Activer le booster
        console.log('⚡ Booster activé:', reward.name);
      }
      
      alert(`✅ ${reward.name} acheté avec succès !`);
      setShowPurchaseModal(false);
      
    } catch (error) {
      console.error('❌ Erreur achat:', error);
      alert('❌ Erreur lors de l\'achat. Veuillez réessayer.');
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
                Synchroniser
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🔍 FILTRES ET RECHERCHE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Barre de recherche */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher des récompenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Tri */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                  <option value="category">Catégorie</option>
                </select>
              </div>
            </div>
            
            {/* Catégories */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                    {category.count !== null && (
                      <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {sortedRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ${
                !reward.unlocked ? 'opacity-60' : ''
              }`}
            >
              {/* Badge catégorie */}
              <div className="absolute top-3 right-3 z-10">
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                  reward.category === 'badges' ? 'bg-yellow-500 text-yellow-900' :
                  reward.category === 'boosters' ? 'bg-green-500 text-green-900' :
                  reward.category === 'cosmetics' ? 'bg-pink-500 text-pink-900' :
                  reward.category === 'special' ? 'bg-purple-500 text-white' :
                  'bg-gray-500 text-white'
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
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowPurchaseModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Acheter
                      </button>
                    ) : (
                      <span className="text-red-400 text-sm font-medium">
                        XP insuffisant
                      </span>
                    )
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {reward.requirement || 'Verrouillé'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Message si aucune récompense */}
        {sortedRewards.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune récompense trouvée</h3>
            <p className="text-gray-400">
              Essayez de modifier vos filtres ou continuez à gagner de l'XP !
            </p>
          </motion.div>
        )}

        {/* 💳 MODAL D'ACHAT */}
        <AnimatePresence>
          {showPurchaseModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowPurchaseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedReward.name}
                  </h3>
                  <p className="text-gray-400">
                    {selectedReward.description}
                  </p>
                  {selectedReward.duration && (
                    <div className="flex items-center justify-center gap-1 mt-3">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm font-medium">
                        Durée: {selectedReward.duration}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Prix:</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{selectedReward.cost} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-300">Votre solde:</span>
                    <span className="text-white font-bold">{totalXp} XP</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
                    <span className="text-gray-300">Après achat:</span>
                    <span className={`font-bold ${
                      totalXp - selectedReward.cost >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {totalXp - selectedReward.cost} XP
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
                    onClick={() => handlePurchase(selectedReward)}
                    disabled={totalXp < selectedReward.cost}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Confirmer l'achat
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
