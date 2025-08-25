// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES AVEC IMPORTS CORRIGÉS POUR LE BUILD
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
  AlertCircle
} from 'lucide-react';

// Layout premium - IMPORTS CORRIGÉS POUR BUILD
import PremiumLayout, { PremiumCard, PremiumStatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

// Firebase
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

// 🎁 TYPES DE RÉCOMPENSES
const REWARD_TYPES = {
  badge: { label: 'Badge', icon: Award, color: 'yellow' },
  xp: { label: 'XP Bonus', icon: Zap, color: 'blue' },
  title: { label: 'Titre', icon: Crown, color: 'purple' },
  cosmetic: { label: 'Cosmétique', icon: Sparkles, color: 'pink' },
  privilege: { label: 'Privilège', icon: Star, color: 'green' }
};

const REWARD_RARITY = {
  common: { label: 'Commune', color: 'gray', glow: false },
  rare: { label: 'Rare', color: 'blue', glow: true },
  epic: { label: 'Épique', color: 'purple', glow: true },
  legendary: { label: 'Légendaire', color: 'orange', glow: true },
  mythic: { label: 'Mythique', color: 'red', glow: true }
};

// 🎁 RÉCOMPENSES PAR DÉFAUT
const DEFAULT_REWARDS = [
  {
    id: 'first_task',
    title: 'Première Tâche',
    description: 'Complétez votre première tâche',
    type: 'badge',
    rarity: 'common',
    cost: 0,
    requirement: 'complete_task',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'task_master',
    title: 'Maître des Tâches',
    description: 'Complétez 10 tâches',
    type: 'badge',
    rarity: 'rare',
    cost: 0,
    requirement: 'complete_10_tasks',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'xp_boost',
    title: 'Boost XP',
    description: '+50 XP bonus',
    type: 'xp',
    rarity: 'common',
    cost: 100,
    requirement: 'purchase',
    icon: '⚡',
    unlocked: false,
    consumable: true
  },
  {
    id: 'golden_star',
    title: 'Étoile Dorée',
    description: 'Titre prestigieux pour les meilleurs',
    type: 'title',
    rarity: 'legendary',
    cost: 1000,
    requirement: 'purchase',
    icon: '⭐',
    unlocked: false
  },
  {
    id: 'rainbow_theme',
    title: 'Thème Arc-en-ciel',
    description: 'Personnalisez votre interface',
    type: 'cosmetic',
    rarity: 'epic',
    cost: 500,
    requirement: 'purchase',
    icon: '🌈',
    unlocked: false
  }
];

/**
 * 🔍 COMPOSANT BARRE DE RECHERCHE PERSONNALISÉE
 */
const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher des récompenses..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  );
};

/**
 * 🎁 COMPOSANT CARTE RÉCOMPENSE
 */
const RewardCard = ({ reward, userXp = 0, onClaim, onPurchase, userRewards = [] }) => {
  const type = REWARD_TYPES[reward.type] || REWARD_TYPES.badge;
  const rarity = REWARD_RARITY[reward.rarity] || REWARD_RARITY.common;
  const TypeIcon = type.icon;
  
  const isOwned = userRewards.includes(reward.id);
  const canAfford = userXp >= (reward.cost || 0);
  const canClaim = reward.requirement !== 'purchase' && !isOwned;
  const canPurchase = reward.requirement === 'purchase' && canAfford && !isOwned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300 hover:shadow-xl ${
        rarity.glow ? `hover:shadow-${rarity.color}-500/20` : ''
      }`}
    >
      {/* Badge de rareté */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold bg-${rarity.color}-100 text-${rarity.color}-800`}>
        {rarity.label}
      </div>

      {/* Icône principale */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-${type.color}-400 to-${type.color}-600 mb-3`}>
          <span className="text-2xl">{reward.icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{reward.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{reward.description}</p>
      </div>

      {/* Type de récompense */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <TypeIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">{type.label}</span>
      </div>

      {/* Statut et actions */}
      <div className="space-y-3">
        {isOwned ? (
          <div className="flex items-center justify-center space-x-2 py-2 bg-green-600/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Possédée</span>
          </div>
        ) : (
          <>
            {/* Coût */}
            {reward.cost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Coût:</span>
                <div className="flex items-center space-x-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className={`font-medium ${canAfford ? 'text-white' : 'text-red-400'}`}>
                    {reward.cost} XP
                  </span>
                </div>
              </div>
            )}

            {/* Condition */}
            {reward.requirement !== 'purchase' && (
              <div className="text-xs text-gray-500 text-center">
                Condition: {reward.requirement}
              </div>
            )}

            {/* Bouton d'action */}
            {canClaim && (
              <PremiumButton
                variant="success"
                size="sm"
                className="w-full"
                onClick={() => onClaim(reward)}
              >
                Réclamer
              </PremiumButton>
            )}

            {canPurchase && (
              <PremiumButton
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => onPurchase(reward)}
                icon={ShoppingCart}
              >
                Acheter
              </PremiumButton>
            )}

            {!canAfford && reward.cost > 0 && (
              <PremiumButton
                variant="secondary"
                size="sm"
                className="w-full opacity-50 cursor-not-allowed"
                disabled
                icon={Lock}
              >
                XP insuffisant
              </PremiumButton>
            )}
          </>
        )}
      </div>

      {/* Effet de brillance pour les raretés élevées */}
      {rarity.glow && (
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${rarity.color}-400/5 to-${rarity.color}-600/5 pointer-events-none`}></div>
      )}
    </motion.div>
  );
};

/**
 * 📊 PAGE PRINCIPALE RÉCOMPENSES
 */
const RewardsPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [userRewards, setUserRewards] = useState([]);
  const [userXp, setUserXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎯 FILTRES ET RECHERCHE
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [showOwned, setShowOwned] = useState(false);

  // 📊 CHARGEMENT DES DONNÉES UTILISATEUR
  useEffect(() => {
    if (!user?.uid) return;

    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // Charger le profil utilisateur pour l'XP
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserXp(userData.totalXp || userData.xp || 0);
          setUserRewards(userData.rewards || []);
        }

        // Charger les récompenses personnalisées (si elles existent)
        const rewardsQuery = query(collection(db, 'rewards'));
        const rewardsSnapshot = await getDocs(rewardsQuery);
        
        if (!rewardsSnapshot.empty) {
          const customRewards = rewardsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRewards([...DEFAULT_REWARDS, ...customRewards]);
        }

        setIsLoading(false);
        setError(null);

      } catch (error) {
        console.error('❌ [REWARDS] Erreur chargement:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user?.uid]);

  // 📊 RÉCOMPENSES FILTRÉES
  const filteredRewards = useMemo(() => {
    let filtered = rewards;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(reward => reward.type === selectedType);
    }

    // Filtre par rareté
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(reward => reward.rarity === selectedRarity);
    }

    // Filtre par possession
    if (showOwned) {
      filtered = filtered.filter(reward => userRewards.includes(reward.id));
    }

    return filtered;
  }, [rewards, searchTerm, selectedType, selectedRarity, showOwned, userRewards]);

  // 📊 STATISTIQUES
  const stats = useMemo(() => {
    const total = rewards.length;
    const owned = userRewards.length;
    const available = total - owned;
    const canAfford = rewards.filter(r => r.cost > 0 && userXp >= r.cost && !userRewards.includes(r.id)).length;

    return {
      total,
      owned,
      available,
      canAfford,
      completionRate: total > 0 ? Math.round((owned / total) * 100) : 0
    };
  }, [rewards, userRewards, userXp]);

  // ⚡ ACTIONS
  const handleClaim = async (reward) => {
    try {
      console.log('🎁 [REWARDS] Réclamation récompense:', reward.id);
      
      const newUserRewards = [...userRewards, reward.id];
      
      await updateDoc(doc(db, 'users', user.uid), {
        rewards: newUserRewards,
        updatedAt: serverTimestamp()
      });

      setUserRewards(newUserRewards);
      console.log('✅ [REWARDS] Récompense réclamée');
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur réclamation:', error);
    }
  };

  const handlePurchase = async (reward) => {
    if (userXp < reward.cost) return;

    try {
      console.log('💰 [REWARDS] Achat récompense:', reward.id);
      
      const newUserRewards = [...userRewards, reward.id];
      const newXp = userXp - reward.cost;
      
      await updateDoc(doc(db, 'users', user.uid), {
        rewards: newUserRewards,
        totalXp: newXp,
        xp: newXp,
        updatedAt: serverTimestamp()
      });

      setUserRewards(newUserRewards);
      setUserXp(newXp);
      console.log('✅ [REWARDS] Récompense achetée');
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur achat:', error);
    }
  };

  // 📊 STATISTIQUES POUR LE HEADER
  const headerStats = [
    { title: 'Total', value: stats.total, icon: Gift, color: 'blue' },
    { title: 'Possédées', value: stats.owned, icon: CheckCircle, color: 'green' },
    { title: 'Disponibles', value: stats.available, icon: Star, color: 'yellow' },
    { title: 'XP Disponibles', value: userXp, icon: Zap, color: 'purple' }
  ];

  // ⚡ ACTIONS DU HEADER
  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton
        variant="secondary"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-4 h-4" />
        Actualiser
      </PremiumButton>
      
      <PremiumButton
        onClick={() => window.location.href = '/gamification'}
        variant="primary"
      >
        <Trophy className="w-4 h-4" />
        Voir Gamification
      </PremiumButton>
    </div>
  );

  if (isLoading) {
    return (
      <PremiumLayout
        title="🎁 Récompenses"
        subtitle="Débloquez et collectionnez vos récompenses"
        icon={Gift}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des récompenses...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="🎁 Récompenses"
        subtitle="Débloquez et collectionnez vos récompenses"
        icon={Gift}
      >
        <PremiumCard className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <PremiumButton variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="🎁 Récompenses"
      subtitle="Débloquez et collectionnez vos récompenses"
      icon={Gift}
      headerActions={headerActions}
      headerStats={headerStats}
    >
      {/* Progression globale */}
      <div className="mb-8">
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Progression de Collection</h3>
              <p className="text-sm text-gray-400">
                {stats.owned} sur {stats.total} récompenses débloquées
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
              <p className="text-sm text-gray-400">Complété</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </PremiumCard>
      </div>

      {/* Contrôles de filtrage */}
      <div className="mb-8">
        <PremiumCard className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Filtres */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              {Object.entries(REWARD_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>

            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les raretés</option>
              {Object.entries(REWARD_RARITY).map(([key, rarity]) => (
                <option key={key} value={key}>{rarity.label}</option>
              ))}
            </select>

            {/* Toggle possédées */}
            <label className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showOwned}
                onChange={(e) => setShowOwned(e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white text-sm">Possédées uniquement</span>
            </label>
          </div>
        </PremiumCard>
      </div>

      {/* Grille des récompenses */}
      {filteredRewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userXp={userXp}
              userRewards={userRewards}
              onClaim={handleClaim}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      ) : (
        /* Message si aucune récompense */
        <PremiumCard className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucune récompense trouvée</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedType !== 'all' || selectedRarity !== 'all'
              ? 'Aucune récompense ne correspond à vos critères de recherche.'
              : 'Aucune récompense disponible pour le moment.'}
          </p>
          <PremiumButton
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedRarity('all');
              setShowOwned(false);
            }}
            variant="primary"
          >
            Réinitialiser les filtres
          </PremiumButton>
        </PremiumCard>
      )}

      {/* Message d'encouragement pour les nouveaux utilisateurs */}
      {stats.owned === 0 && !isLoading && (
        <div className="mt-8">
          <PremiumCard className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Commencez votre collection !</h3>
            <p className="text-gray-400 mb-6">
              Complétez des tâches et gagnez de l'XP pour débloquer vos premières récompenses.
            </p>
            <div className="flex justify-center space-x-4">
              <PremiumButton
                onClick={() => window.location.href = '/tasks'}
                variant="primary"
              >
                Créer une tâche
              </PremiumButton>
              <PremiumButton
                onClick={() => window.location.href = '/gamification'}
                variant="secondary"
              >
                Voir la gamification
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
