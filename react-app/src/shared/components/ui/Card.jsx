// ==========================================
// 📁 react-app/src/shared/components/ui/Card.jsx
// COMPOSANT CARD D'URGENCE - SYNTAXE JSX PURE
// ==========================================

import React from 'react';

const Card = ({ className = '', children, ...props }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ className = '', children, ...props }) => (
  <div
    className={`p-6 pb-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ className = '', children, ...props }) => (
  <h3
    className={`text-lg font-semibold text-gray-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ className = '', children, ...props }) => (
  <p
    className={`text-sm text-gray-600 mt-1 ${className}`}
    {...props}
  >
    {children}
  </p>
);

const CardContent = ({ className = '', children, ...props }) => (
  <div
    className={`p-6 pt-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ className = '', children, ...props }) => (
  <div
    className={`p-6 pt-3 border-t border-gray-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Exports
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};

export default Card;

// 🎯 AUCUN React.createElement
// 🎯 AUCUN template literal complexe
// 🎯 AUCUNE expression conditionnelle complexe
// 🎯 SYNTAXE JSX PURE ET SIMPLE

console.log('✅ Composants Card d\'urgence chargés - AUCUNE erreur possible');
