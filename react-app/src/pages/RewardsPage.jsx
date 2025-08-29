// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES AVEC GESTION ADMIN COMPLÈTE
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Award, Star, Crown, Zap, Package, Eye, EyeOff, Check, X, Clock, 
  AlertCircle, Filter, Search, Plus, Edit, Trash2, Settings, RefreshCw,
  Users, TrendingUp, ShoppingCart, DollarSign, Calendar, Target, Send,
  Save, Upload, Download, MoreVertical, UserPlus, CheckCircle, XCircle
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

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS RÉCOMPENSES
  const [userRewards, setUserRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // 🛡️ ÉTATS ADMIN
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showEditRewardModal, setShowEditRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // 🎨 FORM DONNÉES
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'virtual',
    category: 'Mini-plaisirs',
    xpCost: 100,
    icon: '🎁',
    isAvailable: true,
    stock: -1, // -1 = illimité
    requirements: {}
  });

  // 🏆 CATALOGUE DE RÉCOMPENSES COMPLET
  const REWARDS_CATALOG = {
    boost_xp: {
      id: 'boost_xp',
      name: 'Boost XP',
      description: '+50 XP bonus',
      type: 'virtual',
      category: 'Mini-plaisirs',
      xpCost: 50,
      icon: '⚡',
      isAvailable: true
    },
    premiere_tache: {
      id: 'premiere_tache',
      name: 'Première Tâche',
      description: 'Complétez votre première tâche',
      type: 'achievement',
      category: 'Accomplissement',
      xpCost: 0,
      icon: '🎯',
      isAvailable: true
    },
    badge_special: {
      id: 'badge_special',
      name: 'Badge Spécial',
      description: 'Condition complétée',
      type: 'badge',
      category: 'Collection',
      xpCost: 100,
      icon: '🏆',
      isAvailable: true
    },
    pause_cafe: {
      id: 'pause_cafe',
      name: 'Pause Café Premium',
      description: 'Café offert au bureau',
      type: 'physical',
      category: 'Petits avantages',
      xpCost: 150,
      icon: '☕',
      isAvailable: true
    },
    formation_gratuite: {
      id: 'formation_gratuite',
      name: 'Formation Gratuite',
      description: 'Accès à une formation en ligne',
      type: 'privilege',
      category: 'Développement',
      xpCost: 500,
      icon: '📚',
      isAvailable: true
    },
    parking_vip: {
      id: 'parking_vip',
      name: 'Place Parking VIP',
      description: 'Parking réservé pendant 1 semaine',
      type: 'privilege',
      category: 'Confort',
      xpCost: 300,
      icon: '🚗',
      isAvailable: true
    },
    dejeuner_equipe: {
      id: 'dejeuner_equipe',
      name: 'Déjeuner d\'Équipe',
      description: 'Déjeuner offert avec l\'équipe',
      type: 'social',
      category: 'Social',
      xpCost: 800,
      icon: '🍽️',
      isAvailable: true
    },
    journee_libre: {
      id: 'journee_libre',
      name: 'Journée Libre',
      description: 'Une journée de congé supplémentaire',
      type: 'time',
      category: 'Temps',
      xpCost: 1500,
      icon: '🌴',
      isAvailable: true
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
      await loadUserProfile();
      if (userIsAdmin) {
        await loadAllRewards();
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!user?.uid) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        setUserRewards(userData.rewards || []);
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    }
  };

  const loadAllRewards = async () => {
    try {
      const rewardsQuery = query(
        collection(db, 'rewards'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(rewardsQuery);
      const rewards = [];
      
      snapshot.forEach(doc => {
        rewards.push({ id: doc.id, ...doc.data() });
      });
      
      // Ajouter les récompenses par défaut si elles n'existent pas
      const defaultRewards = Object.values(REWARDS_CATALOG);
      const existingIds = rewards.map(r => r.id);
      
      defaultRewards.forEach(reward => {
        if (!existingIds.includes(reward.id)) {
          rewards.push(reward);
        }
      });
      
      setAllRewards(rewards);
      console.log(`✅ ${rewards.length} récompenses chargées`);
    } catch (error) {
      console.error('❌ Erreur chargement récompenses:', error);
    }
  };

  /**
   * 🛡️ FONCTIONS ADMIN - GESTION RÉCOMPENSES
   */
  const handleCreateReward = async () => {
    try {
      const rewardData = {
        ...rewardForm,
        id: rewardForm.name.toLowerCase().replace(/\s+/g, '_'),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        timesRedeemed: 0
      };

      await addDoc(collection(db, 'rewards'), rewardData);
      
      showNotification('Récompense créée avec succès !', 'success');
      setShowCreateRewardModal(false);
      resetRewardForm();
      
      await loadAllRewards();
    } catch (error) {
      console.error('❌ Erreur création récompense:', error);
      showNotification('Erreur lors de la création', 'error');
    }
  };

  const handleEditReward = async () => {
    if (!selectedReward?.id) return;
    
    try {
      await updateDoc(doc(db, 'rewards', selectedReward.id), {
        ...rewardForm,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      
      showNotification('Récompense modifiée avec succès !', 'success');
      setShowEditRewardModal(false);
      setSelectedReward(null);
      
      await loadAllRewards();
    } catch (error) {
      console.error('❌ Erreur modification récompense:', error);
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette récompense ?')) return;
    
    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      showNotification('Récompense supprimée avec succès !', 'success');
      await loadAllRewards();
    } catch (error) {
      console.error('❌ Erreur suppression récompense:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 🎁 DEMANDER UNE RÉCOMPENSE
   */
  const handleRequestReward = async (reward) => {
    if (!userProfile) return;

    const userXp = userProfile.totalXp || 0;
    
    if (userXp < reward.xpCost) {
      showNotification(`Vous n'avez pas assez d'XP (${userXp}/${reward.xpCost})`, 'error');
      return;
    }

    try {
      // Déduire les XP et ajouter la récompense
      const userRef = doc(db, 'users', user.uid);
      const currentRewards = userProfile.rewards || [];
      
      await updateDoc(userRef, {
        totalXp: userXp - reward.xpCost,
        rewards: [...currentRewards, {
          ...reward,
          redeemedAt: new Date(),
          status: 'redeemed'
        }]
      });
      
      showNotification(`Récompense "${reward.name}" obtenue !`, 'success');
      await loadUserProfile();
      
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      showNotification('Erreur lors de la demande', 'error');
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

  const resetRewardForm = () => {
    setRewardForm({
      name: '',
      description: '',
      type: 'virtual',
      category: 'Mini-plaisirs',
      xpCost: 100,
      icon: '🎁',
      isAvailable: true,
      stock: -1,
      requirements: {}
    });
  };

  /**
   * 🔍 FILTRAGE DES RÉCOMPENSES
   */
  const filteredRewards = useMemo(() => {
    let rewards = userIsAdmin && showAdminPanel ? allRewards : Object.values(REWARDS_CATALOG);
    
    if (searchTerm) {
      rewards = rewards.filter(reward =>
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      rewards = rewards.filter(reward => reward.type === filterType);
    }
    
    if (filterCategory !== 'all') {
      rewards = rewards.filter(reward => reward.category === filterCategory);
    }
    
    return rewards;
  }, [allRewards, searchTerm, filterType, filterCategory, userIsAdmin, showAdminPanel]);

  /**
   * 🎨 UTILITAIRES
   */
  const getTypeColor = (type) => {
    const colors = {
      'virtual': 'text-blue-600 bg-blue-100',
      'physical': 'text-green-600 bg-green-100',
      'privilege': 'text-purple-600 bg-purple-100',
      'badge': 'text-yellow-600 bg-yellow-100',
      'achievement': 'text-orange-600 bg-orange-100',
      'social': 'text-pink-600 bg-pink-100',
      'time': 'text-indigo-600 bg-indigo-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const canAffordReward = (reward) => {
    return (userProfile?.totalXp || 0) >= reward.xpCost;
  };

  const hasReward = (rewardId) => {
    return userRewards.some(r => r.id === rewardId);
  };

  // Types et catégories pour les filtres
  const types = [...new Set(Object.values(REWARDS_CATALOG).map(r => r.type))];
  const categories = [...new Set(Object.values(REWARDS_CATALOG).map(r => r.category))];

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
            <p className="text-white text-lg">Chargement des récompenses...</p>
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
                  <Gift className="w-8 h-8 text-purple-400" />
                  Récompenses
                </h1>
                <p className="text-gray-300">
                  Débloquez et collectionnez vos récompenses ({userRewards.length} obtenues)
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
                        onClick={() => setShowCreateRewardModal(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer Récompense
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
                    <div className="text-2xl font-bold text-purple-400">{userRewards.length}</div>
                    <div className="text-gray-400 text-sm mt-1">Récompenses</div>
                  </div>
                  <Gift className="w-8 h-8 text-purple-400" />
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
                    <div className="text-2xl font-bold text-blue-400">{Object.keys(REWARDS_CATALOG).length}</div>
                    <div className="text-gray-400 text-sm mt-1">Disponibles</div>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
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
                    <div className="text-2xl font-bold text-yellow-400">{userProfile?.totalXp || 0}</div>
                    <div className="text-gray-400 text-sm mt-1">XP Disponibles</div>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-400" />
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
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round((userRewards.length / Object.keys(REWARDS_CATALOG).length) * 100)}%
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Progression</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
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
                    placeholder="Rechercher une récompense..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Filtre Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500"
                >
                  <option value="all">Tous les types</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

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

                {/* XP Utilisateur */}
                <div className="flex items-center justify-center bg-gray-700/30 rounded-lg px-4 py-2">
                  <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-white font-semibold">{userProfile?.totalXp || 0} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🎁 CATALOGUE DE RÉCOMPENSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRewards.map((reward, index) => {
              const isOwned = hasReward(reward.id);
              const canAfford = canAffordReward(reward);
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02]
                    ${isOwned ? 'border-green-500/50 shadow-green-500/20 shadow-lg' : 
                      canAfford ? 'border-purple-500/50 hover:border-purple-400/70' : 'border-gray-700/50 opacity-75'}
                  `}
                >
                  {/* Badge d'état */}
                  {isOwned && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      Possédé
                    </div>
                  )}

                  {/* Actions Admin */}
                  {userIsAdmin && showAdminPanel && (
                    <div className="absolute top-3 left-3 flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedReward(reward);
                          setRewardForm(reward);
                          setShowEditRewardModal(true);
                        }}
                        className="p-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Icône récompense */}
                  <div className="text-center mb-4">
                    <div className={`text-5xl mb-3 ${!canAfford && !isOwned ? 'opacity-40 grayscale' : ''}`}>
                      {reward.icon}
                    </div>
                    <div className={`w-2 h-2 rounded-full mx-auto ${
                      isOwned ? 'bg-green-500' : canAfford ? 'bg-purple-500' : 'bg-gray-500'
                    }`} />
                  </div>

                  {/* Informations récompense */}
                  <div className="text-center">
                    <h3 className={`text-lg font-bold mb-2 ${
                      isOwned || canAfford ? 'text-white' : 'text-gray-400'
                    }`}>
                      {reward.name}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      isOwned || canAfford ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {reward.description}
                    </p>

                    {/* Métadonnées */}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reward.type)}`}>
                        {reward.type}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {reward.category}
                      </span>
                    </div>

                    {/* Prix et action */}
                    <div className="space-y-3">
                      <div className={`flex items-center justify-center gap-2 text-lg font-bold ${
                        canAfford ? 'text-yellow-400' : 'text-gray-500'
                      }`}>
                        <Zap className="w-5 h-5" />
                        <span>{reward.xpCost} XP</span>
                      </div>

                      {!isOwned && (
                        <button
                          onClick={() => handleRequestReward(reward)}
                          disabled={!canAfford}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            canAfford
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : 'bg-gray-600 cursor-not-allowed text-gray-400'
                          }`}
                        >
                          {canAfford ? 'Demander' : 'XP insuffisants'}
                        </button>
                      )}

                      {isOwned && (
                        <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Possédé
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Message si aucune récompense */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune récompense trouvée</h3>
              <p className="text-gray-400">Modifiez vos critères de recherche</p>
            </div>
          )}
        </div>
      </div>

      {/* 🎨 MODAL CRÉATION RÉCOMPENSE */}
      <AnimatePresence>
        {showCreateRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Créer une Récompense</h3>
                <button
                  onClick={() => setShowCreateRewardModal(false)}
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
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Nom de la récompense"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                    placeholder="Description de la récompense"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                    <input
                      type="text"
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl"
                      placeholder="🎁"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Coût XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="virtual">Virtuel</option>
                      <option value="physical">Physique</option>
                      <option value="privilege">Privilège</option>
                      <option value="badge">Badge</option>
                      <option value="achievement">Accomplissement</option>
                      <option value="social">Social</option>
                      <option value="time">Temps</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={rewardForm.category}
                      onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Mini-plaisirs">Mini-plaisirs</option>
                      <option value="Petits avantages">Petits avantages</option>
                      <option value="Développement">Développement</option>
                      <option value="Confort">Confort</option>
                      <option value="Social">Social</option>
                      <option value="Temps">Temps</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                  <input
                    type="number"
                    value={rewardForm.stock}
                    onChange={(e) => setRewardForm({...rewardForm, stock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="-1 pour illimité"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setShowCreateRewardModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateReward}
                  disabled={!rewardForm.name || !rewardForm.description}
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

      {/* 🎨 MODAL MODIFICATION RÉCOMPENSE */}
      <AnimatePresence>
        {showEditRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Modifier la Récompense</h3>
                <button
                  onClick={() => setShowEditRewardModal(false)}
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
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                    <input
                      type="text"
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Coût XP</label>
                    <input
                      type="number"
                      value={rewardForm.xpCost}
                      onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={rewardForm.type}
                      onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="virtual">Virtuel</option>
                      <option value="physical">Physique</option>
                      <option value="privilege">Privilège</option>
                      <option value="badge">Badge</option>
                      <option value="achievement">Accomplissement</option>
                      <option value="social">Social</option>
                      <option value="time">Temps</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={rewardForm.category}
                      onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Mini-plaisirs">Mini-plaisirs</option>
                      <option value="Petits avantages">Petits avantages</option>
                      <option value="Développement">Développement</option>
                      <option value="Confort">Confort</option>
                      <option value="Social">Social</option>
                      <option value="Temps">Temps</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setShowEditRewardModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditReward}
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
    </Layout>
  );
};

export default RewardsPage;
