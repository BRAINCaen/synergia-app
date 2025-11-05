// ==========================================
// 📁 react-app/src/pages/Badges.jsx
// PAGE COLLECTION DE BADGES AVEC GESTION ADMIN COMPLÈTE RESTAURÉE
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
  collection, query, orderBy, onSnapshot, where, getDocs, doc, getDoc,
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
      const q = query(badgesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const badges = [];
      snapshot.forEach(doc => {
        badges.push({ id: doc.id, ...doc.data() });
      });
      
      setAllBadges(badges);
      console.log('✅ Tous les badges chargés:', badges.length);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 🎯 EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Collection de Badges
          </h1>
          <p className="text-gray-600">
            {userBadges.length} / {allBadges.length} badges débloqués ({badgeStats.completionPercentage}%)
          </p>
        </div>

        {/* 📊 STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-blue-600 font-semibold">Badges Débloqués</p>
                <p className="text-2xl font-bold text-blue-800">{badgeStats.unlockedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-green-600 font-semibold">Badges Disponibles</p>
                <p className="text-2xl font-bold text-green-800">{badgeStats.badgesAvailable}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-purple-600 font-semibold">Progression</p>
                <p className="text-2xl font-bold text-purple-800">{badgeStats.completionPercentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-yellow-600 font-semibold">XP des Badges</p>
                <p className="text-2xl font-bold text-yellow-800">{badgeStats.totalXpEarned}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🛡️ BOUTON ADMIN */}
        {userIsAdmin && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                showAdminPanel 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              {showAdminPanel ? 'Fermer Panel Admin' : 'Ouvrir Panel Admin'}
            </button>
          </div>
        )}

        {/* 🛡️ PANEL ADMIN */}
        {userIsAdmin && showAdminPanel && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Panel Administration Badges
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setShowCreateBadgeModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer Badge
              </button>
              
              <button
                onClick={() => setShowAssignBadgeModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Gestion Badges</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Vous pouvez créer, modifier et attribuer des badges. Les modifications sont immédiatement synchronisées.
              </p>
            </div>
          </div>
        )}

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un badge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Accomplissement">Accomplissement</option>
              <option value="Performance">Performance</option>
              <option value="Social">Social</option>
              <option value="Exploration">Exploration</option>
            </select>

            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* 🏆 GRILLE DES BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const isUnlocked = userBadges.some(ub => ub.badgeId === badge.id);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${
                  isUnlocked 
                    ? 'border-yellow-400 shadow-yellow-100' 
                    : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Badge Icon */}
                <div className="text-center mb-4">
                  <div className={`text-6xl mb-3 ${isUnlocked ? '' : 'grayscale'}`}>
                    {badge.icon || '🏆'}
                  </div>
                  
                  {isUnlocked && (
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Débloqué
                    </div>
                  )}
                </div>

                {/* Badge Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{badge.category}</span>
                    <span className={`px-2 py-1 rounded font-semibold ${
                      badge.rarity === 'Légendaire' ? 'bg-yellow-100 text-yellow-800' :
                      badge.rarity === 'Épique' ? 'bg-purple-100 text-purple-800' :
                      badge.rarity === 'Rare' ? 'bg-blue-100 text-blue-800' :
                      badge.rarity === 'Peu Commun' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {badge.rarity}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-yellow-600">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold">{badge.xpReward} XP</span>
                  </div>
                </div>

                {/* Actions Admin */}
                {userIsAdmin && showAdminPanel && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
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
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Éditer
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun badge trouvé</p>
          </div>
        )}

        {/* 🎨 MODAL CRÉER BADGE */}
        {showCreateBadgeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer un Badge</h3>
              
              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône (emoji)</label>
                  <input
                    type="text"
                    value={badgeForm.icon}
                    onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={badgeForm.category}
                    onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Accomplissement">Accomplissement</option>
                    <option value="Performance">Performance</option>
                    <option value="Social">Social</option>
                    <option value="Exploration">Exploration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rareté</label>
                  <select
                    value={badgeForm.rarity}
                    onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Commun">Commun</option>
                    <option value="Peu Commun">Peu Commun</option>
                    <option value="Rare">Rare</option>
                    <option value="Épique">Épique</option>
                    <option value="Légendaire">Légendaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">XP Récompense</label>
                  <input
                    type="number"
                    value={badgeForm.xpReward}
                    onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateBadgeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Modifier le Badge</h3>
              
              <form onSubmit={handleEditBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône (emoji)</label>
                  <input
                    type="text"
                    value={badgeForm.icon}
                    onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={badgeForm.category}
                    onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Accomplissement">Accomplissement</option>
                    <option value="Performance">Performance</option>
                    <option value="Social">Social</option>
                    <option value="Exploration">Exploration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rareté</label>
                  <select
                    value={badgeForm.rarity}
                    onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Commun">Commun</option>
                    <option value="Peu Commun">Peu Commun</option>
                    <option value="Rare">Rare</option>
                    <option value="Épique">Épique</option>
                    <option value="Légendaire">Légendaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">XP Récompense</label>
                  <input
                    type="number"
                    value={badgeForm.xpReward}
                    onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🎁 MODAL ATTRIBUER BADGE */}
        {showAssignBadgeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Attribuer un Badge</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Liste des utilisateurs */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Sélectionner un utilisateur</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUsers([user.id])}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selectedUsers.includes(user.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{user.displayName || user.email}</p>
                        <p className="text-sm text-gray-500">{user.xp || 0} XP</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liste des badges */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Sélectionner un badge</h4>
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
                        className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{badge.icon}</span>
                          <div>
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-sm text-gray-500">{badge.xpReward} XP</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAssignBadgeModal(false);
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BadgesPage;
