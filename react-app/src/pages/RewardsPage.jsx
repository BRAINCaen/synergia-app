// ==========================================
// react-app/src/pages/RewardsPage.jsx
// PAGE RECOMPENSES - RESPONSIVE MOBILE-FIRST
// ==========================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Search, Filter, Star, Gift, Coins, Users, Target,
  Plus, Edit2, Trash2, Settings, AlertCircle, Check, X,
  ShoppingCart, Clock, User, Calendar, TrendingUp, Crown,
  Shield, Eye, EyeOff, Package, Zap, Heart, Coffee, Gamepad2,
  MapPin, Camera, Music, Book, Palette, Dumbbell, ChefHat, Save,
  SlidersHorizontal, Lightbulb, Send, Sparkles
} from 'lucide-react';
import notificationService from '../core/services/notificationService.js';
import { rewardsService } from '../core/services/rewardsService.js';

import Layout from '../components/layout/Layout.jsx';
import { RewardDetailModal, PurchaseSuccessAnimation, WishlistCard } from '../components/shop';
// Composants extraits
import { StatCard, FilterBottomSheet, RewardCard } from '../components/rewards';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';

import {
  collection, query, orderBy, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, limit
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ==========================================
// CATALOGUES PAR DEFAUT
// ==========================================

const DEFAULT_INDIVIDUAL_REWARDS = [
  { id: 'snack', name: 'Gouter surprise', description: 'Un gouter de ton choix', xpCost: 50, icon: '🍪', category: 'Mini-plaisirs', type: 'individual', isDefault: true, stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'coffee', name: 'Cafe premium', description: 'Un cafe de specialite', xpCost: 75, icon: '☕', category: 'Mini-plaisirs', type: 'individual', isDefault: true, stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'tea', name: 'The premium', description: 'Une selection de thes fins', xpCost: 80, icon: '🍵', category: 'Mini-plaisirs', type: 'individual', isDefault: true, stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'earlyLeave', name: 'Sortie anticipee', description: 'Partir 30 min plus tot', xpCost: 150, icon: '🏃', category: 'Petits avantages', type: 'individual', isDefault: true, stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'parking', name: 'Place de parking', description: 'Place reservee pour une semaine', xpCost: 180, icon: '🅿️', category: 'Petits avantages', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 5, stockRemaining: 5 },
  { id: 'headphones', name: 'Ecouteurs', description: 'Ecouteurs sans fil', xpCost: 300, icon: '🎧', category: 'Plaisirs utiles', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 3, stockRemaining: 3 },
  { id: 'powerbank', name: 'Batterie externe', description: 'Power bank haute capacite', xpCost: 250, icon: '🔋', category: 'Plaisirs utiles', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 5, stockRemaining: 5 },
  { id: 'restaurant', name: 'Restaurant', description: 'Bon pour un restaurant', xpCost: 500, icon: '🍽️', category: 'Food & cadeaux', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 10, stockRemaining: 10 },
  { id: 'giftCard', name: 'Carte cadeau 30€', description: 'Utilisable en magasin', xpCost: 600, icon: '🎁', category: 'Food & cadeaux', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 5, stockRemaining: 5 },
  { id: 'massage', name: 'Massage', description: 'Seance de massage professionnel', xpCost: 800, icon: '💆', category: 'Bien-etre', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 3, stockRemaining: 3 },
  { id: 'ergonomic', name: 'Accessoire ergonomique', description: 'Fauteuil ou coussin ergonomique', xpCost: 900, icon: '🪑', category: 'Bien-etre', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'cinema', name: 'Pack cinema', description: '2 places de cinema + popcorn', xpCost: 1200, icon: '🎬', category: 'Loisirs', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 10, stockRemaining: 10 },
  { id: 'concert', name: 'Concert', description: 'Billet pour un concert', xpCost: 1400, icon: '🎵', category: 'Loisirs', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'gadget', name: 'Gadget tech', description: 'Objet technologique au choix', xpCost: 2000, icon: '📺', category: 'Lifestyle', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'sport', name: 'Equipement sportif', description: 'Materiel pour ton sport prefere', xpCost: 2300, icon: '⚽', category: 'Lifestyle', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'halfDay', name: 'Demi-journee conge', description: 'Une demi-journee de repos supplementaire', xpCost: 2800, icon: '🌅', category: 'Temps offert', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 10, stockRemaining: 10 },
  { id: 'fullDay', name: 'Jour de conge bonus', description: 'Un jour de conge supplementaire', xpCost: 3500, icon: '🏖️', category: 'Temps offert', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 5, stockRemaining: 5 },
  { id: 'weekend', name: 'Week-end decouverte', description: 'Un week-end dans un lieu touristique', xpCost: 5000, icon: '🗺️', category: 'Grands plaisirs', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 1, stockRemaining: 1 },
  { id: 'spa', name: 'Journee spa', description: 'Une journee complete dans un spa', xpCost: 4500, icon: '🧖', category: 'Grands plaisirs', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'vacation', name: 'Semaine de vacances offerte', description: 'Une semaine de vacances payee', xpCost: 12500, icon: '✈️', category: 'Premium', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 1, stockRemaining: 1 },
  { id: 'laptop', name: 'Ordinateur portable', description: 'Un laptop pour usage personnel', xpCost: 15000, icon: '💻', category: 'Premium', type: 'individual', isDefault: true, stockType: 'limited', stockTotal: 1, stockRemaining: 1 }
];

const DEFAULT_TEAM_REWARDS = [
  { id: 'teamSnack', name: 'Gouter d\'equipe', description: 'Gouter pour toute l\'equipe', xpCost: 500, icon: '🍰', category: 'Team', type: 'team', isDefault: true, stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'teamLunch', name: 'Dejeuner d\'equipe', description: 'Restaurant pour l\'equipe', xpCost: 1500, icon: '🍴', category: 'Team', type: 'team', isDefault: true, stockType: 'limited', stockTotal: 4, stockRemaining: 4 },
  { id: 'teamActivity', name: 'Activite team building', description: 'Sortie ou activite collective', xpCost: 3000, icon: '🎯', category: 'Team', type: 'team', isDefault: true, stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'teamOuting', name: 'Sortie d\'equipe', description: 'Journee decouverte en equipe', xpCost: 5000, icon: '🚀', category: 'Team', type: 'team', isDefault: true, stockType: 'limited', stockTotal: 1, stockRemaining: 1 },
  { id: 'teamWeekend', name: 'Week-end d\'equipe', description: 'Week-end team building complet', xpCost: 10000, icon: '🏕️', category: 'Team', type: 'team', isDefault: true, stockType: 'limited', stockTotal: 1, stockRemaining: 1 }
];

// ==========================================
// COMPOSANTS HELPER
// ==========================================

// Les composants StatCard, FilterBottomSheet et RewardCard sont importés depuis ../components/rewards

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // Etats
  const [userRewards, setUserRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [teamPoolXP, setTeamPoolXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('individual');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Etats admin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Formulaire
  const [rewardForm, setRewardForm] = useState({
    name: '', description: '', type: 'individual', category: 'Mini-plaisirs',
    xpCost: 100, icon: '🎁', isAvailable: true
  });

  // Etats boutique
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailReward, setDetailReward] = useState(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchasedReward, setPurchasedReward] = useState(null);
  const [wishlistReward, setWishlistReward] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Etats cagnotte
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(100);
  const [topContributors, setTopContributors] = useState([]);

  // Etats suggestions
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ name: '', description: '', estimatedCost: '' });
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [recentSuggestions, setRecentSuggestions] = useState([]);

  // 📦 Etats stock
  const [stockSettings, setStockSettings] = useState({});

  // 👤 Etats limite par utilisateur
  const [userRedemptions, setUserRedemptions] = useState({}); // { rewardId: { canRedeem, currentCount, limitPerUser } }
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);

  // Hook cagnotte
  const {
    stats: poolStats, loading: poolLoading, contributing,
    contributeManually, refreshPoolData, autoContributionRate
  } = useTeamPool({ autoInit: true, realTimeUpdates: true, enableContributions: true });

  // Ecouter pool equipe
  useEffect(() => {
    const poolRef = doc(db, 'teamPool', 'main');
    const unsubscribe = onSnapshot(poolRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setTeamPoolXP(docSnapshot.data().totalXP || 0);
      } else {
        setTeamPoolXP(0);
      }
    }, () => setTeamPoolXP(0));
    return () => unsubscribe();
  }, []);

  // 📦 Ecouter les paramètres de stock en temps réel
  useEffect(() => {
    const stockRef = doc(db, 'rewardStockSettings', 'main');
    const unsubscribe = onSnapshot(stockRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setStockSettings(docSnapshot.data().settings || {});
      }
    }, (error) => {
      console.log('Pas de paramètres de stock encore');
    });
    return () => unsubscribe();
  }, []);

  // 📦 Obtenir le stock d'une récompense
  const getStockInfo = useCallback((rewardId) => {
    if (stockSettings[rewardId]) {
      return stockSettings[rewardId];
    }
    // Valeurs par défaut
    const defaultReward = [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS].find(r => r.id === rewardId);
    if (defaultReward?.stockType) {
      return {
        stockType: defaultReward.stockType || 'unlimited',
        stockTotal: defaultReward.stockTotal,
        stockRemaining: defaultReward.stockRemaining,
        isDisabled: false
      };
    }
    return { stockType: 'unlimited', stockTotal: null, stockRemaining: null, isDisabled: false };
  }, [stockSettings]);

  // 🔴 Vérifier si une récompense est désactivée
  const isRewardDisabled = useCallback((rewardId) => {
    return stockSettings[rewardId]?.isDisabled === true;
  }, [stockSettings]);

  // 👤 Charger les limites d'échange par utilisateur
  useEffect(() => {
    const loadUserRedemptions = async () => {
      if (!user?.uid) {
        setLoadingRedemptions(false);
        return;
      }

      try {
        setLoadingRedemptions(true);
        const allRewardIds = [
          ...DEFAULT_INDIVIDUAL_REWARDS.map(r => r.id),
          ...DEFAULT_TEAM_REWARDS.map(r => r.id)
        ];

        const redemptionsMap = {};
        const limitSettings = await rewardsService.getUserLimitSettings();

        // Vérifier chaque récompense
        for (const rewardId of allRewardIds) {
          const reward = [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS].find(r => r.id === rewardId);
          const defaultLimit = reward?.type === 'team'
            ? limitSettings.defaultLimitTeam
            : limitSettings.defaultLimitIndividual;
          const limitPerUser = limitSettings.customLimits?.[rewardId] ?? defaultLimit;

          const checkResult = await rewardsService.canUserRedeemReward(user.uid, rewardId, limitPerUser);
          redemptionsMap[rewardId] = checkResult;
        }

        setUserRedemptions(redemptionsMap);
        console.log('👤 Limites utilisateur chargées:', Object.keys(redemptionsMap).length);
      } catch (error) {
        console.error('❌ Erreur chargement limites utilisateur:', error);
      } finally {
        setLoadingRedemptions(false);
      }
    };

    loadUserRedemptions();
  }, [user?.uid]);

  // Fonction pour obtenir l'info de limite utilisateur
  const getUserRedemptionInfo = useCallback((rewardId) => {
    return userRedemptions[rewardId] || { canRedeem: true, currentCount: 0, limitPerUser: 1, remaining: 1 };
  }, [userRedemptions]);

  // Charger donnees
  useEffect(() => {
    if (!user?.uid) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) setUserProfile(userDoc.data());

      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      const firebaseRewards = [];
      const hiddenRewardIds = [];

      rewardsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isHidden && data.originalId) {
          hiddenRewardIds.push(data.originalId);
        } else if (!data.isHidden) {
          firebaseRewards.push({ id: doc.id, ...data, isFirebase: true });
        }
      });

      const visibleDefaultIndividual = DEFAULT_INDIVIDUAL_REWARDS.filter(r => !hiddenRewardIds.includes(r.id));
      const visibleDefaultTeam = DEFAULT_TEAM_REWARDS.filter(r => !hiddenRewardIds.includes(r.id));

      const allIndividual = [...visibleDefaultIndividual, ...firebaseRewards.filter(r => r.type === 'individual')];
      const allTeam = [...visibleDefaultTeam, ...firebaseRewards.filter(r => r.type === 'team')];
      setAllRewards([...allIndividual, ...allTeam]);

      const requestsQuery = query(collection(db, 'rewardRequests'), where('userId', '==', user.uid));
      const requestsSnapshot = await getDocs(requestsQuery);
      setUserRewards(requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      await Promise.all([loadTopContributors(), loadRecentSuggestions()]);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopContributors = async () => {
    try {
      const q = query(collection(db, 'teamContributions'), orderBy('amount', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      const contributorMap = new Map();
      const challengeContributions = []; // Pour les défis d'équipe

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();

        // 🏆 Si c'est une contribution de défi d'équipe (pas de userId)
        if (data.type === 'team_challenge_reward' || !data.userId) {
          challengeContributions.push({
            id: docSnap.id,
            total: data.amount,
            description: data.description || 'Défi d\'équipe',
            isChallenge: true,
            createdAt: data.createdAt
          });
          return;
        }

        // Contributions utilisateur normales
        const existing = contributorMap.get(data.userId) || { total: 0, count: 0, email: data.userEmail };
        existing.total += data.amount;
        existing.count += 1;
        contributorMap.set(data.userId, existing);
      });

      // Combiner les contributions utilisateurs et défis
      const userContributions = Array.from(contributorMap.entries())
        .map(([oderId, data]) => ({ oderId: oderId, email: data.email, total: data.total, count: data.count, isChallenge: false }));

      // Fusionner et trier par montant total
      const allContributions = [...userContributions, ...challengeContributions]
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopContributors(allContributions);
    } catch (err) {
      console.error('Erreur contributeurs:', err);
    }
  };

  // Charger les suggestions récentes
  const loadRecentSuggestions = async () => {
    try {
      const q = query(
        collection(db, 'rewardSuggestions'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      setRecentSuggestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Erreur chargement suggestions:', err);
    }
  };

  // Soumettre une suggestion
  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestionForm.name.trim()) return;

    setSubmittingSuggestion(true);
    try {
      await addDoc(collection(db, 'rewardSuggestions'), {
        name: suggestionForm.name.trim(),
        description: suggestionForm.description.trim(),
        estimatedCost: suggestionForm.estimatedCost ? parseInt(suggestionForm.estimatedCost) : null,
        userId: user.uid,
        userName: user.displayName || user.email,
        status: 'pending',
        votes: 0,
        votedBy: [],
        createdAt: serverTimestamp()
      });

      setShowSuggestionModal(false);
      setSuggestionForm({ name: '', description: '', estimatedCost: '' });
      await loadRecentSuggestions();

      // Notification de succès
      alert('🎉 Merci pour ta suggestion ! Elle sera examinée par l\'équipe.');
    } catch (error) {
      console.error('Erreur suggestion:', error);
      alert('Erreur lors de l\'envoi de la suggestion');
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  // Voter pour une suggestion
  const handleVoteSuggestion = async (suggestionId) => {
    try {
      const suggestionRef = doc(db, 'rewardSuggestions', suggestionId);
      const suggestionSnap = await getDoc(suggestionRef);

      if (!suggestionSnap.exists()) return;

      const data = suggestionSnap.data();
      const votedBy = data.votedBy || [];

      if (votedBy.includes(user.uid)) {
        // Retirer le vote
        await updateDoc(suggestionRef, {
          votes: (data.votes || 1) - 1,
          votedBy: votedBy.filter(id => id !== user.uid)
        });
      } else {
        // Ajouter le vote
        await updateDoc(suggestionRef, {
          votes: (data.votes || 0) + 1,
          votedBy: [...votedBy, user.uid]
        });
      }

      await loadRecentSuggestions();
    } catch (error) {
      console.error('Erreur vote:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) setUserProfile(userDoc.data());
    } catch (err) {}
  };

  const handleContribution = async () => {
    const result = await contributeManually(contributionAmount);
    if (result.success) {
      setShowContributionModal(false);
      setContributionAmount(100);
      await Promise.all([loadTopContributors(), refreshPoolData(), refreshUserProfile()]);
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  // Calcul XP depensables
  const getSpendableXP = () => {
    const totalXP = userProfile?.gamification?.totalXp || 0;
    const totalSpentXP = userProfile?.gamification?.totalSpentXp || 0;
    return Math.max(0, totalXP - totalSpentXP);
  };

  // Handlers boutique
  const handleOpenDetail = useCallback((reward) => {
    setDetailReward(reward);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setDetailReward(null);
  }, []);

  const handleSetWishlist = useCallback((reward) => {
    setWishlistReward(reward);
    localStorage.setItem('synergia_wishlist', JSON.stringify(reward));
  }, []);

  const handleRemoveWishlist = useCallback(() => {
    setWishlistReward(null);
    localStorage.removeItem('synergia_wishlist');
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('synergia_wishlist');
    if (saved) {
      try { setWishlistReward(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleRequestReward = async (reward) => {
    if (!user) return alert('Vous devez etre connecte');
    setIsPurchasing(true);
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

      try {
        await notificationService.notifyRewardRequestPending({
          rewardId: reward.id, rewardName: reward.name,
          userId: user.uid, userName: user.displayName || user.email,
          xpCost: reward.xpCost
        });
      } catch (e) {}

      setShowDetailModal(false);
      setDetailReward(null);
      setPurchasedReward(reward);
      setShowPurchaseSuccess(true);
      await loadAllData();
    } catch (error) {
      alert('Erreur lors de la demande');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClosePurchaseSuccess = useCallback(() => {
    setShowPurchaseSuccess(false);
    setPurchasedReward(null);
  }, []);

  // Admin handlers
  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!rewardForm.name.trim()) return alert('Le nom est requis');
    try {
      await addDoc(collection(db, 'rewards'), {
        ...rewardForm, xpCost: parseInt(rewardForm.xpCost),
        isDefault: false, isFirebase: true,
        createdAt: serverTimestamp(), createdBy: user.uid
      });
      alert('Recompense creee !');
      setShowCreateModal(false);
      setRewardForm({ name: '', description: '', type: 'individual', category: 'Mini-plaisirs', xpCost: 100, icon: '🎁', isAvailable: true });
      await loadAllData();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleUpdateReward = async (e) => {
    e.preventDefault();
    if (!selectedReward) return;
    try {
      if (selectedReward.isFirebase) {
        await updateDoc(doc(db, 'rewards', selectedReward.id), {
          ...rewardForm, xpCost: parseInt(rewardForm.xpCost),
          updatedAt: serverTimestamp(), updatedBy: user.uid
        });
      } else {
        await addDoc(collection(db, 'rewards'), {
          ...rewardForm, xpCost: parseInt(rewardForm.xpCost),
          originalId: selectedReward.id, isDefault: false, isFirebase: true,
          replacesDefault: true, createdAt: serverTimestamp(), createdBy: user.uid
        });
        await addDoc(collection(db, 'rewards'), {
          originalId: selectedReward.id, isHidden: true,
          isDefault: false, isFirebase: true,
          createdAt: serverTimestamp(), createdBy: user.uid
        });
      }
      alert('Recompense modifiee !');
      setShowEditModal(false);
      setSelectedReward(null);
      await loadAllData();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleDeleteReward = async (reward) => {
    if (!confirm(`Supprimer "${reward.name}" ?`)) return;
    try {
      if (reward.isFirebase) {
        await deleteDoc(doc(db, 'rewards', reward.id));
        alert('Recompense supprimee !');
      } else {
        alert('Les recompenses par defaut ne peuvent pas etre supprimees');
      }
      loadAllData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleEditReward = (reward) => {
    setSelectedReward(reward);
    setRewardForm({
      name: reward.name, description: reward.description, type: reward.type,
      category: reward.category, xpCost: reward.xpCost, icon: reward.icon,
      isAvailable: reward.isAvailable !== false
    });
    setShowEditModal(true);
  };

  // Filtrage
  const filteredRewards = useMemo(() => {
    let rewards = allRewards.filter(r => r.type === activeTab);

    // 🔴 Exclure les récompenses désactivées par l'admin
    rewards = rewards.filter(r => !isRewardDisabled(r.id));

    if (searchTerm) {
      rewards = rewards.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== 'all') {
      rewards = rewards.filter(r => r.category === filterCategory);
    }
    return rewards;
  }, [allRewards, searchTerm, filterCategory, activeTab, isRewardDisabled]);

  // Valeurs calculees
  const userTotalXP = userProfile?.gamification?.totalXp || 0;
  const userSpendableXP = getSpendableXP();
  const activeFiltersCount = filterCategory !== 'all' ? 1 : 0;

  const getPoolLevelEmoji = (level) => {
    const emojis = { BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎', DIAMOND: '👑' };
    return emojis[level] || '🏆';
  };

  const getPoolLevelGradient = (level) => {
    const gradients = {
      BRONZE: 'from-amber-600 to-amber-800',
      SILVER: 'from-gray-300 to-gray-500',
      GOLD: 'from-yellow-400 to-amber-500',
      PLATINUM: 'from-purple-400 to-purple-600',
      DIAMOND: 'from-cyan-400 to-blue-500'
    };
    return gradients[level] || 'from-gray-400 to-gray-600';
  };

  // Loading
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 overflow-x-hidden relative">

        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-32 sm:pb-8">

          {/* HEADER RESPONSIVE */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Boutique</h1>
                  <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Depensez vos XP</p>
                </div>
              </div>

              {/* Actions mobile */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2.5 rounded-lg transition-all ${showSearch ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowFilters(true)}
                  className="relative p-2.5 bg-white/5 rounded-lg text-gray-400"
                >
                  <Filter className="w-5 h-5" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Admin button desktop */}
              {userIsAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Creer
                </button>
              )}
            </div>

            {/* Barre recherche mobile */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="sm:hidden mb-4 overflow-hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STATS RESPONSIVE - 2x2 mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
            <StatCard
              icon={Trophy}
              label="XP Prestige"
              value={userTotalXP}
              color="text-yellow-400"
              gradient="from-yellow-500/10 to-yellow-600/5"
            />
            <StatCard
              icon={ShoppingCart}
              label="XP Depensables"
              value={userSpendableXP}
              color="text-green-400"
              gradient="from-green-500/10 to-green-600/5"
            />
            <StatCard
              icon={Users}
              label="Pool Equipe"
              value={teamPoolXP}
              color="text-purple-400"
              gradient="from-purple-500/10 to-purple-600/5"
            />
            <StatCard
              icon={Clock}
              label="En attente"
              value={userRewards.filter(r => r.status === 'pending').length}
              color="text-blue-400"
              gradient="from-blue-500/10 to-blue-600/5"
            />
          </div>

          {/* SECTION SUGGESTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-400/30 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Texte d'incitation */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                      Une idee de recompense ?
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                      Propose une recompense que tu aimerais voir dans la boutique !
                    </p>
                  </div>
                </div>

                {/* Bouton suggérer */}
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Suggerer</span>
                </button>
              </div>

              {/* Suggestions récentes (si il y en a) */}
              {recentSuggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Suggestions populaires
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSuggestions.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleVoteSuggestion(suggestion.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                          suggestion.votedBy?.includes(user?.uid)
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-amber-500/30'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${suggestion.votedBy?.includes(user?.uid) ? 'fill-amber-400' : ''}`} />
                        <span className="truncate max-w-[120px]">{suggestion.name}</span>
                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                          {suggestion.votes || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* INFO SYSTEM */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-3 sm:p-4 mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-gray-300">
                <p className="font-semibold text-blue-400 mb-1">Systeme XP intelligent</p>
                <p className="hidden sm:block">
                  <span className="text-yellow-400">💎 Prestige</span> pour classements •
                  <span className="text-green-400"> 🛒 Depensables</span> pour achats •
                  <span className="text-purple-400"> 👥 Pool</span> pour equipe
                </p>
                <p className="sm:hidden">XP Prestige = classements • Depensables = achats</p>
              </div>
            </div>
          </div>

          {/* WISHLIST */}
          {wishlistReward && (
            <div className="mb-6">
              <WishlistCard
                targetReward={wishlistReward}
                currentXP={userSpendableXP}
                onRemoveTarget={handleRemoveWishlist}
                onViewReward={handleOpenDetail}
              />
            </div>
          )}

          {/* ONGLETS RESPONSIVE */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => { setActiveTab('individual'); setFilterCategory('all'); }}
              className={`flex-1 sm:flex-none min-w-[140px] px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'individual'
                  ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white border border-blue-400/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Perso</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {allRewards.filter(r => r.type === 'individual').length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('team'); setFilterCategory('all'); }}
              className={`flex-1 sm:flex-none min-w-[140px] px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'team'
                  ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white border border-purple-400/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Equipe</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {allRewards.filter(r => r.type === 'team').length}
              </span>
            </button>
          </div>

          {/* SECTION CAGNOTTE EQUIPE */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <span className="text-2xl sm:text-4xl">{getPoolLevelEmoji(poolStats?.currentLevel || 'BRONZE')}</span>
                        <div className={`px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r ${getPoolLevelGradient(poolStats?.currentLevel || 'BRONZE')} text-white text-xs sm:text-sm font-bold`}>
                          {poolStats?.currentLevel || 'BRONZE'}
                        </div>
                      </div>
                      <div className="text-2xl sm:text-4xl font-black text-white">
                        {(poolStats?.totalXP || teamPoolXP || 0).toLocaleString()} XP
                      </div>
                      <p className="text-white/80 text-xs sm:text-sm mt-1">
                        {poolStats?.contributorsCount || 0} contributeurs
                      </p>
                    </div>
                    <button
                      onClick={() => setShowContributionModal(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Contribuer
                    </button>
                  </div>
                </div>
              </div>

              {/* Top contributeurs - mobile optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 sm:p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Top Contributeurs
                  </h3>
                  <div className="space-y-2">
                    {topContributors.length === 0 ? (
                      <p className="text-gray-400 text-xs sm:text-sm">Aucun contributeur</p>
                    ) : (
                      topContributors.slice(0, 3).map((c, i) => (
                        <div key={c.oderId || c.id || i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{c.isChallenge ? '🏆' : (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉')}</span>
                            <span className="text-gray-300 text-xs sm:text-sm truncate max-w-[120px]" title={c.isChallenge ? c.description : c.email}>
                              {c.isChallenge
                                ? (c.description?.replace('Defi d\'equipe accompli: ', '') || 'Défi d\'équipe')
                                : (c.email?.split('@')[0] || 'Contributeur')}
                            </span>
                          </div>
                          <span className="text-green-400 font-semibold text-xs sm:text-sm">
                            +{c.total?.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 sm:p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    Comment ca marche ?
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span>🎯</span>
                      <p className="text-gray-400">{autoContributionRate || 20}% de tes XP vont a la cagnotte</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>🎁</span>
                      <p className="text-gray-400">Achetez des recompenses pour l'equipe</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* FILTRES DESKTOP */}
          <div className="hidden sm:flex items-center gap-4 mb-6">
            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all" className="bg-slate-800">Toutes categories</option>
              {activeTab === 'individual' ? (
                ['Mini-plaisirs', 'Petits avantages', 'Plaisirs utiles', 'Food & cadeaux', 'Bien-etre', 'Loisirs', 'Lifestyle', 'Temps offert', 'Grands plaisirs', 'Premium'].map(cat => (
                  <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                ))
              ) : (
                <option value="Team" className="bg-slate-800">Team</option>
              )}
            </select>
          </div>

          {/* GRILLE RECOMPENSES - 1 col mobile, 2 cols tablet, 3 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredRewards.map((reward) => {
              const requiredXP = reward.type === 'team' ? teamPoolXP : userSpendableXP;
              const canAfford = requiredXP >= reward.xpCost;

              return (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  canAfford={canAfford}
                  userSpendableXP={userSpendableXP}
                  teamPoolXP={teamPoolXP}
                  wishlistReward={wishlistReward}
                  onOpenDetail={handleOpenDetail}
                  onSetWishlist={handleSetWishlist}
                  onRemoveWishlist={handleRemoveWishlist}
                  userIsAdmin={userIsAdmin}
                  onEdit={handleEditReward}
                  onDelete={handleDeleteReward}
                  stockInfo={getStockInfo(reward.id)}
                  userRedemptionInfo={getUserRedemptionInfo(reward.id)}
                />
              );
            })}
          </div>

          {/* Message vide */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">Aucune recompense</h3>
              <p className="text-gray-500 text-sm">Modifiez vos filtres</p>
            </div>
          )}

          {/* MES DEMANDES */}
          {userRewards.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                Mes demandes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {userRewards.map((request) => (
                  <div key={request.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{request.rewardIcon}</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{request.rewardName}</h4>
                        <p className="text-xs text-gray-400">{request.xpCost} XP</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      request.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {request.status === 'pending' && <Clock className="w-3 h-3" />}
                      {request.status === 'approved' && <Check className="w-3 h-3" />}
                      {request.status === 'rejected' && <X className="w-3 h-3" />}
                      {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvee' : 'Refusee'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAB ADMIN MOBILE */}
        {userIsAdmin && (
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="sm:hidden fixed right-4 bottom-24 w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center z-30"
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      {/* BOTTOM SHEET FILTRES MOBILE */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        activeTab={activeTab}
      />

      {/* MODAL CREATION */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-800 border-t sm:border border-white/20 rounded-t-3xl sm:rounded-xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center sm:hidden mb-4">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-400" />
                Nouvelle recompense
              </h2>
              <form onSubmit={handleCreateReward} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nom *</label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                    >
                      <option value="individual">Individuelle</option>
                      <option value="team">Equipe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Cout XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Icone (emoji)</label>
                  <input
                    type="text"
                    value={rewardForm.icon}
                    onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white text-2xl text-center"
                    maxLength="2"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold">
                    Creer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL EDITION */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-800 border-t sm:border border-white/20 rounded-t-3xl sm:rounded-xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center sm:hidden mb-4">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-blue-400" />
                Modifier
              </h2>
              <form onSubmit={handleUpdateReward} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nom *</label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                    >
                      <option value="individual">Individuelle</option>
                      <option value="team">Equipe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Cout XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Icone</label>
                  <input
                    type="text"
                    value={rewardForm.icon}
                    onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white text-2xl text-center"
                    maxLength="2"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold">
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CONTRIBUTION */}
      <AnimatePresence>
        {showContributionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setShowContributionModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-800 border-t sm:border border-white/20 rounded-t-3xl sm:rounded-xl p-6 w-full sm:max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center sm:hidden mb-4">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-400" />
                Contribuer
              </h2>
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Montant XP</label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  min="10"
                  step="10"
                  className="w-full px-4 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-2xl font-bold text-center focus:border-green-500 focus:outline-none"
                />
                <div className="flex gap-2 mt-3">
                  {[50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setContributionAmount(amount)}
                      className="flex-1 py-2 bg-slate-700 rounded-lg text-gray-300 hover:bg-slate-600 transition-all text-sm"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowContributionModal(false)} className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
                  Annuler
                </button>
                <button
                  onClick={handleContribution}
                  disabled={contributing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {contributing ? 'En cours...' : `Contribuer ${contributionAmount} XP`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL SUGGESTION */}
      <AnimatePresence>
        {showSuggestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setShowSuggestionModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-800 border-t sm:border border-white/20 rounded-t-3xl sm:rounded-xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center sm:hidden mb-4">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-400" />
                Suggerer une recompense
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Propose une recompense que tu aimerais voir dans la boutique. Les suggestions les plus populaires seront ajoutees !
              </p>

              <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nom de la recompense *</label>
                  <input
                    type="text"
                    value={suggestionForm.name}
                    onChange={(e) => setSuggestionForm({...suggestionForm, name: e.target.value})}
                    placeholder="Ex: Journee teletravail, Carte cinema..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description (optionnel)</label>
                  <textarea
                    value={suggestionForm.description}
                    onChange={(e) => setSuggestionForm({...suggestionForm, description: e.target.value})}
                    placeholder="Decris ta recompense ideale..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Cout XP suggere (optionnel)</label>
                  <input
                    type="number"
                    value={suggestionForm.estimatedCost}
                    onChange={(e) => setSuggestionForm({...suggestionForm, estimatedCost: e.target.value})}
                    placeholder="Ex: 500"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                    min="1"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Le cout final sera determine par l'equipe
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSuggestionModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSuggestion || !suggestionForm.name.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingSuggestion ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETAILS RECOMPENSE */}
      <RewardDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        reward={detailReward}
        userSpendableXP={userSpendableXP}
        userTotalXP={userTotalXP}
        teamPoolXP={teamPoolXP}
        onPurchase={handleRequestReward}
        isPurchasing={isPurchasing}
      />

      {/* ANIMATION SUCCES */}
      <PurchaseSuccessAnimation
        isVisible={showPurchaseSuccess}
        reward={purchasedReward}
        onComplete={handleClosePurchaseSuccess}
      />
    </Layout>
  );
};

export default RewardsPage;
