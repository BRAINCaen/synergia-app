// ==========================================
// 📁 react-app/src/shared/hooks/useUnifiedFirebaseData.js
// HOOK UNIFIÉ - FIREBASE COMME SOURCE UNIQUE DE VÉRITÉ
// Remplace TOUS les autres hooks et données mock
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { firebaseDataSyncService } from '../../core/services/firebaseDataSyncService.js';

/**
 * 🌐 HOOK UNIFIÉ FIREBASE
 * Source unique de vérité pour TOUTES les données utilisateur
 * Remplace tous les hooks existants qui utilisent des données mock
 */
export const useUnifiedFirebaseData = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // États principaux
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synchronized, error
  
  // Référence pour éviter les re-renders multiples
  const unsubscribeRef = useRef(null);
  const isInitializedRef = useRef(false);

  // ✅ SYNCHRONISATION AUTOMATIQUE À LA CONNEXION
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      // Reset des données si déconnecté
      setUserData(null);
      setIsLoading(false);
      setIsReady(false);
      setSyncStatus('idle');
      isInitializedRef.current = false;
      
      // Nettoyer l'ancien listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      return;
    }

    // Éviter la double initialisation
    if (isInitializedRef.current) {
      return;
    }

    initializeUserData();
    
    // Marquer comme initialisé
    isInitializedRef.current = true;

    // Cleanup au démontage
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid, isAuthenticated]);

  /**
   * 🚀 INITIALISATION DES DONNÉES UTILISATEUR
   */
  const initializeUserData = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      setSyncStatus('syncing');
      setError(null);
      
      console.log('🚀 Initialisation données Firebase pour:', user.uid);
      
      // 1. Initialiser ou récupérer les données utilisateur
      const completeUserData = await firebaseDataSyncService.initializeUserData(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      // 2. Mettre à jour l'état local
      setUserData(completeUserData);
      setIsReady(true);
      setSyncStatus('synchronized');
      
      console.log('✅ Données utilisateur initialisées:', {
        level: completeUserData.gamification?.level,
        totalXp: completeUserData.gamification?.totalXp,
        tasksCompleted: completeUserData.gamification?.tasksCompleted
      });
      
      // 3. S'abonner aux changements temps réel
      const unsubscribe = await firebaseDataSyncService.subscribeToUserData(
        user.uid,
        (updatedData) => {
          console.log('📡 Données utilisateur mises à jour en temps réel');
          setUserData(updatedData);
          setSyncStatus('synchronized');
        }
      );
      
      unsubscribeRef.current = unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur initialisation données Firebase:', error);
      setError(error.message);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎯 AJOUTER XP À L'UTILISATEUR
   */
  const addXp = useCallback(async (amount, source = 'action') => {
    if (!user?.uid || !userData) return { success: false };
    
    try {
      const result = await firebaseDataSyncService.addXpToUser(user.uid, amount, source);
      
      if (result.success) {
        console.log(`✅ +${amount} XP ajoutés (${source})`);
        
        // Les données seront automatiquement mises à jour via le listener temps réel
        return result;
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  }, [user?.uid, userData]);

  /**
   * 🏅 DÉBLOQUER UN BADGE
   */
  const unlockBadge = useCallback(async (badgeId, badgeData) => {
    if (!user?.uid || !userData) return { success: false };
    
    try {
      const result = await firebaseDataSyncService.unlockBadge(user.uid, badgeId, badgeData);
      
      if (result.success) {
        console.log(`🏅 Badge débloqué: ${badgeData.name}`);
        
        // Les données seront automatiquement mises à jour via le listener temps réel
        return result;
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      return { success: false, error: error.message };
    }
  }, [user?.uid, userData]);

  /**
   * 📊 METTRE À JOUR LES STATISTIQUES
   */
  const updateStats = useCallback(async (updates) => {
    if (!user?.uid) return { success: false };
    
    try {
      const result = await firebaseDataSyncService.updateUserStats(user.uid, updates);
      
      if (result.success) {
        console.log('📊 Statistiques mises à jour:', Object.keys(updates));
        
        // Les données seront automatiquement mises à jour via le listener temps réel
        return result;
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statistiques:', error);
      return { success: false, error: error.message };
    }
  }, [user?.uid]);

  /**
   * 🔄 FORCER LA SYNCHRONISATION
   */
  const forceSync = useCallback(async () => {
    if (!user?.uid) return;
    
    setSyncStatus('syncing');
    
    try {
      // Re-initialiser les données
      const completeUserData = await firebaseDataSyncService.initializeUserData(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      
      setUserData(completeUserData);
      setSyncStatus('synchronized');
      setError(null);
      
      console.log('🔄 Synchronisation forcée terminée');
      
    } catch (error) {
      console.error('❌ Erreur synchronisation forcée:', error);
      setError(error.message);
      setSyncStatus('error');
    }
  }, [user?.uid, user?.email, user?.displayName, user?.photoURL]);

  // ==========================================
  // 📊 DONNÉES DÉRIVÉES - CALCULÉES EN TEMPS RÉEL
  // ==========================================

  // Données de profil
  const profile = userData?.profile || null;
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';
  const bio = profile?.bio || '';
  const department = profile?.department || 'general';
  const role = profile?.role || 'member';
  
  // Données de gamification
  const gamification = userData?.gamification || {};
  const level = gamification.level || 1;
  const totalXp = gamification.totalXp || 0;
  const weeklyXp = gamification.weeklyXp || 0;
  const monthlyXp = gamification.monthlyXp || 0;
  const tasksCompleted = gamification.tasksCompleted || 0;
  const tasksCreated = gamification.tasksCreated || 0;
  const projectsCreated = gamification.projectsCreated || 0;
  const badges = gamification.badges || [];
  const badgesUnlocked = gamification.badgesUnlocked || 0;
  const loginStreak = gamification.loginStreak || 1;
  const currentStreak = gamification.currentStreak || 1;
  const xpHistory = gamification.xpHistory || [];
  const levelUpHistory = gamification.levelUpHistory || [];
  
  // Calculs dérivés
  const currentLevelXp = totalXp % 100; // XP dans le niveau actuel
  const nextLevelXpRequired = 100; // XP requis pour le niveau suivant
  const xpProgress = (currentLevelXp / nextLevelXpRequired) * 100; // Progression en %
  const nextLevel = level + 1;
  
  // Statistiques calculées
  const completionRate = tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;
  const averageTaskXp = tasksCompleted > 0 ? Math.round(totalXp / tasksCompleted) : 0;
  const productivity = gamification.productivity || 'starting';
  
  // Badges par catégorie
  const badgesByRarity = badges.reduce((acc, badge) => {
    const rarity = badge.rarity || 'common';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {});
  
  const badgesByType = badges.reduce((acc, badge) => {
    const type = badge.type || 'achievement';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Badges récents (derniers 5)
  const recentBadges = badges
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 5);
  
  // Statistiques d'équipe
  const teamStats = userData?.teamStats || {};
  
  // Métriques système
  const systemStats = {
    weeklyProgress: gamification.weeklyProgress || 0,
    monthlyProgress: gamification.monthlyProgress || 0,
    streakHealth: gamification.streakHealth || 'starting'
  };

  // ==========================================
  // 🎯 ACTIONS UTILITAIRES
  // ==========================================

  /**
   * 📋 MARQUER UNE TÂCHE COMME COMPLÉTÉE
   */
  const completeTask = useCallback(async (taskXp = 25) => {
    const updates = {
      'gamification.tasksCompleted': tasksCompleted + 1,
      'gamification.lastActivityDate': new Date().toISOString()
    };
    
    const updateResult = await updateStats(updates);
    const xpResult = await addXp(taskXp, 'task_completion');
    
    return {
      success: updateResult.success && xpResult.success,
      xpGained: xpResult.xpGained || 0,
      leveledUp: xpResult.leveledUp || false
    };
  }, [tasksCompleted, updateStats, addXp]);

  /**
   * 🚀 CRÉER UN PROJET
   */
  const createProject = useCallback(async () => {
    const updates = {
      'gamification.projectsCreated': projectsCreated + 1,
      'gamification.lastActivityDate': new Date().toISOString()
    };
    
    const updateResult = await updateStats(updates);
    const xpResult = await addXp(50, 'project_creation');
    
    return {
      success: updateResult.success && xpResult.success,
      xpGained: xpResult.xpGained || 0,
      leveledUp: xpResult.leveledUp || false
    };
  }, [projectsCreated, updateStats, addXp]);

  /**
   * 🔥 METTRE À JOUR LE STREAK DE CONNEXION
   */
  const updateLoginStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastLoginDate = gamification.lastLoginDate;
    
    if (lastLoginDate === today) {
      // Déjà connecté aujourd'hui
      return { success: true, streak: currentStreak };
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = currentStreak;
    
    if (lastLoginDate === yesterdayStr) {
      // Streak continue
      newStreak = currentStreak + 1;
    } else {
      // Streak cassé, recommencer
      newStreak = 1;
    }
    
    const updates = {
      'gamification.loginStreak': newStreak,
      'gamification.currentStreak': newStreak,
      'gamification.maxStreak': Math.max(gamification.maxStreak || 1, newStreak),
      'gamification.lastLoginDate': today,
      'gamification.lastActivityDate': new Date().toISOString()
    };
    
    const result = await updateStats(updates);
    
    // Bonus XP pour les streaks
    if (result.success && newStreak > currentStreak) {
      let bonusXp = 0;
      if (newStreak >= 7) bonusXp = 50; // Bonus semaine
      else if (newStreak >= 3) bonusXp = 20; // Bonus 3 jours
      else bonusXp = 10; // Bonus quotidien
      
      if (bonusXp > 0) {
        await addXp(bonusXp, `login_streak_${newStreak}`);
      }
    }
    
    return {
      success: result.success,
      streak: newStreak,
      streakIncreased: newStreak > currentStreak
    };
  }, [gamification, currentStreak, updateStats, addXp]);

  // ==========================================
  // 📤 RETOUR DU HOOK
  // ==========================================

  return {
    // États principaux
    userData,
    isLoading,
    isReady,
    error,
    syncStatus,
    
    // Données de profil
    profile: {
      displayName,
      bio,
      department,
      role,
      email: user?.email,
      photoURL: user?.photoURL
    },
    
    // Données de gamification
    gamification: {
      level,
      totalXp,
      weeklyXp,
      monthlyXp,
      currentLevelXp,
      nextLevelXpRequired,
      xpProgress,
      nextLevel,
      tasksCompleted,
      tasksCreated,
      projectsCreated,
      badges,
      badgesUnlocked,
      loginStreak,
      currentStreak,
      xpHistory,
      levelUpHistory,
      completionRate,
      averageTaskXp,
      productivity
    },
    
    // Badges
    badgeStats: {
      total: badgesUnlocked,
      byRarity: badgesByRarity,
      byType: badgesByType,
      recent: recentBadges
    },
    
    // Statistiques d'équipe
    teamStats,
    
    // Métriques système
    systemStats,
    
    // Actions
    actions: {
      addXp,
      unlockBadge,
      updateStats,
      completeTask,
      createProject,
      updateLoginStreak,
      forceSync
    },
    
    // Utilitaires
    utils: {
      isLoggedInToday: gamification.lastLoginDate === new Date().toISOString().split('T')[0],
      canLevelUp: currentLevelXp >= nextLevelXpRequired,
      daysUntilStreakBonus: Math.max(0, 7 - currentStreak),
      weeklyXpProgress: Math.min(100, (weeklyXp / 200) * 100), // Objectif 200 XP/semaine
      monthlyXpProgress: Math.min(100, (monthlyXp / 800) * 100) // Objectif 800 XP/mois
    }
  };
};

// ==========================================
// 🎯 HOOKS SPÉCIALISÉS DÉRIVÉS
// ==========================================

/**
 * Hook simplifié pour les données de profil uniquement
 */
export const useFirebaseProfile = () => {
  const { profile, isLoading, isReady, error, actions } = useUnifiedFirebaseData();
  
  return {
    profile,
    isLoading,
    isReady,
    error,
    updateProfile: (profileData) => actions.updateStats({ profile: profileData })
  };
};

/**
 * Hook simplifié pour la gamification uniquement
 */
export const useFirebaseGamification = () => {
  const { gamification, badgeStats, isLoading, isReady, error, actions } = useUnifiedFirebaseData();
  
  return {
    gamification,
    badges: badgeStats,
    isLoading,
    isReady,
    error,
    addXp: actions.addXp,
    unlockBadge: actions.unlockBadge,
    completeTask: actions.completeTask,
    createProject: actions.createProject,
    updateLoginStreak: actions.updateLoginStreak
  };
};

/**
 * Hook simplifié pour les statistiques uniquement
 */
export const useFirebaseStats = () => {
  const { gamification, teamStats, systemStats, isLoading, isReady, error } = useUnifiedFirebaseData();
  
  return {
    userStats: gamification,
    teamStats,
    systemStats,
    isLoading,
    isReady,
    error
  };
};

// Export par défaut
export default useUnifiedFirebaseData;
