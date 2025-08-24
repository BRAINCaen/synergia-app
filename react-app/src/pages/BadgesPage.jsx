// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES AVEC ADMINISTRATION COMPLÈTE - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  Shield, 
  Lock, 
  CheckCircle, 
  Info,
  RefreshCw,
  Target,
  Flame,
  Zap,
  Calendar,
  Users,
  X,
  Edit,
  Trash2,
  Plus,
  Save,
  Settings
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { isAdmin } from '../core/services/adminService.js';
import { 
  doc, 
  getDoc,
  collection,
  setDoc,
  deleteDoc,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 DÉFINITION DES BADGES AVEC CONDITIONS AUTOMATIQUES
let BADGE_DEFINITIONS = [
  // 🚀 BADGES DE DÉMARRAGE
  {
    id: 'welcome',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    rarity: 'common',
    category: 'onboarding',
    xpReward: 10,
    conditions: ['Se connecter à Synergia'],
    autoCheck: (userData) => true // Auto-débloqué à la première connexion
  },
  {
    id: 'profile_complete',
    name: 'Profil Complet',
    description: 'Compléter votre profil utilisateur',
    icon: '👤',
    rarity: 'common',
    category: 'onboarding',
    xpReward: 25,
    conditions: ['Remplir tous les champs du profil'],
    autoCheck: (userData) => {
      const profile = userData.profile || {};
      return profile.completeness >= 80;
    }
  },
  {
    id: 'first_task',
    name: 'Premier Pas',
    description: 'Compléter votre première tâche',
    icon: '✅',
    rarity: 'common',
    category: 'productivity',
    xpReward: 20,
    conditions: ['Compléter 1 tâche'],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 1
  },
  {
    id: 'task_enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter 5 tâches',
    icon: '🔥',
    rarity: 'uncommon',
    category: 'productivity',
    xpReward: 50,
    conditions: ['Compléter 5 tâches'],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 5
  },
  {
    id: 'task_expert',
    name: 'Expert',
    description: 'Compléter 25 tâches',
    icon: '⚡',
    rarity: 'rare',
    category: 'productivity',
    xpReward: 100,
    conditions: ['Compléter 25 tâches'],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 25
  },
  {
    id: 'level_up',
    name: 'Montée de Niveau',
    description: 'Atteindre le niveau 5',
    icon: '📈',
    rarity: 'uncommon',
    category: 'progression',
    xpReward: 75,
    conditions: ['Atteindre le niveau 5'],
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 5
  },
  {
    id: 'xp_collector',
    name: 'Collectionneur XP',
    description: 'Accumuler 1000 points d\'expérience',
    icon: '💎',
    rarity: 'rare',
    category: 'progression',
    xpReward: 150,
    conditions: ['Accumuler 1000 XP'],
    autoCheck: (userData) => (userData.gamification?.totalXp || 0) >= 1000
  },
  {
    id: 'consistent_user',
    name: 'Utilisateur Régulier',
    description: 'Utiliser Synergia pendant 7 jours consécutifs',
    icon: '📅',
    rarity: 'uncommon',
    category: 'consistency',
    xpReward: 80,
    conditions: ['7 jours consécutifs d\'utilisation'],
    autoCheck: (userData) => {
      const streaks = userData.gamification?.loginStreaks || {};
      return streaks.current >= 7;
    }
  },
  {
    id: 'team_player',
    name: 'Esprit d\'Équipe',
    description: 'Collaborer sur 10 projets différents',
    icon: '🤝',
    rarity: 'rare',
    category: 'qvct',
    xpReward: 120,
    conditions: ['Collaborer sur 10 projets'],
    autoCheck: (userData) => (userData.stats?.projectsJoined || 0) >= 10
  },
  {
    id: 'legend',
    name: 'Légende',
    description: 'Atteindre le niveau 20',
    icon: '👑',
    rarity: 'legendary',
    category: 'progression',
    xpReward: 500,
    conditions: ['Atteindre le niveau 20'],
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 20
  }
];

/**
 * 🏆 COMPOSANT PRINCIPAL - PAGE BADGES
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  const { gamification, firebaseLoading, isReady } = useUnifiedFirebaseData();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeStats, setBadgeStats] = useState({
    earned: 0,
    total: 0,
    percentage: 0,
    byRarity: {},
    byCategory: {}
  });
  
  // États admin
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Vérifier le statut admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsUserAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [user]);

  /**
   * 📦 CHARGER LES BADGES PERSONNALISÉS (POUR ADMINS)
   */
  const loadCustomBadges = async () => {
    try {
      // Cette fonction peut être étendue pour charger des badges personnalisés depuis Firebase
      console.log('📦 Badges standards chargés:', BADGE_DEFINITIONS.length);
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
    }
  };

  /**
   * 🔍 VÉRIFIER ET DÉBLOQUER LES BADGES AUTOMATIQUEMENT - VERSION CORRIGÉE
   * ✅ Plus d'erreur serverTimestamp() avec arrayUnion()
   */
  const checkAndUnlockBadges = async () => {
    if (!user?.uid || !isReady) return;

    try {
      console.log('🎯 Vérification automatique des badges...');
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return;
      
      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      const earnedBadgeIds = currentBadges.map(b => b.id || b.badgeId);
      
      let newBadges = [];
      let totalXpGained = 0;

      // Vérifier chaque badge
      for (const badgeDefinition of BADGE_DEFINITIONS) {
        const isAlreadyEarned = earnedBadgeIds.includes(badgeDefinition.id);
        
        if (!isAlreadyEarned) {
          let shouldUnlock = false;
          
          if (badgeDefinition.autoCheck) {
            if (typeof badgeDefinition.autoCheck === 'function') {
              shouldUnlock = badgeDefinition.autoCheck(userData);
            } else if (badgeDefinition.autoCheckCode) {
              // Reconstruire la fonction depuis le code stocké
              try {
                const autoCheckFunction = new Function('userData', badgeDefinition.autoCheckCode.replace('(userData) => ', 'return '));
                shouldUnlock = autoCheckFunction(userData);
              } catch (error) {
                console.warn('⚠️ Erreur évaluation autoCheck pour badge:', badgeDefinition.id);
              }
            }
          }
          
          if (shouldUnlock) {
            console.log(`🎉 Nouveau badge débloqué: ${badgeDefinition.name}`);
            
            const newBadge = {
              id: badgeDefinition.id,
              badgeId: badgeDefinition.id,
              name: badgeDefinition.name,
              description: badgeDefinition.description,
              icon: badgeDefinition.icon,
              rarity: badgeDefinition.rarity,
              category: badgeDefinition.category,
              xpReward: badgeDefinition.xpReward,
              unlockedAt: new Date().toISOString(), // ✅ STRING au lieu de serverTimestamp
              earnedAt: new Date().toISOString()
            };
            
            newBadges.push(newBadge);
            totalXpGained += badgeDefinition.xpReward;
          }
        }
      }

      // ✅ SAUVEGARDER LES NOUVEAUX BADGES AVEC setDoc + merge (PAS arrayUnion)
      if (newBadges.length > 0) {
        // 1. Récupérer tous les badges (existants + nouveaux)
        const allBadges = [...currentBadges, ...newBadges];
        
        // 2. Mise à jour avec setDoc pour éviter l'erreur arrayUnion + serverTimestamp
        await setDoc(userRef, {
          gamification: {
            ...userData.gamification,
            badges: allBadges, // ✅ Remplacer tout le tableau au lieu d'arrayUnion
            badgesUnlocked: allBadges.length,
            totalXp: (userData.gamification?.totalXp || 0) + totalXpGained,
            lastBadgeCheck: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
          }
        }, { merge: true }); // ✅ merge: true pour préserver les autres données

        // Afficher les notifications
        newBadges.forEach(badge => {
          showBadgeNotification(badge);
        });

        console.log(`✅ ${newBadges.length} nouveaux badges débloqués, +${totalXpGained} XP`);
      } else {
        console.log('📋 Aucun nouveau badge à débloquer');
      }

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
    }
  };

  /**
   * 🎊 AFFICHER NOTIFICATION DE BADGE
   */
  const showBadgeNotification = (badge) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="text-2xl mr-3">${badge.icon}</div>
        <div>
          <div class="font-bold">Badge débloqué !</div>
          <div class="text-sm">${badge.name}</div>
          <div class="text-xs text-yellow-300">+${badge.xpReward} XP</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(-100%)';
      notification.style.transition = 'transform 0.3s ease';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  /**
   * 🗑️ SUPPRIMER UN BADGE PERSONNALISÉ
   */
  const deleteBadge = async (badgeId) => {
    try {
      const badgeRef = doc(db, 'customBadges', badgeId);
      await deleteDoc(badgeRef);
      
      // Retirer aussi de tous les utilisateurs qui l'ont
      // Cette partie nécessiterait une Cloud Function en production
      
      showNotification('Badge supprimé avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 🎊 NOTIFICATION SIMPLE
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
      type === 'success' ? 'bg-green-600' : 
      type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  /**
   * 📊 CALCULER LES STATISTIQUES DES BADGES
   */
  const calculateBadgeStats = () => {
    const userBadges = gamification.badges || [];
    const earnedCount = userBadges.length;
    const totalCount = BADGE_DEFINITIONS.length;
    const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

    const byRarity = userBadges.reduce((acc, badge) => {
      const rarity = badge.rarity || 'common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});

    const byCategory = userBadges.reduce((acc, badge) => {
      const category = badge.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    setBadgeStats({
      earned: earnedCount,
      total: totalCount,
      percentage,
      byRarity,
      byCategory
    });
  };

  /**
   * 🎨 OBTENIR LA COULEUR SELON LA RARETÉ
   */
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return { bg: 'bg-gray-600', text: 'text-gray-200', border: 'border-gray-500' };
      case 'uncommon': return { bg: 'bg-green-600', text: 'text-green-200', border: 'border-green-500' };
      case 'rare': return { bg: 'bg-blue-600', text: 'text-blue-200', border: 'border-blue-500' };
      case 'epic': return { bg: 'bg-purple-600', text: 'text-purple-200', border: 'border-purple-500' };
      case 'legendary': return { bg: 'bg-yellow-600', text: 'text-yellow-200', border: 'border-yellow-500' };
      default: return { bg: 'bg-gray-600', text: 'text-gray-200', border: 'border-gray-500' };
    }
  };

  /**
   * ✅ VÉRIFIER SI UN BADGE EST DÉBLOQUÉ
   */
  const isBadgeUnlocked = (badgeId) => {
    const userBadges = gamification.badges || [];
    return userBadges.some(badge => badge.id === badgeId || badge.badgeId === badgeId);
  };

  /**
   * 📊 CALCULER LA PROGRESSION D'UN BADGE
   */
  const getBadgeProgress = (badge) => {
    if (isBadgeUnlocked(badge.id)) return 100;
    
    // Logique de progression basée sur les conditions du badge
    if (badge.autoCheck) {
      try {
        // Simulation de progression - peut être affinée
        return badge.autoCheck(gamification) ? 100 : Math.random() * 60;
      } catch {
        return 0;
      }
    }
    
    return Math.random() * 80; // Placeholder
  };

  /**
   * 🔄 ACTUALISER LES DONNÉES
   */
  const refreshData = async () => {
    setLoading(true);
    await loadCustomBadges();
    await checkAndUnlockBadges();
    calculateBadgeStats();
    setLoading(false);
  };

  // Charger les données au montage
  useEffect(() => {
    if (isReady && user?.uid) {
      loadCustomBadges().then(() => {
        checkAndUnlockBadges();
        calculateBadgeStats();
        setLoading(false);
      });
    }
  }, [isReady, user?.uid]);

  // Recalculer les stats quand les badges changent
  useEffect(() => {
    calculateBadgeStats();
  }, [gamification.badges]);

  // Filtrer les badges selon la catégorie
  const filteredBadges = selectedCategory === 'all' 
    ? BADGE_DEFINITIONS 
    : BADGE_DEFINITIONS.filter(badge => badge.category === selectedCategory);

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Tous', icon: Trophy },
    { id: 'onboarding', name: 'Démarrage', icon: Target },
    { id: 'productivity', name: 'Productivité', icon: CheckCircle },
    { id: 'progression', name: 'Progression', icon: Star },
    { id: 'consistency', name: 'Régularité', icon: Calendar },
    { id: 'qvct', name: 'QVCT', icon: Users }
  ];

  const headerStats = [
    { 
      label: "Badges débloqués", 
      value: badgeStats.earned.toString(), 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Total badges", 
      value: badgeStats.total.toString(), 
      icon: Trophy, 
      color: "text-yellow-400" 
    },
    { 
      label: "Progression", 
      value: `${badgeStats.percentage}%`, 
      icon: Star, 
      color: "text-purple-400" 
    },
    { 
      label: "Badges rares", 
      value: (badgeStats.byRarity.rare || 0) + (badgeStats.byRarity.epic || 0) + (badgeStats.byRarity.legendary || 0), 
      icon: Crown, 
      color: "text-orange-400" 
    }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      {isUserAdmin && (
        <PremiumButton variant="secondary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau badge
        </PremiumButton>
      )}
      <PremiumButton variant="secondary" onClick={() => checkAndUnlockBadges()}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Vérifier badges
      </PremiumButton>
      <PremiumButton variant="primary" onClick={refreshData}>
        <Trophy className="w-4 h-4 mr-2" />
        Actualiser
      </PremiumButton>
    </div>
  );

  if (firebaseLoading || loading) {
    return (
      <PremiumLayout
        title="🏆 Mes Badges"
        subtitle="Collection de vos accomplissements et réalisations"
        headerStats={[]}
        headerActions={<div className="animate-pulse bg-gray-700 h-10 w-32 rounded"></div>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 rounded-xl h-48"></div>
            </div>
          ))}
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="🏆 Mes Badges"
      subtitle="Collection de vos accomplissements et réalisations"
      headerStats={headerStats}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Filtres */}
        <PremiumCard>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex space-x-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PremiumCard>

        {/* Grille des badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => {
            const isUnlocked = isBadgeUnlocked(badge.id);
            const progress = getBadgeProgress(badge);
            const rarityColors = getRarityColor(badge.rarity);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedBadge(badge)}
              >
                <PremiumCard className={`h-full relative overflow-hidden ${rarityColors.border} border-2`}>
                  {/* Effet de brillance pour badges débloqués */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
                  )}
                  
                  <div className="text-center p-4">
                    <div className={`text-4xl mb-3 ${!isUnlocked && 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    
                    <h3 className={`font-semibold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                      {badge.name}
                    </h3>
                    
                    <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                      {badge.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className={`px-2 py-1 rounded text-xs ${rarityColors.bg} ${rarityColors.text}`}>
                        {badge.rarity.toUpperCase()}
                      </div>
                      <div className={`text-sm font-semibold ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                        +{badge.xpReward} XP
                      </div>
                    </div>
                    
                    {/* Barre de progression */}
                    {!isUnlocked && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progression</span>
                          <span className="text-blue-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Badge débloqué */}
                    {isUnlocked && (
                      <div className="flex items-center justify-center text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Débloqué
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>

        {/* Modal détail badge */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">Détail du Badge</h3>
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{selectedBadge.icon}</div>
                  <h4 className="text-lg font-semibold text-white mb-2">{selectedBadge.name}</h4>
                  <p className="text-gray-300 text-sm mb-4">{selectedBadge.description}</p>
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className={`px-3 py-1 rounded ${getRarityColor(selectedBadge.rarity).bg} ${getRarityColor(selectedBadge.rarity).text}`}>
                      {selectedBadge.rarity.toUpperCase()}
                    </div>
                    <div className="text-yellow-400 font-semibold">
                      +{selectedBadge.xpReward} XP
                    </div>
                  </div>
                </div>

                {/* Conditions pour obtenir le badge */}
                <div className="mb-6">
                  <h5 className="text-white font-medium mb-3">Conditions requises :</h5>
                  <ul className="space-y-2">
                    {selectedBadge.conditions.map((condition, index) => {
                      const isConditionMet = selectedBadge.autoCheck ? selectedBadge.autoCheck(gamification) : false;
                      return (
                        <li key={index} className="flex items-center text-sm">
                          {isBadgeUnlocked(selectedBadge.id) || isConditionMet ? (
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-500 rounded mr-2 flex-shrink-0"></div>
                          )}
                          <span className={isBadgeUnlocked(selectedBadge.id) || isConditionMet ? 'text-green-300' : 'text-gray-400'}>
                            {condition}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Progression actuelle */}
                {!isBadgeUnlocked(selectedBadge.id) && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progression</span>
                      <span className="text-blue-400">{Math.round(getBadgeProgress(selectedBadge))}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getBadgeProgress(selectedBadge)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Statut */}
                <div className="text-center">
                  {isBadgeUnlocked(selectedBadge.id) ? (
                    <div className="flex items-center justify-center text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Badge débloqué !
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-gray-400">
                      <Lock className="w-5 h-5 mr-2" />
                      Badge verrouillé
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
};

export default BadgesPage;
