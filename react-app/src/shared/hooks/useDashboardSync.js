// ==========================================
// 📁 react-app/src/shared/hooks/useDashboardSync.js
// HOOK SPÉCIALISÉ POUR SYNCHRONISATION DASHBOARD XP
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

/**
 * 🔄 HOOK SYNCHRONISATION DASHBOARD TEMPS RÉEL
 * Garantit que les XP utilisateurs sont toujours à jour sur le dashboard
 */
export const useDashboardSync = () => {
  const { user } = useAuthStore();
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
  
  const unsubscribesRef = useRef([]);

  /**
   * 📡 ÉCOUTE TEMPS RÉEL DU LEADERBOARD
   */
  const setupLeaderboardListener = useCallback(() => {
    if (!user?.uid) return;

    console.log('📡 [DASHBOARD] Configuration listener leaderboard...');

    // Query pour le top 10 des utilisateurs
    const topUsersQuery = query(
      collection(db, 'users'),
      orderBy('gamification.totalXp', 'desc'),
      limit(10)
    );

    const unsubscribeTopUsers = onSnapshot(topUsersQuery, (snapshot) => {
      const topUsers = [];
      
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        if (userData.gamification) {
          topUsers.push({
            uid: doc.id,
            rank: index + 1,
            displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
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
   * 📡 ÉCOUTE TEMPS RÉEL DE L'UTILISATEUR ACTUEL
   */
  const setupUserListener = useCallback(() => {
    if (!user?.uid) return;

    console.log('📡 [DASHBOARD] Configuration listener utilisateur:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        
        console.log('📊 [DASHBOARD] Données utilisateur mises à jour:', {
          level: userData.gamification?.level,
          totalXp: userData.gamification?.totalXp,
          tasksCompleted: userData.gamification?.tasksCompleted
        });

        const userProgress = {
          level: userData.gamification?.level || 1,
          totalXp: userData.gamification?.totalXp || 0,
          weeklyXp: userData.gamification?.weeklyXp || 0,
          monthlyXp: userData.gamification?.monthlyXp || 0,
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          badges: (userData.gamification?.badges || []).length,
          xpHistory: userData.gamification?.xpHistory || [],
          levelHistory: userData.gamification?.levelHistory || []
        };

        setDashboardData(prev => ({
          ...prev,
          userProgress
        }));
        
        setLastUpdate(new Date());
      }
    }, (error) => {
      console.error('❌ [DASHBOARD] Erreur listener utilisateur:', error);
      setError(error.message);
    });

    unsubscribesRef.current.push(unsubscribeUser);
  }, [user?.uid]);

  /**
   * 📊 CHARGER LES STATISTIQUES D'ÉQUIPE
   */
  const loadTeamStats = useCallback(async () => {
    try {
      console.log('📊 [DASHBOARD] Chargement statistiques équipe...');
      
      // Compter tous les utilisateurs
      const allUsersQuery = query(collection(db, 'users'));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      let totalUsers = 0;
      let totalXp = 0;
      let totalTasks = 0;
      let activeBadges = 0;
      
      allUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        totalUsers++;
        totalXp += userData.gamification?.totalXp || 0;
        totalTasks += userData.gamification?.tasksCompleted || 0;
        activeBadges += (userData.gamification?.badges || []).length;
      });

      const teamStats = {
        totalUsers,
        averageXp: totalUsers > 0 ? Math.round(totalXp / totalUsers) : 0,
        totalTasks,
        activeBadges,
        totalXp
      };

      console.log('✅ [DASHBOARD] Statistiques équipe calculées:', teamStats);

      setDashboardData(prev => ({
        ...prev,
        teamStats
      }));

    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur calcul statistiques équipe:', error);
    }
  }, []);

  /**
   * 📡 ÉCOUTE TEMPS RÉEL DES ACTIVITÉS
   */
  const setupActivitiesListener = useCallback(() => {
    console.log('📡 [DASHBOARD] Configuration listener activités...');

    // Query pour les activités récentes (basé sur les mises à jour utilisateurs)
    const recentUsersQuery = query(
      collection(db, 'users'),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );

    const unsubscribeActivities = onSnapshot(recentUsersQuery, (snapshot) => {
      const recentActivities = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        
        // 🛡️ GESTION SÉCURISÉE DES TIMESTAMPS FIREBASE
        let updatedAt;
        try {
          if (userData.updatedAt?.toDate) {
            updatedAt = userData.updatedAt.toDate();
          } else if (userData.updatedAt instanceof Date) {
            updatedAt = userData.updatedAt;
          } else if (typeof userData.updatedAt === 'string') {
            updatedAt = new Date(userData.updatedAt);
          } else {
            updatedAt = new Date(); // Fallback
          }
        } catch (error) {
          console.warn('⚠️ [DASHBOARD] Erreur timestamp:', error);
          updatedAt = new Date();
        }
        
        // Vérifier si c'est une activité récente (moins de 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        if (updatedAt > oneDayAgo) {
          // Analyser le type d'activité basé sur l'historique XP
          const xpHistory = userData.gamification?.xpHistory || [];
          const latestXp = xpHistory[xpHistory.length - 1];
          
          if (latestXp) {
            recentActivities.push({
              id: `${doc.id}-${latestXp.timestamp}`,
              userId: doc.id,
              displayName: userData.displayName || 'Utilisateur',
              type: 'xp_gain',
              message: `+${latestXp.amount} XP (${latestXp.source})`,
              timestamp: new Date(latestXp.timestamp),
              amount: latestXp.amount
            });
          }
        }
      });

      // Trier par timestamp décroissant
      recentActivities.sort((a, b) => b.timestamp - a.timestamp);

      console.log(`📊 [DASHBOARD] Activités récentes: ${recentActivities.length}`);

      setDashboardData(prev => ({
        ...prev,
        recentActivities: recentActivities.slice(0, 10)
      }));
      
    }, (error) => {
      console.error('❌ [DASHBOARD] Erreur listener activités:', error);
    });

    unsubscribesRef.current.push(unsubscribeActivities);
  }, []);

  /**
   * 🚀 INITIALISATION COMPLÈTE
   */
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('🚀 [DASHBOARD] Initialisation synchronisation dashboard pour:', user.uid);
    
    setLoading(true);
    setError(null);

    // Configurer tous les listeners
    setupLeaderboardListener();
    setupUserListener();
    setupActivitiesListener();
    
    // Charger les données statiques
    loadTeamStats();

    // Marquer comme chargé après un délai pour laisser les listeners s'initialiser
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Cleanup function
    return () => {
      console.log('🧹 [DASHBOARD] Nettoyage listeners...');
      unsubscribesRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribesRef.current = [];
    };
  }, [user?.uid, setupLeaderboardListener, setupUserListener, setupActivitiesListener, loadTeamStats]);

  /**
   * 🔄 FORCER LA SYNCHRONISATION
   */
  const forceSync = useCallback(async () => {
    console.log('🔄 [DASHBOARD] Synchronisation forcée...');
    await loadTeamStats();
  }, [loadTeamStats]);

  /**
   * 📊 CALCULER LE RANG DE L'UTILISATEUR
   */
  const calculateUserRank = useCallback(async () => {
    if (!user?.uid || !dashboardData.userProgress) return null;

    try {
      const userXp = dashboardData.userProgress.totalXp;
      
      // Compter les utilisateurs avec plus d'XP
      const higherXpQuery = query(
        collection(db, 'users'),
        where('gamification.totalXp', '>', userXp)
      );
      
      const snapshot = await getDocs(higherXpQuery);
      return snapshot.size + 1;
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur calcul rang:', error);
      return null;
    }
  }, [user?.uid, dashboardData.userProgress]);

  return {
    // Données
    dashboardData,
    
    // États
    loading,
    error,
    lastUpdate,
    
    // Actions
    forceSync,
    calculateUserRank,
    
    // Données spécifiques
    topUsers: dashboardData.topUsers,
    userProgress: dashboardData.userProgress,
    teamStats: dashboardData.teamStats,
    recentActivities: dashboardData.recentActivities,
    userRank: dashboardData.userRank
  };
};
