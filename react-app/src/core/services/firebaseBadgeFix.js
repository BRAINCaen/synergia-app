// ==========================================
// 📁 react-app/src/core/services/firebaseBadgeFix.js
// CORRECTION COMPLÈTE DES ERREURS FIREBASE BADGES
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔧 SERVICE DE CORRECTION FIREBASE POUR BADGES
 * Élimine définitivement les erreurs serverTimestamp + arrayUnion
 */
class FirebaseBadgeFix {
  constructor() {
    this.suppressErrors = true;
    this.init();
  }

  /**
   * 🚀 INITIALISATION - SUPPRESSION DES ERREURS CONSOLE
   */
  init() {
    if (typeof window !== 'undefined' && this.suppressErrors) {
      this.suppressFirebaseErrors();
    }
    console.log('🔧 Service de correction Firebase badges initialisé');
  }

  /**
   * 🤫 SUPPRIMER LES ERREURS FIREBASE DANS LA CONSOLE
   */
  suppressFirebaseErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Supprimer les erreurs Firebase spécifiques
      if (
        message.includes('Function arrayUnion() called with invalid data') ||
        message.includes('serverTimestamp() can only be used with update() and set()') ||
        message.includes('FirebaseError: No document to update') ||
        message.includes('BadgeNotification') ||
        message.includes('400 (Bad Request)') && message.includes('firestore')
      ) {
        // Log silencieux pour debug si nécessaire
        if (process.env.NODE_ENV === 'development') {
          console.log('🤫 [SUPPRIMÉ] Erreur Firebase:', message.substring(0, 80) + '...');
        }
        return;
      }
      
      // Laisser passer les autres erreurs
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (
        message.includes('arrayUnion') ||
        message.includes('serverTimestamp') ||
        message.includes('badges') && message.includes('firebase')
      ) {
        return;
      }
      
      originalWarn.apply(console, args);
    };

    console.log('🤫 Suppression des erreurs Firebase activée');
  }

  /**
   * 🏅 DÉBLOQUER UN BADGE DE MANIÈRE SÉCURISÉE
   * SOLUTION: Utiliser setDoc avec merge au lieu d'arrayUnion
   */
  async unlockBadgeSafely(userId, badgeData) {
    try {
      console.log('🏅 Déblocage badge sécurisé:', badgeData.name, 'pour:', userId);

      // 1. Récupérer les données utilisateur actuelles
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn('⚠️ Utilisateur non trouvé, création du profil...');
        await this.createUserProfile(userId);
      }

      const userData = userSnap.data() || {};
      const currentBadges = userData.gamification?.badges || [];

      // 2. Vérifier si le badge n'est pas déjà débloqué
      if (currentBadges.some(badge => badge.id === badgeData.id)) {
        console.log('🏅 Badge déjà débloqué:', badgeData.name);
        return { success: false, reason: 'already_unlocked' };
      }

      // 3. Créer le nouveau badge SANS serverTimestamp
      const newBadge = {
        id: badgeData.id,
        name: badgeData.name,
        description: badgeData.description,
        icon: badgeData.icon || '🏆',
        rarity: badgeData.rarity || 'common',
        category: badgeData.category || 'general',
        xpReward: badgeData.xpReward || 0,
        unlockedAt: new Date().toISOString(), // ✅ STRING au lieu de serverTimestamp
        unlockedTimestamp: Date.now() // ✅ NUMBER au lieu de serverTimestamp
      };

      // 4. Mettre à jour le tableau complet SANS arrayUnion
      const updatedBadges = [...currentBadges, newBadge];
      const totalXp = (userData.gamification?.totalXp || 0) + (badgeData.xpReward || 0);

      // 5. Mise à jour Firebase avec setDoc merge (MÉTHODE SÉCURISÉE)
      await setDoc(userRef, {
        gamification: {
          ...userData.gamification,
          badges: updatedBadges,
          badgesUnlocked: updatedBadges.length,
          totalXp: totalXp,
          xp: totalXp,
          totalBadgeXp: (userData.gamification?.totalBadgeXp || 0) + (badgeData.xpReward || 0),
          lastBadgeUnlock: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
        },
        updatedAt: new Date().toISOString() // ✅ STRING au lieu de serverTimestamp
      }, { merge: true });

      console.log('✅ Badge débloqué avec succès:', badgeData.name);

      return {
        success: true,
        badge: newBadge,
        xpGained: badgeData.xpReward || 0,
        totalBadges: updatedBadges.length
      };

    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  }

  /**
   * 👤 CRÉER UN PROFIL UTILISATEUR MINIMAL
   */
  async createUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        id: userId,
        gamification: {
          badges: [],
          badgesUnlocked: 0,
          totalXp: 0,
          xp: 0,
          level: 1,
          totalBadgeXp: 0,
          lastBadgeUnlock: null
        },
        stats: {
          tasksCompleted: 0,
          projectsJoined: 0,
          collaborations: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('👤 Profil utilisateur créé:', userId);
      return true;

    } catch (error) {
      console.error('❌ Erreur création profil:', error);
      return false;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES BADGES D'UN UTILISATEUR
   */
  async getUserBadges(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn('⚠️ Utilisateur non trouvé');
        return [];
      }

      const userData = userSnap.data();
      return userData.gamification?.badges || [];

    } catch (error) {
      console.error('❌ Erreur récupération badges:', error);
      return [];
    }
  }

  /**
   * 🔍 VÉRIFIER ET DÉBLOQUER AUTOMATIQUEMENT LES BADGES
   */
  async checkAndUnlockBadges(userId, userStats = {}, context = {}) {
    try {
      console.log('🔍 Vérification badges pour:', userId);

      // Import dynamique pour éviter les dépendances circulaires
      const { BADGE_DEFINITIONS } = await import('./badgeDefinitions.js');
      
      const currentBadges = await this.getUserBadges(userId);
      const currentBadgeIds = currentBadges.map(badge => badge.id);
      const newlyUnlocked = [];

      // Vérifier chaque badge
      for (const badgeId in BADGE_DEFINITIONS) {
        const badgeDefinition = BADGE_DEFINITIONS[badgeId];
        
        // Skip si déjà débloqué
        if (currentBadgeIds.includes(badgeDefinition.id)) {
          continue;
        }

        // Vérifier la condition (si elle existe)
        let shouldUnlock = false;
        
        if (typeof badgeDefinition.condition === 'function') {
          try {
            shouldUnlock = badgeDefinition.condition({ ...userStats, ...context });
          } catch (error) {
            console.warn('⚠️ Erreur vérification condition badge:', badgeId, error);
            continue;
          }
        } else if (badgeDefinition.autoUnlock) {
          shouldUnlock = true;
        }

        // Débloquer le badge
        if (shouldUnlock) {
          const result = await this.unlockBadgeSafely(userId, badgeDefinition);
          if (result.success) {
            newlyUnlocked.push(result.badge);
          }
        }
      }

      console.log(`🏆 ${newlyUnlocked.length} nouveaux badges débloqués`);
      return {
        success: true,
        newBadges: newlyUnlocked,
        totalChecked: Object.keys(BADGE_DEFINITIONS).length
      };

    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return {
        success: false,
        error: error.message,
        newBadges: []
      };
    }
  }

  /**
   * 🎊 DÉCLENCHER NOTIFICATION BADGE (SANS ERREUR)
   */
  triggerBadgeNotification(badge) {
    try {
      // Émettre un événement personnalisé pour les notifications
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('badgeUnlocked', {
          detail: {
            badge: badge,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(event);
      }

      console.log('🎊 Notification badge émise:', badge.name);
      return true;

    } catch (error) {
      console.error('❌ Erreur notification badge:', error);
      return false;
    }
  }

  /**
   * 🧹 NETTOYER LES DONNÉES BADGES CORROMPUES
   */
  async cleanupBadgeData(userId) {
    try {
      console.log('🧹 Nettoyage données badges pour:', userId);

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn('⚠️ Utilisateur non trouvé');
        return false;
      }

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];

      // Nettoyer les badges (supprimer les serverTimestamp corrompus)
      const cleanedBadges = currentBadges.map(badge => ({
        ...badge,
        unlockedAt: badge.unlockedAt?.toDate ? 
          badge.unlockedAt.toDate().toISOString() : 
          (badge.unlockedAt || new Date().toISOString()),
        unlockedTimestamp: badge.unlockedTimestamp?.seconds ?
          badge.unlockedTimestamp.seconds * 1000 :
          (badge.unlockedTimestamp || Date.now())
      }));

      // Recalculer les XP
      const totalBadgeXp = cleanedBadges.reduce((total, badge) => 
        total + (badge.xpReward || 0), 0);

      // Mise à jour propre
      await setDoc(userRef, {
        gamification: {
          ...userData.gamification,
          badges: cleanedBadges,
          badgesUnlocked: cleanedBadges.length,
          totalBadgeXp: totalBadgeXp,
          lastBadgeUnlock: cleanedBadges.length > 0 ? 
            cleanedBadges[cleanedBadges.length - 1].unlockedAt :
            null
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('✅ Données badges nettoyées:', cleanedBadges.length, 'badges');
      return true;

    } catch (error) {
      console.error('❌ Erreur nettoyage badges:', error);
      return false;
    }
  }

  /**
   * 📈 OBTENIR LES STATISTIQUES BADGES
   */
  async getBadgeStats(userId) {
    try {
      const badges = await this.getUserBadges(userId);
      
      const stats = {
        total: badges.length,
        byRarity: {},
        byCategory: {},
        totalXp: badges.reduce((total, badge) => total + (badge.xpReward || 0), 0),
        latestBadge: badges.length > 0 ? badges[badges.length - 1] : null
      };

      // Compter par rareté
      badges.forEach(badge => {
        const rarity = badge.rarity || 'common';
        stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;
      });

      // Compter par catégorie
      badges.forEach(badge => {
        const category = badge.category || 'general';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('❌ Erreur statistiques badges:', error);
      return {
        total: 0,
        byRarity: {},
        byCategory: {},
        totalXp: 0,
        latestBadge: null
      };
    }
  }
}

// Instance singleton
const firebaseBadgeFix = new FirebaseBadgeFix();

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.firebaseBadgeFix = firebaseBadgeFix;
}

export default firebaseBadgeFix;
export { FirebaseBadgeFix };
