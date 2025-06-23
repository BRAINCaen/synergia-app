// ===================================================================
// 👤 HOOK UTILISATEUR TEMPS RÉEL COMPLET
// Fichier: react-app/src/shared/hooks/useRealTimeUser.js
// ===================================================================

import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase.js'; // ✅ Chemin corrigé
import { useAuthStore } from '../stores/authStore.js';

export const useRealTimeUser = () => {
  const { user: authUser } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Créer un profil utilisateur par défaut
  const createDefaultProfile = async (userId, authData) => {
    try {
      const defaultProfile = {
        // Données de base depuis l'auth
        email: authData.email,
        displayName: authData.displayName || authData.email?.split('@')[0] || 'Utilisateur',
        photoURL: authData.photoURL || null,
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        
        // Profil utilisateur
        profile: {
          department: 'Non défini',
          role: 'employee',
          phone: '',
          bio: '',
          joinDate: new Date().toISOString().split('T')[0]
        },
        
        // Données de gamification
        gamification: {
          totalXp: 0,
          weeklyXp: 0,
          monthlyXp: 0,
          level: 1,
          badges: [],
          tasksCompleted: 0,
          tasksCreated: 0,
          projectsCreated: 0,
          loginStreak: 1,
          lastLoginDate: new Date().toISOString().split('T')[0],
          xpHistory: []
        },
        
        // Préférences
        preferences: {
          notifications: true,
          emailUpdates: true,
          theme: 'dark',
          language: 'fr'
        }
      };

      await setDoc(doc(db, 'users', userId), defaultProfile);
      console.log('✅ Profil utilisateur créé:', userId);
      return defaultProfile;
    } catch (error) {
      console.error('❌ Erreur création profil:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!authUser?.uid) {
      setUserData(null);
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};

    const initializeUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier si le profil existe
        const userRef = doc(db, 'users', authUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Créer le profil s'il n'existe pas
          console.log('🔄 Création profil pour:', authUser.displayName || authUser.email);
          await createDefaultProfile(authUser.uid, authUser);
        }

        // Écouter les changements en temps réel
        unsubscribe = onSnapshot(
          userRef,
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setUserData({
                uid: authUser.uid,
                ...data
              });
              console.log('📱 Données utilisateur mises à jour:', data.gamification?.totalXp || 0, 'XP');
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('❌ Erreur écoute données utilisateur:', err);
            setError(err.message);
            setLoading(false);
          }
        );

      } catch (err) {
        console.error('❌ Erreur initialisation utilisateur:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeUser();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authUser?.uid]);

  return { 
    userData, 
    loading, 
    error,
    isNewUser: userData && !userData.profile?.department 
  };
};

// Hook pour mettre à jour les données utilisateur
export const useUpdateUser = () => {
  const { user } = useAuthStore();

  const updateUserData = async (updates) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Données utilisateur mises à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      throw error;
    }
  };

  const updateGamification = async (gamificationUpdates) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Préparer les mises à jour avec la notation dot
      const updates = {};
      Object.keys(gamificationUpdates).forEach(key => {
        updates[`gamification.${key}`] = gamificationUpdates[key];
      });
      updates.updatedAt = serverTimestamp();

      await updateDoc(userRef, updates);
      console.log('✅ Gamification mise à jour:', gamificationUpdates);
    } catch (error) {
      console.error('❌ Erreur mise à jour gamification:', error);
      throw error;
    }
  };

  const addXP = async (xpAmount, source = 'unknown') => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const currentXP = currentData.gamification?.totalXp || 0;
        const currentWeeklyXP = currentData.gamification?.weeklyXp || 0;
        const currentMonthlyXP = currentData.gamification?.monthlyXp || 0;
        const currentTasksCompleted = currentData.gamification?.tasksCompleted || 0;
        
        const newTotalXP = currentXP + xpAmount;
        const newLevel = Math.floor(newTotalXP / 100) + 1; // 100 XP par niveau
        const leveledUp = newLevel > (currentData.gamification?.level || 1);
        
        const xpEntry = {
          amount: xpAmount,
          source,
          timestamp: new Date().toISOString(),
          totalAfter: newTotalXP
        };

        const currentHistory = currentData.gamification?.xpHistory || [];
        const newHistory = [...currentHistory.slice(-9), xpEntry]; // Garder 10 entrées

        await updateGamification({
          totalXp: newTotalXP,
          weeklyXp: currentWeeklyXP + xpAmount,
          monthlyXp: currentMonthlyXP + xpAmount,
          level: newLevel,
          xpHistory: newHistory,
          // Incrémenter tasksCompleted si c'est une completion de tâche
          ...(source.includes('task_complete') && {
            tasksCompleted: currentTasksCompleted + 1
          })
        });

        console.log(`🎯 +${xpAmount} XP ajouté (${source}) - Total: ${newTotalXP} XP`);
        return { newTotalXP, newLevel, leveledUp };
      }
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      throw error;
    }
  };

  return {
    updateUserData,
    updateGamification,
    addXP
  };
};

// ✅ Hook pour les statistiques utilisateur (MANQUANT DANS VOTRE FICHIER)
export const useUserStats = () => {
  const { userData } = useRealTimeUser();

  const getXPProgress = () => {
    if (!userData?.gamification) {
      return { 
        current: 0, 
        needed: 100, 
        percentage: 0,
        totalXP: 0,
        level: 1
      };
    }
    
    const currentLevel = userData.gamification.level || 1;
    const totalXP = userData.gamification.totalXp || 0;
    const currentLevelXP = (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * 100;
    const progressXP = totalXP - currentLevelXP;
    const neededXP = nextLevelXP - totalXP;
    const percentage = Math.min(100, (progressXP / 100) * 100);

    return {
      current: Math.max(0, progressXP),
      needed: Math.max(0, neededXP),
      percentage: Math.max(0, percentage),
      totalXP,
      level: currentLevel
    };
  };

  const getRecentActivity = () => {
    if (!userData?.gamification?.xpHistory) return [];
    
    return userData.gamification.xpHistory
      .slice(-5) // 5 dernières activités
      .reverse() // Plus récent en premier
      .map(entry => ({
        ...entry,
        timeAgo: getTimeAgo(entry.timestamp)
      }));
  };

  const getBadgeProgress = () => {
    const badges = userData?.gamification?.badges || [];
    const totalTasks = userData?.gamification?.tasksCompleted || 0;
    
    // Calculer la progression vers les prochains badges
    const nextBadges = [
      { name: 'Débutant', requirement: 5, type: 'tasks', current: totalTasks, icon: '🌱' },
      { name: 'Productif', requirement: 25, type: 'tasks', current: totalTasks, icon: '⚡' },
      { name: 'Expert', requirement: 50, type: 'tasks', current: totalTasks, icon: '🏆' },
      { name: 'Maître', requirement: 100, type: 'tasks', current: totalTasks, icon: '👑' }
    ].filter(badge => totalTasks < badge.requirement);

    return {
      earnedBadges: badges.length,
      nextBadge: nextBadges[0] || null,
      allBadges: badges
    };
  };

  return {
    getXPProgress,
    getRecentActivity,
    getBadgeProgress,
    userData
  };
};

// Utilitaire pour calculer le temps écoulé
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}m`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
};
