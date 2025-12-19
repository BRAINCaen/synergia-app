// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES - COMPLÈTE AVEC POOL ÉQUIPE
// ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
// ==========================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Search, Filter, Star, Gift, Coins, Users, Target,
  Plus, Edit2, Trash2, Settings, AlertCircle, Check, X,
  ShoppingCart, Clock, User, Calendar, TrendingUp, Crown,
  Shield, Eye, EyeOff, Package, Zap, Heart, Coffee, Gamepad2,
  MapPin, Camera, Music, Book, Palette, Dumbbell, ChefHat, Save
} from 'lucide-react';
import notificationService from '../core/services/notificationService.js';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// 🛒 COMPOSANTS BOUTIQUE MODULE 5
import { RewardDetailModal, PurchaseSuccessAnimation, WishlistCard } from '../components/shop';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';

// 📊 FIREBASE IMPORTS
import {
  collection, query, orderBy, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, limit
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS RÉCOMPENSES
  const [userRewards, setUserRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [teamPoolXP, setTeamPoolXP] = useState(0);
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

  // 🛒 ÉTATS BOUTIQUE MODULE 5
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailReward, setDetailReward] = useState(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchasedReward, setPurchasedReward] = useState(null);
  const [wishlistReward, setWishlistReward] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // 💰 ÉTATS CAGNOTTE ÉQUIPE (MODULE 8)
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(100);
  const [topContributors, setTopContributors] = useState([]);

  // 🏆 HOOK CAGNOTTE
  const {
    stats: poolStats,
    loading: poolLoading,
    contributing,
    contributeManually,
    refreshPoolData,
    autoContributionRate
  } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true,
    enableContributions: true
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
  // ✅ ÉCOUTER LE POOL D'ÉQUIPE EN TEMPS RÉEL
  // CAGNOTTE SÉPARÉE DANS teamPool/main
  // ==========================================

  useEffect(() => {
    console.log('🔄 [RewardsPage] Écoute du pool équipe (cagnotte séparée)...');
    
    const poolRef = doc(db, 'teamPool', 'main');
    
    const unsubscribe = onSnapshot(poolRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const poolData = docSnapshot.data();
        const poolXP = poolData.totalXP || 0;
        setTeamPoolXP(poolXP);
        console.log('✅ [RewardsPage] Pool Équipe synchronisé:', poolXP, 'XP');
      } else {
        console.log('⚠️ [RewardsPage] Pool équipe non initialisé, valeur à 0');
        setTeamPoolXP(0);
      }
    }, (error) => {
      console.error('❌ [RewardsPage] Erreur écoute pool:', error);
      setTeamPoolXP(0);
    });

    return () => {
      console.log('🔌 [RewardsPage] Déconnexion listener pool équipe');
      unsubscribe();
    };
  }, []);

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

      // ✅ LE POOL EST ÉCOUTÉ EN TEMPS RÉEL PAR LE LISTENER CI-DESSUS
      console.log('✅ Pool équipe géré par listener temps réel sur teamPool/main');

      // Charger les récompenses custom de Firebase
      const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
      const firebaseRewards = [];
      const hiddenRewardIds = [];
      
      rewardsSnapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.isHidden && data.originalId) {
          hiddenRewardIds.push(data.originalId);
        } else if (!data.isHidden) {
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

      // Charger top contributeurs
      await loadTopContributors();
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      alert('Erreur de chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 💰 CHARGER TOP CONTRIBUTEURS
  const loadTopContributors = async () => {
    try {
      const q = query(
        collection(db, 'teamContributions'),
        orderBy('amount', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);

      const contributorMap = new Map();
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const existing = contributorMap.get(data.userId) || {
          total: 0,
          count: 0,
          email: data.userEmail
        };
        existing.total += data.amount;
        existing.count += 1;
        contributorMap.set(data.userId, existing);
      });

      const sorted = Array.from(contributorMap.entries())
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopContributors(sorted);
    } catch (err) {
      console.error('Erreur chargement contributeurs:', err);
    }
  };

  // 🔄 RAFRAÎCHIR PROFIL UTILISATEUR (pour XP dépensables après contribution)
  const refreshUserProfile = async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        console.log('✅ Profil utilisateur rafraîchi');
      }
    } catch (err) {
      console.error('❌ Erreur refresh profil:', err);
    }
  };

  // 💰 CONTRIBUTION MANUELLE
  const handleContribution = async () => {
    const result = await contributeManually(contributionAmount);
    if (result.success) {
      setShowContributionModal(false);
      setContributionAmount(100);

      // ✅ RAFRAÎCHIR TOUTES LES DONNÉES IMMÉDIATEMENT
      await Promise.all([
        loadTopContributors(),
        refreshPoolData(),
        refreshUserProfile()  // 🔥 Rafraîchir les XP dépensables
      ]);
    } else {
      alert(`❌ Erreur: ${result.error}`);
    }
  };

  // 🎨 COULEURS PAR NIVEAU POOL
  const getPoolLevelGradient = (level) => {
    switch (level) {
      case 'BRONZE': return 'from-amber-600 to-amber-800';
      case 'SILVER': return 'from-gray-300 to-gray-500';
      case 'GOLD': return 'from-yellow-400 to-amber-500';
      case 'PLATINUM': return 'from-purple-400 to-purple-600';
      case 'DIAMOND': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getPoolLevelEmoji = (level) => {
    switch (level) {
      case 'BRONZE': return '🥉';
      case 'SILVER': return '🥈';
      case 'GOLD': return '🥇';
      case 'PLATINUM': return '💎';
      case 'DIAMOND': return '👑';
      default: return '🏆';
    }
  };

  // ==========================================
  // ✅ CALCUL CORRECT DES XP DÉPENSABLES
  // Formule fiable : totalXp - totalSpentXp
  // ==========================================

  const getSpendableXP = () => {
    const totalXP = userProfile?.gamification?.totalXp || 0;
    const totalSpentXP = userProfile?.gamification?.totalSpentXp || 0;
    
    // ✅ CALCUL FIABLE : XP gagnés - XP dépensés = XP restants
    const soldeRestant = totalXP - totalSpentXP;
    console.log(`✅ [RewardsPage] Calcul XP dépensables: ${totalXP} - ${totalSpentXP} = ${soldeRestant}`);
    
    return Math.max(0, soldeRestant); // Ne pas retourner de valeur négative
  };

  // ==========================================
  // 🛒 HANDLERS BOUTIQUE MODULE 5
  // ==========================================

  // Ouvrir le modal de détail
  const handleOpenDetail = useCallback((reward) => {
    setDetailReward(reward);
    setShowDetailModal(true);
  }, []);

  // Fermer le modal de détail
  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setDetailReward(null);
  }, []);

  // Définir comme objectif (wishlist)
  const handleSetWishlist = useCallback((reward) => {
    setWishlistReward(reward);
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('synergia_wishlist', JSON.stringify(reward));
  }, []);

  // Retirer l'objectif
  const handleRemoveWishlist = useCallback(() => {
    setWishlistReward(null);
    localStorage.removeItem('synergia_wishlist');
  }, []);

  // Charger wishlist depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('synergia_wishlist');
    if (saved) {
      try {
        setWishlistReward(JSON.parse(saved));
      } catch (e) {
        console.warn('⚠️ Erreur chargement wishlist:', e);
      }
    }
  }, []);

  // ==========================================
  // 🎁 DEMANDER UNE RÉCOMPENSE
  // ✅ Vérification avec spendableXp pour récompenses individuelles
  // ==========================================

  const handleRequestReward = async (reward) => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

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

      // 🔔 NOTIFIER LES ADMINS
      try {
        await notificationService.notifyRewardRequestPending({
          rewardId: reward.id,
          rewardName: reward.name,
          userId: user.uid,
          userName: user.displayName || user.email,
          xpCost: reward.xpCost
        });
        console.log('🔔 [NOTIF] Admins notifiés de la demande de récompense');
      } catch (notifError) {
        console.warn('⚠️ [NOTIF] Erreur notification admins:', notifError);
      }

      // Fermer le modal de détail et afficher l'animation de succès
      setShowDetailModal(false);
      setDetailReward(null);
      setPurchasedReward(reward);
      setShowPurchaseSuccess(true);

      await loadAllData();
    } catch (error) {
      console.error('❌ Erreur demande:', error);
      alert('Erreur lors de la demande');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Fermer l'animation de succès
  const handleClosePurchaseSuccess = useCallback(() => {
    setShowPurchaseSuccess(false);
    setPurchasedReward(null);
  }, []);

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
      console.log('🔄 Modification de:', selectedReward.name);
      
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
        console.log('🔄 Création version modifiée pour récompense par défaut:', selectedReward.id);
        
        await addDoc(collection(db, 'rewards'), {
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
          replacesDefault: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
        
        await addDoc(collection(db, 'rewards'), {
          originalId: selectedReward.id,
          isHidden: true,
          isDefault: false,
          isFirebase: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }

      alert('✅ Récompense modifiée avec succès !');
      setShowEditModal(false);
      setSelectedReward(null);
      
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

  // ✅ SYSTÈME 2 COMPTEURS : récupérer les valeurs CORRECTES
  const userTotalXP = userProfile?.gamification?.totalXp || 0;
  const userSpendableXP = getSpendableXP(); // ✅ UTILISE LA FONCTION CORRIGÉE
  const totalSpentXP = userProfile?.gamification?.totalSpentXp || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 🎯 EN-TÊTE */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-3">
              <Gift className="w-10 h-10 text-purple-400" />
              Boutique de Récompenses
            </h1>
            <p className="text-gray-400">
              Dépensez vos XP pour obtenir des avantages exclusifs !
            </p>
          </div>

          {/* ✅ 📊 STATISTIQUES - SYSTÈME 2 COMPTEURS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* XP de Prestige (classements) */}
            <div className="bg-white/10 backdrop-blur-lg border border-yellow-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 font-semibold">💎 XP Prestige</p>
                  <p className="text-2xl font-bold text-white">{userTotalXP.toLocaleString()}</p>
                  <p className="text-xs text-yellow-400">Classements & niveaux</p>
                </div>
              </div>
            </div>

            {/* XP Dépensables (achats) - ✅ AFFICHE LE SOLDE RESTANT */}
            <div className="bg-white/10 backdrop-blur-lg border border-green-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 font-semibold">🛒 XP Dépensables</p>
                  <p className="text-2xl font-bold text-white">{userSpendableXP.toLocaleString()}</p>
                  <p className="text-xs text-green-400">Pour récompenses perso</p>
                </div>
              </div>
            </div>

            {/* Pool Équipe */}
            <div className="bg-white/10 backdrop-blur-lg border border-purple-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 font-semibold">👥 Pool Équipe</p>
                  <p className="text-2xl font-bold text-white">{teamPoolXP.toLocaleString()}</p>
                  <p className="text-xs text-purple-400">🎁 Cagnotte collective</p>
                </div>
              </div>
            </div>

            {/* Demandes en cours */}
            <div className="bg-white/10 backdrop-blur-lg border border-blue-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Demandes</p>
                  <p className="text-2xl font-bold text-white">{userRewards.filter(r => r.status === 'pending').length}</p>
                  <p className="text-xs text-blue-400">En attente</p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ INFO SYSTÈME 2 COMPTEURS */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-blue-400 mb-1">💡 Système XP intelligent</p>
                <p>
                  <span className="text-yellow-400">💎 XP Prestige</span> : Vos efforts restent visibles dans les classements, niveaux et profil - <strong>ne diminuent jamais</strong>.
                </p>
                <p>
                  <span className="text-green-400">🛒 XP Dépensables</span> : Utilisables pour acheter des récompenses individuelles - <strong>se déduisent à l'achat</strong>.
                </p>
                <p>
                  <span className="text-purple-400">👥 Pool Équipe</span> : Cagnotte collective pour les récompenses d'équipe.
                </p>
              </div>
            </div>
          </div>

          {/* 🎯 CARTE OBJECTIF (WISHLIST) */}
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

          {/* 🛡️ BOUTON ADMIN */}
          {userIsAdmin && (
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Créer une récompense
              </button>
            </div>
          )}

          {/* 🎯 ONGLETS */}
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
              Récompenses Équipe
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                {allRewards.filter(r => r.type === 'team').length}
              </span>
            </button>
          </div>

          {/* 💰 SECTION CAGNOTTE ÉQUIPE - Affichée uniquement dans l'onglet équipe */}
          {activeTab === 'team' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {/* Hero Card Cagnotte */}
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                  <div className="text-center md:text-left mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{getPoolLevelEmoji(poolStats?.currentLevel || 'BRONZE')}</span>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPoolLevelGradient(poolStats?.currentLevel || 'BRONZE')} text-white text-sm font-bold`}>
                        Niveau {poolStats?.currentLevel || 'BRONZE'}
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2">
                      {(poolStats?.totalXP || teamPoolXP || 0).toLocaleString()} <span className="text-2xl">XP</span>
                    </div>
                    <p className="text-white/80">
                      {poolStats?.contributorsCount || 0} contributeurs • Taux: {autoContributionRate || 20}%
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowContributionModal(true)}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Contribuer
                    </button>
                    {poolStats?.nextLevel && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex justify-between text-white/80 text-xs mb-1">
                          <span>Vers {poolStats.nextLevel}</span>
                          <span>{poolStats.progressToNext?.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            style={{ width: `${poolStats.progressToNext?.progress || 0}%` }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getPoolLevelGradient(poolStats.nextLevel)}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Contributeurs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Top Contributeurs
                  </h3>
                  <div className="space-y-2">
                    {topContributors.length === 0 ? (
                      <p className="text-gray-400 text-sm">Aucun contributeur</p>
                    ) : (
                      topContributors.map((contributor, index) => (
                        <div key={contributor.userId} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                            </span>
                            <span className="text-gray-300 text-sm truncate max-w-[120px]">
                              {contributor.email?.split('@')[0] || 'Anonyme'}
                            </span>
                          </div>
                          <span className="text-green-400 font-semibold text-sm">
                            +{contributor.total?.toLocaleString()} XP
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Info système */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Comment ça marche ?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">🎯</span>
                      <div>
                        <p className="text-white text-sm font-medium">Contribution Auto</p>
                        <p className="text-gray-400 text-xs">{autoContributionRate || 20}% de tes XP vont à la cagnotte</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💪</span>
                      <div>
                        <p className="text-white text-sm font-medium">Garde tes XP</p>
                        <p className="text-gray-400 text-xs">Tu gardes {100 - (autoContributionRate || 20)}% pour tes récompenses perso</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xl">🎁</span>
                      <div>
                        <p className="text-white text-sm font-medium">Récompenses</p>
                        <p className="text-gray-400 text-xs">Achetez des récompenses pour toute l'équipe !</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 🔍 FILTRES */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
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

          {/* 🏆 GRILLE DES RÉCOMPENSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              // ✅ SYSTÈME 2 COMPTEURS : utiliser la fonction corrigée
              const currentSpendableXP = getSpendableXP();
              const requiredXP = reward.type === 'team' ? teamPoolXP : currentSpendableXP;
              const canAfford = requiredXP >= reward.xpCost;
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: canAfford ? 1.02 : 1 }}
                  className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                    canAfford ? 'hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50' : 'opacity-60'
                  }`}
                  onClick={() => handleOpenDetail(reward)}
                >
                  {/* Header gradient */}
                  <div className={`h-2 bg-gradient-to-r ${getRewardColor(reward)}`}></div>

                  {/* Badge wishlist */}
                  {wishlistReward?.id === reward.id && (
                    <div className="absolute top-4 right-4 bg-pink-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                      <Target className="w-3 h-3" />
                      Objectif
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icône et nom */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{reward.icon}</span>
                        <div>
                          <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            reward.type === 'team'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {reward.type === 'team' ? '👥 Équipe' : '👤 Individuelle'}
                          </span>
                        </div>
                      </div>

                      {/* Actions admin + wishlist */}
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Bouton wishlist */}
                        {reward.type === 'individual' && !canAfford && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (wishlistReward?.id === reward.id) {
                                handleRemoveWishlist();
                              } else {
                                handleSetWishlist(reward);
                              }
                            }}
                            className={`p-1 transition-colors ${
                              wishlistReward?.id === reward.id
                                ? 'text-pink-400 hover:text-pink-300'
                                : 'text-gray-400 hover:text-pink-400'
                            }`}
                            title={wishlistReward?.id === reward.id ? 'Retirer objectif' : 'Définir comme objectif'}
                          >
                            <Target className="w-4 h-4" />
                          </button>
                        )}
                        {userIsAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {reward.isFirebase && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReward(reward);
                                }}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{reward.description}</p>

                    {/* Coût et bouton */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">{reward.xpCost.toLocaleString()}</span>
                        <span className="text-gray-400 ml-1">XP</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAfford) {
                            handleOpenDetail(reward);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Voir détails' : 'XP insuffisants'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Message si aucune récompense */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">Aucune récompense trouvée</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres</p>
            </div>
          )}

          {/* 📋 MES DEMANDES */}
          {userRewards.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Mes demandes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRewards.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{request.rewardIcon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{request.rewardName}</h4>
                        <p className="text-sm text-gray-400">{request.xpCost} XP</p>
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
                      {request.status === 'pending' ? 'En attente' :
                       request.status === 'approved' ? 'Approuvée' : 'Refusée'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🆕 MODAL CRÉATION */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-400" />
                Nouvelle récompense
              </h2>
              
              <form onSubmit={handleCreateReward} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nom *</label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    rows="2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="individual">Individuelle</option>
                      <option value="team">Équipe</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Coût XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Icône (emoji)</label>
                  <input
                    type="text"
                    value={rewardForm.icon}
                    onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    maxLength="2"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✏️ MODAL ÉDITION */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-blue-400" />
                Modifier la récompense
              </h2>
              
              <form onSubmit={handleUpdateReward} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nom *</label>
                  <input
                    type="text"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    rows="2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="individual">Individuelle</option>
                      <option value="team">Équipe</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Coût XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Icône (emoji)</label>
                  <input
                    type="text"
                    value={rewardForm.icon}
                    onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    maxLength="2"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💰 MODAL CONTRIBUTION */}
      <AnimatePresence>
        {showContributionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowContributionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-400" />
                Contribuer à la Cagnotte
              </h2>

              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Montant XP</label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  min="10"
                  step="10"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-xl font-bold text-center focus:border-green-500 focus:outline-none transition-all"
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
                <button
                  onClick={() => setShowContributionModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleContribution}
                  disabled={contributing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  {contributing ? 'En cours...' : `Contribuer ${contributionAmount} XP`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛒 MODAL DÉTAILS RÉCOMPENSE - MODULE 5 */}
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

      {/* 🎉 ANIMATION SUCCÈS ACHAT - MODULE 5 */}
      <PurchaseSuccessAnimation
        isVisible={showPurchaseSuccess}
        reward={purchasedReward}
        onComplete={handleClosePurchaseSuccess}
      />
    </Layout>
  );
};

export default RewardsPage;
