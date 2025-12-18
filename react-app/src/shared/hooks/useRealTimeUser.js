// src/shared/hooks/useRealTimeUser.js
// Hook utilisateur temps réel avec fonctions de mise à jour
import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../stores/authStore.js';
import { calculateLevel } from '../../core/services/levelService.js';

// Hook principal pour les données utilisateur en temps réel
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
          displayName: authData.displayName || authData.email?.split('@')[0] || 'Utilisateur',
          bio: '',
          department: '',
          preferences: {
            notifications: true,
            publicProfile: false,
            emailUpdates: true
          }
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

  // ✅ CORRIGÉ: Fonction updateUserData avec gestion d'erreurs
  const updateUserData = async (updates) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('🔄 Mise à jour données utilisateur:', updates);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Données utilisateur mises à jour avec succès');
      return { success: true };
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
        const newLevel = calculateLevel(newTotalXP); // Système calibré
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

// Hook pour les statistiques utilisateur
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
    
    return {
      current: progressXP,
      needed: 100, // 100 XP par niveau
      percentage: Math.round((progressXP / 100) * 100),
      totalXP,
      level: currentLevel,
      remaining: Math.max(0, neededXP)
    };
  };

  const getBadges = () => {
    return userData?.gamification?.badges || [];
  };

  const getTaskStats = () => {
    const gamification = userData?.gamification || {};
    return {
      completed: gamification.tasksCompleted || 0,
      created: gamification.tasksCreated || 0,
      completionRate: gamification.tasksCreated > 0 
        ? Math.round((gamification.tasksCompleted / gamification.tasksCreated) * 100)
        : 0
    };
  };

  return {
    getXPProgress,
    getBadges,
    getTaskStats,
    userData: userData?.gamification
  };
};
