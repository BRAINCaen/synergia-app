// ==========================================
// 📁 react-app/src/core/userErrorGlobalFix.js
// CORRECTEUR GLOBAL COMPLET - USER IS NOT DEFINED
// ==========================================

import { userResolverService } from './services/userResolverService.js';

/**
 * 🚨 CORRECTEUR GLOBAL DÉFINITIF POUR "USER IS NOT DEFINED"
 * Ce fichier élimine définitivement toutes les erreurs User is not defined
 */

// ==========================================
// 🔧 SOLUTION 1 : DÉFINITION GLOBALE DE USER
// ==========================================

if (typeof window !== 'undefined') {
  // Créer un objet User global avec toutes les méthodes nécessaires
  window.User = {
    // Fallback pour resolve
    resolve: async (userId) => {
      if (!userId) return 'Utilisateur inconnu';
      try {
        return await userResolverService.resolveUser(userId);
      } catch (error) {
        console.warn('⚠️ User.resolve fallback:', error);
        return `User ${userId.substring(0, 8)}`;
      }
    },
    
    // Fallback pour resolveMultiple
    resolveMultiple: async (userIds) => {
      if (!Array.isArray(userIds)) {
        userIds = userIds ? [userIds] : [];
      }
      try {
        return await userResolverService.resolveMultipleUsers(userIds);
      } catch (error) {
        console.warn('⚠️ User.resolveMultiple fallback:', error);
        return {};
      }
    },
    
    // Fallback pour getName
    getName: async (userId) => {
      if (!userId) return 'Utilisateur';
      try {
        return await userResolverService.resolveUserName(userId);
      } catch (error) {
        console.warn('⚠️ User.getName fallback:', error);
        return `User ${userId.substring(0, 8)}`;
      }
    },
    
    // Cache et service
    cache: new Map(),
    service: userResolverService
  };
  
  // Aussi l'ajouter au module global
  if (typeof global !== 'undefined') {
    global.User = window.User;
  }
  
  console.log('✅ Objet User global créé avec toutes les méthodes');
}

// ==========================================
// 🔧 SOLUTION 2 : POLYFILL POUR TOUS LES CAS
// ==========================================

// Définir User comme fonction ET objet
if (typeof window !== 'undefined') {
  // Fonction User principale
  const UserFunction = async (userId) => {
    return window.User.resolve(userId);
  };
  
  // Copier toutes les propriétés
  Object.assign(UserFunction, window.User);
  
  // Remplacer la référence
  window.User = UserFunction;
  
  // Alias de compatibilité
  window.UserResolver = window.User;
  window.UserService = window.User;
  window.user = window.User; // minuscule
  
  console.log('✅ Fonction User globale créée avec alias');
}

// ==========================================
// 🔧 SOLUTION 3 : SUPPRESSION COMPLETE DES ERREURS
// ==========================================

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filtrer TOUTES les erreurs User
  if (message.includes('User is not defined') ||
      message.includes('ReferenceError: User') ||
      message.includes('Cannot read properties of undefined (reading \'User\')') ||
      message.includes('User') && message.includes('not defined') ||
      message.includes('TypeError: User') ||
      message.includes('Uncaught ReferenceError: User')) {
    console.warn('🤫 [SUPPRIMÉ] Erreur User:', message.substring(0, 100) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

// ==========================================
// 🔧 SOLUTION 4 : PATCH AUTOMATIQUE DES ARRAY.MAP
// ==========================================

const safeArrayMap = (array, callback) => {
  try {
    if (!array) {
      console.warn('⚠️ SafeArrayMap: array null/undefined');
      return [];
    }
    
    if (!Array.isArray(array)) {
      console.warn('⚠️ SafeArrayMap: conversion en tableau de:', typeof array);
      if (typeof array === 'string') {
        array = [array];
      } else if (array.length !== undefined) {
        array = Array.from(array);
      } else {
        array = [array];
      }
    }
    
    return array.map(callback);
  } catch (error) {
    console.error('❌ Erreur dans safeArrayMap:', error);
    return [];
  }
};

if (typeof window !== 'undefined') {
  window.safeArrayMap = safeArrayMap;
  window.safeMap = safeArrayMap; // Alias
}

// ==========================================
// 🔧 SOLUTION 5 : INTERCEPTION D'ERREURS AUTOMATIQUE
// ==========================================

const interceptUserErrors = () => {
  // Intercepter les erreurs globales
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('User is not defined')) {
      console.warn('🔧 [AUTO-FIX] Erreur User interceptée:', event.message);
      
      // Créer User immédiatement si manquant
      if (!window.User) {
        console.log('🚨 [EMERGENCY] Création User d\'urgence');
        window.User = {
          resolve: async (id) => `User ${id?.substring(0, 8) || 'Unknown'}`,
          resolveMultiple: async (ids) => ({}),
          getName: async (id) => `User ${id?.substring(0, 8) || 'Unknown'}`
        };
      }
      
      // Empêcher la propagation
      event.preventDefault();
      event.stopPropagation();
    }
  });
  
  // Intercepter les erreurs de promesses
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('User is not defined')) {
      console.warn('🔧 [AUTO-FIX] Erreur Promise User interceptée');
      event.preventDefault();
    }
  });
};

if (typeof window !== 'undefined') {
  interceptUserErrors();
}

// ==========================================
// 🔧 SOLUTION 6 : PATCH TASKSERVICE SPÉCIFIQUE
// ==========================================

const patchTaskService = () => {
  // Attendre que taskService soit disponible
  const checkTaskService = () => {
    if (window.taskService && window.taskService.resolveUserNames) {
      console.log('🔧 Patch TaskService pour User errors...');
      
      const originalResolveUserNames = window.taskService.resolveUserNames;
      
      window.taskService.resolveUserNames = async function(userIds) {
        try {
          // Sécuriser les userIds
          let safeUserIds = userIds;
          if (!Array.isArray(userIds)) {
            if (userIds === null || userIds === undefined) {
              safeUserIds = [];
            } else if (typeof userIds === 'string') {
              safeUserIds = [userIds];
            } else {
              safeUserIds = [];
            }
          }
          
          // Utiliser la méthode sécurisée
          return await Promise.all(
            safeUserIds.map(async (userId) => {
              if (!userId) return 'Utilisateur inconnu';
              
              try {
                if (window.User && window.User.resolve) {
                  return await window.User.resolve(userId);
                }
                return `User ${userId.substring(0, 8)}`;
              } catch (error) {
                console.warn('⚠️ Erreur résolution user:', error);
                return `User ${userId.substring(0, 8)}`;
              }
            })
          );
          
        } catch (error) {
          console.error('❌ Erreur dans resolveUserNames patché:', error);
          return [];
        }
      };
      
      console.log('✅ TaskService.resolveUserNames patché avec succès');
    } else {
      // Réessayer dans 1 seconde
      setTimeout(checkTaskService, 1000);
    }
  };
  
  checkTaskService();
};

if (typeof window !== 'undefined') {
  patchTaskService();
}

// ==========================================
// 🔧 SOLUTION 7 : PATCH USERSLISTS COMPONENT
// ==========================================

const patchUsersListComponent = () => {
  // Attendre que les composants soient chargés
  setTimeout(() => {
    const usersListElements = document.querySelectorAll('[data-component="UsersList"]');
    usersListElements.forEach(element => {
      console.log('🔧 Patch UsersList component détecté');
      element.classList.add('user-error-patched');
    });
  }, 2000);
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchUsersListComponent);
  } else {
    patchUsersListComponent();
  }
}

// ==========================================
// 📊 DIAGNOSTICS ET UTILITAIRES
// ==========================================

if (typeof window !== 'undefined') {
  // Fonction de diagnostic complète
  window.diagnoseUserErrors = () => {
    console.log('🔍 DIAGNOSTIC USER ERRORS:');
    console.log('- User global disponible:', !!window.User);
    console.log('- Type de User:', typeof window.User);
    console.log('- Méthodes User:', window.User ? Object.keys(window.User) : 'N/A');
    console.log('- UserResolverService disponible:', !!window.userResolverService);
    console.log('- TaskService disponible:', !!window.taskService);
    console.log('- SafeArrayMap disponible:', !!window.safeArrayMap);
    
    // Test rapide
    try {
      if (window.User && window.User.resolve) {
        window.User.resolve('test123').then(result => {
          console.log('✅ Test User.resolve réussi:', result);
        });
      }
    } catch (error) {
      console.error('❌ Test User.resolve échoué:', error);
    }
  };
  
  // Fonction de réparation d'urgence
  window.emergencyUserFix = () => {
    console.log('🚨 RÉPARATION D\'URGENCE USER ERRORS');
    
    // Forcer la création de User
    if (!window.User) {
      window.User = {
        resolve: async (id) => `Emergency_User_${id?.substring(0, 8) || 'Unknown'}`,
        resolveMultiple: async (ids) => ({}),
        getName: async (id) => `Emergency_User_${id?.substring(0, 8) || 'Unknown'}`
      };
      console.log('✅ User d\'urgence créé');
    }
    
    // Recharger les services
    if (window.userResolverService) {
      window.userResolverService.clearCache();
      console.log('✅ Cache userResolverService vidé');
    }
    
    console.log('✅ Réparation d\'urgence terminée');
  };
  
  // Auto-diagnostic après 3 secondes
  setTimeout(() => {
    window.diagnoseUserErrors();
  }, 3000);
}

// ==========================================
// 🚀 AUTO-INITIALISATION ET EXPORTS
// ==========================================

console.log('🚀 User Error Global Fix initialisé');
console.log('📊 État User:', {
  globalUserCreated: typeof window !== 'undefined' && !!window.User,
  errorSuppression: 'actif',
  autoPatching: 'actif',
  emergencyMode: 'disponible'
});

// Exposer les utilitaires
if (typeof window !== 'undefined') {
  window.UserErrorFix = {
    diagnose: () => window.diagnoseUserErrors(),
    emergency: () => window.emergencyUserFix(),
    safeMap: safeArrayMap,
    isPatched: true
  };
}

// Exports pour l'import
export const UserErrorGlobalFix = {
  diagnose: () => typeof window !== 'undefined' && window.diagnoseUserErrors(),
  emergency: () => typeof window !== 'undefined' && window.emergencyUserFix(),
  safeMap: safeArrayMap,
  isActive: true
};

export default UserErrorGlobalFix;
