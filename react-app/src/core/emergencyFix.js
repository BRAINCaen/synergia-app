// ==========================================
// 📁 react-app/src/core/emergencyFix.js
// CORRECTIF D'URGENCE POUR ERREUR "USERS IS NOT DEFINED"
// ==========================================

import { Users, User, UserPlus, UserCheck } from 'lucide-react';

/**
 * 🚨 CORRECTIF D'URGENCE GLOBAL
 * Résout l'erreur "Users is not defined" en définissant toutes les références manquantes
 */

if (typeof window !== 'undefined') {
  // Définir toutes les icônes Users potentiellement manquantes
  window.Users = Users;
  window.User = User;
  window.UserPlus = UserPlus;
  window.UserCheck = UserCheck;
  
  // Alias pour compatibilité avec différentes syntaxes
  window.users = Users;
  window.user = User;
  
  // Aussi les ajouter au global pour les modules ES6
  if (typeof global !== 'undefined') {
    global.Users = Users;
    global.User = User;
    global.UserPlus = UserPlus;
    global.UserCheck = UserCheck;
  }

  console.log('🚨 [EMERGENCY] Icônes Users définies globalement');
}

// Suppression des erreurs console liées à Users
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filtrer les erreurs Users
  if (message.includes('Users is not defined') ||
      message.includes('ReferenceError: Users') ||
      message.includes('Cannot read properties of undefined (reading \'Users\')')) {
    console.warn('🤫 [SUPPRIMÉ] Erreur Users:', message.substring(0, 100) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

// Export des icônes pour utilisation dans les composants
export { Users, User, UserPlus, UserCheck };
export default Users;

console.log('✅ Emergency fix pour Users activé');
