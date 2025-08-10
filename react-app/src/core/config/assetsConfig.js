// ==========================================
// 📁 react-app/src/core/config/assetsConfig.js
// CONFIGURATION ASSETS ET SONS POUR SYSTÈME BADGES V3.5
// ==========================================

/**
 * 🎵 CONFIGURATION DES SONS
 */
export const SOUND_CONFIG = {
  // Sons de badges
  BADGE_UNLOCK: {
    path: '/sounds/badge-unlock.mp3',
    volume: 0.3,
    fallback: null
  },
  
  LEGENDARY_BADGE: {
    path: '/sounds/legendary-unlock.mp3',
    volume: 0.5,
    fallback: '/sounds/badge-unlock.mp3'
  },
  
  LEVEL_UP: {
    path: '/sounds/level-up.mp3',
    volume: 0.4,
    fallback: null
  },
  
  NOTIFICATION: {
    path: '/sounds/notification.mp3',
    volume: 0.2,
    fallback: null
  },
  
  // Sons d'interface
  CLICK: {
    path: '/sounds/click.mp3',
    volume: 0.1,
    fallback: null
  },
  
  SUCCESS: {
    path: '/sounds/success.mp3',
    volume: 0.3,
    fallback: null
  },
  
  ERROR: {
    path: '/sounds/error.mp3',
    volume: 0.3,
    fallback: null
  }
};

/**
 * 🖼️ CONFIGURATION DES IMAGES
 */
export const IMAGE_CONFIG = {
  // Effets de badges
  LEGENDARY_GLOW: '/images/effects/legendary-glow.gif',
  SPARKLES: '/images/effects/sparkles.gif',
  CONFETTI: '/images/effects/confetti.gif',
  
  // Placeholders
  DEFAULT_AVATAR: '/images/default-avatar.png',
  DEFAULT_BADGE: '/images/default-badge.png',
  
  // Icônes de rareté
  RARITY_ICONS: {
    common: '/images/rarity/common.svg',
    uncommon: '/images/rarity/uncommon.svg',
    rare: '/images/rarity/rare.svg',
    epic: '/images/rarity/epic.svg',
    legendary: '/images/rarity/legendary.svg'
  },
  
  // Backgrounds
  BADGE_BACKGROUNDS: {
    common: '/images/backgrounds/badge-common.png',
    uncommon: '/images/backgrounds/badge-uncommon.png',
    rare: '/images/backgrounds/badge-rare.png',
    epic: '/images/backgrounds/badge-epic.png',
    legendary: '/images/backgrounds/badge-legendary.png'
  }
};

/**
 * 🎨 GESTIONNAIRE D'ASSETS
 */
class AssetsManager {
  constructor() {
    this.loadedSounds = new Map();
    this.loadedImages = new Map();
    this.soundEnabled = true;
    this.initialized = false;
  }

  /**
   * 🚀 INITIALISER LE GESTIONNAIRE
   */
  async initialize() {
    if (this.initialized) return;

    console.log('🎵 Initialisation du gestionnaire d\'assets...');

    // Vérifier les préférences utilisateur
    this.soundEnabled = localStorage.getItem('synergia-sound-enabled') !== 'false';

    // Précharger les assets critiques
    await this.preloadCriticalAssets();

    this.initialized = true;
    console.log('✅ Gestionnaire d\'assets initialisé');
  }

  /**
   * 🎵 JOUER UN SON
   */
  async playSound(soundKey, options = {}) {
    if (!this.soundEnabled) return;

    try {
      const soundConfig = SOUND_CONFIG[soundKey];
      if (!soundConfig) {
        console.warn(`Son introuvable: ${soundKey}`);
        return;
      }

      let audio = this.loadedSounds.get(soundKey);
      
      // Charger le son si pas encore en cache
      if (!audio) {
        audio = await this.loadSound(soundConfig);
        if (!audio) return;
        this.loadedSounds.set(soundKey, audio);
      }

      // Configurer et jouer
      audio.volume = options.volume ?? soundConfig.volume ?? 0.3;
      audio.currentTime = 0; // Reset pour pouvoir rejouer immédiatement
      
      await audio.play();
      
    } catch (error) {
      console.warn(`Erreur lecture son ${soundKey}:`, error);
      
      // Tenter le fallback
      const soundConfig = SOUND_CONFIG[soundKey];
      if (soundConfig.fallback && soundConfig.fallback !== soundConfig.path) {
        console.log(`Tentative fallback pour ${soundKey}`);
        // Récursion avec le fallback
        const fallbackKey = Object.keys(SOUND_CONFIG).find(key => 
          SOUND_CONFIG[key].path === soundConfig.fallback
        );
        if (fallbackKey) {
          await this.playSound(fallbackKey, options);
        }
      }
    }
  }

  /**
   * 🔊 CHARGER UN SON
   */
  async loadSound(soundConfig) {
    try {
      const audio = new Audio(soundConfig.path);
      audio.preload = 'auto';
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(audio));
        audio.addEventListener('error', () => {
          console.warn(`Impossible de charger: ${soundConfig.path}`);
          resolve(null);
        });
        
        // Timeout après 5 secondes
        setTimeout(() => resolve(null), 5000);
      });
      
    } catch (error) {
      console.warn(`Erreur chargement son:`, error);
      return null;
    }
  }

  /**
   * 🖼️ CHARGER UNE IMAGE
   */
  async loadImage(imagePath) {
    try {
      if (this.loadedImages.has(imagePath)) {
        return this.loadedImages.get(imagePath);
      }

      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          this.loadedImages.set(imagePath, img);
          resolve(img);
        };
        
        img.onerror = () => {
          console.warn(`Impossible de charger l'image: ${imagePath}`);
          resolve(null);
        };
        
        img.src = imagePath;
        
        // Timeout après 10 secondes
        setTimeout(() => resolve(null), 10000);
      });
      
    } catch (error) {
      console.warn(`Erreur chargement image:`, error);
      return null;
    }
  }

  /**
   * 🚀 PRÉCHARGER LES ASSETS CRITIQUES
   */
  async preloadCriticalAssets() {
    const criticalSounds = ['BADGE_UNLOCK', 'LEVEL_UP'];
    const criticalImages = [
      IMAGE_CONFIG.LEGENDARY_GLOW,
      IMAGE_CONFIG.DEFAULT_AVATAR,
      IMAGE_CONFIG.DEFAULT_BADGE
    ];

    // Précharger les sons critiques
    const soundPromises = criticalSounds.map(async (soundKey) => {
      const soundConfig = SOUND_CONFIG[soundKey];
      if (soundConfig) {
        const audio = await this.loadSound(soundConfig);
        if (audio) {
          this.loadedSounds.set(soundKey, audio);
        }
      }
    });

    // Précharger les images critiques
    const imagePromises = criticalImages.map(imagePath => this.loadImage(imagePath));

    // Attendre tous les chargements (mais sans bloquer)
    try {
      await Promise.allSettled([...soundPromises, ...imagePromises]);
      console.log('✅ Assets critiques préchargés');
    } catch (error) {
      console.warn('⚠️ Erreur préchargement assets:', error);
    }
  }

  /**
   * 🔇 ACTIVER/DÉSACTIVER LES SONS
   */
  toggleSound(enabled) {
    this.soundEnabled = enabled;
    localStorage.setItem('synergia-sound-enabled', enabled.toString());
    
    if (enabled) {
      this.playSound('NOTIFICATION');
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES
   */
  getStats() {
    return {
      soundsLoaded: this.loadedSounds.size,
      imagesLoaded: this.loadedImages.size,
      soundEnabled: this.soundEnabled,
      initialized: this.initialized
    };
  }

  /**
   * 🧹 NETTOYER LE CACHE
   */
  clearCache() {
    // Arrêter tous les sons
    this.loadedSounds.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    
    // Vider les caches
    this.loadedSounds.clear();
    this.loadedImages.clear();
    
    console.log('🧹 Cache assets nettoyé');
  }

  /**
   * 🎵 MÉTHODES DE CONVENANCE POUR BADGES
   */
  
  // Jouer le son d'un badge selon sa rareté
  async playBadgeSound(rarity) {
    switch (rarity) {
      case 'legendary':
        await this.playSound('LEGENDARY_BADGE');
        break;
      default:
        await this.playSound('BADGE_UNLOCK');
        break;
    }
  }

  // Jouer le son de level up
  async playLevelUpSound() {
    await this.playSound('LEVEL_UP');
  }

  // Jouer le son de notification
  async playNotificationSound() {
    await this.playSound('NOTIFICATION');
  }

  // Jouer le son de succès
  async playSuccessSound() {
    await this.playSound('SUCCESS');
  }

  // Jouer le son d'erreur
  async playErrorSound() {
    await this.playSound('ERROR');
  }
}

/**
 * 🎨 GESTIONNAIRE D'EFFETS VISUELS
 */
class EffectsManager {
  constructor() {
    this.activeEffects = new Set();
  }

  /**
   * 🎊 CRÉER EFFET CONFETTIS
   */
  createConfetti(options = {}) {
    const {
      count = 50,
      colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
      duration = 3000,
      container = document.body
    } = options;

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      
      container.appendChild(confetti);
      this.activeEffects.add(confetti);

      // Nettoyer après l'animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
        this.activeEffects.delete(confetti);
      }, duration);
    }
  }

  /**
   * ✨ CRÉER EFFET SPARKLES
   */
  createSparkles(element, options = {}) {
    const {
      count = 6,
      duration = 2000,
      color = '#ffd700'
    } = options;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.backgroundColor = color;
      sparkle.style.left = (Math.random() * rect.width) + 'px';
      sparkle.style.top = (Math.random() * rect.height) + 'px';
      sparkle.style.animationDelay = (Math.random() * 0.5) + 's';
      
      element.style.position = 'relative';
      element.appendChild(sparkle);
      this.activeEffects.add(sparkle);

      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
        this.activeEffects.delete(sparkle);
      }, duration);
    }
  }

  /**
   * 🌟 EFFET SPÉCIAL LEGENDARY
   */
  createLegendaryEffect(element) {
    if (!element) return;

    // Confettis dorés
    this.createConfetti({
      count: 100,
      colors: ['#ffd700', '#ffb347', '#ff6b6b', '#4facfe'],
      duration: 5000
    });

    // Sparkles sur l'élément
    this.createSparkles(element, {
      count: 12,
      duration: 3000,
      color: '#ffd700'
    });

    // Effet de pulsation
    element.classList.add('animate-legendary-pulse');
    setTimeout(() => {
      element.classList.remove('animate-legendary-pulse');
    }, 3000);

    // Flash d'écran
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

// Instance singleton
const assetsManager = new AssetsManager();
const effectsManager = new EffectsManager();

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      assetsManager.initialize();
    });
  } else {
    assetsManager.initialize();
  }

  // Exposer globalement pour debug
  window.__SYNERGIA_ASSETS__ = assetsManager;
  window.__SYNERGIA_EFFECTS__ = effectsManager;
}

export default assetsManager;
export { assetsManager, effectsManager };

// Fonctions utilitaires exportées
export const playBadgeSound = (rarity) => assetsManager.playBadgeSound(rarity);
export const playLevelUpSound = () => assetsManager.playLevelUpSound();
export const playNotificationSound = () => assetsManager.playNotificationSound();
export const createConfetti = (options) => effectsManager.createConfetti(options);
export const createLegendaryEffect = (element) => effectsManager.createLegendaryEffect(element);

console.log('🎨 Gestionnaire d\'assets et d\'effets chargé !');
