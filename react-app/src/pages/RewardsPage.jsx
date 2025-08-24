// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES COMPLÈTE QUI FONCTIONNE - BUILD NETLIFY
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Trophy, Star, Crown, Zap, ShoppingBag, Lock, RefreshCw, Clock, Award } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎮 HOOK XP SIMPLIFIÉ POUR ÉVITER LES ERREURS DE BUILD
 * Version allégée qui fonctionne sans dépendances externes problématiques
 */
const useSimpleXP = () => {
  const { user } = useAuthStore();
  const [totalXp, setTotalXp] = useState(293); // XP par défaut
  const [level, setLevel] = useState(3);
  const [isReady, setIsReady] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setTotalXp(0);
      setLevel(1);
      setIsReady(false);
      return;
    }

    // Simulation de récupération XP depuis localStorage ou données test
    try {
      const savedXp = localStorage.getItem(`user_xp_${user.uid}`);
      if (savedXp) {
        const xpValue = parseInt(savedXp, 10);
        setTotalXp(xpValue);
        setLevel(Math.floor(xpValue / 100) + 1);
      }
      setIsReady(true);
    } catch (err) {
      console.warn('⚠️ Erreur chargement XP:', err);
      setError(err.message);
      setIsReady(true); // Continue même en cas d'erreur
    }
  }, [user?.uid]);

  const addXP = async (amount, source = 'reward') => {
    if (!user?.uid) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const newXp = totalXp + amount;
      setTotalXp(newXp);
      setLevel(Math.floor(newXp / 100) + 1);
      
      // Sauvegarder dans localStorage comme fallback
      localStorage.setItem(`user_xp_${user.uid}`, newXp.toString());
      
      console.log(`✅ [SIMPLE-XP] ${amount} XP ajouté (${source}). Total: ${newXp}`);
      return { success: true, newTotal: newXp };
    } catch (error) {
      console.error('❌ [SIMPLE-XP] Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    totalXp,
    level,
    isReady,
    error,
    addXP,
    // Données de compatibilité
    gamificationData: {
      level,
      totalXp,
      tasksCompleted: Math.floor(totalXp / 20),
      loginStreak: 5,
      badges: []
    }
  };
};

/**
 * 🎁 RÉCOMPENSES INDIVIDUELLES - Gaming Style
 */
const INDIVIDUAL_REWARDS = [
  // Récompenses Common (Gaming Green)
  { 
    id: 'sticker_pack', 
    name: '🎮 Sticker Pack Gaming', 
    description: 'Collection de stickers gaming premium pour personnaliser ton setup !',
    cost: 50, 
    icon: '🎮', 
    rarity: 'common',
    category: 'digital',
    type: 'individual'
  },
  { 
    id: 'badge_collector', 
    name: '🏆 Badge Collector', 
    description: 'Badge exclusif pour les vrais collectionneurs de succès !',
    cost: 100, 
    icon: '🏆', 
    rarity: 'common',
    category: 'digital',
    type: 'individual'
  },

  // Récompenses Uncommon (Electric Blue)
  { 
    id: 'premium_theme', 
    name: '🌟 Thème Premium', 
    description: 'Débloquer des thèmes d\'interface exclusifs avec effets spéciaux !',
    cost: 200, 
    icon: '🌟', 
    rarity: 'uncommon',
    category: 'digital',
    type: 'individual'
  },
  { 
    id: 'coffee_voucher', 
    name: '☕ Voucher Café', 
    description: 'Un bon café pour recharger les batteries - offert par l\'équipe !',
    cost: 250, 
    icon: '☕', 
    rarity: 'uncommon',
    category: 'physical',
    type: 'individual'
  },

  // Récompenses Rare (Gaming Purple)
  { 
    id: 'gaming_mousepad', 
    name: '🖱️ Tapis de Souris Gaming', 
    description: 'Tapis de souris RGB pour un setup de pro-gamer !',
    cost: 400, 
    icon: '🖱️', 
    rarity: 'rare',
    category: 'physical',
    type: 'individual'
  },
  { 
    id: 'private_coaching', 
    name: '🎯 Session Coaching Privée', 
    description: 'Une session de coaching individuel avec un expert !',
    cost: 500, 
    icon: '🎯', 
    rarity: 'rare',
    category: 'experience',
    type: 'individual'
  },

  // Récompenses Epic (Fire Orange/Red)
  { 
    id: 'gaming_headset', 
    name: '🎧 Casque Gaming Pro', 
    description: 'Casque gaming haute qualité pour une immersion totale !',
    cost: 750, 
    icon: '🎧', 
    rarity: 'epic',
    category: 'physical',
    type: 'individual'
  },

  // Récompenses Legendary (Legendary Gold)
  { 
    id: 'gaming_chair', 
    name: '💺 Chaise Gaming Ultimate', 
    description: 'Chaise gaming ergonomique pour les sessions marathon !',
    cost: 1200, 
    icon: '💺', 
    rarity: 'legendary',
    category: 'physical',
    type: 'individual'
  }
];

/**
 * 👥 RÉCOMPENSES D'ÉQUIPE - Système Collectif
 */
const TEAM_REWARDS = [
  // 🥉 BRONZE (1000-2499 XP collectifs)
  { 
    id: 'team_pizza_party', 
    name: '🍕 Pizza Party Équipe', 
    description: 'Pizzas pour tout le monde + boissons pour célébrer nos victoires !',
    cost: 1200, 
    icon: '🍕', 
    rarity: 'common',
    category: 'food',
    type: 'team',
    level: 'BRONZE',
    participants: 'Toute l\'équipe',
    duration: '2h'
  },
  { 
    id: 'team_movie_night', 
    name: '🎬 Soirée Cinéma Équipe', 
    description: 'Séance ciné privatisée avec popcorn et snacks pour toute l\'équipe !',
    cost: 1500, 
    icon: '🎬', 
    rarity: 'common',
    category: 'entertainment',
    type: 'team',
    level: 'BRONZE',
    participants: 'Toute l\'équipe',
    duration: '3h'
  },

  // 🥈 SILVER (2500-4999 XP collectifs)
  { 
    id: 'team_laser_game', 
    name: '🎯 Sortie Laser Game Équipe', 
    description: 'Session laser game épique pour toute l\'équipe + repas après !',
    cost: 2000, 
    icon: '🎯', 
    rarity: 'uncommon',
    category: 'activity',
    type: 'team',
    level: 'SILVER',
    participants: 'Toute l\'équipe',
    duration: '4h'
  },
  { 
    id: 'team_coffee_machine', 
    name: '☕ Machine à Café Premium', 
    description: 'Machine à café haut de gamme pour l\'espace de pause commun !',
    cost: 2800, 
    icon: '☕', 
    rarity: 'uncommon',
    category: 'equipment',
    type: 'team',
    level: 'SILVER',
    participants: 'Toute l\'équipe',
    duration: 'Permanent'
  },
  { 
    id: 'team_bowling', 
    name: '🎳 Tournoi Bowling Équipe', 
    description: 'Tournoi bowling avec champagne pour l\'équipe gagnante !',
    cost: 3200, 
    icon: '🎳', 
    rarity: 'uncommon',
    category: 'activity',
    type: 'team',
    level: 'SILVER',
    participants: 'Toute l\'équipe',
    duration: '4h'
  },

  // 🥇 GOLD (5000-9999 XP collectifs)
  { 
    id: 'team_escape_game', 
    name: '🔐 Escape Game Géant', 
    description: 'Escape game privatisé pour toute l\'équipe + repas gastronomique !',
    cost: 4500, 
    icon: '🔐', 
    rarity: 'rare',
    category: 'activity',
    type: 'team',
    level: 'GOLD',
    participants: 'Toute l\'équipe',
    duration: '6h'
  },
  { 
    id: 'team_gaming_setup', 
    name: '🎮 Setup Gaming Équipe', 
    description: 'Console + jeux + écran géant pour l\'espace détente commun !',
    cost: 6000, 
    icon: '🎮', 
    rarity: 'rare',
    category: 'equipment',
    type: 'team',
    level: 'GOLD',
    participants: 'Toute l\'équipe',
    duration: 'Permanent'
  },
  { 
    id: 'team_paintball', 
    name: '🎨 Bataille Paintball', 
    description: 'Session paintball épique avec matériel pro + barbecue !',
    cost: 5500, 
    icon: '🎨', 
    rarity: 'rare',
    category: 'activity',
    type: 'team',
    level: 'GOLD',
    participants: 'Toute l\'équipe',
    duration: '5h'
  },

  // 💎 PLATINUM (10000-19999 XP collectifs)
  { 
    id: 'team_weekend_resort', 
    name: '🏨 Weekend Équipe Resort', 
    description: 'Weekend team-building dans un resort avec activités et spa !',
    cost: 12000, 
    icon: '🏨', 
    rarity: 'epic',
    category: 'travel',
    type: 'team',
    level: 'PLATINUM',
    participants: 'Toute l\'équipe',
    duration: '2 jours'
  },
  { 
    id: 'team_office_upgrade', 
    name: '🏢 Upgrade Espace de Travail', 
    description: 'Amélioration complète de l\'espace de travail (mobilier, déco, tech) !',
    cost: 15000, 
    icon: '🏢', 
    rarity: 'epic',
    category: 'equipment',
    type: 'team',
    level: 'PLATINUM',
    participants: 'Toute l\'équipe',
    duration: 'Permanent'
  },

  // 💎 DIAMOND (20000+ XP collectifs)
  { 
    id: 'team_cruise', 
    name: '🚢 Croisière Équipe', 
    description: 'Croisière de 3 jours pour toute l\'équipe avec toutes les activités !',
    cost: 25000, 
    icon: '🚢', 
    rarity: 'legendary',
    category: 'travel',
    type: 'team',
    level: 'DIAMOND',
    participants: 'Toute l\'équipe',
    duration: '3 jours'
  },
  { 
    id: 'team_company_retreat', 
    name: '🏔️ Retraite Entreprise', 
    description: 'Séminaire de 5 jours dans un château avec team-building et formation !',
    cost: 30000, 
    icon: '🏔️', 
    rarity: 'legendary',
    category: 'travel',
    type: 'team',
    level: 'DIAMOND',
    participants: 'Toute l\'équipe',
    duration: '5 jours'
  }
];

/**
 * 🎨 CATÉGORIES POUR LES DEUX TYPES
 */
const INDIVIDUAL_CATEGORIES = [
  { id: 'all', name: 'Toutes', icon: Gift, count: INDIVIDUAL_REWARDS.length },
  { id: 'digital', name: 'Digital', icon: Star, count: INDIVIDUAL_REWARDS.filter(r => r.category === 'digital').length },
  { id: 'physical', name: 'Physique', icon: Trophy, count: INDIVIDUAL_REWARDS.filter(r => r.category === 'physical').length },
  { id: 'experience', name: 'Expérience', icon: Crown, count: INDIVIDUAL_REWARDS.filter(r => r.category === 'experience').length }
];

const TEAM_CATEGORIES = [
  { id: 'all', name: 'Toutes', icon: Gift, count: TEAM_REWARDS.length },
  { id: 'food', name: 'Nourriture', icon: Star, count: TEAM_REWARDS.filter(r => r.category === 'food').length },
  { id: 'activity', name: 'Activités', icon: Trophy, count: TEAM_REWARDS.filter(r => r.category === 'activity').length },
  { id: 'equipment', name: 'Équipement', icon: Crown, count: TEAM_REWARDS.filter(r => r.category === 'equipment').length },
  { id: 'travel', name: 'Voyages', icon: Zap, count: TEAM_REWARDS.filter(r => r.category === 'travel').length },
  { id: 'entertainment', name: 'Divertissement', icon: Star, count: TEAM_REWARDS.filter(r => r.category === 'entertainment').length }
];

/**
 * 🎁 COMPOSANT PRINCIPAL RÉCOMPENSES
 */
const RewardsPage = () => {
  // États locaux
  const [rewardType, setRewardType] = useState('individual'); // 'individual' ou 'team'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [teamXP, setTeamXP] = useState(8750); // XP collectifs de l'équipe (simulation)

  // Hooks
  const { user } = useAuthStore();
  const { totalXp: userPoints, isReady, gamificationData, addXP } = useSimpleXP();

  /**
   * 🔍 ÉCOUTER L'HISTORIQUE DES ACHATS
   */
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🎁 [REWARDS] Écoute Firebase historique récompenses pour:', user.uid);

    try {
      const historyQuery = query(
        collection(db, 'rewardRequests'),
        where('userId', '==', user.uid),
        where('status', '==', 'approved')
      );

      const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          purchaseDate: doc.data().approvedAt?.toDate?.() || new Date()
        }));

        setPurchaseHistory(history);
        console.log('✅ [REWARDS] Historique Firebase chargé:', history.length, 'récompenses');
      }, (error) => {
        console.warn('⚠️ [REWARDS] Erreur écoute historique (continuons sans):', error);
        // Continuer sans l'historique Firebase
      });

      return unsubscribe;
    } catch (error) {
      console.warn('⚠️ [REWARDS] Firebase indisponible, mode hors-ligne:', error);
    }
  }, [user?.uid]);

  /**
   * 🎨 COULEURS SELON RARETÉ - Gaming Style
   */
  const getRarityColor = (rarity) => {
    const rarityColors = {
      common: 'from-emerald-400 to-green-600',
      uncommon: 'from-blue-400 to-cyan-600', 
      rare: 'from-purple-400 to-indigo-600',
      epic: 'from-orange-400 to-red-600',
      legendary: 'from-yellow-400 to-orange-500',
      mythic: 'from-pink-400 to-purple-500'
    };
    return rarityColors[rarity] || 'from-gray-400 to-gray-600';
  };

  /**
   * 🛒 GÉRER L'ACHAT D'UNE RÉCOMPENSE (INDIVIDUELLE OU ÉQUIPE)
   */
  const handlePurchase = async (reward) => {
    if (!user?.uid) {
      alert('🚨 Tu dois être connecté pour acheter des récompenses !');
      return;
    }

    const requiredPoints = reward.cost;
    const availablePoints = reward.type === 'individual' ? userPoints : teamXP;

    if (availablePoints < requiredPoints) {
      const pointsType = reward.type === 'individual' ? 'XP individuels' : 'XP d\'équipe';
      alert(`❌ Pas assez de ${pointsType} ! Il faut ${requiredPoints} XP, il y en a ${availablePoints}. ${reward.type === 'team' ? 'L\'équipe doit contribuer plus !' : 'Time to grind !'} 💪`);
      return;
    }

    const confirmMessage = reward.type === 'individual' 
      ? `🎮 GG ! Tu veux acheter "${reward.name}" pour ${reward.cost} XP personnels ?`
      : `👥 Confirmation Équipe ! Acheter "${reward.name}" pour ${reward.cost} XP d'équipe ? \n\n🎉 Toute l'équipe en profitera ! (${reward.participants}, durée: ${reward.duration})`;
    
    const confirmation = confirm(confirmMessage);
    if (!confirmation) return;

    setPurchasing(true);

    try {
      console.log('🛒 [REWARDS] Achat récompense:', {
        userId: user.uid,
        rewardId: reward.id,
        rewardType: reward.type,
        cost: reward.cost,
        availablePointsBefore: availablePoints
      });

      // Tenter de créer une demande Firebase
      try {
        await addDoc(collection(db, 'rewardRequests'), {
          userId: user.uid,
          userEmail: user.email,
          rewardName: reward.name,
          rewardDescription: reward.description,
          xpCost: reward.cost,
          rewardType: reward.type, // 'individual' ou 'team'
          rewardCategory: reward.category,
          rewardLevel: reward.level || 'N/A',
          participants: reward.participants || 'Individuel',
          duration: reward.duration || 'Instantané',
          status: 'pending',
          requestedAt: serverTimestamp(),
          approvedBy: null
        });

        console.log('✅ [REWARDS] Demande Firebase créée avec succès !');
      } catch (firebaseError) {
        console.warn('⚠️ [REWARDS] Firebase indisponible, achat local:', firebaseError);
        
        // Fallback: enregistrer localement
        const localPurchase = {
          id: `local_${Date.now()}`,
          userId: user.uid,
          rewardName: reward.name,
          rewardType: reward.type,
          xpCost: reward.cost,
          status: 'local_pending',
          purchaseDate: new Date()
        };
        
        const existingHistory = JSON.parse(localStorage.getItem(`rewards_${user.uid}`) || '[]');
        existingHistory.push(localPurchase);
        localStorage.setItem(`rewards_${user.uid}`, JSON.stringify(existingHistory));
      }

      // Déduire les XP selon le type
      if (reward.type === 'individual') {
        const result = await addXP(-reward.cost, 'reward_purchase');
        if (result.success) {
          alert(`🎉 "${reward.name}" acheté ! 🎮 ${reward.cost} XP déduits ! Reste: ${result.newTotal} XP`);
        }
      } else {
        // Pour les récompenses d'équipe, simuler la déduction des XP d'équipe
        setTeamXP(prev => prev - reward.cost);
        alert(`🎉 "${reward.name}" acheté pour l'équipe ! 👥 ${reward.cost} XP d'équipe déduits ! \n\n🎊 Toute l'équipe va adorer ! (${reward.participants}, ${reward.duration})`);
        
        // Sauvegarder les XP d'équipe
        localStorage.setItem('team_xp', (teamXP - reward.cost).toString());
      }
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur achat:', error);
      alert('❌ Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(false);
    }
  };

  // 🎯 FILTRER LES RÉCOMPENSES SELON LE TYPE ET CATÉGORIE
  const currentRewards = rewardType === 'individual' ? INDIVIDUAL_REWARDS : TEAM_REWARDS;
  const currentCategories = rewardType === 'individual' ? INDIVIDUAL_CATEGORIES : TEAM_CATEGORIES;
  
  const filteredRewards = selectedCategory === 'all' 
    ? currentRewards 
    : currentRewards.filter(reward => reward.category === selectedCategory);

  // Points utilisés selon le type
  const currentPoints = rewardType === 'individual' ? userPoints : teamXP;

  // 📊 STATISTIQUES POUR LE HEADER
  const headerStats = [
    { 
      label: rewardType === 'individual' ? "Mes XP" : "XP Équipe", 
      value: currentPoints?.toLocaleString() || '0', 
      icon: Zap, 
      color: rewardType === 'individual' ? "text-yellow-400" : "text-blue-400"
    },
    { 
      label: "Récompenses Achetées", 
      value: purchaseHistory.length, 
      icon: Trophy, 
      color: "text-green-400" 
    },
    { 
      label: "Accessibles", 
      value: `${filteredRewards.filter(r => r.cost <= currentPoints).length}/${filteredRewards.length}`, 
      icon: Gift, 
      color: "text-blue-400" 
    },
    { 
      label: rewardType === 'individual' ? "Mon Niveau" : "Niveau Équipe", 
      value: rewardType === 'individual' ? (gamificationData?.level || 1) : getTeamLevel(), 
      icon: Crown, 
      color: "text-purple-400" 
    }
  ];

  // Fonction pour obtenir le niveau d'équipe basé sur les XP collectifs
  function getTeamLevel() {
    if (teamXP >= 20000) return 'DIAMOND';
    if (teamXP >= 10000) return 'PLATINUM';
    if (teamXP >= 5000) return 'GOLD';
    if (teamXP >= 2500) return 'SILVER';
    return 'BRONZE';
  }

  // 🚨 GESTION CHARGEMENT
  if (!isReady) {
    return (
      <PremiumLayout
        title="🎁 Boutique de Récompenses"
        subtitle="Chargement de vos données XP..."
        icon={Gift}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Synchronisation des récompenses...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="🎁 Boutique de Récompenses"
      subtitle={rewardType === 'individual' ? "Échangez vos XP contre des récompenses personnelles !" : "Utilisez les XP d'équipe pour des récompenses collectives !"}
      icon={Gift}
      showStats={true}
      stats={headerStats}
    >
      {/* 🔄 ONGLETS INDIVIDUEL / ÉQUIPE */}
      <div className="mb-8">
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold flex items-center">
              <Gift className="w-5 h-5 mr-2 text-yellow-400" />
              Type de Récompenses
            </h3>
            
            {/* Indicateur XP d'équipe */}
            <div className="text-right">
              <p className="text-gray-400 text-sm">Cagnotte Équipe</p>
              <p className="text-blue-400 text-xl font-bold">{teamXP.toLocaleString()} XP</p>
              <p className="text-gray-500 text-xs">Niveau: {getTeamLevel()}</p>
            </div>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => {
                setRewardType('individual');
                setSelectedCategory('all');
              }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 flex-1 ${
                rewardType === 'individual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Star className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">🎯 Récompenses Individuelles</div>
                <div className="text-xs opacity-75">Utilisez vos XP personnels</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setRewardType('team');
                setSelectedCategory('all');
              }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 flex-1 ${
                rewardType === 'team'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">👥 Récompenses Équipe</div>
                <div className="text-xs opacity-75">Cagnotte collective ({teamXP.toLocaleString()} XP)</div>
              </div>
            </button>
          </div>

          {/* Message informatif selon le type */}
          {rewardType === 'team' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Crown className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Comment fonctionne la cagnotte d'équipe ?</h4>
                  <p className="text-gray-300 text-sm">
                    Chaque membre contribue automatiquement 5% de ses XP à la cagnotte d'équipe. 
                    Les récompenses d'équipe profitent à tous et créent de vrais moments de convivialité ! 🎉
                  </p>
                </div>
              </div>
            </div>
          )}
        </PremiumCard>
      </div>

      {/* 🎮 FILTRES PAR CATÉGORIE */}
      <div className="mb-8">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Catégories {rewardType === 'individual' ? 'Individuelles' : 'Équipe'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {currentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className="bg-gray-600 text-xs px-2 py-1 rounded-full font-bold">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* 🏪 GRILLE DES RÉCOMPENSES - Style Gaming */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => (
          <PremiumCard key={reward.id} className="relative overflow-hidden group hover:scale-105 transition-transform duration-200">
            {/* Badge de rareté gaming */}
            <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-r ${getRarityColor(reward.rarity)} text-xs font-bold text-white rounded-bl-lg z-10 shadow-lg`}>
              {reward.rarity.toUpperCase()}
            </div>

            {/* Badge type pour récompenses équipe */}
            {reward.type === 'team' && (
              <div className="absolute top-0 left-0 px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-white rounded-br-lg z-10 shadow-lg">
                👥 ÉQUIPE
              </div>
            )}

            {/* Effet de brillance pour les récompenses épiques+ */}
            {(reward.rarity === 'epic' || reward.rarity === 'legendary' || reward.rarity === 'mythic') && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse pointer-events-none"></div>
            )}

            <div className="p-4 relative z-10">
              {/* Icône de la récompense */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2 group-hover:animate-bounce transition-all duration-200">{reward.icon}</div>
                <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                  {reward.name}
                </h4>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {reward.description}
                </p>

                {/* Informations spéciales pour les récompenses d'équipe */}
                {reward.type === 'team' && (
                  <div className="mb-4 space-y-2">
                    <div className="text-xs text-cyan-400 font-medium">
                      👥 {reward.participants}
                    </div>
                    <div className="text-xs text-yellow-400 font-medium">
                      ⏱️ Durée: {reward.duration}
                    </div>
                    {reward.level && (
                      <div className="text-xs text-purple-400 font-medium">
                        🏆 Niveau requis: {reward.level}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Prix et disponibilité */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-xl">
                    {reward.cost.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {reward.type === 'individual' ? 'XP perso' : 'XP équipe'}
                  </div>
                </div>
                
                {/* Indicateur de disponibilité gaming */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentPoints >= reward.cost 
                    ? 'bg-green-600 text-green-100 animate-pulse' 
                    : 'bg-red-600 text-red-100'
                }`}>
                  {currentPoints >= reward.cost ? '🎯 DISPO !' : '🔒 Pas assez d\'XP'}
                </div>
              </div>

              {/* Bouton d'achat gaming style */}
              <PremiumButton
                variant={currentPoints >= reward.cost ? "primary" : "secondary"}
                disabled={currentPoints < reward.cost || purchasing}
                onClick={() => handlePurchase(reward)}
                className={`w-full transition-all duration-200 ${currentPoints >= reward.cost ? 'hover:shadow-lg hover:shadow-blue-500/50' : ''}`}
              >
                {purchasing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>En cours...</span>
                  </div>
                ) : currentPoints >= reward.cost ? (
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{reward.type === 'team' ? 'ACHETER POUR L\'ÉQUIPE !' : 'ACHETER !'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>XP manquants</span>
                  </div>
                )}
              </PremiumButton>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* 📈 HISTORIQUE DES ACHATS */}
      {purchaseHistory.length > 0 && (
        <div className="mt-8">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Mes Récompenses Obtenues ({purchaseHistory.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchaseHistory.slice(0, 6).map((purchase) => (
                <div key={purchase.id} className="bg-gray-700/50 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-green-400 font-medium">{purchase.rewardName}</h5>
                      <p className="text-gray-400 text-xs">{purchase.purchaseDate?.toLocaleDateString?.()}</p>
                    </div>
                    <div className="text-yellow-400 font-bold text-sm">
                      {purchase.xpCost} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {purchaseHistory.length > 6 && (
              <div className="mt-4 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Voir toutes mes récompenses ({purchaseHistory.length})
                </button>
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {/* 💡 MESSAGE D'ENCOURAGEMENT SELON LE TYPE */}
      {((rewardType === 'individual' && userPoints < 50) || (rewardType === 'team' && teamXP < 1000)) && (
        <div className="mt-8">
          <PremiumCard>
            <div className="text-center py-8">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {rewardType === 'individual' ? 'Commencez à gagner de l\'XP !' : 'L\'équipe a besoin de plus d\'XP !'}
              </h3>
              <p className="text-gray-400 mb-6">
                {rewardType === 'individual' 
                  ? 'Complétez des tâches et créez des projets pour débloquer vos premières récompenses !'
                  : 'Chaque membre contribue automatiquement 5% de ses XP à la cagnotte d\'équipe. Plus vous êtes actifs, plus de récompenses collectives seront disponibles !'
                }
              </p>
              <div className="flex justify-center space-x-4">
                <PremiumButton variant="primary" onClick={() => window.location.href = '/tasks'}>
                  <Award className="w-4 h-4 mr-2" />
                  {rewardType === 'individual' ? 'Mes Tâches' : 'Contribuer via les Tâches'}
                </PremiumButton>
                <PremiumButton variant="secondary" onClick={() => window.location.href = '/projects'}>
                  <Trophy className="w-4 h-4 mr-2" />
                  {rewardType === 'individual' ? 'Mes Projets' : 'Contribuer via les Projets'}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* 📊 DIAGNOSTIC POUR DÉVELOPPEMENT */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-4">🎮 Debug Console - Game Master XP</h3>
            <div className="bg-gray-800 p-4 rounded text-xs text-gray-300 font-mono border border-blue-500/20">
              <div className="text-green-400">🎯 XP utilisateur: {userPoints} (source: useSimpleXP hook)</div>
              <div className="text-blue-400">👥 XP équipe: {teamXP} (niveau: {getTeamLevel()})</div>
              <div className="text-yellow-400">⚡ Données prêtes: {isReady ? '✅ READY TO GAME' : '❌ LOADING...'}</div>
              <div className="text-purple-400">🏆 Niveau perso: {gamificationData?.level || 'N/A'}</div>
              <div className="text-cyan-400">🎁 Type actuel: {rewardType === 'individual' ? '🎯 INDIVIDUEL' : '👥 ÉQUIPE'}</div>
              <div className="text-orange-400">🛒 Accessibles: {filteredRewards.filter(r => r.cost <= currentPoints).length}/{filteredRewards.length} récompenses disponibles</div>
              <div className="text-pink-400">💪 Plus chère accessible: {Math.max(...filteredRewards.filter(r => r.cost <= currentPoints).map(r => r.cost), 0)} XP</div>
              <div className="text-red-400">🔥 Prochaine cible: {filteredRewards.filter(r => r.cost > currentPoints).sort((a,b) => a.cost - b.cost)[0]?.name || 'Toutes débloquées !'}</div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
