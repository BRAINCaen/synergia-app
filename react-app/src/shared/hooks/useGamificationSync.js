// ==========================================
// 📁 react-app/src/shared/hooks/useGamificationSync.js
// HOOK CENTRAL GAMIFICATION - SOURCE UNIQUE DE VÉRITÉ
// Synchronise XP, Badges, Récompenses, Achievements sur TOUTES LES PAGES
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { 
  collection, query, where, orderBy, onSnapshot, 
  doc, getDoc, getDocs, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 🎮 HOOK CENTRAL GAMIFICATION
 * À utiliser dans TOUTES les pages qui affichent des données de gamification
 * 
 * @returns {Object} Toutes les données de gamification synchronisées en temps réel
 */
export const useGamificationSync = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // États centralisés
  const [gamificationData, setGamificationData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [rewardRequests, setRewardRequests] = useState([]);
  const [userRewardHistory, setUserRewardHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Références pour cleanup
  const unsubscribers = useRef([]);
  const isInitialized = useRef(false);

  // 🔥 INITIALISATION ET SYNCHRONISATION TEMPS RÉEL
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      cleanup();
      setGamificationData(null);
      setLoading(false);
      return;
    }

    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('🎮 [GAMIFICATION-SYNC] Initialisation pour:', user.uid);
    setLoading(true);

    initializeAllData();

    return () => cleanup();
  }, [isAuthenticated, user?.uid]);

  // 🚀 INITIALISER TOUTES LES DONNÉES
  const initializeAllData = async () => {
    try {
      // 1️⃣ ÉCOUTE TEMPS RÉEL DES DONNÉES UTILISATEUR
      const userRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const gamification = userData.gamification || {};

          // Calculer les données dérivées
          const totalXP = gamification.totalXp || 0;
          const level = Math.floor(totalXP / 100) + 1;
          const currentLevelXP = (level - 1) * 100;
          const nextLevelXP = level * 100;
          const progressXP = totalXP - currentLevelXP;
          const progressPercent = (progressXP / 100) * 100;

          const enrichedData = {
            // XP et Niveau
            totalXp: totalXP,
            level: level,
            currentLevelXP,
            nextLevelXP,
            progressXP,
            progressPercent: Math.round(progressPercent),
            xpToNextLevel: nextLevelXP - totalXP,

            // Activité
            weeklyXp: gamification.weeklyXp || 0,
            monthlyXp: gamification.monthlyXp || 0,
            tasksCompleted: gamification.tasksCompleted || 0,
            tasksCreated: gamification.tasksCreated || 0,
            projectsCreated: gamification.projectsCreated || 0,
            projectsCompleted: gamification.projectsCompleted || 0,

            // Engagement
            loginStreak: gamification.loginStreak || 0,
            consecutiveDays: gamification.consecutiveDays || 0,
            lastLoginDate: gamification.lastLoginDate,

            // Badges
            badges: gamification.badges || [],
            badgeCount: (gamification.badges || []).length,
            badgesUnlocked: gamification.badgesUnlocked || 0,

            // Statistiques
            completionRate: gamification.completionRate || 0,
            averageTaskXp: gamification.averageTaskXp || 0,
            productivity: gamification.productivity || 'normal',

            // Historiques
            xpHistory: gamification.xpHistory || [],
            levelHistory: gamification.levelHistory || [],

            // Métadonnées
            lastActivityAt: gamification.lastActivityAt,
            createdAt: gamification.createdAt,
            updatedAt: gamification.updatedAt
          };

          setGamificationData(enrichedData);
          console.log('✅ [GAMIFICATION-SYNC] Données utilisateur mises à jour:', {
            xp: totalXP,
            level,
            badges: enrichedData.badgeCount
          });
        }
      }, (err) => {
        console.error('❌ [GAMIFICATION-SYNC] Erreur écoute utilisateur:', err);
        setError(err.message);
      });

      unsubscribers.current.push(unsubUser);

      // 2️⃣ ÉCOUTE TEMPS RÉEL DES RÉCOMPENSES
      const rewardsRef = collection(db, 'rewards');
      const unsubRewards = onSnapshot(rewardsRef, (snapshot) => {
        const rewardsData = [];
        snapshot.forEach((doc) => {
          rewardsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setRewards(rewardsData);
        console.log('✅ [GAMIFICATION-SYNC] Récompenses:', rewardsData.length);
      });

      unsubscribers.current.push(unsubRewards);

      // 3️⃣ ÉCOUTE TEMPS RÉEL DES DEMANDES DE RÉCOMPENSES DE L'UTILISATEUR
      const userRequestsQuery = query(
        collection(db, 'rewardRequests'),
        where('userId', '==', user.uid),
        orderBy('requestedAt', 'desc')
      );

      const unsubUserRequests = onSnapshot(userRequestsQuery, (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setUserRewardHistory(requests);
        console.log('✅ [GAMIFICATION-SYNC] Historique récompenses:', requests.length);
      });

      unsubscribers.current.push(unsubUserRequests);

      // 4️⃣ ÉCOUTE TEMPS RÉEL DES DEMANDES EN ATTENTE (pour admins)
      const pendingRequestsQuery = query(
        collection(db, 'rewardRequests'),
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'desc')
      );

      const unsubPending = onSnapshot(pendingRequestsQuery, (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setRewardRequests(requests);
      });

      unsubscribers.current.push(unsubPending);

      // 5️⃣ CHARGER LE LEADERBOARD (1 fois, puis refresh manuel)
      await loadLeaderboard();

      setLoading(false);

    } catch (err) {
      console.error('❌ [GAMIFICATION-SYNC] Erreur initialisation:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // 🏆 CHARGER LE LEADERBOARD
  const loadLeaderboard = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      const users = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const gamification = data.gamification || {};
        
        users.push({
          id: doc.id,
          displayName: data.displayName || data.email || 'Utilisateur',
          photoURL: data.photoURL,
          email: data.email,
          totalXp: gamification.totalXp || 0,
          level: Math.floor((gamification.totalXp || 0) / 100) + 1,
          badges: (gamification.badges || []).length,
          tasksCompleted: gamification.tasksCompleted || 0
        });
      });

      // Trier par XP décroissant
      users.sort((a, b) => b.totalXp - a.totalXp);
      setLeaderboard(users);

      console.log('✅ [GAMIFICATION-SYNC] Leaderboard:', users.length, 'utilisateurs');
    } catch (err) {
      console.error('❌ [GAMIFICATION-SYNC] Erreur leaderboard:', err);
    }
  };

  // 🧹 CLEANUP
  const cleanup = () => {
    unsubscribers.current.forEach(unsub => {
      if (typeof unsub === 'function') {
        unsub();
      }
    });
    unsubscribers.current = [];
    isInitialized.current = false;
    setGamificationData(null);
    setRewards([]);
    setRewardRequests([]);
    setUserRewardHistory([]);
    setLeaderboard([]);
  };

  // 🔄 RAFRAÎCHIR MANUELLEMENT
  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    
    console.log('🔄 [GAMIFICATION-SYNC] Rafraîchissement manuel...');
    await loadLeaderboard();
  }, [user?.uid]);

  // 📊 HELPERS UTILES
  const canAffordReward = useCallback((xpCost) => {
    return gamificationData && gamificationData.totalXp >= xpCost;
  }, [gamificationData]);

  const getNextAffordableReward = useCallback(() => {
    if (!gamificationData || !rewards.length) return null;

    const affordableRewards = rewards
      .filter(r => r.xpCost > gamificationData.totalXp)
      .sort((a, b) => a.xpCost - b.xpCost);

    return affordableRewards[0] || null;
  }, [gamificationData, rewards]);

  const getAffordableRewards = useCallback(() => {
    if (!gamificationData || !rewards.length) return [];

    return rewards
      .filter(r => r.xpCost <= gamificationData.totalXp)
      .sort((a, b) => b.xpCost - a.xpCost);
  }, [gamificationData, rewards]);

  const getUserRank = useCallback(() => {
    if (!user?.uid || !leaderboard.length) return null;

    const index = leaderboard.findIndex(u => u.id === user.uid);
    return index >= 0 ? index + 1 : null;
  }, [user?.uid, leaderboard]);

  // 📈 STATISTIQUES COMPLÈTES
  const stats = {
    // XP
    totalXp: gamificationData?.totalXp || 0,
    weeklyXp: gamificationData?.weeklyXp || 0,
    monthlyXp: gamificationData?.monthlyXp || 0,
    
    // Niveau
    level: gamificationData?.level || 1,
    progressPercent: gamificationData?.progressPercent || 0,
    xpToNextLevel: gamificationData?.xpToNextLevel || 100,
    
    // Activité
    tasksCompleted: gamificationData?.tasksCompleted || 0,
    tasksCreated: gamificationData?.tasksCreated || 0,
    projectsCreated: gamificationData?.projectsCreated || 0,
    completionRate: gamificationData?.completionRate || 0,
    
    // Engagement
    loginStreak: gamificationData?.loginStreak || 0,
    badgeCount: gamificationData?.badgeCount || 0,
    
    // Récompenses
    rewardsAvailable: rewards.length,
    rewardsAffordable: getAffordableRewards().length,
    rewardsPending: userRewardHistory.filter(r => r.status === 'pending').length,
    rewardsApproved: userRewardHistory.filter(r => r.status === 'approved').length,
    
    // Classement
    userRank: getUserRank(),
    totalUsers: leaderboard.length
  };

  return {
    // ===== DONNÉES PRINCIPALES =====
    gamification: gamificationData,
    rewards,
    rewardRequests,
    userRewardHistory,
    leaderboard,
    
    // ===== STATISTIQUES =====
    stats,
    
    // ===== ÉTATS =====
    loading,
    error,
    isReady: !loading && gamificationData !== null,
    isAuthenticated,
    
    // ===== HELPERS =====
    canAffordReward,
    getNextAffordableReward,
    getAffordableRewards,
    getUserRank,
    refresh,
    
    // ===== ACCÈS RAPIDE (pour compatibilité) =====
    totalXp: gamificationData?.totalXp || 0,
    level: gamificationData?.level || 1,
    badges: gamificationData?.badges || [],
    badgeCount: gamificationData?.badgeCount || 0,
    weeklyXp: gamificationData?.weeklyXp || 0,
    monthlyXp: gamificationData?.monthlyXp || 0,
    tasksCompleted: gamificationData?.tasksCompleted || 0,
    loginStreak: gamificationData?.loginStreak || 0
  };
};

export default useGamificationSync;
