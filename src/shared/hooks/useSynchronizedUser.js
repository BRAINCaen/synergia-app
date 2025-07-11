// ==========================================
// 📁 react-app/src/shared/hooks/useSynchronizedUser.js
// Hook de synchronisation automatique des données utilisateur
// ==========================================

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../stores/authStore.js';
import dataSyncService from '../../core/services/dataSyncService.js';

/**
 * 🔄 HOOK DE SYNCHRONISATION UTILISATEUR UNIFIÉE
 * Remplace tous les hooks existants pour garantir la cohérence
 */
export const useSynchronizedUser = () => {
  const { user: authUser } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  // ✅ SYNCHRONISATION AUTOMATIQUE À LA CONNEXION
  useEffect(() => {
    if (!authUser?.uid) {
      setUserData(null);
      setGamificationData(null);
      setProfileData(null);
      setLoading(false);
      return;
    }

    let unsubscribe = null;

    const initializeAndSync = async () => {
      try {
        setLoading(true);
        setSyncStatus('syncing');
        
        console.log('🔄 Initialisation synchronisation pour:', authUser.uid);
        
        // 1. Validation et réparation automatique
        const validation = await dataSyncService.validateUserSession(authUser.uid, authUser);
        
        if (validation.repaired) {
          console.log('✅ Données réparées automatiquement');
        }
        
        // 2. Écouter les changements en temps réel
        const userRef = doc(db, 'users', authUser.uid);
        
        unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            
            // Séparer les données par domaine
            setUserData(data);
            setGamificationData(data.gamification || {});
            setProfileData(data.profile || {});
            
            setSyncStatus('synchronized');
            console.log('📡 Données synchronisées:', {
              level: data.gamification?.level || 1,
              totalXp: data.gamification?.totalXp || 0,
              tasksCompleted: data.gamification?.tasksCompleted || 0
            });
          } else {
            console.warn('⚠️ Document utilisateur inexistant');
            setError('Document utilisateur non trouvé');
          }
          
          setLoading(false);
        }, (err) => {
          console.error('❌ Erreur synchronisation temps réel:', err);
          setError(err.message);
          setLoading(false);
          setSyncStatus('error');
        });
        
      } catch (err) {
        console.error('❌ Erreur initialisation sync:', err);
        setError(err.message);
        setLoading(false);
        setSyncStatus('error');
      }
    };

    initializeAndSync();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authUser?.uid]);

  // 🎯 CALCUL DU NIVEAU ET PROGRESSION
  const getXPProgress = () => {
    if (!gamificationData) {
      return {
        currentXP: 0,
        currentLevelXP: 0,
        nextLevelXP: 100,
        progressPercent: 0,
        totalXP: 0,
        level: 1,
        xpToNext: 100
      };
    }

    const level = gamificationData.level || 1;
    const totalXP = gamificationData.totalXp || 0;
    
    // Calcul basé sur 100 XP par niveau
    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    const progressXP = totalXP - currentLevelXP;
    const xpToNext = nextLevelXP - totalXP;
    const progressPercent = Math.min(100, Math.max(0, (progressXP / 100) * 100));

    return {
      currentXP: Math.max(0, progressXP),
      currentLevelXP,
      nextLevelXP,
      progressPercent: Math.round(progressPercent),
      totalXP,
      level,
      xpToNext: Math.max(0, xpToNext)
    };
  };

  // 🎖️ GESTION DES BADGES
  const getBadgesInfo = () => {
    const badges = gamificationData?.badges || [];
    return {
      badges,
      count: badges.length,
      recent: badges.slice(-3), // 3 badges les plus récents
      hasNewBadges: badges.some(badge => {
        const badgeDate = new Date(badge.unlockedAt || 0);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return badgeDate > oneDayAgo;
      })
    };
  };

  // 📊 STATISTIQUES COMPLÈTES
  const getCompleteStats = () => {
    if (!gamificationData) {
      return {
        tasksCompleted: 0,
        tasksCreated: 0,
        projectsCreated: 0,
        projectsCompleted: 0,
        loginStreak: 0,
        completionRate: 0,
        level: 1,
        totalXp: 0,
        badges: 0
      };
    }

    const tasksCompleted = gamificationData.tasksCompleted || 0;
    const tasksCreated = gamificationData.tasksCreated || 0;
    const completionRate = tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

    return {
      tasksCompleted,
      tasksCreated,
      projectsCreated: gamificationData.projectsCreated || 0,
      projectsCompleted: gamificationData.projectsCompleted || 0,
      loginStreak: gamificationData.loginStreak || 0,
      completionRate,
      level: gamificationData.level || 1,
      totalXp: gamificationData.totalXp || 0,
      badges: (gamificationData.badges || []).length
    };
  };

  // 👤 DONNÉES DE PROFIL
  const getProfileInfo = () => {
    return {
      displayName: profileData?.displayName || authUser?.displayName || 'Utilisateur',
      bio: profileData?.bio || '',
      department: profileData?.department || 'Non défini',
      role: profileData?.role || 'employee',
      preferences: profileData?.preferences || {},
      photoURL: authUser?.photoURL || null,
      email: authUser?.email || ''
    };
  };

  // 🔄 FORCER LA RE-SYNCHRONISATION
  const forceSync = async () => {
    if (!authUser?.uid) return;
    
    try {
      setSyncStatus('syncing');
      const result = await dataSyncService.repairUserData(authUser.uid, authUser);
      
      if (result.success) {
        console.log('✅ Re-synchronisation forcée réussie');
        setSyncStatus('synchronized');
      } else {
        console.error('❌ Échec re-synchronisation:', result.message);
        setSyncStatus('error');
      }
      
      return result;
    } catch (err) {
      console.error('❌ Erreur re-synchronisation:', err);
      setSyncStatus('error');
      return { success: false, message: err.message };
    }
  };

  // 📈 RECALCULER LES STATISTIQUES
  const recalculateStats = async () => {
    if (!authUser?.uid) return;
    
    try {
      const result = await dataSyncService.recalculateGamificationStats(authUser.uid);
      return result;
    } catch (err) {
      console.error('❌ Erreur recalcul stats:', err);
      return { success: false, message: err.message };
    }
  };

  return {
    // Données brutes
    userData,
    gamificationData,
    profileData,
    
    // États
    loading,
    error,
    syncStatus,
    isHealthy: syncStatus === 'synchronized',
    
    // Données calculées
    xpProgress: getXPProgress(),
    badges: getBadgesInfo(),
    stats: getCompleteStats(),
    profile: getProfileInfo(),
    
    // Actions
    forceSync,
    recalculateStats,
    
    // Utilitaires
    isDataReady: !loading && userData && syncStatus === 'synchronized'
  };
};

/**
 * 🎮 HOOK SPÉCIALISÉ POUR LA GAMIFICATION
 * Version simplifiée pour les composants qui n'ont besoin que des données de jeu
 */
export const useGamificationSync = () => {
  const { gamificationData, loading, xpProgress, badges, stats, isDataReady } = useSynchronizedUser();
  
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
    isReady: isDataReady
  };
};

/**
 * 👤 HOOK SPÉCIALISÉ POUR LE PROFIL
 * Version simplifiée pour les composants de profil
 */
export const useProfileSync = () => {
  const { profileData, profile, userData, loading, isDataReady, forceSync } = useSynchronizedUser();
  
  return {
    profile,
    displayName: profile.displayName,
    bio: profile.bio,
    department: profile.department,
    preferences: profile.preferences,
    photoURL: profile.photoURL,
    email: profile.email,
    createdAt: userData?.createdAt,
    lastLoginAt: userData?.lastLoginAt,
    loading,
    isReady: isDataReady,
    refresh: forceSync
  };
};

/**
 * 📊 HOOK POUR LES STATISTIQUES DE LEADERBOARD
 * Données optimisées pour les classements
 */
export const useLeaderboardSync = () => {
  const { gamificationData, profile, loading, isDataReady } = useSynchronizedUser();
  
  return {
    displayName: profile.displayName,
    department: profile.department,
    photoURL: profile.photoURL,
    level: gamificationData?.level || 1,
    totalXp: gamificationData?.totalXp || 0,
    tasksCompleted: gamificationData?.tasksCompleted || 0,
    badges: (gamificationData?.badges || []).length,
    loginStreak: gamificationData?.loginStreak || 0,
    loading,
    isReady: isDataReady
  };
};

export default useSynchronizedUser;
