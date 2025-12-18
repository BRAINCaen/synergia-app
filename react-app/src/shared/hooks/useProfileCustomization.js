// ==========================================
// react-app/src/shared/hooks/useProfileCustomization.js
// HOOK PERSONNALISATION PROFIL - SYNERGIA v4.0
// Module 13: Avatars, Titres, Bannieres
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import {
  profileCustomizationService,
  UNLOCKABLE_AVATARS,
  UNLOCKABLE_TITLES,
  UNLOCKABLE_BANNERS
} from '../../core/services/profileCustomizationService.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { calculateLevel } from '../../core/services/levelService.js';

export const useProfileCustomization = (options = {}) => {
  const {
    autoInit = true,
    realTimeUpdates = true
  } = options;

  const { user } = useAuthStore();

  // Etats
  const [userStats, setUserStats] = useState({
    level: 1,
    totalXp: 0,
    tasksCompleted: 0,
    badgesCount: 0,
    streak: 0,
    teamContributions: 0,
    teamChallengesCompleted: 0,
    completionRate: 0,
    poolContributions: 0
  });

  const [customization, setCustomization] = useState({
    selectedAvatar: 'default_purple',
    selectedTitle: 'member',
    selectedBanner: 'default'
  });

  const [avatars, setAvatars] = useState([]);
  const [titles, setTitles] = useState([]);
  const [banners, setBanners] = useState([]);
  const [unlockStats, setUnlockStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Charger les stats utilisateur depuis Firebase
  const loadUserStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);

      return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const gamification = data.gamification || {};

          const totalXp = gamification.totalXp || 0;
          const level = calculateLevel(totalXp);

          const stats = {
            level,
            totalXp,
            tasksCompleted: gamification.tasksCompleted || 0,
            badgesCount: (gamification.badges || []).length,
            streak: gamification.loginStreak || 0,
            teamContributions: gamification.teamContributions || 0,
            teamChallengesCompleted: gamification.teamChallengesCompleted || 0,
            completionRate: gamification.completionRate || 0,
            poolContributions: gamification.poolContributions || 0
          };

          setUserStats(stats);

          // Mettre a jour les elements avec leur statut
          setAvatars(profileCustomizationService.getAvatarsWithStatus(stats));
          setTitles(profileCustomizationService.getTitlesWithStatus(stats));
          setBanners(profileCustomizationService.getBannersWithStatus(stats));
          setUnlockStats(profileCustomizationService.getUnlockStats(stats));

          // Recuperer la personnalisation actuelle
          setCustomization({
            selectedAvatar: data.customization?.selectedAvatar || 'default_purple',
            selectedTitle: data.customization?.selectedTitle || 'member',
            selectedBanner: data.customization?.selectedBanner || 'default'
          });
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user?.uid]);

  // Initialisation
  useEffect(() => {
    if (!autoInit || !user?.uid) return;

    let unsubscribe;

    const init = async () => {
      setLoading(true);
      unsubscribe = await loadUserStats();
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [autoInit, user?.uid, loadUserStats]);

  // Selectionner un avatar
  const selectAvatar = useCallback(async (avatarId) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };

    setUpdating(true);
    try {
      const result = await profileCustomizationService.updateSelectedAvatar(
        user.uid,
        avatarId,
        userStats
      );

      if (result.success) {
        setCustomization(prev => ({ ...prev, selectedAvatar: avatarId }));
      }

      return result;
    } catch (err) {
      console.error('Erreur selection avatar:', err);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [user?.uid, userStats]);

  // Selectionner un titre
  const selectTitle = useCallback(async (titleId) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };

    setUpdating(true);
    try {
      const result = await profileCustomizationService.updateSelectedTitle(
        user.uid,
        titleId,
        userStats
      );

      if (result.success) {
        setCustomization(prev => ({ ...prev, selectedTitle: titleId }));
      }

      return result;
    } catch (err) {
      console.error('Erreur selection titre:', err);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [user?.uid, userStats]);

  // Selectionner une banniere
  const selectBanner = useCallback(async (bannerId) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };

    setUpdating(true);
    try {
      const result = await profileCustomizationService.updateSelectedBanner(
        user.uid,
        bannerId,
        userStats
      );

      if (result.success) {
        setCustomization(prev => ({ ...prev, selectedBanner: bannerId }));
      }

      return result;
    } catch (err) {
      console.error('Erreur selection banniere:', err);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [user?.uid, userStats]);

  // Obtenir l'avatar actuel avec ses details
  const getCurrentAvatar = useCallback(() => {
    return UNLOCKABLE_AVATARS[customization.selectedAvatar] || UNLOCKABLE_AVATARS.default_purple;
  }, [customization.selectedAvatar]);

  // Obtenir le titre actuel avec ses details
  const getCurrentTitle = useCallback(() => {
    return UNLOCKABLE_TITLES[customization.selectedTitle] || UNLOCKABLE_TITLES.member;
  }, [customization.selectedTitle]);

  // Obtenir la banniere actuelle avec ses details
  const getCurrentBanner = useCallback(() => {
    return UNLOCKABLE_BANNERS[customization.selectedBanner] || UNLOCKABLE_BANNERS.default;
  }, [customization.selectedBanner]);

  // Grouper les avatars par categorie
  const getAvatarsByCategory = useCallback(() => {
    const categories = {
      base: { label: 'De base', items: [] },
      level: { label: 'Par niveau', items: [] },
      xp: { label: 'Par XP', items: [] },
      tasks: { label: 'Par taches', items: [] },
      badges: { label: 'Par badges', items: [] },
      special: { label: 'Speciaux', items: [] }
    };

    avatars.forEach(avatar => {
      if (categories[avatar.category]) {
        categories[avatar.category].items.push(avatar);
      }
    });

    return categories;
  }, [avatars]);

  // Grouper les titres par categorie
  const getTitlesByCategory = useCallback(() => {
    const categories = {
      base: { label: 'De base', items: [] },
      level: { label: 'Par niveau', items: [] },
      special: { label: 'Speciaux', items: [] }
    };

    titles.forEach(title => {
      if (categories[title.category]) {
        categories[title.category].items.push(title);
      }
    });

    return categories;
  }, [titles]);

  // Grouper les bannieres par categorie
  const getBannersByCategory = useCallback(() => {
    const categories = {
      base: { label: 'De base', items: [] },
      level: { label: 'Par niveau', items: [] },
      special: { label: 'Speciales', items: [] }
    };

    banners.forEach(banner => {
      if (categories[banner.category]) {
        categories[banner.category].items.push(banner);
      }
    });

    return categories;
  }, [banners]);

  // Rafraichir
  const refresh = useCallback(async () => {
    setLoading(true);
    await loadUserStats();
  }, [loadUserStats]);

  return {
    // Donnees
    userStats,
    customization,
    avatars,
    titles,
    banners,
    unlockStats,

    // Getters
    getCurrentAvatar,
    getCurrentTitle,
    getCurrentBanner,
    getAvatarsByCategory,
    getTitlesByCategory,
    getBannersByCategory,

    // Etats
    loading,
    updating,
    error,

    // Actions
    selectAvatar,
    selectTitle,
    selectBanner,
    refresh,

    // Constantes
    UNLOCKABLE_AVATARS,
    UNLOCKABLE_TITLES,
    UNLOCKABLE_BANNERS
  };
};

export default useProfileCustomization;
