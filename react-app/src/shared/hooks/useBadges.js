// ==========================================
// 📁 react-app/src/shared/hooks/useBadges.js
// HOOK BADGES CORRIGÉ - SANS ERREURS FIREBASE
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import firebaseBadgeFix from '../../core/services/firebaseBadgeFix.js';
import { BADGE_DEFINITIONS, BADGE_STATS } from '../../core/services/badgeDefinitions.js';
import { useBadgeNotifications } from '../../components/gamification/BadgeNotification.jsx';

/**
 * 🏆 HOOK BADGES PRINCIPAL CORRIGÉ
 * Version sans erreurs Firebase avec système de notification intégré
 */
export const useBadges = () => {
  const { user } = useAuthStore();
  const { showNotification } = useBadgeNotifications();
  
  // États principaux
  const [userBadges, setUserBadges] = useState([]);
  const [badgeStats, setBadgeStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);

  // Références pour éviter les re-renders inutiles
  const checkInProgress = useRef(false);
  const lastUserId = useRef(null);

  /**
   * 📥 CHARGER LES BADGES D'UN UTILISATEUR
   */
  const loadUserBadges = useCallback(async (userId = null) => {
    const targetUserId = userId || user?.uid;
    if (!targetUserId || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('📥 Chargement badges pour:', targetUserId);
      
      const badges = await firebaseBadgeFix.getUserBadges(targetUserId);
      const stats = await firebaseBadgeFix.getBadgeStats(targetUserId);
      
      setUserBadges(badges);
      setBadgeStats(stats);
      
      console.log('✅ Badges chargés:', badges.length);

    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, isLoading]);

  /**
   * 🔍 VÉRIFIER ET DÉBLOQUER LES BADGES
   */
  const checkBadges = useCallback(async (context = {}) => {
    const userId = user?.uid;
    if (!userId || checkInProgress.current) return { success: false, newBadges: [] };

    try {
      checkInProgress.current = true;
      console.log('🔍 Vérification badges avec contexte:', context);

      // Construire les statistiques utilisateur
      const userStats = {
        // Stats de base depuis le contexte ou valeurs par défaut
        tasksCompleted: context.tasksCompleted || 0,
        tasksCreated: context.tasksCreated || 0,
        level: context.level || 1,
        totalXp: context.totalXp || 0,
        
        // Stats d'équipe
        teamsJoined: context.teamsJoined || 0,
        collaborativeProjects: context.collaborativeProjects || 0,
        helpedColleagues: context.helpedColleagues || 0,
        
        // Stats de communication
        commentsPosted: context.commentsPosted || 0,
        discussionsStarted: context.discussionsStarted || 0,
        
        // Stats d'engagement
        consecutiveDays: context.consecutiveDays || 0,
        loginStreak: context.loginStreak || 0,
        
        // Stats spécialisées
        adminActions: context.adminActions || 0,
        teamSize: context.teamSize || 0,
        managementScore: context.managementScore || 0,
        codeQuality: context.codeQuality || 0,
        projectsDelivered: context.projectsDelivered || 0,
        salesPerformance: context.salesPerformance || 0,
        
        // Stats spéciales
        betaTester: context.betaTester || false,
        bugsReported: context.bugsReported || 0,
        featuresAdopted: context.featuresAdopted || 0,
        joinedAt: context.joinedAt || null,
        
        // Stats d'excellence
        qualityScore: context.qualityScore || 0,
        ambassadorScore: context.ambassadorScore || 0,
        teamContributions: context.teamContributions || 0,
        innovationImpact: context.innovationImpact || 0,
        adoptedInnovations: context.adoptedInnovations || 0,
        
        // Profil
        profile: context.profile || { completeness: 50 },
        
        // Trigger spécifique
        trigger: context.trigger || 'manual'
      };

      const result = await firebaseBadgeFix.checkAndUnlockBadges(userId, userStats, context);
      
      if (result.success && result.newBadges.length > 0) {
        console.log('🎉 Nouveaux badges débloqués:', result.newBadges.length);
        
        // Afficher les notifications
        result.newBadges.forEach(badge => {
          showNotification(badge);
          firebaseBadgeFix.triggerBadgeNotification(badge);
        });
        
        // Recharger les badges utilisateur
        await loadUserBadges();
      }
      
      setLastCheck(new Date().toISOString());
      return result;

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      setError(error.message);
      return { success: false, newBadges: [], error: error.message };
    } finally {
      checkInProgress.current = false;
    }
  }, [user?.uid, showNotification, loadUserBadges]);

  /**
   * 🏅 DÉBLOQUER UN BADGE MANUELLEMENT
   */
  const unlockBadge = useCallback(async (badgeId, context = {}) => {
    const userId = user?.uid;
    if (!userId) return { success: false };

    try {
      const badgeDefinition = BADGE_DEFINITIONS[badgeId];
      if (!badgeDefinition) {
        throw new Error(`Badge non trouvé: ${badgeId}`);
      }

      console.log('🏅 Déblocage manuel badge:', badgeDefinition.name);
      
      const result = await firebaseBadgeFix.unlockBadgeSafely(userId, badgeDefinition);
      
      if (result.success) {
        showNotification(result.badge);
        firebaseBadgeFix.triggerBadgeNotification(result.badge);
        await loadUserBadges();
      }
      
      return result;

    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [user?.uid, showNotification, loadUserBadges]);

  /**
   * 📊 OBTENIR LES STATISTIQUES GLOBALES DES BADGES
   */
  const getBadgeProgress = useCallback(() => {
    const totalBadges = BADGE_STATS.total;
    const unlockedCount = userBadges.length;
    const percentage = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

    // Progression par rareté
    const progressByRarity = {};
    Object.keys(BADGE_STATS.byRarity).forEach(rarity => {
      const totalInRarity = BADGE_STATS.byRarity[rarity];
      const unlockedInRarity = userBadges.filter(badge => badge.rarity === rarity).length;
      progressByRarity[rarity] = {
        unlocked: unlockedInRarity,
        total: totalInRarity,
        percentage: totalInRarity > 0 ? Math.round((unlockedInRarity / totalInRarity) * 100) : 0
      };
    });

    // Progression par catégorie
    const progressByCategory = {};
    Object.keys(BADGE_STATS.byCategory).forEach(category => {
      const totalInCategory = BADGE_STATS.byCategory[category];
      const unlockedInCategory = userBadges.filter(badge => badge.category === category).length;
      progressByCategory[category] = {
        unlocked: unlockedInCategory,
        total: totalInCategory,
        percentage: totalInCategory > 0 ? Math.round((unlockedInCategory / totalInCategory) * 100) : 0
      };
    });

    return {
      total: {
        unlocked: unlockedCount,
        available: totalBadges,
        percentage: percentage
      },
      byRarity: progressByRarity,
      byCategory: progressByCategory,
      totalXpFromBadges: userBadges.reduce((total, badge) => total + (badge.xpReward || 0), 0),
      latestBadge: userBadges.length > 0 ? userBadges[userBadges.length - 1] : null,
      nextBadges: getNextAvailableBadges()
    };
  }, [userBadges]);

  /**
   * 🎯 OBTENIR LES PROCHAINS BADGES DISPONIBLES
   */
  const getNextAvailableBadges = useCallback(() => {
    const unlockedBadgeIds = userBadges.map(badge => badge.id);
    
    return Object.values(BADGE_DEFINITIONS)
      .filter(badge => !unlockedBadgeIds.includes(badge.id))
      .sort((a, b) => (a.xpReward || 0) - (b.xpReward || 0))
      .slice(0, 5); // Top 5 prochains badges
  }, [userBadges]);

  /**
   * 🧹 NETTOYER LES DONNÉES CORROMPUES
   */
  const cleanupBadgeData = useCallback(async () => {
    const userId = user?.uid;
    if (!userId) return false;

    try {
      const result = await firebaseBadgeFix.cleanupBadgeData(userId);
      if (result) {
        await loadUserBadges();
      }
      return result;
    } catch (error) {
      console.error('❌ Erreur nettoyage badges:', error);
      return false;
    }
  }, [user?.uid, loadUserBadges]);

  /**
   * 🔄 EFFETS DE CHARGEMENT INITIAL
   */
  useEffect(() => {
    if (user?.uid && user.uid !== lastUserId.current) {
      lastUserId.current = user.uid;
      loadUserBadges();
    }
  }, [user?.uid, loadUserBadges]);

  /**
   * 🎯 VÉRIFICATION AUTOMATIQUE PÉRIODIQUE
   */
  useEffect(() => {
    if (!user?.uid) return;

    // Vérification automatique toutes les 5 minutes
    const interval = setInterval(() => {
      checkBadges({ trigger: 'automatic' });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.uid, checkBadges]);

  /**
   * 🎮 DÉCLENCHEURS AUTOMATIQUES D'ÉVÉNEMENTS
   */
  const triggerEvent = useCallback((eventType, data = {}) => {
    const eventContext = {
      trigger: eventType,
      timestamp: Date.now(),
      ...data
    };

    // Déclencher immédiatement la vérification
    checkBadges(eventContext);
  }, [checkBadges]);

  // Retourner l'API du hook
  return {
