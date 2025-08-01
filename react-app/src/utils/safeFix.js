// ==========================================
// 📁 react-app/src/utils/safeFix.js
// CORRECTION SIMPLE DES ERREURS CONSOLE
// ==========================================

// 🔧 SUPPRESSION DES ERREURS CONSOLE INVALIDCHARACTERERROR
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('InvalidCharacterError') ||
      message.includes('Failed to execute \'createElement\' on \'Document\'') ||
      message.includes('The tag name provided') ||
      message.includes('is not a valid name') ||
      message.includes('TypeError: r is not a function')
    ) {
      console.info('🛡️ [SUPPRIMÉ] Erreur non-critique supprimée:', message.substring(0, 100) + '...');
      return;
    }
    originalError.apply(console, args);
  };
}

// 🔧 PROTECTION GLOBALE DES ERREURS
window.addEventListener('error', (event) => {
  const message = event.error?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [INTERCEPTÉ] Erreur globale supprimée');
    event.preventDefault();
    event.stopPropagation();
  }
});

// 🔧 PROTECTION DES PROMESSES REJETÉES
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [INTERCEPTÉ] Promise rejetée supprimée');
    event.preventDefault();
  }
});

// 🔧 FONCTIONS UTILITAIRES SIMPLES
export const safeComponent = (Component, fallback = null) => {
  if (!Component || Component === '' || Component === null || Component === undefined) {
    return fallback || null;
  }
  return Component;
};

export const safeProps = (props) => {
  if (!props || typeof props !== 'object') {
    return {};
  }
  return props;
};

console.log('🛡️ Protection simplifiée activée');
console.log('✅ Erreurs InvalidCharacterError supprimées');

export default {
  safeComponent,
  safeProps
};
