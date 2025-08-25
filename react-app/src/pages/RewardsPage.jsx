// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// SYSTÈME DE DEMANDES DE RÉCOMPENSES AVEC VALIDATION ADMIN
// ==========================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, ShoppingBag, RefreshCw, Lock, Star, Users, 
  Zap, Award, Filter, Search, CheckCircle, Clock, X, AlertCircle
} from 'lucide-react';

// Firebase
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase.config.js';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { useXP } from '../shared/hooks/useXP.js';

// Layout
import PremiumLayout from '../components/layout/PremiumLayout.jsx';

const RewardsPage = () => {
  // ✅ ÉTATS ET HOOKS
  const { user, isAuthenticated } = useAuthStore();
  const { userPoints, teamStats, loading: xpLoading } = useXP();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // ✅ CATALOGUE RÉCOMPENSES - DONNÉES ENRICHIES
  const rewardsData = useMemo(() => ({
    individual: [
      { 
        id: 'gaming_stickers', 
        name: 'Sticker Pack Gaming', 
        description: 'Collection de stickers gaming premium pour personnaliser ton setup !', 
        cost: 50, 
        category: 'Mini-plaisirs', 
        rarity: 'common',
        type: 'individual',
        icon: '🎮',
        estimatedDelivery: '1-2 jours'
      },
      { 
        id: 'premium_coffee', 
        name: 'Bon Café Premium', 
        description: 'Voucher pour un café dans le meilleur coffee shop de la ville', 
        cost: 75, 
        category: 'Mini-plaisirs', 
        rarity: 'common',
        type: 'individual',
        icon: '☕',
        estimatedDelivery: 'Immédiat'
      },
      { 
        id: 'time_off_15min', 
        name: '15 min off', 
        description: 'Pause bonus de 15 minutes quand tu veux !', 
        cost: 120, 
        category: 'Petits avantages', 
        rarity: 'uncommon',
        type: 'individual',
        icon: '⏰',
        estimatedDelivery: 'Immédiat'
      },
      { 
        id: 'nap_authorized', 
        name: 'Pause sieste autorisée', 
        description: 'Une vraie sieste de 20 min pendant les heures de travail !', 
        cost: 150, 
        category: 'Petits avantages', 
        rarity: 'uncommon',
        type: 'individual',
        icon: '😴',
        estimatedDelivery: 'Immédiat'
      },
      { 
        id: 'light_shift', 
        name: 'Shift "super light"', 
        description: 'Une journée de travail allégée avec que les tâches fun !', 
        cost: 180, 
        category: 'Petits avantages', 
        rarity: 'uncommon',
        type: 'individual',
        icon: '🌟',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'action_voucher', 
        name: 'Bon "action"', 
        description: 'Participe à une activité équipe fun (escape game, karting...)', 
        cost: 220, 
        category: 'Plaisirs utiles', 
        rarity: 'rare',
        type: 'individual',
        icon: '🎯',
        estimatedDelivery: '1 semaine'
      },
      { 
        id: 'breakfast_surprise', 
        name: 'Petit-déj surprise', 
        description: 'Petit-déjeuner de chef livré au bureau juste pour toi !', 
        cost: 280, 
        category: 'Plaisirs utiles', 
        rarity: 'rare',
        type: 'individual',
        icon: '🥐',
        estimatedDelivery: '1-2 jours'
      },
      { 
        id: 'book_choice', 
        name: 'Livre au choix', 
        description: 'N\'importe quel livre (même expensive) offert par la team !', 
        cost: 320, 
        category: 'Plaisirs utiles', 
        rarity: 'rare',
        type: 'individual',
        icon: '📚',
        estimatedDelivery: '3-5 jours'
      },
      { 
        id: 'pizza_lunch', 
        name: 'Pizza du midi', 
        description: 'Pizza artisanale livrée pour ton déjeuner personnel !', 
        cost: 380, 
        category: 'Plaisirs utiles', 
        rarity: 'rare',
        type: 'individual',
        icon: '🍕',
        estimatedDelivery: 'Jour même'
      },
      { 
        id: 'restaurant_voucher', 
        name: 'Bon d\'achat "restauration"', 
        description: 'Carte cadeau 30€ pour le restaurant de ton choix !', 
        cost: 450, 
        category: 'Plaisirs food & cadeaux', 
        rarity: 'epic',
        type: 'individual',
        icon: '🍽️',
        estimatedDelivery: '1 jour'
      },
      { 
        id: 'poke_bowl', 
        name: 'Poke bowl/burger livré', 
        description: 'Repas healthy ou comfort food livré direct à ton bureau !', 
        cost: 520, 
        category: 'Plaisirs food & cadeaux', 
        rarity: 'epic',
        type: 'individual',
        icon: '🥗',
        estimatedDelivery: 'Jour même'
      },
      { 
        id: 'gift_voucher', 
        name: 'Bon cadeau magasins', 
        description: 'Carte cadeau 50€ dans les magasins partenaires !', 
        cost: 600, 
        category: 'Plaisirs food & cadeaux', 
        rarity: 'epic',
        type: 'individual',
        icon: '🛍️',
        estimatedDelivery: '1-2 jours'
      },
      { 
        id: 'board_game', 
        name: 'Jeu de société offert', 
        description: 'Le jeu de société de ton choix offert par l\'équipe !', 
        cost: 680, 
        category: 'Plaisirs food & cadeaux', 
        rarity: 'epic',
        type: 'individual',
        icon: '🎲',
        estimatedDelivery: '3-7 jours'
      },
      { 
        id: 'cinema_tickets', 
        name: '2 places de cinéma', 
        description: 'Deux entrées cinéma pour toi et un.e ami.e !', 
        cost: 1100, 
        category: 'Loisirs & sorties', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🎬',
        estimatedDelivery: '1 jour'
      },
      { 
        id: 'escape_game', 
        name: 'Place d\'escape game', 
        description: 'Une session d\'escape game avec l\'équipe ou tes amis !', 
        cost: 1200, 
        category: 'Loisirs & sorties', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🔓',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'discovery_activity', 
        name: 'Initiation/découverte', 
        description: 'Cours ou initiation à une nouvelle activité de ton choix !', 
        cost: 1350, 
        category: 'Loisirs & sorties', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🎪',
        estimatedDelivery: '1-2 semaines'
      },
      { 
        id: 'premium_card', 
        name: 'Carte cadeau premium', 
        description: 'Carte cadeau 100€ dans une enseigne premium de ton choix !', 
        cost: 6500, 
        category: 'Premium', 
        rarity: 'legendary',
        type: 'individual',
        icon: '💳',
        estimatedDelivery: '1-2 jours'
      },
      { 
        id: 'hotel_night', 
        name: '1 nuit d\'hôtel pour 2', 
        description: 'Une nuit dans un hôtel 4 étoiles pour deux personnes !', 
        cost: 8000, 
        category: 'Premium', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🏨',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'spa_day', 
        name: 'Journée spa', 
        description: 'Journée complète de détente dans un spa de luxe !', 
        cost: 12500, 
        category: 'Premium', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🧖‍♀️',
        estimatedDelivery: 'À planifier'
      }
    ],
    team: [
      { 
        id: 'team_breakfast', 
        name: 'Petit-déj équipe', 
        description: 'Petit-déjeuner continental pour toute l\'équipe !', 
        cost: 800, 
        category: 'Équipe', 
        rarity: 'uncommon',
        type: 'team',
        icon: '🥐',
        participants: 'Toute l\'équipe',
        duration: '1 matinée',
        estimatedDelivery: '2-3 jours'
      },
      { 
        id: 'game_afternoon', 
        name: 'Après-midi jeux', 
        description: 'Après-midi team building avec jeux et collations !', 
        cost: 1200, 
        category: 'Équipe', 
        rarity: 'rare',
        type: 'team',
        icon: '🎯',
        participants: 'Toute l\'équipe',
        duration: '1 après-midi',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'team_restaurant', 
        name: 'Repas restaurant', 
        description: 'Déjeuner ou dîner d\'équipe dans un bon restaurant !', 
        cost: 2500, 
        category: 'Équipe', 
        rarity: 'epic',
        type: 'team',
        icon: '🍽️',
        participants: 'Toute l\'équipe',
        duration: '2-3 heures',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'team_escape', 
        name: 'Escape game équipe', 
        description: 'Session d\'escape game suivie d\'un verre pour l\'équipe !', 
        cost: 3000, 
        category: 'Équipe', 
        rarity: 'epic',
        type: 'team',
        icon: '🔓',
        participants: 'Toute l\'équipe',
        duration: '1/2 journée',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'team_outing', 
        name: 'Sortie équipe premium', 
        description: 'Activité premium au choix de l\'équipe (karting, paintball, etc.)', 
        cost: 5000, 
        category: 'Équipe', 
        rarity: 'legendary',
        type: 'team',
        icon: '🏁',
        participants: 'Toute l\'équipe',
        duration: '1 journée',
        estimatedDelivery: '1-2 semaines'
      }
    ]
  }), []);

  // ✅ CHARGER L'HISTORIQUE DES DEMANDES
  const loadPurchaseHistory = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Écouter les demandes de récompenses de l'utilisateur en temps réel
      const rewardsQuery = query(
        collection(db, 'rewardRequests'),
        where('userId', '==', user.uid),
        orderBy('requestedAt', 'desc')
      );

      const unsubscribe = onSnapshot(rewardsQuery, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          requestedAt: doc.data().requestedAt?.toDate ? 
            doc.data().requestedAt.toDate() : new Date()
        }));

        setPurchaseHistory(history);
        
        // Séparer les demandes en attente
        const pending = history.filter(req => req.status === 'pending');
        setPendingRequests(pending);
        
        console.log('✅ [REWARDS] Historique Firebase chargé:', {
          total: history.length,
          pending: pending.length,
          approved: history.filter(req => req.status === 'approved').length,
          rejected: history.filter(req => req.status === 'rejected').length
        });
      }, (error) => {
        console.warn('⚠️ [REWARDS] Erreur écoute historique (continuons sans):', error);
      });

      return unsubscribe;
    } catch (error) {
      console.warn('⚠️ [REWARDS] Firebase indisponible, mode hors-ligne:', error);
    }
  }, [user?.uid]);

  // ✅ COULEURS SELON RARETÉ
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

  // ✅ NOUVELLE FONCTION - FAIRE UNE DEMANDE DE RÉCOMPENSE (SANS DÉDUIRE XP)
  const handlePurchaseRequest = async (reward) => {
    if (!user?.uid) {
      alert('🚨 Tu dois être connecté pour demander des récompenses !');
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
      ? `🎮 Tu veux faire une DEMANDE pour "${reward.name}" (${reward.cost} XP) ?\n\n⏳ Un admin devra valider ta demande avant que tes XP soient déduits.`
      : `👥 Demande Équipe ! Demander "${reward.name}" pour ${reward.cost} XP d'équipe ?\n\n⏳ Un admin devra valider avant utilisation des XP d'équipe.`;
    
    const confirmation = confirm(confirmMessage);
    if (!confirmation) return;

    setPurchasing(true);

    try {
      console.log('📝 [REWARDS] Création demande de récompense:', {
        userId: user.uid,
        rewardId: reward.id,
        rewardType: reward.type,
        cost: reward.cost,
        availablePointsBefore: availablePoints
      });

      // ✅ CRÉER SEULEMENT LA DEMANDE - PAS DE DÉDUCTION XP
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        userXP: availablePoints, // XP disponibles au moment de la demande
        
        // Détails de la récompense
        rewardId: reward.id,
        rewardName: reward.name,
        rewardDescription: reward.description,
        rewardCategory: reward.category,
        rewardType: reward.type,
        xpCost: reward.cost,
        estimatedDelivery: reward.estimatedDelivery,
        
        // Métadonnées de la demande
        status: 'pending',
        requestedAt: serverTimestamp(),
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
        
        // Informations supplémentaires
        participants: reward.participants || null,
        duration: reward.duration || null
      });

      alert(`✅ Demande envoyée ! 📝\n\n"${reward.name}" est en attente de validation.\n⏳ Tu recevras une notification dès qu'un admin aura traité ta demande.\n\n💡 Tes ${reward.cost} XP ne seront déduits qu'après validation.`);

    } catch (error) {
      console.error('❌ [REWARDS] Erreur création demande:', error);
      alert('❌ Erreur lors de l\'envoi de la demande. Réessaye !');
    } finally {
      setPurchasing(false);
    }
  };

  // ✅ RÉCOMPENSES FILTRÉES
  const filteredRewards = useMemo(() => {
    const allRewards = [...rewardsData.individual, ...rewardsData.team];
    
    return allRewards.filter(reward => {
      const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
      const matchesType = selectedType === 'all' || reward.type === selectedType;
      const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reward.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [rewardsData, selectedCategory, selectedType, searchTerm]);

  // ✅ CATÉGORIES ET TYPES DISPONIBLES
  const categories = useMemo(() => {
    const allRewards = [...rewardsData.individual, ...rewardsData.team];
    const cats = [...new Set(allRewards.map(r => r.category))];
    return ['all', ...cats];
  }, [rewardsData]);

  const types = ['all', 'individual', 'team'];

  // ✅ EFFETS
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadPurchaseHistory();
    }
  }, [isAuthenticated, user?.uid, loadPurchaseHistory]);

  // ✅ INTERFACE DE CHARGEMENT
  if (xpLoading) {
    return (
      <PremiumLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white">Chargement de la boutique...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      {/* En-tête avec stats */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              🛍️ Boutique de Récompenses
            </h1>
            <p className="text-gray-400">Échangez vos XP contre des récompenses personnelles !</p>
          </div>
          
          {/* Stats utilisateur */}
          <div className="flex gap-4 mt-4 lg:mt-0">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-2 text-center">
              <p className="text-white/80 text-sm">Mes XP</p>
              <p className="text-white text-xl font-bold">{userPoints}</p>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg px-4 py-2 text-center">
              <p className="text-white/80 text-sm">XP Équipe</p>
              <p className="text-white text-xl font-bold">{teamStats.totalXP}</p>
            </div>
          </div>
        </div>

        {/* Demandes en attente */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <h3 className="text-yellow-400 font-semibold">
                  {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
                </h3>
                <p className="text-yellow-200 text-sm">
                  Tes demandes sont en cours de validation par un admin
                </p>
              </div>
            </div>
            
            {/* Liste des demandes en attente */}
            <div className="mt-3 space-y-2">
              {pendingRequests.slice(0, 3).map(request => (
                <div key={request.id} className="flex items-center justify-between bg-yellow-900/20 rounded px-3 py-2">
                  <span className="text-yellow-100 text-sm">{request.rewardName}</span>
                  <span className="text-yellow-400 text-sm font-medium">{request.xpCost} XP</span>
                </div>
              ))}
              {pendingRequests.length > 3 && (
                <p className="text-yellow-300 text-sm">Et {pendingRequests.length - 3} autre{pendingRequests.length - 3 > 1 ? 's' : ''}...</p>
              )}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes catégories' : cat}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tous types' : 
                   type === 'individual' ? 'Individuelles' : 'Équipe'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grille des récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredRewards.map(reward => {
          const canAfford = reward.type === 'individual' 
            ? userPoints >= reward.cost 
            : teamStats.totalXP >= reward.cost;
          
          const isAlreadyRequested = pendingRequests.some(req => req.rewardId === reward.id);

          return (
            <motion.div
              key={reward.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300"
            >
              {/* En-tête avec rareté */}
              <div className={`h-32 bg-gradient-to-br ${getRarityColor(reward.rarity)} p-4 relative`}>
                <div className="text-white text-4xl mb-2">{reward.icon}</div>
                <div className="absolute top-2 right-2">
                  {reward.type === 'team' ? (
                    <Users className="w-5 h-5 text-white/80" />
                  ) : (
                    <Star className="w-5 h-5 text-white/80" />
                  )}
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-xs text-white/80 bg-black/20 px-2 py-1 rounded">
                    {reward.rarity}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{reward.name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{reward.description}</p>
                
                {/* Détails équipe */}
                {reward.type === 'team' && (
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>👥 {reward.participants}</div>
                    <div>⏱️ {reward.duration}</div>
                  </div>
                )}

                {/* Prix et catégorie */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                    {reward.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium">{reward.cost}</span>
                  </div>
                </div>

                {/* Bouton d'achat */}
                <button
                  onClick={() => handlePurchaseRequest(reward)}
                  disabled={!canAfford || purchasing || isAlreadyRequested}
                  className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                    isAlreadyRequested
                      ? 'bg-yellow-600/20 text-yellow-400 cursor-not-allowed'
                      : canAfford && !purchasing
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                    ${purchasing ? 'opacity-50' : ''}
                  `}
                >
                  {purchasing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : isAlreadyRequested ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>En attente</span>
                    </>
                  ) : canAfford ? (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Demander</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>XP insuffisants</span>
                    </>
                  )}
                </button>
                
                {/* Livraison estimée */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  📦 {reward.estimatedDelivery}
                </div>
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

      {/* Historique des achats récents */}
      {purchaseHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">📋 Mes Demandes Récentes</h2>
          <div className="grid gap-4">
            {purchaseHistory.slice(0, 5).map(request => (
              <div key={request.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{request.rewardName}</h3>
                    <p className="text-gray-400 text-sm">{request.xpCost} XP</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded text-sm font-medium ${
                      request.status === 'approved' 
                        ? 'bg-green-600/20 text-green-400'
                        : request.status === 'rejected'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {request.status === 'approved' ? '✅ Approuvée' :
                       request.status === 'rejected' ? '❌ Rejetée' : '⏳ En attente'}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {request.requestedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {request.rejectionReason && (
                  <div className="mt-2 text-red-400 text-sm bg-red-900/20 rounded px-2 py-1">
                    <strong>Motif de rejet:</strong> {request.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
