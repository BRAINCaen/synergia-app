// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES - COMPLÈTE AVEC POOL ÉQUIPE
// ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
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
import notificationService from '../core/services/notificationService.js';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, query, orderBy, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot
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
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      alert('Erreur de chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✅ CALCUL CORRECT DES XP DÉPENSABLES
  // Si spendableXp est négatif = montant dépensé → calculer le solde
  // ==========================================

  const getSpendableXP = () => {
    const rawSpendableXP = userProfile?.gamification?.spendableXp;
    const totalXP = userProfile?.gamification?.totalXp || 0;
    
    // Si spendableXp n'existe pas → utiliser totalXp (aucune dépense encore)
    if (rawSpendableXP === undefined || rawSpendableXP === null) {
      console.log('⚠️ [RewardsPage] spendableXp non défini, utilisation de totalXp:', totalXP);
      return totalXP;
    }
    
    // ✅ Si spendableXp est NÉGATIF → c'est le montant dépensé
    // Calcul du solde restant : totalXp + spendableXp (car négatif)
    // Exemple : 2058 + (-600) = 1458 XP restants
    if (rawSpendableXP < 0) {
      const soldeRestant = totalXP + rawSpendableXP;
      console.log(`✅ [RewardsPage] Calcul solde: ${totalXP} + (${rawSpendableXP}) = ${soldeRestant} XP dépensables`);
      return Math.max(0, soldeRestant); // Ne pas retourner de valeur négative
    }
    
    // Sinon, spendableXp contient déjà le solde restant
    return rawSpendableXP;
  };

  // ==========================================
  // 🎁 DEMANDER UNE RÉCOMPENSE
  // ✅ Vérification avec spendableXp pour récompenses individuelles
  // ==========================================

  const handleRequestReward = async (reward) => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    // ✅ SYSTÈME 2 COMPTEURS : utiliser spendableXp pour les achats individuels
    const userSpendableXP = getSpendableXP();
    const userTotalXP = userProfile?.gamification?.totalXp || 0;
    const requiredXP = reward.type === 'team' ? teamPoolXP : userSpendableXP;

    if (requiredXP < reward.xpCost) {
      if (reward.type === 'team') {
        alert(`XP insuffisants !\nPool équipe: ${teamPoolXP} XP\nRequis: ${reward.xpCost} XP\nManque: ${reward.xpCost - teamPoolXP} XP`);
      } else {
        alert(`XP dépensables insuffisants !\n\n🛒 XP dépensables: ${userSpendableXP} XP\nRequis: ${reward.xpCost} XP\nManque: ${reward.xpCost - userSpendableXP} XP\n\n💎 Vos XP de prestige (${userTotalXP} XP) restent intacts pour les classements !`);
      }
      return;
    }

    const confirmMsg = reward.type === 'team'
      ? `Demander ${reward.name} pour ${reward.xpCost} XP du pool équipe ?`
      : `Demander ${reward.name} pour ${reward.xpCost} de vos XP dépensables ?\n\n💡 Vos XP de prestige (${userTotalXP} XP) resteront intacts !`;

    if (!confirm(confirmMsg)) return;

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
                  className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden transition-all duration-300 ${
                    canAfford ? 'hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50' : 'opacity-60'
                  }`}
                >
                  {/* Header gradient */}
                  <div className={`h-2 bg-gradient-to-r ${getRewardColor(reward)}`}></div>
                  
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
                      
                      {/* Actions admin */}
                      {userIsAdmin && (
                        <div className="flex gap-1">
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
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {reward.isFirebase && (
                            <button
                              onClick={() => handleDeleteReward(reward)}
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4">{reward.description}</p>

                    {/* Coût et bouton */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">{reward.xpCost.toLocaleString()}</span>
                        <span className="text-gray-400 ml-1">XP</span>
                      </div>
                      
                      <button
                        onClick={() => handleRequestReward(reward)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Demander' : 'XP insuffisants'}
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
    </Layout>
  );
};

export default RewardsPage;
