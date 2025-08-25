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

// Firebase - IMPORT CORRIGÉ
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';

// Layout
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';

const RewardsPage = () => {
  // ✅ ÉTATS ET HOOKS
  const { user, isAuthenticated } = useAuthStore();
  const { userPoints, teamStats, loading: xpLoading } = useUnifiedXP();
  
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
        cost: 200, 
        category: 'Gros avantages', 
        rarity: 'rare',
        type: 'individual',
        icon: '🌟',
        estimatedDelivery: 'À planifier'
      },
      { 
        id: 'workspace_personalization', 
        name: 'Personnalisation workspace', 
        description: 'Budget pour aménager ton espace de travail comme tu veux !', 
        cost: 300, 
        category: 'Gros avantages', 
        rarity: 'epic',
        type: 'individual',
        icon: '🏢',
        estimatedDelivery: '1-2 semaines'
      },
      { 
        id: 'creative_day', 
        name: 'Creative Day personnel', 
        description: 'Une journée entière dédiée à TON projet perso pendant les heures de travail', 
        cost: 500, 
        category: 'Mega avantages', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🎨',
        estimatedDelivery: 'À planifier'
      }
    ],
    team: [
      { 
        id: 'team_coffee_session', 
        name: 'Session Café équipe', 
        description: 'Petit-déj ou pause café premium pour toute l\'équipe', 
        cost: 150, 
        category: 'Team bonding', 
        rarity: 'uncommon',
        type: 'team',
        icon: '☕',
        estimatedDelivery: '1-2 jours'
      },
      { 
        id: 'pizza_party', 
        name: 'Pizza Party', 
        description: 'Repas pizza pour célébrer un milestone avec l\'équipe', 
        cost: 250, 
        category: 'Team bonding', 
        rarity: 'rare',
        type: 'team',
        icon: '🍕',
        estimatedDelivery: '3-4 jours'
      },
      { 
        id: 'escape_game', 
        name: 'Escape Game équipe', 
        description: 'Activité team building dans un escape game local', 
        cost: 400, 
        category: 'Team building', 
        rarity: 'epic',
        type: 'team',
        icon: '🗝️',
        estimatedDelivery: '1-2 semaines'
      },
      { 
        id: 'team_outing', 
        name: 'Sortie équipe premium', 
        description: 'Journée complète d\'activités fun pour resserrer les liens', 
        cost: 600, 
        category: 'Team building', 
        rarity: 'legendary',
        type: 'team',
        icon: '🎯',
        estimatedDelivery: '2-3 semaines'
      }
    ]
  }), []);

  // ✅ LOGIQUE DE FILTRAGES
  const allRewards = useMemo(() => [
    ...rewardsData.individual,
    ...rewardsData.team
  ], [rewardsData]);

  const filteredRewards = useMemo(() => {
    let filtered = allRewards;

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(reward => reward.type === selectedType);
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(reward => reward.category === selectedCategory);
    }

    // Filtre par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(reward => 
        reward.name.toLowerCase().includes(term) ||
        reward.description.toLowerCase().includes(term) ||
        reward.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allRewards, selectedType, selectedCategory, searchTerm]);

  // ✅ RÉCUPÉRER L'HISTORIQUE DES ACHATS
  useEffect(() => {
    if (!user?.uid) return;

    console.log('📊 Chargement historique récompenses utilisateur:', user.uid);

    const purchasesQuery = query(
      collection(db, 'rewardPurchases'),
      where('userId', '==', user.uid),
      orderBy('purchasedAt', 'desc')
    );

    const unsubscribe = onSnapshot(purchasesQuery, (snapshot) => {
      const purchases = [];
      snapshot.forEach(doc => {
        purchases.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ Historique récompenses chargé:', purchases.length, 'achats');
      setPurchaseHistory(purchases);
    }, (error) => {
      console.error('❌ Erreur chargement historique récompenses:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ RÉCUPÉRER LES DEMANDES EN ATTENTE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('⏳ Chargement demandes en attente:', user.uid);

    const requestsQuery = query(
      collection(db, 'rewardRequests'),
      where('userId', '==', user.uid),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = [];
      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ Demandes en attente chargées:', requests.length);
      setPendingRequests(requests);
    }, (error) => {
      console.error('❌ Erreur chargement demandes en attente:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ FONCTION D'ACHAT/DEMANDE
  const handlePurchaseReward = useCallback(async (reward) => {
    if (!user?.uid || purchasing) return;
    
    // Vérifier si l'utilisateur a suffisamment de points
    const currentPoints = userPoints?.current || 0;
    if (currentPoints < reward.cost) {
      alert(`Vous n'avez pas suffisamment de points ! Il vous manque ${reward.cost - currentPoints} points.`);
      return;
    }

    // Vérifier s'il n'y a pas déjà une demande en cours pour cette récompense
    const existingRequest = pendingRequests.find(req => req.rewardId === reward.id);
    if (existingRequest) {
      alert(`Vous avez déjà une demande en cours pour "${reward.name}". Veuillez attendre l'approbation.`);
      return;
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir demander "${reward.name}" pour ${reward.cost} points ?`
    );

    if (!confirmed) return;

    setPurchasing(true);

    try {
      console.log('🛒 Création demande récompense:', reward.name);

      // Créer une demande de récompense (à valider par un admin)
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Utilisateur',
        rewardId: reward.id,
        rewardName: reward.name,
        rewardDescription: reward.description,
        cost: reward.cost,
        category: reward.category,
        type: reward.type,
        icon: reward.icon,
        status: 'pending',
        requestedAt: serverTimestamp(),
        estimatedDelivery: reward.estimatedDelivery
      });

      console.log('✅ Demande créée avec succès');
      alert(`Demande créée ! "${reward.name}" sera validée par un administrateur.`);

    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      alert('Erreur lors de la création de la demande: ' + error.message);
    } finally {
      setPurchasing(false);
    }
  }, [user, userPoints.current, purchasing, pendingRequests]);

  // ✅ CALCUL STATISTIQUES
  const stats = useMemo(() => {
    const totalSpent = purchaseHistory.reduce((total, purchase) => total + (purchase.cost || 0), 0);
    const pendingCost = pendingRequests.reduce((total, request) => total + (request.cost || 0), 0);

    return [
      {
        title: 'Points actuels',
        value: userPoints?.current || 0,
        change: userPoints?.change || 0,
        icon: Star,
        color: 'text-yellow-400'
      },
      {
        title: 'Points dépensés',
        value: totalSpent,
        change: 0,
        icon: ShoppingBag,
        color: 'text-purple-400'
      },
      {
        title: 'Demandes en attente',
        value: pendingRequests.length,
        subValue: `${pendingCost} pts`,
        icon: Clock,
        color: 'text-orange-400'
      },
      {
        title: 'Récompenses obtenues',
        value: purchaseHistory.length,
        change: 0,
        icon: Gift,
        color: 'text-green-400'
      }
    ];
  }, [userPoints, purchaseHistory, pendingRequests]);

  // ✅ CATÉGORIES UNIQUES POUR FILTRAGE
  const categories = useMemo(() => {
    const categorySet = new Set(allRewards.map(reward => reward.category));
    return ['all', ...Array.from(categorySet)];
  }, [allRewards]);

  // ✅ CONFIGURATION COULEURS RARETÉ
  const rarityColors = {
    common: 'border-gray-400 text-gray-400',
    uncommon: 'border-green-400 text-green-400',
    rare: 'border-blue-400 text-blue-400', 
    epic: 'border-purple-400 text-purple-400',
    legendary: 'border-yellow-400 text-yellow-400'
  };

  // ✅ VÉRIFICATIONS DE SÉCURITÉ
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Connectez-vous pour accéder aux récompenses</p>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout
      title="Récompenses"
      subtitle="Échangez vos points contre des récompenses exclusives"
      icon={Gift}
      showStats={true}
      stats={stats}
      headerActions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      }
    >
      {/* ✅ SECTION FILTRES */}
      <motion.div 
        className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une récompense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-4 flex-wrap">
            {/* Filtre par type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous types</option>
              <option value="individual">Récompenses individuelles</option>
              <option value="team">Récompenses équipe</option>
            </select>

            {/* Filtre par catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Toutes catégories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ✅ GRILLE DES RÉCOMPENSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRewards.map((reward, index) => {
            const currentPoints = userPoints?.current || 0;
            const canAfford = currentPoints >= reward.cost;
            const isPending = pendingRequests.some(req => req.rewardId === reward.id);
            
            return (
              <motion.div
                key={reward.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${rarityColors[reward.rarity]} hover:border-current`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{reward.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{reward.name}</h3>
                      <p className={`text-sm font-medium ${rarityColors[reward.rarity]}`}>
                        {reward.rarity} • {reward.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4">{reward.description}</p>

                {/* Métadonnées */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{reward.type === 'individual' ? 'Individuel' : 'Équipe'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Livraison:</span>
                    <span className="text-white">{reward.estimatedDelivery}</span>
                  </div>
                </div>

                {/* Prix et bouton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-bold">{reward.cost}</span>
                    <span className="text-gray-400 text-sm">points</span>
                  </div>
                  
                  <button
                    onClick={() => handlePurchaseReward(reward)}
                    disabled={!canAfford || purchasing || isPending}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isPending
                        ? 'bg-orange-600/20 text-orange-400 border border-orange-400/30 cursor-not-allowed'
                        : canAfford && !purchasing
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {purchasing ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Traitement...
                      </div>
                    ) : isPending ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        En attente
                      </div>
                    ) : canAfford ? (
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        Demander
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Insuffisant
                      </div>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Message si aucune récompense */}
      {filteredRewards.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl text-white font-semibold mb-2">Aucune récompense trouvée</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Aucune récompense ne correspond aux filtres sélectionnés'}
          </p>
        </motion.div>
      )}

      {/* ✅ SECTION DEMANDES EN ATTENTE */}
      {pendingRequests.length > 0 && (
        <motion.div
          className="mt-12 bg-orange-900/20 border border-orange-400/30 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-orange-400">Demandes en cours de validation</h2>
          </div>
          
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{request.icon}</span>
                  <div>
                    <p className="text-white font-medium">{request.rewardName}</p>
                    <p className="text-gray-400 text-sm">{request.cost} points • {request.requestedAt?.toDate?.()?.toLocaleDateString?.() || 'Date inconnue'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-orange-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">En attente</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ✅ SECTION HISTORIQUE */}
      {purchaseHistory.length > 0 && (
        <motion.div
          className="mt-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Historique des récompenses</h2>
          </div>
          
          <div className="space-y-3">
            {purchaseHistory.slice(0, 5).map(purchase => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{purchase.icon || '🎁'}</span>
                  <div>
                    <p className="text-white font-medium">{purchase.rewardName}</p>
                    <p className="text-gray-400 text-sm">{purchase.cost} points • {purchase.purchasedAt?.toDate?.()?.toLocaleDateString?.() || 'Date inconnue'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Obtenu</span>
                </div>
              </div>
            ))}
          </div>
          
          {purchaseHistory.length > 5 && (
            <p className="text-center text-gray-400 text-sm mt-4">
              Et {purchaseHistory.length - 5} autres récompenses...
            </p>
          )}
        </motion.div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
