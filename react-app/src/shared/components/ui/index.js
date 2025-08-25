// ==========================================
// 📁 react-app/src/shared/components/ui/index.js
// COMPOSANTS UI D'URGENCE - VERSION SANS JSX POUR ÉVITER L'ERREUR DE BUILD
// ==========================================

import React from 'react';

// 🚨 SOLUTION: Utiliser React.createElement au lieu de JSX pour éviter l'erreur de parsing
// Car le fichier a une extension .js et non .jsx

export const Button = ({ children, className = '', ...props }) => {
  return React.createElement(
    'button',
    {
      className: `px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white ${className}`,
      ...props
    },
    children
  );
};

export const Loading = ({ className = '' }) => {
  return React.createElement('div', {
    className: `animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 ${className}`
  });
};

export const Input = ({ className = '', ...props }) => {
  return React.createElement('input', {
    className: `block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`,
    ...props
  });
};

export const Card = ({ children, className = '' }) => {
  return React.createElement(
    'div',
    {
      className: `bg-white rounded-lg border border-gray-200 shadow-sm ${className}`
    },
    children
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return React.createElement(
    'div',
    {
      className: `p-6 pb-3 ${className}`
    },
    children
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return React.createElement(
    'h3',
    {
      className: `text-lg font-semibold text-gray-900 ${className}`
    },
    children
  );
};

export const CardDescription = ({ children, className = '' }) => {
  return React.createElement(
    'p',
    {
      className: `text-sm text-gray-600 mt-1 ${className}`
    },
    children
  );
};

export const CardContent = ({ children, className = '' }) => {
  return React.createElement(
    'div',
    {
      className: `p-6 pt-3 ${className}`
    },
    children
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return React.createElement(
    'div',
    {
      className: `p-6 pt-3 border-t border-gray-200 ${className}`
    },
    children
  );
};

export const Modal = ({ isOpen, onClose, children, title, className = '' }) => {
  if (!isOpen) return null;
  
  return React.createElement(
    'div',
    {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
    },
    React.createElement('div', {
      className: 'absolute inset-0 bg-black bg-opacity-50',
      onClick: onClose
    }),
    React.createElement(
      'div',
      {
        className: `relative bg-white rounded-lg shadow-lg max-w-md w-full ${className}`
      },
      title && React.createElement(
        'div',
        {
          className: 'p-6 border-b'
        },
        React.createElement(
          'h2',
          {
            className: 'text-lg font-semibold'
          },
          title
        )
      ),
      React.createElement(
        'div',
        {
          className: 'p-6'
        },
        children
      )
    )
  );
};

export const Toast = ({ type = 'info', message, onClose, className = '' }) => {
  const baseClasses = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm';
  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return React.createElement(
    'div',
    {
      className: `${baseClasses} ${typeClasses[type]} ${className}`
    },
    React.createElement(
      'div',
      {
        className: 'flex items-center justify-between'
      },
      React.createElement(
        'span',
        null,
        message
      ),
      onClose && React.createElement(
        'button',
        {
          onClick: onClose,
          className: 'ml-4 text-white hover:text-gray-200'
        },
        '×'
      )
    )
  );
};

// 🎯 COMPOSANTS POUR LA COMPATIBILITÉ
export const Spinner = Loading;
export const LoadingSpinner = Loading;

// Log de confirmation
console.log('✅ Composants UI chargés sans JSX - Compatible build Netlify');

// Export par défaut pour faciliter l'import
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
  Spinner,
  LoadingSpinner
};
