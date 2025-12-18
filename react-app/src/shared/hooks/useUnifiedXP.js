// ==========================================
// 📁 react-app/src/shared/hooks/useUnifiedXP.js
// HOOK UNIFIÉ POUR TOUTES LES DONNÉES XP - CODE COMPLET
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { unifiedXpSyncService } from '../../core/services/unifiedXpSyncService.js';
import { calculateLevel, getXPProgress } from '../../core/services/levelService.js';

/**
 * 🎯 HOOK UNIFIÉ POUR TOUTES LES DONNÉES XP - VERSION COMPLÈTE
 * À utiliser dans TOUTES les pages : Dashboard, Analytics, Gamification, Boutique
 * Garantit la synchronisation parfaite entre toutes les pages
 */
export const useUnifiedXP = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // États principaux
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Référence pour éviter les re-renders
  const unsubscribeRef = useRef(null);
  const callbackRef = useRef(null);

  // ✅ INITIALISATION ET SYNCHRONISATION AUTOMATIQUE
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      // Réinitialiser si pas connecté
      setGamificationData(null);
      setLoading(false);
      setError(null);
      setSyncStatus('disconnected');
      return;
    }

    console.log('🎯 [UNIFIED-XP] Initialisation pour:', user.uid);
    setLoading(true);
    setError(null);
    setSyncStatus('connecting');

    // Initialiser le service si pas déjà fait
    unifiedXpSyncService.initialize();

    // Callback pour les mises à jour
    callbackRef.current = (updatedData) => {
      console.log('📊 [UNIFIED-XP] Données mises à jour:', {
        totalXp: updatedData.totalXp,
        level: updatedData.level,
        source: 'realtime'
      });
      
      setGamificationData(updatedData);
      setLoading(false);
      setError(null);
      setSyncStatus('synchronized');
      setLastUpdate(new Date());
    };

    // S'abonner aux changements Firebase temps réel
    const unsubscribe = unifiedXpSyncService.subscribeToUser(user.uid, {
      onDataUpdate: (fullUserData) => {
        if (callbackRef.current && fullUserData.gamification) {
          callbackRef.current(fullUserData.gamification);
        }
      },
      onError: (err) => {
        console.error('❌ [UNIFIED-XP] Erreur synchronisation:', err);
        setError(err.message);
        setLoading(false);
        setSyncStatus('error');
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Essayer de récupérer depuis le cache immédiatement
    const cachedData = unifiedXpSyncService.getUserData(user.uid);
    if (cachedData && cachedData.gamification) {
      console.log('⚡ [UNIFIED-XP] Données depuis cache:', cachedData.gamification.totalXp);
      setGamificationData(cachedData.gamification);
      setLoading(false);
      setSyncStatus('cached');
    }

    // S'abonner aux événements globaux XP
    const handleGlobalXpUpdate = (event) => {
      if (event.detail.userId === user.uid && callbackRef.current) {
        callbackRef.current(event.detail.gamificationData);
      }
    };

    window.addEventListener('xpDataUpdated', handleGlobalXpUpdate);

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      window.removeEventListener('xpDataUpdated', handleGlobalXpUpdate);
    };
  }, [user?.uid, isAuthenticated]);

  // 🎯 AJOUTER XP AVEC SYNCHRONISATION GARANTIE
  const addXP = useCallback(async (amount, source = 'action', metadata = {}) => {
    if (!user?.uid) {
      console.warn('⚠️ [UNIFIED-XP] Utilisateur non connecté pour ajout XP');
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      setSyncStatus('updating');
      console.log(`🎯 [UNIFIED-XP] Ajout XP: ${amount} (${source})`);
      
      const result = await unifiedXpSyncService.addXpWithSync(
        user.uid, 
        amount, 
        source, 
        metadata
      );
      
      setSyncStatus('synchronized');
      
      console.log(`✅ [UNIFIED-XP] XP ajouté avec succès:`, result);
      return result;
      
    } catch (error) {
      console.error('❌ [UNIFIED-XP] Erreur ajout XP:', error);
      setError(error.message);
      setSyncStatus('error');
      return { success: false, error: error.message };
    }
  }, [user?.uid]);

  // 🔄 FORCER LA SYNCHRONISATION
  const forceSync = useCallback(async () => {
    if (!user?.uid) return { success: false, error: 'Utilisateur non connecté' };

    try {
      setSyncStatus('syncing');
      console.log('🔄 [UNIFIED-XP] Synchronisation forcée...');
      
      const freshData = await unifiedXpSyncService.forceSyncUser(user.uid);
      
      if (freshData && freshData.gamification) {
        setGamificationData(freshData.gamification);
        setSyncStatus('synchronized');
        setLastUpdate(new Date());
        console.log('✅ [UNIFIED-XP] Synchronisation forcée réussie');
        return { success: true };
      } else {
        throw new Error('Données non récupérées');
      }
      
    } catch (error) {
      console.error('❌ [UNIFIED-XP] Erreur sync forcée:', error);
      setError(error.message);
      setSyncStatus('error');
      return { success: false, error: error.message };
    }
  }, [user?.uid]);

  // 📊 DONNÉES CALCULÉES ET FACILITATION
  const calculatedData = gamificationData ? {
    // Données de base
    totalXp: gamificationData.totalXp || 0,
    weeklyXp: gamificationData.weeklyXp || 0,
    monthlyXp: gamificationData.monthlyXp || 0,
    level: gamificationData.level || 1,
    
    // Statistiques
    tasksCompleted: gamificationData.tasksCompleted || 0,
    tasksCreated: gamificationData.tasksCreated || 0,
    projectsCompleted: gamificationData.projectsCompleted || 0,
    projectsCreated: gamificationData.projectsCreated || 0,
    
    // Badges et récompenses
    badges: gamificationData.badges || [],
    badgesUnlocked: gamificationData.badgesUnlocked || 0,
    badgeCount: (gamificationData.badges || []).length,
    
    // Progression
    loginStreak: gamificationData.loginStreak || 1,
    currentStreak: gamificationData.currentStreak || 0,
    maxStreak: gamificationData.maxStreak || 0,
    
    // Calculs de niveau
    currentLevelXp: ((gamificationData.level || 1) - 1) * 100,
    nextLevelXp: (gamificationData.level || 1) * 100,
    xpToNextLevel: getXPProgress(gamificationData.totalXp || 0).xpToNextLevel,
    levelProgress: getXPProgress(gamificationData.totalXp || 0).progressPercent,
    
    // Historiques
    xpHistory: gamificationData.xpHistory || [],
    levelHistory: gamificationData.levelHistory || [],
    
    // Métadonnées
    lastActivityAt: gamificationData.lastActivityAt,
    
    // Calculs avancés pour Analytics
    get weeklyAverage() {
      return Math.round((this.weeklyXp || 0) / 7);
    },
    
    get monthlyAverage() {
      return Math.round((this.monthlyXp || 0) / 30);
    },
    
    get completionRate() {
      const total = this.tasksCreated || 0;
      return total > 0 ? Math.round(((this.tasksCompleted || 0) / total) * 100) : 0;
    },
    
    get productivityScore() {
      // Score sur 100 basé sur XP et tâches
      const xpScore = Math.min(50, (this.totalXp || 0) / 20); // 50 points max pour XP
      const taskScore = Math.min(30, (this.tasksCompleted || 0) * 2); // 30 points max pour tâches
      const streakScore = Math.min(20, (this.loginStreak || 0) * 2); // 20 points max pour streak
      return Math.round(xpScore + taskScore + streakScore);
    }
  } : null;

  // 🎁 ACTIONS RAPIDES POUR LES ÉVÉNEMENTS COMMUNS
  const quickActions = {
    // Actions prédéfinies avec XP
    completeTask: (difficulty = 'medium', taskTitle = '') => {
      const xpAmounts = { easy: 10, medium: 20, hard: 35 };
      return addXP(xpAmounts[difficulty] || 20, 'task_completion', {
        difficulty,
        taskTitle
      });
    },
    
    createTask: (taskTitle = '') => {
      return addXP(5, 'task_creation', { taskTitle });
    },
    
    createProject: (projectName = '') => {
      return addXP(25, 'project_creation', { projectName });
    },
    
    completeProject: (projectName = '') => {
      return addXP(50, 'project_completion', { projectName });
    },
    
    dailyLogin: () => {
      return addXP(5, 'daily_login', { date: new Date().toISOString() });
    },
    
    streakBonus: (streakDays) => {
      return addXP(streakDays * 2, 'streak_bonus', { streakDays });
    },
    
    profileUpdate: () => {
      return addXP(10, 'profile_update');
    },
    
    integrationComplete: (tasksCount = 78) => {
      return addXP(590, 'integration_complete', { tasksCount });
    }
  };

  return {
    // === DONNÉES PRINCIPALES ===
    gamificationData: calculatedData,
    rawData: gamificationData, // Données brutes si besoin
    
    // === DONNÉES RAPIDES (compatibilité) ===
    level: calculatedData?.level || 1,
    totalXp: calculatedData?.totalXp || 0,
    weeklyXp: calculatedData?.weeklyXp || 0,
    monthlyXp: calculatedData?.monthlyXp || 0,
    tasksCompleted: calculatedData?.tasksCompleted || 0,
    badges: calculatedData?.badges || [],
    badgeCount: calculatedData?.badgeCount || 0,
    loginStreak: calculatedData?.loginStreak || 1,
    levelProgress: calculatedData?.levelProgress || 0,
    xpToNextLevel: calculatedData?.xpToNextLevel || 100,
    
    // === DONNÉES CALCULÉES ===
    stats: calculatedData ? {
      weeklyAverage: calculatedData.weeklyAverage,
      monthlyAverage: calculatedData.monthlyAverage,
      completionRate: calculatedData.completionRate,
      productivityScore: calculatedData.productivityScore
    } : null,
    
    // === ÉTATS ===
    loading,
    error,
    isReady: !loading && !error && !!calculatedData,
    syncStatus,
    lastUpdate,
    
    // === ACTIONS ===
    addXP,
    forceSync,
    quickActions,
    
    // === DIAGNOSTIC ===
    diagnostics: {
      userId: user?.uid,
      isAuthenticated,
      hasData: !!gamificationData,
      cacheStatus: syncStatus,
      lastSync: lastUpdate?.toISOString()
    }
  };
};

// Export par défaut
export default useUnifiedXP;
