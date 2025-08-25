// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES CONNECTÉE AUX VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Trophy, Star, Crown, Zap, ShoppingBag, Lock, RefreshCw, Clock, Award, Users, Coins } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';

/**
 * 🎮 HOOK XP SIMPLIFIÉ POUR LES RÉCOMPENSES INDIVIDUELLES
 */
const useSimpleXP = () => {
  const { user } = useAuthStore();
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setTotalXp(0);
      setLevel(1);
      setIsReady(true);
      return;
    }

    const loadUserXP = async () => {
      try {
        console.log('🎮 [SIMPLE-XP] Chargement XP pour:', user.uid);
        
        // Essayer de récupérer depuis Firebase
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userXP = userData.gamification?.totalXp || userData.totalXp || 0;
          const userLevel = userData.gamification?.level || userData.level || 1;
          
          setTotalXp(userXP);
          setLevel(userLevel);
          
          console.log('✅ [SIMPLE-XP] XP utilisateur chargé depuis Firebase:', userXP);
        } else {
          // Fallback vers localStorage
          const savedXp = localStorage.getItem(`user_xp_${user.uid}`);
          if (savedXp) {
            const xpValue = parseInt(savedXp, 10);
            setTotalXp(xpValue);
            setLevel(Math.floor(xpValue / 100) + 1);
            console.log('✅ [SIMPLE-XP] XP utilisateur chargé depuis localStorage:', xpValue);
          }
        }
        
        setIsReady(true);
      } catch (err) {
        console.warn('⚠️ [SIMPLE-XP] Erreur chargement XP:', err);
        setError(err.message);
        setIsReady(true);
      }
    };

    loadUserXP();
  }, [user?.uid]);

  const addXP = async (amount, source = 'reward') => {
    if (!user?.uid) return { success: false, error: 'Utilisateur non connecté' };

    try {
      const newXp = Math.max(0, totalXp + amount); // Ne pas descendre en dessous de 0
      setTotalXp(newXp);
      setLevel(Math.floor(newXp / 100) + 1);
      
      // Sauvegarder dans localStorage comme fallback
      localStorage.setItem(`user_xp_${user.uid}`, newXp.toString());
      
      console.log(`✅ [SIMPLE-XP] ${amount} XP modifié (${source}). Total: ${newXp}`);
      return { success: true, newTotal: newXp };
    } catch (error) {
      console.error('❌ [SIMPLE-XP] Erreur modification XP:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    totalXp,
    level,
    isReady,
    error,
    addXP,
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
 * 🎁 RÉCOMPENSES INDIVIDUELLES
 */
const INDIVIDUAL_REWARDS = [
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
    id: 'coffee_voucher', 
    name: '☕ Bon Café Premium', 
    description: 'Voucher pour un café premium dans la cafétéria ! Fuel your grind.',
    cost: 75, 
    icon: '☕', 
    rarity: 'common',
    category: 'physical',
    type: 'individual'
  },
  { 
    id: 'custom_avatar', 
    name: '👤 Avatar Personnalisé', 
    description: 'Avatar custom créé par notre équipe design ! Show your style.',
    cost: 120, 
    icon: '👤', 
    rarity: 'uncommon',
    category: 'digital',
    type: 'individual'
  },
  { 
    id: 'lunch_voucher', 
    name: '🍕 Déjeuner Offert', 
    description: 'Repas gratuit au restaurant de ton choix ! Epic meal time.',
    cost: 200, 
    icon: '🍕', 
    rarity: 'uncommon',
    category: 'physical',
    type: 'individual'
  },
  { 
    id: 'gaming_peripherals', 
    name: '🎯 Accessoire Gaming', 
    description: 'Souris, clavier ou casque gaming au choix ! Level up your setup.',
    cost: 350, 
    icon: '🎯', 
    rarity: 'rare',
    category: 'physical',
    type: 'individual'
  },
  { 
    id: 'premium_course', 
    name: '📚 Formation Premium', 
    description: 'Accès à une formation en ligne de ton choix ! Skill up IRL.',
    cost: 500, 
    icon: '📚', 
    rarity: 'rare',
    category: 'experience',
    type: 'individual'
  },
  { 
    id: 'day_off', 
    name: '🏖️ Jour de Congé Bonus', 
    description: 'Un jour de congé supplémentaire approuvé ! Ultimate reward.',
    cost: 800, 
    icon: '🏖️', 
    rarity: 'epic',
    category: 'experience',
    type: 'individual'
  },
  { 
    id: 'tech_gadget', 
    name: '📱 Gadget Tech Premium', 
    description: 'Dernière technologie : smartphone, tablette ou smartwatch ! Next-gen gear.',
    cost: 1200, 
    icon: '📱', 
    rarity: 'legendary',
    category: 'physical',
    type: 'individual'
  }
];

/**
 * 🏆 RÉCOMPENSES D'ÉQUIPE
 */
const TEAM_REWARDS = [
  { 
    id: 'team_pizza_party', 
    name: '🍕 Pizza Party Équipe', 
    description: 'Pizza party pour toute l\'équipe avec boissons et desserts !',
    cost: 800, 
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
    cost: 1200, 
    icon: '🎬', 
    rarity: 'common',
    category: 'entertainment',
    type: 'team',
    level: 'BRONZE',
    participants: 'Toute l\'équipe',
    duration: '3h'
  },
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
  }
];

/**
 * 🎁 COMPOSANT PRINCIPAL RÉCOMPENSES AVEC FIREBASE
 */
const RewardsPage = () => {
  // États locaux
  const [rewardType, setRewardType] = useState('individual');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // Hooks
  const { user } = useAuthStore();
  const { totalXp: userPoints, isReady: userXpReady, gamificationData, addXP } = useSimpleXP();
  
  // 🏆 HOOK CAGNOTTE D'ÉQUIPE - VRAIES DONNÉES FIREBASE !
  const {
    poolData,
    stats: teamStats,
    loading: teamLoading,
    error: teamError,
    isReady: teamReady,
    refreshPoolData,
    purchaseTeamReward
  } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true,
    enableContributions: true
  });

  /**
   * 🔍 ÉCOUTER L'HISTORIQUE DES ACHATS FIREBASE
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
      });

      return unsubscribe;
    } catch (error) {
      console.warn('⚠️ [REWARDS] Firebase indisponible, mode hors-ligne:', error);
    }
  }, [user?.uid]);

  /**
   * 🎨 COULEURS SELON RARETÉ
   */
  const getRarityColor = (rarity) => {
    const rarityColors = {
      common: 'from-emerald-400 to-green-600',
      uncommon: 'from-blue-400 to-cyan-600', 
      rare: 'from-purple-400 to-indigo-600',
      epic: 'from-orange-400 to-red-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return rarityColors[rarity] || 'from-gray-400 to-gray-600';
  };

  /**
   * 🛒 GÉRER L'ACHAT D'UNE RÉCOMPENSE
   */
  const handlePurchase = async (reward) => {
    if (!user?.uid) {
      alert('🚨 Tu dois être connecté pour acheter des récompenses !');
      return;
    }

    const requiredPoints = reward.cost;
    const availablePoints = reward.type === 'individual' ? userPoints : teamStats.totalXP;

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

      if (reward.type === 'individual') {
        // ✅ ACHAT INDIVIDUEL - Déduire XP personnels
        const xpResult = await addXP(-reward.cost, 'reward_purchase');
        
        if (xpResult.success) {
          // Créer demande Firebase
          await addDoc(collection(db, 'rewardRequests'), {
            userId: user.uid,
            userEmail: user.email,
            rewardName: reward.name,
            rewardDescription: reward.description,
            xpCost: reward.cost,
            rewardType: 'individual',
            rewardCategory: reward.category,
            status: 'pending',
            requestedAt: serverTimestamp(),
            approvedBy: null
          });

          alert(`🎉 "${reward.name}" acheté ! 🎮 ${reward.cost} XP déduits ! Reste: ${xpResult.newTotal} XP`);
        } else {
          throw new Error('Erreur déduction XP: ' + xpResult.error);
        }

      } else {
        // ✅ ACHAT ÉQUIPE - Utiliser la vraie cagnotte Firebase !
        const teamResult = await purchaseTeamReward(reward.id, reward);
        
        if (teamResult.success) {
          alert(`🎉 "${reward.name}" acheté pour l'équipe ! 👥 ${reward.cost} XP d'équipe déduits ! \n\n🎊 Toute l'équipe va adorer ! Nouveau solde équipe: ${teamResult.newPoolTotal} XP`);
          
          // Rafraîchir les données équipe
          await refreshPoolData();
        } else {
          throw new Error('Erreur achat équipe: ' + teamResult.error);
        }
      }

    } catch (error) {
      console.error('❌ [REWARDS] Erreur achat:', error);
      alert(`❌ Erreur lors de l'achat: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  // 🔄 FILTRER LES RÉCOMPENSES
  const rewards = rewardType === 'individual' ? INDIVIDUAL_REWARDS : TEAM_REWARDS;
  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  // 📈 STATISTIQUES ACTUELLES
  const currentPoints = rewardType === 'individual' ? userPoints : teamStats.totalXP;

  // Fonction pour obtenir le niveau d'équipe
  function getTeamLevel() {
    const totalXP = teamStats.totalXP || 0;
    if (totalXP >= 20000) return 'DIAMOND';
    if (totalXP >= 10000) return 'PLATINUM';
    if (totalXP >= 5000) return 'GOLD';
    if (totalXP >= 2500) return 'SILVER';
    return 'BRONZE';
  }

  // 📊 STATISTIQUES HEADER
  const headerStats = [
    { 
      label: rewardType === 'individual' ? "Mes XP" : "XP Équipe", 
      value: currentPoints.toLocaleString(), 
      icon: rewardType === 'individual' ? Zap : Coins, 
      color: currentPoints > 500 ? "text-yellow-400" : "text-blue-400"
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

  // Actions header
  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={rewardType === 'team' ? refreshPoolData : () => window.location.reload()}
        disabled={purchasing || (rewardType === 'team' && teamLoading)}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton variant="primary" icon={Award}>
        Mon Historique
      </PremiumButton>
    </div>
  );

  // 🚨 GESTION CHARGEMENT
  if (!userXpReady || (rewardType === 'team' && teamLoading)) {
    return (
      <PremiumLayout
        title="🎁 Boutique de Récompenses"
        subtitle="Chargement des vraies données Firebase..."
        icon={Gift}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">
              {rewardType === 'team' ? 'Synchronisation cagnotte équipe...' : 'Chargement XP personnels...'}
            </p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // 🚨 GESTION ERREUR ÉQUIPE
  if (rewardType === 'team' && teamError) {
    return (
      <PremiumLayout
        title="🎁 Boutique de Récompenses"
        subtitle="Erreur cagnotte équipe"
        icon={Gift}
      >
        <PremiumCard className="text-center py-8">
          <div className="text-red-400 mb-4">❌ Erreur cagnotte équipe: {teamError}</div>
          <PremiumButton variant="primary" onClick={refreshPoolData}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="🎁 Boutique de Récompenses"
      subtitle={rewardType === 'individual' 
        ? "Échangez vos XP contre des récompenses personnelles !" 
        : `Utilisez les XP d'équipe (${teamStats.totalXP} XP réels Firebase) pour des récompenses collectives !`
      }
      icon={Gift}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Switch Individual/Team */}
      <div className="mb-8 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setRewardType('individual')}
            className={`px-6 py-3 rounded-md transition-all duration-300 flex items-center space-x-2 ${
              rewardType === 'individual'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>🎮 Récompenses Individuelles</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {userPoints.toLocaleString()} XP
            </span>
          </button>
          
          <button
            onClick={() => setRewardType('team')}
            className={`px-6 py-3 rounded-md transition-all duration-300 flex items-center space-x-2 ${
              rewardType === 'team'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>👥 Récompenses Équipe</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {teamStats.totalXP.toLocaleString()} XP Firebase
            </span>
          </button>
        </div>
      </div>

      {/* Debug Info Équipe */}
      {rewardType === 'team' && process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-gray-400 font-mono text-sm mb-2">Debug Cagnotte Équipe:</h4>
          <pre className="text-xs text-gray-500">
            {JSON.stringify({ 
              totalXP: teamStats.totalXP,
              currentLevel: teamStats.currentLevel,
              teamReady,
              teamLoading,
              poolData: !!poolData
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {['all', ...(rewardType === 'individual' ? ['digital', 'physical', 'experience'] : ['food', 'activity', 'equipment', 'travel', 'entertainment'])].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category === 'all' ? 'Toutes' : 
             category === 'digital' ? '💻 Digital' :
             category === 'physical' ? '🎁 Physique' :
             category === 'experience' ? '🌟 Expérience' :
             category === 'food' ? '🍕 Nourriture' :
             category === 'activity' ? '🎯 Activités' :
             category === 'equipment' ? '⚙️ Équipement' :
             category === 'travel' ? '✈️ Voyages' :
             category === 'entertainment' ? '🎬 Divertissement' : category}
          </button>
        ))}
      </div>

      {/* Liste des récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const canAfford = currentPoints >= reward.cost;
          const rarityGradient = getRarityColor(reward.rarity);

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative bg-gray-800 rounded-xl border-2 overflow-hidden transition-all duration-300
                ${canAfford ? 'border-green-500/50 hover:border-green-400' : 'border-gray-700 opacity-75'}
                ${purchasing ? 'pointer-events-none' : ''}
              `}
            >
              {/* Badge rareté */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r ${rarityGradient}`}>
                {reward.rarity.toUpperCase()}
              </div>

              {/* Icône principale */}
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">{reward.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{reward.description}</p>

                {/* Prix */}
                <div className={`text-2xl font-bold mb-4 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                  {reward.cost.toLocaleString()} XP
                </div>

                {/* Info équipe */}
                {reward.type === 'team' && (
                  <div className="text-xs text-gray-500 mb-4">
                    <div>👥 {reward.participants}</div>
                    <div>⏱️ {reward.duration}</div>
                    <div>🏆 Niveau {reward.level}</div>
                  </div>
                )}

                {/* Bouton achat */}
                <button
                  onClick={() => handlePurchase(reward)}
                  disabled={!canAfford || purchasing}
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2
                    ${canAfford 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                    ${purchasing ? 'opacity-50' : ''}
                  `}
                >
                  {purchasing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Achat en cours...</span>
                    </>
                  ) : canAfford ? (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Acheter</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>XP insuffisants</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Message si aucune récompense */}
      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Aucune récompense dans cette catégorie</h3>
          <p className="text-gray-400">Changez de catégorie pour voir plus de récompenses !</p>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
