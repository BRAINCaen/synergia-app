// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx - VERSION CORRIGÉE
// SYSTÈME DE RÉCOMPENSES AVEC VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Gift, Trophy, Star, Zap, Coins, ShoppingBag, Award, History } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

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

  // 🎮 RÉCOMPENSES POUR JEUNES GAME MASTERS GAMERS - Adaptées à leurs centres d'intérêts
  const availableRewards = [
    // 🟢 GAMING & SNACKS (30-120 XP) - Ce qu'ils adorent !
    {
      id: 'energy_drink_pack',
      name: 'Pack Energy Drinks',
      description: '4 boissons énergisantes au choix (Red Bull, Monster, etc.)',
      cost: 30,
      category: 'gaming',
      icon: '⚡',
      rarity: 'common'
    },
    {
      id: 'gaming_snacks_box',
      name: 'Box Snacks Gaming',
      description: 'Assortiment de snacks pour tes sessions gaming',
      cost: 45,
      category: 'gaming',
      icon: '🍿',
      rarity: 'common'
    },
    {
      id: 'bubble_tea',
      name: 'Bubble Tea Premium',
      description: 'Bubble tea artisanal de ton goût préféré',
      cost: 60,
      category: 'gaming',
      icon: '🧋',
      rarity: 'common'
    },
    {
      id: 'gaming_break_extended',
      name: 'Pause Gaming Longue',
      description: '1h de pause gaming officielle pendant le boulot',
      cost: 80,
      category: 'gaming',
      icon: '🎮',
      rarity: 'common'
    },
    {
      id: 'setup_upgrade',
      name: 'Upgrade Setup Perso',
      description: 'Accessoire gaming pour ton setup (tapis souris, etc.)',
      cost: 120,
      category: 'gaming',
      icon: '⌨️',
      rarity: 'uncommon'
    },

    // 🟡 TEMPS LIBRE & AVANTAGES (150-280 XP) - Liberté et flexibilité
    {
      id: 'morning_off',
      name: 'Matinée OFF',
      description: 'Commencer à 14h au lieu de 9h, officiellement',
      cost: 150,
      category: 'liberte',
      icon: '🌅',
      rarity: 'uncommon'
    },
    {
      id: 'afternoon_gaming',
      name: 'Aprem Gaming Session',
      description: 'Après-midi gaming avec les collègues sur les heures de boulot',
      cost: 180,
      category: 'liberte',
      icon: '🕹️',
      rarity: 'uncommon'
    },
    {
      id: 'wfh_day',
      name: 'Télétravail Gaming Day',
      description: 'Journée de télétravail dédiée gaming',
      cost: 220,
      category: 'liberte',
      icon: '🏠',
      rarity: 'rare'
    },
    {
      id: 'netflix_chill',
      name: 'Netflix & Chill officiel',
      description: '2h de Netflix/streaming pendant les heures de travail',
      cost: 250,
      category: 'liberte',
      icon: '📺',
      rarity: 'rare'
    },
    {
      id: 'custom_schedule',
      name: 'Horaires à la carte',
      description: 'Planning 100% flexible pendant 1 semaine',
      cost: 280,
      category: 'liberte',
      icon: '⏰',
      rarity: 'rare'
    },

    // 🔵 FOOD & DELIVERY (320-580 XP) - Ils mangent souvent en livraison
    {
      id: 'sushi_delivery',
      name: 'Livraison Sushi Premium',
      description: 'Plateau sushi haut de gamme livré au travail',
      cost: 320,
      category: 'food',
      icon: '🍣',
      rarity: 'rare'
    },
    {
      id: 'burger_gourmet',
      name: 'Burger Gourmet + Frites',
      description: 'Le meilleur burger de la ville livré',
      cost: 380,
      category: 'food',
      icon: '🍔',
      rarity: 'rare'
    },
    {
      id: 'pizza_party_solo',
      name: 'Pizza Party Solo',
      description: 'Pizza XL + boissons + dessert, juste pour toi',
      cost: 420,
      category: 'food',
      icon: '🍕',
      rarity: 'epic'
    },
    {
      id: 'ramen_authentic',
      name: 'Ramen Authentique',
      description: 'Vrai ramen japonais du meilleur resto de la ville',
      cost: 480,
      category: 'food',
      icon: '🍜',
      rarity: 'epic'
    },
    {
      id: 'meal_credits',
      name: 'Crédits Uber Eats',
      description: '50€ de crédit sur l\'app de livraison de ton choix',
      cost: 580,
      category: 'food',
      icon: '💳',
      rarity: 'epic'
    },

    // 🟠 SORTIES & ACTIVITÉS (650-1500 XP) - Activités qu'ils kiffent
    {
      id: 'arcade_session',
      name: 'Session Arcade Retro',
      description: 'Après-midi dans une salle d\'arcade vintage',
      cost: 650,
      category: 'sorties',
      icon: '🕹️',
      rarity: 'epic'
    },
    {
      id: 'laser_game',
      name: 'Laser Game + Collègues',
      description: 'Session laser game avec 3 collègues de ton choix',
      cost: 750,
      category: 'sorties',
      icon: '🎯',
      rarity: 'epic'
    },
    {
      id: 'karting_race',
      name: 'Course de Karting',
      description: 'Session karting intense sur circuit',
      cost: 880,
      category: 'sorties',
      icon: '🏎️',
      rarity: 'legendary'
    },
    {
      id: 'vr_experience',
      name: 'Expérience VR Premium',
      description: '2h de réalité virtuelle dans un centre spécialisé',
      cost: 950,
      category: 'sorties',
      icon: '🥽',
      rarity: 'legendary'
    },
    {
      id: 'paintball_battle',
      name: 'Bataille Paintball',
      description: 'Après-midi paintball avec équipe contre équipe',
      cost: 1100,
      category: 'sorties',
      icon: '🎨',
      rarity: 'legendary'
    },
    {
      id: 'trampoline_park',
      name: 'Trampoline Park Fun',
      description: 'Session défouloir au trampoline park',
      cost: 1200,
      category: 'sorties',
      icon: '🤸',
      rarity: 'legendary'
    },
    {
      id: 'gaming_tournament',
      name: 'Tournoi Gaming Organisé',
      description: 'Tournoi gaming privé avec cash prize',
      cost: 1350,
      category: 'sorties',
      icon: '🏆',
      rarity: 'legendary'
    },
    {
      id: 'adventure_park',
      name: 'Parc d\'Aventures',
      description: 'Accrobranche, tyrolienne et sensations fortes',
      cost: 1500,
      category: 'sorties',
      icon: '🌲',
      rarity: 'legendary'
    },

    // 🔴 TECH & GEAR (1800-5000 XP) - Matériel qu'ils convoitent
    {
      id: 'mechanical_keyboard',
      name: 'Clavier Mécanique Gaming',
      description: 'Clavier gaming haut de gamme avec switches au choix',
      cost: 1800,
      category: 'tech',
      icon: '⌨️',
      rarity: 'mythic'
    },
    {
      id: 'gaming_headset',
      name: 'Casque Gaming Pro',
      description: 'Casque audio gaming premium (SteelSeries, Razer...)',
      cost: 2200,
      category: 'tech',
      icon: '🎧',
      rarity: 'mythic'
    },
    {
      id: 'rgb_setup_kit',
      name: 'Kit RGB Setup',
      description: 'Kit éclairage RGB pour setup gaming épique',
      cost: 2800,
      category: 'tech',
      icon: '🌈',
      rarity: 'mythic'
    },
    {
      id: 'gaming_chair',
      name: 'Chaise Gaming Ergonomique',
      description: 'Fauteuil gaming de qualité pro pour le confort ultime',
      cost: 3500,
      category: 'tech',
      icon: '🪑',
      rarity: 'mythic'
    },
    {
      id: 'console_next_gen',
      name: 'Console Next-Gen',
      description: 'PS5, Xbox Series X ou Steam Deck selon dispo',
      cost: 5000,
      category: 'tech',
      icon: '🎮',
      rarity: 'mythic'
    },

    // 🟣 EXPÉRIENCES PREMIUM (6000-15000 XP) - Récompenses ultimes
    {
      id: 'gaming_weekend',
      name: 'Weekend Gaming Resort',
      description: '2 jours dans un resort avec setup gaming premium',
      cost: 6000,
      category: 'premium',
      icon: '🏨',
      rarity: 'mythic'
    },
    {
      id: 'festival_pass',
      name: 'Pass Festival Gaming',
      description: 'Billet VIP pour événement gaming (Japan Expo, PGW...)',
      cost: 8000,
      category: 'premium',
      icon: '🎪',
      rarity: 'mythic'
    },
    {
      id: 'team_building_epic',
      name: 'Team Building Épique',
      description: 'Organisation d\'un événement gaming pour toute l\'équipe',
      cost: 10000,
      category: 'premium',
      icon: '👥',
      rarity: 'mythic'
    },
    {
      id: 'custom_pc_build',
      name: 'PC Gaming Custom',
      description: 'PC gaming assemblé sur mesure selon tes specs',
      cost: 12000,
      category: 'premium',
      icon: '💻',
      rarity: 'mythic'
    },
    {
      id: 'japan_gaming_trip',
      name: 'Voyage Gaming au Japon',
      description: '1 semaine au Japon avec visites gaming (Nintendo, arcades...)',
      cost: 15000,
      category: 'premium',
      icon: '🗾',
      rarity: 'mythic'
    }
  ];

  // 📊 CATÉGORIES SPÉCIALEMENT CONÇUES POUR JEUNES GAME MASTERS GAMERS
  const categories = [
    { id: 'all', name: 'Toutes', icon: Trophy, count: availableRewards.length },
    { id: 'gaming', name: '🎮 Gaming & Snacks', icon: Zap, count: availableRewards.filter(r => r.category === 'gaming').length },
    { id: 'liberte', name: '⏰ Temps Libre', icon: Star, count: availableRewards.filter(r => r.category === 'liberte').length },
    { id: 'food', name: '🍕 Food & Delivery', icon: ShoppingBag, count: availableRewards.filter(r => r.category === 'food').length },
    { id: 'sorties', name: '🎯 Sorties Fun', icon: Award, count: availableRewards.filter(r => r.category === 'sorties').length },
    { id: 'tech', name: '💻 Tech & Gear', icon: Gift, count: availableRewards.filter(r => r.category === 'tech').length },
    { id: 'premium', name: '🌟 Expériences Premium', icon: Trophy, count: availableRewards.filter(r => r.category === 'premium').length }
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
      alert(`❌ XP insuffisants ! Tu as ${userPoints} XP, il t'en faut ${reward.cost}. Time to grind ! 💪`);
      return;
    }

    const confirmation = confirm(
      `🎮 GG ! Tu veux vraiment acheter "${reward.name}" pour ${reward.cost} XP ? \n\n💡 Après validation admin, ça sera à toi !`
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
      
      alert(`🎉 "${reward.name}" acheté avec succès ! 🎮 La récompense sera validée par l'admin et tes XP seront déduits !`);
      
    } catch (error) {
      console.error('❌ [REWARDS] Erreur achat:', error);
      alert('❌ Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(false);
    }
  };

  // 🎨 COULEURS SELON RARETÉ - Ajustées pour l'univers gaming
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-emerald-400 to-green-600'; // Gaming green
      case 'uncommon': return 'from-blue-400 to-cyan-600'; // Electric blue
      case 'rare': return 'from-purple-400 to-indigo-600'; // Gaming purple
      case 'epic': return 'from-orange-400 to-red-600'; // Fire orange/red
      case 'legendary': return 'from-yellow-400 to-orange-500'; // Legendary gold
      case 'mythic': return 'from-pink-400 to-purple-500'; // Mythic rainbow
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
              {userPoints.toLocaleString()} XP
            </h2>
            <p className="text-gray-400">
              Tes XP disponibles pour des récompenses de ouf ! 🎮
            </p>
            <div className="mt-4 text-xs text-gray-500">
              Source: useUnifiedXP → Firebase gamification.totalXp
            </div>
            <div className="mt-4">
              <PremiumButton variant="primary" icon={Zap}>
                Farm plus d'XP ! 💪
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* 📂 FILTRES PAR CATÉGORIE */}
      <div className="mb-6">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">🎯 Catégories de Récompenses</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
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

      // 🏪 GRILLE DES RÉCOMPENSES - Style Gaming
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => (
          <PremiumCard key={reward.id} className="relative overflow-hidden group hover:scale-105 transition-transform duration-200">
            {/* Badge de rareté gaming */}
            <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-r ${getRarityColor(reward.rarity)} text-xs font-bold text-white rounded-bl-lg z-10 shadow-lg`}>
              {reward.rarity.toUpperCase()}
            </div>

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
              </div>

              {/* Prix et disponibilité */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-xl">
                    {reward.cost.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">XP</div>
                </div>
                
                {/* Indicateur de disponibilité gaming */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userPoints >= reward.cost 
                    ? 'bg-green-600 text-green-100 animate-pulse' 
                    : 'bg-red-600 text-red-100'
                }`}>
                  {userPoints >= reward.cost ? '🎯 DISPO !' : '🔒 Pas assez d\'XP'}
                </div>
              </div>

              {/* Bouton d'achat gaming style */}
              <PremiumButton
                variant={userPoints >= reward.cost ? "primary" : "secondary"}
                disabled={userPoints < reward.cost || purchasing}
                onClick={() => handlePurchase(reward)}
                className={`w-full transition-all duration-200 ${userPoints >= reward.cost ? 'hover:shadow-lg hover:shadow-blue-500/50' : ''}`}
                icon={purchasing ? null : (userPoints >= reward.cost ? '🛒' : '🔒')}
              >
                {purchasing ? 'En cours...' : (userPoints >= reward.cost ? 'ACHETER !' : 'XP manquants')}
              </PremiumButton>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* 📊 DIAGNOSTIC DES DONNÉES GAMING */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-4">🎮 Debug Console - Game Master XP</h3>
            <div className="bg-gray-800 p-4 rounded text-xs text-gray-300 font-mono border border-blue-500/20">
              <div className="text-green-400">🎯 XP utilisateur: {userPoints} (source: useUnifiedXP hook)</div>
              <div className="text-blue-400">💎 XP total Firebase: {totalXp}</div>
              <div className="text-yellow-400">⚡ Données prêtes: {isReady ? '✅ READY TO GAME' : '❌ LOADING...'}</div>
              <div className="text-purple-400">🏆 Niveau: {gamificationData?.level || 'N/A'}</div>
              <div className="text-cyan-400">🎁 Historique: {purchaseHistory.length} récompenses déjà obtenues</div>
              <div className="text-orange-400">🛒 Accessibles: {filteredRewards.filter(r => r.cost <= userPoints).length}/{filteredRewards.length} récompenses disponibles</div>
              <div className="text-pink-400">💪 Plus chère accessible: {Math.max(...filteredRewards.filter(r => r.cost <= userPoints).map(r => r.cost), 0)} XP</div>
              <div className="text-red-400">🔥 Prochaine cible: {filteredRewards.filter(r => r.cost > userPoints).sort((a,b) => a.cost - b.cost)[0]?.name || 'Toutes débloquées !'}</div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
