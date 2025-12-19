// ==========================================
// 📁 react-app/src/shared/hooks/useTeamGamificationSync.js
// SYNCHRONISATION XP DE TOUS LES MEMBRES DE L'ÉQUIPE
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { calculateLevel } from '../../core/services/levelService.js';

/**
 * 🎮 HOOK POUR SYNCHRONISER LES XP DE PLUSIEURS UTILISATEURS
 * À utiliser dans la page Team et Leaderboard
 * 
 * @param {string[]} userIds - Liste des IDs utilisateurs à synchroniser
 * @returns {Map} - Map<userId, gamificationData>
 */
export const useTeamGamificationSync = (userIds = []) => {
  const [usersGamification, setUsersGamification] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const listenersRef = useRef(new Map());
  const prevUserIdsRef = useRef('');

  useEffect(() => {
    // Éviter les recharges inutiles
    const currentUserIds = userIds.join(',');
    if (currentUserIds === prevUserIdsRef.current) {
      return;
    }
    prevUserIdsRef.current = currentUserIds;

    if (!userIds || userIds.length === 0) {
      cleanup();
      setLoading(false);
      return;
    }

    console.log(`🚀 [TEAM-GAMIF-SYNC] Démarrage sync pour ${userIds.length} utilisateurs`);
    setLoading(true);

    // Nettoyer les anciens listeners
    cleanup();

    // Créer un listener pour chaque utilisateur
    userIds.forEach(userId => {
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) return;

          const userData = snapshot.data();
          const gamification = userData.gamification || {};
          const totalXp = gamification.totalXp || 0;

          console.log(`🔄 [TEAM-GAMIF-SYNC] XP mis à jour pour ${userId}: ${totalXp} XP`);

          // Mettre à jour la Map avec le nouveau système de niveaux calibré
          setUsersGamification(prev => {
            const newMap = new Map(prev);
            newMap.set(userId, {
              totalXp: totalXp,
              level: calculateLevel(totalXp),
              weeklyXp: gamification.weeklyXp || 0,
              monthlyXp: gamification.monthlyXp || 0,
              badges: gamification.badges || [],
              badgeCount: (gamification.badges || []).length,
              tasksCompleted: gamification.tasksCompleted || 0,
              loginStreak: gamification.loginStreak || 0,
              lastUpdate: new Date()
            });
            return newMap;
          });
        },
        (error) => {
          console.error(`❌ [TEAM-GAMIF-SYNC] Erreur listener ${userId}:`, error);
        }
      );

      // Sauvegarder la fonction d'unsubscribe
      listenersRef.current.set(userId, unsubscribe);
    });

    setLoading(false);

    return () => cleanup();
  }, [userIds.join(',')]);

  // 🧹 CLEANUP
  const cleanup = () => {
    console.log(`🧹 [TEAM-GAMIF-SYNC] Nettoyage de ${listenersRef.current.size} listeners`);
    listenersRef.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    listenersRef.current.clear();
    setUsersGamification(new Map());
  };

  // 📊 HELPER : Obtenir les XP d'un utilisateur
  const getUserXp = (userId) => {
    return usersGamification.get(userId) || null;
  };

  return {
    usersGamification,
    getUserXp,
    loading,
    isReady: !loading && usersGamification.size > 0
  };
};

export default useTeamGamificationSync;
