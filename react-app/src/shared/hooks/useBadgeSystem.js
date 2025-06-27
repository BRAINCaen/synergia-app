// ==========================================
// 📁 react-app/src/shared/hooks/useBadgeSystem.js
// HOOK D'INTÉGRATION DU SYSTÈME DE BADGES
// Connecte le moteur de badges avec l'interface utilisateur
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import badgeEngine from '../../core/services/badgeEngine.js';
import { useBadgeNotifications } from '../../components/gamification/BadgeNotification.jsx';

/**
 * 🎯 HOOK PRINCIPAL DU SYSTÈME DE BADGES
 * Gère la vérification, l'affichage et les notifications des badges
 */
export const useBadgeSystem = () => {
  const { user } = useAuthStore();
  const { showNotification } = useBadgeNotifications();
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [badgeStats, setBadgeStats] = useState(null);

  // Initialiser les statistiques des badges
  useEffect(() => {
    const stats = badgeEngine.getBadgeStats();
    setBadgeStats(stats);
  }, []);

  /**
   * 🔍 VÉRIFICATION MANUELLE DES BADGES
   */
  const checkBadges = useCallback(async (context = {}) => {
    if (!user?.uid || isChecking) return;

    try {
      setIsChecking(true);
      console.log('🎯 Vérification badges déclenchée par:', context.trigger || 'manual');

      const result = await badgeEngine.checkAndUnlockBadges(user.uid, context);
      
      // Afficher les notifications pour les nouveaux badges
      if (result.unlockedBadges && result.unlockedBadges.length > 0) {
        console.log('🎉 Nouveaux badges débloqués:', result.unlockedBadges.length);
        
        // Afficher les notifications une par une avec un délai
        result.unlockedBadges.forEach((badge, index) => {
          setTimeout(() => {
            showNotification(badge);
            
            // Jouer un son de notification (optionnel)
            playBadgeSound();
          }, index * 1000); // 1 seconde entre chaque notification
        });
      }

      setLastCheck(new Date());
      return result;

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { unlockedBadges: [], errors: [error.message] };
    } finally {
      setIsChecking(false);
    }
  }, [user?.uid, isChecking, showNotification]);

  /**
   * 🎵 JOUER UN SON DE NOTIFICATION
   */
  const playBadgeSound = () => {
    try {
      // Créer un son simple avec Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('🔇 Son de notification non disponible');
    }
  };

  /**
   * 🎯 DÉCLENCHEURS AUTOMATIQUES
   */
  
  // Connexion utilisateur
  const onLogin = useCallback(async () => {
    if (!user?.uid) return;
    
    console.log('👋 Utilisateur connecté - Vérification badges de connexion');
    return await checkBadges({ trigger: 'login' });
  }, [user?.uid, checkBadges]);

  // Tâche complétée
  const onTaskCompleted = useCallback(async (taskData = {}) => {
    if (!user?.uid) return;
    
    console.log('✅ Tâche complétée - Vérification badges de productivité');
    return await checkBadges({ 
      trigger: 'task_completed',
      taskData 
    });
  }, [user?.uid, checkBadges]);

  // Projet créé
  const onProjectCreated = useCallback(async (projectData = {}) => {
    if (!user?.uid) return;
    
    console.log('📁 Projet créé - Vérification badges de projet');
    return await checkBadges({ 
      trigger: 'project_created',
      projectData 
    });
  }, [user?.uid, checkBadges]);

  // XP gagné
  const onXPGained = useCallback(async (xpAmount, source = 'unknown') => {
    if (!user?.uid) return;
    
    console.log(`⭐ +${xpAmount} XP gagné (${source}) - Vérification badges XP`);
    return await checkBadges({ 
      trigger: 'xp_gained',
      xpAmount,
      source 
    });
  }, [user?.uid, checkBadges]);

  // Niveau monté
  const onLevelUp = useCallback(async (newLevel) => {
    if (!user?.uid) return;
    
    console.log(`🚀 Niveau ${newLevel} atteint - Vérification badges de niveau`);
    return await checkBadges({ 
      trigger: 'level_up',
      newLevel 
    });
  }, [user?.uid, checkBadges]);

  // Retour après absence
  const onComeback = useCallback(async () => {
    if (!user?.uid) return;
    
    console.log('🎪 Retour après absence - Vérification badge comeback');
    return await checkBadges({ trigger: 'comeback' });
  }, [user?.uid, checkBadges]);

  /**
   * 📊 OBTENIR LES DÉFINITIONS DES BADGES
   */
  const getAllBadges = useCallback(() => {
    return badgeEngine.getAllBadgeDefinitions();
  }, []);

  const getBadgesByCategory = useCallback((category) => {
    return badgeEngine.getBadgesByCategory(category);
  }, []);

  const getBadgeDefinition = useCallback((badgeId) => {
    return badgeEngine.getBadgeDefinition(badgeId);
  }, []);

  /**
   * 🎯 VÉRIFICATION AUTOMATIQUE À LA CONNEXION
   */
  useEffect(() => {
    if (user?.uid && !lastCheck) {
      // Vérifier les badges au montage du composant
      setTimeout(() => {
        onLogin();
      }, 2000); // Attendre 2 secondes après la connexion
    }
  }, [user?.uid, lastCheck, onLogin]);

  /**
   * 📱 EXPOSER LES FONCTIONS GLOBALEMENT
   * Pour que d'autres composants puissent déclencher des vérifications
   */
  useEffect(() => {
    if (user?.uid) {
      window.badgeSystem = {
        checkBadges,
        onTaskCompleted,
        onProjectCreated,
        onXPGained,
        onLevelUp,
        onComeback,
        getAllBadges,
        getBadgesByCategory,
        getBadgeDefinition
      };
    }

    return () => {
      delete window.badgeSystem;
    };
  }, [
    user?.uid,
    checkBadges,
    onTaskCompleted,
    onProjectCreated,
    onXPGained,
    onLevelUp,
    onComeback,
    getAllBadges,
    getBadgesByCategory,
    getBadgeDefinition
  ]);

  return {
    // États
    isChecking,
    lastCheck,
    badgeStats,
    isReady: !!user?.uid && !!badgeStats,

    // Actions
    checkBadges,
    
    // Déclencheurs
    onLogin,
    onTaskCompleted,
    onProjectCreated,
    onXPGained,
    onLevelUp,
    onComeback,

    // Utilitaires
    getAllBadges,
    getBadgesByCategory,
    getBadgeDefinition,
    playBadgeSound
  };
};

/**
 * 🎮 HOOK SIMPLIFIÉ POUR DÉCLENCHEURS RAPIDES
 */
export const useBadgeTriggers = () => {
  const { onTaskCompleted, onProjectCreated, onXPGained, onLevelUp } = useBadgeSystem();

  // Fonction utilitaire pour déclencher une vérification après action
  const triggerBadgeCheck = useCallback(async (action, data = {}) => {
    switch (action) {
      case 'task_completed':
        return await onTaskCompleted(data);
      case 'project_created':
        return await onProjectCreated(data);
      case 'xp_gained':
        return await onXPGained(data.amount, data.source);
      case 'level_up':
        return await onLevelUp(data.level);
      default:
        console.warn('Action de badge non reconnue:', action);
        return null;
    }
  }, [onTaskCompleted, onProjectCreated, onXPGained, onLevelUp]);

  return {
    triggerBadgeCheck,
    onTaskCompleted,
    onProjectCreated,
    onXPGained,
    onLevelUp
  };
};

/**
 * 🏆 HOOK POUR AFFICHAGE DES BADGES
 */
export const useBadgeDisplay = () => {
  const { getAllBadges, getBadgesByCategory, getBadgeDefinition } = useBadgeSystem();
  const [categories] = useState(['premiers_pas', 'productivite', 'regularite', 'temporel', 'xp', 'special']);

  return {
    allBadges: getAllBadges(),
    categories,
    getBadgesByCategory,
    getBadgeDefinition
  };
};

export default useBadgeSystem;
