// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES - POOL ÉQUIPE SÉPARÉ (SYSTÈME CORRECT)
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
  const [teamPoolXP, setTeamPoolXP] = useState(0); // ✅ POOL ÉQUIPE SÉPARÉ
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
  // 🎁 DEMANDER UNE RÉCOMPENSE
  // ==========================================

  const handleRequestReward = async (reward) => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    const userXP = userProfile?.gamification?.totalXp || 0;
    const requiredXP = reward.type === 'team' ? teamPoolXP : userXP;

    if (requiredXP < reward.xpCost) {
      const source = reward.type === 'team' ? 'Pool équipe' : 'Vos XP';
      alert(`XP insuffisants !\n${source}: ${requiredXP} XP\nRequis: ${reward.xpCost} XP\nManque: ${reward.xpCost - requiredXP} XP`);
      return;
    }

    const confirmMsg = reward.type === 'team'
      ? `Demander ${reward.name} pour ${reward.xpCost} XP du pool équipe ?`
      : `Demander ${reward.name} pour ${reward.xpCost} de vos XP ?`;

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
          replacesDefault: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
        console.log('✅ Version modifiée créée:', newReward.id);
        
        await addDoc(collection(db, 'rewards'), {
          originalId: selectedReward.id,
          isHidden: true,
          isDefault: false,
          isFirebase: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
        console.log('✅ Version originale masquée');
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

  const userXP = userProfile?.gamification?.totalXp || 0;

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

          {/* 📊 STATISTIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Mes XP</p>
                  <p className="text-2xl font-bold text-white">{userXP.toLocaleString()}</p>
                  <p className="text-xs text-blue-400">Pour récompenses perso</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Pool Équipe</p>
                  <p className="text-2xl font-bold text-white">{teamPoolXP.toLocaleString()}</p>
                  <p className="text-xs text-purple-400">🔄 Cagnotte collective</p>
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

          {/* Reste du rendu identique... */}
          {/* NOTE: Code tronqué pour la brièveté, le reste est identique */}
        </div>
      </div>
    </Layout>
  );
};

export default RewardsPage;
