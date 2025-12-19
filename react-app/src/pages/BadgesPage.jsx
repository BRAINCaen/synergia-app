// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE COLLECTION DE BADGES - SYSTÈME UNIFIÉ v2.0
// Intégration complète avec unifiedBadgeSystem.js
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Award, Star, Target, Zap, Crown, Shield, Gem, Medal, Gift,
  Search, Filter, Grid, List, Lock, Unlock, Calendar, Users, CheckCircle,
  Clock, Eye, MoreVertical, Flame, BookOpen, Briefcase, Heart, ThumbsUp,
  Settings, RefreshCw, Download, Plus, Edit, Trash2, UserPlus, Send,
  Save, X, Upload, AlertCircle, Check,
  // Catégories
  Rocket, Brain, Repeat, Flag, BarChart3
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 🏆 SYSTÈME UNIFIÉ DE BADGES
import unifiedBadgeService, {
  UNIFIED_BADGE_DEFINITIONS,
  BADGE_CATEGORIES,
  BADGE_RARITY,
  calculateBadgeStats
} from '../core/services/unifiedBadgeSystem.js';

// 📊 FIREBASE IMPORTS
import {
  collection, query, orderBy, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch, setDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎨 HELPERS - Labels et icônes par catégorie
const CATEGORY_CONFIG = {
  [BADGE_CATEGORIES.ONBOARDING]: { label: 'Onboarding', icon: '🚀', color: 'blue' },
  [BADGE_CATEGORIES.PRODUCTIVITY]: { label: 'Productivité', icon: '✅', color: 'green' },
  [BADGE_CATEGORIES.PROGRESSION]: { label: 'Progression', icon: '📈', color: 'purple' },
  [BADGE_CATEGORIES.COLLABORATION]: { label: 'Collaboration', icon: '🤝', color: 'cyan' },
  [BADGE_CATEGORIES.ENGAGEMENT]: { label: 'Engagement', icon: '🔥', color: 'orange' },
  [BADGE_CATEGORIES.BOOST]: { label: 'Boost', icon: '💖', color: 'pink' },
  [BADGE_CATEGORIES.CHALLENGES]: { label: 'Défis', icon: '🎯', color: 'red' },
  [BADGE_CATEGORIES.CAMPAIGNS]: { label: 'Campagnes', icon: '⚔️', color: 'amber' },
  [BADGE_CATEGORIES.RETROSPECTIVES]: { label: 'Rétrospectives', icon: '🔄', color: 'indigo' },
  [BADGE_CATEGORIES.IDEAS]: { label: 'Idées', icon: '💡', color: 'yellow' },
  [BADGE_CATEGORIES.CHECKPOINTS]: { label: 'Checkpoints', icon: '✓', color: 'teal' },
  [BADGE_CATEGORIES.EXCELLENCE]: { label: 'Excellence', icon: '🌟', color: 'gold' },
  [BADGE_CATEGORIES.SPECIAL]: { label: 'Spécial', icon: '🎮', color: 'violet' },
  [BADGE_CATEGORIES.ROLES]: { label: 'Rôles', icon: '👔', color: 'slate' }
};

// 🎨 Couleurs de rareté
const getRarityConfig = (rarity) => {
  const configs = {
    common: { label: 'Commun', bgClass: 'bg-gray-500/20', textClass: 'text-gray-300', borderClass: 'border-gray-400/30' },
    uncommon: { label: 'Peu Commun', bgClass: 'bg-green-500/20', textClass: 'text-green-300', borderClass: 'border-green-400/30' },
    rare: { label: 'Rare', bgClass: 'bg-blue-500/20', textClass: 'text-blue-300', borderClass: 'border-blue-400/30' },
    epic: { label: 'Épique', bgClass: 'bg-purple-500/20', textClass: 'text-purple-300', borderClass: 'border-purple-400/30' },
    legendary: { label: 'Légendaire', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-300', borderClass: 'border-yellow-400/30', glow: true }
  };
  return configs[rarity] || configs.common;
};

const BadgesPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS BADGES
  const [userBadges, setUserBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // 🛡️ ÉTATS ADMIN
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [showEditBadgeModal, setShowEditBadgeModal] = useState(false);
  const [showAssignBadgeModal, setShowAssignBadgeModal] = useState(false);
  const [showRemoveBadgeModal, setShowRemoveBadgeModal] = useState(false);
  const [showUserBadgesModal, setShowUserBadgesModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // 🎨 FORM DONNÉES - Pour badges personnalisés Firebase
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: BADGE_CATEGORIES.PRODUCTIVITY,
    rarity: 'common',
    xpReward: 100,
    requirements: {},
    isActive: true
  });

  // 🏆 BADGES UNIFIÉS - Convertir en tableau
  const allBadges = useMemo(() => {
    return Object.values(UNIFIED_BADGE_DEFINITIONS).map(badge => ({
      ...badge,
      isUnified: true
    }));
  }, []);

  // 📊 STATISTIQUES GLOBALES
  const globalStats = useMemo(() => calculateBadgeStats(), []);

  // 📊 CHARGER LES DONNÉES AU MONTAGE
  useEffect(() => {
    loadUserBadges();
    if (userIsAdmin) {
      loadAllUsers();
    }
    setLoading(false);
  }, [user, userIsAdmin]);

  // 🔄 CHARGER LES BADGES DE L'UTILISATEUR
  const loadUserBadges = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const badges = userData.gamification?.badges || [];
        setUserBadges(badges);
        console.log('✅ Badges utilisateur chargés:', badges.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement badges utilisateur:', error);
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

  // 🏆 ATTRIBUER UN BADGE VIA LE SERVICE UNIFIÉ (ADMIN)
  const handleAssignBadge = async (userId, badgeId) => {
    try {
      setActionLoading(true);

      const result = await unifiedBadgeService.awardBadgeManually(
        userId,
        badgeId,
        user.uid,
        'Attribué manuellement par admin'
      );

      if (result.success) {
        alert(`✅ Badge "${result.badge.name}" attribué avec succès ! +${result.badge.xpReward} XP`);
        loadUserBadges();
        loadAllUsers();
      } else {
        alert(`❌ Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 🗑️ RETIRER UN BADGE VIA LE SERVICE UNIFIÉ (ADMIN)
  const handleRemoveBadge = async (userId, badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce badge ?')) return;

    try {
      setActionLoading(true);

      const result = await unifiedBadgeService.removeBadge(userId, badgeId, user.uid);

      if (result.success) {
        alert('✅ Badge retiré avec succès');
        loadUserBadges();
        loadAllUsers();
        setShowUserBadgesModal(false);
      } else {
        alert(`❌ Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur retrait badge:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 🔄 VÉRIFIER LES BADGES AUTOMATIQUES POUR UN UTILISATEUR
  const handleCheckBadges = async (userId) => {
    try {
      setActionLoading(true);
      const result = await unifiedBadgeService.checkAndUnlockBadges(userId, 'manual_check');

      if (result.success && result.newBadges.length > 0) {
        alert(`✅ ${result.newBadges.length} nouveau(x) badge(s) débloqué(s) !`);
        loadUserBadges();
        loadAllUsers();
      } else if (result.success) {
        alert('Aucun nouveau badge à débloquer');
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 📊 STATISTIQUES DES BADGES UTILISATEUR
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

  // 📊 BADGES PAR CATÉGORIE POUR L'AFFICHAGE
  const badgesByCategory = useMemo(() => {
    const grouped = {};
    filteredBadges.forEach(badge => {
      const cat = badge.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(badge);
    });
    return grouped;
  }, [filteredBadges]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
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
          {/* 🎯 EN-TÊTE */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Collection de Badges
            </h1>
            <p className="text-gray-400">
              {badgeStats.unlockedCount} / {badgeStats.totalCount} badges débloqués ({badgeStats.completionPercentage}%)
              <span className="ml-2 text-purple-400">• Système unifié v2.0 avec {globalStats.total} badges</span>
            </p>
          </div>

          {/* 📊 STATISTIQUES */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm font-medium">Débloqués</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.unlockedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm font-medium">Disponibles</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.badgesAvailable}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-gray-400 text-sm font-medium">Progression</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.completionPercentage}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm font-medium">XP Badges</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalXpEarned}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Gem className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-gray-400 text-sm font-medium">XP Potentiel</p>
                  <p className="text-2xl font-bold text-white">{globalStats.totalXpAvailable}</p>
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
                    : 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border-purple-400/30 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                <Shield className="w-5 h-5" />
                {showAdminPanel ? 'Fermer Panel Admin' : 'Panel Administration Badges'}
              </button>
            </div>
          )}

          {/* 🛡️ PANEL ADMIN COMPLET */}
          {userIsAdmin && showAdminPanel && (
            <div className="bg-white/5 backdrop-blur-xl border border-purple-400/30 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Administration Badges Unifiée
                <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                  {globalStats.total} badges
                </span>
              </h2>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => setShowAssignBadgeModal(true)}
                  className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Attribuer Badge
                </button>

                <button
                  onClick={() => setShowRemoveBadgeModal(true)}
                  className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Retirer Badge
                </button>

                <button
                  onClick={() => {
                    loadUserBadges();
                    loadAllUsers();
                  }}
                  className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-3 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Actualiser
                </button>

                <button
                  onClick={() => handleCheckBadges(user.uid)}
                  disabled={actionLoading}
                  className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-4 py-3 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  Vérifier Mes Badges
                </button>
              </div>

              {/* Statistiques par rareté */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {Object.entries(globalStats.byRarity).map(([rarity, count]) => {
                  const config = getRarityConfig(rarity);
                  return (
                    <div key={rarity} className={`p-3 rounded-lg ${config.bgClass} border ${config.borderClass}`}>
                      <div className={`text-lg font-bold ${config.textClass}`}>{count}</div>
                      <div className="text-xs text-gray-400">{config.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Liste des utilisateurs avec leurs badges */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Gestion des Utilisateurs
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allUsers.map(u => {
                    const userBadgeCount = u.gamification?.badges?.length || 0;
                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {(u.displayName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.displayName || u.email}</div>
                            <div className="text-sm text-gray-400">
                              {userBadgeCount} badges • {u.gamification?.totalXp || 0} XP • Niveau {u.gamification?.level || 1}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowUserBadgesModal(true);
                            }}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 text-sm"
                          >
                            Voir Badges
                          </button>
                          <button
                            onClick={() => handleCheckBadges(u.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 text-sm disabled:opacity-50"
                          >
                            Vérifier
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              >
                <option value="all" className="bg-slate-800">Toutes les catégories</option>
                {Object.entries(BADGE_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={value} className="bg-slate-800">
                    {CATEGORY_CONFIG[value]?.icon} {CATEGORY_CONFIG[value]?.label || key}
                  </option>
                ))}
              </select>

              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              >
                <option value="all" className="bg-slate-800">Toutes les raretés</option>
                <option value="common" className="bg-slate-800">Commun ({globalStats.byRarity.common})</option>
                <option value="uncommon" className="bg-slate-800">Peu Commun ({globalStats.byRarity.uncommon})</option>
                <option value="rare" className="bg-slate-800">Rare ({globalStats.byRarity.rare})</option>
                <option value="epic" className="bg-slate-800">Épique ({globalStats.byRarity.epic})</option>
                <option value="legendary" className="bg-slate-800">Légendaire ({globalStats.byRarity.legendary})</option>
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''} affiché{filteredBadges.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 🏆 GRILLE DES BADGES */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
            {filteredBadges.map((badge) => {
              const isUnlocked = userBadges.some(ub => ub.id === badge.id);
              const rarityConfig = getRarityConfig(badge.rarity);
              const categoryConfig = CATEGORY_CONFIG[badge.category] || { label: badge.category, icon: '🏆' };

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-white/10 backdrop-blur-xl border rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' ? 'p-5' : 'p-4 flex items-center gap-4'
                  } ${
                    isUnlocked
                      ? `${rarityConfig.borderClass} shadow-lg ${rarityConfig.glow ? 'shadow-yellow-500/20' : ''}`
                      : 'border-white/20 opacity-60'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={viewMode === 'grid' ? 'text-center mb-4' : 'flex-shrink-0'}>
                    <div className={`${viewMode === 'grid' ? 'text-5xl mb-3' : 'text-4xl'} ${isUnlocked ? '' : 'grayscale'}`}>
                      {badge.icon || '🏆'}
                    </div>

                    {isUnlocked && viewMode === 'grid' && (
                      <div className="inline-flex items-center px-2 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Débloqué
                      </div>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className={viewMode === 'grid' ? 'text-center' : 'flex-1 min-w-0'}>
                    <h3 className={`font-bold text-white ${viewMode === 'grid' ? 'text-lg mb-2' : 'text-base'}`}>
                      {badge.name}
                      {isUnlocked && viewMode === 'list' && (
                        <CheckCircle className="inline w-4 h-4 ml-2 text-green-400" />
                      )}
                    </h3>
                    <p className={`text-gray-400 ${viewMode === 'grid' ? 'text-sm mb-3' : 'text-xs truncate'}`}>
                      {badge.description}
                    </p>

                    <div className={`flex items-center ${viewMode === 'grid' ? 'justify-center gap-2 mb-3' : 'gap-2'}`}>
                      <span className="bg-white/10 px-2 py-1 rounded text-xs text-gray-300">
                        {categoryConfig.icon} {categoryConfig.label}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${rarityConfig.bgClass} ${rarityConfig.textClass} border ${rarityConfig.borderClass}`}>
                        {rarityConfig.label}
                      </span>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="flex items-center justify-center gap-1 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-semibold">{badge.xpReward} XP</span>
                      </div>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center gap-2 text-yellow-400 flex-shrink-0">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">{badge.xpReward} XP</span>
                    </div>
                  )}

                  {/* Admin Quick Action */}
                  {userIsAdmin && showAdminPanel && viewMode === 'grid' && (
                    <button
                      onClick={() => {
                        setSelectedBadge(badge);
                        setShowAssignBadgeModal(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                      title="Attribuer ce badge"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun badge trouvé</p>
              <p className="text-gray-500 text-sm">Essayez de modifier vos filtres</p>
            </div>
          )}

          {/* 🎁 MODAL ATTRIBUER BADGE */}
          {showAssignBadgeModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-purple-400/30 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-green-400" />
                  Attribuer un Badge
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Liste des utilisateurs */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">1. Sélectionner un utilisateur</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUsers([u.id])}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedUsers.includes(u.id)
                              ? 'border-green-500 bg-green-500/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <p className="font-medium text-white">{u.displayName || u.email}</p>
                          <p className="text-sm text-gray-400">
                            {u.gamification?.badges?.length || 0} badges • {u.gamification?.totalXp || 0} XP
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Liste des badges */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">
                      2. Sélectionner un badge
                      {selectedBadge && (
                        <span className="ml-2 text-purple-400">({selectedBadge.name})</span>
                      )}
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allBadges.map(badge => {
                        const rarityConfig = getRarityConfig(badge.rarity);
                        return (
                          <button
                            key={badge.id}
                            onClick={() => {
                              if (selectedUsers.length > 0) {
                                handleAssignBadge(selectedUsers[0], badge.id);
                                setShowAssignBadgeModal(false);
                                setSelectedUsers([]);
                                setSelectedBadge(null);
                              } else {
                                setSelectedBadge(badge);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                              selectedBadge?.id === badge.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/20 bg-white/5 hover:border-purple-400/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{badge.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{badge.name}</p>
                                <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs px-2 py-0.5 rounded ${rarityConfig.bgClass} ${rarityConfig.textClass}`}>
                                  {rarityConfig.label}
                                </span>
                                <p className="text-xs text-yellow-400 mt-1">{badge.xpReward} XP</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      setShowAssignBadgeModal(false);
                      setSelectedUsers([]);
                      setSelectedBadge(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  {selectedUsers.length > 0 && selectedBadge && (
                    <button
                      onClick={() => {
                        handleAssignBadge(selectedUsers[0], selectedBadge.id);
                        setShowAssignBadgeModal(false);
                        setSelectedUsers([]);
                        setSelectedBadge(null);
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Attribuer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🗑️ MODAL RETIRER BADGE */}
          {showRemoveBadgeModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-red-400/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  Retirer un Badge
                </h3>

                <p className="text-gray-400 mb-4">
                  Sélectionnez un utilisateur pour voir ses badges et en retirer un.
                </p>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allUsers.filter(u => (u.gamification?.badges?.length || 0) > 0).map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setShowRemoveBadgeModal(false);
                        setShowUserBadgesModal(true);
                      }}
                      className="w-full text-left p-3 rounded-lg border-2 border-white/20 bg-white/5 hover:border-red-400/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{u.displayName || u.email}</p>
                          <p className="text-sm text-gray-400">
                            {u.gamification?.badges?.length || 0} badges
                          </p>
                        </div>
                        <div className="flex -space-x-2">
                          {(u.gamification?.badges || []).slice(0, 5).map((b, i) => (
                            <span key={i} className="text-xl">{b.icon}</span>
                          ))}
                          {(u.gamification?.badges?.length || 0) > 5 && (
                            <span className="text-gray-400 text-sm ml-2">+{u.gamification.badges.length - 5}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-white/20">
                  <button
                    onClick={() => setShowRemoveBadgeModal(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 👁️ MODAL VOIR BADGES UTILISATEUR */}
          {showUserBadgesModal && selectedUser && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-purple-400/30 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-400" />
                  Badges de {selectedUser.displayName || selectedUser.email}
                </h3>

                <div className="mb-4 p-4 bg-white/5 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{selectedUser.gamification?.badges?.length || 0}</div>
                      <div className="text-sm text-gray-400">Badges</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{selectedUser.gamification?.totalXp || 0}</div>
                      <div className="text-sm text-gray-400">XP Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">Niv. {selectedUser.gamification?.level || 1}</div>
                      <div className="text-sm text-gray-400">Niveau</div>
                    </div>
                  </div>
                </div>

                {(selectedUser.gamification?.badges?.length || 0) === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun badge</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(selectedUser.gamification?.badges || []).map((badge, index) => {
                      const rarityConfig = getRarityConfig(badge.rarity);
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${rarityConfig.borderClass} ${rarityConfig.bgClass} flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{badge.icon}</span>
                            <div>
                              <p className="font-medium text-white">{badge.name}</p>
                              <p className="text-xs text-gray-400">
                                {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveBadge(selectedUser.id, badge.id)}
                            disabled={actionLoading}
                            className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            title="Retirer ce badge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      setShowUserBadgesModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      setShowUserBadgesModal(false);
                      setSelectedUsers([selectedUser.id]);
                      setShowAssignBadgeModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un Badge
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
