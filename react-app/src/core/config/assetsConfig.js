// ==========================================
// 📁 react-app/src/core/config/assetsConfig.js
// CONFIGURATION ASSETS - VERSION FALLBACK SANS FICHIERS
// ==========================================

/**
 * 🔧 GESTIONNAIRE D'ASSETS EN MODE FALLBACK
 * Fonctionne sans fichiers externes - pas d'erreurs de chargement
 */

// Mode fallback activé - pas de fichiers externes requis
const FALLBACK_MODE = true;

/**
 * 🎵 CONFIGURATION DES SONS - MODE FALLBACK
 */
export const SOUND_CONFIG = {
  // Sons désactivés en mode fallback
  BADGE_UNLOCK: { enabled: false, fallback: 'none' },
  LEGENDARY_BADGE: { enabled: false, fallback: 'none' },
  LEVEL_UP: { enabled: false, fallback: 'none' },
  NOTIFICATION: { enabled: false, fallback: 'none' },
  CLICK: { enabled: false, fallback: 'none' },
  SUCCESS: { enabled: false, fallback: 'none' },
  ERROR: { enabled: false, fallback: 'none' }
};

/**
 * 🖼️ CONFIGURATION DES IMAGES - MODE FALLBACK
 */
export const IMAGE_CONFIG = {
  // Images remplacées par des émojis/CSS
  LEGENDARY_GLOW: null,
  SPARKLES: null,
  CONFETTI: null,
  DEFAULT_AVATAR: null,
  DEFAULT_BADGE: null,
  RARITY_ICONS: {
    common: '⚪',
    uncommon: '🟢', 
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡'
  },
  BADGE_BACKGROUNDS: {
    common: '#f3f4f6',
    uncommon: '#22c55e',
    rare: '#3b82f6', 
    epic: '#8b5cf6',
    legendary: '#f59e0b'
  }
};

/**
 * 🎨 GESTIONNAIRE D'ASSETS FALLBACK
 */
class AssetsManagerFallback {
  constructor() {
    this.soundEnabled = false; // Désactivé par défaut
    this.initialized = false;
    this.loadedSounds = new Map();
    this.loadedImages = new Map();
  }

  /**
   * 🚀 INITIALISATION IMMÉDIATE - SANS CHARGEMENT
   */
  async initialize() {
    if (this.initialized) return;

    console.log('🎵 Initialisation gestionnaire d\'assets (mode fallback)...');
    
    // Pas de préchargement nécessaire
    this.initialized = true;
    console.log('✅ Gestionnaire d\'assets initialisé (mode fallback)');
    
    // Supprimer les erreurs liées aux assets
    this.suppressAssetErrors();
  }

  /**
   * 🤫 SUPPRIMER LES ERREURS D'ASSETS
   */
  suppressAssetErrors() {
    const originalError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Supprimer les erreurs d'assets manquants
      const assetErrors = [
        'Failed to load resource',
        'badge-unlock.mp3',
        'level-up.mp3',
        'legendary-glow.gif',
        'default-avatar.png',
        'default-badge.png',
        'Impossible de charger',
        'Cannot resolve',
        '<link rel=preload>',
        'net::ERR_FILE_NOT_FOUND'
      ];
      
      const isAssetError = assetErrors.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (isAssetError) {
        console.info('🤫 [ASSET SUPPRIMÉ]', message.substring(0, 100) + '...');
        return;
      }
      
      originalError.apply(console, args);
    };
  }

  /**
   * 🎵 JOUER UN SON - MODE FALLBACK (SILENCIEUX)
   */
  async playSound(soundKey, options = {}) {
    // Mode silencieux - pas d'erreurs
    console.info(`🔇 Son simulé: ${soundKey}`);
    return Promise.resolve();
  }

  /**
   * 🎵 SONS SPÉCIFIQUES - FALLBACK
   */
  async playBadgeSound(rarity = 'common') {
    console.info(`🏆 Son badge simulé (${rarity})`);
    return Promise.resolve();
  }

  async playLevelUpSound() {
    console.info('⬆️ Son level up simulé');
    return Promise.resolve();
  }

  async playNotificationSound() {
    console.info('🔔 Son notification simulé');
    return Promise.resolve();
  }

  /**
   * 🖼️ CHARGER UNE IMAGE - FALLBACK
   */
  async loadImage(imagePath) {
    // Retourner null sans erreur
    return Promise.resolve(null);
  }

  /**
   * 🎨 OBTENIR COULEUR DE RARETÉ
   */
  getRarityColor(rarity) {
    return IMAGE_CONFIG.BADGE_BACKGROUNDS[rarity] || '#f3f4f6';
  }

  /**
   * 🎨 OBTENIR ÉMOJI DE RARETÉ
   */
  getRarityEmoji(rarity) {
    return IMAGE_CONFIG.RARITY_ICONS[rarity] || '⚪';
  }

  /**
   * 🔇 TOGGLE SOUND (TOUJOURS DÉSACTIVÉ EN FALLBACK)
   */
  toggleSound(enabled) {
    this.soundEnabled = false; // Toujours désactivé
    console.info('🔇 Sons désactivés (mode fallback)');
  }

  /**
   * 📊 STATISTIQUES
   */
  getStats() {
    return {
      mode: 'fallback',
      soundsLoaded: 0,
      imagesLoaded: 0,
      soundEnabled: false,
      initialized: this.initialized
    };
  }

  /**
   * 🧹 NETTOYER LE CACHE (RIEN À FAIRE)
   */
  clearCache() {
    console.info('🧹 Cache nettoyé (mode fallback)');
  }
}

/**
 * 🎆 GESTIONNAIRE D'EFFETS FALLBACK
 */
class EffectsManagerFallback {
  constructor() {
    this.activeEffects = new Set();
  }

  /**
   * 🎊 CONFETTIS CSS SEULEMENT
   */
  createConfetti(options = {}) {
    console.info('🎊 Confettis CSS simulés');
    
    // Effet CSS simple sans images
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: none;
      z-index: 9999;
      animation: confettiFall 2s ease-out forwards;
    `;

    // Animation CSS
    if (!document.querySelector('#confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confettiFall {
          0% { 
            transform: translateX(-50%) translateY(-50px) rotate(0deg);
            opacity: 0.8;
          }
          100% { 
            transform: translateX(-50%) translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(confetti);
    
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 2000);
  }

  /**
   * ✨ EFFET LÉGENDAIRE CSS
   */
  createLegendaryEffect(element) {
    if (!element) return;
    
    console.info('✨ Effet légendaire CSS');
    
    // Effet de lueur CSS
    element.style.boxShadow = '0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700';
    element.style.animation = 'legendaryGlow 2s ease-in-out';
    
    // Animation CSS
    if (!document.querySelector('#legendary-style')) {
      const style = document.createElement('style');
      style.id = 'legendary-style';
      style.textContent = `
        @keyframes legendaryGlow {
          0%, 100% { 
            box-shadow: 0 0 20px #ffd700;
          }
          50% { 
            box-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      element.style.boxShadow = '';
      element.style.animation = '';
    }, 2000);
  }

  /**
   * ⚡ EFFET FLASH CSS
   */
  createFlashEffect() {
    console.info('⚡ Flash CSS');
    
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9999;
      animation: fadeOut 1s ease-out forwards;
    `;
    
    // Animation CSS
    if (!document.querySelector('#flash-style')) {
      const style = document.createElement('style');
      style.id = 'flash-style';
      style.textContent = `
        @keyframes fadeOut {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }, 1000);
  }

  /**
   * 🧹 NETTOYER TOUS LES EFFETS
   */
  clearAllEffects() {
    this.activeEffects.forEach(effect => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    });
    this.activeEffects.clear();
  }
}

// ==========================================
// 🚀 INSTANCES GLOBALES FALLBACK
// ==========================================

const assetsManager = new AssetsManagerFallback();
const effectsManager = new EffectsManagerFallback();

// Auto-initialisation immédiate
if (typeof window !== 'undefined') {
  // Initialisation immédiate sans attendre le DOM
  assetsManager.initialize();

  // Exposer globalement pour debug
  window.__SYNERGIA_ASSETS__ = assetsManager;
  window.__SYNERGIA_EFFECTS__ = effectsManager;
  
  console.log('🎨 Gestionnaire d\'assets FALLBACK chargé - mode silencieux !');
}

// ==========================================
// 📤 EXPORTS
// ==========================================

export default assetsManager;
export { assetsManager, effectsManager };

// Fonctions utilitaires exportées - mode fallback
export const playBadgeSound = (rarity) => assetsManager.playBadgeSound(rarity);
export const playLevelUpSound = () => assetsManager.playLevelUpSound();
export const playNotificationSound = () => assetsManager.playNotificationSound();
export const createConfetti = (options) => effectsManager.createConfetti(options);
export const createLegendaryEffect = (element) => effectsManager.createLegendaryEffect(element);

console.log('🎨 Assets Config Fallback chargé - aucun fichier externe requis !');
