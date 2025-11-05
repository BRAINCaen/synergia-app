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
      const badgesRef = collection(db, 'user_badges');
      const q = query(badgesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const badges = [];
      snapshot.forEach(doc => {
        badges.push({ id: doc.id, ...doc.data() });
      });
      
      setUserBadges(badges);
      console.log('✅ Badges utilisateur chargés:', badges.length);
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
      snapshot.forEach(doc => {
        firebaseBadges.push({ id: doc.id, ...doc.data(), isFirebase: true });
      });
      
      // Combiner badges par défaut + Firebase
      const combined = [...DEFAULT_BADGES, ...firebaseBadges];
      setAllBadges(combined);
      
      console.log('✅ Badges chargés:', combined.length);
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
    
    if (!selectedBadge) return;
    
    try {
      const badgeRef = doc(db, 'badges', selectedBadge.id);
      await updateDoc(badgeRef, {
        ...badgeForm,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      
      alert('✅ Badge modifié avec succès !');
      setShowEditBadgeModal(false);
      setSelectedBadge(null);
      
      loadAllBadges();
    } catch (error) {
      console.error('❌ Erreur modification badge:', error);
      alert('Erreur lors de la modification du badge');
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

  // 🎁 ATTRIBUER UN BADGE À UN UTILISATEUR (ADMIN)
  const handleAssignBadge = async (userId, badgeId) => {
    try {
      const badge = allBadges.find(b => b.id === badgeId);
      if (!badge) return;
      
      const userBadgeData = {
        userId,
        badgeId,
        badgeName: badge.name,
        badgeIcon: badge.icon,
        xpReward: badge.xpReward || 0,
        earnedAt: serverTimestamp(),
        awardedBy: user.uid
      };
      
      await addDoc(collection(db, 'user_badges'), userBadgeData);
      
      // Mettre à jour l'XP de l'utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentXP = userDoc.data().xp || 0;
      
      await updateDoc(userRef, {
        xp: currentXP + (badge.xpReward || 0)
      });
      
      alert('✅ Badge attribué avec succès !');
      loadUserBadges();
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('Erreur lors de l\'attribution du badge');
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
              const isUnlocked = userBadges.some(ub => ub.badgeId === badge.id);
              
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

          {/* MODALS (création, édition, attribution) - identiques au code précédent mais avec style dark */}
        </div>
      </div>
    </Layout>
  );
};

export default BadgesPage;
