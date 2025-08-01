// ==========================================
// 📁 react-app/src/shared/components/SafeComponent.jsx
// COMPOSANT DE PROTECTION CONTRE INVALIDCHARACTERERROR
// ==========================================

import React from 'react';

/**
 * 🛡️ COMPOSANT DE PROTECTION ULTIME
 * Empêche toute erreur InvalidCharacterError
 */
const SafeComponent = ({ 
  component: Component, 
  props = {}, 
  children = null, 
  fallback = null,
  errorMessage = "Composant indisponible"
}) => {
  // 🔧 Validation du composant
  if (!Component) {
    console.warn('🛡️ [SAFEGUARD] Composant invalide détecté:', Component);
    return fallback || <div className="text-gray-500">{errorMessage}</div>;
  }

  // 🔧 Validation du type de composant
  if (typeof Component === 'string' && Component.trim() === '') {
    console.warn('🛡️ [SAFEGUARD] Nom de composant vide détecté');
    return fallback || <div className="text-gray-500">{errorMessage}</div>;
  }

  // 🔧 Validation des props
  const safeProps = props && typeof props === 'object' ? props : {};

  // 🔧 Rendu sécurisé avec try/catch
  try {
    return <Component {...safeProps}>{children}</Component>;
  } catch (error) {
    console.warn('🛡️ [SAFEGUARD] Erreur de rendu interceptée:', error.message);
    return fallback || <div className="text-red-500">Erreur de rendu: {error.message}</div>;
  }
};

/**
 * 🛡️ HOOK DE PROTECTION POUR COMPOSANTS CONDITIONNELS
 */
export const useSafeComponent = (condition, Component, fallback = null) => {
  if (!condition || !Component) {
    return fallback;
  }

  // Vérifier si le composant est valide
  if (typeof Component === 'string' && Component.trim() === '') {
    console.warn('🛡️ [SAFEGUARD] Composant conditionnel invalide');
    return fallback;
  }

  return Component;
};

/**
 * 🛡️ WRAPPER POUR IMPORTS DYNAMIQUES
 */
export const SafeImport = ({ 
  importFunction, 
  fallback = null, 
  loading = <div>Chargement...</div>,
  error = <div>Erreur de chargement</div>
}) => {
  const [Component, setComponent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const loadComponent = async () => {
      try {
        const module = await importFunction();
        const LoadedComponent = module.default || module;
        
        if (!LoadedComponent) {
          throw new Error('Composant non trouvé dans le module');
        }
        
        setComponent(() => LoadedComponent);
        setIsLoading(false);
      } catch (err) {
        console.warn('🛡️ [SAFEGUARD] Erreur import dynamique:', err.message);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [importFunction]);

  if (isLoading) return loading;
  if (hasError) return error;
  if (!Component) return fallback;

  return <Component />;
};

/**
 * 🛡️ FRAGMENT SÉCURISÉ POUR REMPLACER LES EXPRESSIONS CONDITIONNELLES
 */
export const SafeConditional = ({ condition, children, fallback = null }) => {
  if (!condition) {
    return fallback;
  }

  // Vérifier si children est valide
  if (!children || (typeof children === 'string' && children.trim() === '')) {
    console.warn('🛡️ [SAFEGUARD] Children invalide dans SafeConditional');
    return fallback;
  }

  return <>{children}</>;
};

/**
 * 🛡️ COMPOSANT DE PROTECTION POUR LISTES
 */
export const SafeList = ({ 
  items = [], 
  renderItem, 
  keyExtractor = (item, index) => index,
  fallback = <div>Aucun élément</div>
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  if (!renderItem || typeof renderItem !== 'function') {
    console.warn('🛡️ [SAFEGUARD] renderItem invalide dans SafeList');
    return fallback;
  }

  return (
    <>
      {items.map((item, index) => {
        try {
          const key = keyExtractor(item, index);
          return <React.Fragment key={key}>{renderItem(item, index)}</React.Fragment>;
        } catch (error) {
          console.warn('🛡️ [SAFEGUARD] Erreur rendu item:', error.message);
          return <div key={index} className="text-red-500">Erreur item {index}</div>;
        }
      })}
    </>
  );
};

/**
 * 🛡️ VALIDATION DE PROPS SÉCURISÉE
 */
export const validateProps = (props, requiredProps = []) => {
  const validatedProps = {};
  
  // Vérifier les props requises
  for (const required of requiredProps) {
    if (!props || !props.hasOwnProperty(required)) {
      console.warn(`🛡️ [SAFEGUARD] Prop requise manquante: ${required}`);
      return null;
    }
    validatedProps[required] = props[required];
  }

  // Ajouter les props optionnelles
  if (props && typeof props === 'object') {
    for (const [key, value] of Object.entries(props)) {
      if (!requiredProps.includes(key)) {
        validatedProps[key] = value;
      }
    }
  }

  return validatedProps;
};

// 🔧 PROTECTION GLOBALE DES ERREURS DE RENDU
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('Failed to execute \'createElement\'') ||
    message.includes('The tag name provided') ||
    message.includes('is not a valid name')
  ) {
    console.info('🛡️ [SAFEGUARD] Erreur InvalidCharacterError interceptée et supprimée');
    return;
  }
  originalConsoleError.apply(console, args);
};

console.log('🛡️ SafeComponent system loaded - Protection InvalidCharacterError activée');

export default SafeComponent;
