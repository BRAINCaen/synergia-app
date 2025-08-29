// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE COLLECTION DE BADGES AVEC GESTION ADMIN COMPLÈTE
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, Star, Target, Zap, Crown, Shield, Gem, Medal, Gift,
  Search, Filter, Grid, List, Lock, Unlock, Calendar, Users, CheckCircle,
  Clock, Eye, MoreVertical, Flame, BookOpen, Briefcase, Heart, ThumbsUp,
  Settings, RefreshCw, Download, Plus, Edit, Trash2, UserPlus, Send,
  Save, X, Upload, AlertCircle, Check
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, query, orderBy, onSnapshot, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp
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
  const [viewMode, setViewMode] = useState('grid');

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

  // 🏆 DÉFINITIONS DES BADGES COMPLETS
  const BADGE_DEFINITIONS = {
    chef_de_projet: {
      id: 'chef_de_projet',
      name: 'Chef de Projet',
      description: 'Terminez votre premier projet',
      icon: '📁',
      category: 'Accomplissement',
      rarity: 'Peu commun',
      xpReward: 150,
      requirements: { projectsCompleted: 1 }
    },
    eclair: {
      id: 'eclair',
      name: 'Éclair',
      description: 'Terminez une tâche en moins de 30 minutes',
      icon: '⚡',
      category: 'Performance',
      rarity: 'Rare',
      xpReward: 125,
      requirements: { fastTaskCompletion: 1 }
    },
    veteran: {
      id: 'veteran',
      name: 'Vétéran',
      description: 'Atteignez le niveau 10',
      icon: '⭐',
      category: 'Progression',
      rarity: 'Épique',
      xpReward: 300,
      requirements: { level: 10 }
    },
    mentor: {
      id: 'mentor',
      name: 'Mentor',
      description: 'Aidez 5 collègues différents',
      icon: '🎓',
      category: 'Collaboration',
      rarity: 'Rare',
      xpReward: 200,
      requirements: { colleaguesHelped: 5 }
    },
    maitre_xp: {
      id: 'maitre_xp',
      name: 'Maître XP',
      description: 'Gagnez 1000 points d\'expérience',
      icon: '💎',
      category: 'Performance',
      rarity: 'Légendaire',
      xpReward: 500,
      requirements: { totalXp: 1000 }
    },
    first_login: {
      id: 'first_login',
      name: 'Bienvenue !',
      description: 'Première connexion à Synergia',
      icon: '👋',
      category: 'Découverte',
      rarity: 'Commun',
      xpReward: 50,
      requirements: { firstLogin: true }
    },
    communicateur: {
      id: 'communicateur',
      name: 'Communicateur',
      description: 'Envoyez 10 messages dans l\'équipe',
      icon: '💬',
      category: 'Collaboration',
      rarity: 'Commun',
      xpReward: 75,
      requirements: { messagesSent: 10 }
    },
    organisateur: {
      id: 'organisateur',
      name: 'Organisateur',
      description: 'Créez votre première tâche',
      icon: '📋',
      category: 'Accomplissement',
      rarity: 'Commun',
      xpReward: 100,
      requirements: { tasksCreated: 1 }
    }
  };

  /**
   * 🚀 CHARGEMENT DES DONNÉES
   */
  useEffect(() => {
    loadAllData();
  }, [user?.uid]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Charger badges utilisateur
      await loadUserBadges();
      
      // Charger tous les badges (admin)
      if (userIsAdmin) {
        await loadAllBadges();
        await loadAllUsers();
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBadges = async () => {
    if (!user?.uid) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const badges = userData.badges || [];
        setUserBadges(badges);
      }
    } catch (error) {
      console.error('❌ Erreur chargement badges utilisateur:', error);
    }
  };

  const loadAllBadges = async () => {
    try {
      const badgesQuery = query(
        collection(db, 'badges'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(badgesQuery);
      const badges = [];
      
      snapshot.forEach(doc => {
        badges.push({ id: doc.id, ...doc.data() });
      });
      
      // Ajouter les badges par défaut s'ils n'existent pas
      const defaultBadges = Object.values(BADGE_DEFINITIONS);
      const existingIds = badges.map(b => b.id);
      
      defaultBadges.forEach(badge => {
        if (!existingIds.includes(badge.id)) {
          badges.push(badge);
        }
      });
      
      setAllBadges(badges);
      console.log(`✅ ${badges.length} badges chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('displayName', 'asc')
      );
      
      const snapshot = await getDocs(usersQuery);
      const users = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          displayName: userData.displayName || userData.email,
          email: userData.email,
          badges: userData.badges || [],
          totalXp: userData.totalXp || 0,
          level: userData.level || 1
        });
      });
      
      setAllUsers(users);
      console.log(`✅ ${users.length} utilisateurs chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
    }
  };

  /**
   * 🛡️ FONCTIONS ADMIN - GESTION BADGES
   */
  const handleCreateBadge = async () => {
    try {
      const badgeData = {
        ...badgeForm,
        id: badgeForm.name.toLowerCase().replace(/\s+/g, '_'),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        assignedToUsers: []
      };

      await addDoc(collection(db, 'badges'), badgeData);
      
      showNotification('Badge créé avec succès !', 'success');
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
      
      await loadAllBadges();
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      showNotification('Erreur lors de la création', 'error');
    }
  };

  const handleEditBadge = async () => {
    if (!selectedBadge?.id) return;
    
    try {
      await updateDoc(doc(db, 'badges', selectedBadge.id), {
        ...badgeForm,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      
      showNotification('Badge modifié avec succès !', 'success');
      setShowEditBadgeModal(false);
      setSelectedBadge(null);
      
      await loadAllBadges();
    } catch (error) {
      console.error('❌ Erreur modification badge:', error);
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    
    try {
      await deleteDoc(doc(db, 'badges', badgeId));
      showNotification('Badge supprimé avec succès !', 'success');
      await loadAllBadges();
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 🎖️ ATTRIBUER DES BADGES MANUELLEMENT
   */
  const handleAssignBadge = async () => {
    if (!selectedBadge || selectedUsers.length === 0) return;
    
    try {
      const promises = selectedUsers.map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentBadges = userData.badges || [];
          
          // Vérifier si l'utilisateur a déjà ce badge
          const hasBadge = currentBadges.some(b => b.id === selectedBadge.id);
          
          if (!hasBadge) {
            const newBadge = {
              ...selectedBadge,
              earnedAt: new Date(),
              assignedBy: user.uid,
              manuallyAssigned: true
            };
            
            await updateDoc(userRef, {
              badges: [...currentBadges, newBadge],
              totalXp: (userData.totalXp || 0) + (selectedBadge.xpReward || 0)
            });
          }
        }
      });
      
      await Promise.all(promises);
      
      showNotification(`Badge "${selectedBadge.name}" attribué à ${selectedUsers.length} utilisateur(s) !`, 'success');
      setShowAssignBadgeModal(false);
      setSelectedBadge(null);
      setSelectedUsers([]);
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      showNotification('Erreur lors de l\'attribution', 'error');
    }
  };

  /**
   * 🔔 NOTIFICATION
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  /**
   * 🔍 FILTRAGE DES BADGES
   */
  const filteredBadges = useMemo(() => {
    let badges = userIsAdmin && showAdminPanel ? allBadges : Object.values(BADGE_DEFINITIONS);
    
    if (searchTerm) {
      badges = badges.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      badges = badges.filter(badge => badge.category === filterCategory);
    }
    
    if (filterRarity !== 'all') {
      badges = badges.filter(badge => badge.rarity === filterRarity);
    }
    
    return badges;
  }, [allBadges, searchTerm, filterCategory, filterRarity, userIsAdmin, showAdminPanel]);

  /**
   * 🎨 UTILITAIRES
   */
  const getRarityColor = (rarity) => {
    const colors = {
      'Commun': 'text-gray-600 bg-gray-100',
      'Peu commun': 'text-green-600 bg-green-100',
      'Rare': 'text-blue-600 bg-blue-100',
      'Épique': 'text-purple-600 bg-purple-100',
      'Légendaire': 'text-yellow-600 bg-yellow-100'
    };
    return colors[rarity] || 'text-gray-600 bg-gray-100';
  };

  const userHasBadge = (badgeId) => {
    return userBadges.some(b => b.id === badgeId);
  };

  // Catégories et raretés pour les filtres
  const categories = [...new Set(Object.values(BADGE_DEFINITIONS).map(b => b.category))];
  const rarities = [...new Set(Object.values(BADGE_DEFINITIONS).map(b => b.rarity))];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Chargement de votre collection...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🏆 EN-TÊTE */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Collection de Badges
                </h1>
                <p className="text-gray-300">
                  Débloquez des badges en accomplissant des défis ({userBadges.length} obtenus)
                </p>
              </div>
              
              {/* Actions Admin */}
              {userIsAdmin && (
                <div className="flex items-center gap-3 mt-4 lg:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      showAdminPanel 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {showAdminPanel ? 'Fermer Admin' : 'Mode Admin'}
                  </motion.button>
                  
                  {showAdminPanel && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateBadgeModal(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer Badge
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={loadAllData}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{userBadges.length}</div>
                    <div className="text-gray-400 text-sm mt-1">Badges Obtenus</div>
                  </div>
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{Object.keys(BADGE_DEFINITIONS).length}</div>
                    <div className="text-gray-400 text-sm mt-1">Badges Disponibles</div>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round((userBadges.length / Object.keys(BADGE_DEFINITIONS).length) * 100)}%
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Progression</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {userBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">XP des Badges</div>
                  </div>
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* 🔍 FILTRES */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un badge..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Filtre Catégorie */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Filtre Rareté */}
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                >
                  <option value="all">Toutes les raretés</option>
                  {rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>

                {/* Mode d'affichage */}
                <div className="flex rounded-lg overflow-hidden border border-gray-600">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grille
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 transition-colors ${
                      viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Liste
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🏆 COLLECTION DE BADGES */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBadges.map((badge, index) => {
                const isEarned = userHasBadge(badge.id);
                
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02]
                      ${isEarned ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-lg' : 'border-gray-700/50 hover:border-gray-600/50'}
                    `}
                  >
                    {/* Badge d'état */}
                    {isEarned && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                        Obtenu
                      </div>
                    )}

                    {/* Actions Admin */}
                    {userIsAdmin && showAdminPanel && (
                      <div className="absolute top-3 left-3 flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedBadge(badge);
                            setBadgeForm(badge);
                            setShowEditBadgeModal(true);
                          }}
                          className="p-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBadge(badge);
                            setShowAssignBadgeModal(true);
                          }}
                          className="p-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="p-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Icône badge */}
                    <div className="text-center mb-4">
                      <div className={`
                        text-6xl mb-3 ${isEarned ? '' : 'opacity-40 grayscale'}
                      `}>
                        {badge.icon}
                      </div>
                      <div className={`w-2 h-2 rounded-full mx-auto ${isEarned ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    </div>

                    {/* Informations badge */}
                    <div className="text-center">
                      <h3 className={`text-lg font-bold mb-2 ${isEarned ? 'text-white' : 'text-gray-400'}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-sm mb-3 ${isEarned ? 'text-gray-300' : 'text-gray-500'}`}>
                        {badge.description}
                      </p>

                      {/* Métadonnées */}
                      <div className="flex flex-wrap gap-2 justify-center mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          {badge.category}
                        </span>
                      </div>

                      {/* Récompense XP */}
                      <div className="flex items-center justify-center gap-1 text-sm text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span>{badge.xpReward} XP</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Vue liste
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Badge</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Catégorie</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rareté</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">XP</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                      {userIsAdmin && showAdminPanel && (
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredBadges.map((badge) => {
                      const isEarned = userHasBadge(badge.id);
                      
                      return (
                        <tr key={badge.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`text-2xl mr-3 ${isEarned ? '' : 'opacity-40 grayscale'}`}>
                                {badge.icon}
                              </div>
                              <div>
                                <div className={`font-semibold ${isEarned ? 'text-white' : 'text-gray-400'}`}>
                                  {badge.name}
                                </div>
                                <div className="text-sm text-gray-500">{badge.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{badge.category}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                              {badge.rarity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-yellow-400 font-semibold">{badge.xpReward}</td>
                          <td className="px-6 py-4">
                            {isEarned ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Obtenu
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Lock className="w-3 h-3 mr-1" />
                                Verrouillé
                              </span>
                            )}
                          </td>
                          {userIsAdmin && showAdminPanel && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedBadge(badge);
                                    setBadgeForm(badge);
                                    setShowEditBadgeModal(true);
                                  }}
                                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBadge(badge);
                                    setShowAssignBadgeModal(true);
                                  }}
                                  className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBadge(badge.id)}
                                  className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Message si aucun badge */}
          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucun badge trouvé</h3>
              <p className="text-gray-400">Modifiez vos critères de recherche</p>
            </div>
          )}
        </div>
      </div>

      {/* 🎨 MODAL CRÉATION BADGE */}
      <AnimatePresence>
        {showCreateBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Créer un Badge</h3>
                <button
                  onClick={() => setShowCreateBadgeModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Nom du badge"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                    placeholder="Description du badge"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                    <input
                      type="text"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl"
                      placeholder="🏆"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">XP Récompense</label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={badgeForm.category}
                      onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Accomplissement">Accomplissement</option>
                      <option value="Performance">Performance</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Progression">Progression</option>
                      <option value="Découverte">Découverte</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rareté</label>
                    <select
                      value={badgeForm.rarity}
                      onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Commun">Commun</option>
                      <option value="Peu commun">Peu commun</option>
                      <option value="Rare">Rare</option>
                      <option value="Épique">Épique</option>
                      <option value="Légendaire">Légendaire</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setShowCreateBadgeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateBadge}
                  disabled={!badgeForm.name || !badgeForm.description}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Créer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎨 MODAL MODIFICATION BADGE */}
      <AnimatePresence>
        {showEditBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Modifier le Badge</h3>
                <button
                  onClick={() => setShowEditBadgeModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                    <input
                      type="text"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">XP Récompense</label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={badgeForm.category}
                      onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Accomplissement">Accomplissement</option>
                      <option value="Performance">Performance</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Progression">Progression</option>
                      <option value="Découverte">Découverte</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rareté</label>
                    <select
                      value={badgeForm.rarity}
                      onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Commun">Commun</option>
                      <option value="Peu commun">Peu commun</option>
                      <option value="Rare">Rare</option>
                      <option value="Épique">Épique</option>
                      <option value="Légendaire">Légendaire</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setShowEditBadgeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditBadge}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎖️ MODAL ATTRIBUTION BADGE */}
      <AnimatePresence>
        {showAssignBadgeModal && selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-700 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedBadge.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Attribuer "{selectedBadge.name}"</h3>
                    <p className="text-gray-400 text-sm">Sélectionnez les utilisateurs</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignBadgeModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Liste des utilisateurs */}
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {allUsers.map(user => {
                  const isSelected = selectedUsers.includes(user.id);
                  const hasBadge = user.badges.some(b => b.id === selectedBadge.id);
                  
                  return (
                    <div
                      key={user.id}
                      className={`
                        p-3 rounded-lg border transition-colors cursor-pointer
                        ${isSelected ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'}
                        ${hasBadge ? 'opacity-50' : ''}
                      `}
                      onClick={() => {
                        if (hasBadge) return;
                        
                        setSelectedUsers(prev => 
                          isSelected 
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.displayName}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasBadge && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                              Déjà obtenu
                            </span>
                          )}
                          {isSelected && !hasBadge && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignBadgeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignBadge}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Attribuer à {selectedUsers.length} utilisateur(s)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default BadgesPage;
