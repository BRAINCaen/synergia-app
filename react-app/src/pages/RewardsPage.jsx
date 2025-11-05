// ==========================================
// 📁 react-app/src/pages/Rewards.jsx
// PAGE RÉCOMPENSES AVEC ONGLETS INDIVIDUELLES + ÉQUIPE RESTAURÉS
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Filter, Star, Gift, Coins, Users, Target, 
  Plus, Edit2, Trash2, Settings, AlertCircle, Check, X, 
  ShoppingCart, Clock, User, Calendar, TrendingUp, Crown,
  Shield, Eye, EyeOff, Package, Zap, Heart, Coffee, Gamepad2,
  MapPin, Camera, Music, Book, Palette, Dumbbell, ChefHat
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, query, orderBy, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS RÉCOMPENSES
  const [userRewards, setUserRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [teamTotalXP, setTeamTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('individual');

  // 🛡️ ÉTATS ADMIN
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // 📝 FORMULAIRE RÉCOMPENSE
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'individual',
    category: 'Mini-plaisirs',
    xpCost: 100,
    icon: '🎁',
    isAvailable: true
  });

  // ==========================================
  // 📊 CATALOGUES DE RÉCOMPENSES
  // ==========================================

  const INDIVIDUAL_REWARDS_CATALOG = [
    // Mini-plaisirs (50-100 XP)
    { id: 'snack', name: 'Goûter surprise', description: 'Un goûter de ton choix', xpCost: 50, icon: '🍪', category: 'Mini-plaisirs', type: 'individual' },
    { id: 'coffee', name: 'Café premium', description: 'Un café de spécialité', xpCost: 75, icon: '☕', category: 'Mini-plaisirs', type: 'individual' },
    { id: 'tea', name: 'Thé premium', description: 'Une sélection de thés fins', xpCost: 80, icon: '🍵', category: 'Mini-plaisirs', type: 'individual' },
    
    // Petits avantages (100-200 XP)
    { id: 'earlyLeave', name: 'Sortie anticipée', description: 'Partir 30 min plus tôt', xpCost: 150, icon: '🏃', category: 'Petits avantages', type: 'individual' },
    { id: 'parking', name: 'Place de parking', description: 'Place réservée pour une semaine', xpCost: 180, icon: '🅿️', category: 'Petits avantages', type: 'individual' },
    
    // Plaisirs utiles (200-400 XP)
    { id: 'headphones', name: 'Écouteurs', description: 'Écouteurs sans fil', xpCost: 300, icon: '🎧', category: 'Plaisirs utiles', type: 'individual' },
    { id: 'powerbank', name: 'Batterie externe', description: 'Power bank haute capacité', xpCost: 250, icon: '🔋', category: 'Plaisirs utiles', type: 'individual' },
    
    // Plaisirs food & cadeaux (400-700 XP)
    { id: 'restaurant', name: 'Restaurant', description: 'Bon pour un restaurant', xpCost: 500, icon: '🍽️', category: 'Food & cadeaux', type: 'individual' },
    { id: 'giftCard', name: 'Carte cadeau 30€', description: 'Utilisable en magasin', xpCost: 600, icon: '🎁', category: 'Food & cadeaux', type: 'individual' },
    
    // Bien-être & confort (700-1000 XP)
    { id: 'massage', name: 'Massage', description: 'Séance de massage professionnel', xpCost: 800, icon: '💆', category: 'Bien-être', type: 'individual' },
    { id: 'ergonomic', name: 'Accessoire ergonomique', description: 'Fauteuil ou coussin ergonomique', xpCost: 900, icon: '🪑', category: 'Bien-être', type: 'individual' },
    
    // Loisirs & sorties (1000-1500 XP)
    { id: 'cinema', name: 'Pack cinéma', description: '2 places de cinéma + popcorn', xpCost: 1200, icon: '🎬', category: 'Loisirs', type: 'individual' },
    { id: 'concert', name: 'Concert', description: 'Billet pour un concert', xpCost: 1400, icon: '🎵', category: 'Loisirs', type: 'individual' },
    
    // Lifestyle & bonus (1500-2500 XP)
    { id: 'gadget', name: 'Gadget tech', description: 'Objet technologique au choix', xpCost: 2000, icon: '📺', category: 'Lifestyle', type: 'individual' },
    { id: 'sport', name: 'Équipement sportif', description: 'Matériel pour ton sport préféré', xpCost: 2300, icon: '⚽', category: 'Lifestyle', type: 'individual' },
    
    // Avantages temps offert (2500-4000 XP)
    { id: 'halfDay', name: 'Demi-journée congé', description: 'Une demi-journée de repos supplémentaire', xpCost: 2800, icon: '🌅', category: 'Temps offert', type: 'individual' },
    { id: 'fullDay', name: 'Jour de congé bonus', description: 'Un jour de congé supplémentaire', xpCost: 3500, icon: '🏖️', category: 'Temps offert', type: 'individual' },
    
    // Grands plaisirs (4000-6000 XP)
    { id: 'weekend', name: 'Week-end découverte', description: 'Un week-end dans un lieu touristique', xpCost: 5000, icon: '🗺️', category: 'Grands plaisirs', type: 'individual' },
    { id: 'spa', name: 'Journée spa', description: 'Une journée complète dans un spa', xpCost: 4500, icon: '🧖', category: 'Grands plaisirs', type: 'individual' },
    
    // Premium (6000+ XP)
    { id: 'vacation', name: 'Semaine de vacances offerte', description: 'Une semaine de vacances payée', xpCost: 12500, icon: '✈️', category: 'Premium', type: 'individual' },
    { id: 'laptop', name: 'Ordinateur portable', description: 'Un laptop pour usage personnel', xpCost: 15000, icon: '💻', category: 'Premium', type: 'individual' }
  ];

  const TEAM_REWARDS_CATALOG = [
    { id: 'teamSnack', name: 'Goûter d\'équipe', description: 'Goûter pour toute l\'équipe', xpCost: 500, icon: '🍰', category: 'Team', type: 'team' },
    { id: 'teamLunch', name: 'Déjeuner d\'équipe', description: 'Restaurant pour l\'équipe', xpCost: 1500, icon: '🍴', category: 'Team', type: 'team' },
    { id: 'teamActivity', name: 'Activité team building', description: 'Sortie ou activité collective', xpCost: 3000, icon: '🎯', category: 'Team', type: 'team' },
    { id: 'teamOuting', name: 'Sortie d\'équipe', description: 'Journée découverte en équipe', xpCost: 5000, icon: '🚀', category: 'Team', type: 'team' },
    { id: 'teamWeekend', name: 'Week-end d\'équipe', description: 'Week-end team building complet', xpCost: 10000, icon: '🏕️', category: 'Team', type: 'team' }
  ];

  // ==========================================
  // 🔥 CHARGEMENT DES DONNÉES
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Charger le profil utilisateur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }

        // Calculer le XP total d'équipe
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let totalXP = 0;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          totalXP += userData.xp || 0;
        });
        setTeamTotalXP(totalXP);

        // Charger les demandes de récompenses
        const requestsQuery = query(
          collection(db, 'rewardRequests'),
          where('userId', '==', user.uid),
          orderBy('requestedAt', 'desc')
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        setUserRewards(requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        console.log('✅ Données chargées');
      } catch (error) {
        console.error('❌ Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user]);

  // ==========================================
  // 🎁 DEMANDER UNE RÉCOMPENSE
  // ==========================================

  const handleRequestReward = async (reward) => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    const userXP = userProfile?.xp || 0;
    const requiredXP = reward.type === 'team' ? teamTotalXP : userXP;

    if (requiredXP < reward.xpCost) {
      alert(`XP insuffisants ! Il vous manque ${reward.xpCost - requiredXP} XP.`);
      return;
    }

    if (!confirm(`Demander ${reward.name} pour ${reward.xpCost} XP ?`)) return;

    try {
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardIcon: reward.icon,
        xpCost: reward.xpCost,
        type: reward.type,
        status: 'pending',
        requestedAt: serverTimestamp()
      });

      alert('✅ Demande envoyée ! Un admin va la valider.');
    } catch (error) {
      console.error('❌ Erreur demande:', error);
      alert('Erreur lors de la demande');
    }
  };

  // ==========================================
  // 🔍 FILTRAGE DES RÉCOMPENSES
  // ==========================================

  const filteredRewards = useMemo(() => {
    let rewards = activeTab === 'individual' ? INDIVIDUAL_REWARDS_CATALOG : TEAM_REWARDS_CATALOG;

    if (searchTerm) {
      rewards = rewards.filter(reward => 
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      rewards = rewards.filter(reward => reward.category === filterCategory);
    }

    return rewards;
  }, [searchTerm, filterCategory, activeTab]);

  // ==========================================
  // 🎨 COULEUR PAR COÛT XP
  // ==========================================

  const getRewardColor = (reward) => {
    if (reward.type === 'team') return 'from-purple-600 to-indigo-600';
    
    const xp = reward.xpCost;
    if (xp <= 100) return 'from-green-600 to-emerald-600';
    if (xp <= 200) return 'from-blue-600 to-cyan-600';
    if (xp <= 400) return 'from-yellow-600 to-orange-600';
    if (xp <= 700) return 'from-red-600 to-pink-600';
    if (xp <= 1000) return 'from-purple-600 to-violet-600';
    if (xp <= 1500) return 'from-indigo-600 to-blue-600';
    if (xp <= 2500) return 'from-pink-600 to-rose-600';
    if (xp <= 4000) return 'from-orange-600 to-red-600';
    if (xp <= 6000) return 'from-violet-600 to-purple-600';
    return 'from-yellow-500 to-amber-500';
  };

  // ==========================================
  // 🎨 RENDU
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des récompenses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userXP = userProfile?.xp || 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 🎯 EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Gift className="w-10 h-10 text-purple-500" />
            Boutique de Récompenses
          </h1>
          <p className="text-gray-600">
            Dépensez vos XP pour obtenir des avantages exclusifs !
          </p>
        </div>

        {/* 📊 STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-blue-600 font-semibold">Mes XP</p>
                <p className="text-2xl font-bold text-blue-800">{userXP}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-purple-600 font-semibold">XP d'Équipe</p>
                <p className="text-2xl font-bold text-purple-800">{teamTotalXP}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-green-600 font-semibold">Demandes en cours</p>
                <p className="text-2xl font-bold text-green-800">{userRewards.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🛡️ BOUTON ADMIN */}
        {userIsAdmin && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                showAdminPanel 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              {showAdminPanel ? 'Fermer Panel Admin' : 'Ouvrir Panel Admin'}
            </button>
          </div>
        )}

        {/* 🛡️ PANEL ADMIN */}
        {userIsAdmin && showAdminPanel && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Panel Administration Récompenses
            </h2>
            <p className="text-gray-600">
              Les demandes de récompenses en attente apparaissent ici pour validation.
            </p>
          </div>
        )}

        {/* 🎯 ONGLETS INDIVIDUELLES / ÉQUIPE */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'individual'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <User className="w-5 h-5" />
            Récompenses Individuelles
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
              {INDIVIDUAL_REWARDS_CATALOG.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Users className="w-5 h-5" />
            Récompenses d'Équipe
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
              {TEAM_REWARDS_CATALOG.length}
            </span>
          </button>
        </div>

        {/* 🔍 BARRE DE RECHERCHE */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {activeTab === 'individual' ? (
                <>
                  <option value="Mini-plaisirs">Mini-plaisirs</option>
                  <option value="Petits avantages">Petits avantages</option>
                  <option value="Plaisirs utiles">Plaisirs utiles</option>
                  <option value="Food & cadeaux">Food & cadeaux</option>
                  <option value="Bien-être">Bien-être</option>
                  <option value="Loisirs">Loisirs</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Temps offert">Temps offert</option>
                  <option value="Grands plaisirs">Grands plaisirs</option>
                  <option value="Premium">Premium</option>
                </>
              ) : (
                <option value="Team">Team</option>
              )}
            </select>
          </div>
        </div>

        {/* 🏆 GRILLE DES RÉCOMPENSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const requiredXP = reward.type === 'team' ? teamTotalXP : userXP;
            const canAfford = requiredXP >= reward.xpCost;
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                  canAfford ? 'hover:shadow-2xl hover:scale-105' : 'opacity-70'
                }`}
              >
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-r ${getRewardColor(reward)} flex items-center justify-center`}>
                  <span className="text-6xl">{reward.icon}</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {reward.category}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">{reward.xpCost} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestReward(reward)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      canAfford
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Demander' : 'XP insuffisants'}
                  </button>
                </div>

                {/* Badge Type */}
                {reward.type === 'team' && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Équipe
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune récompense trouvée</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RewardsPage;
