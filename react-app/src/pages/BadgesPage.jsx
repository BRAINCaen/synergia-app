// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE COLLECTION DE BADGES AVEC GESTION ADMIN COMPLÈTE
// SUPPRESSION BADGES PAR DÉFAUT INTÉGRÉE + FIREBASE INTÉGRÉ
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

  // 🏆 DÉFINITIONS DES BADGES COMPLETS
  const BADGE_DEFINITIONS = {
    chef_de_projet: {
      id: 'chef_de_projet',
      name: 'Chef de Projet',
      description: 'Terminez votre premier projet avec succès',
      icon: '🎯',
      category: 'Accomplissement',
      rarity: 'Rare',
      xpReward: 150,
      condition: (stats) => stats.projectsCompleted >= 1,
      isDefault: true
    },
    super_vendeur_se1: {
      id: 'super_vendeur_se1',
      name: 'Super Vendeur se 1',
      description: 'T\'as fait une vente CO ! T\'es une Génie qui branche de la lumière !',
      icon: '🏆',
      category: 'Vente',
      rarity: 'Légendaire',
      xpReward: 500,
      condition: (stats) => stats.salesCount >= 1,
      isDefault: true
    },
    test: {
      id: 'test',
      name: 'test',
      description: 'test',
      icon: '🏆',
      category: 'Test',
      rarity: 'Commun',
      xpReward: 100,
      condition: null,
      isDefault: true
    },
    eclair: {
      id: 'eclair',
      name: 'Éclair',
      description: 'Terminez une tâche en moins de 30 minutes',
      icon: '⚡',
      category: 'Rapidité',
      rarity: 'Commun',
      xpReward: 75,
      condition: (stats) => stats.fastTasksCompleted >= 1,
      isDefault: true
    },
    veteran: {
      id: 'veteran',
      name: 'Vétéran',
      description: 'Atteignez le niveau 10',
      icon: '🌟',
      category: 'Progression',
      rarity: 'Épique',
      xpReward: 300,
      condition: (stats) => stats.level >= 10,
      isDefault: true
    },
    mentor: {
      id: 'mentor',
      name: 'Mentor',
      description: 'Aidez 5 collègues différents',
      icon: '👨‍🏫',
      category: 'Collaboration',
      rarity: 'Rare',
      xpReward: 200,
      condition: (stats) => stats.colleaguesHelped >= 5,
      isDefault: true
    }
  };

  // 📋 STATISTIQUES DES BADGES
  const badgeStats = useMemo(() => {
    return {
      totalBadges: userBadges.length,
      badgesAvailable: allBadges.length > 0 ? allBadges.length : Object.keys(BADGE_DEFINITIONS).length,
      completionPercentage: allBadges.length > 0 
        ? Math.round((userBadges.length / allBadges.length) * 100)
        : Math.round((userBadges.length / Object.keys(BADGE_DEFINITIONS).length) * 100),
      totalXpEarned: userBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0)
    };
  }, [userBadges, allBadges]);

  // 🎨 CATÉGORIES DISPONIBLES
  const categories = [
    'all', 'Accomplissement', 'Vente', 'Test', 'Rapidité', 
    'Progression', 'Collaboration', 'Communication', 'Engagement'
  ];

  // 🌟 RARETÉS DISPONIBLES
  const rarities = [
    'all', 'Commun', 'Peu Commun', 'Rare', 'Épique', 'Légendaire'
  ];

  /**
   * 🔥 CHARGEMENT INITIAL
   */
  useEffect(() => {
    loadUserBadges();
    if (userIsAdmin) {
      loadAllBadges();
      loadAllUsers();
    }
  }, [user, userIsAdmin]);

  /**
   * 📊 CHARGEMENT DES BADGES UTILISATEUR
   */
  const loadUserBadges = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const badges = userData.badges || [];
        setUserBadges(badges);
      }
    } catch (error) {
      console.error('❌ Erreur chargement badges utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CHARGEMENT DE TOUS LES BADGES (ADMIN) - FIREBASE UNIQUEMENT
   */
  const loadAllBadges = async () => {
    try {
      console.log('📊 Chargement de TOUS les badges depuis Firebase...');
      
      // 1️⃣ CHARGER LES BADGES FIREBASE
      const badgesQuery = query(collection(db, 'badges'), orderBy('createdAt', 'desc'));
      const badgesSnapshot = await getDocs(badgesQuery);
      
      const firebaseBadges = [];
      badgesSnapshot.forEach((doc) => {
        const badgeData = doc.data();
        firebaseBadges.push({ 
          id: doc.id, 
          ...badgeData,
          isFirebase: true,
          source: 'firebase'
        });
      });

      // 2️⃣ AJOUTER LES BADGES PAR DÉFAUT (ceux qui ne sont pas supprimés)
      const suppressedBadgesQuery = query(collection(db, 'badge_suppressions'));
      const suppressedSnapshot = await getDocs(suppressedBadgesQuery);
      
      const suppressedBadgeIds = [];
      suppressedSnapshot.forEach((doc) => {
        suppressedBadgeIds.push(doc.id);
      });

      const defaultBadges = Object.values(BADGE_DEFINITIONS)
        .filter(badge => !suppressedBadgeIds.includes(badge.id))
        .map(badge => ({
          ...badge,
          isDefault: true,
          source: 'default'
        }));

      // 3️⃣ COMBINER TOUS LES BADGES
      const allBadgesArray = [...firebaseBadges, ...defaultBadges];
      
      setAllBadges(allBadgesArray);
      console.log(`✅ ${allBadgesArray.length} badges chargés (${firebaseBadges.length} Firebase + ${defaultBadges.length} par défaut)`);
      
    } catch (error) {
      console.error('❌ Erreur chargement tous les badges:', error);
      // Fallback sur les badges par défaut uniquement
      setAllBadges(Object.values(BADGE_DEFINITIONS).map(badge => ({
        ...badge,
        isDefault: true,
        source: 'default'
      })));
    }
  };

  /**
   * 👥 CHARGEMENT DE TOUS LES UTILISATEURS (ADMIN)
   */
  const loadAllUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const users = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          displayName: userData.displayName || userData.firstName || userData.email,
          email: userData.email,
          badges: userData.badges || [],
          totalXp: userData.totalXp || 0
        });
      });

      setAllUsers(users);
      console.log(`✅ ${users.length} utilisateurs chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
    }
  };

  /**
   * 🎨 CRÉATION D'UN NOUVEAU BADGE
   */
  const handleCreateBadge = async () => {
    if (!badgeForm.name.trim()) {
      showNotification('Le nom du badge est requis', 'error');
      return;
    }

    try {
      console.log('🎨 Création badge:', badgeForm);
      
      const badgeData = {
        name: badgeForm.name,
        description: badgeForm.description,
        icon: badgeForm.icon,
        category: badgeForm.category,
        rarity: badgeForm.rarity,
        xpReward: parseInt(badgeForm.xpReward) || 100,
        requirements: badgeForm.requirements || {},
        isActive: badgeForm.isActive !== false,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        isCustom: true
      };

      const docRef = await addDoc(collection(db, 'badges'), badgeData);
      console.log('✅ Badge créé avec ID:', docRef.id);

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
      showNotification('Erreur lors de la création: ' + error.message, 'error');
    }
  };

  const handleEditBadge = async () => {
    if (!selectedBadge?.id) return;
    
    try {
      await updateDoc(doc(db, 'badges', selectedBadge.id), {
        name: badgeForm.name,
        description: badgeForm.description,
        icon: badgeForm.icon,
        category: badgeForm.category,
        rarity: badgeForm.rarity,
        xpReward: parseInt(badgeForm.xpReward) || 100,
        requirements: badgeForm.requirements || {},
        isActive: badgeForm.isActive !== false,
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

  /**
   * 🗑️ SUPPRESSION BADGE NORMAL (FIREBASE)
   */
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
   * 🗑️ SUPPRESSION DÉFINITIVE D'UN BADGE PAR DÉFAUT
   * Cette fonction supprime un badge des définitions par défaut ET de tous les utilisateurs
   */
  const handleDeleteDefaultBadge = async (badgeId) => {
    if (!confirm(`⚠️ ATTENTION ! Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT le badge par défaut "${badgeId}" ?\n\nCela va :\n- Le supprimer de TOUS les utilisateurs qui le possèdent\n- Ajuster automatiquement leur XP\n- Rendre cette suppression PERMANENTE\n\nCette action est IRRÉVERSIBLE !`)) {
      return;
    }
    
    try {
      console.log(`🗑️ Suppression définitive du badge par défaut: ${badgeId}`);
      
      const batch = writeBatch(db);
      let deletedFromUsers = 0;
      
      // 1️⃣ SUPPRIMER LE BADGE DE TOUS LES UTILISATEURS
      console.log('🔍 Recherche des utilisateurs ayant ce badge...');
      
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const currentBadges = userData.badges || [];
        
        // Vérifier si l'utilisateur a ce badge
        const hasBadge = currentBadges.some(badge => 
          badge.id === badgeId || badge.badgeId === badgeId
        );
        
        if (hasBadge) {
          // Filtrer le badge à supprimer
          const updatedBadges = currentBadges.filter(b => 
            b.id !== badgeId && b.badgeId !== badgeId
          );
          
          // Calculer la perte d'XP
          const removedBadge = currentBadges.find(b => 
            b.id === badgeId || b.badgeId === badgeId
          );
          const xpLoss = removedBadge?.xpReward || 0;
          
          // Ajouter à la batch
          batch.update(userDoc.ref, {
            badges: updatedBadges,
            totalXp: Math.max(0, (userData.totalXp || 0) - xpLoss),
            'gamification.totalXp': Math.max(0, ((userData.gamification?.totalXp) || 0) - xpLoss),
            'gamification.badges': updatedBadges,
            'gamification.badgeCount': updatedBadges.length,
            updatedAt: serverTimestamp()
          });
          
          deletedFromUsers++;
        }
      });
      
      // 2️⃣ SUPPRIMER LE BADGE DE LA COLLECTION BADGES FIRESTORE (si elle existe)
      try {
        const badgeRef = doc(db, 'badges', badgeId);
        const badgeDoc = await getDoc(badgeRef);
        
        if (badgeDoc.exists()) {
          batch.delete(badgeRef);
          console.log(`🗑️ Badge ${badgeId} marqué pour suppression de Firestore`);
        }
      } catch (error) {
        console.warn('⚠️ Pas de badge à supprimer dans Firestore:', error.message);
      }
      
      // 3️⃣ ENREGISTRER UNE SUPPRESSION DÉFINITIVE
      const suppressionRecord = {
        badgeId: badgeId,
        suppressedAt: serverTimestamp(),
        suppressedBy: user.uid,
        reason: 'Suppression badge par défaut depuis BadgesPage',
        usersAffected: deletedFromUsers,
        permanent: true
      };
      
      batch.set(doc(db, 'badge_suppressions', badgeId), suppressionRecord);
      
      // 4️⃣ EXÉCUTER TOUTES LES MODIFICATIONS
      await batch.commit();
      
      // 5️⃣ METTRE À JOUR LES DÉFINITIONS EN MÉMOIRE
      if (BADGE_DEFINITIONS[badgeId]) {
        delete BADGE_DEFINITIONS[badgeId];
        console.log(`🔄 Badge ${badgeId} supprimé des définitions en mémoire`);
      }
      
      console.log(`✅ Badge ${badgeId} supprimé définitivement`);
      console.log(`👥 ${deletedFromUsers} utilisateurs affectés`);
      
      showNotification(`Badge "${badgeId}" supprimé définitivement de ${deletedFromUsers} utilisateur(s) !`, 'success');
      
      // Recharger les données
      await loadAllBadges();
      await loadUserBadges();
      
    } catch (error) {
      console.error('❌ Erreur suppression badge par défaut:', error);
      showNotification(`Erreur lors de la suppression: ${error.message}`, 'error');
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
              id: selectedBadge.id,
              name: selectedBadge.name,
              description: selectedBadge.description,
              icon: selectedBadge.icon,
              category: selectedBadge.category,
              rarity: selectedBadge.rarity,
              xpReward: selectedBadge.xpReward || 0,
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
    let badges = [];
    
    if (userIsAdmin && showAdminPanel) {
      // Mode admin : afficher tous les badges (Firebase + par défaut non supprimés)
      badges = allBadges;
    } else {
      // Mode utilisateur : afficher badges avec statut obtenu/non obtenu
      badges = Object.values(BADGE_DEFINITIONS).map(def => {
        const userBadge = userBadges.find(ub => ub.id === def.id);
        return userBadge ? { ...def, ...userBadge, earned: true } : { ...def, earned: false };
      });
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      badges = badges.filter(badge => 
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      badges = badges.filter(badge => badge.category === filterCategory);
    }

    // Filtrer par rareté
    if (filterRarity !== 'all') {
      badges = badges.filter(badge => badge.rarity === filterRarity);
    }

    return badges;
  }, [allBadges, userBadges, searchTerm, filterCategory, filterRarity, showAdminPanel, userIsAdmin]);

  /**
   * 🎨 COULEUR PAR RARETÉ
   */
  const getRarityColor = (rarity) => {
    const colors = {
      'Commun': 'from-gray-500 to-gray-600',
      'Peu Commun': 'from-green-500 to-green-600',
      'Rare': 'from-blue-500 to-blue-600',
      'Épique': 'from-purple-500 to-purple-600',
      'Légendaire': 'from-yellow-500 to-orange-500'
    };
    return colors[rarity] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 🏆 EN-TÊTE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-600" />
            Collection de Badges
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Débloquez des badges en accomplissant des défis ({badgeStats.totalBadges} obtenus)
          </p>
        </div>

        {/* 📊 STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Medal className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-blue-600 font-semibold">Badges Obtenus</p>
                <p className="text-2xl font-bold text-blue-800">{badgeStats.totalBadges}</p>
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
                <h3 className="font-semibold text-yellow-800">Gestion Badges par Défaut</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Vous pouvez maintenant <strong>supprimer définitivement</strong> les badges par défaut ! 
                Cliquez sur l'icône <XOctagon className="w-4 h-4 inline text-red-600" /> rouge à côté d'un badge par défaut.
                <br /><strong>⚠️ ATTENTION :</strong> Cette action supprime le badge de tous les utilisateurs et ajuste automatiquement leur XP.
              </p>
            </div>
          </div>
        )}

        {/* 🔍 FILTRES */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un badge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Toutes les catégories' : category}
              </option>
            ))}
          </select>

          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'Toutes les raretés' : rarity}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 🏆 GRILLE DES BADGES */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
          {filteredBadges.map((badge) => (
            <motion.div
              key={badge.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                badge.earned ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Badge Icon */}
              <div className="text-center mb-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl bg-gradient-to-br ${getRarityColor(badge.rarity)} ${
                  badge.earned ? '' : 'grayscale opacity-50'
                }`}>
                  {badge.icon}
                </div>
                
                {/* Badge Status */}
                <div className="mt-2">
                  {badge.earned ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Obtenu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full">
                      <Lock className="w-3 h-3" />
                      Verrouillé
                    </span>
                  )}
                </div>

                {/* Source Badge */}
                {userIsAdmin && showAdminPanel && (
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      badge.isDefault ? 'bg-orange-100 text-orange-800' : 
                      badge.isFirebase ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {badge.isDefault ? 'Défaut' : badge.isFirebase ? 'Personnalisé' : 'Firebase'}
                    </span>
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
                  
                  {/* Bouton de suppression - différent pour badges par défaut */}
                  {badge.isDefault ? (
                    <button
                      onClick={() => handleDeleteDefaultBadge(badge.id)}
                      className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      title="Supprimer définitivement ce badge par défaut de tous les utilisateurs"
                    >
                      <XOctagon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Message si aucun badge */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun badge trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}

        {/* 🎨 MODAL CRÉATION BADGE */}
        <AnimatePresence>
          {showCreateBadgeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer un Badge</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={badgeForm.description}
                      onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icône (Emoji)</label>
                    <input
                      type="text"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={badgeForm.category}
                        onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rareté</label>
                      <select
                        value={badgeForm.rarity}
                        onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {rarities.slice(1).map(rarity => (
                          <option key={rarity} value={rarity}>{rarity}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Récompense XP</label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateBadge}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Créer
                  </button>
                  <button
                    onClick={() => setShowCreateBadgeModal(false)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎨 MODAL ÉDITION BADGE */}
        <AnimatePresence>
          {showEditBadgeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Éditer le Badge</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={badgeForm.description}
                      onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icône (Emoji)</label>
                    <input
                      type="text"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm({...badgeForm, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={badgeForm.category}
                        onChange={(e) => setBadgeForm({...badgeForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rareté</label>
                      <select
                        value={badgeForm.rarity}
                        onChange={(e) => setBadgeForm({...badgeForm, rarity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {rarities.slice(1).map(rarity => (
                          <option key={rarity} value={rarity}>{rarity}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Récompense XP</label>
                    <input
                      type="number"
                      value={badgeForm.xpReward}
                      onChange={(e) => setBadgeForm({...badgeForm, xpReward: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleEditBadge}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setShowEditBadgeModal(false);
                      setSelectedBadge(null);
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎨 MODAL ATTRIBUTION BADGES */}
        <AnimatePresence>
          {showAssignBadgeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Attribuer un Badge</h2>
                
                {!selectedBadge ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sélectionner un Badge</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                      {allBadges.map((badge) => (
                        <div
                          key={badge.id}
                          onClick={() => setSelectedBadge(badge)}
                          className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <div className="text-2xl">{badge.icon}</div>
                          <div>
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-sm text-gray-600">{badge.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{selectedBadge.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold">{selectedBadge.name}</h3>
                          <p className="text-gray-600">{selectedBadge.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBadge(null)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Changer de badge
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Sélectionner les Utilisateurs</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {allUsers.map((user) => (
                        <label key={user.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <p className="font-semibold">{user.displayName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">{user.badges.length} badges</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  {selectedBadge && selectedUsers.length > 0 && (
                    <button
                      onClick={handleAssignBadge}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Attribuer à {selectedUsers.length} utilisateur(s)
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAssignBadgeModal(false);
                      setSelectedBadge(null);
                      setSelectedUsers([]);
                    }}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Fermer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BadgesPage;
