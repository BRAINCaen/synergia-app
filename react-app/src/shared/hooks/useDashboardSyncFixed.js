// ==========================================
// 📁 react-app/src/shared/hooks/useDashboardSyncFixed.js
// HOOK DASHBOARD AVEC SYNCHRONISATION XP CORRIGÉE
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../stores/authStore.js';
import { xpDashboardSyncFix } from '../../core/services/xpDashboardSyncFix.js';

/**
 * 🔄 HOOK DASHBOARD AVEC SYNCHRONISATION XP GARANTIE
 * Corrige le problème des XP qui n'apparaissent pas après validation d'intégration
 */
export const useDashboardSyncFixed = () => {
  const { user } = useAuthStore();
  
  // États
  const [dashboardData, setDashboardData] = useState({
    topUsers: [],
    userRank: null,
    teamStats: {},
    recentActivities: [],
    userProgress: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  
  const unsubscribesRef = useRef([]);
  const userDataRef = useRef(null);

  /**
   * 🔄 FORCER LA SYNCHRONISATION XP
   */
  const forceSyncUserData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setSyncStatus('syncing');
      console.log('🔄 [DASHBOARD] Synchronisation forcée XP...');
      
      // Utiliser le service de synchronisation
      const result = await xpDashboardSyncFix.forceUserDataSync(user.uid);
      
      if (result.success) {
        console.log('✅ [DASHBOARD] Synchronisation réussie:', result.gamification);
        setSyncStatus('success');
        
        // Forcer la mise à jour des données
        setLastUpdate(new Date());
      }
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur sync forcée:', error);
      setSyncStatus('error');
      setError(error.message);
    }
  }, [user?.uid]);

  /**
   * 📡 ÉCOUTE TEMPS RÉEL DE L'UTILISATEUR AVEC SYNC AUTO
   */
  const setupUserListener = useCallback(() => {
    if (!user?.uid) return;

    console.log('📡 [DASHBOARD] Configuration listener utilisateur:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribeUser = onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const currentGamification = userData.gamification || {};
        
        console.log('📊 [DASHBOARD] Données utilisateur reçues:', {
          level: currentGamification.level,
          totalXp: currentGamification.totalXp,
          tasksCompleted: currentGamification.tasksCompleted
        });

        // Vérifier si les données semblent incohérentes
        const hasInconsistentData = (
          !currentGamification.totalXp && 
          !currentGamification.level &&
          userData.syncMetadata?.integrationCompleted
        );

        if (hasInconsistentData) {
          console.log('🔧 [DASHBOARD] Données incohérentes détectées, synchronisation...');
          await forceSyncUserData();
          return;
        }

        // Mettre à jour les données utilisateur
        const userProgress = {
          level: currentGamification.level || 1,
          totalXp: currentGamification.totalXp || 0,
          weeklyXp: currentGamification.weeklyXp || 0,
          monthlyXp: currentGamification.monthlyXp || 0,
          tasksCompleted: currentGamification.tasksCompleted || 0,
          badges: (currentGamification.badges || []).length,
          xpHistory: currentGamification.xpHistory || [],
          levelHistory: currentGamification.levelHistory || [],
          lastActivityAt: currentGamification.lastActivityAt
        };

        setDashboardData(prev => ({
          ...prev,
          userProgress
        }));
        
        userDataRef.current = userProgress;
        setLastUpdate(new Date());
        setSyncStatus('synced');
      }
    }, (error) => {
      console.error('❌ [DASHBOARD] Erreur listener utilisateur:', error);
      setError(error.message);
      setSyncStatus('error');
    });

    unsubscribesRef.current.push(unsubscribeUser);
  }, [user?.uid, forceSyncUserData]);

  /**
   * 📡 ÉCOUTE TEMPS RÉEL DU LEADERBOARD
   */
  const setupLeaderboardListener = useCallback(() => {
    if (!user?.uid) return;

    console.log('📡 [DASHBOARD] Configuration listener leaderboard...');

    const topUsersQuery = query(
      collection(db, 'users'),
      orderBy('gamification.totalXp', 'desc'),
      limit(10)
    );

    const unsubscribeTopUsers = onSnapshot(topUsersQuery, (snapshot) => {
      const topUsers = [];
      
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        if (userData.gamification && userData.gamification.totalXp > 0) {
          topUsers.push({
            uid: doc.id,
            rank: index + 1,
            displayName: userData.displayName || userData.profile?.displayName || userData.email?.split('@')[0] || 'Utilisateur',
            photoURL: userData.photoURL,
            department: userData.profile?.department || 'Non défini',
            level: userData.gamification.level || 1,
            totalXp: userData.gamification.totalXp || 0,
            weeklyXp: userData.gamification.weeklyXp || 0,
            monthlyXp: userData.gamification.monthlyXp || 0,
            tasksCompleted: userData.gamification.tasksCompleted || 0,
            badges: (userData.gamification.badges || []).length,
            loginStreak: userData.gamification.loginStreak || 0
          });
        }
      });

      console.log(`📊 [DASHBOARD] Top users mis à jour: ${topUsers.length} utilisateurs`);
      
      // Trouver le rang de l'utilisateur actuel
      const currentUserRank = topUsers.findIndex(u => u.uid === user.uid) + 1;
      
      setDashboardData(prev => ({
        ...prev,
        topUsers,
        userRank: currentUserRank || null
      }));
      
      setLastUpdate(new Date());
    }, (error) => {
      console.error('❌ [DASHBOARD] Erreur listener leaderboard:', error);
      setError(error.message);
    });

    unsubscribesRef.current.push(unsubscribeTopUsers);
  }, [user?.uid]);

  /**
   * 📊 CHARGER LES STATISTIQUES D'ÉQUIPE
   */
  const loadTeamStats = useCallback(async () => {
    try {
      console.log('📊 [DASHBOARD] Chargement statistiques équipe...');
      
      const allUsersQuery = query(collection(db, 'users'));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      let totalUsers = 0;
      let totalXp = 0;
      let totalTasks = 0;
      let activeBadges = 0;
      let activeUsers = 0;
      
      allUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        totalUsers++;
        
        const userXp = userData.gamification?.totalXp || 0;
        const userTasks = userData.gamification?.tasksCompleted || 0;
        const userBadges = (userData.gamification?.badges || []).length;
        
        totalXp += userXp;
        totalTasks += userTasks;
        activeBadges += userBadges;
        
        // Considérer comme actif si a des XP ou des tâches
        if (userXp > 0 || userTasks > 0) {
          activeUsers++;
        }
      });

      const teamStats = {
        totalUsers,
        activeUsers,
        averageXp: totalUsers > 0 ? Math.round(totalXp / totalUsers) : 0,
        totalXp,
        totalTasks,
        activeBadges,
        averageTasks: totalUsers > 0 ? Math.round(totalTasks / totalUsers) : 0,
        averageBadges: totalUsers > 0 ? Math.round(activeBadges / totalUsers) : 0
      };

      console.log('📊 [DASHBOARD] Statistiques équipe:', teamStats);

      setDashboardData(prev => ({
        ...prev,
        teamStats
      }));
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur chargement stats équipe:', error);
    }
  }, []);

  /**
   * 📊 CHARGER LES ACTIVITÉS RÉCENTES
   */
  const loadRecentActivities = useCallback(async () => {
    try {
      console.log('📊 [DASHBOARD] Chargement activités récentes...');
      
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(recentUsersQuery);
      const recentActivities = [];
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        const updatedAt = userData.updatedAt?.toDate();
        
        if (updatedAt && updatedAt > oneDayAgo) {
          const xpHistory = userData.gamification?.xpHistory || [];
          const latestXp = xpHistory[xpHistory.length - 1];
          
          if (latestXp) {
            recentActivities.push({
              id: `${doc.id}-${latestXp.timestamp}`,
              userId: doc.id,
              displayName: userData.displayName || userData.profile?.displayName || 'Utilisateur',
              type: 'xp_gain',
              message: `+${latestXp.amount} XP`,
              source: latestXp.source || 'action',
              timestamp: new Date(latestXp.timestamp),
              amount: latestXp.amount
            });
          }
        }
      });

      // Trier par timestamp décroissant
      recentActivities.sort((a, b) => b.timestamp - a.timestamp);

      setDashboardData(prev => ({
        ...prev,
        recentActivities: recentActivities.slice(0, 10)
      }));
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur chargement activités:', error);
    }
  }, []);

  /**
   * 📡 ÉCOUTER LES ÉVÉNEMENTS DE SYNCHRONISATION
   */
  useEffect(() => {
    const handleSyncEvent = (event) => {
      if (event.detail.userId === user?.uid) {
        console.log('📢 [DASHBOARD] Événement de sync reçu:', event.detail);
        
        // Forcer la mise à jour des données
        setLastUpdate(new Date());
        setSyncStatus('synced');
      }
    };

    window.addEventListener('userDataSynced', handleSyncEvent);

    return () => {
      window.removeEventListener('userDataSynced', handleSyncEvent);
    };
  }, [user?.uid]);

  /**
   * 🚀 INITIALISATION COMPLÈTE
   */
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('🚀 [DASHBOARD] Initialisation dashboard pour:', user.uid);
    
    setLoading(true);
    setError(null);
    setSyncStatus('initializing');

    // Configurer la synchronisation temps réel
    xpDashboardSyncFix.setupRealtimeSync(user.uid);

    // Configurer tous les listeners
    setupUserListener();
    setupLeaderboardListener();
    
    // Charger les données statiques
    Promise.all([
      loadTeamStats(),
      loadRecentActivities()
    ]).then(() => {
      setLoading(false);
      setSyncStatus('ready');
    }).catch(error => {
      console.error('❌ [DASHBOARD] Erreur initialisation:', error);
      setError(error.message);
      setLoading(false);
      setSyncStatus('error');
    });

    // Cleanup function
    return () => {
      console.log('🧹 [DASHBOARD] Nettoyage listeners...');
      unsubscribesRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribesRef.current = [];
      
      // Nettoyer le service de sync
      xpDashboardSyncFix.cleanup(user.uid);
    };
  }, [user?.uid, setupUserListener, setupLeaderboardListener, loadTeamStats, loadRecentActivities]);

  /**
   * 🔄 FORCER LA SYNCHRONISATION COMPLÈTE
   */
  const forceSync = useCallback(async () => {
    console.log('🔄 [DASHBOARD] Synchronisation complète forcée...');
    
    setSyncStatus('syncing');
    
    try {
      // 1. Forcer la sync des données utilisateur
      await forceSyncUserData();
      
      // 2. Recharger toutes les données
      await Promise.all([
        loadTeamStats(),
        loadRecentActivities()
      ]);
      
      setSyncStatus('synced');
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur synchronisation forcée:', error);
      setSyncStatus('error');
      setError(error.message);
    }
  }, [forceSyncUserData, loadTeamStats, loadRecentActivities]);

  /**
   * 🔍 DIAGNOSTIC UTILISATEUR
   */
  const diagnoseUser = useCallback(async () => {
    if (!user?.uid) return null;
    
    return await xpDashboardSyncFix.diagnoseUserData(user.uid);
  }, [user?.uid]);

  return {
    // Données
    dashboardData,
    
    // États
    loading,
    error,
    lastUpdate,
    syncStatus,
    
    // Actions
    forceSync,
    forceSyncUserData,
    diagnoseUser,
    
    // Données spécifiques
    topUsers: dashboardData.topUsers,
    userProgress: dashboardData.userProgress,
    teamStats: dashboardData.teamStats,
    recentActivities: dashboardData.recentActivities,
    userRank: dashboardData.userRank
  };
};

export default useDashboardSyncFixed;
