// ==========================================
// 📁 react-app/src/shared/components/ui/Card.jsx
// Composants Card CRÉÉS pour résoudre erreur build
// ==========================================

import React from 'react';

/**
 * 🃏 COMPOSANT CARD PRINCIPAL
 */
const Card = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * 📄 CARD HEADER
 */
const CardHeader = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pb-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * 📝 CARD TITLE
 */
const CardTitle = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * 📖 CARD DESCRIPTION
 */
const CardDescription = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-600 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * 📚 CARD CONTENT
 */
const CardContent = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/**
 * 🦶 CARD FOOTER
 */
const CardFooter = React.forwardRef(({ 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-3 border-t border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

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
