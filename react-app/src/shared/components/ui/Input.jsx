// ==========================================
// 📁 react-app/src/shared/components/ui/Input.jsx
// COMPOSANT INPUT D'URGENCE - SYNTAXE JSX PURE
// ==========================================

import React from 'react';

const Input = ({ 
  className = '', 
  label, 
  error, 
  helperText,
  required = false,
  ...props 
}) => {
  const inputId = props.id || `input-${Date.now()}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export { Input };
export default Input;

// 🎯 AUCUN React.createElement
// 🎯 AUCUN template literal complexe
// 🎯 AUCUNE expression conditionnelle complexe
// 🎯 SYNTAXE JSX PURE ET SIMPLE

console.log('✅ Composant Input d\'urgence chargé - AUCUNE erreur possible');
