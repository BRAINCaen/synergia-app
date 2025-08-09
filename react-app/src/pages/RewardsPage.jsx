// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// BOUTIQUE DES RÉCOMPENSES COMPLÈTE AVEC VRAIES DONNÉES FIREBASE
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
  Clock,
  Coffee,
  Car,
  Gamepad2,
  Utensils,
  Plane,
  Heart,
  Music,
  Briefcase,
  Home
} from 'lucide-react';

// Hooks et services Firebase
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';
import { useRewards } from '../shared/hooks/useRewards.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { rewardsService } from '../core/services/rewardsService.js';

// Firebase
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎁 BOUTIQUE DES RÉCOMPENSES AVEC SYNCHRONISATION FIREBASE COMPLÈTE
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES XP UNIFIÉES
  const {
    gamificationData,
    level,
    totalXp,
    badges,
    loading: xpLoading,
    isReady,
    syncStatus,
    lastUpdate,
    addXP,
    forceSync
  } = useUnifiedXP();

  // ✅ HOOK RÉCOMPENSES AVEC FIREBASE
  const {
    availableRewards,
    userRewardHistory,
    currentUserXP,
    loading: rewardsLoading,
    requestReward,
    initializeRewards,
    canAffordReward,
    getRecommendations
  } = useRewards();

  // États locaux
  const [firebaseRewards, setFirebaseRewards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [requesting, setRequesting] = useState(false);
  const [userRequests, setUserRequests] = useState([]);

  // ✅ ÉCOUTE FIREBASE EN TEMPS RÉEL DES RÉCOMPENSES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🎁 Chargement récompenses Firebase...');
    
    // Écouter les récompenses disponibles
    const rewardsQuery = query(
      collection(db, 'rewards'),
      where('isActive', '==', true),
      where('isAvailable', '==', true),
      orderBy('cost', 'asc')
    );

    const unsubscribeRewards = onSnapshot(rewardsQuery, (snapshot) => {
      const rewards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📦 ${rewards.length} récompenses chargées`);
      setFirebaseRewards(rewards);
    });

    // Écouter les demandes de l'utilisateur
    const userRequestsQuery = query(
      collection(db, 'rewardRequests'),
      where('userId', '==', user.uid),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribeRequests = onSnapshot(userRequestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📋 ${requests.length} demandes utilisateur chargées`);
      setUserRequests(requests);
    });

    return () => {
      unsubscribeRewards();
      unsubscribeRequests();
    };
  }, [user?.uid]);

  // 🎁 VRAIES DONNÉES RÉCOMPENSES STRUCTURÉES PAR CATÉGORIES
  const organizeRewardsByCategory = () => {
    const categories = {
      mini_pleasures: {
        name: 'Mini-plaisirs',
        icon: Coffee,
        description: '50-100 XP',
        color: 'from-green-400 to-blue-500',
        rewards: []
      },
      useful_pleasures: {
        name: 'Plaisirs utiles', 
        icon: Utensils,
        description: '200-400 XP',
        color: 'from-purple-400 to-pink-500',
        rewards: []
      },
      entertainment: {
        name: 'Loisirs & sorties',
        icon: Gamepad2,
        description: '1000-1500 XP',
        color: 'from-yellow-400 to-orange-500',
        rewards: []
      },
      wellness: {
        name: 'Bien-être',
        icon: Heart,
        description: '700-1000 XP',
        color: 'from-red-400 to-yellow-500',
        rewards: []
      },
      lifestyle: {
        name: 'Lifestyle',
        icon: Crown,
        description: '1500-2500 XP',
        color: 'from-orange-400 to-red-500',
        rewards: []
      },
      premium: {
        name: 'Premium',
        icon: Star,
        description: '6000+ XP',
        color: 'from-blue-400 to-green-500',
        rewards: []
      }
    };

    // Organiser les récompenses Firebase par catégories
    firebaseRewards.forEach(reward => {
      const cost = reward.cost || 0;
      
      if (cost >= 50 && cost <= 100) {
        categories.mini_pleasures.rewards.push(reward);
      } else if (cost >= 200 && cost <= 400) {
        categories.useful_pleasures.rewards.push(reward);
      } else if (cost >= 700 && cost <= 1000) {
        categories.wellness.rewards.push(reward);
      } else if (cost >= 1000 && cost <= 1500) {
        categories.entertainment.rewards.push(reward);
      } else if (cost >= 1500 && cost <= 2500) {
        categories.lifestyle.rewards.push(reward);
      } else if (cost >= 6000) {
        categories.premium.rewards.push(reward);
      } else {
        // Catégorie par défaut
        categories.mini_pleasures.rewards.push(reward);
      }
    });

    return categories;
  };

  const rewardsCategories = organizeRewardsByCategory();

  // 📊 FILTRAGE ET TRI
  const getAllRewards = () => {
    return Object.values(rewardsCategories).flatMap(cat => 
      cat.rewards.map(reward => ({
        ...reward,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color
      }))
    );
  };

  const filteredRewards = getAllRewards().filter(reward => {
    const matchesCategory = selectedCategory === 'all' || 
      reward.categoryName.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchTerm || 
      reward.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const sortedRewards = [...filteredRewards].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return (a.cost || 0) - (b.cost || 0);
      case 'price_desc':
        return (b.cost || 0) - (a.cost || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return (a.cost || 0) - (b.cost || 0);
    }
  });

  // 🛒 DEMANDE DE RÉCOMPENSE FIREBASE
  const handleRequestReward = async (reward) => {
    if (!user?.uid || requesting) return;

    if (totalXp < (reward.cost || 0)) {
      alert('❌ XP insuffisant pour cette récompense !');
      return;
    }

    try {
      setRequesting(true);
      
      console.log('🛒 Demande de récompense:', reward.name);

      // Créer la demande dans Firebase
      const requestData = {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardCost: reward.cost || 0,
        rewardType: reward.type || 'individual',
        rewardDescription: reward.description || '',
        status: 'pending',
        requestedAt: serverTimestamp(),
        adminNotes: '',
        userDisplayName: user.displayName || user.email || 'Utilisateur',
        userEmail: user.email || ''
      };

      await addDoc(collection(db, 'rewardRequests'), requestData);
      
      // Marquer comme demandé temporairement (pour éviter les doublons)
      setUserRequests(prev => [...prev, {
        ...requestData,
        id: 'temp_' + Date.now(),
        requestedAt: new Date()
      }]);

      alert(`✅ Demande envoyée pour "${reward.name}" !`);
      setShowPurchaseModal(false);
      
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      alert('❌ Erreur lors de la demande. Veuillez réessayer.');
    } finally {
      setRequesting(false);
    }
  };

  // Vérifier si une récompense a déjà été demandée
  const isAlreadyRequested = (rewardId) => {
    return userRequests.some(req => 
      req.rewardId === rewardId && 
      req.status === 'pending'
    );
  };

  // Obtenir le statut d'une demande
  const getRequestStatus = (rewardId) => {
    const request = userRequests.find(req => req.rewardId === rewardId);
    return request?.status || null;
  };

  // Icône de statut de demande
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <Lock className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  // Texte de statut
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Refusée';
      default:
        return '';
    }
  };

  // Loading state
  if (xpLoading || rewardsLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header avec stats XP */}
      <div className="p-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-400" />
                Boutique des Récompenses
              </h1>
              <p className="text-purple-200 mt-2">
                Échangez vos XP contre des récompenses fantastiques !
              </p>
            </div>
            
            <button
              onClick={forceSync}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>

          {/* Stats XP utilisateur */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">XP Disponibles</p>
                  <p className="text-2xl font-bold text-yellow-400">{totalXp || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-300">Niveau</p>
                  <p className="text-2xl font-bold text-orange-400">{level || 1}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-300">Récompenses</p>
                  <p className="text-2xl font-bold text-purple-400">{firebaseRewards.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">En attente</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {userRequests.filter(req => req.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une récompense..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Tri */}
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
              >
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Toutes
            </button>
            
            {Object.entries(rewardsCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name} ({category.rewards.length})
              </button>
            ))}
          </div>

          {/* Grille des récompenses */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {sortedRewards.map((reward) => {
              const canAfford = totalXp >= (reward.cost || 0);
              const alreadyRequested = isAlreadyRequested(reward.id);
              const requestStatus = getRequestStatus(reward.id);
              
              return (
                <motion.div
                  key={reward.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all hover:scale-105 ${
                    canAfford ? 'border-green-400/50 hover:border-green-400' : 'border-white/20'
                  }`}
                >
                  {/* Icône et statut */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">
                      {reward.icon || '🎁'}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(requestStatus)}
                      {requestStatus && (
                        <span className="text-xs text-gray-400">
                          {getStatusText(requestStatus)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nom et description */}
                  <h3 className="font-bold text-lg mb-2 text-white">
                    {reward.name || 'Récompense'}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {reward.description || 'Description non disponible'}
                  </p>

                  {/* Catégorie */}
                  <div className="flex items-center gap-2 mb-4">
                    <reward.categoryIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300">
                      {reward.categoryName}
                    </span>
                  </div>

                  {/* Prix et action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-yellow-400">
                        {reward.cost || 0} XP
                      </span>
                    </div>

                    {alreadyRequested ? (
                      <span className="text-blue-400 text-sm font-medium">
                        Demandée
                      </span>
                    ) : canAfford ? (
                      <button
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowPurchaseModal(true);
                        }}
                        disabled={requesting}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Demander
                      </button>
                    ) : (
                      <span className="text-red-400 text-sm font-medium">
                        XP insuffisant
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
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
        </div>
      </div>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showPurchaseModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/20 rounded-xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {selectedReward.icon || '🎁'}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  Confirmer la demande
                </h3>
                
                <p className="text-gray-300 mb-4">
                  Voulez-vous vraiment demander "{selectedReward.name}" ?
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Coût :</span>
                    <span className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Coins className="w-4 h-4" />
                      {selectedReward.cost || 0} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-300">XP restants :</span>
                    <span className="text-white font-bold">
                      {(totalXp || 0) - (selectedReward.cost || 0)} XP
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={() => handleRequestReward(selectedReward)}
                    disabled={requesting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {requesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {requesting ? 'En cours...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardsPage;
