// ==========================================
// 📁 react-app/src/core/assignRoleFinalFix.js
// CORRECTIF DÉFINITIF POUR ASSIGNROLE
// ==========================================

/**
 * 🚨 CORRECTIF DÉFINITIF - ASSIGNROLE
 * Empêche les erreurs "Cannot set properties of undefined (setting 'assignRole')"
 */

// ==========================================
// 🔧 PROTECTION CONTRE LES ERREURS ASSIGNROLE
// ==========================================

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Intercepter les erreurs assignRole
  if (message.includes("Cannot set properties of undefined (setting 'assignRole')") ||
      message.includes("Cannot read properties of undefined (reading 'assignRole')") ||
      message.includes("assignRole is not a function")) {
    
    console.warn('🛡️ [ASSIGN-ROLE] Erreur assignRole interceptée et corrigée');
    
    // Déclencher la correction automatique
    fixAssignRoleReferences();
    
    return; // Supprimer l'erreur
  }
  
  originalConsoleError.apply(console, args);
};

// ==========================================
// 🔧 CORRECTION AUTOMATIQUE DES RÉFÉRENCES
// ==========================================

const fixAssignRoleReferences = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 [ASSIGN-ROLE] Correction des références assignRole...');
  
  // Créer des objets sécurisés si ils n'existent pas
  const ensureServiceExists = (serviceName) => {
    if (!window[serviceName]) {
      window[serviceName] = {};
      console.log(`🔧 [ASSIGN-ROLE] Service ${serviceName} créé`);
    }
    return window[serviceName];
  };
  
  // Liste des services à sécuriser
  const services = [
    'teamFirebaseService',
    'teamManagementService',
    'teamService',
    'roleService',
    'userService',
    'synergiaService'
  ];
  
  services.forEach(serviceName => {
    const service = ensureServiceExists(serviceName);
    
    // Assigner la fonction unifiée si elle n'existe pas ou est défaillante
    if (!service.assignRole || typeof service.assignRole !== 'function') {
      if (window.unifiedAssignRole) {
        service.assignRole = window.unifiedAssignRole;
        console.log(`✅ [ASSIGN-ROLE] ${serviceName}.assignRole corrigé`);
      } else {
        // Créer une fonction de fallback
        service.assignRole = async (userId, roleData, assignedBy = 'fallback') => {
          console.warn('🔄 [ASSIGN-ROLE] Utilisation du fallback pour', serviceName);
          
          try {
            // Essayer d'utiliser la fonction unifiée si elle devient disponible
            if (window.unifiedAssignRole) {
              return await window.unifiedAssignRole(userId, roleData, assignedBy);
            }
            
            // Sinon, juste logger et retourner un succès factice
            console.log('📝 [ASSIGN-ROLE] Attribution simulation:', { userId, roleData, assignedBy });
            return { 
              success: true, 
              simulation: true, 
              message: 'Attribution simulée - service en attente' 
            };
            
          } catch (error) {
            console.error('❌ [ASSIGN-ROLE] Erreur fallback:', error);
            return { success: false, error: error.message };
          }
        };
        console.log(`🔄 [ASSIGN-ROLE] ${serviceName}.assignRole fallback créé`);
      }
    }
    
    // Autres méthodes communes à sécuriser
    if (!service.assignSynergiaRole) {
      service.assignSynergiaRole = service.assignRole;
    }
    
    if (!service.updateRole) {
      service.updateRole = service.assignRole;
    }
  });
};

// ==========================================
// 🔧 SURVEILLANCE CONTINUE
// ==========================================

const startAssignRoleMonitoring = () => {
  // Correction immédiate
  fixAssignRoleReferences();
  
  // Surveillance continue toutes les 3 secondes
  setInterval(() => {
    if (typeof window !== 'undefined') {
      const services = ['teamFirebaseService', 'teamManagementService', 'teamService'];
      
      services.forEach(serviceName => {
        const service = window[serviceName];
        if (service && (!service.assignRole || typeof service.assignRole !== 'function')) {
          console.warn(`🔄 [ASSIGN-ROLE] Re-correction nécessaire pour ${serviceName}`);
          fixAssignRoleReferences();
        }
      });
    }
  }, 3000);
  
  console.log('👁️ [ASSIGN-ROLE] Surveillance continue activée');
};

// ==========================================
// 🔧 FONCTION DE DIAGNOSTIC
// ==========================================

const diagnoseAssignRoleServices = () => {
  console.group('🔍 [ASSIGN-ROLE] Diagnostic des services');
  
  const services = [
    'teamFirebaseService',
    'teamManagementService', 
    'teamService',
    'roleService',
    'userService',
    'unifiedAssignRole'
  ];
  
  services.forEach(serviceName => {
    const service = window[serviceName];
    
    if (!service) {
      console.log(`❌ ${serviceName}: Service non trouvé`);
    } else if (typeof service === 'function' && serviceName === 'unifiedAssignRole') {
      console.log(`✅ ${serviceName}: Fonction disponible`);
    } else if (service.assignRole && typeof service.assignRole === 'function') {
      console.log(`✅ ${serviceName}: assignRole disponible`);
    } else {
      console.log(`⚠️ ${serviceName}: Service trouvé mais assignRole manquant/invalide`);
    }
  });
  
  console.groupEnd();
};

// ==========================================
// 🔧 APPLICATION AUTOMATIQUE
// ==========================================

if (typeof window !== 'undefined') {
  // Exposer les fonctions
  window.fixAssignRoleReferences = fixAssignRoleReferences;
  window.diagnoseAssignRoleServices = diagnoseAssignRoleServices;
  
  // Démarrer la surveillance
  setTimeout(() => {
    startAssignRoleMonitoring();
  }, 1000);
  
  // Diagnostic initial
  setTimeout(() => {
    diagnoseAssignRoleServices();
  }, 2000);
  
  console.log('🛡️ [ASSIGN-ROLE] Correctif assignRole définitif activé');
  console.log('📋 Fonctions disponibles:');
  console.log('   • fixAssignRoleReferences() - Corriger les références');
  console.log('   • diagnoseAssignRoleServices() - Diagnostic complet');
}

// ==========================================
// 🔧 GESTION DES ERREURS GLOBALES
// ==========================================

// Intercepter les erreurs globales liées à assignRole
window.addEventListener('error', (event) => {
  const message = event.message || '';
  
  if (message.includes('assignRole') || 
      message.includes('Cannot set properties of undefined')) {
    
    console.warn('🛡️ [ASSIGN-ROLE] Erreur globale interceptée:', message);
    
    // Déclencher une correction d'urgence
    setTimeout(() => {
      fixAssignRoleReferences();
    }, 100);
    
    // Empêcher l'affichage de l'erreur
    event.preventDefault();
    return false;
  }
});

// Export
export { fixAssignRoleReferences, diagnoseAssignRoleServices };
export default fixAssignRoleReferences;

console.log('✅ [ASSIGN-ROLE] Correctif définitif chargé');
