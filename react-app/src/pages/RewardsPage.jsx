// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES AVEC DESIGN SYNERGIA v3.5
// Dark mode + Glass morphism + Gradients premium
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
  collection, query, orderBy, onSnapshot, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch, runTransaction
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS RÉCOMPENSES
  const [userRewards, setUserRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [teamRewards, setTeamRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [teamPool, setTeamPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('individual');

  // 🛡️ ÉTATS ADMIN
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showEditRewardModal, setShowEditRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // 📋 ÉTATS DEMANDES
  const [rewardRequests, setRewardRequests] = useState([]);
  const [teamRewardRequests, setTeamRewardRequests] = useState([]);

  // 📝 FORMULAIRE RÉCOMPENSE
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'individual',
    category: 'Mini-plaisirs',
    xpCost: 100,
    icon: '🎁',
    isAvailable: true,
    stock: -1,
    requirements: {}
  });

  // ==========================================
  // 📊 CATALOGUES DE RÉCOMPENSES
  // ==========================================

  const INDIVIDUAL_REWARDS_CATALOG = {
    // Mini-plaisirs (50-100 XP)
    snack: { id: 'snack', name: 'Goûter surprise', description: 'Un goûter de ton choix', xpCost: 50, icon: '🍪', category: 'Mini-plaisirs', type: 'individual', isAvailable: true },
    coffee: { id: 'coffee', name: 'Café premium', description: 'Un café de spécialité', xpCost: 75, icon: '☕', category: 'Mini-plaisirs', type: 'individual', isAvailable: true },
    tea: { id: 'tea', name: 'Thé premium', description: 'Une sélection de thés fins', xpCost: 80, icon: '🍵', category: 'Mini-plaisirs', type: 'individual', isAvailable: true },
    
    // Petits avantages (100-200 XP)
    earlyLeave: { id: 'earlyLeave', name: 'Partir 1h plus tôt', description: 'Quitter le travail une heure avant', xpCost: 150, icon: '🏃', category: 'Petits avantages', type: 'individual', isAvailable: true },
    lateComing: { id: 'lateComing', name: 'Arriver 1h plus tard', description: 'Commencer une heure après', xpCost: 150, icon: '😴', category: 'Petits avantages', type: 'individual', isAvailable: true },
    musicChoice: { id: 'musicChoice', name: 'Playlist du jour', description: 'Choisir la musique au bureau', xpCost: 120, icon: '🎵', category: 'Petits avantages', type: 'individual', isAvailable: true },
    
    // Plaisirs utiles (200-400 XP)
    lunch: { id: 'lunch', name: 'Déjeuner offert', description: 'Un repas au restaurant', xpCost: 250, icon: '🍽️', category: 'Plaisirs utiles', type: 'individual', isAvailable: true },
    pizza: { id: 'pizza', name: 'Pizza du midi', description: 'Une pizza de ton choix', xpCost: 380, icon: '🍕', category: 'Plaisirs utiles', type: 'individual', isAvailable: true },
    parking: { id: 'parking', name: 'Place parking VIP', description: 'Une semaine de parking premium', xpCost: 350, icon: '🅿️', category: 'Plaisirs utiles', type: 'individual', isAvailable: true },
    
    // Plaisirs food & cadeaux (400-700 XP)
    brunch: { id: 'brunch', name: 'Brunch prolongé', description: 'Pause déjeuner longue avec brunch', xpCost: 450, icon: '🥐', category: 'Plaisirs food & cadeaux', type: 'individual', isAvailable: true },
    restaurant: { id: 'restaurant', name: 'Restaurant gastronomique', description: 'Dîner dans un restaurant haut de gamme', xpCost: 650, icon: '🍽️', category: 'Plaisirs food & cadeaux', type: 'individual', isAvailable: true },
    giftCard: { id: 'giftCard', name: 'Carte cadeau 30€', description: 'Carte cadeau magasin de ton choix', xpCost: 600, icon: '🎁', category: 'Plaisirs food & cadeaux', type: 'individual', isAvailable: true },
    
    // Bien-être & confort (700-1000 XP)
    massage: { id: 'massage', name: 'Massage relaxant', description: 'Séance de massage d\'une heure', xpCost: 850, icon: '💆', category: 'Bien-être & confort', type: 'individual', isAvailable: true },
    flexDay: { id: 'flexDay', name: 'Journée flexible', description: 'Horaires libres pour une journée', xpCost: 750, icon: '⏰', category: 'Bien-être & confort', type: 'individual', isAvailable: true },
    
    // Loisirs & sorties (1000-1500 XP)
    cinema: { id: 'cinema', name: '2 places cinéma', description: 'Deux places de cinéma', xpCost: 1100, icon: '🎬', category: 'Loisirs & sorties', type: 'individual', isAvailable: true },
    concert: { id: 'concert', name: 'Place de concert', description: 'Billet pour un concert', xpCost: 1400, icon: '🎤', category: 'Loisirs & sorties', type: 'individual', isAvailable: true },
    museum: { id: 'museum', name: 'Musée + restaurant', description: 'Entrée musée et déjeuner', xpCost: 1200, icon: '🏛️', category: 'Loisirs & sorties', type: 'individual', isAvailable: true },
    
    // Lifestyle & bonus (1500-2500 XP)
    techGadget: { id: 'techGadget', name: 'Gadget tech', description: 'Un accessoire technologique', xpCost: 1800, icon: '📱', category: 'Lifestyle & bonus', type: 'individual', isAvailable: true },
    subscription: { id: 'subscription', name: 'Abonnement streaming 3 mois', description: 'Netflix, Spotify, etc.', xpCost: 2000, icon: '📺', category: 'Lifestyle & bonus', type: 'individual', isAvailable: true },
    sport: { id: 'sport', name: 'Équipement sportif', description: 'Matériel pour ton sport préféré', xpCost: 2300, icon: '⚽', category: 'Lifestyle & bonus', type: 'individual', isAvailable: true },
    
    // Avantages temps offert (2500-4000 XP)
    halfDay: { id: 'halfDay', name: 'Demi-journée congé', description: 'Une demi-journée de repos supplémentaire', xpCost: 2800, icon: '🌅', category: 'Avantages temps offert', type: 'individual', isAvailable: true },
    fullDay: { id: 'fullDay', name: 'Jour de congé bonus', description: 'Un jour de congé supplémentaire', xpCost: 3500, icon: '🏖️', category: 'Avantages temps offert', type: 'individual', isAvailable: true },
    
    // Grands plaisirs (4000-6000 XP)
    weekend: { id: 'weekend', name: 'Week-end découverte', description: 'Un week-end dans un lieu touristique', xpCost: 5000, icon: '🗺️', category: 'Grands plaisirs', type: 'individual', isAvailable: true },
    spa: { id: 'spa', name: 'Journée spa', description: 'Une journée complète dans un spa', xpCost: 4500, icon: '🧖', category: 'Grands plaisirs', type: 'individual', isAvailable: true },
    
    // Premium (6000+ XP)
    vacation: { id: 'vacation', name: 'Semaine de vacances offerte', description: 'Une semaine de vacances payée', xpCost: 12500, icon: '✈️', category: 'Premium', type: 'individual', isAvailable: true },
    laptop: { id: 'laptop', name: 'Ordinateur portable', description: 'Un laptop pour usage personnel', xpCost: 15000, icon: '💻', category: 'Premium', type: 'individual', isAvailable: true }
  };

  const TEAM_REWARDS_CATALOG = {
    teamSnack: { id: 'teamSnack', name: 'Goûter d\'équipe', description: 'Goûter pour toute l\'équipe', xpCost: 500, icon: '🍰', category: 'Team', type: 'team', isAvailable: true },
    teamLunch: { id: 'teamLunch', name: 'Déjeuner d\'équipe', description: 'Restaurant pour l\'équipe', xpCost: 1500, icon: '🍴', category: 'Team', type: 'team', isAvailable: true },
    teamActivity: { id: 'teamActivity', name: 'Activité team building', description: 'Sortie ou activité collective', xpCost: 3000, icon: '🎯', category: 'Team', type: 'team', isAvailable: true },
    teamOuting: { id: 'teamOuting', name: 'Sortie d\'équipe', description: 'Journée découverte en équipe', xpCost: 5000, icon: '🚀', category: 'Team', type: 'team', isAvailable: true }
  };

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

        // Charger la cagnotte d'équipe
        const poolDoc = await getDoc(doc(db, 'teamPool', 'main'));
        if (poolDoc.exists()) {
          setTeamPool(poolDoc.data());
        }

        // Charger les récompenses custom
        const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
        const customRewards = rewardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllRewards(customRewards);

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

        // Si admin, charger toutes les demandes
        if (userIsAdmin) {
          const allRequestsSnapshot = await getDocs(
            query(collection(db, 'rewardRequests'), orderBy('requestedAt', 'desc'))
          );
          setRewardRequests(allRequestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));

          const teamRequestsSnapshot = await getDocs(
            query(collection(db, 'teamRewardRequests'), orderBy('requestedAt', 'desc'))
          );
          setTeamRewardRequests(teamRequestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        }

      } catch (error) {
        console.error('❌ Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user?.uid, userIsAdmin]);

  // ==========================================
  // 🎁 DEMANDER UNE RÉCOMPENSE
  // ==========================================

  const handleRequestReward = async (reward) => {
    if (!user?.uid || !userProfile) {
      showNotification('Vous devez être connecté', 'error');
      return;
    }

    const userXP = userProfile.xp || 0;
    if (userXP < reward.xpCost) {
      showNotification(`Vous n'avez pas assez d'XP (${userXP}/${reward.xpCost})`, 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardDescription: reward.description,
        xpCost: reward.xpCost,
        status: 'pending',
        requestedAt: serverTimestamp(),
        type: reward.type || 'individual'
      });

      showNotification('Demande envoyée avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur demande:', error);
      showNotification('Erreur lors de la demande', 'error');
    }
  };

  // ==========================================
  // 🛡️ VALIDATION ADMIN
  // ==========================================

  const handleValidateRequest = async (requestId, action) => {
    try {
      const requestRef = doc(db, 'rewardRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        showNotification('Demande introuvable', 'error');
        return;
      }

      const requestData = requestDoc.data();

      if (action === 'approve') {
        // Débiter les XP
        const userRef = doc(db, 'users', requestData.userId);
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) throw new Error('User not found');
          
          const currentXP = userDoc.data().xp || 0;
          if (currentXP < requestData.xpCost) {
            throw new Error('Insufficient XP');
          }

          transaction.update(userRef, {
            xp: currentXP - requestData.xpCost
          });

          transaction.update(requestRef, {
            status: 'approved',
            approvedAt: serverTimestamp(),
            approvedBy: user.uid
          });
        });

        showNotification('Demande approuvée !', 'success');
      } else {
        await updateDoc(requestRef, {
          status: 'rejected',
          rejectedAt: serverTimestamp(),
          rejectedBy: user.uid
        });

        showNotification('Demande rejetée', 'success');
      }

      // Recharger les données
      const allRequestsSnapshot = await getDocs(
        query(collection(db, 'rewardRequests'), orderBy('requestedAt', 'desc'))
      );
      setRewardRequests(allRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (error) {
      console.error('❌ Erreur validation:', error);
      showNotification('Erreur lors de la validation', 'error');
    }
  };

  // ==========================================
  // 🎁 GESTION DES RÉCOMPENSES ADMIN
  // ==========================================

  const handleCreateReward = async () => {
    try {
      await addDoc(collection(db, 'rewards'), {
        ...rewardForm,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Récompense créée avec succès !', 'success');
      setShowCreateRewardModal(false);
      resetRewardForm();

      // Recharger les récompenses
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      setAllRewards(rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (error) {
      console.error('❌ Erreur création:', error);
      showNotification('Erreur lors de la création', 'error');
    }
  };

  const handleEditReward = async () => {
    if (!selectedReward) return;

    try {
      await updateDoc(doc(db, 'rewards', selectedReward.id), rewardForm);

      showNotification('Récompense modifiée avec succès !', 'success');
      setShowEditRewardModal(false);
      setSelectedReward(null);
      resetRewardForm();

      // Recharger les récompenses
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      setAllRewards(rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (error) {
      console.error('❌ Erreur modification:', error);
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette récompense ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'rewards', rewardId));

      showNotification('Récompense supprimée avec succès !', 'success');

      // Recharger les récompenses
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      setAllRewards(rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const resetRewardForm = () => {
    setRewardForm({
      name: '',
      description: '',
      type: 'individual',
      category: 'Mini-plaisirs',
      xpCost: 100,
      icon: '🎁',
      isAvailable: true,
      stock: -1,
      requirements: {}
    });
  };

  const openEditModal = (reward) => {
    setSelectedReward(reward);
    setRewardForm({
      name: reward.name || '',
      description: reward.description || '',
      type: reward.type || 'individual',
      category: reward.category || 'Mini-plaisirs',
      xpCost: reward.xpCost || 100,
      icon: reward.icon || '🎁',
      isAvailable: reward.isAvailable !== false,
      stock: reward.stock || -1,
      requirements: reward.requirements || {}
    });
    setShowEditRewardModal(true);
  };

  // ==========================================
  // 🎨 NOTIFICATION SYSTÈME
  // ==========================================

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  // ==========================================
  // 🔍 FILTRAGE DES RÉCOMPENSES
  // ==========================================

  const filteredRewards = useMemo(() => {
    let rewards = [];
    
    if (activeTab === 'individual') {
      if (userIsAdmin && showAdminPanel) {
        rewards = allRewards;
      } else {
        rewards = Object.values(INDIVIDUAL_REWARDS_CATALOG);
      }
    } else {
      if (userIsAdmin && showAdminPanel) {
        rewards = teamRewards;
      } else {
        rewards = Object.values(TEAM_REWARDS_CATALOG);
      }
    }

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
  }, [allRewards, teamRewards, searchTerm, filterCategory, showAdminPanel, userIsAdmin, activeTab]);

  // ==========================================
  // 🎨 COULEUR PAR TYPE
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des récompenses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        
        {/* ========================================== */}
        {/* 🎯 HEADER AVEC STATISTIQUES */}
        {/* ========================================== */}
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🎁 Boutique de Récompenses
              </h1>
              <p className="text-gray-400 text-lg">
                Échangez vos XP contre des récompenses exclusives
              </p>
            </div>

            {userIsAdmin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                {showAdminPanel ? 'Mode utilisateur' : 'Mode admin'}
              </button>
            )}
          </div>

          {/* Statistiques utilisateur */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Mes XP</p>
                  <p className="text-3xl font-bold text-yellow-400">{userProfile?.xp || 0}</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Niveau</p>
                  <p className="text-3xl font-bold text-blue-400">{userProfile?.level || 1}</p>
                </div>
                <Star className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Récompenses obtenues</p>
                  <p className="text-3xl font-bold text-green-400">
                    {userRewards.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Cagnotte équipe</p>
                  <p className="text-3xl font-bold text-purple-400">{teamPool?.totalXP || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ========================================== */}
        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        {/* ========================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Filtre catégorie */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Mini-plaisirs">Mini-plaisirs</option>
              <option value="Petits avantages">Petits avantages</option>
              <option value="Plaisirs utiles">Plaisirs utiles</option>
              <option value="Plaisirs food & cadeaux">Plaisirs food & cadeaux</option>
              <option value="Bien-être & confort">Bien-être & confort</option>
              <option value="Loisirs & sorties">Loisirs & sorties</option>
              <option value="Lifestyle & bonus">Lifestyle & bonus</option>
              <option value="Avantages temps offert">Avantages temps offert</option>
              <option value="Grands plaisirs">Grands plaisirs</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          {/* Onglets */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'individual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Gift className="w-5 h-5 inline-block mr-2" />
              Récompenses individuelles
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'team'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              Récompenses d'équipe
            </button>
          </div>
        </motion.div>

        {/* ========================================== */}
        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        {/* ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
                  {/* Header avec gradient */}
                  <div className={`bg-gradient-to-r ${getRewardColor(reward)} p-6 text-center`}>
                    <div className="text-6xl mb-3">{reward.icon}</div>
                    <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
                      <Coins className="w-5 h-5" />
                      {reward.xpCost} XP
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        {reward.category}
                      </span>
                      {reward.type === 'team' && (
                        <span className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Équipe
                        </span>
                      )}
                    </div>

                    {/* Bouton d'action */}
                    {!showAdminPanel ? (
                      <button
                        onClick={() => handleRequestReward(reward)}
                        disabled={(userProfile?.xp || 0) < reward.xpCost}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                          (userProfile?.xp || 0) >= reward.xpCost
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {(userProfile?.xp || 0) >= reward.xpCost ? (
                          <>
                            <ShoppingCart className="w-4 h-4 inline-block mr-2" />
                            Demander
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 inline-block mr-2" />
                            XP insuffisants
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(reward)}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Message si aucune récompense */}
        {filteredRewards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Gift className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">Aucune récompense trouvée</p>
          </motion.div>
        )}

        {/* ========================================== */}
        {/* 🛡️ PANNEAU ADMIN */}
        {/* ========================================== */}

        {userIsAdmin && showAdminPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Panneau d'administration
              </h2>

              <button
                onClick={() => setShowCreateRewardModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer une récompense
              </button>
            </div>

            {/* Demandes en attente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Demandes en attente</h3>
              
              {rewardRequests.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-gray-500">Aucune demande en attente</p>
              ) : (
                <div className="space-y-3">
                  {rewardRequests
                    .filter(r => r.status === 'pending')
                    .map(request => (
                      <div
                        key={request.id}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-white font-semibold">{request.rewardName}</p>
                          <p className="text-gray-400 text-sm">
                            Demandé par {request.userName} • {request.xpCost} XP
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValidateRequest(request.id, 'approve')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleValidateRequest(request.id, 'reject')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================== */}
        {/* 📝 MODALE CRÉATION DE RÉCOMPENSE */}
        {/* ========================================== */}

        <AnimatePresence>
          {showCreateRewardModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateRewardModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-green-400" />
                  Créer une nouvelle récompense
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nom de la récompense</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Ex: Café premium"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Décrivez la récompense..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Type</label>
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="individual">Individuelle</option>
                        <option value="team">Équipe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Catégorie</label>
                      <select
                        value={rewardForm.category}
                        onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Mini-plaisirs">Mini-plaisirs</option>
                        <option value="Petits avantages">Petits avantages</option>
                        <option value="Plaisirs utiles">Plaisirs utiles</option>
                        <option value="Plaisirs food & cadeaux">Plaisirs food & cadeaux</option>
                        <option value="Bien-être & confort">Bien-être & confort</option>
                        <option value="Loisirs & sorties">Loisirs & sorties</option>
                        <option value="Lifestyle & bonus">Lifestyle & bonus</option>
                        <option value="Avantages temps offert">Avantages temps offert</option>
                        <option value="Grands plaisirs">Grands plaisirs</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Coût en XP</label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Icône (emoji)</label>
                      <input
                        type="text"
                        value={rewardForm.icon}
                        onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        placeholder="🎁"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={rewardForm.isAvailable}
                      onChange={(e) => setRewardForm({...rewardForm, isAvailable: e.target.checked})}
                      className="w-5 h-5 bg-gray-700 border border-gray-600 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isAvailable" className="text-gray-300">Récompense disponible</label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateReward}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                  >
                    Créer la récompense
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateRewardModal(false);
                      resetRewardForm();
                    }}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================== */}
        {/* ✏️ MODALE MODIFICATION DE RÉCOMPENSE */}
        {/* ========================================== */}

        <AnimatePresence>
          {showEditRewardModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditRewardModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-blue-400" />
                  Modifier la récompense
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nom de la récompense</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Type</label>
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="individual">Individuelle</option>
                        <option value="team">Équipe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Catégorie</label>
                      <select
                        value={rewardForm.category}
                        onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Mini-plaisirs">Mini-plaisirs</option>
                        <option value="Petits avantages">Petits avantages</option>
                        <option value="Plaisirs utiles">Plaisirs utiles</option>
                        <option value="Plaisirs food & cadeaux">Plaisirs food & cadeaux</option>
                        <option value="Bien-être & confort">Bien-être & confort</option>
                        <option value="Loisirs & sorties">Loisirs & sorties</option>
                        <option value="Lifestyle & bonus">Lifestyle & bonus</option>
                        <option value="Avantages temps offert">Avantages temps offert</option>
                        <option value="Grands plaisirs">Grands plaisirs</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Coût en XP</label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Icône (emoji)</label>
                      <input
                        type="text"
                        value={rewardForm.icon}
                        onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAvailableEdit"
                      checked={rewardForm.isAvailable}
                      onChange={(e) => setRewardForm({...rewardForm, isAvailable: e.target.checked})}
                      className="w-5 h-5 bg-gray-700 border border-gray-600 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isAvailableEdit" className="text-gray-300">Récompense disponible</label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleEditReward}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                  >
                    Enregistrer les modifications
                  </button>
                  <button
                    onClick={() => {
                      setShowEditRewardModal(false);
                      setSelectedReward(null);
                      resetRewardForm();
                    }}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default RewardsPage;
