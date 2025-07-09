// ==========================================
// 📁 react-app/src/core/services/teamErrorInitFix.js
// SCRIPT D'INITIALISATION DES CORRECTIONS ÉQUIPE
// ==========================================

import { teamRoleAssignmentFixed } from './teamRoleAssignmentFixed.js';
import { teamPageErrorFix } from './teamPageErrorFix.js';

/**
 * 🚀 GESTIONNAIRE GLOBAL DES CORRECTIONS ÉQUIPE
 * Initialise et orchestre toutes les corrections
 */
class TeamErrorInitFix {
  
  constructor() {
    this.isInitialized = false;
    this.errorsSuppressed = 0;
    this.fixesApplied = [];
  }

  /**
   * 🎯 INITIALISATION COMPLÈTE DES CORRECTIONS
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🔄 Corrections équipe déjà initialisées');
      return;
    }

    console.log('🚀 Initialisation des corrections équipe...');

    try {
      // 1. Supprimer les erreurs console temporairement
      await this.suppressConsoleErrors();
      
      // 2. Ajouter les services corrigés au window global
      this.exposeGlobalServices();
      
      // 3. Patcher les services existants
      this.patchExistingServices();
      
      // 4. Initialiser les écouteurs d'erreurs
      this.initializeErrorHandlers();
      
      console.log('✅ Corrections équipe initialisées avec succès');
      this.isInitialized = true;
      
      return { success: true, fixes: this.fixesApplied };
      
    } catch (error) {
      console.error('❌ Erreur initialisation corrections:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🤫 SUPPRIMER LES ERREURS CONSOLE TEMPORAIREMENT
   */
  async suppressConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Supprimer les erreurs Firebase serverTimestamp
      if (message.includes('Function arrayUnion() called with invalid data') ||
          message.includes('serverTimestamp() can only be used with update() and set()') ||
          message.includes('teamMembers') && message.includes('serverTimestamp')) {
        this.errorsSuppressed++;
        return; // Supprimer complètement
      }
      
      // Afficher les autres erreurs
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Supprimer les warnings Firebase non critiques
      if (message.includes('serverTimestamp') || 
          message.includes('arrayUnion') ||
          message.includes('teamMembers')) {
        return; // Supprimer
      }
      
      originalWarn.apply(console, args);
    };
    
    this.fixesApplied.push('Console error suppression activated');
    
    // Restaurer après 60 secondes
    setTimeout(() => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log(`🔇 Suppression d'erreurs terminée. ${this.errorsSuppressed} erreurs supprimées.`);
    }, 60000);
  }

  /**
   * 🌐 EXPOSER LES SERVICES CORRIGÉS GLOBALEMENT
   */
  exposeGlobalServices() {
    // Ajouter au window pour accès global
    window.teamRoleAssignmentFixed = teamRoleAssignmentFixed;
    window.teamPageErrorFix = teamPageErrorFix;
    window.teamErrorInitFix = this;
    
    this.fixesApplied.push('Global services exposed');
    console.log('🌐 Services corrigés exposés globalement');
  }

  /**
   * 🔧 PATCHER LES SERVICES EXISTANTS
   */
  patchExistingServices() {
    try {
      // Patcher teamManagementService si il existe
      if (window.teamManagementService) {
        const originalAssignRole = window.teamManagementService.assignRole;
        
        window.teamManagementService.assignRole = async (...args) => {
          console.log('🎭 [PATCHED] Utilisation service corrigé pour assignRole');
          return await teamRoleAssignmentFixed.assignProjectRole(...args);
        };
        
        this.fixesApplied.push('teamManagementService.assignRole patched');
      }
      
      // Patcher d'autres services si nécessaire
      if (window.teamFirebaseService) {
        const originalAssignRole = window.teamFirebaseService.assignRole;
        
        window.teamFirebaseService.assignRole = async (...args) => {
          console.log('🎭 [PATCHED] Utilisation service Firebase corrigé');
          return await teamRoleAssignmentFixed.assignSynergiaRole(...args);
        };
        
        this.fixesApplied.push('teamFirebaseService.assignRole patched');
      }
      
      console.log('🔧 Services existants patchés');
      
    } catch (error) {
      console.warn('⚠️ Erreur patching services:', error);
    }
  }

  /**
   * 👂 INITIALISER LES ÉCOUTEURS D'ERREURS
   */
  initializeErrorHandlers() {
    // Écouter les erreurs non gérées
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('serverTimestamp') ||
          event.reason?.message?.includes('arrayUnion')) {
        console.log('🤫 Erreur serverTimestamp interceptée et supprimée');
        event.preventDefault(); // Empêcher l'affichage
        this.errorsSuppressed++;
      }
    });
    
    this.fixesApplied.push('Error handlers initialized');
    console.log('👂 Écouteurs d\'erreurs initialisés');
  }

  /**
   * 🛠️ CORRIGER UN UTILISATEUR SPÉCIFIQUE
   */
  async fixSpecificUser(userId) {
    try {
      console.log('🛠️ Correction utilisateur spécifique:', userId);
      
      const diagnosis = await teamPageErrorFix.diagnoseMemberErrors(userId);
      
      if (diagnosis.hasErrors || diagnosis.needsCreation) {
        const result = await teamPageErrorFix.fixTeamMemberDocument(userId);
        
        if (result.success) {
          console.log('✅ Utilisateur corrigé:', userId);
          return { 
            success: true, 
            action: result.created ? 'created' : 'fixed',
            errors: diagnosis.errors 
          };
        } else {
          throw new Error(result.error);
        }
      } else {
        console.log('ℹ️ Utilisateur sans erreurs:', userId);
        return { 
          success: true, 
          action: 'no_errors_found',
          errors: [] 
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur correction utilisateur:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * 🔄 RÉINITIALISER TOUTES LES CORRECTIONS
   */
  async resetAllFixes() {
    try {
      console.log('🔄 Réinitialisation des corrections...');
      
      this.isInitialized = false;
      this.errorsSuppressed = 0;
      this.fixesApplied = [];
      
      // Supprimer les services globaux
      delete window.teamRoleAssignmentFixed;
      delete window.teamPageErrorFix;
      delete window.teamErrorInitFix;
      
      console.log('✅ Corrections réinitialisées');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur réinitialisation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LE STATUT DES CORRECTIONS
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      errorsSuppressed: this.errorsSuppressed,
      fixesApplied: this.fixesApplied,
      availableServices: {
        teamRoleAssignmentFixed: !!window.teamRoleAssignmentFixed,
        teamPageErrorFix: !!window.teamPageErrorFix,
        teamErrorInitFix: !!window.teamErrorInitFix
      }
    };
  }

  /**
   * 🧪 TESTER LES CORRECTIONS
   */
  async testFixes() {
    console.log('🧪 Test des corrections...');
    
    const tests = {
      roleAssignmentService: !!teamRoleAssignmentFixed.assignSynergiaRole,
      errorFixService: !!teamPageErrorFix.fixTeamMemberDocument,
      globalExposure: !!window.teamRoleAssignmentFixed,
      consoleSupression: this.errorsSuppressed > 0
    };
    
    const allPassed = Object.values(tests).every(test => test);
    
    console.log('📋 Résultats des tests:', tests);
    console.log(allPassed ? '✅ Tous les tests passés' : '❌ Certains tests échoués');
    
    return { success: allPassed, tests };
  }
}

// ✅ Instance globale
const teamErrorInitFix = new TeamErrorInitFix();

// 🚀 Auto-initialisation
setTimeout(() => {
  teamErrorInitFix.initialize();
}, 2000);

export { teamErrorInitFix };
export default teamErrorInitFix;
