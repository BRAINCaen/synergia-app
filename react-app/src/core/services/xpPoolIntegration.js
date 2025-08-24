// ==========================================
// 📁 react-app/src/core/services/xpPoolIntegration.js
// INTÉGRATION AUTOMATIQUE DE LA CAGNOTTE LORS DU GAIN D'XP
// ==========================================

import teamPoolService from './teamPoolService.js';

/**
 * 🔄 SERVICE D'INTÉGRATION AUTOMATIQUE DE LA CAGNOTTE
 * S'intègre au système XP existant pour alimenter automatiquement la cagnotte
 */
class XpPoolIntegration {
  constructor() {
    this.initialized = false;
    this.enabled = true;
  }

  /**
   * 🚀 INITIALISER L'INTÉGRATION
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('🚀 [XP-POOL-INTEGRATION] Initialisation...');
      
      // Initialiser la cagnotte si nécessaire
      await teamPoolService.initializeTeamPool();
      
      // Écouter les événements XP globaux
      this.setupXpEventListeners();
      
      this.initialized = true;
      console.log('✅ [XP-POOL-INTEGRATION] Intégration active');
      
    } catch (error) {
      console.error('❌ [XP-POOL-INTEGRATION] Erreur initialisation:', error);
    }
  }

  /**
   * 👂 CONFIGURER LES ÉCOUTEURS D'ÉVÉNEMENTS XP
   */
  setupXpEventListeners() {
    // Écouter les gains d'XP pour contribuer automatiquement
    window.addEventListener('userXPUpdated', (event) => {
      this.handleXpGained(event.detail);
    });

    // Écouter les validations de tâches
    window.addEventListener('taskValidated', (event) => {
      this.handleTaskValidated(event.detail);
    });

    // Écouter les montées de niveau
    window.addEventListener('userLevelUp', (event) => {
      this.handleLevelUp(event.detail);
    });

    console.log('👂 [XP-POOL-INTEGRATION] Écouteurs configurés');
  }

  /**
   * 💰 GÉRER LE GAIN D'XP
   */
  async handleXpGained(detail) {
    if (!this.enabled) return;

    try {
      const { userId, xpGained, source, userEmail } = detail;
      
      if (!userId || !xpGained || xpGained <= 0) return;
      
      console.log(`💰 [XP-POOL-INTEGRATION] Gain XP détecté:`, {
        userId,
        xpGained,
        source
      });

      // Contribuer automatiquement à la cagnotte
      const result = await teamPoolService.contributeToPool(
        userId,
        userEmail || 'email@inconnu.com',
        xpGained,
        source || 'unknown',
        false // Contribution automatique
      );

      if (result.success && result.contributed > 0) {
        console.log(`✅ [XP-POOL-INTEGRATION] Contribution auto: +${result.contributed} XP à la cagnotte`);
        
        // Émettre un événement de contribution pour les composants UI
        const contributionEvent = new CustomEvent('teamPoolContribution', {
          detail: {
            userId,
            contributed: result.contributed,
            newPoolTotal: result.newPoolTotal,
            levelChanged: result.levelChanged,
            newLevel: result.newLevel,
            source: 'automatic'
          }
        });
        
        window.dispatchEvent(contributionEvent);
      }

    } catch (error) {
      console.error('❌ [XP-POOL-INTEGRATION] Erreur contribution auto:', error);
    }
  }

  /**
   * ✅ GÉRER LA VALIDATION DE TÂCHE
   */
  async handleTaskValidated(detail) {
    if (!this.enabled) return;

    try {
      const { userId, taskData, xpAwarded, userEmail } = detail;
      
      if (!userId || !xpAwarded || xpAwarded <= 0) return;
      
      console.log(`✅ [XP-POOL-INTEGRATION] Tâche validée:`, {
        userId,
        taskTitle: taskData?.title,
        xpAwarded
      });

      // Contribution spéciale pour les validations de tâches
      const result = await teamPoolService.contributeToPool(
        userId,
        userEmail || 'email@inconnu.com',
        xpAwarded,
        'task_validation',
        false
      );

      if (result.success && result.contributed > 0) {
        console.log(`✅ [XP-POOL-INTEGRATION] Contribution tâche: +${result.contributed} XP`);
        
        // Notification spéciale pour les grosses contributions
        if (result.contributed >= 10) {
          this.showContributionNotification(userId, result.contributed, taskData?.title);
        }
      }

    } catch (error) {
      console.error('❌ [XP-POOL-INTEGRATION] Erreur contribution tâche:', error);
    }
  }

  /**
   * 🎉 GÉRER LA MONTÉE DE NIVEAU
   */
  async handleLevelUp(detail) {
    if (!this.enabled) return;

    try {
      const { userId, newLevel, oldLevel, userEmail } = detail;
      
      console.log(`🎉 [XP-POOL-INTEGRATION] Montée de niveau:`, {
        userId,
        oldLevel,
        newLevel
      });

      // Bonus de niveau pour la cagnotte
      const levelBonus = (newLevel - oldLevel) * 20; // 20 XP par niveau
      
      const result = await teamPoolService.contributeToPool(
        userId,
        userEmail || 'email@inconnu.com',
        levelBonus,
        'level_up_bonus',
        false
      );

      if (result.success && result.contributed > 0) {
        console.log(`🎉 [XP-POOL-INTEGRATION] Bonus niveau: +${result.contributed} XP à la cagnotte`);
        
        this.showLevelUpContributionNotification(userId, newLevel, result.contributed);
      }

    } catch (error) {
      console.error('❌ [XP-POOL-INTEGRATION] Erreur bonus niveau:', error);
    }
  }

  /**
   * 🔔 AFFICHER NOTIFICATION DE CONTRIBUTION
   */
  showContributionNotification(userId, amount, taskTitle = '') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="text-2xl mr-3">🏆</div>
        <div>
          <div class="font-bold">Contribution à la cagnotte !</div>
          <div class="text-sm">+${amount} XP ajoutés à la cagnotte équipe</div>
          ${taskTitle ? `<div class="text-xs text-green-200">Tâche: ${taskTitle}</div>` : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  /**
   * 🎉 AFFICHER NOTIFICATION BONUS NIVEAU
   */
  showLevelUpContributionNotification(userId, newLevel, amount) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="text-2xl mr-3">🎊</div>
        <div>
          <div class="font-bold">Niveau ${newLevel} atteint !</div>
          <div class="text-sm">Bonus équipe: +${amount} XP à la cagnotte</div>
          <div class="text-xs text-purple-200">Bravo pour ta progression !</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  /**
   * ⚙️ ACTIVER/DÉSACTIVER L'INTÉGRATION
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`⚙️ [XP-POOL-INTEGRATION] ${enabled ? 'Activé' : 'Désactivé'}`);
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INTÉGRATION
   */
  getIntegrationStats() {
    return {
      initialized: this.initialized,
      enabled: this.enabled,
      autoContributionRate: teamPoolService.CONFIG.AUTO_CONTRIBUTION_RATE * 100,
      minXpForContribution: teamPoolService.CONFIG.MIN_XP_FOR_AUTO_CONTRIBUTION
    };
  }
}

// Singleton
const xpPoolIntegration = new XpPoolIntegration();

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => xpPoolIntegration.initialize(), 1000);
    });
  } else {
    setTimeout(() => xpPoolIntegration.initialize(), 1000);
  }
}

export default xpPoolIntegration;
