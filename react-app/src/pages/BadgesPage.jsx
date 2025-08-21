// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES AVEC ADMINISTRATION COMPLÈTE POUR ADMINS
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
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  getDoc,
  collection,
  setDoc,
  deleteDoc,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 DÉFINITION DES BADGES AVEC CONDITIONS AUTOMATIQUES
let BADGE_DEFINITIONS = [
  {
    id: 'welcome',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    rarity: 'common',
    xpReward: 10,
    category: 'onboarding',
    conditions: [
      'Se connecter pour la première fois'
    ],
    autoCheck: (userData) => true
  },
  {
    id: 'first_steps',
    name: 'Premiers Pas',
    description: 'Compléter votre profil',
    icon: '🎯',
    rarity: 'common',
    xpReward: 25,
    category: 'onboarding',
    conditions: [
      'Avoir un nom d\'utilisateur',
      'Être connecté à l\'application'
    ],
    autoCheck: (userData) => userData.email && userData.displayName
  },
  {
    id: 'enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter votre première tâche',
    icon: '💎',
    rarity: 'uncommon',
    xpReward: 50,
    category: 'productivity',
    conditions: [
      'Compléter au moins 1 tâche'
    ],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 1
  },
  {
    id: 'task_rookie',
    name: 'Débutant',
    description: 'Compléter 5 tâches',
    icon: '🌱',
    rarity: 'common',
    xpReward: 75,
    category: 'productivity',
    conditions: [
      'Compléter 5 tâches au total'
    ],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 5
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Compléter 25 tâches',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 100,
    category: 'productivity',
    conditions: [
      'Compléter 25 tâches au total',
      'Maintenir un taux de réussite de 80%'
    ],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 25
  },
  {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Compléter 100 tâches',
    icon: '👑',
    rarity: 'epic',
    xpReward: 250,
    category: 'productivity',
    conditions: [
      'Compléter 100 tâches au total',
      'Être dans le top 10% des utilisateurs'
    ],
    autoCheck: (userData) => (userData.gamification?.tasksCompleted || 0) >= 100
  },
  {
    id: 'level_5',
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '🔥',
    rarity: 'uncommon',
    xpReward: 75,
    category: 'progression',
    conditions: [
      'Atteindre le niveau 5',
      'Avoir au moins 400 XP'
    ],
    autoCheck: (userData) => (userData.gamification?.level || 1) >= 5
  },
  {
    id: 'week_warrior',
    name: 'Guerrier Hebdomadaire',
    description: 'Connexion quotidienne pendant 7 jours',
    icon: '🔥',
    rarity: 'rare',
    xpReward: 150,
    category: 'consistency',
    conditions: [
      'Se connecter 7 jours d\'affilée',
      'Compléter au moins 1 action par jour'
    ],
    autoCheck: (userData) => (userData.gamification?.loginStreak || 0) >= 7
  },
  {
    id: 'month_champion',
    name: 'Champion du Mois',
    description: 'Connexion quotidienne pendant 30 jours',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 500,
    category: 'consistency',
    conditions: [
      'Se connecter 30 jours d\'affilée',
      'Maintenir une activité constante'
    ],
    autoCheck: (userData) => (userData.gamification?.loginStreak || 0) >= 30
  }
];

const BadgesPage = () => {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  // États pour l'administration
  const [isEditing, setIsEditing] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // États pour les badges personnalisés
  const [customBadges, setCustomBadges] = useState([]);
  
  const [badgeStats, setBadgeStats] = useState({
    earned: 0,
    total: BADGE_DEFINITIONS.length,
    percentage: 0,
    byRarity: {},
    byCategory: {}
  });
  
  // 🔥 UTILISER LES VRAIES DONNÉES FIREBASE
  const {
    gamification,
    isLoading: firebaseLoading,
    isReady,
    error: firebaseError,
    actions
  } = useUnifiedFirebaseData();

  /**
   * 🛡️ VÉRIFIER LES PERMISSIONS ADMIN
   */
  useEffect(() => {
    if (user) {
      const adminStatus = isAdmin(user);
      setIsUserAdmin(adminStatus);
      console.log('🛡️ Statut admin pour badges:', adminStatus);
    }
  }, [user]);

  /**
   * 📥 CHARGER LES BADGES PERSONNALISÉS DEPUIS FIREBASE
   */
  const loadCustomBadges = async () => {
    try {
      const badgesRef = doc(db, 'system', 'badges');
      const badgesSnap = await getDoc(badgesRef);
      
      if (badgesSnap.exists()) {
        const data = badgesSnap.data();
        const customBadgesList = data.customBadges || [];
        setCustomBadges(customBadgesList);
        
        // Fusionner avec les badges par défaut
        BADGE_DEFINITIONS = [...BADGE_DEFINITIONS.filter(b => !customBadgesList.find(cb => cb.id === b.id)), ...customBadgesList];
        
        console.log('📥 Badges personnalisés chargés:', customBadgesList.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement badges personnalisés:', error);
    }
  };

  /**
   * 💾 SAUVEGARDER UN BADGE PERSONNALISÉ
   */
  const saveBadge = async (badgeData, isNew = false) => {
    if (!isUserAdmin) {
      alert('⚠️ Permissions insuffisantes');
      return;
    }

    try {
      const badgesRef = doc(db, 'system', 'badges');
      
      if (isNew) {
        // Créer un nouvel ID unique
        badgeData.id = `custom_${Date.now()}`;
        badgeData.createdAt = new Date().toISOString();
        badgeData.createdBy = user.uid;
      }
      
      badgeData.updatedAt = new Date().toISOString();
      badgeData.updatedBy = user.uid;

      // Convertir la fonction autoCheck en string pour le stockage
      if (typeof badgeData.autoCheck === 'function') {
        badgeData.autoCheckCode = badgeData.autoCheck.toString();
        delete badgeData.autoCheck;
      }

      const updatedCustomBadges = isNew 
        ? [...customBadges, badgeData]
        : customBadges.map(b => b.id === badgeData.id ? badgeData : b);

      await updateDoc(badgesRef, {
        customBadges: updatedCustomBadges,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: user.uid
      });

      setCustomBadges(updatedCustomBadges);
      
      // Fusionner avec les badges par défaut
      BADGE_DEFINITIONS = [
        ...BADGE_DEFINITIONS.filter(b => b.id !== badgeData.id), 
        badgeData
      ];

      console.log(`✅ Badge ${isNew ? 'créé' : 'modifié'}:`, badgeData.name);
      setIsEditing(false);
      setEditingBadge(null);
      setShowCreateModal(false);
      
      showNotification(`Badge ${isNew ? 'créé' : 'modifié'} avec succès !`, 'success');
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde badge:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  /**
   * 🗑️ SUPPRIMER UN BADGE
   */
  const deleteBadge = async (badgeId) => {
    if (!isUserAdmin) {
      alert('⚠️ Permissions insuffisantes');
      return;
    }

    try {
      const badgesRef = doc(db, 'system', 'badges');
      const updatedCustomBadges = customBadges.filter(b => b.id !== badgeId);

      await updateDoc(badgesRef, {
        customBadges: updatedCustomBadges,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: user.uid
      });

      setCustomBadges(updatedCustomBadges);
      
      // Retirer aussi de BADGE_DEFINITIONS
      BADGE_DEFINITIONS = BADGE_DEFINITIONS.filter(b => b.id !== badgeId);
      
      console.log('🗑️ Badge supprimé:', badgeId);
      setShowDeleteConfirm(null);
      
      showNotification('Badge supprimé avec succès !', 'success');
      
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
   * 🔍 VÉRIFIER ET DÉBLOQUER LES BADGES AUTOMATIQUEMENT
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
              unlockedAt: serverTimestamp(),
              earnedAt: new Date().toISOString()
            };
            
            newBadges.push(newBadge);
            totalXpGained += badgeDefinition.xpReward;
          }
        }
      }

      // Sauvegarder les nouveaux badges
      if (newBadges.length > 0) {
        await updateDoc(userRef, {
          'gamification.badges': arrayUnion(...newBadges),
          'gamification.badgesUnlocked': (userData.gamification?.badgesUnlocked || 0) + newBadges.length,
          'gamification.totalXp': (userData.gamification?.totalXp || 0) + totalXpGained,
          'gamification.lastBadgeCheck': serverTimestamp()
        });

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
   * 🔍 VÉRIFIER SI UN BADGE EST DÉBLOQUÉ
   */
  const isBadgeUnlocked = (badgeId) => {
    const userBadges = gamification.badges || [];
    return userBadges.some(ub => ub.id === badgeId || ub.badgeId === badgeId);
  };

  /**
   * 📈 CALCULER LA PROGRESSION VERS UN BADGE
   */
  const getBadgeProgress = (badge) => {
    if (isBadgeUnlocked(badge.id)) return 100;

    switch (badge.id) {
      case 'task_rookie':
        return Math.min(100, ((gamification.tasksCompleted || 0) / 5) * 100);
      case 'expert':
        return Math.min(100, ((gamification.tasksCompleted || 0) / 25) * 100);
      case 'task_master':
        return Math.min(100, ((gamification.tasksCompleted || 0) / 100) * 100);
      case 'level_5':
        return Math.min(100, ((gamification.level || 1) / 5) * 100);
      case 'week_warrior':
        return Math.min(100, ((gamification.loginStreak || 0) / 7) * 100);
      case 'month_champion':
        return Math.min(100, ((gamification.loginStreak || 0) / 30) * 100);
      default:
        return badge.autoCheck ? (badge.autoCheck(gamification) ? 100 : 0) : 0;
    }
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
    { id: 'consistency', name: 'Régularité', icon: Flame }
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
            <PremiumCard key={i}>
              <div className="animate-pulse">
                <div className="bg-gray-700 h-20 w-20 rounded-full mx-auto mb-4"></div>
                <div className="bg-gray-700 h-6 w-24 rounded mx-auto mb-2"></div>
                <div className="bg-gray-700 h-4 w-32 rounded mx-auto"></div>
              </div>
            </PremiumCard>
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
      {/* Filtres par catégorie */}
      <PremiumCard className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* Grille des badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredBadges.map((badge) => {
          const isUnlocked = isBadgeUnlocked(badge.id);
          const progress = getBadgeProgress(badge);
          const rarityColors = getRarityColor(badge.rarity);
          const isCustomBadge = customBadges.some(cb => cb.id === badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PremiumCard className={`relative ${isUnlocked ? rarityColors.border + ' border-2' : 'border-gray-700'}`}>
                {/* Statut du badge */}
                <div className="absolute top-3 right-3">
                  {isUnlocked ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                {/* Boutons Admin */}
                {isUserAdmin && (
                  <div className="absolute top-3 left-3 flex space-x-1">
                    <button
                      onClick={() => setSelectedBadge(badge)}
                      className="p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <Info className="w-4 h-4 text-gray-300" />
                    </button>
                    {isCustomBadge && (
                      <>
                        <button
                          onClick={() => {
                            setEditingBadge(badge);
                            setIsEditing(true);
                          }}
                          className="p-1 bg-blue-700 rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(badge.id)}
                          className="p-1 bg-red-700 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Bouton Info pour utilisateurs normaux */}
                {!isUserAdmin && (
                  <button
                    onClick={() => setSelectedBadge(badge)}
                    className="absolute top-3 left-3 p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    <Info className="w-4 h-4 text-gray-300" />
                  </button>
                )}

                {/* Indicateur badge personnalisé */}
                {isCustomBadge && (
                  <div className="absolute top-3 right-12">
                    <Settings className="w-4 h-4 text-purple-400" title="Badge personnalisé" />
                  </div>
                )}

                {/* Contenu du badge */}
                <div className="text-center pt-8">
                  <div className={`text-6xl mb-4 ${isUnlocked ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  
                  <h3 className={`font-semibold mb-2 ${
                    isUnlocked ? 'text-white' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${
                    isUnlocked ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {badge.description}
                  </p>

                  {/* Progression */}
                  {!isUnlocked && progress > 0 && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-400 mt-1">{Math.round(progress)}% complété</p>
                    </div>
                  )}

                  {/* Rareté */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${rarityColors.bg} ${rarityColors.text}`}>
                      {badge.rarity.toUpperCase()}
                    </div>
                  </div>

                  {/* Récompense XP */}
                  <div className="text-center">
                    <span className="text-yellow-400 text-sm font-semibold">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          );
        })}
      </div>

      {/* Modal d'information du badge */}
      <AnimatePresence>
        {selectedBadge && !isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Informations du Badge</h3>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-gray-400 hover:text-white"
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
                    <span className="font-medium">Badge débloqué !</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    <Lock className="w-5 h-5 mr-2" />
                    <span className="font-medium">Badge verrouillé</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de création/édition de badge */}
      <AnimatePresence>
        {(showCreateModal || isEditing) && (
          <BadgeEditorModal
            badge={editingBadge}
            isEditing={isEditing}
            onSave={saveBadge}
            onClose={() => {
              setShowCreateModal(false);
              setIsEditing(false);
              setEditingBadge(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Confirmer la suppression</h3>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer ce badge ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteBadge(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message d'encouragement si aucun badge */}
      {badgeStats.earned === 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Commencez votre collection !</h3>
            <p className="text-gray-400 mb-6">
              Complétez des tâches et atteignez des objectifs pour débloquer vos premiers badges.
            </p>
            <div className="flex justify-center space-x-4">
              <PremiumButton variant="primary" onClick={() => window.location.href = '/tasks'}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Créer une tâche
              </PremiumButton>
              <PremiumButton variant="secondary" onClick={checkAndUnlockBadges}>
                <Zap className="w-4 h-4 mr-2" />
                Vérifier les badges
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

/**
 * 🛠️ COMPOSANT MODAL ÉDITEUR DE BADGE
 */
const BadgeEditorModal = ({ badge, isEditing, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    badge || {
      name: '',
      description: '',
      icon: '🏆',
      rarity: 'common',
      xpReward: 10,
      category: 'general',
      conditions: [''],
      autoCheckCode: '(userData) => true'
    }
  );

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Nom et description sont requis');
      return;
    }

    // Convertir le code autoCheck en fonction
    try {
      const autoCheckFunction = new Function('userData', formData.autoCheckCode.replace(/^\(userData\)\s*=>\s*/, 'return '));
      formData.autoCheck = autoCheckFunction;
    } catch (error) {
      alert('Code autoCheck invalide: ' + error.message);
      return;
    }

    onSave(formData, !isEditing);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'Modifier le Badge' : 'Créer un Nouveau Badge'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Nom du badge</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              placeholder="Nom du badge"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              placeholder="Description du badge"
              rows="3"
            />
          </div>

          {/* Icône */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Icône (emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              placeholder="🏆"
            />
          </div>

          {/* Rareté et XP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Rareté</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              >
                <option value="common">Commun</option>
                <option value="uncommon">Peu commun</option>
                <option value="rare">Rare</option>
                <option value="epic">Épique</option>
                <option value="legendary">Légendaire</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Récompense XP</label>
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
            >
              <option value="onboarding">Démarrage</option>
              <option value="productivity">Productivité</option>
              <option value="progression">Progression</option>
              <option value="consistency">Régularité</option>
              <option value="general">Général</option>
            </select>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Conditions (une par ligne)</label>
            <textarea
              value={formData.conditions.join('\n')}
              onChange={(e) => setFormData({ 
                ...formData, 
                conditions: e.target.value.split('\n').filter(c => c.trim()) 
              })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              placeholder="Compléter 5 tâches&#10;Atteindre le niveau 3"
              rows="3"
            />
          </div>

          {/* Code autoCheck */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Code de vérification automatique</label>
            <textarea
              value={formData.autoCheckCode}
              onChange={(e) => setFormData({ ...formData, autoCheckCode: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 font-mono text-sm"
              placeholder="(userData) => (userData.gamification?.tasksCompleted || 0) >= 5"
              rows="3"
            />
            <p className="text-gray-400 text-xs mt-1">
              Fonction JavaScript qui retourne true si le badge doit être débloqué. 
              Le paramètre userData contient toutes les données de l'utilisateur.
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BadgesPage;
