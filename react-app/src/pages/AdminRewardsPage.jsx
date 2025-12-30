// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// PAGE ADMIN RÉCOMPENSES - POOL ÉQUIPE CORRECT
// ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
// ✅ CALCUL CORRIGÉ : spendableXp = totalXp - totalSpentXp
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  X,
  Eye,
  User,
  Calendar,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Gift,
  Coins,
  Clock4,
  MessageSquare,
  Zap,
  Users,
  Crown,
  Star,
  Package,
  Plus,
  Minus,
  Infinity,
  Edit,
  Save,
  RotateCcw,
  UserCheck,
  UserX,
  Search
} from 'lucide-react';
import notificationService from '../core/services/notificationService.js';
import { rewardsService } from '../core/services/rewardsService.js';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// Firebase imports
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// 📊 CATALOGUES COMPLETS DES RÉCOMPENSES
// ==========================================

const DEFAULT_INDIVIDUAL_REWARDS = [
  // Mini-plaisirs (50-100 XP) - Illimités par défaut
  { id: 'snack', name: 'Goûter surprise', description: 'Un goûter de ton choix', xpCost: 50, icon: '🍪', category: 'Mini-plaisirs', type: 'individual', stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'coffee', name: 'Café premium', description: 'Un café de spécialité', xpCost: 75, icon: '☕', category: 'Mini-plaisirs', type: 'individual', stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'tea', name: 'Thé premium', description: 'Une sélection de thés fins', xpCost: 80, icon: '🍵', category: 'Mini-plaisirs', type: 'individual', stockType: 'unlimited', stockTotal: null, stockRemaining: null },

  // Petits avantages (100-200 XP)
  { id: 'earlyLeave', name: 'Sortie anticipée', description: 'Partir 30 min plus tôt', xpCost: 150, icon: '🏃', category: 'Petits avantages', type: 'individual', stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'parking', name: 'Place de parking', description: 'Place réservée pour une semaine', xpCost: 180, icon: '🅿️', category: 'Petits avantages', type: 'individual', stockType: 'limited', stockTotal: 5, stockRemaining: 5 },

  // Plaisirs utiles (200-400 XP) - Limités (physiques)
  { id: 'headphones', name: 'Écouteurs', description: 'Écouteurs sans fil', xpCost: 300, icon: '🎧', category: 'Plaisirs utiles', type: 'individual', stockType: 'limited', stockTotal: 3, stockRemaining: 3 },
  { id: 'powerbank', name: 'Batterie externe', description: 'Power bank haute capacité', xpCost: 250, icon: '🔋', category: 'Plaisirs utiles', type: 'individual', stockType: 'limited', stockTotal: 5, stockRemaining: 5 },

  // Food & cadeaux (400-700 XP)
  { id: 'restaurant', name: 'Restaurant', description: 'Bon pour un restaurant', xpCost: 500, icon: '🍽️', category: 'Food & cadeaux', type: 'individual', stockType: 'limited', stockTotal: 10, stockRemaining: 10 },
  { id: 'giftCard', name: 'Carte cadeau 30€', description: 'Utilisable en magasin', xpCost: 600, icon: '🎁', category: 'Food & cadeaux', type: 'individual', stockType: 'limited', stockTotal: 5, stockRemaining: 5 },

  // Bien-être (700-1000 XP)
  { id: 'massage', name: 'Massage', description: 'Séance de massage professionnel', xpCost: 800, icon: '💆', category: 'Bien-être', type: 'individual', stockType: 'limited', stockTotal: 3, stockRemaining: 3 },
  { id: 'ergonomic', name: 'Accessoire ergonomique', description: 'Fauteuil ou coussin ergonomique', xpCost: 900, icon: '🪑', category: 'Bien-être', type: 'individual', stockType: 'limited', stockTotal: 2, stockRemaining: 2 },

  // Loisirs (1000-1500 XP)
  { id: 'cinema', name: 'Pack cinéma', description: '2 places de cinéma + popcorn', xpCost: 1200, icon: '🎬', category: 'Loisirs', type: 'individual', stockType: 'limited', stockTotal: 10, stockRemaining: 10 },
  { id: 'concert', name: 'Concert', description: 'Billet pour un concert', xpCost: 1400, icon: '🎵', category: 'Loisirs', type: 'individual', stockType: 'limited', stockTotal: 2, stockRemaining: 2 },

  // Lifestyle (1500-2500 XP)
  { id: 'gadget', name: 'Gadget tech', description: 'Objet technologique au choix', xpCost: 2000, icon: '📺', category: 'Lifestyle', type: 'individual', stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'sport', name: 'Équipement sportif', description: 'Matériel pour ton sport préféré', xpCost: 2300, icon: '⚽', category: 'Lifestyle', type: 'individual', stockType: 'limited', stockTotal: 2, stockRemaining: 2 },

  // Temps offert (2500-4000 XP) - Limités
  { id: 'halfDay', name: 'Demi-journée congé', description: 'Une demi-journée de repos supplémentaire', xpCost: 2800, icon: '🌅', category: 'Temps offert', type: 'individual', stockType: 'limited', stockTotal: 10, stockRemaining: 10 },
  { id: 'fullDay', name: 'Jour de congé bonus', description: 'Un jour de congé supplémentaire', xpCost: 3500, icon: '🏖️', category: 'Temps offert', type: 'individual', stockType: 'limited', stockTotal: 5, stockRemaining: 5 },

  // Grands plaisirs (4000-6000 XP)
  { id: 'weekend', name: 'Week-end découverte', description: 'Un week-end dans un lieu touristique', xpCost: 5000, icon: '🗺️', category: 'Grands plaisirs', type: 'individual', stockType: 'limited', stockTotal: 1, stockRemaining: 1 },
  { id: 'spa', name: 'Journée spa', description: 'Une journée complète dans un spa', xpCost: 4500, icon: '🧖', category: 'Grands plaisirs', type: 'individual', stockType: 'limited', stockTotal: 2, stockRemaining: 2 },

  // Premium (6000+ XP) - Très limités
  { id: 'vacation', name: 'Semaine de vacances offerte', description: 'Une semaine de vacances payée', xpCost: 12500, icon: '✈️', category: 'Premium', type: 'individual', stockType: 'limited', stockTotal: 1, stockRemaining: 1 },
  { id: 'laptop', name: 'Ordinateur portable', description: 'Un laptop pour usage personnel', xpCost: 15000, icon: '💻', category: 'Premium', type: 'individual', stockType: 'limited', stockTotal: 1, stockRemaining: 1 }
];

const DEFAULT_TEAM_REWARDS = [
  { id: 'teamSnack', name: 'Goûter d\'équipe', description: 'Goûter pour toute l\'équipe', xpCost: 500, icon: '🍰', category: 'Team', type: 'team', stockType: 'unlimited', stockTotal: null, stockRemaining: null },
  { id: 'teamLunch', name: 'Déjeuner d\'équipe', description: 'Restaurant pour l\'équipe', xpCost: 1500, icon: '🍴', category: 'Team', type: 'team', stockType: 'limited', stockTotal: 4, stockRemaining: 4 },
  { id: 'teamActivity', name: 'Activité team building', description: 'Sortie ou activité collective', xpCost: 3000, icon: '🎯', category: 'Team', type: 'team', stockType: 'limited', stockTotal: 2, stockRemaining: 2 },
  { id: 'teamOuting', name: 'Sortie d\'équipe', description: 'Journée découverte en équipe', xpCost: 5000, icon: '🚀', category: 'Team', type: 'team', stockType: 'limited', stockTotal: 1, stockRemaining: 1 },
  { id: 'teamWeekend', name: 'Week-end d\'équipe', description: 'Week-end team building complet', xpCost: 10000, icon: '🏕️', category: 'Team', type: 'team', stockType: 'limited', stockTotal: 1, stockRemaining: 1 }
];

/**
 * 👑 PAGE ADMIN RÉCOMPENSES - POOL ÉQUIPE CORRECT
 * ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
 * ✅ CALCUL CORRIGÉ : spendableXp = totalXp - totalSpentXp
 */
const AdminRewardsPage = () => {
  const { user } = useAuthStore();

  // États locaux
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [firebaseRewards, setFirebaseRewards] = useState([]);
  const [teamPoolXP, setTeamPoolXP] = useState(0); // ✅ XP DU POOL ÉQUIPE

  // 📦 ÉTATS GESTION DES STOCKS
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSettings, setStockSettings] = useState({}); // {rewardId: {stockType, stockTotal, stockRemaining}}
  const [editingReward, setEditingReward] = useState(null);
  const [activeStockTab, setActiveStockTab] = useState('individual'); // 'individual' | 'team'

  // 👤 ÉTATS GESTION PAR UTILISATEUR
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedRewardForUsers, setSelectedRewardForUsers] = useState(null);
  const [usersWhoRedeemed, setUsersWhoRedeemed] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);
  const [customRewards, setCustomRewards] = useState([]); // Récompenses personnalisées de Firebase

  // Statistiques réelles
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedToday: 0,
    totalXpDistributed: 0
  });

  // ✅ ÉCOUTER LE POOL D'ÉQUIPE EN TEMPS RÉEL
  useEffect(() => {
    console.log('🔄 Écoute du pool d\'équipe...');
    
    const poolRef = doc(db, 'teamPool', 'main');
    
    const unsubscribe = onSnapshot(poolRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const poolData = docSnapshot.data();
        const poolXP = poolData.totalXP || 0;
        setTeamPoolXP(poolXP);
        console.log('✅ XP Pool Équipe:', poolXP);
      } else {
        console.log('⚠️ Pool équipe non initialisé, création...');
        // Initialiser le pool si nécessaire
        setTeamPoolXP(0);
      }
    }, (error) => {
      console.error('❌ Erreur écoute pool:', error);
      setTeamPoolXP(0);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 CHARGER LES RÉCOMPENSES FIREBASE + STOCKS
  useEffect(() => {
    const loadFirebaseRewards = async () => {
      try {
        const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
        const rewards = rewardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFirebaseRewards(rewards);
        console.log('✅ Récompenses Firebase chargées:', rewards.length);
      } catch (error) {
        console.error('❌ Erreur chargement récompenses Firebase:', error);
      }
    };

    loadFirebaseRewards();
  }, []);

  // 📦 CHARGER LES PARAMÈTRES DE STOCK DEPUIS FIREBASE
  useEffect(() => {
    const loadStockSettings = async () => {
      try {
        const stockDoc = await getDoc(doc(db, 'rewardStockSettings', 'main'));
        if (stockDoc.exists()) {
          setStockSettings(stockDoc.data().settings || {});
          console.log('✅ Paramètres de stock chargés');
        } else {
          // Initialiser avec les valeurs par défaut
          const defaultSettings = {};
          [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS].forEach(reward => {
            defaultSettings[reward.id] = {
              stockType: reward.stockType,
              stockTotal: reward.stockTotal,
              stockRemaining: reward.stockRemaining
            };
          });
          setStockSettings(defaultSettings);
        }
      } catch (error) {
        console.error('❌ Erreur chargement stock settings:', error);
      }
    };

    loadStockSettings();
  }, []);

  // 📦 SAUVEGARDER LES PARAMÈTRES DE STOCK
  const saveStockSettings = async (newSettings) => {
    try {
      const stockRef = doc(db, 'rewardStockSettings', 'main');

      // Utiliser setDoc avec merge pour créer ou mettre à jour
      await setDoc(stockRef, {
        settings: newSettings,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid
      }, { merge: true });

      setStockSettings(newSettings);
      console.log('✅ Paramètres de stock sauvegardés');
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde stock settings:', error);
      return false;
    }
  };

  // 📦 OBTENIR LE STOCK D'UNE RÉCOMPENSE
  const getRewardStock = (rewardId) => {
    // D'abord vérifier dans les settings Firebase
    if (stockSettings[rewardId]) {
      return stockSettings[rewardId];
    }
    // Sinon, utiliser les valeurs par défaut
    const defaultReward = [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS].find(r => r.id === rewardId);
    if (defaultReward) {
      return {
        stockType: defaultReward.stockType,
        stockTotal: defaultReward.stockTotal,
        stockRemaining: defaultReward.stockRemaining
      };
    }
    return { stockType: 'unlimited', stockTotal: null, stockRemaining: null };
  };

  // 📦 METTRE À JOUR LE STOCK D'UNE RÉCOMPENSE
  const updateRewardStock = async (rewardId, newStock) => {
    const newSettings = {
      ...stockSettings,
      [rewardId]: newStock
    };
    const success = await saveStockSettings(newSettings);
    if (success) {
      alert(`✅ Stock mis à jour pour ${rewardId}`);
    } else {
      alert('❌ Erreur lors de la mise à jour du stock');
    }
  };

  // ==========================================
  // 👤 GESTION PAR UTILISATEUR
  // ==========================================

  // Obtenir toutes les récompenses (défaut + personnalisées)
  const getAllRewards = () => {
    const allRewards = [
      ...DEFAULT_INDIVIDUAL_REWARDS.map(r => ({ ...r, isDefault: true })),
      ...DEFAULT_TEAM_REWARDS.map(r => ({ ...r, isDefault: true })),
      ...customRewards.map(r => ({ ...r, isDefault: false, isCustom: true }))
    ];
    return allRewards;
  };

  // Charger les utilisateurs qui ont échangé une récompense
  const loadUsersWhoRedeemed = async (reward) => {
    if (!user?.uid) return;

    setLoadingUsers(true);
    setSelectedRewardForUsers(reward);
    setShowUserModal(true);

    try {
      const users = await rewardsService.getUsersWhoRedeemed(user.uid, reward.id);
      setUsersWhoRedeemed(users);
      console.log('👥 Utilisateurs chargés:', users.length);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      setUsersWhoRedeemed([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Réinitialiser l'échange d'un utilisateur
  const resetUserRedemption = async (userId, rewardId) => {
    if (!user?.uid) return;

    setResettingUser(userId);

    try {
      const result = await rewardsService.resetUserRedemption(user.uid, userId, rewardId);
      alert(`✅ ${result.message}`);

      // Recharger la liste
      const users = await rewardsService.getUsersWhoRedeemed(user.uid, rewardId);
      setUsersWhoRedeemed(users);
    } catch (error) {
      console.error('❌ Erreur reset:', error);
      alert('❌ Erreur lors de la réinitialisation');
    } finally {
      setResettingUser(null);
    }
  };

  // Charger les récompenses personnalisées
  useEffect(() => {
    const loadCustomRewards = async () => {
      if (!user?.uid) return;
      try {
        const rewards = await rewardsService.getAllRewardsForAdmin(user.uid);

        // 🔧 Filtrer les récompenses valides et actives uniquement
        const defaultIds = [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS].map(r => r.id);

        const validRewards = rewards.filter(r => {
          // Exclure si c'est un ID de récompense par défaut (éviter doublons)
          if (defaultIds.includes(r.id)) return false;
          // Exclure si inactive ou supprimée
          if (r.isActive === false || r.isDeleted === true) return false;
          // Exclure si données manquantes (nom vide ou pas de coût)
          if (!r.name || r.name.trim() === '' || !r.xpCost) return false;
          return true;
        });

        setCustomRewards(validRewards);
        console.log('📦 Récompenses personnalisées valides:', validRewards.length, '/', rewards.length);
      } catch (error) {
        console.error('❌ Erreur chargement récompenses personnalisées:', error);
      }
    };
    loadCustomRewards();
  }, [user?.uid]);

  /**
   * 🎁 OBTENIR LES DÉTAILS D'UNE RÉCOMPENSE
   */
  const getRewardDetails = (rewardId, rewardName, rewardIcon, rewardType) => {
    // 1. Chercher dans Firebase
    const firebaseReward = firebaseRewards.find(r => r.id === rewardId);
    if (firebaseReward) {
      return {
        name: firebaseReward.name,
        description: firebaseReward.description || '',
        xpCost: firebaseReward.xpCost,
        icon: firebaseReward.icon || '🎁',
        category: firebaseReward.category || 'Personnalisée',
        type: firebaseReward.type || 'individual'
      };
    }

    // 2. Chercher dans catalogues par défaut
    const allDefaultRewards = [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS];
    const defaultReward = allDefaultRewards.find(r => r.id === rewardId);
    if (defaultReward) {
      return defaultReward;
    }

    // 3. Fallback
    return { 
      name: rewardName || rewardId || 'Récompense inconnue', 
      description: '',
      xpCost: 0, 
      icon: rewardIcon || '🎁',
      category: 'Inconnue',
      type: rewardType || 'individual'
    };
  };

  /**
   * 🎨 COULEUR PAR COÛT XP
   */
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

  // 🔥 ÉCOUTE FIREBASE DES DEMANDES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Écoute Firebase des demandes...');
    
    const rewardRequestsQuery = query(
      collection(db, 'rewardRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(rewardRequestsQuery, async (snapshot) => {
      console.log(`📥 ${snapshot.docs.length} demandes trouvées`);
      
      const requestsWithUserData = [];
      
      for (const requestDoc of snapshot.docs) {
        const requestData = requestDoc.data();
        
        try {
          const userRef = doc(db, 'users', requestData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : null;

          // ✅ CALCUL CORRECT DES XP DÉPENSABLES : totalXp - totalSpentXp
          const gamification = userData?.gamification || {};
          const totalXp = gamification.totalXp || 0;
          const totalSpentXp = gamification.totalSpentXp || 0;
          const calculatedSpendableXp = Math.max(0, totalXp - totalSpentXp);
          
          console.log(`📊 [${userData?.email}] XP: total=${totalXp}, dépensé=${totalSpentXp}, restant=${calculatedSpendableXp}`);

          requestsWithUserData.push({
            id: requestDoc.id,
            ...requestData,
            userData,
            userName: userData?.profile?.displayName || userData?.email?.split('@')[0] || 'Utilisateur inconnu',
            userEmail: userData?.email || 'Email inconnu',
            // ✅ SYSTÈME 2 COMPTEURS - CALCUL CORRIGÉ
            userTotalXP: totalXp,
            userSpendableXP: calculatedSpendableXp, // ✅ CALCUL : totalXp - totalSpentXp
            userTotalSpentXP: totalSpentXp,
            // Garder userXP pour compatibilité
            userXP: calculatedSpendableXp
          });
        } catch (error) {
          console.error('❌ Erreur récupération utilisateur:', error);
        }
      }
      
      setRequests(requestsWithUserData);
      setLoading(false);
      
      setStats(prev => ({
        ...prev,
        pendingRequests: requestsWithUserData.length
      }));
      
    }, (error) => {
      console.error('❌ Erreur écoute Firebase:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🔥 ÉCOUTE STATISTIQUES
  useEffect(() => {
    if (!user?.uid) return;

    const allRequestsQuery = query(
      collection(db, 'rewardRequests'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(allRequestsQuery, (snapshot) => {
      const allRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const approvedToday = allRequests.filter(req => {
        if (req.status !== 'approved' || !req.approvedAt) return false;
        const approvedDate = req.approvedAt.toDate ? req.approvedAt.toDate() : new Date(req.approvedAt);
        approvedDate.setHours(0, 0, 0, 0);
        return approvedDate.getTime() === today.getTime();
      }).length;

      const totalXpDistributed = allRequests
        .filter(req => req.status === 'approved')
        .reduce((sum, req) => sum + (req.xpCost || 0), 0);

      setStats({
        totalRequests: allRequests.length,
        pendingRequests: allRequests.filter(req => req.status === 'pending').length,
        approvedToday,
        totalXpDistributed
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  /**
   * ✅ APPROUVER UNE DEMANDE
   * ✅ SYSTÈME 2 COMPTEURS : Incrémenter totalSpentXp (pas toucher totalXp) pour individuel
   */
  const handleApprove = async (request) => {
    try {
      console.log('✅ Approbation de la demande:', request.id);
      
      const rewardDetails = getRewardDetails(request.rewardId, request.rewardName, request.rewardIcon, request.type);
      
      // ✅ VÉRIFICATION SELON LE TYPE
      if (rewardDetails.type === 'team') {
        // Récompense ÉQUIPE → vérifier le POOL
        if (teamPoolXP < rewardDetails.xpCost) {
          alert(`❌ Pool équipe insuffisant !\nDisponible: ${teamPoolXP} XP\nRequis: ${rewardDetails.xpCost} XP`);
          return;
        }
      } else {
        // ✅ Récompense INDIVIDUELLE → vérifier spendableXp (XP dépensables calculés)
        if (request.userSpendableXP < rewardDetails.xpCost) {
          alert(`❌ XP dépensables insuffisants !\nDisponible: ${request.userSpendableXP} XP\nRequis: ${rewardDetails.xpCost} XP\n\n💡 Les XP de prestige (${request.userTotalXP} XP) restent intacts pour les classements !`);
          return;
        }
      }

      // Mettre à jour la demande
      const requestRef = doc(db, 'rewardRequests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid,
        adminEmail: user.email
      });

      // 🔔 NOTIFIER L'UTILISATEUR DE L'APPROBATION
      try {
        await notificationService.notifyRewardApproved(request.userId, {
          rewardId: request.rewardId,
          rewardName: rewardDetails.name
        });
        console.log('🔔 [NOTIF] Utilisateur notifié de la récompense approuvée');
      } catch (notifError) {
        console.warn('⚠️ [NOTIF] Erreur notification:', notifError);
      }

      // ✅ DÉDUIRE LES XP DU BON ENDROIT
      if (rewardDetails.type === 'team') {
        // RÉCOMPENSE ÉQUIPE → Déduire du POOL collectif
        console.log(`💰 Déduction POOL ÉQUIPE: -${rewardDetails.xpCost} XP`);
        const poolRef = doc(db, 'teamPool', 'main');
        await updateDoc(poolRef, {
          totalXP: increment(-rewardDetails.xpCost),
          updatedAt: serverTimestamp()
        });
      } else {
        // ✅ RÉCOMPENSE INDIVIDUELLE → Incrémenter totalSpentXp SEULEMENT (pas toucher totalXp !)
        console.log(`👤 Déduction XP DÉPENSABLES: -${rewardDetails.xpCost} XP pour ${request.userName}`);
        console.log(`💎 XP de prestige (totalXp) INTACTS pour les classements !`);
        const userRef = doc(db, 'users', request.userId);
        await updateDoc(userRef, {
          // ✅ On incrémente totalSpentXp - le calcul (totalXp - totalSpentXp) donnera le bon résultat
          'gamification.totalSpentXp': increment(rewardDetails.xpCost),
          'gamification.rewardsRedeemed': increment(1),
          'gamification.lastRewardRedeemed': serverTimestamp(),
          lastActivity: serverTimestamp()
        });

        // 🏖️ Si c'est un jour de congé bonus, mettre à jour le compteur de congés
        if (request.rewardId === 'fullDay') {
          console.log(`🏖️ Ajout de 1 jour bonus au compteur congés pour ${request.userName}`);
          await updateDoc(userRef, {
            'leaveBalance.bonusOffDays': increment(1),
            'leaveBalance.lastUpdated': new Date().toISOString()
          });
        } else if (request.rewardId === 'halfDay') {
          console.log(`🌅 Ajout de 0.5 jour bonus au compteur congés pour ${request.userName}`);
          await updateDoc(userRef, {
            'leaveBalance.bonusOffDays': increment(0.5),
            'leaveBalance.lastUpdated': new Date().toISOString()
          });
        }
      }

      setShowModal(false);
      setSelectedRequest(null);
      
      const typeText = rewardDetails.type === 'team' ? '👥 ÉQUIPE' : '👤 INDIVIDUELLE';
      const sourceText = rewardDetails.type === 'team' 
        ? `Pool équipe: ${teamPoolXP} → ${teamPoolXP - rewardDetails.xpCost} XP`
        : `XP dépensables: ${request.userSpendableXP} → ${request.userSpendableXP - rewardDetails.xpCost} XP\n💎 XP prestige: ${request.userTotalXP} XP (inchangés)`;
        
      alert(`✅ Récompense ${typeText} approuvée !\n\n"${rewardDetails.name}"\nPour: ${request.userName}\n\n${sourceText}`);
      
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      alert('❌ Erreur lors de l\'approbation : ' + error.message);
    }
  };

  /**
   * ❌ REJETER UNE DEMANDE
   */
  const handleReject = async (request) => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      const requestRef = doc(db, 'rewardRequests', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid,
        rejectionReason: rejectionReason.trim(),
        adminEmail: user.email
      });

      // 🔔 NOTIFIER L'UTILISATEUR DU REJET
      try {
        await notificationService.notifyRewardRejected(request.userId, {
          rewardId: request.rewardId,
          rewardName: request.rewardName,
          reason: rejectionReason.trim()
        });
        console.log('🔔 [NOTIF] Utilisateur notifié du rejet de récompense');
      } catch (notifError) {
        console.warn('⚠️ [NOTIF] Erreur notification:', notifError);
      }

      setShowModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      alert(`❌ Demande rejetée.\n\nRaison: ${rejectionReason}`);
      
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      alert('❌ Erreur lors du rejet : ' + error.message);
    }
  };

  /**
   * 🔄 RAFRAÎCHIR
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      console.log('🔄 Données rafraîchies');
    }, 1000);
  };

  /**
   * 👁️ OUVRIR MODAL
   */
  const openModal = (request, type = 'view') => {
    const rewardDetails = getRewardDetails(request.rewardId, request.rewardName, request.rewardIcon, request.type);
    setSelectedRequest({
      ...request,
      rewardDetails
    });
    setModalType(type);
    setShowModal(true);
  };

  /**
   * 📊 FORMATER DATE
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  /**
   * ⏰ TEMPS RELATIF
   */
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Il y a moins d\'1h';
      if (hours < 24) return `Il y a ${hours}h`;
      return `Il y a ${Math.floor(hours / 24)} jour(s)`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Chargement administration...</h2>
            <p className="text-gray-400 mt-2">Synchronisation Firebase en cours</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* En-tête */}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <Shield className="w-6 h-6 sm:w-10 sm:h-10 text-purple-400" />
                  <span className="hidden sm:inline">Administration des Récompenses</span>
                  <span className="sm:hidden">Admin Récompenses</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg mt-1 sm:mt-2">
                  <span className="hidden sm:inline">Validation des demandes - Système 2 compteurs XP (prestige + dépensables)</span>
                  <span className="sm:hidden">Validation des demandes XP</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>

                <a
                  href="/rewards"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  <span className="hidden sm:inline">Page utilisateur</span>
                </a>

                {/* 📦 BOUTON GESTION DES STOCKS */}
                <button
                  onClick={() => setShowStockModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Gérer les stocks</span>
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-xs sm:text-sm font-medium">En attente</p>
                    <p className="text-xl sm:text-3xl font-bold text-white">{stats.pendingRequests}</p>
                    <p className="text-yellow-400/70 text-xs mt-1 hidden sm:block">Temps réel</p>
                  </div>
                  <Clock4 className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-blue-400/30 rounded-xl p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-xs sm:text-sm font-medium">Total</p>
                    <p className="text-xl sm:text-3xl font-bold text-white">{stats.totalRequests}</p>
                    <p className="text-blue-400/70 text-xs mt-1 hidden sm:block">Demandes</p>
                  </div>
                  <BarChart3 className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-green-400/30 rounded-xl p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-xs sm:text-sm font-medium">Aujourd'hui</p>
                    <p className="text-xl sm:text-3xl font-bold text-white">{stats.approvedToday}</p>
                    <p className="text-green-400/70 text-xs mt-1 hidden sm:block">Approuvées</p>
                  </div>
                  <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-purple-400/30 rounded-xl p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-xs sm:text-sm font-medium">XP distribués</p>
                    <p className="text-xl sm:text-3xl font-bold text-white">{stats.totalXpDistributed.toLocaleString()}</p>
                    <p className="text-purple-400/70 text-xs mt-1 hidden sm:block">Total</p>
                  </div>
                  <Coins className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400" />
                </div>
              </div>

              {/* ✅ POOL ÉQUIPE */}
              <div className="bg-white/10 backdrop-blur-lg border border-pink-400/30 rounded-xl p-3 sm:p-6 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-400 text-xs sm:text-sm font-medium">Pool Équipe</p>
                    <p className="text-xl sm:text-3xl font-bold text-white">{teamPoolXP.toLocaleString()}</p>
                    <p className="text-pink-400/70 text-xs mt-1 hidden sm:block">XP collectif</p>
                  </div>
                  <Users className="w-5 h-5 sm:w-8 sm:h-8 text-pink-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Liste des demandes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {requests.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 sm:p-12 text-center">
                <CheckCircle className="w-12 h-12 sm:w-20 sm:h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-2xl font-semibold text-white mb-2">Aucune demande en attente</h3>
                <p className="text-gray-400 text-sm sm:text-lg">Toutes les demandes ont été traitées ! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  Demandes en attente ({requests.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {requests.map((request) => {
                    const rewardDetails = getRewardDetails(request.rewardId, request.rewardName, request.rewardIcon, request.type);
                    
                    // ✅ VÉRIFICATION SELON LE TYPE (spendableXp calculé pour individuel)
                    const requiredXP = rewardDetails.type === 'team' ? teamPoolXP : request.userSpendableXP;
                    const canAfford = requiredXP >= rewardDetails.xpCost;

                    return (
                      <motion.div
                        key={request.id}
                        className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {/* Header avec icône */}
                        <div className={`h-24 sm:h-32 bg-gradient-to-r ${getRewardColor(rewardDetails)} flex items-center justify-center relative`}>
                          <span className="text-4xl sm:text-6xl">{rewardDetails.icon}</span>

                          {rewardDetails.type === 'team' && (
                            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="hidden sm:inline">Équipe</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{rewardDetails.name}</h3>
                          <p className="text-gray-400 text-sm mb-4">{rewardDetails.description || 'Récompense personnalisée'}</p>
                          
                          {/* Utilisateur */}
                          <div className="bg-white/5 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-semibold">{request.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{getRelativeTime(request.requestedAt)}</span>
                            </div>
                          </div>

                          {/* XP Info */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">
                              {rewardDetails.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Zap className={`w-4 h-4 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                              <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                {rewardDetails.xpCost} XP
                              </span>
                            </div>
                          </div>

                          {/* ✅ XP Source - Affichage 2 compteurs pour individuel */}
                          <div className={`border rounded-lg p-2 mb-4 ${
                            rewardDetails.type === 'team' 
                              ? 'bg-purple-500/10 border-purple-400/30' 
                              : 'bg-blue-500/10 border-blue-400/30'
                          }`}>
                            {rewardDetails.type === 'team' ? (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">💰 Pool équipe:</span>
                                <span className="font-bold text-purple-400">{requiredXP.toLocaleString()} XP</span>
                              </div>
                            ) : (
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">💎 XP prestige:</span>
                                  <span className="font-bold text-yellow-400">{request.userTotalXP.toLocaleString()} XP</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">🛒 XP dépensables:</span>
                                  <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                    {request.userSpendableXP.toLocaleString()} XP
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Alerte */}
                          {!canAfford && (
                            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <span className="text-red-400 text-xs">XP dépensables insuffisants</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(request, 'view')}
                              className="flex-1 bg-white/5 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Détails
                            </button>
                            
                            <button
                              onClick={() => openModal(request, 'approve')}
                              disabled={!canAfford}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Valider
                            </button>
                            
                            <button
                              onClick={() => openModal(request, 'reject')}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Modal */}
          {showModal && selectedRequest && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <motion.div
                className="bg-slate-800 border border-white/20 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    {modalType === 'view' && '📋 Détails'}
                    {modalType === 'approve' && '✅ Approuver'}
                    {modalType === 'reject' && '❌ Rejeter'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Aperçu */}
                <div className={`h-28 sm:h-40 bg-gradient-to-r ${getRewardColor(selectedRequest.rewardDetails)} rounded-xl flex items-center justify-center mb-4 sm:mb-6`}>
                  <span className="text-5xl sm:text-8xl">{selectedRequest.rewardDetails.icon}</span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Nom */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-2">{selectedRequest.rewardDetails.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedRequest.rewardDetails.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">
                        {selectedRequest.rewardDetails.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedRequest.rewardDetails.type === 'team' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {selectedRequest.rewardDetails.type === 'team' ? '👥 ÉQUIPE' : '👤 INDIVIDUELLE'}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{selectedRequest.rewardDetails.xpCost} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Utilisateur */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">👤 Utilisateur</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Nom:</span>
                        <p className="text-white font-semibold">{selectedRequest.userName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <p className="text-white font-semibold">{selectedRequest.userEmail}</p>
                      </div>
                      {/* ✅ AFFICHAGE 2 COMPTEURS */}
                      <div>
                        <span className="text-gray-400">💎 XP prestige:</span>
                        <p className="text-yellow-400 font-bold">{selectedRequest.userTotalXP} XP</p>
                      </div>
                      <div>
                        <span className="text-gray-400">🛒 XP dépensables:</span>
                        <p className="text-green-400 font-bold">{selectedRequest.userSpendableXP} XP</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Pool équipe:</span>
                        <p className="text-purple-400 font-bold">{teamPoolXP.toLocaleString()} XP</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Demandée le:</span>
                        <p className="text-white">{formatDate(selectedRequest.requestedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vérifications */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">🔍 Vérifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {(selectedRequest.rewardDetails.type === 'team' 
                          ? teamPoolXP >= selectedRequest.rewardDetails.xpCost
                          : selectedRequest.userSpendableXP >= selectedRequest.rewardDetails.xpCost
                        ) ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-sm text-gray-300">
                          {selectedRequest.rewardDetails.type === 'team' 
                            ? `Pool équipe: ${teamPoolXP.toLocaleString()} / ${selectedRequest.rewardDetails.xpCost} XP`
                            : `XP dépensables: ${selectedRequest.userSpendableXP} / ${selectedRequest.rewardDetails.xpCost} XP`
                          }
                        </span>
                      </div>
                      {selectedRequest.rewardDetails.type !== 'team' && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="text-xs">💡 Les XP de prestige ({selectedRequest.userTotalXP} XP) restent intacts pour les classements</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejet */}
                  {modalType === 'reject' && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-red-400 mb-3 text-sm sm:text-base">💬 Raison du rejet</h4>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Expliquez pourquoi..."
                        className="w-full h-20 sm:h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                      />
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Annuler
                    </button>

                    {modalType === 'approve' && (
                      <button
                        onClick={() => handleApprove(selectedRequest)}
                        disabled={
                          selectedRequest.rewardDetails.type === 'team'
                            ? teamPoolXP < selectedRequest.rewardDetails.xpCost
                            : selectedRequest.userSpendableXP < selectedRequest.rewardDetails.xpCost
                        }
                        className="px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Approuver
                      </button>
                    )}

                    {modalType === 'reject' && (
                      <button
                        onClick={() => handleReject(selectedRequest)}
                        className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        Rejeter
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* 📦 MODAL GESTION DES STOCKS */}
          {showStockModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <motion.div
                className="bg-slate-800 border border-white/20 rounded-xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Gestion des stocks</h3>
                      <p className="text-gray-400 text-sm">Définir les quantités disponibles par récompense</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-white p-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveStockTab('individual')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      activeStockTab === 'individual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    👤 Individuelles ({DEFAULT_INDIVIDUAL_REWARDS.length + customRewards.filter(r => r.type === 'individual').length})
                  </button>
                  <button
                    onClick={() => setActiveStockTab('team')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      activeStockTab === 'team'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    👥 Équipe ({DEFAULT_TEAM_REWARDS.length + customRewards.filter(r => r.type === 'team').length})
                  </button>
                </div>

                {/* Note limite par utilisateur */}
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    ℹ️ <strong>Limite par défaut :</strong> Chaque utilisateur ne peut échanger chaque récompense qu'<strong>1 fois</strong>.
                    Cliquez sur <Users className="w-4 h-4 inline mx-1" /> pour voir qui a échangé et remettre à disposition.
                  </p>
                </div>

                {/* Liste des récompenses */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {[
                    ...(activeStockTab === 'individual' ? DEFAULT_INDIVIDUAL_REWARDS : DEFAULT_TEAM_REWARDS),
                    ...customRewards.filter(r => r.type === activeStockTab || (activeStockTab === 'individual' && r.type !== 'team'))
                  ].map(reward => {
                    const stock = getRewardStock(reward.id);
                    const isEditing = editingReward === reward.id;

                    return (
                      <div
                        key={reward.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          {/* Info récompense */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{reward.icon}</span>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white truncate">{reward.name}</h4>
                              <p className="text-sm text-gray-400">{reward.xpCost} XP • {reward.category}</p>
                            </div>
                          </div>

                          {/* Stock controls */}
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              // Mode édition
                              <div className="flex items-center gap-2">
                                <select
                                  value={stock.stockType}
                                  onChange={(e) => {
                                    const newType = e.target.value;
                                    const newStock = {
                                      stockType: newType,
                                      stockTotal: newType === 'unlimited' ? null : (stock.stockTotal || 5),
                                      stockRemaining: newType === 'unlimited' ? null : (stock.stockRemaining || 5)
                                    };
                                    setStockSettings(prev => ({
                                      ...prev,
                                      [reward.id]: newStock
                                    }));
                                  }}
                                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white"
                                >
                                  <option value="unlimited">♾️ Illimité</option>
                                  <option value="limited">📦 Limité</option>
                                </select>

                                {stock.stockType === 'limited' && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        const newRemaining = Math.max(0, (stock.stockRemaining || 0) - 1);
                                        setStockSettings(prev => ({
                                          ...prev,
                                          [reward.id]: { ...stock, stockRemaining: newRemaining }
                                        }));
                                      }}
                                      className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                      type="number"
                                      value={stock.stockRemaining || 0}
                                      onChange={(e) => {
                                        const newRemaining = Math.max(0, parseInt(e.target.value) || 0);
                                        setStockSettings(prev => ({
                                          ...prev,
                                          [reward.id]: { ...stock, stockRemaining: newRemaining, stockTotal: Math.max(newRemaining, stock.stockTotal || 0) }
                                        }));
                                      }}
                                      className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-center text-white text-sm"
                                      min="0"
                                    />
                                    <button
                                      onClick={() => {
                                        const newRemaining = (stock.stockRemaining || 0) + 1;
                                        setStockSettings(prev => ({
                                          ...prev,
                                          [reward.id]: { ...stock, stockRemaining: newRemaining, stockTotal: Math.max(newRemaining, stock.stockTotal || 0) }
                                        }));
                                      }}
                                      className="p-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}

                                <button
                                  onClick={async () => {
                                    await saveStockSettings(stockSettings);
                                    setEditingReward(null);
                                  }}
                                  className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              // Mode affichage
                              <div className="flex items-center gap-3">
                                {stock.stockType === 'unlimited' ? (
                                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full">
                                    <Infinity className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-sm font-medium">Illimité</span>
                                  </div>
                                ) : (
                                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                                    stock.stockRemaining > 0
                                      ? 'bg-amber-500/20'
                                      : 'bg-red-500/20'
                                  }`}>
                                    <Package className={`w-4 h-4 ${stock.stockRemaining > 0 ? 'text-amber-400' : 'text-red-400'}`} />
                                    <span className={`text-sm font-medium ${stock.stockRemaining > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                      {stock.stockRemaining || 0} restant{(stock.stockRemaining || 0) > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}

                                <button
                                  onClick={() => setEditingReward(reward.id)}
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
                                  title="Modifier le stock"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Bouton voir les utilisateurs */}
                                <button
                                  onClick={() => loadUsersWhoRedeemed(reward)}
                                  className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
                                  title="Voir qui a échangé"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badge récompense personnalisée */}
                        {reward.isCustom && (
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                              ✨ Personnalisée
                            </span>
                          </div>
                        )}

                        {/* Barre de progression si limité */}
                        {stock.stockType === 'limited' && stock.stockTotal > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Stock utilisé</span>
                              <span>{stock.stockTotal - (stock.stockRemaining || 0)} / {stock.stockTotal}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  stock.stockRemaining > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${((stock.stockTotal - (stock.stockRemaining || 0)) / stock.stockTotal) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="text-sm text-gray-400">
                    <p>💡 Les stocks sont sauvegardés automatiquement.</p>
                    <p>📦 "Limité" = quantité maximale disponible pour les demandes.</p>
                  </div>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 👤 MODAL GESTION PAR UTILISATEUR */}
          {showUserModal && selectedRewardForUsers && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <motion.div
                className="bg-slate-800 border border-white/20 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedRewardForUsers.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedRewardForUsers.name}</h3>
                      <p className="text-gray-400 text-sm">Utilisateurs ayant échangé cette récompense</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setSelectedRewardForUsers(null);
                      setUsersWhoRedeemed([]);
                    }}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Info limite */}
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-300">
                    🔒 <strong>Limite :</strong> 1 échange par utilisateur. Cliquez sur <RotateCcw className="w-4 h-4 inline mx-1" /> pour remettre la récompense à disposition.
                  </p>
                </div>

                {/* Contenu */}
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <span className="ml-3 text-gray-400">Chargement...</span>
                  </div>
                ) : usersWhoRedeemed.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun utilisateur n'a encore échangé cette récompense</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usersWhoRedeemed.map((userInfo) => (
                      <div
                        key={userInfo.userId}
                        className={`bg-white/5 border rounded-xl p-4 ${
                          userInfo.canRedeem
                            ? 'border-green-500/30'
                            : 'border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              userInfo.canRedeem
                                ? 'bg-green-500/20'
                                : 'bg-amber-500/20'
                            }`}>
                              {userInfo.canRedeem ? (
                                <UserCheck className="w-5 h-5 text-green-400" />
                              ) : (
                                <UserX className="w-5 h-5 text-amber-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{userInfo.userName}</p>
                              <p className="text-sm text-gray-400">{userInfo.userEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                userInfo.canRedeem ? 'text-green-400' : 'text-amber-400'
                              }`}>
                                {userInfo.canRedeem ? '✅ Peut échanger' : `⚠️ ${userInfo.totalRedemptions}/1 échangé`}
                              </p>
                              {userInfo.redemptions.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  Dernier : {userInfo.redemptions[0]?.requestedAt
                                    ? new Date(userInfo.redemptions[0].requestedAt).toLocaleDateString('fr-FR')
                                    : '-'}
                                </p>
                              )}
                            </div>

                            {/* Bouton reset si l'utilisateur a atteint sa limite */}
                            {!userInfo.canRedeem && (
                              <button
                                onClick={() => resetUserRedemption(userInfo.userId, selectedRewardForUsers.id)}
                                disabled={resettingUser === userInfo.userId}
                                className={`p-2 rounded-lg transition-colors ${
                                  resettingUser === userInfo.userId
                                    ? 'bg-gray-600 cursor-wait'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                                title="Remettre à disposition"
                              >
                                {resettingUser === userInfo.userId ? (
                                  <RefreshCw className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                  <RotateCcw className="w-5 h-5 text-white" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Historique des échanges */}
                        {userInfo.redemptions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-2">Historique :</p>
                            <div className="flex flex-wrap gap-2">
                              {userInfo.redemptions.map((r, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    r.resetByAdmin
                                      ? 'bg-gray-500/20 text-gray-400 line-through'
                                      : r.status === 'approved'
                                        ? 'bg-green-500/20 text-green-400'
                                        : r.status === 'pending'
                                          ? 'bg-amber-500/20 text-amber-400'
                                          : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {r.status === 'approved' ? '✓' : r.status === 'pending' ? '⏳' : '✗'}
                                  {r.resetByAdmin && ' (reset)'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setSelectedRewardForUsers(null);
                      setUsersWhoRedeemed([]);
                    }}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminRewardsPage;
