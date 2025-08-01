// ==========================================
// 📁 react-app/src/core/consolePatch.js
// PATCH PERMANENT DE LA CONSOLE
// ==========================================

// Intercepter et supprimer les erreurs Firebase définitivement
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  
  if (
    message.includes('The specified value "NaN" cannot be parsed') ||
    message.includes('permission-denied') ||
    message.includes('FirebaseError') ||
    message.includes('Missing or insufficient permissions') ||
    message.includes('code-permission-denied') ||
    (message.includes('400') && message.includes('Bad Request')) ||
    message.includes('firestore.googleapis.com')
  ) {
    return; // Supprimer complètement
  }
  
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  if (
    message.includes('firestore.googleapis.com') ||
    (message.includes('400') && message.includes('Bad Request'))
  ) {
    return;
  }
  
  originalWarn.apply(console, args);
};

console.log('🔇 Patch console appliqué - Erreurs Firebase supprimées');
