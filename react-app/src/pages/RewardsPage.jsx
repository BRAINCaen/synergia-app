// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx - VERSION CORRIGÉE
// SYSTÈME DE RÉCOMPENSES AVEC VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Gift, Trophy, Star, Zap, Coins, ShoppingBag, Award, History } from 'lucide-react';
import PremiumLayout from '../components/layouts/PremiumLayout.jsx';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import PremiumButton from '../components/ui/PremiumButton.jsx';

// ✅ IMPORTS CORRECTS pour les vraies données Firebase
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎁 PAGE RÉCOMPENSES AVEC VRAIES DONNÉES FIREBASE
 * Utilise les vraies XP de l'utilisateur pour afficher le solde correct
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  
  // ✅ UTILISER LES VRAIES DONNÉES XP UNIFIÉES
  const { 
    totalXp, 
    gamificationData, 
    loading: xpLoading, 
    isReady 
  } = useUnifiedXP();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // ✅ DONNÉES RÉELLES - Plus de points hardcodés !
  const userPoints = totalXp || 0; // Utiliser les vraies XP comme points

  // 🏪 RÉCOMPENSES DISPONIBLES - Prix basés sur les vraies données du système
  const availableRewards = [
    // 🟢 MINI-PLAISIRS (50-100 XP)
    {
      id: 'snack_personal',
      name: 'Goûter personnalisé',
      description: 'Un goûter choisi spécialement pour vous',
      cost: 50,
      category: 'mini',
      icon: '🍪',
      rarity: 'common'
    },
    {
      id: 'mini_game',
      name: 'Mini-jeu de bureau',
      description: 'Jeu relaxant pendant une pause',
      cost: 80,
      category: 'mini',
      icon: '🎮',
      rarity: 'common'
    },
    {
      id: 'unlimited_break',
      name: 'Pause illimitée',
      description: 'Une pause aussi longue que vous le souhaitez',
      cost: 100,
      category: 'mini',
      icon: '⏰',
      rarity: 'common'
    },

    // 🔵 PETITS AVANTAGES (120-180 XP)
    {
      id: 'time_off_15min',
      name: '15 min off',
      description: '15 minutes de liberté totale',
      cost: 120,
      category: 'avantages',
      icon: '⏱️',
      rarity: 'uncommon'
    },
    {
      id: 'nap_authorized',
      name: 'Pause sieste autorisée',
      description: 'Droit à une micro-sieste officielle',
      cost: 150,
      category: 'avantages',
      icon: '😴',
      rarity: 'uncommon'
    },
    {
      id: 'light_shift',
      name: 'Shift "super light"',
      description: 'Journée de travail allégée',
      cost: 180,
      category: 'avantages',
      icon: '🌤️',
      rarity: 'uncommon'
    },

    // 🟡 PLAISIRS UTILES (220-380 XP)
    {
      id: 'action_voucher',
      name: 'Bon "action"',
      description: 'Bon à utiliser pour une action spéciale',
      cost: 220,
      category: 'utiles',
      icon: '🎯',
      rarity: 'rare'
    },
    {
      id: 'breakfast_surprise',
      name: 'Petit-déj surprise',
      description: 'Petit-déjeuner préparé spécialement',
      cost: 280,
      category: 'utiles',
      icon: '🥐',
      rarity: 'rare'
    },
    {
      id: 'book_choice',
      name: 'Livre au choix',
      description: 'Un livre de votre choix offert',
      cost: 320,
      category: 'utiles',
      icon: '📚',
      rarity: 'rare'
    },
    {
      id: 'pizza_lunch',
      name: 'Pizza du midi',
      description: 'Déjeuner pizza livré sur le lieu de travail',
      cost: 380,
      category: 'utiles',
      icon: '🍕',
      rarity: 'rare'
    },

    // 🟠 PLAISIRS FOOD & CADEAUX (450-680 XP)
    {
      id: 'restaurant_voucher',
      name: 'Bon d\'achat "restauration"',
      description: 'Crédit pour restaurant de votre choix',
      cost: 450,
      category: 'food',
      icon: '🍽️',
      rarity: 'epic'
    },
    {
      id: 'poke_bowl',
      name: 'Poke bowl/burger livré',
      description: 'Repas healthy ou gourmand livré',
      cost: 520,
      category: 'food',
      icon: '🥙',
      rarity: 'epic'
    },
    {
      id: 'gift_voucher',
      name: 'Bon cadeau magasins',
      description: 'Carte cadeau utilisable en magasin',
      cost: 600,
      category: 'food',
      icon: '🎁',
      rarity: 'epic'
    },
    {
      id: 'board_game',
      name: 'Jeu de société offert',
      description: 'Jeu de société de votre choix',
      cost: 680,
      category: 'food',
      icon: '🎲',
      rarity: 'epic'
    },

    // 🔴 LOISIRS & SORTIES (1100-1350 XP)
    {
      id: 'cinema_tickets',
      name: '2 places de cinéma',
      description: 'Séance de cinéma pour deux personnes',
      cost: 1100,
      category: 'loisirs',
      icon: '🎬',
      rarity: 'legendary'
    },
    {
      id: 'escape_game',
      name: 'Place d\'escape game',
      description: 'Session d\'escape game entre collègues',
      cost: 1200,
      category: 'loisirs',
      icon: '🔐',
      rarity: 'legendary'
    },
    {
      id: 'discovery_activity',
      name: 'Initiation/découverte',
      description: 'Activité de découverte au choix',
      cost: 1350,
      category: 'loisirs',
      icon: '🎭',
      rarity: 'legendary'
    },

    // 🟣 PREMIUM (6500-12500 XP)
    {
      id: 'premium_card',
      name: 'Carte cadeau premium',
      description: 'Carte cadeau haut de gamme',
      cost: 6500,
      category: 'premium',
      icon: '💎',
      rarity: 'mythic'
    },
    {
      id: 'hotel_night',
      name: '1 nuit d\'hôtel pour 2',
      description: 'Nuit d\'hôtel romantique',
      cost: 8000,
      category: 'premium',
      icon: '🏨',
      rarity: 'mythic'
    },
    {
      id: 'spa_day',
      name: 'Journée spa',
      description: 'Journée détente et bien-être',
      cost: 12500,
      category: 'premium',
      icon: '💆‍♀️',
      rarity: 'mythic'
    }
  ];

  // 📊 CATÉGORIES AVEC VRAIES DONNÉES
  const categories = [
    { id: 'all', name: 'Toutes', icon: Trophy, count: availableRewards.length },
    { id: 'mini', name: 'Mini-plaisirs', icon: Coins, count: availableRewards.filter(r => r.category === 'mini').length },
    { id: 'avantages', name: 'Petits avantages', icon: Star, count: availableRewards.filter(r => r.category === 'avantages').length },
    { id: 'utiles', name: 'Plaisirs utiles', icon: Gift, count: availableRewards.filter(r => r.category === 'utiles').length },
    { id: 'food', name: 'Food & Cadeaux', icon: ShoppingBag, count: availableRewards.filter(r => r.category === 'food').length },
    { id: 'loisirs', name: 'Loisirs & Sorties', icon: Award, count: availableRewards.filter(r => r.category === 'loisirs').length },
    { id: 'premium', name: 'Premium', icon: Trophy, count: availableRewards.filter(r => r.category === 'premium').length }
  ];

  // 🎯 STATISTIQUES HEADER AVEC VRAIES DONNÉES
  const headerStats = [
    { 
      label: "Points disponibles", 
      value: userPoints.toLocaleString(), 
      icon: Coins, 
      color: "text-yellow-400",
      source: "Firebase gamification.totalXp"
    },
    { 
      label: "Récompenses obtenues", 
      value: purchaseHistory.length.toString(), 
      icon: Gift, 
      color: "text-green-400",
      source: "Firebase rewardRequests approved"
    },
    { 
      label: "Niveau actuel", 
      value: gamificationData?.level?.toString() || "1", 
      icon: Star, 
      color: "text-purple-400",
      source: "Firebase gamification.level calculé"
    },
    { 
      label: "Récompenses disponibles", 
      value: availableRewards.filter(r => r.cost <= userPoints).length.toString(), 
      icon: Trophy, 
      color: "text-blue-400",
      source: "Calcul temps réel basé sur XP"
    }
  ];

  // 🎮 ACTIONS HEADER
  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton 
        variant="secondary" 
        icon={History}
        onClick={() => {/* Afficher historique */}}
      >
        Historique
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Zap}
        onClick={() => {/* Aller vers tâches pour gagner plus d'XP */}}
      >
        Gagner plus d'XP
      </PremiumButton>
    </div>
  );

  // 🔥 ÉCOUTE FIREBASE POUR L'HISTORIQUE DES RÉCOMPENSES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🎁 [REWARDS] Écoute Firebase historique récompenses pour:', user.uid);

    const rewardsQuery = query(
      collection(db, 'rewardRequests'),
      where('userId', '==', user.uid),
      where('status', '==', 'approved'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(rewardsQuery, (snapshot) => {
      const rewards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().approvedAt?.toDate?.() || new Date()
      }));

      setPurchaseHistory(rewards);
      setLoading(false);

      console.log('✅ [REWARDS] Historique Firebase chargé:', rewards.length, 'récompenses');
    }, (error) => {
      console.error('❌ [REWARDS] Erreur Firebase historique:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🛒 FONCTION D'ACHAT CORRIGÉE avec Firebase
  const handlePurchase = async (reward) => {
    if (purchasing) return;
    
    if (userPoints < reward.cost) {
      alert(`❌ Points insuffisants ! Vous avez ${userPoints} points, il en faut ${reward.cost}.`);
      return;
    }

    const confirmation = confirm(
      `🎁 Confirmer l'achat de "${reward.name}" pour ${reward.cost} points ?`
    );
    
    if (!confirmation) return;

    setPurchasing(true);

    try {
      console.log('🛒 [REWARDS] Achat récompense:', {
        userId: user.uid,
        rewardId: reward.id,
        cost: reward.cost,
        userPointsBefore: userPoints
      });

      // Créer une demande de récompense dans Firebase
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userEmail: user.email,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardDescription: reward.description,
        xpCost: reward.cost,
        rewardType: 'individual',
        status: 'approved', // Auto-approuvé pour l'instant
        requestedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        approvedBy: 'system'
      });

      console.log('✅ [REWARDS] Demande créée avec succès !');
      
      alert(`🎉 "${reward.name}" acheté avec succès ! La déduction d'XP sera effectuée par l'admin.`);
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur achat:', error);
      alert('❌ Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(false);
    }
  };

  // 🎨 COULEURS SELON RARETÉ
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'mythic': return 'from-pink-400 to-red-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // 🎯 FILTRER LES RÉCOMPENSES
  const filteredRewards = selectedCategory === 'all' 
    ? availableRewards 
    : availableRewards.filter(reward => reward.category === selectedCategory);

  // 📊 AFFICHAGE DE DEBUG DES DONNÉES
  console.log('🎁 [REWARDS] État actuel:', {
    userPoints,
    totalXp,
    isReady,
    purchaseHistoryCount: purchaseHistory.length,
    availableRewardsCount: filteredRewards.filter(r => r.cost <= userPoints).length,
    source: 'useUnifiedXP + Firebase'
  });

  if (loading || xpLoading || !isReady) {
    return (
      <PremiumLayout title="Récompenses" subtitle="Chargement..." icon={Gift}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des données réelles...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Récompenses"
      subtitle="Échangez vos XP contre des récompenses exclusives"
      icon={Gift}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* ✅ SOLDE AVEC VRAIES DONNÉES */}
      <div className="mb-6">
        <PremiumCard>
          <div className="text-center py-6">
            <div className="flex items-center justify-center mb-4">
              <Coins className="w-16 h-16 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {userPoints.toLocaleString()} Points
            </h2>
            <p className="text-gray-400">
              Votre solde XP disponible (Firebase: {gamificationData ? '✅' : '❌'})
            </p>
            <div className="mt-4 text-xs text-gray-500">
              Source: useUnifiedXP → Firebase gamification.totalXp
            </div>
            <div className="mt-4">
              <PremiumButton variant="primary" icon={Zap}>
                Gagner plus de points
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* 📂 FILTRES PAR CATÉGORIE */}
      <div className="mb-6">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">Catégories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* 🏪 GRILLE DES RÉCOMPENSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => (
          <PremiumCard key={reward.id} className="relative overflow-hidden">
            {/* Badge de rareté */}
            <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-r ${getRarityColor(reward.rarity)} text-xs font-bold text-white rounded-bl-lg`}>
              {reward.rarity}
            </div>

            <div className="p-4">
              {/* Icône de la récompense */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{reward.icon}</div>
                <h4 className="text-white font-semibold text-lg mb-2">
                  {reward.name}
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  {reward.description}
                </p>
              </div>

              {/* Prix et disponibilité */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-xl">
                    {reward.cost.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">Points</div>
                </div>
                
                {/* Indicateur de disponibilité */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userPoints >= reward.cost 
                    ? 'bg-green-600 text-green-100' 
                    : 'bg-red-600 text-red-100'
                }`}>
                  {userPoints >= reward.cost ? '✅ Disponible' : '❌ Insuffisant'}
                </div>
              </div>

              {/* Bouton d'achat */}
              <PremiumButton
                variant={userPoints >= reward.cost ? "primary" : "secondary"}
                disabled={userPoints < reward.cost || purchasing}
                onClick={() => handlePurchase(reward)}
                className="w-full"
                icon={purchasing ? null : ShoppingBag}
              >
                {purchasing ? 'Achat en cours...' : 'Acheter'}
              </PremiumButton>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* 📊 DIAGNOSTIC DES DONNÉES */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-4">🔍 Diagnostic des données</h3>
            <div className="bg-gray-800 p-4 rounded text-xs text-gray-300 font-mono">
              <div>Points utilisateur: {userPoints} (source: useUnifiedXP)</div>
              <div>XP total Firebase: {totalXp}</div>
              <div>Données prêtes: {isReady ? '✅' : '❌'}</div>
              <div>Niveau: {gamificationData?.level || 'N/A'}</div>
              <div>Historique chargé: {purchaseHistory.length} récompenses</div>
              <div>Récompenses accessibles: {filteredRewards.filter(r => r.cost <= userPoints).length}/{filteredRewards.length}</div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
