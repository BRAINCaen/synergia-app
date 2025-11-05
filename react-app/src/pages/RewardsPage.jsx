// ==========================================
// 📁 react-app/src/pages/Rewards.jsx
// PAGE RÉCOMPENSES - CHARTE GRAPHIQUE DARK MODE + ADMIN COMPLET
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Filter, Star, Gift, Coins, Users, Target, 
  Plus, Edit2, Trash2, Settings, AlertCircle, Check, X, 
  ShoppingCart, Clock, User, Calendar, TrendingUp, Crown,
  Shield, Eye, EyeOff, Package, Zap, Heart, Coffee, Gamepad2,
  MapPin, Camera, Music, Book, Palette, Dumbbell, ChefHat, Save
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

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
  // 📊 CATALOGUES DE RÉCOMPENSES PAR DÉFAUT
  // ==========================================

  const DEFAULT_INDIVIDUAL_REWARDS = [
    // Mini-plaisirs (50-100 XP)
    { id: 'snack', name: 'Goûter surprise', description: 'Un goûter de ton choix', xpCost: 50, icon: '🍪', category: 'Mini-plaisirs', type: 'individual', isDefault: true },
    { id: 'coffee', name: 'Café premium', description: 'Un café de spécialité', xpCost: 75, icon: '☕', category: 'Mini-plaisirs', type: 'individual', isDefault: true },
    { id: 'tea', name: 'Thé premium', description: 'Une sélection de thés fins', xpCost: 80, icon: '🍵', category: 'Mini-plaisirs', type: 'individual', isDefault: true },
    
    // Petits avantages (100-200 XP)
    { id: 'earlyLeave', name: 'Sortie anticipée', description: 'Partir 30 min plus tôt', xpCost: 150, icon: '🏃', category: 'Petits avantages', type: 'individual', isDefault: true },
    { id: 'parking', name: 'Place de parking', description: 'Place réservée pour une semaine', xpCost: 180, icon: '🅿️', category: 'Petits avantages', type: 'individual', isDefault: true },
    
    // Plaisirs utiles (200-400 XP)
    { id: 'headphones', name: 'Écouteurs', description: 'Écouteurs sans fil', xpCost: 300, icon: '🎧', category: 'Plaisirs utiles', type: 'individual', isDefault: true },
    { id: 'powerbank', name: 'Batterie externe', description: 'Power bank haute capacité', xpCost: 250, icon: '🔋', category: 'Plaisirs utiles', type: 'individual', isDefault: true },
    
    // Food & cadeaux (400-700 XP)
    { id: 'restaurant', name: 'Restaurant', description: 'Bon pour un restaurant', xpCost: 500, icon: '🍽️', category: 'Food & cadeaux', type: 'individual', isDefault: true },
    { id: 'giftCard', name: 'Carte cadeau 30€', description: 'Utilisable en magasin', xpCost: 600, icon: '🎁', category: 'Food & cadeaux', type: 'individual', isDefault: true },
    
    // Bien-être (700-1000 XP)
    { id: 'massage', name: 'Massage', description: 'Séance de massage professionnel', xpCost: 800, icon: '💆', category: 'Bien-être', type: 'individual', isDefault: true },
    { id: 'ergonomic', name: 'Accessoire ergonomique', description: 'Fauteuil ou coussin ergonomique', xpCost: 900, icon: '🪑', category: 'Bien-être', type: 'individual', isDefault: true },
    
    // Loisirs (1000-1500 XP)
    { id: 'cinema', name: 'Pack cinéma', description: '2 places de cinéma + popcorn', xpCost: 1200, icon: '🎬', category: 'Loisirs', type: 'individual', isDefault: true },
    { id: 'concert', name: 'Concert', description: 'Billet pour un concert', xpCost: 1400, icon: '🎵', category: 'Loisirs', type: 'individual', isDefault: true },
    
    // Lifestyle (1500-2500 XP)
    { id: 'gadget', name: 'Gadget tech', description: 'Objet technologique au choix', xpCost: 2000, icon: '📺', category: 'Lifestyle', type: 'individual', isDefault: true },
    { id: 'sport', name: 'Équipement sportif', description: 'Matériel pour ton sport préféré', xpCost: 2300, icon: '⚽', category: 'Lifestyle', type: 'individual', isDefault: true },
    
    // Temps offert (2500-4000 XP)
    { id: 'halfDay', name: 'Demi-journée congé', description: 'Une demi-journée de repos supplémentaire', xpCost: 2800, icon: '🌅', category: 'Temps offert', type: 'individual', isDefault: true },
    { id: 'fullDay', name: 'Jour de congé bonus', description: 'Un jour de congé supplémentaire', xpCost: 3500, icon: '🏖️', category: 'Temps offert', type: 'individual', isDefault: true },
    
    // Grands plaisirs (4000-6000 XP)
    { id: 'weekend', name: 'Week-end découverte', description: 'Un week-end dans un lieu touristique', xpCost: 5000, icon: '🗺️', category: 'Grands plaisirs', type: 'individual', isDefault: true },
    { id: 'spa', name: 'Journée spa', description: 'Une journée complète dans un spa', xpCost: 4500, icon: '🧖', category: 'Grands plaisirs', type: 'individual', isDefault: true },
    
    // Premium (6000+ XP)
    { id: 'vacation', name: 'Semaine de vacances offerte', description: 'Une semaine de vacances payée', xpCost: 12500, icon: '✈️', category: 'Premium', type: 'individual', isDefault: true },
    { id: 'laptop', name: 'Ordinateur portable', description: 'Un laptop pour usage personnel', xpCost: 15000, icon: '💻', category: 'Premium', type: 'individual', isDefault: true }
  ];

  const DEFAULT_TEAM_REWARDS = [
    { id: 'teamSnack', name: 'Goûter d\'équipe', description: 'Goûter pour toute l\'équipe', xpCost: 500, icon: '🍰', category: 'Team', type: 'team', isDefault: true },
    { id: 'teamLunch', name: 'Déjeuner d\'équipe', description: 'Restaurant pour l\'équipe', xpCost: 1500, icon: '🍴', category: 'Team', type: 'team', isDefault: true },
    { id: 'teamActivity', name: 'Activité team building', description: 'Sortie ou activité collective', xpCost: 3000, icon: '🎯', category: 'Team', type: 'team', isDefault: true },
    { id: 'teamOuting', name: 'Sortie d\'équipe', description: 'Journée découverte en équipe', xpCost: 5000, icon: '🚀', category: 'Team', type: 'team', isDefault: true },
    { id: 'teamWeekend', name: 'Week-end d\'équipe', description: 'Week-end team building complet', xpCost: 10000, icon: '🏕️', category: 'Team', type: 'team', isDefault: true }
  ];

  // ==========================================
  // 🔥 CHARGEMENT DES DONNÉES
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données...');
      
      // Charger le profil utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        console.log('✅ Profil utilisateur chargé');
      }

      // Calculer le XP total d'équipe
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalXP = 0;
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        totalXP += userData.xp || 0;
      });
      setTeamTotalXP(totalXP);
      console.log('✅ XP équipe calculé:', totalXP);

      // Charger les récompenses custom de Firebase
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      const firebaseRewards = [];
      const hiddenRewardIds = []; // IDs des récompenses par défaut masquées
      
      rewardsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Si c'est une version masquée d'une récompense par défaut
        if (data.isHidden && data.originalId) {
          hiddenRewardIds.push(data.originalId);
        } else if (!data.isHidden) {
          // Ajouter uniquement les récompenses non masquées
          firebaseRewards.push({
            id: doc.id,
            ...data,
            isFirebase: true
          });
        }
      });
      console.log('✅ Récompenses Firebase chargées:', firebaseRewards.length);
      console.log('🔒 Récompenses masquées:', hiddenRewardIds);

      // Filtrer les récompenses par défaut pour exclure les masquées
      const visibleDefaultIndividual = DEFAULT_INDIVIDUAL_REWARDS.filter(
        r => !hiddenRewardIds.includes(r.id)
      );
      const visibleDefaultTeam = DEFAULT_TEAM_REWARDS.filter(
        r => !hiddenRewardIds.includes(r.id)
      );

      // Combiner récompenses par défaut visibles + Firebase
      const allIndividual = [...visibleDefaultIndividual, ...firebaseRewards.filter(r => r.type === 'individual')];
      const allTeam = [...visibleDefaultTeam, ...firebaseRewards.filter(r => r.type === 'team')];
      const combined = [...allIndividual, ...allTeam];
      setAllRewards(combined);
      console.log('✅ Total récompenses:', combined.length);

      // Charger les demandes de récompenses
      const requestsQuery = query(
        collection(db, 'rewardRequests'),
        where('userId', '==', user.uid)
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserRewards(requests);
      console.log('✅ Demandes utilisateur chargées:', requests.length);

      console.log('✅ Toutes les données chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      alert('Erreur de chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      loadAllData();
    } catch (error) {
      console.error('❌ Erreur demande:', error);
      alert('Erreur lors de la demande');
    }
  };

  // ==========================================
  // 🎨 CRÉER UNE RÉCOMPENSE (ADMIN)
  // ==========================================

  const handleCreateReward = async (e) => {
    e.preventDefault();
    
    if (!rewardForm.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    try {
      console.log('🔄 Création récompense:', rewardForm);
      
      const rewardData = {
        name: rewardForm.name,
        description: rewardForm.description,
        type: rewardForm.type,
        category: rewardForm.category,
        xpCost: parseInt(rewardForm.xpCost),
        icon: rewardForm.icon,
        isAvailable: rewardForm.isAvailable,
        isDefault: false,
        isFirebase: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      };

      const docRef = await addDoc(collection(db, 'rewards'), rewardData);
      console.log('✅ Récompense créée avec ID:', docRef.id);

      alert('✅ Récompense créée avec succès !');
      setShowCreateModal(false);
      setRewardForm({
        name: '',
        description: '',
        type: 'individual',
        category: 'Mini-plaisirs',
        xpCost: 100,
        icon: '🎁',
        isAvailable: true
      });
      
      // Recharger les données
      await loadAllData();
    } catch (error) {
      console.error('❌ Erreur création:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // ==========================================
  // ✏️ MODIFIER UNE RÉCOMPENSE (ADMIN)
  // ==========================================

  const handleUpdateReward = async (e) => {
    e.preventDefault();
    
    if (!selectedReward) return;

    try {
      // Si c'est une récompense Firebase existante
      if (selectedReward.isFirebase) {
        const rewardRef = doc(db, 'rewards', selectedReward.id);
        await updateDoc(rewardRef, {
          name: rewardForm.name,
          description: rewardForm.description,
          type: rewardForm.type,
          category: rewardForm.category,
          xpCost: parseInt(rewardForm.xpCost),
          icon: rewardForm.icon,
          isAvailable: rewardForm.isAvailable,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
        console.log('✅ Récompense Firebase mise à jour:', selectedReward.id);
      } else {
        // Si c'est une récompense par défaut, créer une version modifiée dans Firebase
        const newReward = await addDoc(collection(db, 'rewards'), {
          name: rewardForm.name,
          description: rewardForm.description,
          type: rewardForm.type,
          category: rewardForm.category,
          xpCost: parseInt(rewardForm.xpCost),
          icon: rewardForm.icon,
          isAvailable: rewardForm.isAvailable,
          originalId: selectedReward.id,
          isDefault: false,
          isFirebase: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
        console.log('✅ Version modifiée créée:', newReward.id);
      }

      alert('✅ Récompense modifiée avec succès !');
      setShowEditModal(false);
      setSelectedReward(null);
      
      // Recharger les données
      await loadAllData();
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // ==========================================
  // 🗑️ SUPPRIMER UNE RÉCOMPENSE (ADMIN)
  // ==========================================

  const handleDeleteReward = async (reward) => {
    if (!confirm(`Supprimer "${reward.name}" ?`)) return;

    try {
      if (reward.isFirebase) {
        await deleteDoc(doc(db, 'rewards', reward.id));
        alert('✅ Récompense supprimée !');
      } else {
        alert('⚠️ Les récompenses par défaut ne peuvent pas être supprimées, mais vous pouvez les modifier');
      }
      loadAllData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // ==========================================
  // 🔍 FILTRAGE DES RÉCOMPENSES
  // ==========================================

  const filteredRewards = useMemo(() => {
    let rewards = allRewards.filter(r => r.type === activeTab);

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
  }, [allRewards, searchTerm, filterCategory, activeTab]);

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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des récompenses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userXP = userProfile?.xp || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 🎯 EN-TÊTE DARK MODE */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-3">
              <Gift className="w-10 h-10 text-purple-400" />
              Boutique de Récompenses
            </h1>
            <p className="text-gray-400">
              Dépensez vos XP pour obtenir des avantages exclusifs !
            </p>
          </div>

          {/* 📊 STATISTIQUES DARK MODE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Mes XP</p>
                  <p className="text-2xl font-bold text-white">{userXP}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 font-semibold">XP d'Équipe</p>
                  <p className="text-2xl font-bold text-white">{teamTotalXP}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Demandes en cours</p>
                  <p className="text-2xl font-bold text-white">{userRewards.filter(r => r.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🛡️ BOUTON ADMIN */}
          {userIsAdmin && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 backdrop-blur-lg border ${
                  showAdminPanel 
                    ? 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30' 
                    : 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border-blue-400/30 hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                <Settings className="w-5 h-5" />
                {showAdminPanel ? 'Fermer Panel Admin' : 'Ouvrir Panel Admin'}
              </button>
            </div>
          )}

          {/* 🛡️ PANEL ADMIN DARK MODE */}
          {userIsAdmin && showAdminPanel && (
            <div className="bg-white/5 backdrop-blur-xl border border-blue-400/30 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Panel Administration Récompenses
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Créer Récompense
                </button>

                <button
                  onClick={loadAllData}
                  className="bg-gray-500/20 border border-gray-400/30 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Actualiser
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">
                  💡 Vous pouvez modifier et supprimer toutes les récompenses, même celles par défaut. Les demandes en attente apparaissent ici pour validation.
                </p>
              </div>
            </div>
          )}

          {/* 🎯 ONGLETS INDIVIDUELLES / ÉQUIPE */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg border ${
                activeTab === 'individual'
                  ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white border-blue-400/30 shadow-lg'
                  : 'bg-white/5 text-gray-400 border-white/20 hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
              Récompenses Individuelles
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                {allRewards.filter(r => r.type === 'individual').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg border ${
                activeTab === 'team'
                  ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white border-purple-400/30 shadow-lg'
                  : 'bg-white/5 text-gray-400 border-white/20 hover:bg-white/10'
              }`}
            >
              <Users className="w-5 h-5" />
              Récompenses d'Équipe
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                {allRewards.filter(r => r.type === 'team').length}
              </span>
            </button>
          </div>

          {/* 🔍 BARRE DE RECHERCHE DARK MODE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une récompense..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all" className="bg-slate-800">Toutes les catégories</option>
                {activeTab === 'individual' ? (
                  <>
                    <option value="Mini-plaisirs" className="bg-slate-800">Mini-plaisirs</option>
                    <option value="Petits avantages" className="bg-slate-800">Petits avantages</option>
                    <option value="Plaisirs utiles" className="bg-slate-800">Plaisirs utiles</option>
                    <option value="Food & cadeaux" className="bg-slate-800">Food & cadeaux</option>
                    <option value="Bien-être" className="bg-slate-800">Bien-être</option>
                    <option value="Loisirs" className="bg-slate-800">Loisirs</option>
                    <option value="Lifestyle" className="bg-slate-800">Lifestyle</option>
                    <option value="Temps offert" className="bg-slate-800">Temps offert</option>
                    <option value="Grands plaisirs" className="bg-slate-800">Grands plaisirs</option>
                    <option value="Premium" className="bg-slate-800">Premium</option>
                  </>
                ) : (
                  <option value="Team" className="bg-slate-800">Team</option>
                )}
              </select>
            </div>
          </div>

          {/* 🏆 GRILLE DES RÉCOMPENSES DARK MODE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const requiredXP = reward.type === 'team' ? teamTotalXP : userXP;
              const canAfford = requiredXP >= reward.xpCost;
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden transition-all duration-300 ${
                    canAfford ? 'hover:shadow-2xl hover:scale-105 shadow-lg shadow-purple-500/20' : 'opacity-60'
                  }`}
                >
                  {/* Gradient Header */}
                  <div className={`h-32 bg-gradient-to-r ${getRewardColor(reward)} flex items-center justify-center`}>
                    <span className="text-6xl">{reward.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">
                        {reward.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{reward.xpCost} XP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequestReward(reward)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors mb-2 ${
                        canAfford
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Demander' : 'XP insuffisants'}
                    </button>

                    {/* Actions Admin */}
                    {userIsAdmin && showAdminPanel && (
                      <div className="flex gap-2 pt-2 border-t border-white/20">
                        <button
                          onClick={() => {
                            setSelectedReward(reward);
                            setRewardForm({
                              name: reward.name,
                              description: reward.description,
                              type: reward.type,
                              category: reward.category,
                              xpCost: reward.xpCost,
                              icon: reward.icon,
                              isAvailable: reward.isAvailable !== false
                            });
                            setShowEditModal(true);
                          }}
                          className="flex-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </button>
                        
                        {reward.isFirebase && (
                          <button
                            onClick={() => handleDeleteReward(reward)}
                            className="flex-1 bg-red-500/20 border border-red-400/30 text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        )}
                      </div>
                    )}
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
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune récompense trouvée</p>
            </div>
          )}

          {/* 🎨 MODAL CRÉER RÉCOMPENSE */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Créer une Récompense</h3>
                
                <form onSubmit={handleCreateReward} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Icône (emoji)</label>
                    <input
                      type="text"
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="individual" className="bg-slate-800">Individuelle</option>
                      <option value="team" className="bg-slate-800">Équipe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={rewardForm.category}
                      onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Coût en XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Créer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ✏️ MODAL MODIFIER RÉCOMPENSE */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Modifier la Récompense</h3>
                
                <form onSubmit={handleUpdateReward} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Icône (emoji)</label>
                    <input
                      type="text"
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="individual" className="bg-slate-800">Individuelle</option>
                      <option value="team" className="bg-slate-800">Équipe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={rewardForm.category}
                      onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Coût en XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedReward(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    
                    {selectedReward && (
                      <button
                        type="button"
                        onClick={async () => {
                          const isDefault = !selectedReward.isFirebase;
                          const confirmMsg = isDefault 
                            ? `Masquer "${selectedReward.name}" de la boutique ?` 
                            : `Supprimer définitivement "${selectedReward.name}" ?`;
                          
                          if (confirm(confirmMsg)) {
                            try {
                              if (selectedReward.isFirebase) {
                                // Supprimer la récompense Firebase
                                await deleteDoc(doc(db, 'rewards', selectedReward.id));
                                console.log('✅ Récompense Firebase supprimée');
                              } else {
                                // Masquer la récompense par défaut en créant une version désactivée
                                await addDoc(collection(db, 'rewards'), {
                                  name: selectedReward.name,
                                  description: selectedReward.description,
                                  type: selectedReward.type,
                                  category: selectedReward.category,
                                  xpCost: selectedReward.xpCost,
                                  icon: selectedReward.icon,
                                  isAvailable: false, // DÉSACTIVÉE
                                  originalId: selectedReward.id,
                                  isDefault: false,
                                  isFirebase: true,
                                  isHidden: true, // Flag pour savoir que c'est une version masquée
                                  createdAt: serverTimestamp(),
                                  createdBy: user.uid
                                });
                                console.log('✅ Récompense par défaut masquée');
                              }
                              
                              alert('✅ Récompense supprimée !');
                              setShowEditModal(false);
                              setSelectedReward(null);
                              await loadAllData();
                            } catch (error) {
                              console.error('❌ Erreur suppression:', error);
                              alert('Erreur: ' + error.message);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {selectedReward.isFirebase ? 'Supprimer' : 'Masquer'}
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RewardsPage;
