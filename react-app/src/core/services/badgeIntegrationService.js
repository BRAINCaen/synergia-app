// ==========================================
// 📁 react-app/src/core/services/badgeIntegrationService.js
// Service d'intégration badges - VERSION CORRIGÉE SANS DUPLICATION
// ==========================================

import BadgeEngine from './badgeEngine.js';
import gamificationService from './gamificationService.js';

/**
 * 🔗 SERVICE D'INTÉGRATION DES BADGES
 * Compatible avec la structure existante de Synergia
 */
class BadgeIntegrationService {
  
  static lastCheck = {};
  static checkCooldown = 5000;

  static initialize() {
    try {
      console.log('🔗 Badge Integration Service: Initialisation...');
      
      if (typeof window === 'undefined') {
        console.warn('⚠️ Window non disponible, skip badges');
        return;
      }

      this.setupEventListeners();
      this.setupPeriodicCheck();
      
      console.log('✅ Badge Integration Service initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation badges:', error);
    }
  }

  static setupEventListeners() {
    try {
      const events = [
        'taskCompleted',
        'projectCreated', 
        'projectCompleted',
        'xpUpdated',
        'streakUpdated'
      ];

      events.forEach(eventName => {
        window.addEventListener(eventName, (event) => {
          this.handleEvent(eventName, event);
        });
      });

      console.log('🎧 Event listeners badges configurés');
    } catch (error) {
      console.error('❌ Erreur setup listeners:', error);
    }
  }

  static handleEvent(eventName, event) {
    try {
      const { userId } = event.detail || {};
      if (userId) {
        this.triggerBadgeCheck(userId, eventName, event.detail);
      }
    } catch (error) {
      console.error(`❌ Erreur handle ${eventName}:`, error);
    }
  }

  static setupPeriodicCheck() {
    try {
      setInterval(() => {
        const currentUser = this.getCurrentUser();
        if (currentUser?.uid) {
          this.triggerBadgeCheck(currentUser.uid, 'periodic');
        }
      }, 30000);
    } catch (error) {
      console.error('❌ Erreur periodic check:', error);
    }
  }

  static getCurrentUser() {
    try {
      if (window.authStore) {
        return window.authStore.getState().user;
      }
      
      const authData = localStorage.getItem('synergia-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur getCurrentUser:', error);
      return null;
    }
  }

  static async triggerBadgeCheck(userId, eventType, eventData = {}) {
    try {
      if (!userId) {
        console.warn('⚠️ UserId manquant');
        return [];
      }

      const now = Date.now();
      const lastCheckTime = this.lastCheck[userId] || 0;
      
      if (now - lastCheckTime < this.checkCooldown && eventType !== 'manual') {
        console.log(`⏳ Badge check en cooldown pour ${userId}`);
        return [];
      }

      this.lastCheck[userId] = now;
      console.log(`🏆 Vérification badges - Event: ${eventType}`);

      const newBadges = await BadgeEngine.checkAndAwardBadges(userId);

      if (newBadges && newBadges.length > 0) {
        await this.updateGamificationAfterBadges(userId, newBadges);
        this.dispatchBadgeEvent(userId, newBadges, eventType);
      }

      return newBadges || [];

    } catch (error) {
      console.error('❌ Erreur triggerBadgeCheck:', error);
      return [];
    }
  }

  static async updateGamificationAfterBadges(userId, newBadges) {
    try {
      const totalXpBonus = newBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0);

      if (totalXpBonus > 0) {
        this.dispatchXpEvent(userId, totalXpBonus, newBadges);
        console.log(`🎯 XP bonus badges: +${totalXpBonus}`);
      }
    } catch (error) {
      console.error('❌ Erreur updateGamification:', error);
    }
  }

  static dispatchBadgeEvent(userId, badges, eventType) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('badgesAwarded', {
          detail: { userId, badges, eventType, timestamp: new Date() }
        }));
      }
    } catch (error) {
      console.error('❌ Erreur dispatchBadgeEvent:', error);
    }
  }

  static dispatchXpEvent(userId, xpBonus, badges) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('xpUpdatedFromBadges', {
          detail: { userId, xpBonus, source: 'badges', badges }
        }));
      }
    } catch (error) {
      console.error('❌ Erreur dispatchXpEvent:', error);
    }
  }

  static async manualBadgeCheck(userId) {
    console.log('🔍 Vérification manuelle badges');
    return await this.triggerBadgeCheck(userId, 'manual');
  }

  static async getBadgeStats(userId) {
    try {
      if (!userId) return null;

      const userData = await BadgeEngine.getUserAnalytics(userId);
      const allBadges = BadgeEngine.getAllBadges();
      
      const unlockedBadges = userData.badges || [];
      const unlockedCount = unlockedBadges.length;
      const totalCount = allBadges.length;
      const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

      const totalXpFromBadges = allBadges
        .filter(badge => unlockedBadges.includes(badge.id))
        .reduce((sum, badge) => sum + (badge.xpReward || 0), 0);

      return {
        unlockedCount,
        totalCount,
        percentage,
        totalXpFromBadges
      };

    } catch (error) {
      console.error('❌ Erreur getBadgeStats:', error);
      return null;
    }
  }

  static getDebugInfo(userId) {
    try {
      return {
        lastCheck: this.lastCheck[userId] || 'Jamais',
        cooldownRemaining: Math.max(0, this.checkCooldown - (Date.now() - (this.lastCheck[userId] || 0))),
        currentUser: this.getCurrentUser()?.email || 'Non connecté',
        initialized: true
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  static triggerTestEvents(userId) {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('⚠️ Test events uniquement en dev');
      return;
    }

    try {
      console.log('🧪 Test events...');
      
      setTimeout(() => {
        this.dispatchEvent('taskCompleted', {
          userId,
          task: {
            id: 'test-task',
            title: 'Test Task',
            priority: 'high',
            completedAt: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date(Date.now() - 30 * 60 * 1000) },
            dueDate: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
          }
        });
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur test events:', error);
    }
  }

  static dispatchEvent(eventName, detail) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    } catch (error) {
      console.error(`❌ Erreur dispatch ${eventName}:`, error);
    }
  }

  static cleanupCache() {
    try {
      const now = Date.now();
      const maxAge = 60 * 60 * 1000;

      Object.keys(this.lastCheck).forEach(userId => {
        if (now - this.lastCheck[userId] > maxAge) {
          delete this.lastCheck[userId];
        }
      });

      console.log('🧹 Cache badges nettoyé');
    } catch (error) {
      console.error('❌ Erreur cleanup:', error);
    }
  }
}

// Auto-initialisation sécurisée
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => BadgeIntegrationService.initialize(), 1000);
    });
  } else {
    setTimeout(() => BadgeIntegrationService.initialize(), 1000);
  }

  window.BadgeIntegrationService = BadgeIntegrationService;
}

export default BadgeIntegrationService;
