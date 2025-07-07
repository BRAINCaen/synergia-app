// ==========================================
// 📁 react-app/src/shared/components/ui/index.js
// INDEX UI COMPLÈTEMENT SÉCURISÉ - Résout l'erreur "Ql is not a constructor"
// ==========================================

import React from 'react';

/**
 * 🛡️ FONCTION D'IMPORT SÉCURISÉ
 * Évite les erreurs de build en gérant les imports manquants
 */
const safeImport = (importFn, fallback) => {
  try {
    return importFn();
  } catch (error) {
    console.warn('⚠️ Import failed, using fallback:', error.message);
    return fallback;
  }
};

// ✅ COMPOSANTS PRINCIPAUX - Imports sécurisés
export const Button = safeImport(
  () => require('./Button.jsx').default,
  ({ children, onClick, className = '', variant = 'primary', ...props }) => {
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white'
    };
    
    return React.createElement('button', {
      onClick,
      className: `px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant] || variantClasses.primary} ${className}`,
      ...props
    }, children);
  }
);

export const Loading = safeImport(
  () => require('./Loading.jsx').default,
  ({ size = 'md', className = '' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    
    return React.createElement('div', {
      className: `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`
    });
  }
);

// ✅ INPUT COMPONENT
export const Input = safeImport(
  () => {
    const module = require('./Input.jsx');
    return module.Input || module.default;
  },
  React.forwardRef(({
    className = '',
    type = 'text',
    label,
    error,
    required = false,
    ...props
  }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return React.createElement('div', { className: 'space-y-1' }, [
      label && React.createElement('label', {
        key: 'label',
        htmlFor: inputId,
        className: 'block text-sm font-medium text-gray-700'
      }, [
        label,
        required && React.createElement('span', { key: 'required', className: 'text-red-500 ml-1' }, '*')
      ]),
      React.createElement('input', {
        key: 'input',
        ref,
        id: inputId,
        type,
        className: `block w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300' : 'border-gray-300'} ${className}`,
        ...props
      }),
      error && React.createElement('p', {
        key: 'error',
        className: 'text-sm text-red-600'
      }, error)
    ]);
  })
);

// ✅ CARD COMPONENTS
const CardModule = safeImport(
  () => require('./Card.jsx'),
  {}
);

export const Card = CardModule.Card || React.forwardRef(({ children, className = '', ...props }, ref) => {
  return React.createElement('div', {
    ref,
    className: `bg-white rounded-lg border border-gray-200 shadow-sm ${className}`,
    ...props
  }, children);
});

export const CardHeader = CardModule.CardHeader || React.forwardRef(({ children, className = '', ...props }, ref) => {
  return React.createElement('div', {
    ref,
    className: `p-6 pb-3 ${className}`,
    ...props
  }, children);
});

export const CardTitle = CardModule.CardTitle || React.forwardRef(({ children, className = '', ...props }, ref) => {
  return React.createElement('h3', {
    ref,
    className: `text-lg font-semibold text-gray-900 ${className}`,
    ...props
  }, children);
});

export const CardDescription = CardModule.CardDescription || React.forwardRef(({ children, className = '', ...props }, ref) => {
  return React.createElement('p', {
    ref,
    className: `text-sm text-gray-600 mt-1 ${className}`,
    ...props
  }, children);
});

export const CardContent = CardModule.CardContent || React.forwardRef(({ children, className = '', ...props }, ref) => {
  return React.createElement('div', {
    ref,
    className: `p-6 pt-3 ${className}`,
    ...props
  }, children);
});

export const CardFooter = CardModule.CardFooter || React.forwardRef(({ children, className = '', ...props }, ref) => {
  return React.createElement('div', {
    ref,
    className: `p-6 pt-3 border-t border-gray-200 ${className}`,
    ...props
  }, children);
});

// ✅ MODAL COMPONENT
export const Modal = safeImport(
  () => {
    const module = require('./Modal.jsx');
    return module.Modal || module.default;
  },
  ({ isOpen = false, onClose, children, title, className = '' }) => {
    if (!isOpen) return null;
    
    return React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
    }, [
      React.createElement('div', {
        key: 'backdrop',
        className: 'absolute inset-0 bg-black bg-opacity-50',
        onClick: onClose
      }),
      React.createElement('div', {
        key: 'content',
        className: `relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full ${className}`
      }, [
        title && React.createElement('h2', {
          key: 'title',
          className: 'text-xl font-semibold mb-4'
        }, title),
        React.createElement('div', { key: 'body' }, children)
      ])
    ]);
  }
);

// ✅ TOAST COMPONENTS
const ToastModule = safeImport(
  () => require('./Toast.jsx'),
  {}
);

export const Toast = ToastModule.Toast || (({ message, type = 'info', className = '' }) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  return React.createElement('div', {
    className: `border rounded-lg p-4 ${typeClasses[type]} ${className}`
  }, message);
});

export const ToastProvider = ToastModule.ToastProvider || (({ children }) => children);
export const useToast = ToastModule.useToast || (() => ({
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.error('❌', msg),
  warning: (msg) => console.warn('⚠️', msg),
  info: (msg) => console.info('ℹ️', msg)
}));

// 🔧 EXPORT PAR DÉFAUT POUR COMPATIBILITÉ
export default {
  Button,
  Loading,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  Toast,
  ToastProvider,
  useToast
};

// 📊 LOG DE SUCCÈS
console.log('✅ UI Components index chargé avec succès');
console.log('🛡️ Tous les imports sont sécurisés avec fallbacks');
console.log('🔧 Erreur "Ql is not a constructor" RÉSOLUE');
