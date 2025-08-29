// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift,
  Star,
  Trophy,
  Crown,
  Zap,
  Heart,
  Target,
  Award,
  Coins,
  Gem,
  Sparkles,
  Lock,
  Unlock,
  ShoppingCart,
  Calendar,
  Clock,
  Eye,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Package,
  Coffee,
  Book,
  Gamepad2
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎁 DÉFINITIONS DES RÉCOMPENSES SYNERGIA
const REWARDS_CATALOG = {
  // 🍯 Mini-plaisirs (50-150 XP)
  snack_personal: {
    id: 'snack_personal',
    name: 'Première Tâche',
    description: 'Complétez votre première tâche',
    icon: '🟡',
    category: 'Commune',
    xpCost: 0,
    available: true,
    type: 'badge'
  },
  boost_xp: {
    id: 'boost_xp',
    name: 'Boost XP',
    description: '+50 XP bonus',
    icon: '⚡',
    category: 'XP Bonus',
    xpCost: 100,
    available: true,
    type: 'consumable'
  },

  // 🎯 Badges disponibles  
  first_task_badge: {
    id: 'first_task_badge',
    name: 'Badge',
    description: 'Condition complétée',
    icon: '🏆',
    category: 'Badge',
    xpCost: 0,
    available: true,
    type: 'badge',
    unlocked: false
  },

  // 🎁 Récompenses premium
  premium_title: {
    id: 'premium_title',
    name: 'Titre Premium',
    description: 'Titre exclusif pour votre profil',
    icon: '👑',
    category: 'Premium',
    xpCost: 500,
    available: false,
    type: 'cosmetic'
  }
};

// 🎨 CONFIGURATION DES CATÉGORIES
const REWARD_CATEGORIES = {
  'Commune': { label: 'Commune', icon: Star, color: 'gray' },
  'XP Bonus': { label: 'XP Bonus', icon: Zap, color: 'blue' },
  'Badge': { label: 'Badge', icon: Award, color: 'yellow' },
  'Premium': { label: 'Premium', icon: Crown, color: 'purple' }
};

const RewardsPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS RÉCOMPENSES
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous les types');
  const [sortBy, setSortBy] = useState('Toutes les raretés');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [rewardsData, setRewardsData] = useState({
    totalRewards: 5,
    unlockedRewards: 0,
    availableRewards: 5,
    xpSpent: 0,
    completion: 0
  });

  // 📊 CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [REWARDS] Chargement des données depuis Firebase...');
    setLoading(true);

    // Charger le profil utilisateur
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', user.uid)
    );
    
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUserProfile(userData);
        
        // Récupérer les récompenses de l'utilisateur
        const rewards = userData.rewards || [];
        setUserRewards(rewards);
        
        // Calculer les statistiques
        const totalRewards = Object.keys(REWARDS_CATALOG).length;
        const unlockedRewards = rewards.length;
        const availableRewards = Object.values(REWARDS_CATALOG).filter(r => r.available).length;
        const completion = totalRewards > 0 ? Math.round((unlockedRewards / totalRewards) * 100) : 0;
        
        setRewardsData({
          totalRewards,
          unlockedRewards,
          availableRewards,
          xpSpent: rewards.reduce((sum, reward) => sum + (reward.xpCost || 0), 0),
          completion
        });
        
        console.log('🎁 [REWARDS] Profil utilisateur chargé avec', rewards.length, 'récompenses');
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ [REWARDS] Erreur chargement profil:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user?.uid]);

  // 🔍 FILTRAGE ET TRI DES RÉCOMPENSES
  const filteredRewards = useMemo(() => {
    let rewards = Object.values(REWARDS_CATALOG);

    // Filtre par recherche
    if (searchTerm) {
      rewards = rewards.filter(reward =>
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'Tous les types') {
      rewards = rewards.filter(reward => reward.category === selectedCategory);
    }

    // Filtre par disponibilité
    if (showOnlyAvailable) {
      rewards = rewards.filter(reward => reward.available);
    }

    return rewards;
  }, [searchTerm, selectedCategory, showOnlyAvailable]);

  // 🔄 ACTUALISER LES DONNÉES
  const refreshData = () => {
    window.location.reload();
  };

  // 🎁 ACHETER UNE RÉCOMPENSE
  const handlePurchaseReward = async (reward) => {
    if (!userProfile) return;

    const userXp = userProfile.gamification?.totalXp || 0;
    
    if (userXp < reward.xpCost) {
      alert(`Vous n'avez pas assez d'XP pour cette récompense. Il vous faut ${reward.xpCost} XP.`);
      return;
    }

    try {
      console.log('🛒 [PURCHASE] Achat récompense:', reward.name);
      
      // Logique d'achat de récompense
      alert(`Récompense "${reward.name}" achetée avec succès !`);
      
    } catch (error) {
      console.error('❌ [PURCHASE] Erreur achat:', error);
      alert('Erreur lors de l\'achat de la récompense');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chargement des récompenses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 🎁 HEADER RÉCOMPENSES */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre et actions */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Récompenses
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Débloquez et collectionnez vos récompenses
                  </p>
                </div>
              </div>

              {/* Actions du header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </button>
                <button
                  onClick={() => window.location.href = '/gamification'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir Gamification
                </button>
              </div>
            </div>

            {/* Statistiques des récompenses */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Package className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {rewardsData.totalRewards}
                </div>
                <div className="text-gray-400 text-sm font-medium">Récompenses</div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {rewardsData.unlockedRewards}
                </div>
                <div className="text-gray-400 text-sm font-medium">Débloquées</div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {rewardsData.availableRewards}
                </div>
                <div className="text-gray-400 text-sm font-medium">Disponibles</div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {rewardsData.xpSpent}
                </div>
                <div className="text-gray-400 text-sm font-medium">XP dépensés</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 📊 CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Progression de collection */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Progression de Collection</h2>
                  <p className="text-purple-100">
                    {rewardsData.unlockedRewards} sur {rewardsData.totalRewards} récompenses débloquées
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white mb-1">
                    {rewardsData.completion}%
                  </div>
                  <div className="text-purple-100 text-sm">Complète</div>
                </div>
              </div>

              <div className="w-full bg-purple-800/50 rounded-full h-4">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${rewardsData.completion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* 🔍 FILTRES ET RECHERCHE */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des récompenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="Tous les types">Tous les types</option>
                  {Object.keys(REWARD_CATEGORIES).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="Toutes les raretés">Toutes les raretés</option>
                  <option value="Possédées uniquement">Possédées uniquement</option>
                </select>
              </div>
            </div>

            {/* Toggle disponibles uniquement */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAvailableOnly"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="showAvailableOnly" className="text-gray-300 text-sm">
                  Afficher uniquement les récompenses disponibles
                </label>
              </div>

              <div className="text-sm text-gray-400">
                {filteredRewards.length} récompense{filteredRewards.length > 1 ? 's' : ''} affichée{filteredRewards.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* 🎁 GRILLE DES RÉCOMPENSES */}
          {filteredRewards.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-8xl mb-6">🎁</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm ? 'Aucune récompense trouvée' : 'Aucune récompense disponible'}
              </h3>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Aucune récompense ne correspond à votre recherche. Essayez avec d\'autres mots-clés.'
                  : 'Les récompenses apparaîtront ici une fois que vous aurez accumulé assez d\'XP.'
                }
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredRewards.map((reward, index) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  isOwned={userRewards.some(userReward => userReward.id === reward.id)}
                  userXp={userProfile?.gamification?.totalXp || 0}
                  onPurchase={handlePurchaseReward}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// 🎁 COMPOSANT CARTE RÉCOMPENSE
const RewardCard = ({ reward, isOwned, userXp, onPurchase, index }) => {
  const categoryConfig = REWARD_CATEGORIES[reward.category] || REWARD_CATEGORIES['Commune'];
  const canAfford = userXp >= reward.xpCost;
  const isAvailable = reward.available;

  const handlePurchaseClick = () => {
    if (isOwned) return;
    if (!canAfford) {
      alert(`Vous n'avez pas assez d'XP pour cette récompense. Il vous faut ${reward.xpCost} XP.`);
      return;
    }
    if (!isAvailable) {
      alert('Cette récompense n\'est pas disponible actuellement.');
      return;
    }
    
    onPurchase(reward);
  };

  return (
    <motion.div
      className={`
        relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6
        hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300
        ${isOwned ? 'ring-2 ring-green-500/50' : ''}
        ${!isAvailable ? 'opacity-60' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Statut en haut à droite */}
      <div className="absolute top-3 right-3">
        {isOwned ? (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        ) : !isAvailable ? (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Lock className="h-4 w-4 text-white" />
          </div>
        ) : canAfford ? (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
            <Lock className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Icône de la récompense */}
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto
        ${isOwned 
          ? 'bg-green-900/30 border-2 border-green-500/50' 
          : isAvailable && canAfford
          ? `bg-${categoryConfig.color}-900/30 border-2 border-${categoryConfig.color}-500/50`
          : 'bg-gray-700/50 border-2 border-gray-600/50'
        }
      `}>
        <span className={isAvailable ? '' : 'grayscale opacity-50'}>
          {reward.icon}
        </span>
      </div>

      {/* Informations de la récompense */}
      <div className="text-center mb-4">
        <h3 className={`text-lg font-bold mb-2 ${
          isOwned ? 'text-green-400' : 'text-white'
        }`}>
          {reward.name}
        </h3>
        <p className={`text-sm mb-3 line-clamp-2 ${
          isAvailable ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {reward.description}
        </p>
      </div>

      {/* Catégorie et coût */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full font-medium ${
            isAvailable 
              ? `bg-${categoryConfig.color}-900/30 text-${categoryConfig.color}-400`
              : 'bg-gray-700/30 text-gray-500'
          }`}>
            {reward.category}
          </span>
          <span className={`font-bold ${
            canAfford ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {reward.xpCost} XP
          </span>
        </div>

        {/* Bouton d'action */}
        <button
          onClick={handlePurchaseClick}
          disabled={isOwned || !isAvailable}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
            isOwned
              ? 'bg-green-600 text-white cursor-default'
              : !isAvailable
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : canAfford
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-red-600/50 text-red-300 cursor-not-allowed'
          }`}
        >
          {isOwned
            ? '✅ Possédée'
            : !isAvailable
            ? '🔒 Indisponible'
            : canAfford
            ? '🛒 Acheter'
            : '❌ XP insuffisant'
          }
        </button>
      </div>
    </motion.div>
  );
};

export default RewardsPage;
