// ==========================================
// 📁 react-app/src/shared/hooks/useUnifiedUser.js
// HOOK UNIFIÉ - Firebase comme source unique pour TOUTES les pages
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import globalSyncService from '../../core/services/globalSyncService.js';

/**
 * 🌐 HOOK UTILISATEUR UNIFIÉ
 * Source unique Firebase pour TOUTES les pages de l'application
 * Remplace TOUS les autres hooks utilisateur existants
 */
export const useUnifiedUser = () => {
  const { user: authUser, isAuthenticated } = useAuthStore();
  
  // États unifiés
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // ✅ SYNCHRONISATION AUTOMATIQUE AVEC FIREBASE
  useEffect(() => {
    if (!isAuthenticated || !authUser?.uid) {
      setUserData(null);
      setLoading(false);
      setIsReady(false);
      return;
    }

    console.log('🔄 Initialisation synchronisation pour:', authUser.uid);
    setLoading(true);
    setError(null);

    // S'abonner aux changements Firebase temps réel
    const unsubscribeFirebase = globalSyncService.subscribeToUser(authUser.uid, {
      onDataUpdate: (data) => {
        console.log('📡 Données mises à jour depuis Firebase:', data.gamification?.totalXp);
        setUserData(data);
        setLoading(false);
        setError(null);
        setIsReady(true);
      },
      onError: (err) => {
        console.error('❌ Erreur synchronisation:', err);
        setError(err.message);
        setLoading(false);
        setIsReady(false);
      }
    });

    // Obtenir les données initiales depuis le cache si disponibles
    const cachedData = globalSyncService.getUserData(authUser.uid);
    if (cachedData) {
      setUserData(cachedData);
      setLoading(false);
      setIsReady(true);
    }

    return () => {
      if (unsubscribeFirebase) {
        unsubscribeFirebase();
      }
    };
  }, [authUser?.uid, isAuthenticated]);

  // 📊 DONNÉES GAMIFICATION UNIFIÉES
  const gamificationData = userData?.gamification || {
    totalXp: 0,
    level: 1,
    tasksCompleted: 0,
    tasksCreated: 0,
    projectsCreated: 0,
    badges: [],
    loginStreak: 0,
    completionRate: 0
  };

  // 👤 DONNÉES PROFIL UNIFIÉES
  const profileData = userData?.profile || {
    displayName: authUser?.displayName || 'Utilisateur',
    bio: '',
    department: 'Non défini',
    role: 'employee',
    preferences: {}
  };

  // 🎯 CALCULS XP ET PROGRESSION (source unique)
  const xpProgress = {
    totalXp: gamificationData.totalXp,
    level: gamificationData.level,
    currentLevelXP: (gamificationData.level - 1) * 100,
    nextLevelXP: gamificationData.level * 100,
    progressXP: gamificationData.totalXp - ((gamificationData.level - 1) * 100),
    progressPercent: Math.min(100, Math.max(0, 
      ((gamificationData.totalXp - ((gamificationData.level - 1) * 100)) / 100) * 100
    )),
    xpToNext: Math.max(0, (gamificationData.level * 100) - gamificationData.totalXp)
  };

  // 🏆 DONNÉES BADGES UNIFIÉES
  const badgesData = {
    badges: gamificationData.badges || [],
    count: (gamificationData.badges || []).length,
    recent: (gamificationData.badges || []).slice(-3),
    hasNewBadges: (gamificationData.badges || []).some(badge => {
      const badgeDate = new Date(badge.unlockedAt || 0);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return badgeDate > oneDayAgo;
    })
  };

  // 📈 STATISTIQUES COMPLÈTES UNIFIÉES
  const stats = {
    // XP et niveau
    totalXp: gamificationData.totalXp,
    level: gamificationData.level,
    
    // Tâches
    tasksCompleted: gamificationData.tasksCompleted,
    tasksCreated: gamificationData.tasksCreated,
    completionRate: gamificationData.completionRate,
    
    // Projets
    projectsCreated: gamificationData.projectsCreated,
    projectsCompleted: gamificationData.projectsCompleted || 0,
    
    // Engagement
    loginStreak: gamificationData.loginStreak,
    badgesCount: (gamificationData.badges || []).length,
    
    // Métriques calculées
    averageTaskXp: gamificationData.averageTaskXp || 0,
    productivity: gamificationData.productivity || 'normal'
  };

  // 💾 MISE À JOUR DES DONNÉES
  const updateUserData = useCallback(async (updates) => {
    if (!authUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const result = await globalSyncService.updateUserData(authUser.uid, updates);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (err) {
      console.error('❌ Erreur mise à jour utilisateur:', err);
      throw err;
    }
  }, [authUser?.uid]);

  // 🎮 MISE À JOUR GAMIFICATION
  const updateGamification = useCallback(async (gamificationUpdates) => {
    const updates = {};
    
    // Convertir en format Firebase avec notation dot
    Object.keys(gamificationUpdates).forEach(key => {
      updates[`gamification.${key}`] = gamificationUpdates[key];
    });
    
    return await updateUserData(updates);
  }, [updateUserData]);

  // 👤 MISE À JOUR PROFIL
  const updateProfile = useCallback(async (profileUpdates) => {
    const updates = {};
    
    // Convertir en format Firebase avec notation dot
    Object.keys(profileUpdates).forEach(key => {
      updates[`profile.${key}`] = profileUpdates[key];
    });
    
    return await updateUserData(updates);
  }, [updateUserData]);

  // ⚡ AJOUTER XP (avec recalcul automatique du niveau)
  const addXP = useCallback(async (xpAmount, source = 'unknown') => {
    if (!authUser?.uid || !isReady) {
      throw new Error('Utilisateur non prêt');
    }

    try {
      const newTotalXP = gamificationData.totalXp + xpAmount;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const leveledUp = newLevel > gamificationData.level;

      // Mettre à jour XP et niveau
      const updates = {
        'gamification.totalXp': newTotalXP,
        'gamification.level': newLevel,
        'gamification.lastActivityAt': new Date().toISOString()
      };

      // Ajouter à l'historique XP
      const newXPEntry = {
        amount: xpAmount,
        source,
        timestamp: new Date().toISOString(),
        totalAfter: newTotalXP
      };
      
      const currentHistory = gamificationData.xpHistory || [];
      updates['gamification.xpHistory'] = [...currentHistory.slice(-9), newXPEntry];

      const result = await updateUserData(updates);
      
      console.log(`✅ +${xpAmount} XP ajouté (${source}) - Total: ${newTotalXP}`);
      
      return {
        success: true,
        newTotalXP,
        newLevel,
        leveledUp,
        xpAdded: xpAmount
      };
      
    } catch (err) {
      console.error('❌ Erreur ajout XP:', err);
      throw err;
    }
  }, [authUser?.uid, isReady, gamificationData, updateUserData]);

  // 🔄 FORCER LA SYNCHRONISATION
  const forceSync = useCallback(async () => {
    if (!authUser?.uid) return;
    
    try {
      // Déclencher une re-synchronisation depuis Firebase
      const unsubscribe = globalSyncService.subscribeToUser(authUser.uid);
      
      // La synchronisation se fera automatiquement via les listeners
      console.log('🔄 Synchronisation forcée déclenchée');
      
      return { success: true };
    } catch (err) {
      console.error('❌ Erreur synchronisation forcée:', err);
      return { success: false, error: err.message };
    }
  }, [authUser?.uid]);

  return {
    // ===== DONNÉES PRINCIPALES =====
    userData,              // Données complètes utilisateur
    gamificationData,      // Données gamification unifiées
    profileData,          // Données profil unifiées
    
    // ===== DONNÉES CALCULÉES =====
    xpProgress,           // Progression XP avec calculs
    stats,                // Statistiques complètes
    badges: badgesData,   // Données badges
    
    // ===== ÉTATS =====
    loading,              // Chargement en cours
    error,                // Erreur éventuelle
    isReady,              // Données prêtes à utiliser
    isAuthenticated,      // Utilisateur connecté
    
    // ===== ACTIONS =====
    updateUserData,       // Mise à jour générale
    updateGamification,   // Mise à jour gamification
    updateProfile,        // Mise à jour profil
    addXP,                // Ajouter XP avec calculs automatiques
    forceSync,            // Forcer synchronisation
    
    // ===== DONNÉES RAPIDES =====
    // Pour compatibilité avec l'existant
    level: gamificationData.level,
    totalXp: gamificationData.totalXp,
    tasksCompleted: gamificationData.tasksCompleted,
    loginStreak: gamificationData.loginStreak,
    badgeCount: (gamificationData.badges || []).length,
    displayName: profileData.displayName,
    department: profileData.department
  };
};

/**
 * 🎮 HOOK SPÉCIALISÉ GAMIFICATION
 * Version allégée pour les composants qui n'ont besoin que de la gamification
 */
export const useUnifiedGamification = () => {
  const { 
    gamificationData, 
    xpProgress, 
    stats, 
    badges, 
    loading, 
    isReady,
    addXP,
    updateGamification
  } = useUnifiedUser();
  
  return {
    level: stats.level,
    totalXp: stats.totalXp,
    xpProgress,
    badges: badges.badges,
    badgeCount: badges.count,
    tasksCompleted: stats.tasksCompleted,
    loginStreak: stats.loginStreak,
    completionRate: stats.completionRate,
    loading,
    isReady,
    addXP,
    updateGamification
  };
};

/**
 * 👤 HOOK SPÉCIALISÉ PROFIL
 * Version allégée pour les composants de profil
 */
export const useUnifiedProfile = () => {
  const { 
    profileData, 
    userData, 
    loading, 
    isReady,
    updateProfile,
    forceSync
  } = useUnifiedUser();
  
  return {
    profile: profileData,
    displayName: profileData.displayName,
    bio: profileData.bio,
    department: profileData.department,
    role: profileData.role,
    preferences: profileData.preferences,
    email: userData?.email,
    photoURL: userData?.photoURL,
    createdAt: userData?.createdAt,
    lastLoginAt: userData?.lastLoginAt,
    loading,
    isReady,
    updateProfile,
    refresh: forceSync
  };
};

/**
 * 🏆 HOOK SPÉCIALISÉ LEADERBOARD
 * Données optimisées pour les classements
 */
export const useUnifiedLeaderboard = () => {
  const { 
    profileData, 
    gamificationData, 
    loading, 
    isReady 
  } = useUnifiedUser();
  
  return {
    displayName: profileData.displayName,
    department: profileData.department,
    photoURL: null, // À récupérer depuis auth
    level: gamificationData.level,
    totalXp: gamificationData.totalXp,
    tasksCompleted: gamificationData.tasksCompleted,
    badges: (gamificationData.badges || []).length,
    loginStreak: gamificationData.loginStreak,
    completionRate: gamificationData.completionRate,
    loading,
    isReady
  };
};

// Export du hook principal par défaut
export default useUnifiedUser;
