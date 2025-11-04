// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES AVEC CHARTE GRAPHIQUE SYNERGIA + PANEL ADMIN COMPLET
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Star, Award, CheckCircle, Lock, Grid, List, Search, Filter,
  RefreshCw, Zap, Shield, Target, Sparkles, Crown, Settings, Plus, Edit,
  Trash2, UserPlus, Send, Save, X, Upload, AlertCircle, Check, XOctagon
} from 'lucide-react';

// Layout Synergia
import Layout from '../components/layout/Layout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { collection, query, onSnapshot, where, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Badges par défaut
import { BADGE_DEFINITIONS } from '../core/services/badgeDefinitions.js';

/**
 * 🏆 PAGE BADGES - DESIGN SYNERGIA PREMIUM + ADMIN
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);
  
  // États badges
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // États admin
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [showAssignBadgeModal, setShowAssignBadgeModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'general',
    rarity: 'common',
    xpReward: 100
  });

  // Charger les badges
  useEffect(() => {
    if (!user) return;
    
    const loadBadges = async () => {
      try {
        // Charger les badges utilisateur
        const userBadgesRef = collection(db, 'userBadges');
        const userBadgesQuery = query(userBadgesRef, where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(userBadgesQuery, (snapshot) => {
          const earnedBadgeIds = snapshot.docs.map(doc => doc.data().badgeId);
          setUserBadges(earnedBadgeIds);
          
          // Combiner avec badges par défaut
          const combinedBadges = Object.values(BADGE_DEFINITIONS).map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id),
            isDefault: true
          }));
          
          setAllBadges(combinedBadges);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Erreur chargement badges:', error);
        setLoading(false);
      }
    };
    
    loadBadges();
  }, [user]);

  // Charger tous les utilisateurs (admin)
  useEffect(() => {
    if (!userIsAdmin) return;
    
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllUsers(users);
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      }
    };
    
    loadUsers();
  }, [userIsAdmin]);

  // Filtrer les badges
  const filteredBadges = useMemo(() => {
    return allBadges.filter(badge => {
      const matchSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      const matchRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
      
      return matchSearch && matchCategory && matchRarity;
    });
  }, [allBadges, searchTerm, selectedCategory, selectedRarity]);

  // Statistiques
  const badgeStats = useMemo(() => {
    const totalBadges = allBadges.filter(b => b.earned).length;
    const totalPossible = allBadges.length;
    const totalXP = allBadges.filter(b => b.earned).reduce((sum, b) => sum + (b.xpReward || 0), 0);
    
    return {
      totalBadges,
      totalPossible,
      badgesAvailable: totalPossible - totalBadges,
      percentage: totalPossible > 0 ? Math.round((totalBadges / totalPossible) * 100) : 0,
      totalXP
    };
  }, [allBadges]);

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = [...new Set(allBadges.map(b => b.category))];
    return ['all', ...cats];
  }, [allBadges]);

  // Créer un badge (admin)
  const handleCreateBadge = async () => {
    try {
      await addDoc(collection(db, 'badges'), {
        ...badgeForm,
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      });
      
      setShowCreateBadgeModal(false);
      setBadgeForm({
        name: '',
        description: '',
        icon: '🏆',
        category: 'general',
        rarity: 'common',
        xpReward: 100
      });
      
      alert('Badge créé avec succès !');
    } catch (error) {
      console.error('Erreur création badge:', error);
      alert('Erreur lors de la création du badge');
    }
  };

  // Attribuer un badge (admin)
  const handleAssignBadges = async (badgeId) => {
    try {
      const batch = writeBatch(db);
      
      selectedUsers.forEach(userId => {
        const badgeRef = doc(collection(db, 'userBadges'));
        batch.set(badgeRef, {
          userId,
          badgeId,
          earnedAt: new Date().toISOString(),
          assignedBy: user.uid
        });
      });
      
      await batch.commit();
      setShowAssignBadgeModal(false);
      setSelectedUsers([]);
      alert(`Badge attribué à ${selectedUsers.length} utilisateur(s) !`);
    } catch (error) {
      console.error('Erreur attribution badge:', error);
      alert('Erreur lors de l\'attribution du badge');
    }
  };

  // Couleur par rareté
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-400 to-gray-500',
      uncommon: 'from-green-400 to-green-500',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Background gradient Synergia */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* 🏆 EN-TÊTE PREMIUM */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-yellow-400" />
              Collection de Badges
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Débloquez des badges en accomplissant des défis ({badgeStats.totalBadges} obtenus)
            </p>
          </motion.div>

          {/* 📊 STATISTIQUES PREMIUM */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <Medal className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-blue-400 font-semibold">Badges Obtenus</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalBadges}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-green-400 font-semibold">Badges Disponibles</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.badgesAvailable}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-semibold">Progression</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.percentage}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-semibold">XP des Badges</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalXP}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 🛡️ BOUTON ADMIN */}
          {userIsAdmin && (
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  showAdminPanel 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                {showAdminPanel ? 'Fermer Panel Admin' : 'Ouvrir Panel Admin'}
              </button>
            </motion.div>
          )}

          {/* 🛡️ PANEL ADMIN */}
          {userIsAdmin && showAdminPanel && (
            <motion.div 
              className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Panel Administration Badges
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setShowCreateBadgeModal(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Créer Badge
                </button>
                
                <button
                  onClick={() => setShowAssignBadgeModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <UserPlus className="w-5 h-5" />
                  Attribuer Badges
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <RefreshCw className="w-5 h-5" />
                  Actualiser
                </button>
              </div>

              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-yellow-300">Gestion Badges</h3>
                </div>
                <p className="text-yellow-200 text-sm">
                  Vous pouvez créer des badges personnalisés et les attribuer aux utilisateurs.
                  Les badges par défaut sont définis dans le code et ne peuvent pas être supprimés.
                </p>
              </div>
            </motion.div>
          )}

          {/* 🔍 FILTRES ET RECHERCHE PREMIUM */}
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Catégorie */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>

              {/* Rareté */}
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="all">Toutes les raretés</option>
                <option value="common">Commun</option>
                <option value="uncommon">Peu commun</option>
                <option value="rare">Rare</option>
                <option value="epic">Épique</option>
                <option value="legendary">Légendaire</option>
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400">
                {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''} trouvé{filteredBadges.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 🏆 GRILLE DES BADGES PREMIUM */}
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            <AnimatePresence>
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                    badge.earned 
                      ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                      : 'border-gray-700/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Icône du badge */}
                  <div className="text-center mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl bg-gradient-to-br ${getRarityColor(badge.rarity)} ${
                      badge.earned ? 'shadow-xl' : 'grayscale opacity-50'
                    }`}>
                      {badge.icon}
                    </div>
                    
                    {/* Statut du badge */}
                    <div className="mt-3">
                      {badge.earned ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Obtenu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-400 text-xs font-semibold rounded-full">
                          <Lock className="w-3 h-3" />
                          Verrouillé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nom et description */}
                  <h3 className={`font-bold text-lg text-center mb-2 ${
                    badge.earned ? 'text-white' : 'text-gray-400'
                  }`}>
                    {badge.name}
                  </h3>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    {badge.description}
                  </p>

                  {/* Infos badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">
                        +{badge.xpReward} XP
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                        badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                        badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {badge.rarity === 'legendary' ? '⭐ Légendaire' :
                         badge.rarity === 'epic' ? '💎 Épique' :
                         badge.rarity === 'rare' ? '💠 Rare' :
                         badge.rarity === 'uncommon' ? '✨ Peu commun' :
                         '⚪ Commun'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Message si aucun badge trouvé */}
          {filteredBadges.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Aucun badge trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos filtres de recherche
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* 🎨 MODAL CRÉATION BADGE */}
      {showCreateBadgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Créer un Badge</h3>
              <button
                onClick={() => setShowCreateBadgeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Super Badge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={badgeForm.description}
                  onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows="3"
                  placeholder="Description du badge..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icône (emoji)</label>
                <input
                  type="text"
                  value={badgeForm.icon}
                  onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="🏆"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                  <select
                    value={badgeForm.category}
                    onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">Général</option>
                    <option value="productivity">Productivité</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="special">Spécial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rareté</label>
                  <select
                    value={badgeForm.rarity}
                    onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="common">Commun</option>
                    <option value="uncommon">Peu commun</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Épique</option>
                    <option value="legendary">Légendaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Récompense XP</label>
                <input
                  type="number"
                  value={badgeForm.xpReward}
                  onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateBadgeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateBadge}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
              >
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🎨 MODAL ATTRIBUTION BADGE */}
      {showAssignBadgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Attribuer un Badge</h3>
              <button
                onClick={() => setShowAssignBadgeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sélectionner un badge</label>
                <select
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  onChange={(e) => {
                    const badgeId = e.target.value;
                    if (badgeId && selectedUsers.length > 0) {
                      handleAssignBadges(badgeId);
                    }
                  }}
                >
                  <option value="">Choisir un badge...</option>
                  {allBadges.map(badge => (
                    <option key={badge.id} value={badge.id}>
                      {badge.icon} {badge.name} (+{badge.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sélectionner les utilisateurs</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-white">{u.displayName || u.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignBadgeModal(false);
                  setSelectedUsers([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default BadgesPage;
