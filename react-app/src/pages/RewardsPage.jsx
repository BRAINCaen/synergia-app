// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES CORRIGÉE - Version compatible avec l'existant
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
  Target,
  CheckCircle,
  AlertCircle,
  Clock4,
  X,
  Coins,
  Trophy,
  Heart,
  ShoppingBag,
  Calendar,
  Coffee,
  ChevronRight,
  RefreshCw,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

// Stores existants
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

// Hook Firebase unifié
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎁 PAGE RÉCOMPENSES CORRIGÉE ET FONCTIONNELLE
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();

  // États locaux
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Écoute Firebase directe
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // XP actuels de l'utilisateur
  const currentUserXP = userData?.gamification?.totalXp || userStats?.totalXp || 0;

  /**
   * 🎁 RÉCOMPENSES INDIVIDUELLES INTÉGRÉES
   */
  const getIndividualRewards = () => [
    {
      category: 'Mini-plaisirs',
      icon: '🥤',
      minXP: 50,
      maxXP: 100,
      color: 'from-green-400 to-blue-500',
      rewards: [
        { id: 'snack_personal', name: 'Goûter personnalisé', xpCost: 50, description: 'Pâtisserie, donuts, croissant, cookie…' },
        { id: 'mini_game', name: 'Mini-jeu de bureau', xpCost: 80, description: 'Antistress, mini-plante, balle à malaxer' },
        { id: 'unlimited_break', name: 'Pause illimitée', xpCost: 100, description: 'Bon "pause illimitée" sur une journée calme' }
      ]
    },
    {
      category: 'Petits avantages',
      icon: '⏰',
      minXP: 100,
      maxXP: 200,
      color: 'from-blue-400 to-purple-500',
      rewards: [
        { id: 'time_off_15min', name: '15 min off', xpCost: 120, description: 'Arriver plus tard/partir plus tôt' },
        { id: 'nap_authorized', name: 'Pause sieste autorisée', xpCost: 150, description: 'Avec réveil garanti !' },
        { id: 'light_shift', name: 'Shift "super light"', xpCost: 180, description: 'Que les tâches sympas' }
      ]
    },
    {
      category: 'Plaisirs utiles',
      icon: '🍱',
      minXP: 200,
      maxXP: 400,
      color: 'from-purple-400 to-pink-500',
      rewards: [
        { id: 'action_voucher', name: 'Bon "action"', xpCost: 220, description: 'Petit achat fun <10€ type Action/Nos/Foir\'Fouille' },
        { id: 'breakfast_surprise', name: 'Petit-déj surprise', xpCost: 280, description: 'Viennoiseries, jus, café…' },
        { id: 'book_choice', name: 'Livre au choix', xpCost: 320, description: 'Roman, BD…' },
        { id: 'pizza_lunch', name: 'Pizza du midi', xpCost: 380, description: 'Solo ou partagée' }
      ]
    },
    {
      category: 'Plaisirs food & cadeaux',
      icon: '🍔',
      minXP: 400,
      maxXP: 700,
      color: 'from-pink-400 to-red-500',
      rewards: [
        { id: 'restaurant_voucher', name: 'Bon d\'achat "restauration"', xpCost: 450, description: '10/20€' },
        { id: 'poke_bowl', name: 'Poke bowl/burger livré', xpCost: 520, description: 'Plat du resto préféré livré sur place' },
        { id: 'gift_voucher', name: 'Bon cadeau magasins', xpCost: 600, description: 'Amazon, Fnac, Cultura, Carrefour, Decathlon (10/20€)' },
        { id: 'board_game', name: 'Jeu de société offert', xpCost: 680, description: 'Un jeu de société au choix' }
      ]
    },
    {
      category: 'Loisirs & sorties',
      icon: '🎉',
      minXP: 1000,
      maxXP: 1500,
      color: 'from-yellow-400 to-orange-500',
      rewards: [
        { id: 'cinema_tickets', name: '2 places de cinéma', xpCost: 1100, description: 'Pour toi et ton accompagnant' },
        { id: 'escape_game', name: 'Place d\'escape game', xpCost: 1200, description: 'À offrir (famille/ami)' },
        { id: 'discovery_activity', name: 'Initiation/découverte', xpCost: 1350, description: 'Escalade, atelier créatif, sport fun…' }
      ]
    },
    {
      category: 'Premium',
      icon: '🏅',
      minXP: 6000,
      maxXP: 15000,
      color: 'from-blue-400 to-green-500',
      rewards: [
        { id: 'premium_card', name: 'Carte cadeau premium', xpCost: 6500, description: '50 ou 100€' },
        { id: 'hotel_night', name: '1 nuit d\'hôtel pour 2', xpCost: 8000, description: 'Si gros niveau d\'XP' },
        { id: 'spa_day', name: 'Journée spa', xpCost: 12500, description: 'Spa, balnéo, hammam…' }
      ]
    }
  ];

  /**
   * 👥 RÉCOMPENSES D'ÉQUIPE
   */
  const getTeamRewards = () => [
    {
      category: 'Petites attentions',
      icon: '🥤',
      minXP: 500,
      maxXP: 1000,
      color: 'from-green-400 to-blue-500',
      rewards: [
        { id: 'candy_bar', name: 'Bar à bonbons/chocolats', xpCost: 600, description: 'Pour tout le monde' },
        { id: 'giant_snack', name: 'Goûter géant livré', xpCost: 800, description: 'Viennoiseries, cookies, pâtisseries' }
      ]
    },
    {
      category: 'Food & apéro',
      icon: '🍕',
      minXP: 1000,
      maxXP: 2000,
      color: 'from-blue-400 to-purple-500',
      rewards: [
        { id: 'pizza_party', name: 'Pizza party sur place', xpCost: 1200, description: 'Pour toute l\'équipe' },
        { id: 'aperitif_dinner', name: 'Apéro dinatoire', xpCost: 1600, description: 'Soft ou festif' }
      ]
    }
  ];

  /**
   * 💰 VÉRIFIER SI L'UTILISATEUR PEUT S'OFFRIR UNE RÉCOMPENSE
   */
  const canAffordReward = (rewardCost) => {
    return currentUserXP >= rewardCost;
  };

  /**
   * 🎯 OBTENIR LES RÉCOMPENSES DISPONIBLES
   */
  const getAvailableRewards = () => {
    return getIndividualRewards().filter(category => 
      currentUserXP >= category.minXP
    );
  };

  /**
   * 🎁 DEMANDER UNE RÉCOMPENSE (SIMULATION)
   */
  const handleRequestReward = async (reward) => {
    try {
      console.log('🎁 Demande de récompense:', reward.name);
      
      // Simulation de demande réussie
      setShowRequestModal(false);
      setSelectedReward(null);
      
      alert(`🎉 Demande envoyée pour "${reward.name}" (${reward.xpCost} XP)!\n\nUn admin va valider votre demande.`);
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      alert('❌ Erreur lors de la demande. Réessayez plus tard.');
    }
  };

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Simulation du rafraîchissement
    setTimeout(() => {
      setRefreshing(false);
      console.log('🔄 Données rafraîchies');
    }, 1000);
  };

  // Icônes pour les catégories
  const getCategoryIcon = (icon) => {
    const iconMap = {
      '🥤': Coffee,
      '⏰': Clock,
      '🍱': ShoppingBag,
      '🍔': Coffee,
      '🎉': Trophy,
      '🏅': Crown,
      '🍕': Coffee
    };
    return iconMap[icon] || Gift;
  };

  // Données disponibles
  const availableRewards = getAvailableRewards();
  const teamRewards = getTeamRewards();
  const teamTotalXP = 5000; // Simulé pour la démo

  // Statistiques simulées
  const rewardStats = {
    totalRedeemed: 3,
    totalPending: 1,
    totalRejected: 0,
    totalAvailable: availableRewards.reduce((sum, cat) => sum + cat.rewards.length, 0)
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
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
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              {/* Lien vers admin (visible si admin) */}
              {(user?.role === 'admin' || user?.isAdmin) && (
                <a
                  href="/admin/rewards"
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  <span>Admin</span>
                </a>
              )}
            </div>
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

            {/* Récompenses obtenues */}
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

            {/* Disponibles */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Disponibles</p>
                  <p className="text-3xl font-bold text-purple-400">{rewardStats.totalAvailable}</p>
                  <p className="text-gray-500 text-xs mt-1">Récompenses accessibles</p>
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
              {availableRewards.length === 0 ? (
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
                  variants={itemVariants}
                >
                  <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Gagnez plus d'XP !</h3>
                  <p className="text-gray-400 mb-6">
                    Vous avez besoin de plus d'XP pour débloquer des récompenses.
                  </p>
                  <p className="text-gray-500 text-sm">
                    XP actuels: <span className="text-blue-400 font-bold">{currentUserXP}</span> • 
                    Minimum requis: <span className="text-purple-400 font-bold">50 XP</span>
                  </p>
                </motion.div>
              ) : (
                availableRewards.map((category, categoryIndex) => {
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
                })
              )}
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
        </motion.div>

        {/* Modal de demande de récompense */}
        {showRequestModal && selectedReward && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
      </div>
    </div>
  );
};

export default RewardsPage;
