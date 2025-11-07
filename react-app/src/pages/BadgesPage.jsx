// ==========================================
// 📁 react-app/src/pages/Badges.jsx
// PAGE COLLECTION DE BADGES - CHARTE GRAPHIQUE DARK MODE COMPLÈTE
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, Star, Target, Zap, Crown, Shield, Gem, Medal, Gift,
  Search, Filter, Grid, List, Lock, Unlock, Calendar, Users, CheckCircle,
  Clock, Eye, MoreVertical, Flame, BookOpen, Briefcase, Heart, ThumbsUp,
  Settings, RefreshCw, Download, Plus, Edit, Trash2, UserPlus, Send,
  Save, X, Upload, AlertCircle, Check, XOctagon
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, query, orderBy, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const BadgesPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS BADGES
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');

  // 🛡️ ÉTATS ADMIN
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [showEditBadgeModal, setShowEditBadgeModal] = useState(false);
  const [showAssignBadgeModal, setShowAssignBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 🎨 FORM DONNÉES
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'Accomplissement',
    rarity: 'Commun',
    xpReward: 100,
    requirements: {},
    isActive: true
  });

  // 🏆 TOUS LES BADGES PAR DÉFAUT
  const DEFAULT_BADGES = [
    // BADGES PRINCIPAUX
    { id: 'bienvenue', name: 'Bienvenue', description: 'Premier pas', icon: '👋', category: 'Découverte', rarity: 'Commun', xpReward: 50 },
    { id: 'premiere_quete', name: 'Première Quête', description: 'Compléter une quête', icon: '🎯', category: 'Accomplissement', rarity: 'Commun', xpReward: 100 },
    { id: 'niveau_5', name: 'Niveau 5', description: 'Atteindre le niveau 5', icon: '⭐', category: 'Progression', rarity: 'Peu Commun', xpReward: 150 },
    { id: 'niveau_10', name: 'Niveau 10', description: 'Atteindre le niveau 10', icon: '💎', category: 'Progression', rarity: 'Rare', xpReward: 200 },
    { id: '10_quetes', name: '10 Quêtes', description: 'Compléter 10 quêtes', icon: '🏅', category: 'Accomplissement', rarity: 'Peu Commun', xpReward: 150 },
    { id: '50_quetes', name: '50 Quêtes', description: 'Compléter 50 quêtes', icon: '🏆', category: 'Accomplissement', rarity: 'Rare', xpReward: 300 },
    { id: 'serie_7', name: 'Série de 7', description: '7 jours consécutifs', icon: '🔥', category: 'Assiduité', rarity: 'Rare', xpReward: 200 },
    
    // BADGES VENTE
    { id: 'super_vendeur_se1', name: 'Super Vendeur se 1', description: 'T\'as fait une vente CO ! T\'es une Génie qui branche de la lumière !', icon: '💡', category: 'Vente', rarity: 'Légendaire', xpReward: 500 },
    { id: 'vendeur_bronze', name: 'Vendeur Bronze', description: '5 ventes réalisées', icon: '🥉', category: 'Vente', rarity: 'Peu Commun', xpReward: 100 },
    { id: 'vendeur_argent', name: 'Vendeur Argent', description: '20 ventes réalisées', icon: '🥈', category: 'Vente', rarity: 'Rare', xpReward: 250 },
    { id: 'vendeur_or', name: 'Vendeur Or', description: '50 ventes réalisées', icon: '🥇', category: 'Vente', rarity: 'Épique', xpReward: 500 },
    
    // BADGES COLLABORATION
    { id: 'joueur_equipe', name: 'Joueur d\'Équipe', description: 'Rejoindre une équipe', icon: '🤝', category: 'Collaboration', rarity: 'Commun', xpReward: 75 },
    { id: 'mentor', name: 'Mentor', description: 'Aider 10 collègues', icon: '👨‍🏫', category: 'Collaboration', rarity: 'Rare', xpReward: 200 },
    { id: 'collaborateur', name: 'Collaborateur', description: '5 projets collaboratifs', icon: '👥', category: 'Collaboration', rarity: 'Peu Commun', xpReward: 100 },
    
    // BADGES SPÉCIAUX
    { id: 'test', name: 'TEST', description: 'Badge de test', icon: '🏆', category: 'Test', rarity: 'Légendaire', xpReward: 100 },
    { id: 'eclair', name: 'Éclair', description: 'Tâche en moins de 30 min', icon: '⚡', category: 'Rapidité', rarity: 'Commun', xpReward: 75 },
    { id: 'noctambule', name: 'Noctambule', description: 'Connexion après minuit', icon: '🌙', category: 'Special', rarity: 'Peu Commun', xpReward: 50 },
    { id: 'matinal', name: 'Matinal', description: 'Connexion avant 6h', icon: '🌅', category: 'Special', rarity: 'Peu Commun', xpReward: 50 },
    { id: 'perfectionniste', name: 'Perfectionniste', description: '10 tâches parfaites', icon: '✨', category: 'Qualité', rarity: 'Rare', xpReward: 200 },
    
    // BADGES PROGRESSION
    { id: 'veteran', name: 'Vétéran', description: 'Niveau 25 atteint', icon: '🌟', category: 'Progression', rarity: 'Épique', xpReward: 400 },
    { id: 'maitre', name: 'Maître Synergia', description: 'Niveau 50 atteint', icon: '⚡', category: 'Progression', rarity: 'Légendaire', xpReward: 1000 },
    
    // BADGES PRODUCTIVITÉ
    { id: 'productif', name: 'Productif', description: '100 tâches complétées', icon: '📈', category: 'Productivité', rarity: 'Rare', xpReward: 250 },
    { id: 'champion_productivite', name: 'Champion Productivité', description: '500 tâches complétées', icon: '🏆', category: 'Productivité', rarity: 'Légendaire', xpReward: 1000 }
  ];

  // 📊 CHARGER LES DONNÉES AU MONTAGE
  useEffect(() => {
    loadUserBadges();
    loadAllBadges();
    if (userIsAdmin) {
      loadAllUsers();
    }
  }, [user, userIsAdmin]);

  // 🔄 CHARGER LES BADGES DE L'UTILISATEUR
  const loadUserBadges = async () => {
    if (!user) return;
    
    try {
      // Charger depuis le profil utilisateur (gamification.badges)
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const badges = userData.gamification?.badges || [];
        setUserBadges(badges);
        console.log('✅ Badges utilisateur chargés depuis profil:', badges.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement badges utilisateur:', error);
    }
  };

  // 🔄 CHARGER TOUS LES BADGES
  const loadAllBadges = async () => {
    try {
      const badgesRef = collection(db, 'badges');
      const snapshot = await getDocs(badgesRef);
      
      const firebaseBadges = [];
      const hiddenBadgeIds = []; // IDs des badges par défaut masqués
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Si c'est une version masquée d'un badge par défaut
        if (data.isHidden && data.originalId) {
          hiddenBadgeIds.push(data.originalId);
        } else if (!data.isHidden) {
          // Ajouter uniquement les badges non masqués
          firebaseBadges.push({ id: doc.id, ...data, isFirebase: true });
        }
      });
      console.log('✅ Badges Firebase chargés:', firebaseBadges.length);
      console.log('🔒 Badges masqués:', hiddenBadgeIds);
      
      // Filtrer les badges par défaut pour exclure les masqués
      const visibleDefaultBadges = DEFAULT_BADGES.filter(
        badge => !hiddenBadgeIds.includes(badge.id)
      );
      
      // Combiner badges par défaut visibles + Firebase
      const combined = [...visibleDefaultBadges, ...firebaseBadges];
      setAllBadges(combined);
      
      console.log('✅ Total badges visibles:', combined.length);
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 CHARGER TOUS LES UTILISATEURS (ADMIN)
  const loadAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      setAllUsers(users);
      console.log('✅ Utilisateurs chargés:', users.length);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
    }
  };

  // 🎨 CRÉER UN NOUVEAU BADGE (ADMIN)
  const handleCreateBadge = async (e) => {
    e.preventDefault();
    
    if (!badgeForm.name.trim()) {
      alert('Le nom du badge est requis');
      return;
    }
    
    try {
      const badgeData = {
        ...badgeForm,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        isDefault: false,
        isFirebase: true
      };
      
      await addDoc(collection(db, 'badges'), badgeData);
      
      alert('✅ Badge créé avec succès !');
      setShowCreateBadgeModal(false);
      setBadgeForm({
        name: '',
        description: '',
        icon: '🏆',
        category: 'Accomplissement',
        rarity: 'Commun',
        xpReward: 100,
        requirements: {},
        isActive: true
      });
      
      loadAllBadges();
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      alert('Erreur lors de la création du badge');
    }
  };

  // ✏️ MODIFIER UN BADGE (ADMIN)
  const handleEditBadge = async (e) => {
    e.preventDefault();
    
    if (!selectedBadge) {
      alert('Aucun badge sélectionné');
      return;
    }
    
    try {
      console.log('🔄 Modification de:', selectedBadge.name);
      console.log('Badge sélectionné:', selectedBadge);
      console.log('isFirebase:', selectedBadge.isFirebase);
      
      // Si c'est un badge Firebase existant (créé par admin ou version modifiée)
      if (selectedBadge.isFirebase && selectedBadge.id) {
        console.log('📝 Mise à jour badge Firebase ID:', selectedBadge.id);
        const badgeRef = doc(db, 'badges', selectedBadge.id);
        await updateDoc(badgeRef, {
          name: badgeForm.name,
          description: badgeForm.description,
          icon: badgeForm.icon,
          category: badgeForm.category,
          rarity: badgeForm.rarity,
          xpReward: parseInt(badgeForm.xpReward),
          requirements: badgeForm.requirements || {},
          isActive: badgeForm.isActive,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
        console.log('✅ Badge Firebase mis à jour');
      } else {
        // Si c'est un badge par défaut (pas dans Firebase)
        console.log('📝 Création version modifiée pour badge par défaut:', selectedBadge.id);
        
        // 1. Créer la nouvelle version modifiée
        const newBadgeData = {
          name: badgeForm.name,
          description: badgeForm.description,
          icon: badgeForm.icon,
          category: badgeForm.category,
          rarity: badgeForm.rarity,
          xpReward: parseInt(badgeForm.xpReward),
          requirements: badgeForm.requirements || {},
          isActive: badgeForm.isActive,
          originalId: selectedBadge.id,
          isDefault: false,
          isFirebase: true,
          replacesDefault: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        };
        
        const newBadge = await addDoc(collection(db, 'badges'), newBadgeData);
        console.log('✅ Version modifiée créée avec ID:', newBadge.id);
        
        // 2. Masquer l'original
        const hiddenData = {
          originalId: selectedBadge.id,
          isHidden: true,
          isDefault: false,
          isFirebase: true,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        };
        
        await addDoc(collection(db, 'badges'), hiddenData);
        console.log('✅ Version originale masquée');
      }
      
      alert('✅ Badge modifié avec succès !');
      setShowEditBadgeModal(false);
      setSelectedBadge(null);
      
      console.log('🔄 Rechargement des badges...');
      await loadAllBadges();
      console.log('✅ Rechargement terminé');
    } catch (error) {
      console.error('❌ ERREUR DÉTAILLÉE modification badge:', error);
      console.error('Code erreur:', error.code);
      console.error('Message:', error.message);
      alert('Erreur: ' + error.message + ' (voir console pour détails)');
    }
  };

  // 🗑️ SUPPRIMER UN BADGE (ADMIN)
  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    
    try {
      await deleteDoc(doc(db, 'badges', badgeId));
      
      alert('✅ Badge supprimé avec succès !');
      loadAllBadges();
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      alert('Erreur lors de la suppression du badge');
    }
  };

  // 🎁 ATTRIBUER UN BADGE À UN UTILISATEUR (ADMIN) - ✅ VERSION CORRIGÉE
  const handleAssignBadge = async (userId, badgeId) => {
    try {
      const badge = allBadges.find(b => b.id === badgeId);
      if (!badge) {
        alert('❌ Badge non trouvé');
        return;
      }
      
      console.log('🏆 Attribution badge:', { userId, badgeId, badgeName: badge.name });
      
      // 1. Récupérer l'utilisateur
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        alert('❌ Utilisateur non trouvé');
        return;
      }
      
      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      
      // 2. Vérifier si le badge n'est pas déjà attribué
      if (currentBadges.some(b => b.id === badgeId || b.badgeId === badgeId)) {
        alert('⚠️ Badge déjà attribué à cet utilisateur');
        return;
      }
      
      // 3. Créer le nouveau badge
      const newBadge = {
        id: badgeId,
        badgeId: badgeId,
        name: badge.name,
        description: badge.description,
        icon: badge.icon || '🏆',
        category: badge.category || 'general',
        rarity: badge.rarity || 'Commun',
        xpReward: badge.xpReward || 0,
        unlockedAt: new Date().toISOString(),
        awardedBy: user.uid
      };
      
      // 4. Mettre à jour le profil utilisateur
      const updatedBadges = [...currentBadges, newBadge];
      const currentXP = userData.gamification?.totalXp || 0;
      const newXP = currentXP + (badge.xpReward || 0);
      
      await updateDoc(userRef, {
        'gamification.badges': updatedBadges,
        'gamification.badgesUnlocked': updatedBadges.length,
        'gamification.totalXp': newXP,
        'gamification.totalBadgeXp': (userData.gamification?.totalBadgeXp || 0) + (badge.xpReward || 0)
      });
      
      alert(`✅ Badge "${badge.name}" attribué avec succès ! +${badge.xpReward} XP`);
      console.log('✅ Badge attribué:', newBadge);
      
      // 5. Recharger les données
      loadUserBadges();
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('Erreur lors de l\'attribution du badge: ' + error.message);
    }
  };

  // 📊 STATISTIQUES DES BADGES
  const badgeStats = useMemo(() => {
    const unlockedCount = userBadges.length;
    const totalCount = allBadges.length;
    const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    const totalXpEarned = userBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0);
    const badgesAvailable = totalCount - unlockedCount;
    
    return {
      unlockedCount,
      totalCount,
      completionPercentage,
      totalXpEarned,
      badgesAvailable
    };
  }, [userBadges, allBadges]);

  // 🎨 FILTRER LES BADGES
  const filteredBadges = useMemo(() => {
    return allBadges.filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || badge.category === filterCategory;
      const matchesRarity = filterRarity === 'all' || badge.rarity === filterRarity;
      
      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [allBadges, searchTerm, filterCategory, filterRarity]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 🎯 EN-TÊTE DARK MODE */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Collection de Badges
            </h1>
            <p className="text-gray-400">
              {userBadges.length} / {allBadges.length} badges débloqués ({badgeStats.completionPercentage}%)
            </p>
          </div>

          {/* 📊 STATISTIQUES DARK MODE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Badges Débloqués</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.unlockedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Badges Disponibles</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.badgesAvailable}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Progression</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.completionPercentage}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 font-semibold">XP des Badges</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalXpEarned}</p>
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
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Panel Administration Badges
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setShowCreateBadgeModal(true)}
                  className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Créer Badge
                </button>
                
                <button
                  onClick={() => setShowAssignBadgeModal(true)}
                  className="bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Attribuer Badges
                </button>
                
                <button
                  onClick={() => {
                    loadAllBadges();
                    loadAllUsers();
                    loadUserBadges();
                  }}
                  className="bg-gray-500/20 border border-gray-400/30 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </button>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-yellow-300">Gestion Badges</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Vous pouvez créer, modifier et attribuer des badges. Les modifications sont immédiatement synchronisées.
                </p>
              </div>
            </div>
          )}

          {/* 🔍 BARRE DE RECHERCHE DARK MODE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
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
                <option value="all">Toutes les catégories</option>
                <option value="Découverte">Découverte</option>
                <option value="Accomplissement">Accomplissement</option>
                <option value="Progression">Progression</option>
                <option value="Vente">Vente</option>
                <option value="Collaboration">Collaboration</option>
                <option value="Rapidité">Rapidité</option>
                <option value="Qualité">Qualité</option>
                <option value="Productivité">Productivité</option>
              </select>

              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all">Toutes les raretés</option>
                <option value="Commun">Commun</option>
                <option value="Peu Commun">Peu Commun</option>
                <option value="Rare">Rare</option>
                <option value="Épique">Épique</option>
                <option value="Légendaire">Légendaire</option>
              </select>
            </div>
          </div>

          {/* 🏆 GRILLE DES BADGES DARK MODE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => {
              const isUnlocked = userBadges.some(ub => (ub.badgeId === badge.id || ub.id === badge.id));
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-white/10 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-yellow-400/50 shadow-lg shadow-yellow-500/20' 
                      : 'border-white/20 opacity-60'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className="text-center mb-4">
                    <div className={`text-6xl mb-3 ${isUnlocked ? '' : 'grayscale'}`}>
                      {badge.icon || '🏆'}
                    </div>
                    
                    {isUnlocked && (
                      <div className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Débloqué
                      </div>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">{badge.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="bg-white/10 px-2 py-1 rounded">{badge.category}</span>
                      <span className={`px-2 py-1 rounded font-semibold ${
                        badge.rarity === 'Légendaire' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                        badge.rarity === 'Épique' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                        badge.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                        badge.rarity === 'Peu Commun' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                        'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                      }`}>
                        {badge.rarity}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-yellow-400">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">{badge.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Actions Admin - TOUS LES BADGES PEUVENT ÊTRE MODIFIÉS */}
                  {userIsAdmin && showAdminPanel && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
                      <button
                        onClick={() => {
                          console.log('🔵 Bouton Modifier cliqué pour badge:', badge.name);
                          console.log('Badge complet:', badge);
                          setSelectedBadge(badge);
                          setBadgeForm({
                            name: badge.name || '',
                            description: badge.description || '',
                            icon: badge.icon || '🏆',
                            category: badge.category || 'Accomplissement',
                            rarity: badge.rarity || 'Commun',
                            xpReward: badge.xpReward || 100,
                            requirements: badge.requirements || {},
                            isActive: badge.isActive !== false
                          });
                          console.log('✅ État modal set à true');
                          setShowEditBadgeModal(true);
                        }}
                        className="flex-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      
                      {badge.isFirebase && (
                        <button
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="flex-1 bg-red-500/20 border border-red-400/30 text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun badge trouvé</p>
            </div>
          )}

          {/* 🎨 MODAL CRÉER BADGE */}
          {showCreateBadgeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Créer un Badge</h3>
                
                <form onSubmit={handleCreateBadge} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={badgeForm.description}
                      onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Icône (emoji)</label>
                    <input
                      type="text"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={badgeForm.category}
                      onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Accomplissement" className="bg-slate-800">Accomplissement</option>
                      <option value="Performance" className="bg-slate-800">Performance</option>
                      <option value="Social" className="bg-slate-800">Social</option>
                      <option value="Exploration" className="bg-slate-800">Exploration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rareté</label>
                    <select
                      value={badgeForm.rarity}
                      onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Commun" className="bg-slate-800">Commun</option>
                      <option value="Peu Commun" className="bg-slate-800">Peu Commun</option>
                      <option value="Rare" className="bg-slate-800">Rare</option>
                      <option value="Épique" className="bg-slate-800">Épique</option>
                      <option value="Légendaire" className="bg-slate-800">Légendaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">XP Récompense</label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateBadgeModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ✏️ MODAL MODIFIER BADGE */}
          {showEditBadgeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Modifier le Badge</h3>
                
                <form onSubmit={handleEditBadge} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={badgeForm.description}
                      onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Icône (emoji)</label>
                    <input
                      type="text"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={badgeForm.category}
                      onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Accomplissement" className="bg-slate-800">Accomplissement</option>
                      <option value="Performance" className="bg-slate-800">Performance</option>
                      <option value="Social" className="bg-slate-800">Social</option>
                      <option value="Exploration" className="bg-slate-800">Exploration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rareté</label>
                    <select
                      value={badgeForm.rarity}
                      onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Commun" className="bg-slate-800">Commun</option>
                      <option value="Peu Commun" className="bg-slate-800">Peu Commun</option>
                      <option value="Rare" className="bg-slate-800">Rare</option>
                      <option value="Épique" className="bg-slate-800">Épique</option>
                      <option value="Légendaire" className="bg-slate-800">Légendaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">XP Récompense</label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditBadgeModal(false);
                        setSelectedBadge(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    
                    {selectedBadge && (
                      <button
                        type="button"
                        onClick={async () => {
                          const isDefault = !selectedBadge.isFirebase;
                          const confirmMsg = isDefault 
                            ? `Masquer "${selectedBadge.name}" de la collection ?` 
                            : `Supprimer définitivement "${selectedBadge.name}" ?`;
                          
                          if (confirm(confirmMsg)) {
                            try {
                              if (selectedBadge.isFirebase) {
                                // Supprimer le badge Firebase
                                await deleteDoc(doc(db, 'badges', selectedBadge.id));
                                console.log('✅ Badge Firebase supprimé');
                              } else {
                                // Masquer le badge par défaut en créant une version désactivée
                                await addDoc(collection(db, 'badges'), {
                                  name: selectedBadge.name,
                                  description: selectedBadge.description,
                                  icon: selectedBadge.icon,
                                  category: selectedBadge.category,
                                  rarity: selectedBadge.rarity,
                                  xpReward: selectedBadge.xpReward,
                                  isActive: false, // DÉSACTIVÉ
                                  originalId: selectedBadge.id,
                                  isDefault: false,
                                  isFirebase: true,
                                  isHidden: true, // Flag pour savoir que c'est masqué
                                  createdAt: serverTimestamp(),
                                  createdBy: user.uid
                                });
                                console.log('✅ Badge par défaut masqué');
                              }
                              
                              alert('✅ Badge supprimé !');
                              setShowEditBadgeModal(false);
                              setSelectedBadge(null);
                              await loadAllBadges();
                            } catch (error) {
                              console.error('❌ Erreur suppression:', error);
                              alert('Erreur: ' + error.message);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {selectedBadge.isFirebase ? 'Supprimer' : 'Masquer'}
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 🎁 MODAL ATTRIBUER BADGE */}
          {showAssignBadgeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Attribuer un Badge</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Liste des utilisateurs */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">Sélectionner un utilisateur</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUsers([u.id])}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedUsers.includes(u.id)
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <p className="font-medium text-white">{u.displayName || u.email}</p>
                          <p className="text-sm text-gray-400">{u.gamification?.totalXp || 0} XP</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Liste des badges */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">Sélectionner un badge</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allBadges.map(badge => (
                        <button
                          key={badge.id}
                          onClick={() => {
                            if (selectedUsers.length > 0) {
                              handleAssignBadge(selectedUsers[0], badge.id);
                              setShowAssignBadgeModal(false);
                              setSelectedUsers([]);
                            } else {
                              alert('Veuillez d\'abord sélectionner un utilisateur');
                            }
                          }}
                          className="w-full text-left p-3 rounded-lg border-2 border-white/20 bg-white/5 hover:border-blue-400/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{badge.icon}</span>
                            <div>
                              <p className="font-medium text-white">{badge.name}</p>
                              <p className="text-sm text-gray-400">{badge.xpReward} XP</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      setShowAssignBadgeModal(false);
                      setSelectedUsers([]);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BadgesPage;
