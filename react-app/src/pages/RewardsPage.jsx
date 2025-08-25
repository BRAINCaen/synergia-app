// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES CORRIGÉE - AUCUNE ERREUR UNDEFINED
// ==========================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Zap, 
  Crown, 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Star, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  User,
  Heart,
  Target
} from 'lucide-react';

// Layout premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

// Firebase
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🛍️ PAGE RÉCOMPENSES PRINCIPALE
 */
const RewardsPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { userStats, loading: xpLoading } = useGameStore();

  // États principaux
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState('shop');

  // ✅ DONNÉES SÉCURISÉES - INITIALISATION AVEC FALLBACKS
  const userPoints = userStats?.totalXp || 0;
  const userLevel = userStats?.level || 1;

  // Stats d'équipe simulées (en attendant l'intégration complète)
  const teamStats = {
    totalXP: 5000, // XP d'équipe simulée
    members: 8
  };

  // ✅ DONNÉES RÉCOMPENSES STATIQUES SÉCURISÉES
  const rewardsData = useMemo(() => ({
    individual: [
      { 
        id: 'coffee_voucher', 
        name: 'Bon café premium', 
        description: 'Un délicieux café premium offert par l\'entreprise', 
        cost: 50, 
        category: 'Mini-plaisirs', 
        rarity: 'common',
        type: 'individual',
        icon: '☕',
        availability: 'Immédiat',
        estimatedDelivery: 'Instantané'
      },
      { 
        id: 'snack_box', 
        name: 'Box snacks healthy', 
        description: 'Sélection de snacks sains et gourmands', 
        cost: 120, 
        category: 'Mini-plaisirs', 
        rarity: 'common',
        type: 'individual',
        icon: '🍎',
        availability: 'Stock limité',
        estimatedDelivery: '24h'
      },
      { 
        id: 'lunch_voucher', 
        name: 'Déjeuner restaurant', 
        description: 'Repas dans un restaurant partenaire au choix', 
        cost: 300, 
        category: 'Plaisirs food', 
        rarity: 'uncommon',
        type: 'individual',
        icon: '🍽️',
        availability: 'Disponible',
        estimatedDelivery: 'À réserver'
      },
      { 
        id: 'massage_session', 
        name: 'Séance massage 30min', 
        description: 'Massage relaxant de 30 minutes par un professionnel', 
        cost: 800, 
        category: 'Bien-être', 
        rarity: 'rare',
        type: 'individual',
        icon: '💆',
        availability: 'Sur RDV',
        estimatedDelivery: '1 semaine'
      },
      { 
        id: 'cinema_tickets', 
        name: 'Places cinéma premium', 
        description: '2 places de cinéma dans une salle premium', 
        cost: 600, 
        category: 'Loisirs', 
        rarity: 'rare',
        type: 'individual',
        icon: '🎬',
        availability: 'Disponible',
        estimatedDelivery: '48h'
      },
      { 
        id: 'spa_day', 
        name: 'Journée SPA complète', 
        description: 'Accès SPA avec soins et détente pour une journée', 
        cost: 2000, 
        category: 'Premium', 
        rarity: 'epic',
        type: 'individual',
        icon: '🧘',
        availability: 'Rare',
        estimatedDelivery: '2 semaines'
      },
      { 
        id: 'weekend_getaway', 
        name: 'Weekend détente', 
        description: 'Weekend dans un hôtel 4 étoiles avec petit-déjeuner', 
        cost: 4000, 
        category: 'Premium', 
        rarity: 'legendary',
        type: 'individual',
        icon: '🏨',
        availability: 'Très rare',
        estimatedDelivery: '1 mois'
      }
    ],
    team: [
      { 
        id: 'team_breakfast', 
        name: 'Petit-déjeuner équipe', 
        description: 'Petit-déjeuner convivial pour toute l\'équipe', 
        cost: 800, 
        category: 'Équipe', 
        rarity: 'uncommon',
        type: 'team',
        icon: '🥐',
        participants: 'Toute l\'équipe',
        duration: '1h30',
        estimatedDelivery: '48h'
      },
      { 
        id: 'team_lunch', 
        name: 'Déjeuner d\'équipe', 
        description: 'Repas dans un restaurant pour célébrer les succès collectifs', 
        cost: 1500, 
        category: 'Équipe', 
        rarity: 'rare',
        type: 'team',
        icon: '🍕',
        participants: 'Toute l\'équipe',
        duration: '2h',
        estimatedDelivery: '1 semaine'
      },
      { 
        id: 'team_afterwork', 
        name: 'Afterwork premium', 
        description: 'Soirée détente avec cocktails et animations', 
        cost: 3000, 
        category: 'Équipe', 
        rarity: 'epic',
        type: 'team',
        icon: '🍸',
        participants: 'Toute l\'équipe',
        duration: '3h',
        estimatedDelivery: 'À planifier'
      }
    ]
  }), []);

  // ✅ CHARGER L'HISTORIQUE DES DEMANDES
  const loadPurchaseHistory = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Écouter les demandes de récompenses en temps réel
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
        
        console.log('✅ Historique récompenses chargé:', {
          total: history.length,
          pending: pending.length
        });
      }, (error) => {
        console.warn('⚠️ Erreur écoute historique:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.warn('⚠️ Firebase indisponible:', error);
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

  // ✅ FAIRE UNE DEMANDE DE RÉCOMPENSE
  const handlePurchaseRequest = async (reward) => {
    if (!user?.uid) {
      alert('🚨 Tu dois être connecté pour demander des récompenses !');
      return;
    }

    const requiredPoints = reward.cost;
    const availablePoints = reward.type === 'individual' ? userPoints : teamStats.totalXP;

    if (availablePoints < requiredPoints) {
      alert(`❌ XP insuffisants ! Tu as ${availablePoints} XP mais il faut ${requiredPoints} XP.`);
      return;
    }

    // Vérifier si déjà demandé
    const alreadyRequested = pendingRequests.some(req => req.rewardId === reward.id);
    if (alreadyRequested) {
      alert('⏳ Tu as déjà une demande en cours pour cette récompense !');
      return;
    }

    setPurchasing(true);

    try {
      console.log('🎁 Envoi demande récompense:', reward.name);

      // Créer la demande dans Firebase
      const rewardRequest = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardCost: reward.cost,
        rewardType: reward.type,
        userXP: availablePoints,
        status: 'pending',
        requestedAt: serverTimestamp(),
        metadata: {
          userLevel: userLevel,
          rewardCategory: reward.category,
          rewardRarity: reward.rarity
        }
      };

      await addDoc(collection(db, 'rewardRequests'), rewardRequest);

      alert(`✅ Demande envoyée !\n\n"${reward.name}" est en attente de validation.\n⏳ Tu recevras une notification dès qu'un admin aura traité ta demande.`);

    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      alert('❌ Erreur lors de l\'envoi. Réessaye !');
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

  // ✅ STATS POUR L'HEADER
  const headerStats = [
    {
      title: "XP Disponibles",
      value: userPoints,
      icon: Zap,
      color: "yellow"
    },
    {
      title: "Niveau",
      value: userLevel,
      icon: Crown,
      color: "purple"
    },
    {
      title: "Demandes en cours",
      value: pendingRequests.length,
      icon: Clock,
      color: "blue"
    }
  ];

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
    <PremiumLayout
      title="Boutique Récompenses"
      subtitle="Échangez vos XP contre des récompenses !"
      icon={Gift}
      showStats={true}
      stats={headerStats}
    >
      {/* Onglets de navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
        {[
          { id: 'shop', label: 'Boutique', icon: Gift },
          { id: 'history', label: 'Historique', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'shop' && (
        <div className="space-y-8">
          {/* Filtres de recherche */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PremiumSearchBar
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Toutes catégories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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

          {/* Grille des récompenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
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
                        } ${purchasing ? 'opacity-50' : ''}`}
                      >
                        {purchasing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Envoi...</span>
                          </>
                        ) : isAlreadyRequested ? (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>En attente</span>
                          </>
                        ) : canAfford ? (
                          <>
                            <Gift className="w-4 h-4" />
                            <span>Demander</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>XP insuffisants</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucune récompense trouvée</h3>
              <p className="text-gray-500">Modifiez vos filtres pour voir plus de récompenses</p>
            </div>
          )}
        </div>
      )}

      {/* Onglet Historique */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <PremiumCard>
            <h2 className="text-2xl font-bold text-white mb-6">Historique des demandes</h2>
            
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Aucune demande</h3>
                <p className="text-gray-500">Tes demandes de récompenses apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{request.rewardName}</h4>
                        <p className="text-sm text-gray-400">{request.rewardCost} XP</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
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
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
