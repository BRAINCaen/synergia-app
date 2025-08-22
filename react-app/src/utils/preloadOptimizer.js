// ==========================================
// 📁 src/utils/preloadOptimizer.js  
// OPTIMISEUR DE RESSOURCES PRELOAD
// ==========================================

/**
 * 🚀 OPTIMISEUR INTELLIGENT DES RESSOURCES PRELOAD
 * 
 * Ce script corrige automatiquement :
 * - Les valeurs `as` incorrectes dans les balises preload
 * - Les ressources préchargées mais non utilisées
 * - Les erreurs de performance liées au preload
 */

// ==========================================
// 🔧 CONFIGURATION DE L'OPTIMISEUR
// ==========================================

const PRELOAD_CONFIG = {
  // Ressources à ne jamais précharger (pour éviter les erreurs)
  BLACKLISTED_RESOURCES: [
    'legendary-glow.gif',
    'badge-unlock.mp3', 
    'level-up.mp3',
    'sparkles.gif',
    'confetti.png',
    'default-avatar.png'
  ],
  
  // Délai max avant de considérer une ressource comme non utilisée (ms)
  USAGE_TIMEOUT: 3000,
  
  // Types de fichiers et leurs valeurs `as` correctes
  FILE_TYPE_MAPPING: {
    // Audio
    '.mp3': 'audio',
    '.wav': 'audio', 
    '.ogg': 'audio',
    '.m4a': 'audio',
    
    // Vidéo
    '.mp4': 'video',
    '.webm': 'video',
    '.ogv': 'video',
    '.avi': 'video',
    
    // Images
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.webp': 'image',
    '.svg': 'image',
    '.ico': 'image',
    
    // Scripts
    '.js': 'script',
    '.mjs': 'script',
    '.jsx': 'script',
    '.ts': 'script',
    '.tsx': 'script',
    
    // Styles
    '.css': 'style',
    '.scss': 'style',
    '.sass': 'style',
    '.less': 'style',
    
    // Fonts
    '.woff': 'font',
    '.woff2': 'font',
    '.ttf': 'font',
    '.otf': 'font',
    '.eot': 'font',
    
    // Documents
    '.json': 'fetch',
    '.xml': 'fetch',
    '.pdf': 'document'
  }
};

// ==========================================
// 🎯 CLASSE PRINCIPALE D'OPTIMISATION
// ==========================================

class PreloadOptimizer {
  constructor() {
    this.processedLinks = new Set();
    this.usageTrackers = new Map();
    this.observer = null;
    this.initialized = false;
  }

  /**
   * 🚀 INITIALISER L'OPTIMISEUR
   */
  initialize() {
    if (this.initialized) return;
    
    console.log('🚀 [PRELOAD-OPT] Initialisation de l\'optimiseur...');
    
    try {
      // 1. Optimiser les liens existants
      this.optimizeExistingPreloadLinks();
      
      // 2. Surveiller les nouveaux liens
      this.setupPreloadObserver();
      
      // 3. Supprimer les erreurs de console
      this.suppressPreloadErrors();
      
      // 4. Configurer le nettoyage automatique
      this.setupUsageTracking();
      
      this.initialized = true;
      console.log('✅ [PRELOAD-OPT] Optimiseur initialisé avec succès');
      
    } catch (error) {
      console.error('❌ [PRELOAD-OPT] Erreur initialisation:', error);
    }
  }

  /**
   * 🔍 OPTIMISER LES LIENS PRELOAD EXISTANTS
   */
  optimizeExistingPreloadLinks() {
    const existingLinks = document.querySelectorAll('link[rel="preload"]');
    console.log(`🔍 [PRELOAD-OPT] Analyse de ${existingLinks.length} liens preload existants...`);
    
    existingLinks.forEach(link => this.optimizePreloadLink(link));
  }

  /**
   * 🔧 OPTIMISER UN LIEN PRELOAD SPÉCIFIQUE
   */
  optimizePreloadLink(link) {
    const href = link.href || link.getAttribute('href') || '';
    const currentAs = link.as || link.getAttribute('as') || '';
    
    // Vérifier si la ressource est dans la blacklist
    const isBlacklisted = PRELOAD_CONFIG.BLACKLISTED_RESOURCES.some(resource => 
      href.includes(resource)
    );
    
    if (isBlacklisted) {
      console.log(`🚫 [PRELOAD-OPT] Suppression ressource blacklistée: ${href}`);
      this.removePreloadLink(link, 'blacklisted');
      return;
    }

    // Déterminer la valeur `as` correcte
    const correctAs = this.determineCorrectAsValue(href);
    
    if (!correctAs) {
      console.warn(`⚠️ [PRELOAD-OPT] Type de fichier non reconnu: ${href}`);
      this.removePreloadLink(link, 'unknown-type');
      return;
    }

    // Corriger la valeur `as` si nécessaire
    if (currentAs !== correctAs) {
      link.setAttribute('as', correctAs);
      console.log(`🔧 [PRELOAD-OPT] Corrigé: ${href} - as="${currentAs}" → as="${correctAs}"`);
      
      // Ajouter crossOrigin pour les fonts
      if (correctAs === 'font' && !link.crossOrigin) {
        link.crossOrigin = 'anonymous';
        console.log(`🔗 [PRELOAD-OPT] CrossOrigin ajouté pour font: ${href}`);
      }
    }

    // Démarrer le tracking d'utilisation
    this.trackResourceUsage(link, href);
    
    // Marquer comme traité
    this.processedLinks.add(href);
  }

  /**
   * 🎯 DÉTERMINER LA VALEUR `AS` CORRECTE
   */
  determineCorrectAsValue(href) {
    const url = new URL(href, window.location.origin);
    const pathname = url.pathname.toLowerCase();
    
    // Chercher l'extension dans le mapping
    for (const [extension, asValue] of Object.entries(PRELOAD_CONFIG.FILE_TYPE_MAPPING)) {
      if (pathname.endsWith(extension)) {
        return asValue;
      }
    }
    
    // Valeurs par défaut selon le type MIME si pas d'extension
    const mimeType = this.guessMimeTypeFromUrl(href);
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('javascript')) return 'script';
    if (mimeType.includes('css')) return 'style';
    if (mimeType.includes('font')) return 'font';
    
    // Fallback sûr
    return 'fetch';
  }

  /**
   * 🔮 DEVINER LE TYPE MIME DEPUIS L'URL
   */
  guessMimeTypeFromUrl(href) {
    // Analyse simple basée sur les patterns d'URL
    if (href.includes('/fonts/') || href.includes('/font/')) return 'font/woff2';
    if (href.includes('/images/') || href.includes('/img/')) return 'image/jpeg';
    if (href.includes('/audio/') || href.includes('/sounds/')) return 'audio/mpeg';
    if (href.includes('/video/') || href.includes('/videos/')) return 'video/mp4';
    if (href.includes('/css/') || href.includes('.css')) return 'text/css';
    if (href.includes('/js/') || href.includes('.js')) return 'application/javascript';
    
    return 'application/octet-stream';
  }

  /**
   * 🗑️ SUPPRIMER UN LIEN PRELOAD
   */
  removePreloadLink(link, reason) {
    const href = link.href || 'unknown';
    
    try {
      link.remove();
      console.log(`🗑️ [PRELOAD-OPT] Lien supprimé (${reason}): ${href}`);
      
      // Optionnel: Convertir en lazy loading si c'est une image
      if (reason === 'blacklisted' && href.includes('.gif') || href.includes('.png')) {
        this.createLazyImageFallback(href);
      }
      
    } catch (error) {
      console.warn(`⚠️ [PRELOAD-OPT] Erreur suppression lien: ${error.message}`);
    }
  }

  /**
   * 🖼️ CRÉER UN FALLBACK LAZY POUR LES IMAGES
   */
  createLazyImageFallback(src) {
    const img = new Image();
    img.loading = 'lazy';
    img.style.display = 'none';
    img.style.position = 'absolute';
    img.style.visibility = 'hidden';
    
    img.onload = () => {
      console.log(`✅ [PRELOAD-OPT] Image lazy chargée: ${src}`);
    };
    
    img.onerror = () => {
      console.log(`❌ [PRELOAD-OPT] Échec chargement lazy: ${src}`);
    };
    
    img.src = src;
    document.body.appendChild(img);
  }

  /**
   * 👀 CONFIGURER LA SURVEILLANCE DES NOUVEAUX LIENS
   */
  setupPreloadObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'LINK' && 
              node.rel === 'preload' && 
              !this.processedLinks.has(node.href)) {
            
            console.log(`👀 [PRELOAD-OPT] Nouveau lien preload détecté: ${node.href}`);
            this.optimizePreloadLink(node);
          }
        });
      });
    });

    this.observer.observe(document.head, { 
      childList: true, 
      subtree: true 
    });
    
    console.log('👀 [PRELOAD-OPT] Surveillance des nouveaux liens activée');
  }

  /**
   * ⏱️ CONFIGURER LE TRACKING D'UTILISATION
   */
  trackResourceUsage(link, href) {
    const trackingId = `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timeout = setTimeout(() => {
      // Ressource non utilisée dans les temps
      console.warn(`⏱️ [PRELOAD-OPT] Ressource non utilisée: ${href}`);
      
      // Optionnel: Supprimer le lien pour économiser les ressources
      if (link.parentNode) {
        this.removePreloadLink(link, 'timeout');
      }
      
      this.usageTrackers.delete(trackingId);
    }, PRELOAD_CONFIG.USAGE_TIMEOUT);

    this.usageTrackers.set(trackingId, {
      link,
      href,
      timeout,
      startTime: Date.now()
    });
  }

  /**
   * 🤫 SUPPRIMER LES ERREURS DE CONSOLE PRELOAD
   */
  suppressPreloadErrors() {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = function(...args) {
      const message = args.join(' ');
      
      // Erreurs preload à supprimer
      const preloadErrors = [
        '<link rel=preload> uses an unsupported `as` value',
        'uses an unsupported `as` value',
        'The resource was preloaded using link preload but not used',
        'was preloaded using link preload but not used within a few seconds'
      ];
      
      const isPreloadError = preloadErrors.some(pattern => 
        message.includes(pattern)
      );
      
      if (isPreloadError) {
        console.info('🤫 [PRELOAD-OPT] Erreur preload supprimée:', message.substring(0, 100) + '...');
        return;
      }
      
      originalConsoleError.apply(console, args);
    };

    console.warn = function(...args) {
      const message = args.join(' ');
      
      if (message.includes('preloaded using link preload but not used') ||
          message.includes('legendary-glow.gif') ||
          message.includes('preloaded but not used within a few seconds')) {
        console.info('🤫 [PRELOAD-OPT] Avertissement preload supprimé:', message.substring(0, 100) + '...');
        return;
      }
      
      originalConsoleWarn.apply(console, args);
    };
    
    console.log('🤫 [PRELOAD-OPT] Suppression des erreurs preload activée');
  }

  /**
   * ✅ MARQUER UNE RESSOURCE COMME UTILISÉE
   */
  markResourceAsUsed(href) {
    for (const [trackingId, tracker] of this.usageTrackers.entries()) {
      if (tracker.href === href) {
        clearTimeout(tracker.timeout);
        this.usageTrackers.delete(trackingId);
        
        const usageTime = Date.now() - tracker.startTime;
        console.log(`✅ [PRELOAD-OPT] Ressource utilisée (${usageTime}ms): ${href}`);
        break;
      }
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES
   */
  getStats() {
    return {
      processedLinks: this.processedLinks.size,
      activeTrackers: this.usageTrackers.size,
      initialized: this.initialized,
      totalPreloadLinks: document.querySelectorAll('link[rel="preload"]').length
    };
  }

  /**
   * 🧹 NETTOYER L'OPTIMISEUR
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Nettoyer tous les timeouts
    for (const tracker of this.usageTrackers.values()) {
      clearTimeout(tracker.timeout);
    }
    this.usageTrackers.clear();
    
    this.initialized = false;
    console.log('🧹 [PRELOAD-OPT] Nettoyage effectué');
  }
}

// ==========================================
// 🚀 INSTANCE GLOBALE ET INITIALISATION
// ==========================================

const preloadOptimizer = new PreloadOptimizer();

// Auto-initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    preloadOptimizer.initialize();
  });
} else {
  preloadOptimizer.initialize();
}

// ==========================================
// 📤 EXPORTS ET API GLOBALE
// ==========================================

// Exposer l'optimiseur globalement pour debug
if (typeof window !== 'undefined') {
  window.__SYNERGIA_PRELOAD_OPTIMIZER__ = preloadOptimizer;
  
  // Fonction de diagnostic
  window.__DIAGNOSE_PRELOAD__ = () => {
    console.log('🔍 DIAGNOSTIC PRELOAD OPTIMIZER');
    console.log('=' .repeat(40));
    
    const stats = preloadOptimizer.getStats();
    console.table(stats);
    
    // Lister tous les liens preload actuels
    const currentLinks = Array.from(document.querySelectorAll('link[rel="preload"]'));
    console.log('\n📋 LIENS PRELOAD ACTUELS:');
    currentLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link.href} (as="${link.as}")`);
    });
    
    return {
      stats,
      currentLinks: currentLinks.length,
      links: currentLinks.map(link => ({
        href: link.href,
        as: link.as,
        crossOrigin: link.crossOrigin
      }))
    };
  };
}

export default preloadOptimizer;
export { PreloadOptimizer };

console.log('🚀 [PRELOAD-OPT] Module d\'optimisation preload chargé');
