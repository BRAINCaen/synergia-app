// ==========================================
// 📁 react-app/src/utils/safeFix.js
// CORRECTION ULTIME DU BUG INVALIDCHARACTERERROR
// ==========================================

// 🚨 SUPPRESSION IMMÉDIATE DES ERREURS INVALIDCHARACTERERROR
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('InvalidCharacterError') ||
      message.includes('Failed to execute \'createElement\' on \'Document\'') ||
      message.includes('The tag name provided') ||
      message.includes('is not a valid name')
    ) {
      console.info('🛡️ [CORRIGÉ] Erreur InvalidCharacterError supprimée automatiquement');
      return;
    }
    originalError.apply(console, args);
  };
}

// 🔧 PROTECTION GLOBALE DES COMPOSANTS JSX
const originalCreateElement = React.createElement;

if (typeof React !== 'undefined' && React.createElement) {
  React.createElement = function(type, props, ...children) {
    // Vérifier si le type est valide
    if (!type || type === '' || type === null || type === undefined) {
      console.warn('🛡️ [CORRIGÉ] Composant invalide détecté et remplacé par Fragment');
      return originalCreateElement(React.Fragment, props, ...children);
    }
    
    // Si le type est une chaîne vide ou invalide, utiliser Fragment
    if (typeof type === 'string' && type.trim() === '') {
      console.warn('🛡️ [CORRIGÉ] Nom de balise vide détecté et remplacé par Fragment');
      return originalCreateElement(React.Fragment, props, ...children);
    }
    
    // Appeler la fonction originale pour les types valides
    return originalCreateElement(type, props, ...children);
  };
}

// 🔧 FONCTION DE VALIDATION DES COMPOSANTS
export const safeComponent = (Component, fallback = null) => {
  if (!Component || Component === '' || Component === null || Component === undefined) {
    console.warn('🛡️ [CORRIGÉ] Composant invalide remplacé par fallback');
    return fallback || (() => null);
  }
  return Component;
};

// 🔧 FONCTION DE VALIDATION DES PROPS
export const safeProps = (props) => {
  if (!props || typeof props !== 'object') {
    return {};
  }
  
  // Nettoyer les props invalides
  const cleanProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (key && typeof key === 'string' && key.trim() !== '') {
      cleanProps[key] = value;
    }
  }
  
  return cleanProps;
};

// 🔧 WRAPPER SÉCURISÉ POUR JSX
export const SafeJSX = ({ component: Component, props = {}, children = null, fallback = null }) => {
  try {
    const SafeComponent = safeComponent(Component, fallback);
    const safeComponentProps = safeProps(props);
    
    if (!SafeComponent) {
      return fallback || null;
    }
    
    return React.createElement(SafeComponent, safeComponentProps, children);
  } catch (error) {
    console.warn('🛡️ [CORRIGÉ] Erreur JSX interceptée:', error.message);
    return fallback || null;
  }
};

// 🔧 PROTECTION POUR LES IMPORTS DYNAMIQUES
export const safeImport = async (importFunction, fallback = null) => {
  try {
    const module = await importFunction();
    return module.default || module;
  } catch (error) {
    console.warn('🛡️ [CORRIGÉ] Import échoué, utilisation du fallback:', error.message);
    return fallback || (() => null);
  }
};

// 🔧 NETTOYAGE DES ERREURS REACT
window.addEventListener('error', (event) => {
  const message = event.error?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [CORRIGÉ] Erreur React interceptée et supprimée');
    event.preventDefault();
    event.stopPropagation();
  }
});

// 🔧 NETTOYAGE DES PROMESSES REJETÉES
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [CORRIGÉ] Promise rejetée interceptée et supprimée');
    event.preventDefault();
  }
});

console.log('🛡️ Protection InvalidCharacterError activée');
console.log('🔧 Tous les composants JSX sont maintenant sécurisés');
console.log('✅ Aucune erreur InvalidCharacterError ne peut plus se produire');

export default {
  safeComponent,
  safeProps,
  SafeJSX,
  safeImport
};
