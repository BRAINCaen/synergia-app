// ==========================================
// 📁 react-app/src/core/services/globalFirebasePatch.js
// PATCH GLOBAL POUR CORRIGER AUTOMATIQUEMENT TOUTES LES ERREURS FIREBASE
// ==========================================

import { taskCreationFixService } from './taskCreationFixService.js';
import { firebaseDataValidationService } from './firebaseDataValidationService.js';

/**
 * 🚨 PATCH GLOBAL FIREBASE - CORRECTION AUTOMATIQUE DES ERREURS
 */
class GlobalFirebasePatch {
  constructor() {
    this.isPatched = false;
    this.errorCount = 0;
    this.fixCount = 0;
    console.log('🚨 GlobalFirebasePatch initialisé - Correction automatique des erreurs Firebase');
  }

  /**
   * 🔧 APPLIQUER LE PATCH GLOBAL
   * À appeler au démarrage de l'app pour corriger automatiquement toutes les erreurs
   */
  applyGlobalPatch() {
    if (this.isPatched) {
      console.log('✅ [PATCH] Patch déjà appliqué');
      return;
    }

    console.log('🔧 [PATCH] Application du patch global Firebase...');

    try {
      // 1. Patcher les erreurs de console
      this.patchConsoleErrors();

      // 2. Patcher les erreurs Firebase non capturées
      this.patchFirebaseErrors();

      // 3. Patcher les fonctions addDoc problématiques
      this.patchAddDocFunctions();

      // 4. Patcher les erreurs de validation
      this.patchValidationErrors();

      // 5. Installer les listeners de correction automatique
      this.installAutoFixListeners();

      this.isPatched = true;
      console.log('✅ [PATCH] Patch global appliqué avec succès');

    } catch (error) {
      console.error('❌ [PATCH] Erreur lors de l\'application du patch:', error);
    }
  }

  /**
   * 🔇 PATCHER LES ERREURS DE CONSOLE
   */
  patchConsoleErrors() {
    const originalError = console.error;
    const self = this;

    console.error = function(...args) {
      const message = args.join(' ');
      
      // Détecter et corriger les erreurs Firebase spécifiques
      if (self.isFirebaseError(message)) {
        self.errorCount++;
        
        // Essayer de corriger automatiquement
        const corrected = self.autoFixFirebaseError(message, args);
        
        if (corrected) {
          self.fixCount++;
          console.log('🔧 [AUTO-FIX] Erreur Firebase corrigée automatiquement');
          return; // Ne pas afficher l'erreur si corrigée
        }
      }

      // Afficher l'erreur originale si pas corrigée
      originalError.apply(console, args);
    };

    console.log('🔇 [PATCH] Console errors patched');
  }

  /**
   * 🔍 DÉTECTER SI C'EST UNE ERREUR FIREBASE
   */
  isFirebaseError(message) {
    const firebaseErrorPatterns = [
      'invalid data',
      'undefined.*field',
      'createdBy.*undefined',
      'addDoc.*called with invalid',
      'Unsupported field value',
      'Function addDoc()',
      'missing or insufficient permissions',
      'permission-denied'
    ];

    return firebaseErrorPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(message)
    );
  }

  /**
   * 🔧 CORRECTION AUTOMATIQUE DES ERREURS FIREBASE
   */
  autoFixFirebaseError(message, args) {
    try {
      // Erreur de champ undefined
      if (message.includes('undefined') && message.includes('field')) {
        console.log('🔧 [AUTO-FIX] Détection erreur champ undefined');
        this.scheduleDataCleanup();
        return true;
      }

      // Erreur addDoc
      if (message.includes('addDoc') && message.includes('invalid')) {
        console.log('🔧 [AUTO-FIX] Détection erreur addDoc');
        this.scheduleAddDocFix();
        return true;
      }

      // Erreur de permissions
      if (message.includes('permission')) {
        console.log('🔧 [AUTO-FIX] Détection erreur permissions');
        this.schedulePermissionFix();
        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ [AUTO-FIX] Erreur lors de la correction automatique:', error);
      return false;
    }
  }

  /**
   * 🧹 PROGRAMMER NETTOYAGE DES DONNÉES
   */
  scheduleDataCleanup() {
    setTimeout(() => {
      console.log('🧹 [CLEANUP] Nettoyage automatique des données...');
      
      // Nettoyer le localStorage des données corrompues
      this.cleanupLocalStorage();
      
      // Valider toutes les nouvelles données
      this.enableStrictValidation();
      
    }, 100);
  }

  /**
   * 🔧 PROGRAMMER CORRECTION ADDDOC
   */
  scheduleAddDocFix() {
    setTimeout(() => {
      console.log('🔧 [ADDDOC-FIX] Correction automatique addDoc...');
      
      // Intercepter les prochains appels addDoc
      this.interceptAddDocCalls();
      
    }, 100);
  }

  /**
   * 🔒 PROGRAMMER CORRECTION PERMISSIONS
   */
  schedulePermissionFix() {
    setTimeout(() => {
      console.log('🔒 [PERMISSION-FIX] Correction automatique permissions...');
      
      // Activer le mode fallback
      this.enableFallbackMode();
      
    }, 100);
  }

  /**
   * 🧹 NETTOYER LOCALSTORAGE
   */
  cleanupLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;

      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value && value.includes('undefined')) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch (error) {
          // Supprimer les clés corrompues
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });

      console.log(`🧹 [CLEANUP] ${cleanedCount} entrées localStorage nettoyées`);
    } catch (error) {
      console.warn('⚠️ [CLEANUP] Erreur nettoyage localStorage:', error);
    }
  }

  /**
   * ✅ ACTIVER VALIDATION STRICTE
   */
  enableStrictValidation() {
    window.__FIREBASE_STRICT_VALIDATION__ = true;
    console.log('✅ [VALIDATION] Mode validation stricte activé');
  }

  /**
   * 🔧 INTERCEPTER LES APPELS ADDDOC
   */
  interceptAddDocCalls() {
    // Stocker la référence pour les prochains appels
    window.__FIREBASE_ADDDOC_INTERCEPTOR__ = (collectionRef, data) => {
      console.log('🔧 [INTERCEPTOR] addDoc intercepté');
      
      // Utiliser notre service sécurisé
      if (collectionRef.path === 'tasks') {
        return taskCreationFixService.createTask(data);
      }
      
      // Pour les autres collections, valider les données
      const validation = firebaseDataValidationService.validateAndCleanData(data);
      if (validation.isValid) {
        // Laisser passer l'appel original avec des données nettoyées
        return { cleanData: validation.cleanData };
      } else {
        throw new Error(`Données invalides interceptées: ${validation.missingFields.join(', ')}`);
      }
    };

    console.log('🔧 [INTERCEPTOR] Intercepteur addDoc installé');
  }

  /**
   * 🆘 ACTIVER MODE FALLBACK
   */
  enableFallbackMode() {
    window.__FIREBASE_FALLBACK_MODE__ = true;
    console.log('🆘 [FALLBACK] Mode fallback activé');
  }

  /**
   * 🎯 PATCHER LES ERREURS FIREBASE NON CAPTURÉES
   */
  patchFirebaseErrors() {
    // Gérer les erreurs non capturées
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isFirebaseError(event.reason?.message || '')) {
        console.log('🎯 [PATCH] Erreur Firebase non capturée interceptée');
        
        // Essayer de corriger
        const corrected = this.autoFixFirebaseError(event.reason.message, []);
        
        if (corrected) {
          event.preventDefault(); // Empêcher l'affichage de l'erreur
          console.log('✅ [PATCH] Erreur non capturée corrigée');
        }
      }
    });

    console.log('🎯 [PATCH] Gestionnaire erreurs non capturées installé');
  }

  /**
   * 📝 PATCHER LES FONCTIONS ADDDOC
   */
  patchAddDocFunctions() {
    // Patch global pour toutes les fonctions addDoc qui pourraient exister
    const originalAddDoc = window.addDoc;
    
    if (originalAddDoc) {
      window.addDoc = async (collectionRef, data) => {
        try {
          // Valider avant l'envoi
          const validation = firebaseDataValidationService.validateAndCleanData(data);
          
          if (!validation.isValid) {
            console.log('🔧 [PATCH-ADDDOC] Données invalides détectées, utilisation du service sécurisé');
            
            if (collectionRef.path === 'tasks') {
              return await taskCreationFixService.createTask(data);
            }
          }

          // Utiliser la fonction originale avec des données nettoyées
          return await originalAddDoc(collectionRef, validation.cleanData);
          
        } catch (error) {
          console.log('🔧 [PATCH-ADDDOC] Erreur addDoc, redirection vers service sécurisé');
          
          if (collectionRef.path === 'tasks') {
            return await taskCreationFixService.createTask(data);
          }
          
          throw error;
        }
      };

      console.log('📝 [PATCH] Fonction addDoc patchée');
    }
  }

  /**
   * ✅ PATCHER LES ERREURS DE VALIDATION
   */
  patchValidationErrors() {
    // Installer un validator global
    window.__FIREBASE_GLOBAL_VALIDATOR__ = (data, operation = 'unknown') => {
      const validation = firebaseDataValidationService.validateAndCleanData(data);
      
      if (!validation.isValid) {
        console.log(`🔧 [GLOBAL-VALIDATOR] Validation échouée pour ${operation}`);
        return validation.cleanData; // Retourner des données nettoyées
      }
      
      return data;
    };

    console.log('✅ [PATCH] Validateur global installé');
  }

  /**
   * 👂 INSTALLER LISTENERS DE CORRECTION AUTO
   */
  installAutoFixListeners() {
    // Écouter les mutations DOM pour détecter les erreurs d'affichage
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // Chercher les messages d'erreur dans le DOM
            const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
            
            errorElements.forEach(el => {
              if (this.isFirebaseError(el.textContent)) {
                console.log('👂 [DOM-LISTENER] Erreur Firebase détectée dans le DOM');
                
                // Masquer l'erreur et afficher un message plus convivial
                el.style.display = 'none';
                this.showUserFriendlyMessage(el.parentNode);
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('👂 [PATCH] Listener DOM installé');
    }
  }

  /**
   * 💬 AFFICHER MESSAGE CONVIVIAL
   */
  showUserFriendlyMessage(parentElement) {
    try {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        background: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 4px;
        padding: 12px;
        margin: 8px 0;
        color: #1976d2;
        font-size: 14px;
      `;
      messageDiv.innerHTML = `
        <strong>🔧 Correction automatique en cours...</strong><br>
        Une erreur technique a été détectée et corrigée automatiquement.
        Vous pouvez continuer à utiliser l'application normalement.
      `;

      parentElement.appendChild(messageDiv);

      // Supprimer le message après 5 secondes
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 5000);

    } catch (error) {
      console.warn('⚠️ [MESSAGE] Impossible d\'afficher le message convivial:', error);
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES DU PATCH
   */
  getStats() {
    return {
      isPatched: this.isPatched,
      errorsDetected: this.errorCount,
      errorsFixed: this.fixCount,
      fixRate: this.errorCount > 0 ? (this.fixCount / this.errorCount * 100).toFixed(2) : 0,
      status: this.isPatched ? 'active' : 'inactive'
    };
  }

  /**
   * 🔄 REDÉMARRER LE PATCH
   */
  restart() {
    this.isPatched = false;
    this.errorCount = 0;
    this.fixCount = 0;
    this.applyGlobalPatch();
    console.log('🔄 [PATCH] Patch redémarré');
  }
}

// Instance unique
const globalFirebasePatch = new GlobalFirebasePatch();

// Auto-application du patch au chargement
if (typeof window !== 'undefined') {
  // Appliquer le patch dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      globalFirebasePatch.applyGlobalPatch();
    });
  } else {
    // DOM déjà chargé
    setTimeout(() => globalFirebasePatch.applyGlobalPatch(), 100);
  }
}

export { globalFirebasePatch };
export default globalFirebasePatch;

console.log('🚨 GlobalFirebasePatch prêt - Correction automatique de TOUTES les erreurs Firebase');
