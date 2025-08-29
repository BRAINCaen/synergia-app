// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES AVEC GESTION ADMIN COMPLÈTE
// SUPPRESSION RÉCOMPENSES PAR DÉFAUT INTÉGRÉE + FIREBASE INTÉGRÉ
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔄 IMPORTS AJOUTÉS POUR LA CONVERSION RÉCOMPENSE→BADGE
import { Trophy } from 'lucide-react';

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
    stock: -1,
    requirements: {}
  });

  // 🎁 CATALOGUE DES RÉCOMPENSES PAR DÉFAUT
  const REWARDS_CATALOG = {
    boost_xp: {
      id: 'boost_xp',
      name: 'Boost XP',
      description: 'Multiplie par 2 vos prochains gains XP pendant 1 heure',
      icon: '⚡',
      type: 'virtual',
      category: 'Mini-plaisirs',
      xpCost: 50,
      isAvailable: true,
      stock: -1,
      isDefault: true
    },
    premiere_tache: {
      id: 'premiere_tache',
      name: 'Première Tâche',
      description: 'Complétez votre première tâche',
      icon: '🎯',
      type: 'virtual', 
      category: 'Mini-plaisirs',
      xpCost: 0,
      isAvailable: true,
      stock: -1,
      isDefault: true
    },
    badge_special: {
      id: 'badge_special',
      name: 'Badge Spécial',
      description: 'Obtenez un badge spécial unique',
      icon: '🏆',
      type: 'virtual',
      category: 'Collection',
      xpCost: 100,
      isAvailable: true,
      stock: -1,
      isDefault: true
    },
    pause_cafe_premium: {
      id: 'pause_cafe_premium',
      name: 'Pause Café Premium',
      description: 'Une pause café de luxe avec viennoiseries',
      icon: '☕',
      type: 'physical',
      category: 'Petits avantages',
      xpCost: 200,
      isAvailable: true,
      stock: 5,
      isDefault: true
    },
    formation_gratuite: {
      id: 'formation_gratuite',
      name: 'Formation Gratuite',
      description: 'Accès à une formation en ligne de votre choix',
      icon: '📚',
      type: 'virtual',
      category: 'Plaisirs utiles',
      xpCost: 500,
      isAvailable: true,
      stock: -1,
      isDefault: true
    },
    place_parking_vip: {
      id: 'place_parking_vip',
      name: 'Place Parking VIP',
      description: 'Réservation d\'une place de parking prioritaire pour 1 semaine',
      icon: '🚗',
      type: 'physical',
      category: 'Premium',
      xpCost: 800,
      isAvailable: true,
      stock: 2,
      isDefault: true
    }
  };

  // 📋 STATISTIQUES DES RÉCOMPENSES
  const rewardStats = useMemo(() => {
    const userXp = userProfile?.totalXp || 0;
    return {
      totalRewards: userRewards.length,
      rewardsAvailable: allRewards.filter(r => r.isAvailable).length,
      userXp: userXp,
      canAfford: allRewards.filter(r => userXp >= (r.xpCost || 0) && r.isAvailable).length
    };
  }, [userRewards, allRewards, userProfile]);

  // 🎨 CATÉGORIES DISPONIBLES
  const categories = [
    'all', 'Mini-plaisirs', 'Petits avantages', 'Plaisirs utiles', 
    'Plaisirs food & cadeaux', 'Loisirs & sorties', 'Premium', 'Collection'
  ];

  // 🏷️ TYPES DISPONIBLES
  const types = ['all', 'virtual', 'physical'];

  /**
   * 🔥 CHARGEMENT INITIAL
   */
  useEffect(() => {
    loadUserProfile();
    if (userIsAdmin) {
      loadAllRewards();
    }
  }, [user, userIsAdmin]);

  /**
   * 📊 CHARGEMENT DU PROFIL UTILISATEUR
   */
  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserProfile(userData);
        setUserRewards(userData.rewards || []);
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CHARGEMENT DE TOUTES LES RÉCOMPENSES (ADMIN) - FIREBASE UNIQUEMENT
   */
  const loadAllRewards = async () => {
    try {
      console.log('📊 Chargement de TOUTES les récompenses depuis Firebase...');
      
      // 1️⃣ CHARGER LES RÉCOMPENSES FIREBASE
      const rewardsQuery = query(collection(db, 'rewards'), orderBy('createdAt', 'desc'));
      const rewardsSnapshot = await getDocs(rewardsQuery);
      
      const firebaseRewards = [];
      rewardsSnapshot.forEach((doc) => {
        const rewardData = doc.data();
        firebaseRewards.push({ 
          id: doc.id, 
          ...rewardData,
          isFirebase: true,
          source: 'firebase'
        });
      });

      // 2️⃣ AJOUTER LES RÉCOMPENSES PAR DÉFAUT (celles qui ne sont pas supprimées)
      const suppressedRewardsQuery = query(collection(db, 'reward_suppressions'));
      const suppressedSnapshot = await getDocs(suppressedRewardsQuery);
      
      const suppressedRewardIds = [];
      suppressedSnapshot.forEach((doc) => {
        suppressedRewardIds.push(doc.id);
      });

      const defaultRewards = Object.values(REWARDS_CATALOG)
        .filter(reward => !suppressedRewardIds.includes(reward.id))
        .map(reward => ({
          ...reward,
          isDefault: true,
          source: 'default'
        }));

      // 3️⃣ COMBINER TOUTES LES RÉCOMPENSES
      const allRewardsArray = [...firebaseRewards, ...defaultRewards];
      
      setAllRewards(allRewardsArray);
      console.log(`✅ ${allRewardsArray.length} récompenses chargées (${firebaseRewards.length} Firebase + ${defaultRewards.length} par défaut)`);
      
    } catch (error) {
      console.error('❌ Erreur chargement toutes les récompenses:', error);
      // Fallback sur les récompenses par défaut uniquement
      setAllRewards(Object.values(REWARDS_CATALOG).map(reward => ({
        ...reward,
        isDefault: true,
        source: 'default'
      })));
    }
  };

  /**
   * 🎨 CRÉATION D'UNE NOUVELLE RÉCOMPENSE
   */
  const handleCreateReward = async () => {
    if (!rewardForm.name.trim()) {
      showNotification('Le nom de la récompense est requis', 'error');
      return;
    }

    try {
      console.log('🎨 Création récompense:', rewardForm);
      
      const rewardData = {
        name: rewardForm.name,
        description: rewardForm.description,
        type: rewardForm.type,
        category: rewardForm.category,
        xpCost: parseInt(rewardForm.xpCost) || 100,
        icon: rewardForm.icon,
        isAvailable: rewardForm.isAvailable !== false,
        stock: parseInt(rewardForm.stock) || -1,
        requirements: rewardForm.requirements || {},
        timesRedeemed: 0,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        isCustom: true
      };

      const docRef = await addDoc(collection(db, 'rewards'), rewardData);
      console.log('✅ Récompense créée avec ID:', docRef.id);

      showNotification('Récompense créée avec succès !', 'success');
      setShowCreateRewardModal(false);
      resetRewardForm();
      
      await loadAllRewards();
    } catch (error) {
      console.error('❌ Erreur création récompense:', error);
      showNotification('Erreur lors de la création: ' + error.message, 'error');
    }
  };

  const handleEditReward = async () => {
    if (!selectedReward?.id) return;
    
    try {
      // 🚨 CORRECTION : Vérifier si c'est une récompense par défaut ou Firebase
      if (selectedReward.isDefault) {
        // Pour les récompenses par défaut, on ne peut que les créer dans Firebase
        console.log('🎨 Création récompense par défaut dans Firebase...');
        
        const rewardData = {
          name: rewardForm.name,
          description: rewardForm.description,
          type: rewardForm.type,
          category: rewardForm.category,
          xpCost: parseInt(rewardForm.xpCost) || 100,
          icon: rewardForm.icon,
          isAvailable: rewardForm.isAvailable !== false,
          stock: parseInt(rewardForm.stock) || -1,
          requirements: rewardForm.requirements || {},
          timesRedeemed: 0,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          isCustom: true,
          basedOnDefault: selectedReward.id
        };

        await addDoc(collection(db, 'rewards'), rewardData);
        showNotification('Récompense créée dans Firebase avec succès !', 'success');
      } else {
        // Pour les récompenses Firebase, on peut les modifier
        console.log('✏️ Modification récompense Firebase:', selectedReward.id);
        
        await updateDoc(doc(db, 'rewards', selectedReward.id), {
          name: rewardForm.name,
          description: rewardForm.description,
          type: rewardForm.type,
          category: rewardForm.category,
          xpCost: parseInt(rewardForm.xpCost) || 100,
          icon: rewardForm.icon,
          isAvailable: rewardForm.isAvailable !== false,
          stock: parseInt(rewardForm.stock) || -1,
          requirements: rewardForm.requirements || {},
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
        
        showNotification('Récompense modifiée avec succès !', 'success');
      }
      
      setShowEditRewardModal(false);
      setSelectedReward(null);
      await loadAllRewards();
      
    } catch (error) {
      console.error('❌ Erreur modification récompense:', error);
      showNotification(`Erreur lors de la modification: ${error.message}`, 'error');
    }
  };

  /**
   * 🗑️ SUPPRESSION RÉCOMPENSE NORMALE (FIREBASE)
   */
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
   * 🗑️ SUPPRESSION DÉFINITIVE D'UNE RÉCOMPENSE PAR DÉFAUT
   * Cette fonction supprime une récompense des définitions par défaut ET de tous les utilisateurs
   */
  const handleDeleteDefaultReward = async (rewardId) => {
    if (!confirm(`⚠️ ATTENTION ! Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT la récompense par défaut "${rewardId}" ?\n\nCela va :\n- La supprimer de TOUS les utilisateurs qui la possèdent\n- Rendre cette suppression PERMANENTE\n\nCette action est IRRÉVERSIBLE !`)) {
      return;
    }
    
    try {
      console.log(`🗑️ Suppression définitive de la récompense par défaut: ${rewardId}`);
      
      const batch = writeBatch(db);
      let removedFromUsers = 0;
      
      // 1️⃣ SUPPRIMER LA RÉCOMPENSE DE TOUS LES UTILISATEURS
      console.log('🔍 Recherche des utilisateurs ayant cette récompense...');
      
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const currentRewards = userData.rewards || [];
        
        // Vérifier si l'utilisateur a cette récompense
        const hasReward = currentRewards.some(reward => 
          reward.id === rewardId || reward.rewardId === rewardId
        );
        
        if (hasReward) {
          // Filtrer la récompense à supprimer
          const updatedRewards = currentRewards.filter(r => 
            r.id !== rewardId && r.rewardId !== rewardId
          );
          
          // Ajouter à la batch
          batch.update(userDoc.ref, {
            rewards: updatedRewards,
            updatedAt: serverTimestamp()
          });
          
          removedFromUsers++;
        }
      });
      
      // 2️⃣ SUPPRIMER LA RÉCOMPENSE DE LA COLLECTION REWARDS FIRESTORE (si elle existe)
      try {
        const rewardRef = doc(db, 'rewards', rewardId);
        const rewardDoc = await getDoc(rewardRef);
        
        if (rewardDoc.exists()) {
          batch.delete(rewardRef);
          console.log(`🗑️ Récompense ${rewardId} marquée pour suppression de Firestore`);
        }
      } catch (error) {
        console.warn('⚠️ Pas de récompense à supprimer dans Firestore:', error.message);
      }
      
      // 3️⃣ ENREGISTRER UNE SUPPRESSION DÉFINITIVE
      const suppressionRecord = {
        rewardId: rewardId,
        suppressedAt: serverTimestamp(),
        suppressedBy: user.uid,
        reason: 'Suppression récompense par défaut depuis RewardsPage',
        usersAffected: removedFromUsers,
        permanent: true
      };
      
      batch.set(doc(db, 'reward_suppressions', rewardId), suppressionRecord);
      
      // 4️⃣ EXÉCUTER TOUTES LES MODIFICATIONS
      await batch.commit();
      
      // 5️⃣ METTRE À JOUR LES DÉFINITIONS EN MÉMOIRE
      if (REWARDS_CATALOG[rewardId]) {
        delete REWARDS_CATALOG[rewardId];
        console.log(`🔄 Récompense ${rewardId} supprimée des définitions en mémoire`);
      }
      
      console.log(`✅ Récompense ${rewardId} supprimée définitivement`);
      console.log(`👥 ${removedFromUsers} utilisateurs affectés`);
      
      showNotification(`Récompense "${rewardId}" supprimée définitivement de ${removedFromUsers} utilisateur(s) !`, 'success');
      
      // Recharger les données
      await loadAllRewards();
      await loadUserProfile();
      
    } catch (error) {
      console.error('❌ Erreur suppression récompense par défaut:', error);
      showNotification(`Erreur lors de la suppression: ${error.message}`, 'error');
    }
  };

  /**
   * 🔄 CONVERTIR UNE RÉCOMPENSE EN BADGE
   */
  const convertRewardToBadge = async (reward) => {
    if (!confirm(`Voulez-vous créer un badge basé sur la récompense "${reward.name}" ?`)) {
      return;
    }
    
    try {
      console.log('🔄 Conversion récompense → badge:', reward);
      
      // Déterminer la rareté selon le coût XP
      const determineRarityFromCost = (xpCost) => {
        if (xpCost >= 5000) return 'Légendaire';
        if (xpCost >= 1000) return 'Épique';
        if (xpCost >= 500) return 'Rare';
        if (xpCost >= 100) return 'Peu Commun';
        return 'Commun';
      };
      
      const badge = {
        name: `Badge ${reward.name}`,
        description: `Obtenu en réclamant la récompense "${reward.name}"`,
        icon: reward.icon || '🏆',
        category: 'Récompenses',
        rarity: determineRarityFromCost(reward.xpCost || 0),
        xpReward: Math.floor((reward.xpCost || 0) * 0.1), // 10% du coût en XP de récompense
        requirements: {
          type: 'reward_claim',
          rewardId: reward.id
        },
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        isCustom: true,
        sourceType: 'reward_conversion',
        sourceRewardId: reward.id
      };
      
      // Créer le badge dans Firebase
      const docRef = await addDoc(collection(db, 'badges'), badge);
      console.log('✅ Badge créé avec ID:', docRef.id);
      
      showNotification(`Badge "${badge.name}" créé avec succès ! Vous pouvez le voir dans la page Badges.`, 'success');
      
    } catch (error) {
      console.error('❌ Erreur conversion récompense → badge:', error);
      showNotification(`Erreur lors de la conversion: ${error.message}`, 'error');
    }
  };

  /**
   * 🎁 ATTRIBUER AUTOMATIQUEMENT UN BADGE QUAND UNE RÉCOMPENSE EST RÉCLAMÉE
   */
  const awardBadgeOnRewardClaim = async (userId, rewardId, rewardName) => {
    try {
      console.log('🎁→🏆 Attribution badge automatique pour récompense réclamée');
      
      // Créer un badge spécial pour cette récompense
      const collectorBadge = {
        id: `reward_${rewardId}_${Date.now()}`,
        name: `Collectionneur: ${rewardName}`,
        description: `Badge obtenu en réclamant la récompense "${rewardName}"`,
        icon: '🎁',
        category: 'Collection',
        rarity: 'Commun',
        xpReward: 25,
        earnedAt: new Date(),
        sourceType: 'reward_claim',
        sourceRewardId: rewardId,
        automaticallyAwarded: true
      };
      
      // Ajouter le badge à l'utilisateur
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentBadges = userData.badges || [];
        
        // Éviter les doublons
        const hasSameBadge = currentBadges.some(b => 
          b.sourceRewardId === rewardId && b.sourceType === 'reward_claim'
        );
        
        if (!hasSameBadge) {
          await updateDoc(userRef, {
            badges: [...currentBadges, collectorBadge],
            totalXp: (userData.totalXp || 0) + collectorBadge.xpReward,
            updatedAt: new Date()
          });
          
          console.log(`✅ Badge "${collectorBadge.name}" attribué automatiquement`);
          return collectorBadge;
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge automatique:', error);
    }
    
    return null;
  };
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
      
      const newReward = {
        ...reward,
        redeemedAt: new Date(),
        status: 'redeemed'
      };
      
      await updateDoc(userRef, {
        totalXp: userXp - reward.xpCost,
        rewards: [...currentRewards, newReward]
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
    let rewards = [];
    
    if (userIsAdmin && showAdminPanel) {
      // Mode admin : afficher toutes les récompenses (Firebase + par défaut non supprimées)
      rewards = allRewards;
    } else {
      // Mode utilisateur : afficher récompenses avec disponibilité
      rewards = Object.values(REWARDS_CATALOG);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      rewards = rewards.filter(reward => 
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par type
    if (filterType !== 'all') {
      rewards = rewards.filter(reward => reward.type === filterType);
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      rewards = rewards.filter(reward => reward.category === filterCategory);
    }

    return rewards;
  }, [allRewards, searchTerm, filterType, filterCategory, showAdminPanel, userIsAdmin]);

  /**
   * 🎨 COULEUR PAR TYPE
   */
  const getTypeColor = (type) => {
    const colors = {
      'virtual': 'from-blue-500 to-blue-600',
      'physical': 'from-green-500 to-green-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des récompenses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 🎁 EN-TÊTE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Gift className="w-10 h-10 text-purple-600" />
            Récompenses
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Débloquez et collectionnez vos récompenses ({rewardStats.totalRewards} obtenues)
          </p>
        </div>

        {/* 📊 STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-purple-600 font-semibold">Récompenses Obtenues</p>
                <p className="text-2xl font-bold text-purple-800">{rewardStats.totalRewards}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-blue-600 font-semibold">Disponibles</p>
                <p className="text-2xl font-bold text-blue-800">{rewardStats.rewardsAvailable}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-yellow-600 font-semibold">Votre XP</p>
                <p className="text-2xl font-bold text-yellow-800">{rewardStats.userXp}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-green-600 font-semibold">Accessibles</p>
                <p className="text-2xl font-bold text-green-800">{rewardStats.canAfford}</p>
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
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              {showAdminPanel ? 'Fermer Panel Admin' : 'Ouvrir Panel Admin'}
            </button>
          </div>
        )}

        {/* 🛡️ PANEL ADMIN */}
        {userIsAdmin && showAdminPanel && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              Panel Administration Récompenses
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setShowCreateRewardModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer Récompense
              </button>
              
              <button
                onClick={() => {
                  loadAllRewards();
                  loadUserProfile();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>

            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Système Récompenses ↔ Badges</h3>
              </div>
              <div className="text-green-700 text-sm space-y-2">
                <p>🎁 <strong>Récompenses</strong> = Objets à acheter avec XP • 🏆 <strong>Badges</strong> = Accomplissements automatiques</p>
                <p>• <strong>Bouton Trophée</strong> = Convertir récompense en badge permanent</p>
                <p>• <strong>Réclamer récompense</strong> = Obtient automatiquement un badge "Collectionneur"</p>
              </div>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Gestion Récompenses par Défaut</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Vous pouvez maintenant <strong>supprimer définitivement</strong> les récompenses par défaut ! 
                Cliquez sur l'icône <XOctagon className="w-4 h-4 inline text-red-600" /> rouge à côté d'une récompense par défaut.
                <br /><strong>⚠️ ATTENTION :</strong> Cette action supprime la récompense de tous les utilisateurs.
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
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Tous les types' : 
                 type === 'virtual' ? 'Virtuel' : 'Physique'}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Toutes les catégories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <motion.div
              key={reward.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                reward.isAvailable ? 'border-purple-200 hover:border-purple-400' : 'border-gray-200 opacity-60'
              }`}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Reward Icon */}
              <div className="text-center mb-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl bg-gradient-to-br ${getTypeColor(reward.type)}`}>
                  {reward.icon}
                </div>
                
                {/* Reward Status */}
                <div className="mt-2">
                  {reward.isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      <XCircle className="w-3 h-3" />
                      Indisponible
                    </span>
                  )}
                </div>

                {/* Source Récompense */}
                {userIsAdmin && showAdminPanel && (
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reward.isDefault ? 'bg-orange-100 text-orange-800' : 
                      reward.isFirebase ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reward.isDefault ? 'Défaut' : reward.isFirebase ? 'Personnalisé' : 'Firebase'}
                    </span>
                  </div>
                )}
              </div>

              {/* Reward Info */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">{reward.category}</span>
                  <span className={`px-2 py-1 rounded font-semibold ${
                    reward.type === 'virtual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {reward.type === 'virtual' ? 'Virtuel' : 'Physique'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1 text-purple-600 mb-4">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">{reward.xpCost} XP</span>
                </div>

                {/* Actions Utilisateur */}
                {!userIsAdmin || !showAdminPanel ? (
                  <button
                    onClick={() => handleRequestReward(reward)}
                    disabled={!reward.isAvailable || (userProfile?.totalXp || 0) < reward.xpCost}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      reward.isAvailable && (userProfile?.totalXp || 0) >= reward.xpCost
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {(userProfile?.totalXp || 0) < reward.xpCost ? 'XP insuffisants' : 'Demander'}
                  </button>
                ) : (
                  /* Actions Admin */
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedReward(reward);
                        setRewardForm({
                          name: reward.name || '',
                          description: reward.description || '',
                          type: reward.type || 'virtual',
                          category: reward.category || 'Mini-plaisirs',
                          xpCost: reward.xpCost || 100,
                          icon: reward.icon || '🎁',
                          isAvailable: reward.isAvailable !== false,
                          stock: reward.stock || -1,
                          requirements: reward.requirements || {}
                        });
                        setShowEditRewardModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      title={reward.isDefault ? "Créer une copie personnalisée" : "Modifier cette récompense"}
                    >
                      <Edit className="w-4 h-4" />
                      {reward.isDefault ? 'Copier' : 'Éditer'}
                    </button>
                    
                    {/* 🔄 NOUVEAU : Bouton de conversion vers badge */}
                    <button
                      onClick={() => convertRewardToBadge(reward)}
                      className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                      title="Convertir cette récompense en badge"
                    >
                      <Trophy className="w-4 h-4" />
                    </button>
                    
                    {/* Bouton de suppression - différent pour récompenses par défaut */}
                    {reward.isDefault ? (
                      <button
                        onClick={() => handleDeleteDefaultReward(reward.id)}
                        className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title="Supprimer définitivement cette récompense par défaut de tous les utilisateurs"
                      >
                        <XOctagon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title="Supprimer cette récompense personnalisée"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucune récompense */}
        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune récompense trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}

        {/* 🎨 MODAL CRÉATION RÉCOMPENSE */}
        <AnimatePresence>
          {showCreateRewardModal && (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une Récompense</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icône (Emoji)</label>
                    <input
                      type="text"
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="virtual">Virtuel</option>
                        <option value="physical">Physique</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={rewardForm.category}
                        onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Coût XP</label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock (-1 = illimité)</label>
                      <input
                        type="number"
                        value={rewardForm.stock}
                        onChange={(e) => setRewardForm({...rewardForm, stock: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateReward}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Créer
                  </button>
                  <button
                    onClick={() => setShowCreateRewardModal(false)}
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

        {/* 🎨 MODAL ÉDITION RÉCOMPENSE */}
        <AnimatePresence>
          {showEditRewardModal && (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedReward?.isDefault ? 'Créer une Copie Personnalisée' : 'Éditer la Récompense'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icône (Emoji)</label>
                    <input
                      type="text"
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm({...rewardForm, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({...rewardForm, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="virtual">Virtuel</option>
                        <option value="physical">Physique</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={rewardForm.category}
                        onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Coût XP</label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({...rewardForm, xpCost: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock (-1 = illimité)</label>
                      <input
                        type="number"
                        value={rewardForm.stock}
                        onChange={(e) => setRewardForm({...rewardForm, stock: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={rewardForm.isAvailable}
                      onChange={(e) => setRewardForm({...rewardForm, isAvailable: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isAvailable" className="text-sm text-gray-700">Disponible</label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleEditReward}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {selectedReward?.isDefault ? 'Créer Copie' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditRewardModal(false);
                      setSelectedReward(null);
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
      </div>
    </Layout>
  );
};

export default RewardsPage;
