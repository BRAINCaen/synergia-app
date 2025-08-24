// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// VERSION CORRIGÉE - DONNÉES FIREBASE RÉELLES
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
  deleteDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 BADGES DE RÉFÉRENCE - ADAPTÉS À LA STRUCTURE FIREBASE RÉELLE
const REFERENCE_BADGES = [
  {
    id: 'first_login',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    type: 'achievement',
    rarity: 'common',
    xpReward: 10,
    category: 'onboarding',
    checkCondition: (userData) => true // Auto-débloqué
  },
  {
    id: 'profile_complete',
    name: 'Profil Complet',
    description: 'Profil utilisateur entièrement rempli',
    icon: '👤',
    type: 'achievement', 
    rarity: 'common',
    xpReward: 25,
    category: 'onboarding',
    checkCondition: (userData) => {
      const profile = userData.profile || {};
      return profile.completeness >= 80;
    }
  },
  {
    id: 'task_starter',
    name: 'Premier Pas',
    description: 'Première tâche complétée',
    icon: '✅',
    type: 'achievement',
    rarity: 'common', 
    xpReward: 20,
    category: 'productivity',
    checkCondition: (userData) => (userData.gamification?.tasksCompleted || 0) >= 1
  },
  {
    id: 'task_enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter 5 tâches',
    icon: '🔥',
    type: 'milestone',
    rarity: 'uncommon',
    xpReward: 50,
    category: 'productivity',
    checkCondition: (userData) => (userData.gamification?.tasksCompleted || 0) >= 5
  },
  {
    id: 'level_climber',
    name: 'Grimpeur',
    description: 'Atteindre le niveau 5',
    icon: '📈',
    type: 'progression',
    rarity: 'uncommon',
    xpReward: 75,
    category: 'progression', 
    checkCondition: (userData) => (userData.gamification?.level || 1) >= 5
  },
  {
    id: 'xp_collector',
    name: 'Collectionneur XP',
    description: 'Accumuler 1000 points d\'expérience',
    icon: '💎',
    type: 'milestone',
    rarity: 'rare',
    xpReward: 150,
    category: 'progression',
    checkCondition: (userData) => (userData.gamification?.totalXp || 0) >= 1000
  },
  {
    id: 'consistent_user',
    name: 'Utilisateur Régulier',
    description: 'Connexions régulières pendant 7 jours',
    icon: '📅',
    type: 'streak',
    rarity: 'uncommon',
    xpReward: 80,
    category: 'consistency',
    checkCondition: (userData) => (userData.gamification?.loginStreak || 0) >= 7
  },
  {
    id: 'team_player',
    name: 'Esprit d\'Équipe',
    description: 'Participer à plusieurs projets d\'équipe',
    icon: '🤝',
    type: 'social',
    rarity: 'rare',
    xpReward: 120,
    category: 'teamwork',
    checkCondition: (userData) => (userData.gamification?.projectsCreated || 0) >= 3
  },
  {
    id: 'badge_collector',
    name: 'Collectionneur',
    description: 'Débloquer 5 badges différents',
    icon: '🏆',
    type: 'meta',
    rarity: 'rare',
    xpReward: 100,
    category: 'collection',
    checkCondition: (userData) => {
      const badges = userData.gamification?.badges || [];
      return badges.length >= 5;
    }
  },
  {
    id: 'legend',
    name: 'Légende',
    description: 'Atteindre le niveau 20',
    icon: '👑',
    type: 'progression',
    rarity: 'legendary',
    xpReward: 500,
    category: 'mastery',
    checkCondition: (userData) => (userData.gamification?.level || 1) >= 20
  }
];

/**
 * 🏆 COMPOSANT PRINCIPAL - PAGE BADGES
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  
  // ✅ UTILISATION CORRECTE DU HOOK FIREBASE
  const { 
    gamification, 
    isLoading: firebaseLoading, 
    isReady,
    error: firebaseError,
    actions 
  } = useUnifiedFirebaseData();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [badgeStats, setBadgeStats] = useState({
    earned: 0,
    total: 0,
    percentage: 0,
    byRarity: {},
    byType: {}
  });
  
  // États admin
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Vérifier le statut admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsUserAdmin(adminStatus);
        console.log('🛡️ Statut admin pour badges:', adminStatus);
      }
    };
    checkAdmin();
  }, [user]);

  /**
   * 🔍 VÉRIFIER ET DÉBLOQUER LES BADGES - VERSION CORRIGÉE FIREBASE
   */
  const checkAndUnlockBadges = async () => {
    if (!user?.uid || !isReady || !gamification) return;

    try {
      console.log('🎯 Vérification badges avec données Firebase réelles...');
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return;
      
      const userData = userSnap.data();
      
      // ✅ STRUCTURE FIREBASE RÉELLE
      const currentBadges = userData.gamification?.badges || [];
      const earnedBadgeIds = currentBadges.map(b => b.id);
      
      let newBadges = [];
      let totalXpGained = 0;

      // Vérifier chaque badge de référence
      for (const badgeDefinition of REFERENCE_BADGES) {
        const isAlreadyEarned = earnedBadgeIds.includes(badgeDefinition.id);
        
        if (!isAlreadyEarned && badgeDefinition.checkCondition) {
          try {
            const shouldUnlock = badgeDefinition.checkCondition(userData);
            
            if (shouldUnlock) {
              console.log(`🎉 Nouveau badge débloqué: ${badgeDefinition.name}`);
              
              // ✅ STRUCTURE FIREBASE CORRECTE
              const newBadge = {
                id: badgeDefinition.id,
                name: badgeDefinition.name,
                description: badgeDefinition.description,
                type: badgeDefinition.type,
                rarity: badgeDefinition.rarity,
                xpReward: badgeDefinition.xpReward,
                unlockedAt: new Date().toISOString() // ✅ Format ISO string
              };
              
              newBadges.push(newBadge);
              totalXpGained += badgeDefinition.xpReward;
            }
          } catch (error) {
            console.warn('⚠️ Erreur vérification badge:', badgeDefinition.id, error);
          }
        }
      }

      // ✅ SAUVEGARDE FIREBASE CORRIGÉE
      if (newBadges.length > 0) {
        const allBadges = [...currentBadges, ...newBadges];
        
        await setDoc(userRef, {
          gamification: {
            ...userData.gamification,
            badges: allBadges,
            badgesUnlocked: allBadges.length,
            totalXp: (userData.gamification?.totalXp || 0) + totalXpGained,
            totalBadgeXp: (userData.gamification?.totalBadgeXp || 0) + totalXpGained,
            lastBadgeCheck: new Date().toISOString()
          }
        }, { merge: true });

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
        <div class="text-2xl mr-3">${badge.icon || '🏆'}</div>
        <div>
          <div class="font-bold">Badge débloqué !</div>
          <div class="text-sm">${badge.name}</div>
          <div class="text-xs text-yellow-300">+${badge.xpReward} XP</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  /**
   * 📊 CALCULER LES STATISTIQUES DES BADGES - VERSION CORRIGÉE
   */
  const calculateBadgeStats = () => {
    // ✅ UTILISER LES VRAIES DONNÉES FIREBASE
    const userBadges = gamification?.badges || [];
    const earnedCount = userBadges.length;
    const totalCount = REFERENCE_BADGES.length;
    const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

    // ✅ GROUPER PAR RARETÉ (structure Firebase)
    const byRarity = userBadges.reduce((acc, badge) => {
      const rarity = badge.rarity || 'common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});

    // ✅ GROUPER PAR TYPE (structure Firebase)
    const byType = userBadges.reduce((acc, badge) => {
      const type = badge.type || 'achievement';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    setBadgeStats({
      earned: earnedCount,
      total: totalCount,
      percentage,
      byRarity,
      byType
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
   * ✅ VÉRIFIER SI UN BADGE EST DÉBLOQUÉ - VERSION FIREBASE
   */
  const isBadgeUnlocked = (badgeId) => {
    const userBadges = gamification?.badges || [];
    return userBadges.some(badge => badge.id === badgeId);
  };

  /**
   * 📊 CALCULER LA PROGRESSION D'UN BADGE
   */
  const getBadgeProgress = (badgeRef) => {
    if (isBadgeUnlocked(badgeRef.id)) return 100;
    
    // Logique de progression basée sur les conditions
    if (badgeRef.checkCondition && gamification) {
      try {
        // Récupérer les données utilisateur complètes
        const userData = { gamification };
        
        // Simuler une progression basée sur les métriques
        switch (badgeRef.id) {
          case 'task_starter':
            return Math.min(100, ((gamification.tasksCompleted || 0) / 1) * 100);
          case 'task_enthusiast':
            return Math.min(100, ((gamification.tasksCompleted || 0) / 5) * 100);
          case 'level_climber':
            return Math.min(100, ((gamification.level || 1) / 5) * 100);
          case 'xp_collector':
            return Math.min(100, ((gamification.totalXp || 0) / 1000) * 100);
          case 'consistent_user':
            return Math.min(100, ((gamification.loginStreak || 0) / 7) * 100);
          case 'legend':
            return Math.min(100, ((gamification.level || 1) / 20) * 100);
          default:
            return badgeRef.checkCondition(userData) ? 100 : 25;
        }
      } catch {
        return 0;
      }
    }
    
    return 0;
  };

  /**
   * 🔄 ACTUALISER LES DONNÉES
   */
  const refreshData = async () => {
    setLoading(true);
    await checkAndUnlockBadges();
    calculateBadgeStats();
    setLoading(false);
  };

  // Charger les données au montage
  useEffect(() => {
    if (isReady && user?.uid && gamification) {
      checkAndUnlockBadges();
      calculateBadgeStats();
      setLoading(false);
    }
  }, [isReady, user?.uid, gamification]);

  // Recalculer les stats quand les badges changent
  useEffect(() => {
    if (gamification?.badges) {
      calculateBadgeStats();
    }
  }, [gamification?.badges]);

  // Filtrer les badges selon la catégorie
  const filteredBadges = selectedCategory === 'all' 
    ? REFERENCE_BADGES 
    : REFERENCE_BADGES.filter(badge => badge.category === selectedCategory);

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Tous', icon: Trophy },
    { id: 'onboarding', name: 'Démarrage', icon: Target },
    { id: 'productivity', name: 'Productivité', icon: CheckCircle },
    { id: 'progression', name: 'Progression', icon: Star },
    { id: 'consistency', name: 'Régularité', icon: Calendar },
    { id: 'teamwork', name: 'Équipe', icon: Users },
    { id: 'mastery', name: 'Maîtrise', icon: Crown }
  ];

  // ✅ STATS HEADER CORRIGÉES
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
      label: "XP des badges", 
      value: (gamification?.totalBadgeXp || 0).toString(), 
      icon: Zap, 
      color: "text-orange-400" 
    }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      {isUserAdmin && (
        <>
          <PremiumButton variant="secondary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau badge
          </PremiumButton>
          <PremiumButton variant="secondary" onClick={() => window.open('/admin/badges', '_blank')}>
            <Settings className="w-4 h-4 mr-2" />
            Admin Badges
          </PremiumButton>
        </>
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
            <div className="flex space-x-2 flex-wrap">
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
                    {!isUnlocked && progress > 0 && (
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
                    
                    {/* Badge verrouillé sans progression */}
                    {!isUnlocked && progress === 0 && (
                      <div className="flex items-center justify-center text-gray-500 text-sm">
                        <Lock className="w-4 h-4 mr-1" />
                        Verrouillé
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>

        {/* Message si aucun badge dans la catégorie */}
        {filteredBadges.length === 0 && (
          <PremiumCard className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Aucun badge dans cette catégorie</h3>
            <p className="text-gray-400">Sélectionnez une autre catégorie ou revenez plus tard !</p>
            {isUserAdmin && (
              <PremiumButton 
                variant="secondary" 
                className="mt-4"
                onClick={() => window.open('/admin/badges', '_blank')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer des badges
              </PremiumButton>
            )}
          </PremiumCard>
        )}

        {/* Modal de création rapide pour admins */}
        <AnimatePresence>
          {showCreateModal && isUserAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">Création rapide</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center py-8">
                  <Settings className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-white text-lg font-semibold mb-2">Interface d'administration</h4>
                  <p className="text-gray-300 text-sm mb-6">
                    Pour créer et gérer les badges avec toutes les options avancées, 
                    utilisez l'interface d'administration complète.
                  </p>
                  
                  <div className="flex space-x-3">
                    <PremiumButton 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Annuler
                    </PremiumButton>
                    <PremiumButton 
                      variant="primary" 
                      className="flex-1"
                      onClick={() => {
                        window.open('/admin/badges', '_blank');
                        setShowCreateModal(false);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Badges
                    </PremiumButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <div className="text-blue-400 text-sm">
                      {selectedBadge.type}
                    </div>
                  </div>
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

                {/* Date de déverrouillage */}
                {isBadgeUnlocked(selectedBadge.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm text-center">
                      Débloqué le {new Date(
                        gamification.badges?.find(b => b.id === selectedBadge.id)?.unlockedAt || Date.now()
                      ).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
};

export default BadgesPage;
